import { DataProvider } from 'src/interfaces/DataProvider';
import data from 'src/assets/data/mock.json';
import { Weight } from '@models/Weight';

export default class JSONProvider implements DataProvider {
    private data: any;

    constructor() {
        this.data = data;
    }

    setNewWeight(value: Weight): boolean {
        // Push the new weight to the weights array
        return this.data.weights.push(value);
    }

    getGoal(): Promise<Weight> {
        return this.data.goal;
    }

    async getWeights(): Promise<Weight[]> {
        return this.data.weights;
    }

    async initializeConnection() {
        return true;
    }
}
