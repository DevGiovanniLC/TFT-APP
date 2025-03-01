import { Weight } from "@models/Weight";

export interface DataProvider {
    getWeights(): Promise<Weight[]>;
    getGoal(): Promise<Weight>;
    initializeConnection(): Promise<any>;
}
