import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { last } from 'cypress/types/lodash';

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

    trendWeightPace(dataWeights: Weight[]){
        const lastWeight = dataWeights[dataWeights.length - 1];
        const { slope } = this.calculateTrend(dataWeights, lastWeight.date.getTime());
        const weightPerWeek = slope * 7 * 24 * 60 * 60 * 1000;
        const weightPerMonth = slope * 30.44 * 24 * 60 * 60 * 1000;

        return {
            weightPerWeek,
            weightPerMonth,
        };
    }

    private calculateTrend(dataWeights: Weight[], lastDate: number){
        //Calculo de la línea de tendencia basada en las últimas 2 semanas de datos
        const recentWeights = dataWeights.filter(w => new Date(w.date).getTime() >= lastDate - 14 * 24 * 60 * 60 * 1000);
        const xData = recentWeights.map(w => new Date(w.date).getTime());
        const yData = recentWeights.map(w => w.weight);
        const n = xData.length;
        const sumX = xData.reduce((a, b) => a + b, 0);
        const sumY = yData.reduce((a, b) => a + b, 0);
        const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
        const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }

    getTrendData(dataWeights: Weight[], goal_date: Date | undefined,){
        const lastWeight = dataWeights[dataWeights.length - 1];
        const lastDate = new Date(lastWeight.date).getTime();
        const goalDate = goal_date && typeof goal_date === 'object' ? goal_date : null;
        const {slope, intercept} = this.calculateTrend(dataWeights, lastDate);
        const futureTrendData = goalDate && !isNaN(goalDate.getTime()) ? [
            { x: lastDate, y: lastWeight.weight },
            { x: goalDate.getTime(), y: slope * goalDate.getTime() + intercept }
        ] : [];

        return futureTrendData;
    }

    weightProgression(firstWeight: number, lastWeight: number, goalWeight: number): number {
        if (!firstWeight || !lastWeight || !goalWeight) return NaN;
        const progression = ((lastWeight - firstWeight) / (goalWeight - firstWeight)) * 100;
        return Number(progression.toFixed(2));
    }
}
