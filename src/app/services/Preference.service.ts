import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type BMIPreferenceKey = 'BMI_ALERT_40' | 'BMI_ALERT_35' | 'BMI_ALERT_18_5' | 'BMI_ALERT_16';
export type GoalPreferenceKey = 'GOAL_REACHED' | 'GOAL_NOT_REACHED';
export type WeightPreferenceKey = 'WEIGHT_NOT_REGISTERED' | 'WEIGHT_DUPLICATED';

export type Preference = {
    ALERT: {
        BMI: Record<BMIPreferenceKey, boolean>;
        GOAL: Record<GoalPreferenceKey, any>;
        WEIGHT: Record<WeightPreferenceKey, boolean>;
    }
};

const DEFAULTS: Preference = {
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
        WEIGHT: {
            WEIGHT_NOT_REGISTERED: true,
            WEIGHT_DUPLICATED: true,
        },
    },
};

@Injectable({ providedIn: 'root' })
/**
 * Servicio para gestionar las preferencias de alertas de BMI.
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

    constructor() {
        this.init();
    }

    private init(): void {
        Preferences.get({ key: this.STORAGE_KEY }).then(({ value }) => {
            if (!value) return;

            const storedPreferences = JSON.parse(value) as Preference;

            storedPreferences.ALERT.WEIGHT.WEIGHT_DUPLICATED = true;
            storedPreferences.ALERT.WEIGHT.WEIGHT_NOT_REGISTERED = true;

            this._preferences.set({ ...DEFAULTS, ...storedPreferences });
            this.inited.set(true);
        });
    }

    async setBMI<K extends BMIPreferenceKey>(key: K, value: boolean, interval = 200): Promise<void> {
        const updated: Preference = {
            ...this._preferences(),
            ALERT: {
                ...this._preferences().ALERT,
                BMI: { ...this._preferences().ALERT.BMI, [key]: value },
            },
        };

        return new Promise((resolve) => {
            const check = async () => {
                if (this.inited()) {
                    this._preferences.set(updated);
                    await Preferences.set({
                        key: this.STORAGE_KEY,
                        value: JSON.stringify(updated),
                    });
                    resolve();
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });
    }

    async setGoal<K extends GoalPreferenceKey>(key: K, value: boolean, interval = 200): Promise<void> {
        const updated: Preference = {
            ...this._preferences(),
            ALERT: {
                ...this._preferences().ALERT,
                GOAL: { ...this._preferences().ALERT.GOAL, [key]: value },
            },
        };

        return new Promise((resolve) => {
            const check = async () => {
                if (this.inited()) {
                    this._preferences.set(updated);
                    await Preferences.set({
                        key: this.STORAGE_KEY,
                        value: JSON.stringify(updated),
                    });
                    resolve();
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });
    }

    async setWeight<K extends WeightPreferenceKey>(key: K, value: boolean, interval = 200): Promise<void> {

        const updated: Preference = {
            ...this._preferences(),
            ALERT: {
                ...this._preferences().ALERT,
                WEIGHT: { ...this._preferences().ALERT.WEIGHT, [key]: value },
            },
        };

        return new Promise((resolve) => {
            const check = async () => {
                if (this.inited()) {
                    this._preferences.set(updated);
                    await Preferences.set({
                        key: this.STORAGE_KEY,
                        value: JSON.stringify(updated),
                    });
                    resolve();
                } else {
                    setTimeout(check, interval);
                }
            };
            check();
        });

    }

    getBMI<K extends BMIPreferenceKey>(key: K): boolean {
        return this._preferences().ALERT.BMI[key];
    }

    getGoal<K extends GoalPreferenceKey>(key: K): boolean {
        return this._preferences().ALERT.GOAL[key];
    }

    getWeight<K extends WeightPreferenceKey>(key: K): boolean {
        return this._preferences().ALERT.WEIGHT[key];
    }
}
