import { Injectable } from '@angular/core';
import { environment } from '@envs/environment';
import conf from '../conf';

@Injectable({
    providedIn: 'root', // Esto permite que el servicio esté disponible en toda la aplicación.
})
/**
 * Servicio de utilidades para cálculos y comparaciones de fechas/tiempo.
 * @export
 * @class TimeService
 */
export class TimeService {
    static readonly MS_PER_DAY: number = 1000 * 60 * 60 * 24;
    static readonly MS_PER_WEEK: number = TimeService.MS_PER_DAY * 7;
    static readonly MS_PER_MONTH: number = TimeService.MS_PER_DAY * 30.44;

    static getTime(date: Date | string | undefined): number {
        return date ? new Date(date).getTime() : 0;
    }

    now(): Date {
        return environment.test ? new Date(conf.TEST_DATE) : new Date();
    }

    isSameDay(...dates: Date[]): boolean {
        return dates.every(
            (date) =>
                date?.getDay() === this.now().getDay() &&
                date?.getMonth() === this.now().getMonth() &&
                date?.getFullYear() === this.now().getFullYear()
        );
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
