import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

describe('CalculationFunctionsService', () => {
    let service: CalculationFunctionsService;

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-15'); // 14 días de diferencia

    beforeEach(() => {
        service = new CalculationFunctionsService();
    });

    describe('Diferencias de fechas', () => {
        it('Debería calcular correctamente la diferencia en semanas', () => {
            const weeks = service.weekDifference(startDate, endDate);
            expect(weeks).toBeCloseTo(2, 1);
        });

        it('Debería calcular correctamente la diferencia en meses', () => {
            const months = service.monthDifference(startDate, endDate);
            expect(months).toBeCloseTo(0.47, 1);
        });

        it('Debería calcular correctamente la diferencia en días', () => {
            const days = service.dayDifference(startDate, endDate);
            expect(days).toBe(14);
        });

        it('Debería devolver 0 si alguna fecha es inválida', () => {
            expect(service.weekDifference(null as any, endDate)).toBe(0);
            expect(service.monthDifference(startDate, undefined as any)).toBe(0);
            expect(service.dayDifference(undefined as any, null as any)).toBe(0);
        });
    });

    describe('Ritmo de pérdida de peso', () => {
        it('Debería calcular correctamente el ritmo semanal de pérdida de peso', () => {
            const pace = service.PaceWeekWeightLoss(80, 70, startDate, endDate);
            expect(pace).toBe(5.00); // 10kg en 2 semanas = 5kg/semana
        });

        it('Debería calcular correctamente el ritmo mensual de pérdida de peso', () => {
            const pace = service.PaceMonthWeightLoss(80, 70, startDate, endDate);
            expect(pace).toBe(21.43); // 10kg en ~0.47 meses ≈ 21.43kg/mes
        });
    });

    describe('Progresión de peso', () => {
        it('Debería calcular el porcentaje de progresión hacia el objetivo', () => {
            const progression = service.weightProgression(90, 80, 70);
            expect(progression).toBe(50); // mitad del camino de 90 a 70
        });

        it('Debería devolver NaN si algún valor es inválido', () => {
            expect(service.weightProgression(0, 80, 70)).toBeNaN();
            expect(service.weightProgression(90, 0, 70)).toBeNaN();
            expect(service.weightProgression(90, 80, 0)).toBeNaN();
        });
    });
});
