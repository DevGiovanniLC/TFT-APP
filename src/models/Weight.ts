type Weight = {
    date: Date;
    weight: number;
    weight_units: WeightUnits;
};

enum WeightUnits {
    KG = 'kg',
    LB = 'lb',
}

export default Weight;
