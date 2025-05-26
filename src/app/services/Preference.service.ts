import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type Preference = Record<
    'BMI_ALERT_40' | 'BMI_ALERT_35' | 'BMI_ALERT_18_5' | 'BMI_ALERT_16',
    boolean
>;

const DEFAULTS: Preference = {
    BMI_ALERT_40: true,
    BMI_ALERT_35: true,
    BMI_ALERT_18_5: true,
    BMI_ALERT_16: true,
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
    /**
     * Clave de almacenamiento en Capacitor Preferences.
     * @private
     * @readonly
     * @type {string}
     */
    private readonly STORAGE_KEY = 'user_preferences';

    /**
     * Signal interna que mantiene el estado actual de las preferencias.
     * @private
     */
    private readonly _preferences = signal<Preference>(DEFAULTS);

    /**
     * Signal de solo lectura disponible para suscripción en componentes.
     * @readonly
     */
    readonly preferences = this._preferences.asReadonly();

    /**
     * Crea una instancia de PreferenceService.
     * Inicia la carga de preferencias desde almacenamiento.
     */
    constructor() {
        this.init();
    }

    /**
     * Inicializa la señal cargando los valores almacenados.
     * Si no hay valor guardado, mantiene los valores por defecto.
     * @private
     */
    private init(): void {
        Preferences.get({ key: this.STORAGE_KEY }).then(({ value }) => {
            if (!value) return;
            this._preferences.set({ ...DEFAULTS, ...JSON.parse(value) });
        });
    }

    /**
     * Actualiza una preferencia individual y persiste el cambio.
     * @template K
     * @param {K} key - Clave de la preferencia a actualizar.
     * @param {Preference[K]} value - Nuevo valor booleano para la preferencia.
     * @returns {Promise<void>} Promise que se resuelve cuando la persistencia finaliza.
     * @example
     * ```ts
     * await this.preferenceService.set('BMI_ALERT_18_5', false);
     * ```
     */
    async set<K extends keyof Preference>(key: K, value: Preference[K]): Promise<void> {
        const updated: Preference = { ...this._preferences(), [key]: value };
        this._preferences.set(updated);
        await Preferences.set({
            key: this.STORAGE_KEY,
            value: JSON.stringify(updated),
        });
    }

    /**
     * Obtiene el valor actual de una preferencia.
     * @template K
     * @param {K} key - Clave de la preferencia a leer.
     * @returns {Preference[K]} Valor booleano de la preferencia.
     * @example
     * ```ts
     * const showAlert = this.preferenceService.get('BMI_ALERT_40');
     * ```
     */
    get<K extends keyof Preference>(key: K): Preference[K] {
        return this._preferences()[key];
    }
}
