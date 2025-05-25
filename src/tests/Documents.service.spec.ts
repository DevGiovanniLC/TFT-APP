/// <reference types="jest" />
import { expect } from '@jest/globals';
import { DocumentsService } from '@services/Documents.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { User, Gender } from '@models/types/User.type';
import { Weight, WeightUnits } from '@models/types/Weight.type';
import Papa from 'papaparse';

jest.mock('papaparse');

describe('DocumentsService', () => {
    let service: DocumentsService;
    let dataProviderMock: jest.Mocked<DataProviderService>;

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
        jest.clearAllMocks(); // 🔥 Esto resetea los contadores de todos los mocks
        dataProviderMock = {
            getUser: jest.fn(),
            getWeights: jest.fn(),
            exportDataCSV: jest.fn()
        } as unknown as jest.Mocked<DataProviderService>;

        (Papa.unparse as jest.Mock).mockImplementation((data: any) => {
            return JSON.stringify(data);
        });

        service = new DocumentsService(dataProviderMock);
    });


    it('should export CSV when user and weights are available', async () => {
        dataProviderMock.getUser.mockResolvedValue(mockUser);
        dataProviderMock.getWeights.mockResolvedValue(mockWeights);

        await service.exportAllDataToCSV();

        expect(dataProviderMock.getUser).toHaveBeenCalled();
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
        expect(Papa.unparse).toHaveBeenCalledTimes(2);
        expect(dataProviderMock.exportDataCSV).toHaveBeenCalled();
        const csvContent = dataProviderMock.exportDataCSV.mock.calls[0][0];
        expect(csvContent).toContain('# User Data');
        expect(csvContent).toContain('# Weights Data');
    });

    it('should not export CSV if user is undefined', async () => {
        dataProviderMock.getUser.mockResolvedValue(undefined);
        dataProviderMock.getWeights.mockResolvedValue(mockWeights);

        await service.exportAllDataToCSV();

        expect(dataProviderMock.exportDataCSV).not.toHaveBeenCalled();
    });

    it('should not export CSV if weights is empty', async () => {
        dataProviderMock.getUser.mockResolvedValue(mockUser);
        dataProviderMock.getWeights.mockResolvedValue([]);

        await service.exportAllDataToCSV();

        expect(dataProviderMock.exportDataCSV).not.toHaveBeenCalled();
    });

    it('should build correct CSV format', () => {
        const csv = (service as any).buildCSV(mockUser, mockWeights);
        expect(Papa.unparse).toHaveBeenCalledTimes(2);
        expect(csv).toContain('# User Data');
        expect(csv).toContain('# Weights Data');
        expect(typeof csv).toBe('string');
    });

    it('should include GoalDate and GoalWeight in the user CSV', () => {
        (service as any).buildCSV(mockUser, mockWeights);
        const userData = (Papa.unparse as jest.Mock).mock.calls[0][0][0];
        expect(userData.GoalDate).toBe('2024-12-31');
        expect(userData.GoalWeight).toBe(65);
    });

    it('should format dates correctly in the weights CSV', () => {
        (service as any).buildCSV(mockUser, mockWeights);
        const weightsData = (Papa.unparse as jest.Mock).mock.calls[1][0];
        expect(weightsData[0].Date).toBe('2024-01-01');
        expect(weightsData[1].Date).toBe('2024-02-01');
    });
});
