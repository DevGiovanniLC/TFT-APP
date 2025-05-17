import { Injectable } from '@angular/core';
import { environment } from '@envs/environment';

@Injectable({
    providedIn: 'root', // Esto permite que el servicio esté disponible en toda la aplicación.
})
export class TimeService {
    static readonly MS_PER_DAY = 1000 * 60 * 60 * 24;
    static readonly MS_PER_WEEK = TimeService.MS_PER_DAY * 7;
    static readonly MS_PER_MONTH = TimeService.MS_PER_DAY * 30.44; // media de milisegundos por mes

    static getTime(date: Date | string | undefined): number {
        return date ? new Date(date).getTime() : 0;
    }

    now(): Date {
        return environment.testing ? new Date('2025-05-30T17:54:12.535Z') : new Date();
    }

    weekDifference(start: Date, end: Date): number {
        return this.dateDifference(start, end, TimeService.MS_PER_WEEK);
    }

    monthDifference(start: Date, end: Date): number {
        return this.dateDifference(start, end, TimeService.MS_PER_MONTH);
    }

    dayDifference(start: Date, end: Date): number {
        return this.dateDifference(start, end, TimeService.MS_PER_DAY);
    }

    private dateDifference(start: Date, end: Date, divisor: number): number {
        if (!start || !end) return 0;
        return (end.getTime() - start.getTime()) / divisor;
    }
}
