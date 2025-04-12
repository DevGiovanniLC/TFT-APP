import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

describe('CalculationFunctionsService', () => {
    let service: CalculationFunctionsService;

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-15'); // 14 days difference

    beforeEach(() => {
        service = new CalculationFunctionsService();
    });

    describe('Date difference calculations', () => {
        it('should correctly calculate the difference in weeks', () => {
            const weeks = service.weekDifference(startDate, endDate);
            expect(weeks).toBeCloseTo(2, 1);
        });

        it('should correctly calculate the difference in months', () => {
            const months = service.monthDifference(startDate, endDate);
            expect(months).toBeCloseTo(0.47, 1);
        });

        it('should correctly calculate the difference in days', () => {
            const days = service.dayDifference(startDate, endDate);
            expect(days).toBe(14);
        });

        it('should return 0 if either date is invalid', () => {
            expect(service.weekDifference(null as any, endDate)).toBe(0);
            expect(service.monthDifference(startDate, undefined as any)).toBe(0);
            expect(service.dayDifference(undefined as any, null as any)).toBe(0);
        });
    });

    describe('Weight loss pace calculations', () => {
        it('should correctly calculate weekly weight loss pace', () => {
            const pace = service.PaceWeekWeightLoss(80, 70, startDate, endDate);
            expect(pace).toBe(5.00); // 10kg in 2 weeks = 5kg/week
        });

        it('should correctly calculate monthly weight loss pace', () => {
            const pace = service.PaceMonthWeightLoss(80, 70, startDate, endDate);
            expect(pace).toBe(21.43); // 10kg in ~0.47 months ≈ 21.43kg/month
        });
    });

    describe('Weight progression percentage', () => {
        it('should calculate the percentage of progress towards the goal', () => {
            const progression = service.weightProgression(90, 80, 70);
            expect(progression).toBe(50); // Halfway from 90 to 70
        });

        it('should return NaN if any value is invalid or zero', () => {
            expect(service.weightProgression(0, 80, 70)).toBeNaN();
            expect(service.weightProgression(90, 0, 70)).toBeNaN();
            expect(service.weightProgression(90, 80, 0)).toBeNaN();
        });
    });
});
