export type Height = {
    date: Date;
    amount: number;
    unit: HeightUnits;
};

export enum HeightUnits {
    CM = 'cm',
    FT = 'ft',
}

export default Height;
