/// <reference types="jest" />
import { expect } from '@jest/globals';
import { PreferenceService, Preference } from '@services/Preference.service';
import { Preferences } from '@capacitor/preferences';

// Mock de la API de Preferences para simular almacenamiento
jest.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: jest.fn(),
        set: jest.fn(),
    }
}));

describe('PreferenceService (Unit Tests with Jest)', () => {
    // Valores por defecto esperados para las preferencias
    const DEFAULTS: Preference = {
        BMI_ALERT_40: true,
        BMI_ALERT_35: true,
        BMI_ALERT_18_5: true,
        BMI_ALERT_16: true,
    };

    beforeEach(() => {
        // Reseteamos mocks antes de cada prueba
        jest.clearAllMocks();
    });

    it('should initialize with defaults when no stored value', async () => {
        // Simulamos que no hay valor guardado en Preferences
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });

        const svc = new PreferenceService();
        await Promise.resolve(); // Esperamos resolución inicial

        // Verificamos que se usen los valores por defecto
        expect(svc.get('BMI_ALERT_40')).toBe(DEFAULTS.BMI_ALERT_40);
        expect(svc.get('BMI_ALERT_35')).toBe(DEFAULTS.BMI_ALERT_35);
        expect(svc.get('BMI_ALERT_18_5')).toBe(DEFAULTS.BMI_ALERT_18_5);
        expect(svc.get('BMI_ALERT_16')).toBe(DEFAULTS.BMI_ALERT_16);

        // Confirmamos llamada a Preferences.get con la clave correcta
        expect(Preferences.get).toHaveBeenCalledWith({ key: 'user_preferences' });
    });

    it('should merge stored preferences over defaults on init', async () => {
        // Simulamos preferencias almacenadas parcialmente
        const stored = { BMI_ALERT_40: false };
        (Preferences.get as jest.Mock).mockResolvedValue({ value: JSON.stringify(stored) });

        const svc = new PreferenceService();
        await Promise.resolve();

        // La preferencia sobreescrita debe reflejarse, el resto sigue con default
        expect(svc.get('BMI_ALERT_40')).toBe(false);
        expect(svc.get('BMI_ALERT_35')).toBe(DEFAULTS.BMI_ALERT_35);
        expect(svc.get('BMI_ALERT_18_5')).toBe(DEFAULTS.BMI_ALERT_18_5);
        expect(svc.get('BMI_ALERT_16')).toBe(DEFAULTS.BMI_ALERT_16);
    });

    it('set() should update signal and persist new preferences', async () => {
        // Inicialización sin valor previo
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });

        const svc = new PreferenceService();
        await Promise.resolve();

        // Cambiamos una preferencia y comprobamos su propagación
        await svc.set('BMI_ALERT_35', false);

        expect(svc.get('BMI_ALERT_35')).toBe(false);
        expect(svc.get('BMI_ALERT_40')).toBe(true);
        expect(svc.get('BMI_ALERT_18_5')).toBe(true);
        expect(svc.get('BMI_ALERT_16')).toBe(true);

        // Verificamos que se persistan en Preferences con el objeto completo
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
        // Sin valor previo, get devuelve default
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });
        const svc = new PreferenceService();
        await Promise.resolve();

        expect(svc.get('BMI_ALERT_16')).toBe(true);
        // Tras cambiar el valor, get debe reflejar el cambio
        await svc.set('BMI_ALERT_16', false);
        expect(svc.get('BMI_ALERT_16')).toBe(false);
    });

});
