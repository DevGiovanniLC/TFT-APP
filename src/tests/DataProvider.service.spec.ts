/// <reference types="jest" />
import { expect } from '@jest/globals';

import { DataProviderService } from '@services/data-providers/DataProvider.service';
import SQLiteDataProvider from '@services/data-providers/SQLiteDataProvider';
import LocalStorageProvider from '@services/data-providers/LocalStorageProvider';
import { environment } from '@envs/environment';
import { Weight, WeightUnits } from '@models/types/Weight.type';
import { Gender, User } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';

// Mock de proveedores de datos para aislar el comportamiento del servicio
jest.mock('@services/data-providers/SQLiteDataProvider');
jest.mock('@services/data-providers/LocalStorageProvider');

describe('DataProviderService (Unit Tests with Jest)', () => {
    let service: DataProviderService;
    let mockProvider: jest.Mocked<any>;

    // Datos de prueba para peso, usuario y objetivo
    const mockWeight: Weight = { id: 1, weight: 80, date: new Date(), weight_units: WeightUnits.KG };
    const mockUser: User = { name: 'Test', age: 30, email: 'test@test.com', height: 170, gender: Gender.MALE, goal_weight: 75, goal_units: WeightUnits.KG, goal_date: new Date('2024-12-31') };
    const mockGoal: Goal = { weight: mockUser.goal_weight, weight_units: mockUser.goal_units, date: new Date(mockUser.goal_date ?? Date.now()) };

    beforeEach(() => {
        // Limpiamos los mocks y forzamos entorno de desarrollo por defecto
        jest.clearAllMocks();
        (environment as any).production = false;

        // Implementación simulada de LocalStorageProvider con comportamientos por defecto
        (LocalStorageProvider as any).mockImplementation(() => ({
            initializeConnection: jest.fn().mockResolvedValue(true),
            getWeights: jest.fn().mockResolvedValue([mockWeight]),
            getGoal: jest.fn().mockResolvedValue(mockGoal),
            getUser: jest.fn().mockResolvedValue(mockUser),
            setUser: jest.fn().mockResolvedValue(true),
            addWeight: jest.fn().mockResolvedValue(true),
            deleteWeight: jest.fn().mockResolvedValue(true),
            updateWeight: jest.fn().mockResolvedValue(true),
            exportDataCSV: jest.fn().mockResolvedValue(undefined),
        }));

        // Creamos instancia del servicio y obtenemos el provider interno
        service = new DataProviderService();
        mockProvider = (service as any).dataProvider;
    });

    it('should use LocalStorageProvider in development', () => {
        // Verifica que en desarrollo se emplee LocalStorageProvider
        expect(LocalStorageProvider).toHaveBeenCalled();
    });

    it('should initialize connection and set connectionStatus to true', async () => {
        // Inicialización exitosa debe actualizar el estado de conexión
        const result = await service.initialize();
        expect(mockProvider.initializeConnection).toHaveBeenCalled();
        expect(result).toBe(true);
        expect(service['connectionStatus']()).toBe(true);
    });

    it('should delegate getWeights', async () => {
        // getWeights debe delegar la llamada al provider
        const weights = await service.getWeights();
        expect(mockProvider.getWeights).toHaveBeenCalled();
        expect(weights).toEqual([mockWeight]);
    });

    it('should delegate getGoal', async () => {
        // getGoal debe delegar y retornar el objetivo simulado
        const goal = await service.getGoal();
        expect(mockProvider.getGoal).toHaveBeenCalled();
        expect(goal).toEqual(mockGoal);
    });

    it('should delegate getUser', async () => {
        // getUser debe delegar y retornar el usuario simulado
        const user = await service.getUser();
        expect(mockProvider.getUser).toHaveBeenCalled();
        expect(user).toEqual(mockUser);
    });

    it('should delegate setUser', async () => {
        // setUser delega con el objeto usuario
        const result = await service.setUser(mockUser);
        expect(mockProvider.setUser).toHaveBeenCalledWith(mockUser);
        expect(result).toBe(true);
    });

    it('should delegate addWeight', async () => {
        // addWeight delega con el objeto peso
        const result = await service.addWeight(mockWeight);
        expect(mockProvider.addWeight).toHaveBeenCalledWith(mockWeight);
        expect(result).toBe(true);
    });

    it('should delegate deleteWeight', async () => {
        // deleteWeight delega con el id del peso
        const result = await service.deleteWeight(1);
        expect(mockProvider.deleteWeight).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
    });

    it('should delegate updateWeight', async () => {
        // updateWeight delega con el objeto peso actualizado
        const result = await service.updateWeight(mockWeight);
        expect(mockProvider.updateWeight).toHaveBeenCalledWith(mockWeight);
        expect(result).toBe(true);
    });

    it('should delegate exportDataCSV', async () => {
        // exportDataCSV delega con el contenido CSV
        await service.exportDataCSV('csv-content');
        expect(mockProvider.exportDataCSV).toHaveBeenCalledWith('csv-content');
    });

    it('should use SQLiteDataProvider in production', () => {
        // En producción se debe instanciar SQLiteDataProvider
        (environment as any).production = true;
        new DataProviderService();
        expect(SQLiteDataProvider).toHaveBeenCalled();
    });

    // 🔥 Nuevos tests agregados para casos límite y errores

    it('should initialize connection and return false if initialization fails', async () => {
        // Simula fallo en inicialización y verifica estado en false
        mockProvider.initializeConnection.mockResolvedValueOnce(false);
        const result = await service.initialize();
        expect(result).toBe(false);
        expect(service['connectionStatus']()).toBe(false);
    });

    it('should handle getGoal returning undefined', async () => {
        // Manejo de getGoal indefinido debe retornar undefined
        mockProvider.getGoal.mockResolvedValueOnce(undefined);
        const goal = await service.getGoal();
        expect(goal).toBeUndefined();
    });

    it('should handle getUser returning undefined', async () => {
        // Manejo de getUser indefinido debe retornar undefined
        mockProvider.getUser.mockResolvedValueOnce(undefined);
        const user = await service.getUser();
        expect(user).toBeUndefined();
    });

    it('should handle addWeight returning false', async () => {
        // addWeight falso debe propagarse como false
        mockProvider.addWeight.mockResolvedValueOnce(false);
        const result = await service.addWeight(mockWeight);
        expect(result).toBe(false);
    });

    it('should handle deleteWeight returning false', async () => {
        // deleteWeight falso debe propagarse como false
        mockProvider.deleteWeight.mockResolvedValueOnce(false);
        const result = await service.deleteWeight(mockWeight.id!);
        expect(result).toBe(false);
    });

    it('should handle updateWeight returning false', async () => {
        // updateWeight falso debe propagarse como false
        mockProvider.updateWeight.mockResolvedValueOnce(false);
        const result = await service.updateWeight(mockWeight);
        expect(result).toBe(false);
    });

    it('should handle exportDataCSV with empty string', async () => {
        // exportDataCSV con string vacío debe llamar al provider
        await service.exportDataCSV('');
        expect(mockProvider.exportDataCSV).toHaveBeenCalledWith('');
    });
});
