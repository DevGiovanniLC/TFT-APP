import { Injectable } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { combineLatest, map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
/**
 * Servicio para el cálculo y gestión del Índice de Masa Corporal (BMI).
 * @export
 * @class BMIService
 */
export class BMIService {
    /**
     * Señal que mantiene el usuario actual (puede ser `null` si aún no se ha cargado).
     * @private
     * @readonly
     */
    private readonly user = toSignal(this.userConfig.user$, { initialValue: null });

    /**
     * Observable que emite el BMI calculado a partir de la altura del usuario
     * y su último peso registrado. Emite `null` si faltan datos.
     * @readonly
     * @type {Observable<number | null>}
     * @example
     * ```ts
     * this.bmiService.bmi$.subscribe(bmi => {
     *   if (bmi !== null) {
     *     console.log(`Tu BMI es ${bmi}`);
     *   } else {
     *     console.warn('Datos insuficientes para calcular BMI');
     *   }
     * });
     * ```
     */
    readonly bmi$: Observable<number | null> = combineLatest([
        this.userConfig.user$,
        this.weightTracker.lastWeight$
    ]).pipe(
        map(([user, weight]) => {
            const height = user?.height;
            const w = weight?.weight;
            if (!height || !w) return null;
            const bmi = w / ((height / 100) ** 2);
            return Math.round(bmi * 10) / 10;
        })
    );

    /**
     * Crea una instancia de BMIService.
     * @param {UserConfigService} userConfig - Servicio para obtener la configuración del usuario.
     * @param {WeightTrackerService} weightTracker - Servicio para obtener el último peso registrado.
     */
    constructor(
        private readonly userConfig: UserConfigService,
        private readonly weightTracker: WeightTrackerService
    ) { }

    /**
     * Genera los límites de BMI para la altura actual del usuario,
     * devolviendo un array de categorías con su BMI máximo, peso
     * correspondiente y color de alerta.
     * @returns {Array<{ label: string; bmi: number; weight: number; alert: string }>}
     *   Array de objetos con:
     *   - `label`: nombre de la categoría
     *   - `bmi`: valor máximo de BMI
     *   - `weight`: peso en kg para ese BMI con la altura del usuario
     *   - `alert`: color asociado a la categoría
     * @example
     * ```ts
     * const limits = this.bmiService.getBMILimitsForHeight();
     * limits.forEach(l => {
     *   console.log(`${l.label}: BMI hasta ${l.bmi}, peso hasta ${l.weight} kg`);
     * });
     * ```
     */
    getBMILimitsForHeight(): Array<{ label: string; bmi: number; weight: number; alert: string; }> {
        const height = this.user()?.height;
        if (!height || height <= 0) return [];

        const h2 = (height / 100) ** 2;
        const bmiCategories = [
            { label: 'Severe Thinness', max: 15.99, alert: '#f2adad' },
            { label: 'Moderate Thinness', max: 16.99, alert: '#c7b85a' },
            { label: 'Mild Thinness', max: 18.49, alert: '#c7b85a' },
            { label: 'Normal', max: 24.9, alert: '#4caf50' },
            { label: 'Pre-obese', max: 27.9, alert: '#c7b85a' },
            { label: 'High Overweight', max: 29.9, alert: '#c7b85a' },
            { label: 'Obesity Class I', max: 34.9, alert: '#f2adad' },
            { label: 'Obesity Class II', max: 39.9, alert: '#f2adad' }
        ];

        return bmiCategories.map(({ label, max, alert }) => ({
            label,
            bmi: max,
            weight: +(max * h2).toFixed(1),
            alert
        }));
    }
}
