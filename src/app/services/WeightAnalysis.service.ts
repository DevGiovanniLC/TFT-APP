import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight.type';
import { TimeService } from './Time.service';

@Injectable({
    providedIn: 'root',
})

/**
 * Servicio que realiza análisis de datos de peso.
 * @export
 * @class WeightAnalysisService
 */
export class WeightAnalysisService {
    constructor(private readonly timeService: TimeService) { }

    // Calcula el ritmo de pérdida semanal objetivo.
    weekWeightLossPace(weight: number, goal: number, start: Date, end: Date): number {
        const weeks = this.timeService.weekDifference(start, end);

        if (weeks < 1) return Number((weight - goal).toFixed(2));

        return this.weightLossPace(weight, goal, weeks);
    }

    // Calcula el ritmo de pérdida mensual objetivo.
    monthWeightLossPace(weight: number, goal: number, start: Date, end: Date): number {
        const months = this.timeService.monthDifference(start, end);

        if (months < 1) return Number((weight - goal).toFixed(2));

        return this.weightLossPace(weight, goal, months);
    }

    // Calcula el ritmo de pérdida de peso en un período determinado.
    private weightLossPace(weight: number, goal: number, diff: number): number {
        if (!diff) return NaN;
        return Number(((weight - goal) / diff).toFixed(2));
    }


    // Calcula el ritmo de pérdida de peso por semana o mes.
    trendWeightPace(weights: Weight[]): { weightPerWeek: number; weightPerMonth: number } {
        if (!weights?.length) return { weightPerWeek: 0, weightPerMonth: 0 };
        const lastDate = TimeService.getTime(weights[weights.length - 1].date);
        const { slope } = this.calculateWeightedTrend(weights, lastDate);

        const isEarly = weights.length < 7;

        return {
            weightPerWeek: slope * TimeService.MS_PER_WEEK,
            weightPerMonth: slope * TimeService.MS_PER_MONTH * (isEarly ? 0.75 : 1),
        };
    }

    // Obtiene los datos de tendencia para la gráfica.
    getTrendData(weights: Weight[]): { x: number; y: number }[] {
        if (!weights?.length) return [];
        if (weights.length === 1) return [{ x: TimeService.getTime(weights[0].date), y: weights[0].weight }];

        const last = weights[0];
        const lastDate = TimeService.getTime(last.date);
        const { slope, intercept } = this.calculateWeightedTrend(weights, lastDate);
        const twoYears = lastDate + 2 * 365 * TimeService.MS_PER_DAY;
        const y = slope * twoYears + intercept;
        if (!y) return [];
        return [
            { x: lastDate, y: last.weight },
            { x: twoYears, y },
        ];
    }


    // Suaviza la serie de pesos usando LOESS (regresión local).
    loess(data: Weight[], bandwidthRatio: number = 0.2): Weight[] {
        const n = data.length;
        if (n < 3) return data;

        // Determina el número de vecinos a considerar
        const span = Math.max(2, Math.floor(n * bandwidthRatio));
        const x = data.map(d => d.date.getTime());
        const y = data.map(d => d.weight);

        // Precalcula los índices ordenados por distancia para cada punto
        const sortedIndices = x.map((xi) =>
            x
                .map((xj, j) => ({ idx: j, dist: Math.abs(xj - xi) }))
                .sort((a, b) => a.dist - b.dist)
                .map(obj => obj.idx)
        );

        // Calcula el valor suavizado para cada punto
        return data.map((point, i) => {
            if (i === 0) return { ...point };

            const xi = x[i];
            const indices = sortedIndices[i].slice(0, span + 1);
            const maxDist = Math.max(...indices.map(j => Math.abs(x[j] - xi))) || 1;

            let sumW = 0, sumWX = 0, sumWY = 0, sumWXX = 0, sumWXY = 0;
            for (const j of indices) {
                // Calcula el peso usando la función tricúbica
                const w = this.tricube(Math.abs(x[j] - xi) / maxDist);
                sumW += w;
                sumWX += w * x[j];
                sumWY += w * y[j];
                sumWXX += w * x[j] * x[j];
                sumWXY += w * x[j] * y[j];
            }

            // Calcula los coeficientes de la regresión local
            const denom = sumW * sumWXX - sumWX * sumWX;
            const beta = denom ? (sumW * sumWXY - sumWX * sumWY) / denom : 0;
            const alpha = denom ? (sumWY - beta * sumWX) / sumW : 0;
            const yi = alpha + beta * xi;

            return { ...point, weight: yi };
        });
    }

    //Función de peso tricúbica utilizada en LOESS.
    private tricube(u: number): number {
        if (u >= 1) return 0;
        const a = 1 - u * u * u;
        return a * a * a;
    }


    // Calcula el gradiente de la tendencia ponderada exponencialmente.
    private calculateWeightedTrend(weights: Weight[], refDate: number, alpha: number = 1): { slope: number; intercept: number } {
        if (weights.length < 2) return { slope: NaN, intercept: NaN };

        let sumW = 0, sumWX = 0, sumWY = 0;
        let num = 0, den = 0;

        // Precalcular valores
        const timeWeights = weights.map(w => {
            const xi = TimeService.getTime(w.date);
            const yi = w.weight;
            const monthsAgo = (refDate - xi) / TimeService.MS_PER_MONTH;
            const wi = Math.exp(alpha * -monthsAgo);  // Más peso a los más recientes
            return { xi, yi, wi };
        });

        // Medias ponderadas
        for (const { xi, yi, wi } of timeWeights) {
            sumW += wi;
            sumWX += wi * xi;
            sumWY += wi * yi;
        }

        const meanX = sumWX / sumW;
        const meanY = sumWY / sumW;

        // Cálculo de pendiente y denominador
        for (const { xi, yi, wi } of timeWeights) {
            const dx = xi - meanX;
            num += wi * dx * (yi - meanY);
            den += wi * dx * dx;
        }

        if (den === 0) return { slope: 0, intercept: meanY };

        const slope = num / den;
        const intercept = meanY - slope * meanX;

        return { slope, intercept };
    }


    // Calcula el progreso hacia la meta.
    weightProgression(first: number, last: number, goal: number): number {
        if (!first || !last || !goal || goal === first) return NaN;
        return Number((((last - first) / (goal - first)) * 100).toFixed(2));
    }
}
