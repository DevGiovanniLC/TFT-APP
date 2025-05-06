import { WeightUnits } from './Weight';

export type Goal = {
    date: Date | undefined;
    weight: number;
    weight_units: WeightUnits;
};
