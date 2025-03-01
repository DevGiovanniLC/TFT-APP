import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CalculationFunctionsService {
    constructor() { }

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

    PaceWeekWeightLoss(weight: number, weightGoal: number, startDate: Date, endDate: Date): any {
        const pace = (weight - weightGoal) / this.weekDifference(startDate, endDate);
        return pace.toFixed(2);
    }

    PaceMonthWeightLoss(weight: number, weightGoal: number, startDate: Date, endDate: Date): any {
        const pace = (weight - weightGoal) / this.monthDifference(startDate, endDate);
        return pace.toFixed(2);
    }

}
