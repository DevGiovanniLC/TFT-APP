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
