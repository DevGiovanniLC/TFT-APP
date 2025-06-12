export type BMICategory = {
    translateLabel: string;
    label: string;
    max: number;
    min: number;
    color: string;
    maxWeightLimit: number | undefined;
    emoji: string;
};

export default BMICategory;
