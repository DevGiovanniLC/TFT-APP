import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight.type';
import { TimeService } from './Time.service';

@Injectable({
    providedIn: 'root',
})
/**
 * Servicio para analizar la progresión y ritmo de pérdida de peso.
 * - Calcula el ritmo de pérdida (kg/semana o kg/mes) entre dos fechas.
 * - Estima la tendencia de peso mediante regresión lineal.
 * - Calcula el avance porcentual hacia la meta.
 *
 * @export
 * @class WeightAnalysisService
 */
export class WeightAnalysisService {
    /**
     * Constructor que recibe el servicio de utilidades de tiempo.
     * @param timeService Servicio para cálculos de diferencia entre fechas.
     */
    constructor(private readonly timeService: TimeService) { }

    /**
     * Calcula el ritmo de pérdida de peso en kg/semana.
     * Si el intervalo es menor a 1 semana, devuelve la diferencia simple de peso.
     * @param {number} weight - Peso inicial (kg).
     * @param {number} goal - Peso objetivo (kg).
     * @param {Date} start - Fecha de inicio.
     * @param {Date} end - Fecha de fin.
     * @returns {number} Ritmo de pérdida en kg/semana (2 decimales).
     */
    weekWeightLossPace(
        weight: number,
        goal: number,
        start: Date,
        end: Date
    ): number {
        const weeks = this.timeService.weekDifference(start, end);
        if (weeks < 1) {
            return Number((weight - goal).toFixed(2));
        }
        return this.weightLossPace(weight, goal, weeks);
    }

    /**
     * Calcula el ritmo de pérdida de peso en kg/mes.
     * Si el intervalo es menor a 1 mes, devuelve la diferencia simple de peso.
     * @param {number} weight - Peso inicial (kg).
     * @param {number} goal - Peso objetivo (kg).
     * @param {Date} start - Fecha de inicio.
     * @param {Date} end - Fecha de fin.
     * @returns {number} Ritmo de pérdida en kg/mes (2 decimales).
     */
    monthWeightLossPace(weight: number, goal: number, start: Date, end: Date): number {
        const months = this.timeService.monthDifference(start, end);
        if (months < 1) {
            return Number((weight - goal).toFixed(2));
        }
        return this.weightLossPace(weight, goal, months);
    }

    /**
     * Método interno que calcula el ritmo de pérdida dado un factor de tiempo.
     * @private
     * @param {number} weight - Peso inicial.
     * @param {number} goal - Peso objetivo.
     * @param {number} diff - Número de unidades de tiempo (semanas o meses).
     * @returns {number} Ritmo de pérdida (kg/unidad de tiempo).
     */
    private weightLossPace(
        weight: number,
        goal: number,
        diff: number
    ): number {
        if (!diff) return 0;
        return Number(((weight - goal) / diff).toFixed(2));
    }

    /**
     * Calcula la tendencia de pérdida de peso (kg/semana y kg/mes) mediante regresión lineal.
     * @param {Weight[]} weights - Array de registros de peso ordenados cronológicamente.
     * @returns {{ weightPerWeek: number; weightPerMonth: number }} Objeto con ritmo semanal y mensual.
     */
    trendWeightPace(weights: Weight[]): { weightPerWeek: number; weightPerMonth: number; } {
        if (!weights?.length) return { weightPerWeek: 0, weightPerMonth: 0 };
        const lastDate = TimeService.getTime(
            weights[weights.length - 1].date
        );
        const { slope } = this.calculateTrend(weights, lastDate);
        return {
            weightPerWeek: slope * TimeService.MS_PER_WEEK,
            weightPerMonth: slope * TimeService.MS_PER_MONTH,
        };
    }

    /**
     * Construye los datos de la línea de tendencia para gráfico.
     * @param {Weight[]} weights - Array de registros de peso.
     * @returns {{ x: number; y: number }[]} Array con dos puntos de la tendencia.
     */
    getTrendData(weights: Weight[]): { x: number; y: number; }[] {
        if (!weights?.length) return [];
        const last = weights[0];
        const lastDate = TimeService.getTime(last.date);
        const { slope, intercept } = this.calculateTrend(
            weights,
            lastDate
        );
        const twoYears =
            lastDate + 2 * 365 * TimeService.MS_PER_DAY;
        const y = slope * twoYears + intercept;
        if (!y) return [];
        return [
            { x: lastDate, y: last.weight },
            { x: twoYears, y }
        ];
    }

    /**
     * Calcula la regresión lineal (slope, intercept) sobre los datos proporcionados.
     * @private
     * @param {Weight[]} weights - Registros de peso.
     * @param {number} refDate - Timestamp de referencia (ms).
     * @returns {{ slope: number; intercept: number }} Coeficientes de la línea.
     */
    private calculateTrend(
        weights: Weight[],
        refDate: number
    ): { slope: number; intercept: number; } {
        // Últimos 14 días
        const minDate = refDate - TimeService.MS_PER_DAY * 14;
        let recent = weights.filter(
            (w) => TimeService.getTime(w.date) >= minDate
        );

        // Fallback: últimos 2 registros si no hay suficientes datos recientes
        if (recent.length < 2 && weights.length > 2) {
            recent = weights
                .slice()
                .sort(
                    (a, b) =>
                        TimeService.getTime(b.date) - TimeService.getTime(a.date)
                )
                .slice(0, 2)
                .reverse();
        }

        const x = recent.map((w) => TimeService.getTime(w.date));
        const y = recent.map((w) => w.weight);
        const n = x.length;
        if (n === 0) return { slope: 0, intercept: 0 };

        const sumX = x.reduce((sum, xi) => sum + xi, 0);
        const sumY = y.reduce((sum, yi) => sum + yi, 0);
        const sumXY = x.reduce(
            (sum, xi, i) => sum + xi * y[i],
            0
        );
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const denominator = n * sumX2 - sumX * sumX;
        if (!denominator) return { slope: 0, intercept: 0 };

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }

    /**
     * Calcula el porcentaje de avance entre dos pesos respecto a la meta.
     * @param {number} first - Peso inicial.
     * @param {number} last - Peso más reciente.
     * @param {number} goal - Peso objetivo.
     * @returns {number} Porcentaje de progreso (0-100) o NaN si datos inválidos.
     */
    weightProgression(first: number, last: number, goal: number): number {
        if (!first || !last || !goal || goal === first) return NaN;
        return Number(
            (((last - first) / (goal - first)) * 100).toFixed(2)
        );
    }
}
