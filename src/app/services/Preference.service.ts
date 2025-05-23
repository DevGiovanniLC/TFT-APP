import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

type Preference = {
    BMI_ALERT_40: boolean;
    BMI_ALERT_35: boolean;
    BMI_ALERT_18_5: boolean;
    BMI_ALERT_16: boolean;
}

const DEFAULTS: Preference = {
    BMI_ALERT_40: true,
    BMI_ALERT_35: true,
    BMI_ALERT_18_5: true,
    BMI_ALERT_16: true,
}

@Injectable({
    providedIn: 'root'
})
export class PreferenceService {
    private readonly STORAGE_KEY = 'user_preferences';
    private readonly _preferences = signal<Preference>(DEFAULTS);
    readonly preferences = this._preferences.asReadonly();

    constructor() {
        this.loadPreferences()
    }

    private async loadPreferences() {
        const { value } = await Preferences.get({ key: this.STORAGE_KEY });
        if (value) {
            try {
                this._preferences.set({ ...DEFAULTS, ...JSON.parse(value) });
            } catch (err) {
                console.error('Failed to parse preferences:', err);
            }
        }
    }

    async set<K extends keyof Preference>(key: K, value: Preference[K]) {
        const updated = { ...this._preferences(), [key]: value };
        this._preferences.set(updated);
        await Preferences.set({
            key: this.STORAGE_KEY,
            value: JSON.stringify(updated),
        });
    }

    get<K extends keyof Preference>(key: K): Preference[K] {
        return this._preferences()[key];
    }

}
