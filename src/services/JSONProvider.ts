import { DataProvider } from 'src/interfaces/DataProvider';
import data from 'src/assets/data/mock.json';

export default class JSONProvider implements DataProvider {
    private data: any;

    constructor() {
        this.data = data;
    }

    async getWeights(): Promise<any> {
        return this.data.weights;
    }

    async initializeConnection() {
        return true;
    }
}
