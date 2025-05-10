import { Goal } from '@models/types/Goal';
import { User } from '@models/types/User';
import { Weight } from '@models/types/Weight';

export interface DataProvider {
    getWeights(): Promise<Weight[]>;
    getGoal(): Promise<Goal | undefined>;
    getUser(): Promise<User | undefined>;

    setUser(value: User): boolean;

    addWeight(value: Weight): boolean;
    updateWeight(value: Weight): boolean;
    deleteWeight(id: number): boolean;

    exportDataCSV(csv: string): Promise<void>;
    initializeConnection(): Promise<boolean>;
}
