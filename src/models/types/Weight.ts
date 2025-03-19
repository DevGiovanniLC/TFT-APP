export type Weight = {
    date: Date;
    weight: number;
    weight_units: WeightUnits;
};

export enum WeightUnits {
    KG = 'kg',
    LB = 'lb',
}

export const emptyWeight: Weight = { weight: 0, weight_units: WeightUnits.KG, date: new Date(0) };
