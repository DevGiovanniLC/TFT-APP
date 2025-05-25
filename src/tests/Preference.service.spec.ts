/// <reference types="jest" />
import { expect } from '@jest/globals';
import { PreferenceService, Preference } from '@services/Preference.service';
import { Preferences } from '@capacitor/preferences';

jest.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: jest.fn(),
        set: jest.fn(),
    }
}));

describe('PreferenceService', () => {
    const DEFAULTS: Preference = {
        BMI_ALERT_40: true,
        BMI_ALERT_35: true,
        BMI_ALERT_18_5: true,
        BMI_ALERT_16: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with defaults when no stored value', async () => {
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });

        const svc = new PreferenceService();
        await Promise.resolve();

        expect(svc.get('BMI_ALERT_40')).toBe(DEFAULTS.BMI_ALERT_40);
        expect(svc.get('BMI_ALERT_35')).toBe(DEFAULTS.BMI_ALERT_35);
        expect(svc.get('BMI_ALERT_18_5')).toBe(DEFAULTS.BMI_ALERT_18_5);
        expect(svc.get('BMI_ALERT_16')).toBe(DEFAULTS.BMI_ALERT_16);

        expect(Preferences.get).toHaveBeenCalledWith({ key: 'user_preferences' });
    });

    it('should merge stored preferences over defaults on init', async () => {
        const stored = { BMI_ALERT_40: false };
        (Preferences.get as jest.Mock).mockResolvedValue({ value: JSON.stringify(stored) });

        const svc = new PreferenceService();
        await Promise.resolve();

        expect(svc.get('BMI_ALERT_40')).toBe(false);
        expect(svc.get('BMI_ALERT_35')).toBe(DEFAULTS.BMI_ALERT_35);
        expect(svc.get('BMI_ALERT_18_5')).toBe(DEFAULTS.BMI_ALERT_18_5);
        expect(svc.get('BMI_ALERT_16')).toBe(DEFAULTS.BMI_ALERT_16);
    });

    it('set() should update signal and persist new preferences', async () => {
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });

        const svc = new PreferenceService();
        await Promise.resolve();

        await svc.set('BMI_ALERT_35', false);

        expect(svc.get('BMI_ALERT_35')).toBe(false);
        expect(svc.get('BMI_ALERT_40')).toBe(true);
        expect(svc.get('BMI_ALERT_18_5')).toBe(true);
        expect(svc.get('BMI_ALERT_16')).toBe(true);


        const expected = {
            ...DEFAULTS,
            BMI_ALERT_35: false
        };
        expect(Preferences.set).toHaveBeenCalledWith({
            key: 'user_preferences',
            value: JSON.stringify(expected)
        });
    });

    it('get() returns correct individual preference', async () => {
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });
        const svc = new PreferenceService();
        await Promise.resolve();

        expect(svc.get('BMI_ALERT_16')).toBe(true);
        await svc.set('BMI_ALERT_16', false);
        expect(svc.get('BMI_ALERT_16')).toBe(false);
    });

});
