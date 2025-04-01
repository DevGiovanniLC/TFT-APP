import { WeightUnits } from './Weight';

export type User = {
    name: string;
    age: number;
    height: number;
    gender: Gender;

    email: string | undefined;

    goal_weight: number | undefined;
    goal_units: WeightUnits | undefined;
    goal_date: Date | undefined;
};

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}
