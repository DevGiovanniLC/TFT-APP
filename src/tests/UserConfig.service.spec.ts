/// <reference types="jest" />
import { expect } from '@jest/globals';
import { firstValueFrom } from 'rxjs';

import { UserConfigService } from '@services/UserConfig.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { User, Gender } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';
import { WeightUnits } from '@models/types/Weight.type';

describe('UserConfigService (Unit Tests with Jest)', () => {
    let service: UserConfigService;
    let dpMock: jest.Mocked<DataProviderService>;

    // Datos de usuario de prueba
    const mockUser: User = {
        name: 'Test Usuario',
        age: 28,
        height: 165,
        gender: Gender.FEMALE,
        email: 'user@test.com',
        goal_weight: 65,
        goal_units: WeightUnits.KG,
        goal_date: new Date('2024-05-01')
    };

    // Objetivo crudo simulado que devuelve el proveedor (fecha como string)
    const rawGoal = {
        weight: mockUser.goal_weight,
        weight_units: mockUser.goal_units,
        date: '2024-05-01'
    };
    // Objetivo parseado esperado (fecha como Date)
    const mockGoal: Goal = {
        weight: rawGoal.weight,
        weight_units: rawGoal.weight_units,
        date: new Date(rawGoal.date)
    };

    beforeEach(() => {
        // Creamos un mock de DataProviderService con métodos simulados
        dpMock = {
            getUser: jest.fn().mockResolvedValue(mockUser),
            getGoal: jest.fn().mockResolvedValue(rawGoal as any),
            setUser: jest.fn()
        } as unknown as jest.Mocked<DataProviderService>;
        service = new UserConfigService(dpMock);
    });

    it('should initialize BehaviorSubjects with undefined', async () => {
        // Antes de llamar a getUser/getGoal, los subjects deben comenzar en undefined
        const initialUser = await firstValueFrom(service.user$);
        const initialGoal = await firstValueFrom(service.goal$);
        expect(initialUser).toBeUndefined();
        expect(initialGoal).toBeUndefined();
    });

    it('should emit user when exists', async () => {
        // getUser() debe retornar mockUser y emitirlo en user$
        const user = await firstValueFrom(service.getUser());
        expect(user).toEqual(mockUser);
        const emitted = await firstValueFrom(service.user$);
        expect(emitted).toEqual(mockUser);
    });

    it('should emit undefined when no user', async () => {
        // Simulamos ausencia de usuario
        dpMock.getUser.mockResolvedValue(undefined);
        const user = await firstValueFrom(service.getUser());
        expect(user).toBeUndefined();
        const emitted = await firstValueFrom(service.user$);
        expect(emitted).toBeUndefined();
    });

    it('should emit parsed goal when exists', async () => {
        // getGoal() debe parsear rawGoal a Date y emitir en goal$
        const goal = await firstValueFrom(service.getGoal());
        expect(goal).toEqual(mockGoal);
        const emitted = await firstValueFrom(service.goal$);
        expect(emitted).toEqual(mockGoal);
    });

    it('should emit undefined when no goal', async () => {
        // Simulamos ausencia de objetivo
        dpMock.getGoal.mockResolvedValue(undefined);
        const goal = await firstValueFrom(service.getGoal());
        expect(goal).toBeUndefined();
        const emitted = await firstValueFrom(service.goal$);
        expect(emitted).toBeUndefined();
    });

    it('should call setUser and refresh both streams', async () => {
        // setUser() debe llamar a dpMock.setUser y luego actualizar los subjects
        dpMock.getUser.mockResolvedValue(mockUser);
        dpMock.getGoal.mockResolvedValue(rawGoal as any);

        service.setUser(mockUser);
        expect(dpMock.setUser).toHaveBeenCalledWith(mockUser);
        await new Promise(process.nextTick);

        // Verificamos valores internos de los subjects
        expect((service as any).userSubject.getValue()).toEqual(mockUser);
        expect((service as any).goalSubject.getValue()).toEqual(mockGoal);
    });

    it('should set eventTriggered to CHANGED on setUser', () => {
        // Al ejecutar setUser, eventTriggered debe cambiar a CHANGED
        service.setUser(mockUser);
        expect(service.eventTriggered).toBe(service.EventTrigger.CHANGED);
    });

    it('should keep eventTriggered as NONE initially', () => {
        // Sin acciones, eventTriggered inicia en NONE
        expect(service.eventTriggered).toBe(service.EventTrigger.NONE);
    });

    it('should handle errors from getUser gracefully', async () => {
        // Si getUser rechaza, la promesa en firstValueFrom debe rechazar con el mismo error
        dpMock.getUser.mockRejectedValue(new Error('Failed'));
        await expect(firstValueFrom(service.getUser())).rejects.toThrow('Failed');
    });

    it('should handle errors from getGoal gracefully', async () => {
        // Si getGoal rechaza, la promesa en firstValueFrom debe rechazar con el mismo error
        dpMock.getGoal.mockRejectedValue(new Error('Failed'));
        await expect(firstValueFrom(service.getGoal())).rejects.toThrow('Failed');
    });

    it('should update user$ and goal$ after multiple setUser calls', async () => {
        // En sucesivas llamadas a setUser, los valores de userSubject y goalSubject deben actualizarse
        const newUser = { ...mockUser, name: 'Updated' };
        const newGoal = { ...mockGoal, weight: 70 };

        dpMock.getUser.mockResolvedValueOnce(newUser);
        dpMock.getGoal.mockResolvedValueOnce(newGoal as any);

        service.setUser(newUser);
        await new Promise(process.nextTick);

        const user = (service as any).userSubject.getValue();
        const goal = (service as any).goalSubject.getValue();
        expect(user).toEqual(newUser);
        expect(goal).toEqual(newGoal);
    });

    it('should emit goal with undefined date if date is missing', async () => {
        // Si rawGoal.date viene undefined, la propiedad date del Goal debe ser undefined
        dpMock.getGoal.mockResolvedValueOnce({ weight: 60, weight_units: WeightUnits.KG, date: undefined } as any);
        const goal = await firstValueFrom(service.getGoal());
        expect(goal).toEqual({ weight: 60, weight_units: WeightUnits.KG, date: undefined });
    });
});
