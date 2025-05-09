import { WeightUnits } from './Weight';

export type Goal = {
    date: Date | undefined;
    weight: number | undefined;
    weight_units: WeightUnits | undefined;
};
