export type Weight = {
    id: number | undefined;
    date: Date;
    weight: number;
    weight_units: WeightUnits;
};

export enum WeightUnits {
    KG = 'kg',
    LB = 'lb',
}
