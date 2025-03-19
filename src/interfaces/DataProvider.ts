import { Weight } from '@models/types/Weight';

export interface DataProvider {
    getWeights(): Promise<Weight[]>;
    getGoal(): Promise<Weight>;
    setNewWeight(value: Weight): boolean;
    initializeConnection(): Promise<any>;
}
