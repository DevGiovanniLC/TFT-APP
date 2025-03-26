import { WeightUnits } from "./Weight";

export type User = {
    name: string;
    email: string;
    age: number;
    height: number;
    goal_weight: number;
    goal_units: WeightUnits;
    goal_date: Date;
}
