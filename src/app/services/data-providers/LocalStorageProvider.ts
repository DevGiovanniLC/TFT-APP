import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Weight } from '@models/types/Weight.type';
import { User } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';

const WEIGHTS_KEY = 'weight_data_weights';
const USER_KEY = 'user_data';

export default class LocalStorageProvider implements DataProvider {
    constructor() { }

    private getItem<T>(key: string): T | undefined {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : undefined;
    }

    private setItem<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    private getWeightsRaw(): any[] {
        return this.getItem<any[]>(WEIGHTS_KEY) || [];
    }

    async getUser(): Promise<User | undefined> {
        return this.getItem<User>(USER_KEY);
    }

    async setUser(value: User): Promise<boolean> {
        this.setItem(USER_KEY, value);
        return true;
    }

    async addWeight(value: Weight): Promise<boolean> {
        const weights = this.getWeightsRaw();
        const id = weights.length ? Math.max(...weights.map(w => w.id || 0)) + 1 : 1;
        weights.push({ ...value, date: new Date(value.date).getTime(), id });
        this.setItem(WEIGHTS_KEY, weights);
        return true;
    }

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

    async getGoal(): Promise<Goal> {
        const user = await this.getUser();
        return {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date,
        };
    }

    async getWeights(): Promise<Weight[]> {
        return this.getWeightsRaw()
            .map(w => ({
                ...w,
                date: new Date(w.date),
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    async exportDataCSV(csv: string): Promise<void> {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weights-history-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
