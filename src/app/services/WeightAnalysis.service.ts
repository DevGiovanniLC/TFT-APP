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

        const minDate = refDate -  TimeService.MS_PER_MONTH;
        let recent = weights.filter(w => TimeService.getTime(w.date) >= minDate);

        if (recent.length <= 2 && weights.length >= 2) {
            recent = weights
                .slice()
                .sort((a, b) => TimeService.getTime(b.date) - TimeService.getTime(a.date))
                .slice(0, 2)
                .reverse();
        }

        const now = refDate;
        const x = recent.map(w => TimeService.getTime(w.date));
        const y = recent.map(w => w.weight);
        const w = x.map(xi => {
            const daysAgo = (now - xi) / TimeService.MS_PER_MONTH;;
            return 1 / (1 + daysAgo); // Peso: más reciente = más peso
        });

        const sumW = w.reduce((s, wi) => s + wi, 0);
        const meanX = w.reduce((s, wi, i) => s + wi * x[i], 0) / sumW;
        const meanY = w.reduce((s, wi, i) => s + wi * y[i], 0) / sumW;

        let num = 0;
        let den = 0;
        for (let i = 0; i < x.length; i++) {
            const dx = x[i] - meanX;
            num += w[i] * dx * (y[i] - meanY);
            den += w[i] * dx * dx;
        }

        if (!den) return { slope: 0, intercept: meanY };

        const slope = num / den;
        const intercept = meanY - slope * meanX;
        return { slope, intercept };
    }

    weightProgression(first: number, last: number, goal: number): number {
        if (!first || !last || !goal || goal === first) return NaN;
        return Number((((last - first) / (goal - first)) * 100).toFixed(2));
    }
}
