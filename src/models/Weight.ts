type Weight = {
  date: Date;
  amount: number;
  units: WeightUnits;
}

enum WeightUnits {
  KG = 'kg',
  LB = 'lb'
}

export default Weight
