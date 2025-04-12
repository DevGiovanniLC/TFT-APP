import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';

// Mocks
jest.mock('@services/data-providers/DBConnection');
jest.mock('@services/data-providers/LocalStorageProvider');

import DBConnection from '@services/data-providers/DBConnection';
import LocalStorageProvider from '@services/data-providers/LocalStorageProvider';
import { environment } from '@envs/environment';

describe('DataProviderService', () => {
    let service: DataProviderService;

    const mockWeight: Weight = {
        weight: 70,
        date: new Date('2025-04-10'),
        weight_units: 'kg' as any,
    };

    const mockUser: User = {
        name: 'Test',
        age: 30,
        height: 170,
        gender: 'male' as any,
        email: 'test@test.com',
        goal_weight: 65,
        goal_units: 'kg' as any,
        goal_date: new Date('2025-05-01'),
    };

    const dataProviderMock = {
        initializeConnection: jest.fn(),
        getWeights: jest.fn().mockResolvedValue([mockWeight]),
        getGoal: jest.fn().mockResolvedValue(mockWeight),
        getUser: jest.fn().mockResolvedValue(mockUser),
        setUser: jest.fn(),
        addWeight: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new DataProviderService();
    });

    describe('In development environment', () => {
        beforeEach(async () => {
            (environment as any).production = false;
            (LocalStorageProvider as any).mockImplementation(() => dataProviderMock);

            await service.initialize();
        });

        it('should use LocalStorageProvider in development mode', () => {
            expect(LocalStorageProvider).toHaveBeenCalled();
            expect(dataProviderMock.initializeConnection).toHaveBeenCalled();
            expect(service.isConnected()).toBe(true);
        });

        it('should delegate getWeights to the provider', async () => {
            const weights = await service.getWeights();
            expect(dataProviderMock.getWeights).toHaveBeenCalled();
            expect(weights).toEqual([mockWeight]);
        });

        it('should delegate getGoal to the provider', async () => {
            const goal = await service.getGoal();
            expect(dataProviderMock.getGoal).toHaveBeenCalled();
            expect(goal).toEqual(mockWeight);
        });

        it('should delegate getUser to the provider', async () => {
            const user = await service.getUser();
            expect(dataProviderMock.getUser).toHaveBeenCalled();
            expect(user).toEqual(mockUser);
        });

        it('should delegate setUser to the provider', () => {
            service.setUser(mockUser);
            expect(dataProviderMock.setUser).toHaveBeenCalledWith(mockUser);
        });

        it('should delegate addWeight to the provider', () => {
            service.addWeight(mockWeight);
            expect(dataProviderMock.addWeight).toHaveBeenCalledWith(mockWeight);
        });
    });

    describe('In production environment', () => {
        beforeEach(async () => {
            (environment as any).production = true;
            (DBConnection as any).mockImplementation(() => dataProviderMock);

            await service.initialize();
        });

        it('should use DBConnection in production mode', () => {
            expect(DBConnection).toHaveBeenCalled();
            expect(dataProviderMock.initializeConnection).toHaveBeenCalled();
            expect(service.isConnected()).toBe(true);
        });
    });
});
