export type Weight = {
    id: number;
    date: Date;
    weight: number;
    weight_units: WeightUnits;
};

export enum WeightUnits {
    KG = 'kg',
    LB = 'lb',
}

export const emptyWeight: Weight = { id: 0, weight: 0, weight_units: WeightUnits.KG, date: new Date(0) };
