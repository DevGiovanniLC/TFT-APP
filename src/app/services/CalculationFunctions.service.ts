import { Injectable } from '@angular/core';
import { User } from '@models/types/User';
import { Weight } from '@models/types/Weight';
import Papa from 'papaparse';

@Injectable({
    providedIn: 'root',
})
export class CalculationFunctionsService {
    weekDifference(startDate: Date, endDate: Date) {
        if (!startDate || !endDate) return 0;
        const differenceMilliseconds = endDate?.getTime() - startDate?.getTime();
        const differenceWeeks = differenceMilliseconds / (1000 * 3600 * 24 * 7);
        return differenceWeeks;
    }

    monthDifference(startDate: Date, endDate: Date) {
        if (!startDate || !endDate) return 0;
        const differenceMilliseconds = endDate?.getTime() - startDate?.getTime();
        const differenceMonths = differenceMilliseconds / (1000 * 3600 * 24 * 30);
        return differenceMonths;
    }

    dayDifference(startDate: Date, endDate: Date) {
        if (!startDate || !endDate) return 0;
        const differenceMilliseconds = endDate?.getTime() - startDate?.getTime();
        const differenceDays = differenceMilliseconds / (1000 * 3600 * 24);
        return differenceDays;
    }

    weekWeightLossPace(weight: number, weightGoal: number, startDate: Date, endDate: Date) {
        const pace = (weight - weightGoal) / this.weekDifference(startDate, endDate);
        return Number(pace.toFixed(2));
    }

    monthWeightLossPace(weight: number, weightGoal: number, startDate: Date, endDate: Date) {
        const pace = (weight - weightGoal) / this.monthDifference(startDate, endDate);
        return Number(pace.toFixed(2));
    }

    trendWeightPace(dataWeights: Weight[]) {
        const lastWeight = dataWeights[dataWeights.length - 1];
        const { slope } = this.calculateTrend(dataWeights, lastWeight?.date?.getTime());
        const weightPerWeek = slope * 7 * 24 * 60 * 60 * 1000;
        const weightPerMonth = slope * 30.44 * 24 * 60 * 60 * 1000;

        return {
            weightPerWeek,
            weightPerMonth,
        };
    }

    private calculateTrend(dataWeights: Weight[], lastDate: number) {
        //Calculo de la línea de tendencia basada en las últimas 2 semanas de datos
        const recentWeights = dataWeights.filter(
            (w) => new Date(w.date).getTime() >= lastDate - 14 * 24 * 60 * 60 * 1000
        );

        const xData = recentWeights.map((w) => new Date(w.date).getTime());
        const yData = recentWeights.map((w) => w.weight);
        const n = xData.length;
        const sumX = xData.reduce((a, b) => a + b, 0);
        const sumY = yData.reduce((a, b) => a + b, 0);
        const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
        const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }

    getTrendData(dataWeights: Weight[]) {
        const lastWeight = dataWeights[0];
        const lastDate = new Date(lastWeight.date).getTime();

        const { slope, intercept } = this.calculateTrend(dataWeights, lastDate);
        const twoYearLater = lastDate + 2* 365 * 24 * 60 * 60 * 1000;

        const y = slope * twoYearLater + intercept

        if (!y) return [];

        const futureTrendData = [
            { x: lastDate, y: lastWeight.weight },
            { x: twoYearLater, y: y }
        ];

        return futureTrendData;
    }


    weightProgression(firstWeight: number, lastWeight: number, goalWeight: number): number {
        if (!firstWeight || !lastWeight || !goalWeight) return NaN;
        const progression = ((lastWeight - firstWeight) / (goalWeight - firstWeight)) * 100;
        return Number(progression.toFixed(2));
    }

    async parseDataToCSV(user: User, weights: Weight[]) {

        const userCSV = Papa.unparse([{
            Name: user.name,
            Age: user.age,
            Height: user.height,
            Gender: user.gender,
            GoalDate: user.goal_date?.toISOString().substring(0, 10),
            GoalWeight: user.goal_weight,
            GoalUnits: user.goal_units
        }]);

        const weightsCSV = Papa.unparse(weights.map((w) => ({
            Date: w.date.toISOString().substring(0, 10),
            Weight: w.weight,
            Units: w.weight_units
        })));

        const resultCSV = [
            '# User Data',
            userCSV,
            '',
            '# Weights Data',
            weightsCSV
        ].join('\n');

        return resultCSV;
    }
}
