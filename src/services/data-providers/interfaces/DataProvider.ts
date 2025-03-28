import { User } from '@models/types/User';
import { Weight } from '@models/types/Weight';

export interface DataProvider {
    getWeights(): Promise<Weight[]>;
    getGoal(): Promise<Weight>;
    getUser(): Promise<User>;

    setUser(value: User): boolean;
    addWeight(value: Weight): boolean;

    initializeConnection(): Promise<any>;
}
