/// <reference types="jest" />
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { BMIService } from '@services/BMI.service';
import { UserConfigService } from '@services/UserConfig.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import * as interop from '@angular/core/rxjs-interop';
import { User, Gender } from '@models/types/User.type';
import { Weight, WeightUnits } from '@models/types/Weight.type';

// Mock de toSignal para controlar el comportamiento de las señales en los tests
jest.mock('@angular/core/rxjs-interop', () => ({
    toSignal: jest.fn()
}));

describe('BMIService (Unit Tests with Jest)', () => {
    let service: BMIService;
    let userConfigMock: jest.Mocked<UserConfigService>;
    let weightTrackerMock: jest.Mocked<WeightTrackerService>;

    // Usuario de prueba con datos válidos
    const mockUser: User = {
        name: 'Test User',
        age: 30,
        height: 170,
        gender: Gender.MALE,
        email: 'test@test.com',
        goal_weight: 65,
        goal_units: WeightUnits.KG,
        goal_date: new Date('2024-12-31')
    };

    // Peso de prueba
    const mockWeight: Weight = {
        id: 1,
        weight: 75,
        date: new Date(),
        weight_units: WeightUnits.KG
    };

    beforeEach(() => {
        // Reseteamos el mock de toSignal antes de cada test
        (interop.toSignal as jest.Mock).mockReset();

        // Configuramos mocks de los servicios con valores por defecto
        userConfigMock = { user$: of(mockUser) } as any;
        weightTrackerMock = { lastWeight$: of(mockWeight) } as any;
    });

    it('should calculate BMI correctly from user and weight', done => {
        // toSignal devuelve nuestro usuario simulado para calcular el BMI
        (interop.toSignal as jest.Mock).mockReturnValue(() => mockUser);
        service = new BMIService(userConfigMock, weightTrackerMock);

        service.bmi$.subscribe(bmi => {
            // Cálculo manual redondeado a un decimal para comparación
            const expected = Math.round((mockWeight.weight / ((mockUser.height! / 100) ** 2)) * 10) / 10;
            expect(bmi).toBe(expected);
            done();
        });
    });

    it('should return null BMI if height is missing', done => {
        // Simulamos usuario sin altura para verificar que retorne null
        const noHeight = { ...mockUser, height: undefined };
        userConfigMock = { user$: of(noHeight) } as any;
        (interop.toSignal as jest.Mock).mockReturnValue(() => noHeight);
        service = new BMIService(userConfigMock, weightTrackerMock);

        service.bmi$.subscribe(bmi => {
            expect(bmi).toBeNull();
            done();
        });
    });

    it('should return null BMI if weight is missing', done => {
        // Usuario válido pero peso indefinido, resultado debe ser null
        (interop.toSignal as jest.Mock).mockReturnValue(() => mockUser);
        weightTrackerMock = { lastWeight$: of(undefined) } as any;
        service = new BMIService(userConfigMock, weightTrackerMock);

        service.bmi$.subscribe(bmi => {
            expect(bmi).toBeNull();
            done();
        });
    });

    it('should return correct BMI limits for valid height', () => {
        // Para altura válida, obtenemos límites de BMI y comprobamos propiedades
        (interop.toSignal as jest.Mock).mockReturnValue(() => mockUser);
        service = new BMIService(userConfigMock, weightTrackerMock);

        const limits = service.updateMaxWeightLimit();
        expect(limits.length).toBeGreaterThan(0);
        limits.forEach(item => {
            expect(item).toHaveProperty('label');
            expect(item).toHaveProperty('bmi');
            expect(item).toHaveProperty('weight');
            expect(item).toHaveProperty('alert');
        });
    });

    it('should return empty array for BMI limits if height is missing', () => {
        // Sin altura, los límites deben ser un array vacío
        const noHeight = { ...mockUser, height: undefined };
        (interop.toSignal as jest.Mock).mockReturnValue(() => noHeight);
        service = new BMIService({ user$: of(noHeight) } as any, weightTrackerMock);

        expect(service.updateMaxWeightLimit()).toEqual([]);
    });

    it('should return empty array for BMI limits if height is 0', () => {
        // Altura cero no válida, se espera array vacío de límites
        const zeroHeight = { ...mockUser, height: 0 };
        (interop.toSignal as jest.Mock).mockReturnValue(() => zeroHeight);
        service = new BMIService({ user$: of(zeroHeight) } as any, weightTrackerMock);

        expect(service.updateMaxWeightLimit()).toEqual([]);
    });

});
