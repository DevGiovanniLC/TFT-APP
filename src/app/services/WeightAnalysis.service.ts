import { Injectable } from '@angular/core';
import { User } from '@models/types/User';
import { Weight } from '@models/types/Weight';
import Papa from 'papaparse';
import { TimeService } from './Time.service';

@Injectable({
    providedIn: 'root',
})
export class WeightAnalysisService {

    constructor(
        private readonly timeService: TimeService
    ) { }

    weekWeightLossPace(weight: number, goal: number, start: Date, end: Date): number {
        return this.weightLossPace(weight, goal, this.timeService.weekDifference(start, end));
    }

    monthWeightLossPace(weight: number, goal: number, start: Date, end: Date): number {
        return this.weightLossPace(weight, goal, this.timeService.monthDifference(start, end));
    }

    private weightLossPace(weight: number, goal: number, diff: number): number {
        if (!diff) return 0;
        return Number(((weight - goal) / diff).toFixed(2));
    }

    trendWeightPace(weights: Weight[]) {
        if (!weights?.length) return { weightPerWeek: 0, weightPerMonth: 0 };
        const lastDate = TimeService.getTime(weights[weights.length - 1].date);

        const { slope } = this.calculateTrend(weights, lastDate);
        return {
            weightPerWeek: slope * TimeService.MS_PER_WEEK,
            weightPerMonth: slope * TimeService.MS_PER_MONTH,
        };
    }

    private calculateTrend(weights: Weight[], refDate: number) {
        // Últimas 2 semanas
        const minDate = refDate - TimeService.MS_PER_DAY * 14;
        let recent = weights.filter(w => TimeService.getTime(w.date) >= minDate);

        // Si no hay al menos 2 puntos en las últimas 2 semanas, tomar los 2 últimos registros
        if (recent.length < 2) {
            recent = weights
                .slice() // clonamos para no mutar el original
                .sort((a, b) => TimeService.getTime(b.date) - TimeService.getTime(a.date))
                .slice(0, 2)
                .reverse(); // para mantener orden cronológico
        }

        const x = recent.map(w => TimeService.getTime(w.date));
        const y = recent.map(w => w.weight);
        const n = x.length;
        if (n === 0) return { slope: 0, intercept: 0 };

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const denominator = n * sumX2 - sumX * sumX;
        if (!denominator) return { slope: 0, intercept: 0 };

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }


    getTrendData(weights: Weight[]) {
        if (!weights?.length) return [];
        const last = weights[0];
        const lastDate = TimeService.getTime(last.date);
        const { slope, intercept } = this.calculateTrend(weights, lastDate);
        const twoYears = lastDate + 2 * 365 * TimeService.MS_PER_DAY;
        const y = slope * twoYears + intercept;
        if (!y) return [];
        return [
            { x: lastDate, y: last.weight },
            { x: twoYears, y }
        ];
    }

    weightProgression(first: number, last: number, goal: number): number {
        if (!first || !last || !goal || goal === first) return NaN;
        return Number((((last - first) / (goal - first)) * 100).toFixed(2));
    }


}
