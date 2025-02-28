import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CalculationFunctionsService {
    constructor() {}

    weekDifference(startDate: Date, endDate: Date) {
        const differenceMilliseconds = endDate.getTime() - startDate.getTime();
        const differenceWeeks = differenceMilliseconds / (1000 * 3600 * 24 * 7);
        return differenceWeeks;
    }
}
