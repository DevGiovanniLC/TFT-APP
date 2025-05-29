import { Injectable } from '@angular/core';
import { environment } from '@envs/environment';

@Injectable({
    providedIn: 'root', // Esto permite que el servicio esté disponible en toda la aplicación.
})
/**
 * Servicio de utilidades para cálculos y comparaciones de fechas/tiempo.
 * @export
 * @class TimeService
 */
export class TimeService {
    /**
     * Milisegundos en un día (24 h).
     * @static
     * @readonly
     * @type {number}
     */
    static readonly MS_PER_DAY: number = 1000 * 60 * 60 * 24;

    /**
     * Milisegundos en una semana (7 días).
     * @static
     * @readonly
     * @type {number}
     */
    static readonly MS_PER_WEEK: number = TimeService.MS_PER_DAY * 7;

    /**
     * Milisegundos en un mes (media de 30.44 días).
     * @static
     * @readonly
     * @type {number}
     */
    static readonly MS_PER_MONTH: number = TimeService.MS_PER_DAY * 30.44;

    /**
     * Convierte una fecha a timestamp (ms desde 1970-01-01).
     * @static
     * @param {(Date \| string \| undefined)} date - Objeto Date o cadena reconocible por Date().
     * @returns {number} Timestamp en milisegundos, o 0 si `date` es `undefined`.
     * @example
     * ```ts
     * const ts1 = TimeService.getTime('2025-06-01');
     * const ts2 = TimeService.getTime(new Date());
     * ```
     */
    static getTime(date: Date | string | undefined): number {
        return date ? new Date(date).getTime() : 0;
    }

    /**
     * Fecha y hora actual.
     * En modo `environment.testing`, devuelve un valor fijo para tests deterministas.
     * @returns {Date} Instancia de Date representando el "ahora" real o simulado.
     */
    now(): Date {
        return environment.testing
            ? new Date('2025-05-30T17:54:12.535Z')
            : new Date();
    }

    /**
     * Comprueba si los dos ultimos registros son de la fecha actual.
     * @param {Date[]} dates - Fechas a comprobar.
     * @returns {boolean} `true` si es la msima fechas; `false` en caso contrario.
     */
    isSameDay(...dates: Date[]): boolean {
        return dates.every(date => date.getDate() === this.now().getDate());
    }

    /**
     * Calcula la diferencia en semanas entre dos fechas.
     * @param {Date} start - Fecha de inicio.
     * @param {Date} end - Fecha de fin.
     * @returns {number} Número de semanas (puede ser decimal).
     * @example
     * ```ts
     * const weeks = timeService.weekDifference(
     *   new Date('2025-01-01'),
     *   new Date('2025-02-01')
     * );
     * ```
     */
    weekDifference(start: Date, end: Date): number {
        return this.dateDifference(start, end, TimeService.MS_PER_WEEK);
    }

    /**
     * Calcula la diferencia en meses entre dos fechas.
     * @param {Date} start - Fecha de inicio.
     * @param {Date} end - Fecha de fin.
     * @returns {number} Número de meses (puede ser decimal).
     */
    monthDifference(start: Date, end: Date): number {
        return this.dateDifference(start, end, TimeService.MS_PER_MONTH);
    }

    /**
     * Calcula la diferencia en días entre dos fechas.
     * @param {Date} start - Fecha de inicio.
     * @param {Date} end - Fecha de fin.
     * @returns {number} Número de días (puede ser decimal).
     */
    dayDifference(start: Date, end: Date): number {
        return this.dateDifference(start, end, TimeService.MS_PER_DAY);
    }

    /**
     * Lógica común para calcular diferencia entre fechas en unidades definidas por `divisor`.
     * @private
     * @param {Date} start - Fecha de inicio.
     * @param {Date} end - Fecha de fin.
     * @param {number} divisor - Número de ms que representan la unidad (día, semana, mes).
     * @returns {number} Diferencia en unidades; 0 si alguna fecha es inválida.
     */
    private dateDifference(
        start: Date,
        end: Date,
        divisor: number
    ): number {
        if (!start || !end) return 0;
        return (end.getTime() - start.getTime()) / divisor;
    }
}
