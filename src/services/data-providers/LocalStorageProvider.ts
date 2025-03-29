import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';
import data from 'src/assets/data/mock.json';

export default class LocalStorageProvider implements DataProvider {
    private readonly WEIGHTS_KEY = 'weight_data_weights';
    private readonly USER_KEY: string = 'user_data';

    constructor() {}

    addExampleData() {
        localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(data.weights));
    }

    getUser(): Promise<User> {
        const userString = localStorage.getItem(this.USER_KEY);
        const user = userString ? JSON.parse(userString) : null;
        return Promise.resolve(user);
    }

    setUser(value: User): boolean {
        localStorage.setItem(this.USER_KEY, JSON.stringify(value));
        return true;
    }

    addWeight(value: Weight): boolean {
        try {
            const formattedDate = value.date as Date;

            const weights = this.getWeightsSync();

            const existingIndex = weights.findIndex((w) => w.date === formattedDate);

            if (existingIndex !== -1) {
                weights[existingIndex] = value;
            } else {
                weights.push({ ...value, date: new Date(formattedDate) }); // Asegurar formato
            }

            localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights));

            return true;
        } catch (error) {
            console.error('Error saving weight:', error);
            return false;
        }
    }

    getGoal(): Promise<Weight> {
        const userString = localStorage.getItem(this.USER_KEY);
        const user = userString ? JSON.parse(userString) : null;

        const goal = {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date,
        };

        return Promise.resolve(goal);
    }

    async getWeights(): Promise<Weight[]> {
        return Promise.resolve(this.getWeightsSync() as Weight[]);
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
