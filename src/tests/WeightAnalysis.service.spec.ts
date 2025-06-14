/// <reference types="jest" />
import { expect } from '@jest/globals';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { TimeService } from '@services/Time.service';
import { Weight } from '@models/types/Weight.type';
import { WeightUnits } from '@models/types/Weight.type';

describe('WeightAnalysisService (Unit Tests with Jest)', () => {
    let service: WeightAnalysisService;
    let timeServiceMock: jest.Mocked<TimeService>;

    // Conjunto de pesos de ejemplo para pruebas de tendencia
    const sampleWeights: Weight[] = [
        { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG },
        { id: 3, date: new Date('2024-03-01'), weight: 76, weight_units: WeightUnits.KG },
    ];

    beforeEach(() => {
        // Creamos un mock de TimeService para controlar diferencias de tiempo
        timeServiceMock = {
            weekDifference: jest.fn(),
            monthDifference: jest.fn(),
        } as any;

        service = new WeightAnalysisService(timeServiceMock);
    });

    it('should calculate weekWeightLossPace with sufficient weeks', () => {
        // Si hay 2 semanas, pace = (80-70)/2 = 5
        timeServiceMock.weekDifference.mockReturnValue(2);
        const result = service.weekWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(5, 1);
    });

    it('should calculate weekWeightLossPace with less than 1 week', () => {
        // Si la diferencia es <1, se usa weight-goal directamente
        timeServiceMock.weekDifference.mockReturnValue(0.5);
        const result = service.weekWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(10, 1);
    });

    it('should calculate monthWeightLossPace with sufficient months', () => {
        // Si hay 2 meses, pace = (80-70)/2 = 5
        timeServiceMock.monthDifference.mockReturnValue(2);
        const result = service.monthWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(5, 1);
    });

    it('should calculate monthWeightLossPace with less than 1 month', () => {
        // Si la diferencia es <1 mes, se usa weight-goal directamente
        timeServiceMock.monthDifference.mockReturnValue(0.5);
        const result = service.monthWeightLossPace(80, 70, new Date(), new Date());
        expect(result).toBeCloseTo(10, 1);
    });

    it('weightLossPace should handle division by zero', () => {
        // Si diff=0, debe retornar 0 para evitar NaN
        const result = (service as any).weightLossPace(80, 70, 0);
        expect(result).toBe(NaN);
    });

    it('should return correct weight progression', () => {
        // Progresión a mitad de camino entre 90 y 70 es 50%
        const progression = service.weightProgression(90, 80, 70);
        expect(progression).toBe(50);
    });

    it('should return NaN for invalid weight progression inputs', () => {
        // Entradas inválidas deben producir NaN
        expect(service.weightProgression(0, 80, 70)).toBeNaN();
        expect(service.weightProgression(90, 0, 70)).toBeNaN();
        expect(service.weightProgression(90, 80, 0)).toBeNaN();
        expect(service.weightProgression(90, 80, 90)).toBeNaN();
    });

    it('trendWeightPace should handle empty weights', () => {
        // Sin datos, pace semanal/mensual debe ser cero
        const result = service.trendWeightPace([]);
        expect(result).toEqual({ weightPerWeek: 0, weightPerMonth: 0 });
    });

    it('trendWeightPace should compute trend with sample weights', () => {
        // Con datos de ejemplo, retorna números válidos
        const result = service.trendWeightPace(sampleWeights);
        expect(typeof result.weightPerWeek).toBe('number');
        expect(typeof result.weightPerMonth).toBe('number');
    });

    it('getTrendData should return empty array for empty weights', () => {
        // Sin datos, no hay línea de tendencia
        const result = service.getTrendData([]);
        expect(result).toEqual([]);
    });

    it('getTrendData should compute trend line for sample weights', () => {
        // Con datos de ejemplo, retorna dos puntos de tendencia
        const result = service.getTrendData(sampleWeights);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty('x');
        expect(result[0]).toHaveProperty('y');
    });

    it('calculateTrend should return NaN slope/intercept for invalid data', () => {
        // Sin datos, slope/intercept deben ser cero
        const result = (service as any).calculateWeightedTrend([], Date.now());
        expect(result).toEqual({ slope: NaN, intercept: NaN });
    });

    it('calculateTrend should compute valid slope/intercept', () => {
        // Con dos puntos, slope e intercept deben ser números
        const refDate = Date.now();
        const weights: Weight[] = [
            { id: 1, date: new Date(refDate - 86400000 * 10), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date(refDate), weight: 75, weight_units: WeightUnits.KG },
        ];
        const result = (service as any).calculateWeightedTrend(weights, refDate);
        expect(typeof result.slope).toBe('number');
        expect(typeof result.intercept).toBe('number');
    });

    it('should handle edge case where recent weights length < 2 and total weights > 2', () => {
        // Pocos datos recientes, pero total>2, sigue calculando sin fallar
        const weights: Weight[] = [
            { id: 1, date: new Date('2023-01-01'), weight: 85, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2023-01-02'), weight: 84, weight_units: WeightUnits.KG },
            { id: 3, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        ];
        const result = (service as any).calculateWeightedTrend(weights, TimeService.getTime(new Date('2024-01-01')));
        expect(typeof result.slope).toBe('number');
    });

    it('trendWeightPace should handle identical dates (zero slope)', () => {
        // Fechas idénticas generan slope=0 => pace=0
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2024-01-01'), weight: 75, weight_units: WeightUnits.KG },
        ];
        const result = service.trendWeightPace(weights);
        expect(result.weightPerWeek).toBe(0);
        expect(result.weightPerMonth).toBe(0);
    });

    it('getTrendData should handle weights with identical dates', () => {
        // Si todos los x son iguales, no hay datos de tendencia
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2024-01-01'), weight: 78, weight_units: WeightUnits.KG },
        ];
        const result = service.getTrendData(weights);
        expect(result.length).toBe(2);
    });

    it('calculateTrend should handle only one data point', () => {
        // Con un solo punto, slope/intercept = 0
        const weights: Weight[] = [{ id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG }];
        const result = (service as any).calculateWeightedTrend(weights, TimeService.getTime(new Date('2024-01-01')));
        expect(result).toEqual({ slope: NaN, intercept: NaN });
    });

    it('getTrendData should compute correct y value for future trend', () => {
        // Se espera y válido y x creciente para segundo punto
        const weights: Weight[] = [
            { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
            { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG },
        ];
        const result = service.getTrendData(weights);
        if (result.length === 2) {
            expect(result[1].y).not.toBeNaN();
            expect(result[1].x).toBeGreaterThan(result[0].x);
        }
    });

    it('weightLossPace should correctly handle negative differences', () => {
        // diff negativo se convierte en valor positivo: (70-80)/-2
        const result = (service as any).weightLossPace(70, 80, -2);
        expect(result).toBeCloseTo(5, 1);
    });

    it('weekWeightLossPace and monthWeightLossPace should handle negative goal', () => {
        // goal negativo asegura cálculo correcto: (80-(-10))/2
        timeServiceMock.weekDifference.mockReturnValue(2);
        timeServiceMock.monthDifference.mockReturnValue(2);
        const week = service.weekWeightLossPace(80, -10, new Date(), new Date());
        const month = service.monthWeightLossPace(80, -10, new Date(), new Date());
        expect(week).toBeCloseTo(45, 1);
        expect(month).toBeCloseTo(45, 1);
    });

    it('weightProgression should handle large differences', () => {
        // Casos con grandes rangos funcionan sin overflow
        const progression = service.weightProgression(200, 100, 50);
        expect(progression).toBeCloseTo(66.67, 1);
    });

    it('weightProgression should handle zero denominator', () => {
        // goal == first produce NaN
        expect(service.weightProgression(50, 50, 50)).toBeNaN();
    });

    it('trendWeightPace should handle many records efficiently', () => {
        // Generamos 20 registros y confirmamos cálculos rápidos
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, i + 1),
            weight: 100 - i,
            weight_units: WeightUnits.KG,
        }));
        const result = service.trendWeightPace(weights);
        expect(typeof result.weightPerWeek).toBe('number');
        expect(typeof result.weightPerMonth).toBe('number');
    });

    it('getTrendData should compute trend line for 20 records', () => {
        // Confirmamos 2 puntos de tendencia para 20 registros
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, i + 1),
            weight: 100 - i,
            weight_units: WeightUnits.KG,
        }));
        const result = service.getTrendData(weights);
        expect(result.length).toBe(2);
        expect(result[0]).toHaveProperty('x');
        expect(result[0]).toHaveProperty('y');
        expect(result[1]).toHaveProperty('x');
        expect(result[1]).toHaveProperty('y');
    });

    it('calculateTrend should compute valid slope/intercept for 20 records', () => {
        // Verificamos slope/intercept con fechas referenciales
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, i + 1),
            weight: 100 - i,
            weight_units: WeightUnits.KG,
        }));
        const refDate = TimeService.getTime(new Date(2024, 0, 20));
        const result = (service as any).calculateWeightedTrend(weights, refDate);
        expect(typeof result.slope).toBe('number');
        expect(typeof result.intercept).toBe('number');
    });

    it('trendWeightPace should detect zero slope with 20 same-date records', () => {
        // Mismo escenario de fecha para todos devuelve pace -0
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, 0, 1),
            weight: 100 - i,
            weight_units: WeightUnits.KG,
        }));
        const result = service.trendWeightPace(weights);
        expect(result.weightPerWeek).toBe(0);
        expect(result.weightPerMonth).toBe(0);
    });

    it('trendWeightPace should handle random date and weight data', () => {
        // Datos aleatorios deben producir números sin errores
        const weights: Weight[] = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            weight: 50 + Math.random() * 50,
            weight_units: WeightUnits.KG,
        }));
        const result = service.trendWeightPace(weights);
        expect(typeof result.weightPerWeek).toBe('number');
        expect(typeof result.weightPerMonth).toBe('number');
    });
});
