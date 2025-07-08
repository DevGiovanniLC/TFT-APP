import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type BMIPreferenceKey = 'BMI_ALERT_40' | 'BMI_ALERT_35' | 'BMI_ALERT_18_5' | 'BMI_ALERT_16';
export type GoalPreferenceKey = 'GOAL_REACHED' | 'GOAL_NOT_REACHED';
export type WeightPreferenceKey = 'WEIGHT_NOT_REGISTERED' | 'WEIGHT_DUPLICATED';

export type Preference = {
    ALERT: {
        BMI: Record<BMIPreferenceKey, boolean>;
        GOAL: Record<GoalPreferenceKey, boolean>;
    }
};

export const DEFAULTS: Preference = {
    ALERT: {
        BMI: {
            BMI_ALERT_40: true,
            BMI_ALERT_35: true,
            BMI_ALERT_18_5: true,
            BMI_ALERT_16: true,
        },
        GOAL: {
            GOAL_REACHED: true,
            GOAL_NOT_REACHED: true,
        },
    },
};

@Injectable({ providedIn: 'root' })
/**
 * Servicio para gestionar las preferencias.
 * - Carga valores por defecto o almacenados en Capacitor Preferences.
 * - Permite obtener y actualizar preferencias individuales.
 *
 * @export
 * @class PreferenceService
 */
export class PreferenceService {
    private readonly STORAGE_KEY = 'user_preferences';
    private readonly _preferences = signal<Preference>(DEFAULTS);
    readonly preferences = this._preferences.asReadonly();
    readonly inited = signal(false);

    async initialize(): Promise<void> {
        const value = (await Preferences.get({ key: this.STORAGE_KEY })).value

        if (!value) return;
        const storedPreferences: Preference = JSON.parse(value);
        this._preferences.set({ ...DEFAULTS, ...storedPreferences });
        this.inited.set(true);
    };


    async setBMI<K extends BMIPreferenceKey>(key: K, value: boolean): Promise<void> {
        const updated: Preference = {
            ...this._preferences(),
            ALERT: {
                ...this._preferences().ALERT,
                BMI: { ...this._preferences().ALERT.BMI, [key]: value },
            },
        };

        this._preferences.set(updated);
        await Preferences.set({
            key: this.STORAGE_KEY,
            value: JSON.stringify(updated),
        });
    }

    async setGoal<K extends GoalPreferenceKey>(key: K, value: boolean): Promise<void> {
        const updated: Preference = {
            ...this._preferences(),
            ALERT: {
                ...this._preferences().ALERT,
                GOAL: { ...this._preferences().ALERT.GOAL, [key]: value },
            },
        };

        this._preferences.set(updated);
        await Preferences.set({
            key: this.STORAGE_KEY,
            value: JSON.stringify(updated),
        });
    }


    getBMI<K extends BMIPreferenceKey>(key: K): boolean {
        return this._preferences().ALERT.BMI[key];
    }

    getGoal<K extends GoalPreferenceKey>(key: K): boolean {
        return this._preferences().ALERT.GOAL[key];
    }

}
