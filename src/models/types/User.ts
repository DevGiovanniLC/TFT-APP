import { WeightUnits } from './Weight';

export type User = {
    name: string;
    age: number;
    height: number;
    gender: Gender;

    email: string;

    goal_weight: number;
    goal_units: WeightUnits;
    goal_date: Date;
};

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}
