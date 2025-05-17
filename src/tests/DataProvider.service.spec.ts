/// <reference types="jest" />
import { expect } from '@jest/globals';

import { DataProviderService } from '@services/data-providers/DataProvider.service';
import LocalStorageProvider from '@services/data-providers/LocalStorageProvider';
import SQLiteDataProvider from '@services/data-providers/SQLiteDataProvider';
import { environment } from '@envs/environment';
import { Weight, WeightUnits } from '@models/types/Weight';
import { User, Gender } from '@models/types/User';
import { Goal } from '@models/types/Goal';

describe('DataProviderService (Unit Tests with Jest)', () => {
    let service: DataProviderService;

    const mockWeights: Weight[] = [
        { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        { id: 2, date: new Date('2024-01-02'), weight: 79.5, weight_units: WeightUnits.KG }
    ];
    const mockUser: User = {
        name: 'User Test',
        age: 30,
        height: 175,
        gender: Gender.MALE,
        email: 'test@example.com',
        goal_weight: 70,
        goal_units: WeightUnits.KG,
        goal_date: new Date('2024-06-01')
    };
    const mockGoal: Goal = {
        weight: mockUser.goal_weight,
        weight_units: mockUser.goal_units,
        date: mockUser.goal_date
    };
    const mockCSV = 'id,weight,date,weight_units\n1,80,2024-01-01,kg';

    beforeEach(() => {
        jest.resetModules();
        environment.production = false;

        // Spy on LocalStorageProvider methods
        jest.spyOn(LocalStorageProvider.prototype, 'initializeConnection').mockResolvedValue(true);
        jest.spyOn(LocalStorageProvider.prototype, 'getWeights').mockResolvedValue(mockWeights);
        jest.spyOn(LocalStorageProvider.prototype, 'getUser').mockResolvedValue(mockUser);
        jest.spyOn(LocalStorageProvider.prototype, 'getGoal').mockResolvedValue(mockGoal);
        jest.spyOn(LocalStorageProvider.prototype, 'setUser').mockReturnValue(true);
        jest.spyOn(LocalStorageProvider.prototype, 'addWeight').mockReturnValue(true);
        jest.spyOn(LocalStorageProvider.prototype, 'deleteWeight').mockReturnValue(true);
        jest.spyOn(LocalStorageProvider.prototype, 'updateWeight').mockReturnValue(true);
        jest.spyOn(LocalStorageProvider.prototype, 'exportDataCSV').mockResolvedValue(undefined);

        // Manual instantiation without TestBed
        service = new DataProviderService();
    });

    it('should have initial connectionStatus false', () => {
        expect(service.connectionStatus()).toBe(false);
    });

    it('should initialize LocalStorageProvider and set connectionStatus to true', async () => {
        await service.initialize();
        expect(LocalStorageProvider.prototype.initializeConnection).toHaveBeenCalled();
        expect(service.connectionStatus()).toBe(true);
    });

    it('should delegate synchronous methods to LocalStorageProvider', async () => {
        await service.initialize();

        expect(service.setUser(mockUser)).toBe(true);
        expect(service.addWeight(mockWeights[0])).toBe(true);
        expect(service.deleteWeight(1)).toBe(true);
        expect(service.updateWeight(mockWeights[0])).toBe(true);
    });

    it('should delegate asynchronous methods to LocalStorageProvider', async () => {
        await service.initialize();

        await expect(service.getWeights()).resolves.toEqual(mockWeights);
        await expect(service.getUser()).resolves.toEqual(mockUser);
        await expect(service.getGoal()).resolves.toEqual(mockGoal);
        await expect(service.exportDataCSV(mockCSV)).resolves.toBeUndefined();
    });

    it('should not set connectionStatus true if initializeConnection fails', async () => {
        jest.spyOn(LocalStorageProvider.prototype, 'initializeConnection').mockResolvedValue(false);
        service = new DataProviderService();
        await service.initialize();
        expect(service.connectionStatus()).toBe(false);
    });

    it('should initialize DBConnection in production and delegate all methods', async () => {
        environment.production = true;
        jest.spyOn(SQLiteDataProvider.prototype, 'initializeConnection').mockResolvedValue(true);
        jest.spyOn(SQLiteDataProvider.prototype, 'getWeights').mockResolvedValue(mockWeights);
        jest.spyOn(SQLiteDataProvider.prototype, 'getUser').mockResolvedValue(mockUser);
        jest.spyOn(SQLiteDataProvider.prototype, 'getGoal').mockResolvedValue(mockGoal);
        jest.spyOn(SQLiteDataProvider.prototype, 'setUser').mockReturnValue(true);
        jest.spyOn(SQLiteDataProvider.prototype, 'addWeight').mockReturnValue(true);
        jest.spyOn(SQLiteDataProvider.prototype, 'deleteWeight').mockReturnValue(true);
        jest.spyOn(SQLiteDataProvider.prototype, 'updateWeight').mockReturnValue(true);
        jest.spyOn(SQLiteDataProvider.prototype, 'exportDataCSV').mockResolvedValue(undefined);

        service = new DataProviderService();
        await service.initialize();

        expect(service.connectionStatus()).toBe(true);
        expect(service.setUser(mockUser)).toBe(true);
        expect(service.addWeight(mockWeights[0])).toBe(true);
        expect(service.deleteWeight(1)).toBe(true);
        expect(service.updateWeight(mockWeights[0])).toBe(true);
        await expect(service.getWeights()).resolves.toEqual(mockWeights);
        await expect(service.getUser()).resolves.toEqual(mockUser);
        await expect(service.getGoal()).resolves.toEqual(mockGoal);
        await expect(service.exportDataCSV(mockCSV)).resolves.toBeUndefined();
    });
});
