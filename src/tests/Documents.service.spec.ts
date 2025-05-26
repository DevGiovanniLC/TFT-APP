/// <reference types="jest" />
import { expect } from '@jest/globals';
import { DocumentsService } from '@services/Documents.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { User, Gender } from '@models/types/User.type';
import { Weight, WeightUnits } from '@models/types/Weight.type';
import Papa from 'papaparse';

// Mock de papaparse para controlar la generación de CSV
jest.mock('papaparse');

describe('DocumentsService(Unit Tests with Jest)', () => {
    let service: DocumentsService;
    let dataProviderMock: jest.Mocked<DataProviderService>;

    // Datos de prueba: usuario y registros de peso
    const mockUser: User = {
        name: 'Test User',
        age: 30,
        height: 170,
        gender: Gender.FEMALE,
        email: 'test@example.com',
        goal_weight: 65,
        goal_units: WeightUnits.KG,
        goal_date: new Date('2024-12-31')
    };

    const mockWeights: Weight[] = [
        { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG }
    ];

    beforeEach(() => {
        // Reseteamos los mocks antes de cada test
        jest.clearAllMocks();

        // Creamos un mock de DataProviderService con métodos simulados
        dataProviderMock = {
            getUser: jest.fn(),
            getWeights: jest.fn(),
            exportDataCSV: jest.fn()
        } as unknown as jest.Mocked<DataProviderService>;

        // Simulamos Papa.unparse para devolver JSON de los datos
        (Papa.unparse as jest.Mock).mockImplementation((data: any) => JSON.stringify(data));

        // Instanciamos el servicio a probar
        service = new DocumentsService(dataProviderMock);
    });

    it('should export CSV when user and weights are available', async () => {
        // Configuramos respuestas válidas para usuario y pesos
        dataProviderMock.getUser.mockResolvedValue(mockUser);
        dataProviderMock.getWeights.mockResolvedValue(mockWeights);

        // Ejecutamos la exportación completa
        await service.exportAllDataToCSV();

        // Verificamos llamadas a proveedor y papaparse
        expect(dataProviderMock.getUser).toHaveBeenCalled();
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
        expect(Papa.unparse).toHaveBeenCalledTimes(2);
        expect(dataProviderMock.exportDataCSV).toHaveBeenCalled();

        // Comprobamos que el contenido CSV incluya las secciones esperadas
        const csvContent = dataProviderMock.exportDataCSV.mock.calls[0][0];
        expect(csvContent).toContain('# User Data');
        expect(csvContent).toContain('# Weights Data');
    });

    it('should not export CSV if user is undefined', async () => {
        // Simulamos usuario indefinido
        dataProviderMock.getUser.mockResolvedValue(undefined);
        dataProviderMock.getWeights.mockResolvedValue(mockWeights);

        await service.exportAllDataToCSV();

        // No debe llamar a exportDataCSV si falta usuario
        expect(dataProviderMock.exportDataCSV).not.toHaveBeenCalled();
    });

    it('should not export CSV if weights is empty', async () => {
        // Usuario válido pero sin registros de peso
        dataProviderMock.getUser.mockResolvedValue(mockUser);
        dataProviderMock.getWeights.mockResolvedValue([]);

        await service.exportAllDataToCSV();

        // No debe llamar a exportDataCSV si no hay weights
        expect(dataProviderMock.exportDataCSV).not.toHaveBeenCalled();
    });

    it('should build correct CSV format', () => {
        // Construimos CSV directamente y verificamos formato
        const csv = (service as any).buildCSV(mockUser, mockWeights);
        expect(Papa.unparse).toHaveBeenCalledTimes(2);
        expect(csv).toContain('# User Data');
        expect(csv).toContain('# Weights Data');
        expect(typeof csv).toBe('string');
    });

    it('should include GoalDate and GoalWeight in the user CSV', () => {
        // Verificamos campos adicionales en CSV de usuario
        (service as any).buildCSV(mockUser, mockWeights);
        const userData = (Papa.unparse as jest.Mock).mock.calls[0][0][0];
        expect(userData.GoalDate).toBe('2024-12-31');
        expect(userData.GoalWeight).toBe(65);
    });

    it('should format dates correctly in the weights CSV', () => {
        // Verificamos formato de fechas en CSV de pesos
        (service as any).buildCSV(mockUser, mockWeights);
        const weightsData = (Papa.unparse as jest.Mock).mock.calls[1][0];
        expect(weightsData[0].Date).toBe('2024-01-01');
        expect(weightsData[1].Date).toBe('2024-02-01');
    });
});
