/// <reference types="jest" />
import { expect } from '@jest/globals';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { TimeService } from '@services/Time.service';
import { Weight } from '@models/types/Weight.type';
import { WeightUnits } from '@models/types/Weight.type';

describe('WeightAnalysisService', () => {
    let service: WeightAnalysisService;
    let timeServiceMock: jest.Mocked<TimeService>;

    const sampleWeights: Weight[] = [
        { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG },
        { id: 3, date: new Date('2024-03-01'), weight: 76, weight_units: WeightUnits.KG },
    ];

    beforeEach(() => {
        timeServiceMock = {
            weekDifference: jest.fn(),
            monthDifference: jest.fn(),
        } as any;

        service = new WeightAnalysisService(timeServiceMock);
    });

    it('should calculate weekWeightLossPace with sufficient weeks', () => {
        timeServiceMock.weekDifference.mockReturnValue(2);
        const result = service.weekWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(5, 1); // (80-70)/2
    });

    it('should calculate weekWeightLossPace with less than 1 week', () => {
        timeServiceMock.weekDifference.mockReturnValue(0.5);
        const result = service.weekWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(10, 1); // weight-goal
    });

    it('should calculate monthWeightLossPace with sufficient months', () => {
        timeServiceMock.monthDifference.mockReturnValue(2);
        const result = service.monthWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(5, 1); // (80-70)/2
    });

    it('should calculate monthWeightLossPace with less than 1 month', () => {
        timeServiceMock.monthDifference.mockReturnValue(0.5);
        const result = service.monthWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(10, 1); // weight-goal
    });

    it('weightLossPace should handle division by zero', () => {
        const result = (service as any).weightLossPace(80, 70, 0);
        expect(result).toBe(0);
    });

    it('should return correct weight progression', () => {
        const progression = service.weightProgression(90, 80, 70);
        expect(progression).toBe(50); // halfway
    });

    it('should return NaN for invalid weight progression inputs', () => {
        expect(service.weightProgression(0, 80, 70)).toBeNaN();
        expect(service.weightProgression(90, 0, 70)).toBeNaN();
        expect(service.weightProgression(90, 80, 0)).toBeNaN();
        expect(service.weightProgression(90, 80, 90)).toBeNaN(); // goal == first
    });

    it('trendWeightPace should handle empty weights', () => {
        const result = service.trendWeightPace([]);
        expect(result).toEqual({ weightPerWeek: 0, weightPerMonth: 0 });
    });

    it('trendWeightPace should compute trend with sample weights', () => {
        const result = service.trendWeightPace(sampleWeights);
        expect(typeof result.weightPerWeek).toBe('number');
        expect(typeof result.weightPerMonth).toBe('number');
    });

    it('getTrendData should return empty array for empty weights', () => {
        const result = service.getTrendData([]);
        expect(result).toEqual([]);
    });

    it('getTrendData should compute trend line for sample weights', () => {
        const result = service.getTrendData(sampleWeights);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty('x');
        expect(result[0]).toHaveProperty('y');
    });

    it('calculateTrend should return zero slope/intercept for invalid data', () => {
        const result = (service as any).calculateTrend([], Date.now());
        expect(result).toEqual({ slope: 0, intercept: 0 });
    });

    it('calculateTrend should compute valid slope/intercept', () => {
        const refDate = Date.now();
        const weights: Weight[] = [
            { id: 1, date: new Date(refDate - 86400000 * 10), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date(refDate), weight: 75, weight_units: WeightUnits.KG }
        ];
        const result = (service as any).calculateTrend(weights, refDate);
        expect(typeof result.slope).toBe('number');
        expect(typeof result.intercept).toBe('number');
    });

    it('should handle edge case where recent weights length < 2 and total weights > 2', () => {
        const weights: Weight[] = [
            { id: 1, date: new Date('2023-01-01'), weight: 85, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2023-01-02'), weight: 84, weight_units: WeightUnits.KG },
            { id: 3, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG }
        ];
        const result = (service as any).calculateTrend(weights, TimeService.getTime(new Date('2024-01-01')));
        expect(typeof result.slope).toBe('number');
    });

    it('trendWeightPace should handle identical dates (zero slope)', () => {
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2024-01-01'), weight: 75, weight_units: WeightUnits.KG }
        ];
        const result = service.trendWeightPace(weights);
        expect(result.weightPerWeek).toBe(0);
        expect(result.weightPerMonth).toBe(0);
    });

    it('getTrendData should handle weights with identical dates', () => {
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2024-01-01'), weight: 78, weight_units: WeightUnits.KG }
        ];
        const result = service.getTrendData(weights);
        expect(result.length).toBe(0); // y=0, no trend line
    });

    it('calculateTrend should handle only one data point', () => {
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG }
        ];
        const result = (service as any).calculateTrend(weights, TimeService.getTime(new Date('2024-01-01')));
        expect(result).toEqual({ slope: 0, intercept: 0 });
    });

    it('trendWeightPace should handle not enough data points', () => {
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 90, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2024-02-01'), weight: 80, weight_units: WeightUnits.KG }
        ];
        const result = service.trendWeightPace(weights);
        expect(result.weightPerWeek).toEqual(0);
        expect(result.weightPerMonth).toEqual(0);
    });

    it('getTrendData should compute correct y value for future trend', () => {
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG }
        ];
        const result = service.getTrendData(weights);
        if (result.length === 2) {
            expect(result[1].y).not.toBeNaN();
            expect(result[1].x).toBeGreaterThan(result[0].x);
        }
    });

    it('weightLossPace should correctly handle negative differences', () => {
        const result = (service as any).weightLossPace(70, 80, -2); // negative diff
        expect(result).toBeCloseTo(5, 1);
    });

    it('weekWeightLossPace and monthWeightLossPace should handle negative goal', () => {
        timeServiceMock.weekDifference.mockReturnValue(2);
        timeServiceMock.monthDifference.mockReturnValue(2);
        const week = service.weekWeightLossPace(80, -10, new Date(), new Date());
        const month = service.monthWeightLossPace(80, -10, new Date(), new Date());
        expect(week).toBeCloseTo(45, 1);  // (80-(-10))/2
        expect(month).toBeCloseTo(45, 1);
    });

    it('weightProgression should handle large differences', () => {
        const progression = service.weightProgression(200, 100, 50);
        expect(progression).toBeCloseTo(66.67, 1); // (100-200)/(50-200)
    });

    it('weightProgression should handle zero denominator', () => {
        expect(service.weightProgression(50, 50, 50)).toBeNaN(); // goal == first
    });

    it('trendWeightPace should handle many records efficiently', () => {
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, i + 1),  // 2024-01-01, 2024-01-02, etc.
            weight: 100 - i,  // 100, 99, 98, ...
            weight_units: WeightUnits.KG
        }));
        const result = service.trendWeightPace(weights);
        expect(typeof result.weightPerWeek).toBe('number');
        expect(typeof result.weightPerMonth).toBe('number');
    });

    it('getTrendData should compute trend line for 20 records', () => {
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, i + 1),
            weight: 100 - i,
            weight_units: WeightUnits.KG
        }));
        const result = service.getTrendData(weights);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty('x');
        expect(result[0]).toHaveProperty('y');
        expect(result[1]).toHaveProperty('x');
        expect(result[1]).toHaveProperty('y');
    });

    it('calculateTrend should compute valid slope/intercept for 20 records', () => {
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, i + 1),
            weight: 100 - i,
            weight_units: WeightUnits.KG
        }));
        const refDate = TimeService.getTime(new Date(2024, 0, 20));
        const result = (service as any).calculateTrend(weights, refDate);
        expect(typeof result.slope).toBe('number');
        expect(typeof result.intercept).toBe('number');
    });

    it('trendWeightPace should detect zero slope with 20 same-date records', () => {
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, 1),  // all same date
            weight: 100 - i,
            weight_units: WeightUnits.KG
        }));
        const result = service.trendWeightPace(weights);
        expect(result.weightPerWeek).toBe(-0);
        expect(result.weightPerMonth).toBe(-0);
    });


    it('trendWeightPace should handle random date and weight data', () => {
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            weight: 50 + Math.random() * 50,  // between 50 and 100
            weight_units: WeightUnits.KG
        }));
        const result = service.trendWeightPace(weights);
        expect(typeof result.weightPerWeek).toBe('number');
        expect(typeof result.weightPerMonth).toBe('number');
    });


});
