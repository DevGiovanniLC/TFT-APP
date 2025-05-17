/// <reference types="jest" />
import { expect } from '@jest/globals';
import { firstValueFrom } from 'rxjs';

import { WeightTrackerService } from '@services/WeightTracker.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { Weight, WeightUnits } from '@models/types/Weight';
import { User, Gender } from '@models/types/User';

describe('WeightTrackerService (Unit Tests with Jest)', () => {
    let service: WeightTrackerService;
    let dataProviderMock: jest.Mocked<DataProviderService>;
    let calcFunctionsMock: jest.Mocked<WeightAnalysisService>;

    const sampleWeights: Weight[] = [
        { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG }
    ];
    const sampleUser: User = {
        name: 'Test',
        age: 25,
        height: 170,
        gender: Gender.OTHER,
        email: 'test@example.com',
        goal_weight: 75,
        goal_units: WeightUnits.KG,
        goal_date: new Date('2024-12-31')
    };
    const sampleCSV = 'id,weight,date,weight_units';

    beforeEach(() => {
        dataProviderMock = {
            getWeights: jest.fn().mockResolvedValue(sampleWeights),
            getUser: jest.fn().mockResolvedValue(sampleUser as any),
            addWeight: jest.fn(),
            deleteWeight: jest.fn(),
            updateWeight: jest.fn(),
            exportDataCSV: jest.fn()
        } as unknown as jest.Mocked<DataProviderService>;

        calcFunctionsMock = {
            parseDataToCSV: jest.fn().mockResolvedValue(sampleCSV)
        } as unknown as jest.Mocked<WeightAnalysisService>;

        service = new WeightTrackerService(dataProviderMock, calcFunctionsMock);
    });

    it('should fetch and emit weights in getWeights()', async () => {
        const obs = service.getWeights();
        const result = await firstValueFrom(obs);
        expect(result).toEqual(sampleWeights);
        expect((service as any).weightsSubject.getValue()).toEqual(sampleWeights);
    });

    it('should emit last weight via getLastWeight()', async () => {
        (service as any).weightsSubject.next(sampleWeights);
        const result = await firstValueFrom(service.getLastWeight());
        expect(result).toEqual(sampleWeights[0]);
        expect((service as any).lastWeightSubject.getValue()).toEqual(sampleWeights[0]);
    });

    it('should emit first weight via getFirstWeight()', async () => {
        (service as any).weightsSubject.next(sampleWeights);
        const result = await firstValueFrom(service.getFirstWeight());
        expect(result).toEqual(sampleWeights[sampleWeights.length - 1]);
        expect((service as any).firstWeightSubject.getValue()).toEqual(sampleWeights[sampleWeights.length - 1]);
    });

    it('should add weight and refresh weights', () => {
        dataProviderMock.addWeight.mockReturnValue(true);
        dataProviderMock.getWeights.mockResolvedValue(sampleWeights);
        service.addWeight(sampleWeights[0]);
        expect(dataProviderMock.addWeight).toHaveBeenCalledWith(sampleWeights[0]);
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
    });

    it('should delete weight and refresh weights', () => {
        dataProviderMock.deleteWeight.mockReturnValue(true);
        dataProviderMock.getWeights.mockResolvedValue(sampleWeights);
        service.deleteWeight(1);
        expect(dataProviderMock.deleteWeight).toHaveBeenCalledWith(1);
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
    });

    it('should update weight and refresh weights', () => {
        dataProviderMock.updateWeight.mockReturnValue(true);
        dataProviderMock.getWeights.mockResolvedValue(sampleWeights);
        service.updateWeight(sampleWeights[1]);
        expect(dataProviderMock.updateWeight).toHaveBeenCalledWith(sampleWeights[1]);
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
    });

    it('should export CSV when user and weights exist', async () => {
        await service.exportDataCSV();
        expect(dataProviderMock.getUser).toHaveBeenCalled();
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
        expect(calcFunctionsMock.parseDataToCSV).toHaveBeenCalledWith(sampleUser, sampleWeights);
        expect(dataProviderMock.exportDataCSV).toHaveBeenCalledWith(sampleCSV);
    });

    it('should not export CSV if no user', async () => {
        dataProviderMock.getUser.mockResolvedValue(undefined);
        await service.exportDataCSV();
        expect(calcFunctionsMock.parseDataToCSV).not.toHaveBeenCalled();
        expect(dataProviderMock.exportDataCSV).not.toHaveBeenCalled();
    });

    it('should not export CSV if no weights', async () => {
        dataProviderMock.getWeights.mockResolvedValue(undefined as any);
        await service.exportDataCSV();
        expect(calcFunctionsMock.parseDataToCSV).not.toHaveBeenCalled();
        expect(dataProviderMock.exportDataCSV).not.toHaveBeenCalled();
    });
});
