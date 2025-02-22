
type Height = {
  date: Date;
  amount: number;
  unit: HeightUnits;
}

enum HeightUnits {
  CM = 'cm',
  FT = 'ft'
}


export default Height
