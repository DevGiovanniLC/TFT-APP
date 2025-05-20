/// <reference types="jest" />
import { expect } from '@jest/globals';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

import { UserConfigService } from '@services/UserConfig.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { User, Gender } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';
import { WeightUnits } from '@models/types/Weight.type';

describe('UserConfigService (Unit Tests with Jest)', () => {
    let service: UserConfigService;
    let dpMock: jest.Mocked<DataProviderService>;

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

    const rawGoal = {
        weight: mockUser.goal_weight,
        weight_units: mockUser.goal_units,
        date: '2024-05-01'
    };
    const mockGoal: Goal = {
        weight: rawGoal.weight,
        weight_units: rawGoal.weight_units,
        date: new Date(rawGoal.date)
    };

    beforeEach(() => {
        dpMock = {
            getUser: jest.fn().mockResolvedValue(mockUser),
            getGoal: jest.fn().mockResolvedValue(rawGoal as any),
            setUser: jest.fn()
        } as unknown as jest.Mocked<DataProviderService>;
        service = new UserConfigService(dpMock);
    });

    it('should emit user when exists', async () => {
        const user = await firstValueFrom(service.getUser());
        expect(user).toEqual(mockUser);
        const emitted = await firstValueFrom(service.user$);
        expect(emitted).toEqual(mockUser);
    });

    it('should emit undefined when no user', async () => {
        dpMock.getUser.mockResolvedValue(undefined);
        const user = await firstValueFrom(service.getUser());
        expect(user).toBeUndefined();
        const emitted = await firstValueFrom(service.user$);
        expect(emitted).toBeUndefined();
    });

    it('should emit parsed goal when exists', async () => {
        const goal = await firstValueFrom(service.getGoal());
        expect(goal).toEqual(mockGoal);
        const emitted = await firstValueFrom(service.goal$);
        expect(emitted).toEqual(mockGoal);
    });

    it('should emit undefined when no goal', async () => {
        dpMock.getGoal.mockResolvedValue(undefined);
        const goal = await firstValueFrom(service.getGoal());
        expect(goal).toBeUndefined();
        const emitted = await firstValueFrom(service.goal$);
        expect(emitted).toBeUndefined();
    });

    it('should call setUser and refresh both streams', async () => {
        dpMock.getUser.mockResolvedValue(mockUser);
        dpMock.getGoal.mockResolvedValue(rawGoal as any);

        service.setUser(mockUser);
        expect(dpMock.setUser).toHaveBeenCalledWith(mockUser);

        // Espera al siguiente ciclo de eventos para que los Observables emitan
        await new Promise(process.nextTick);

        // Verifica directamente los BehaviorSubjects
        expect((service as any).userSubject.getValue()).toEqual(mockUser);
        expect((service as any).goalSubject.getValue()).toEqual(mockGoal);
    });
});
