import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';
import data from 'src/assets/data/mock.json';

export default class LocalStorageProvider implements DataProvider {
    private readonly WEIGHTS_KEY = 'weight_data_weights';
    private readonly USER_KEY: string = 'user_data';


    constructor() {
        // Initialize storage with empty arrays if not exists
        // this.addExampleData();
    }

    addExampleData() {
        localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(data.weights));
    }

    getUser(): Promise<User> {
        const userString = localStorage.getItem(this.USER_KEY);
        let user = userString ? JSON.parse(userString) : null;
        return Promise.resolve(user);
    }

    setUser(value: User): boolean {
        localStorage.setItem(this.USER_KEY, JSON.stringify(value));
        return true;
    }

    addWeight(value: Weight): boolean {
        try {
            // Normalizar la fecha en formato "yyyy-MM-dd"
            const formattedDate = this.formatDate(value.date);

            // Obtener los pesos actuales
            const weights = this.getWeightsSync();

            // Buscar si ya existe un peso con la misma fecha
            const existingIndex = weights.findIndex(w => this.formatDate(w.date) === formattedDate);

            if (existingIndex !== -1) {
                // Si ya existe, actualizarlo
                weights[existingIndex] = value;
            } else {
                // Si no existe, agregarlo
                weights.push({ ...value, date: new Date(formattedDate)}); // Asegurar formato
            }

            // Guardar en localStorage
            localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights));

            return true;
        } catch (error) {
            console.error('Error saving weight:', error);
            return false;
        }
    }

    // Método auxiliar para formatear la fecha correctamente
    private formatDate(date: string | Date): string {
        if (typeof date === 'string') return date; // Si ya es string, retornarlo tal cual
        return date.toISOString().split('T')[0]; // Convertir Date a "yyyy-MM-dd"
    }

    getGoal(): Promise<Weight> {
        const userString = localStorage.getItem(this.USER_KEY);
        let user = userString ? JSON.parse(userString) : null;

        const goal = {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date
        }

        return Promise.resolve(goal);
    }

    async getWeights(): Promise<Weight[]> {
        return Promise.resolve(this.getWeightsSync());
    }

    private getWeightsSync(): Weight[] {
        const weightsString = localStorage.getItem(this.WEIGHTS_KEY);
        return weightsString ? JSON.parse(weightsString) : [];
    }

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
