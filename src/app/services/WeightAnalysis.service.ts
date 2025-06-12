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
    constructor(private readonly timeService: TimeService) { }

    weekWeightLossPace(weight: number, goal: number, start: Date, end: Date): number {
        const weeks = this.timeService.weekDifference(start, end);
        if (weeks < 1) {
            return Number((weight - goal).toFixed(2));
        }
        return this.weightLossPace(weight, goal, weeks);
    }

    monthWeightLossPace(weight: number, goal: number, start: Date, end: Date): number {
        const months = this.timeService.monthDifference(start, end);
        if (months < 1) {
            return Number((weight - goal).toFixed(2));
        }
        return this.weightLossPace(weight, goal, months);
    }

    private weightLossPace(weight: number, goal: number, diff: number): number {
        if (!diff) return 0;
        return Number(((weight - goal) / diff).toFixed(2));
    }

    trendWeightPace(weights: Weight[]): { weightPerWeek: number; weightPerMonth: number } {
        if (!weights?.length) return { weightPerWeek: 0, weightPerMonth: 0 };
        const lastDate = TimeService.getTime(weights[weights.length - 1].date);
        const { slope } = this.calculateWeightedTrend(weights, lastDate);
        return {
            weightPerWeek: slope * TimeService.MS_PER_WEEK,
            weightPerMonth: slope * TimeService.MS_PER_MONTH,
        };
    }

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

    private calculateWeightedTrend(weights: Weight[], refDate: number): { slope: number; intercept: number } {
        const MS_PER_MONTH = TimeService.MS_PER_MONTH;
        const now = refDate;
        const minDate = now - MS_PER_MONTH;

        let recent = weights.filter(w => TimeService.getTime(w.date) >= minDate);

        // Fallback si hay pocos datos recientes
        if (recent.length <= 2 && weights.length >= 2) {
            recent = weights
                .slice()
                .sort((a, b) => TimeService.getTime(b.date) - TimeService.getTime(a.date))
                .slice(0, 2)
                .reverse();
        }

        if (recent.length === 0) return { slope: 0, intercept: 0 };

        let sumW = 0, sumWX = 0, sumWY = 0;
        let num = 0, den = 0;

        // Precalcular valores
        const timeWeights = recent.map(w => {
            const xi = TimeService.getTime(w.date);
            const yi = w.weight;
            const daysAgo = (now - xi) / MS_PER_MONTH;
            const wi = 1 / (1 + daysAgo); // Más peso a los más recientes
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

    weightProgression(first: number, last: number, goal: number): number {
        if (!first || !last || !goal || goal === first) return NaN;
        return Number((((last - first) / (goal - first)) * 100).toFixed(2));
    }
}
