import { Goal } from '@models/types/Goal.type';
import { User } from '@models/types/User.type';
import { Weight } from '@models/types/Weight.type';

export interface DataProvider {
    getWeights(): Promise<Weight[]>;
    getGoal(): Promise<Goal | undefined>;
    getUser(): Promise<User | undefined>;

    setUser(value: User): Promise<boolean>;

    addWeight(value: Weight): Promise<boolean>;
    updateWeight(value: Weight): Promise<boolean>;
    deleteWeight(id: number): Promise<boolean>;

    exportDataCSV(csv: string): Promise<void>;
    initializeConnection(): Promise<boolean>;
}
