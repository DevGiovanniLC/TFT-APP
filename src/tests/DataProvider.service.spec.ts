/// <reference types="jest" />
import { expect } from '@jest/globals';

import { DataProviderService } from '@services/data-providers/DataProvider.service';
import SQLiteDataProvider from '@services/data-providers/SQLiteDataProvider';
import LocalStorageProvider from '@services/data-providers/LocalStorageProvider';
import { environment } from '@envs/environment';
import { Weight, WeightUnits } from '@models/types/Weight.type';
import { Gender, User } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';

// Mock de los DataProvider
jest.mock('@services/data-providers/SQLiteDataProvider');
jest.mock('@services/data-providers/LocalStorageProvider');

describe('DataProviderService', () => {
    let service: DataProviderService;
    let mockProvider: jest.Mocked<any>;

    const mockWeight: Weight = { id: 1, weight: 80, date: new Date(), weight_units: WeightUnits.KG };
    const mockUser: User = { name: 'Test', age: 30, email: 'test@test.com', height: 170, gender: Gender.MALE, goal_weight: 75, goal_units: WeightUnits.KG, goal_date: new Date('2024-12-31') };
    const mockGoal: Goal = { weight: mockUser.goal_weight, weight_units: mockUser.goal_units, date: new Date(mockUser.goal_date ?? Date.now()) };

    beforeEach(() => {
        jest.clearAllMocks();

        // Forzar entorno de desarrollo (local storage)
        (environment as any).production = false;
        (LocalStorageProvider as any).mockImplementation(() => {
            return {
                initializeConnection: jest.fn().mockResolvedValue(true),
                getWeights: jest.fn().mockResolvedValue([mockWeight]),
                getGoal: jest.fn().mockResolvedValue(mockGoal),
                getUser: jest.fn().mockResolvedValue(mockUser),
                setUser: jest.fn().mockResolvedValue(true),
                addWeight: jest.fn().mockResolvedValue(true),
                deleteWeight: jest.fn().mockResolvedValue(true),
                updateWeight: jest.fn().mockResolvedValue(true),
                exportDataCSV: jest.fn().mockResolvedValue(undefined),
            };
        });

        service = new DataProviderService();
        mockProvider = (service as any).dataProvider;
    });

    it('should use LocalStorageProvider in development', () => {
        expect(LocalStorageProvider).toHaveBeenCalled();
    });

    it('should initialize connection and set connectionStatus to true', async () => {
        const result = await service.initialize();
        expect(mockProvider.initializeConnection).toHaveBeenCalled();
        expect(result).toBe(true);
        expect(service['connectionStatus']()).toBe(true);
    });

    it('should delegate getWeights', async () => {
        const weights = await service.getWeights();
        expect(mockProvider.getWeights).toHaveBeenCalled();
        expect(weights).toEqual([mockWeight]);
    });

    it('should delegate getGoal', async () => {
        const goal = await service.getGoal();
        expect(mockProvider.getGoal).toHaveBeenCalled();
        expect(goal).toEqual(mockGoal);
    });

    it('should delegate getUser', async () => {
        const user = await service.getUser();
        expect(mockProvider.getUser).toHaveBeenCalled();
        expect(user).toEqual(mockUser);
    });

    it('should delegate setUser', async () => {
        const result = await service.setUser(mockUser);
        expect(mockProvider.setUser).toHaveBeenCalledWith(mockUser);
        expect(result).toBe(true);
    });

    it('should delegate addWeight', async () => {
        const result = await service.addWeight(mockWeight);
        expect(mockProvider.addWeight).toHaveBeenCalledWith(mockWeight);
        expect(result).toBe(true);
    });

    it('should delegate deleteWeight', async () => {
        const result = await service.deleteWeight(1);
        expect(mockProvider.deleteWeight).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
    });

    it('should delegate updateWeight', async () => {
        const result = await service.updateWeight(mockWeight);
        expect(mockProvider.updateWeight).toHaveBeenCalledWith(mockWeight);
        expect(result).toBe(true);
    });

    it('should delegate exportDataCSV', async () => {
        await service.exportDataCSV('csv-content');
        expect(mockProvider.exportDataCSV).toHaveBeenCalledWith('csv-content');
    });

    it('should use SQLiteDataProvider in production', () => {
        (environment as any).production = true;
        new DataProviderService();
        expect(SQLiteDataProvider).toHaveBeenCalled();
    });
});
