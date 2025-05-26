import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Weight } from '@models/types/Weight.type';
import { User } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';

const WEIGHTS_KEY = 'weight_data_weights';
const USER_KEY = 'user_data';

/**
 * Proveedor de datos que utiliza LocalStorage para persistir información.
 * - Implementa la interfaz DataProvider.
 * - Almacena usuarios, registros de peso y objetivos en LocalStorage.
 *
 * @export
 * @class LocalStorageProvider
 * @implements {DataProvider}
 */
export default class LocalStorageProvider implements DataProvider {
    /**
     * Obtiene y parsea un ítem de LocalStorage.
     * @private
     * @template T - Tipo del valor almacenado.
     * @param {string} key - Clave de LocalStorage.
     * @returns {(T | undefined)} Valor parseado o undefined si no existe.
     */
    private getItem<T>(key: string): T | undefined {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : undefined;
    }

    /**
     * Serializa y guarda un valor en LocalStorage.
     * @private
     * @template T - Tipo del valor a guardar.
     * @param {string} key - Clave de LocalStorage.
     * @param {T} value - Valor a almacenar.
     */
    private setItem<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Lee el array crudo de pesos desde LocalStorage.
     * @private
     * @returns {any[]} Array de objetos sin parsear (date en ms).
     */
    private getWeightsRaw(): any[] {
        return this.getItem<Weight[]>(WEIGHTS_KEY) || [];
    }

    /**
     * Obtiene el usuario almacenado.
     * @async
     * @returns {Promise<User | undefined>} Usuario o undefined si no existe.
     */
    async getUser(): Promise<User | undefined> {
        return this.getItem<User>(USER_KEY);
    }

    /**
     * Guarda o actualiza los datos del usuario.
     * @async
     * @param {User} value - Objeto User a persistir.
     * @returns {Promise<boolean>} Siempre true.
     */
    async setUser(value: User): Promise<boolean> {
        this.setItem(USER_KEY, value);
        return true;
    }

    /**
     * Añade un nuevo registro de peso asignando un ID incremental.
     * La fecha se almacena como timestamp.
     * @async
     * @param {Weight} value - Registro de peso a agregar.
     * @returns {Promise<boolean>} true si se agregó correctamente.
     */
    async addWeight(value: Weight): Promise<boolean> {
        const weights = this.getWeightsRaw();
        const id = weights.length ? Math.max(...weights.map(w => w.id || 0)) + 1 : 1;
        weights.push({ ...value, date: new Date(value.date).getTime(), id });
        this.setItem(WEIGHTS_KEY, weights);
        return true;
    }

    /**
     * Elimina un registro de peso por ID.
     * @async
     * @param {number} id - Identificador del peso a eliminar.
     * @returns {Promise<boolean>} true si se eliminó correctamente.
     */
    async deleteWeight(id: number): Promise<boolean> {
        try {
            const weights = this.getWeightsRaw().filter((w: Weight) => w.id !== id);
            this.setItem(WEIGHTS_KEY, weights);
            return true;
        } catch (error) {
            console.error('Error deleting weight:', error);
            return false;
        }
    }

    /**
     * Actualiza un registro de peso existente.
     * @async
     * @param {Weight} value - Objeto Weight con datos actualizados.
     * @returns {Promise<boolean>} true si se actualizó correctamente.
     */
    async updateWeight(value: Weight): Promise<boolean> {
        try {
            const weights = this.getWeightsRaw();
            const idx = weights.findIndex((w: Weight) => w.id === value.id);
            if (idx !== -1) {
                weights[idx] = { ...value, date: new Date(value.date).getTime() };
                this.setItem(WEIGHTS_KEY, weights);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating weight:', error);
            return false;
        }
    }

    /**
     * Obtiene el objetivo (Goal) basado en la configuración del usuario.
     * @async
     * @returns {Promise<Goal>} Objetivo con peso, unidades y fecha.
     */
    async getGoal(): Promise<Goal> {
        const user = await this.getUser();
        return {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date,
        };
    }

    /**
     * Recupera y ordena los registros de peso almacenados.
     * Convierte la fecha de ms a Date.
     * @async
     * @returns {Promise<Weight[]>} Array ordenado de Weight.
     */
    async getWeights(): Promise<Weight[]> {
        return this.getWeightsRaw()
            .map(w => ({
                ...w,
                date: new Date(w.date),
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Descarga el CSV generado creando un enlace temporal.
     * @async
     * @param {string} csv - Cadena con contenido CSV.
     */
    async exportDataCSV(csv: string): Promise<void> {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weights-history-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Verifica si LocalStorage está disponible realizando un set/remove de prueba.
     * @async
     * @returns {Promise<boolean>} true si la conexión es exitosa.
     */
    async initializeConnection(): Promise<boolean> {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            console.error('LocalStorage not available:', e);
            return false;
        }
    }
}
