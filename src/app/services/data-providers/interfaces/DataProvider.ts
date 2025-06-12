import { Goal } from '@models/types/Goal.type';
import { User } from '@models/types/User.type';
import { Weight } from '@models/types/Weight.type';

export interface DataProvider {
    initializeConnection(): Promise<boolean>;

    getWeights(): Promise<Weight[]>;
    addWeight(value: Weight): Promise<boolean>;
    updateWeight(value: Weight): Promise<boolean>;
    deleteWeight(id: number): Promise<boolean>;

    setUser(value: User): Promise<boolean>;
    getGoal(): Promise<Goal | undefined>;
    getUser(): Promise<User | undefined>;

    exportDataCSV(csv: string): Promise<void>;
}

