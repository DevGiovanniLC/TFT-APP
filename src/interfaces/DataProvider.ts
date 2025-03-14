import { Weight } from '@models/Weight';

export interface DataProvider {
    getWeights(): Promise<Weight[]>;
    getGoal(): Promise<Weight>;
    setNewWeight(value: Weight): boolean;
    initializeConnection(): Promise<any>;
}
