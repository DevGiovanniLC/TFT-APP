/// <reference types="jest" />
import { expect } from '@jest/globals';
import { PreferenceService, DEFAULTS } from '@services/Preference.service';
import { Preferences } from '@capacitor/preferences';

// Mock de la API de Preferences para simular almacenamiento
jest.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

describe('PreferenceService (Unit Tests with Jest)', () => {
    // Valores por defecto esperados para las preferencias

    beforeEach(() => {
        // Reseteamos mocks antes de cada prueba
        jest.clearAllMocks();
    });

    it('should initialize with defaults when no stored value', async () => {
        // Simulamos que no hay valor guardado en Preferences
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });

        const svc = new PreferenceService();
        await svc.initialize(); // Llamamos al método de inicialización

        // Verificamos que se usen los valores por defecto
        expect(svc.getBMI('BMI_ALERT_40')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_40);
        expect(svc.getBMI('BMI_ALERT_35')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_35);
        expect(svc.getBMI('BMI_ALERT_18_5')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_18_5);
        expect(svc.getBMI('BMI_ALERT_16')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_16);

        // Confirmamos llamada a Preferences.get con la clave correcta
        expect(Preferences.get).toHaveBeenCalledWith({ key: 'user_preferences' });
    });

    it('setBMI() should update signal and persist new preferences', async () => {
        const svc = new PreferenceService();
        await svc.initialize();

        await svc.setBMI('BMI_ALERT_40', false); // Cambiamos una preferencia

        // La preferencia sobreescrita debe reflejarse, el resto sigue con default
        expect(svc.getBMI('BMI_ALERT_40')).toBe(false);
        expect(svc.getBMI('BMI_ALERT_35')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_35);
        expect(svc.getBMI('BMI_ALERT_18_5')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_18_5);
        expect(svc.getBMI('BMI_ALERT_16')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_16);
    });

    it('setBMI() should update 2 signals and persist new preferences', async () => {
        // Inicialización sin valor previo
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });

        const svc = new PreferenceService();
        await svc.initialize(); // Llamamos al método de inicialización

        // Cambiamos una preferencia y comprobamos su propagación
        await svc.setBMI('BMI_ALERT_40', false);
        await svc.setBMI('BMI_ALERT_35', false);

        expect(svc.getBMI('BMI_ALERT_40')).toBe(false);
        expect(svc.getBMI('BMI_ALERT_35')).toBe(false);
        expect(svc.getBMI('BMI_ALERT_18_5')).toBe(true);
        expect(svc.getBMI('BMI_ALERT_16')).toBe(true);
    });

    it('setGoal() should update signal and persist new preferences', async () => {
        const svc = new PreferenceService();
        await svc.initialize();

        await svc.setGoal('GOAL_REACHED', false); // Cambiamos una preferencia

        expect(svc.getGoal('GOAL_REACHED')).toBe(false);
        expect(svc.getGoal('GOAL_NOT_REACHED')).toBe(true);
    });

    it('getGoal() returns correct individual preference GOAL_REACHED', async () => {
        // Sin valor previo, get devuelve default
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });
        const svc = new PreferenceService();
        await svc.initialize(); // Llamamos al método de inicialización

        expect(svc.getGoal('GOAL_REACHED')).toBe(DEFAULTS.ALERT.GOAL.GOAL_REACHED);
        // Tras cambiar el valor, get debe reflejar el cambio
        await svc.setGoal('GOAL_REACHED', false);
        expect(svc.getGoal('GOAL_REACHED')).toBe(false);
    });

    it('getGoal() returns correct individual preference GOAL_NOT_REACHED', async () => {
        // Sin valor previo, get devuelve default
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });
        const svc = new PreferenceService();
        await svc.initialize(); // Llamamos al método de inicialización

        expect(svc.getGoal('GOAL_NOT_REACHED')).toBe(DEFAULTS.ALERT.GOAL.GOAL_NOT_REACHED);
        // Tras cambiar el valor, get debe reflejar el cambio
        await svc.setGoal('GOAL_NOT_REACHED', false);
        expect(svc.getGoal('GOAL_NOT_REACHED')).toBe(false);
    });

    it('getBMI() returns correct individual preference', async () => {
        // Sin valor previo, get devuelve default
        (Preferences.get as jest.Mock).mockResolvedValue({ value: null });
        const svc = new PreferenceService();
        await svc.initialize(); // Llamamos al método de inicialización

        expect(svc.getBMI('BMI_ALERT_40')).toBe(DEFAULTS.ALERT.BMI.BMI_ALERT_40);
        // Tras cambiar el valor, get debe reflejar el cambio
        await svc.setBMI('BMI_ALERT_16', false);
        expect(svc.getBMI('BMI_ALERT_16')).toBe(false);
    });
});
