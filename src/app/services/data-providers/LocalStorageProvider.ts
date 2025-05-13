import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';
import data from '@assets/data/mock.json';
import { Goal } from '@models/types/Goal';

export default class LocalStorageProvider implements DataProvider {
    private readonly WEIGHTS_KEY = 'weight_data_weights';
    private readonly USER_KEY = 'user_data';

    constructor() {}

    private addExampleData() {
        localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(data.weights));
    }

    getUser(): Promise<User | undefined> {
        const userString = localStorage.getItem(this.USER_KEY);
        const user = userString ? JSON.parse(userString) : undefined;
        return Promise.resolve(user);
    }

    setUser(value: User): boolean {
        localStorage.setItem(this.USER_KEY, JSON.stringify(value));
        return true;
    }

    addWeight(value: Weight): boolean {

        const formattedDate = new Date(value.date)

        const weights = this.getWeightsSync();

        weights.push({ ...value, date: formattedDate, id: weights.length + 1 }); // Asegurar formato

        localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights.map((w) => ({ ...w, date: new Date(w.date).getTime() }))));

        return true;
    }

    deleteWeight(id: number): boolean {
        try {
            const weights = this.getWeightsSync();
            const updatedWeights = weights.filter((weight: Weight) => weight.id !== id);
            localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(updatedWeights));
            return true;
        } catch (error) {
            console.error('Error deleting weight:', error);
            return false;
        }
    }

    updateWeight(value: Weight): boolean {
        try {
            const weights = this.getWeightsSync();
            const index = weights.findIndex((weight: Weight) => weight.id === value.id);
            if (index !== -1) {
                weights[index] = value;
                localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating weight:', error);
            return false;
        }
    }

    getGoal(): Promise<Goal> {
        const userString = localStorage.getItem(this.USER_KEY);
        const user = userString ? JSON.parse(userString) : undefined;

        const goal: Goal = {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date,
        };

        return Promise.resolve(goal);
    }

    async getWeights(): Promise<Weight[]> {
        return this.getWeightsSync()
            .map((w) => ({
                id: w.id,
                date: new Date(w.date),
                weight: w.weight,
                weight_units: w.weight_units,
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    private getWeightsSync(): Weight[] {
        const weightsString = localStorage.getItem(this.WEIGHTS_KEY);
        return weightsString ? JSON.parse(weightsString) : [];
    }

    async exportDataCSV(csv: string): Promise<void> {

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = `weights-history-${Date.now()}.csv`;
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        return Promise.resolve();
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
