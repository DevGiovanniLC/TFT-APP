/// <reference types="jest" />
import { expect } from '@jest/globals';
import { filter, firstValueFrom, take } from 'rxjs';

import { WeightTrackerService } from '@services/WeightTracker.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { Weight, WeightUnits } from '@models/types/Weight.type';

describe('WeightTrackerService (Expanded Unit Tests with Jest)', () => {
    let service: WeightTrackerService;
    let dataProviderMock: jest.Mocked<DataProviderService>;

    const sampleWeights: Weight[] = [
        { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG }
    ];

    beforeEach(() => {
        dataProviderMock = {
            getWeights: jest.fn().mockResolvedValue(sampleWeights),
            addWeight: jest.fn().mockResolvedValue(true),
            deleteWeight: jest.fn().mockResolvedValue(true),
            updateWeight: jest.fn().mockResolvedValue(true),
        } as any;

        service = new WeightTrackerService(dataProviderMock);
    });

    it('should initialize with default weights as an empty array', async () => {
        const weights = await firstValueFrom(service.weights$);
        expect(weights).toEqual([]);
    });

    it('should fetch weights and update weightsSubject on getWeights()', async () => {
        service.getWeights();
        const weights = await firstValueFrom(service.weights$.pipe(filter(w => w.length > 0)));
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
        expect(weights).toEqual(sampleWeights);
    });

    it('should set eventTriggered to ADD when addWeight is called', async () => {
        service.addWeight(sampleWeights[0]);
        expect(service.eventTriggered).toBe(service.EventTrigger.ADD);
        expect(dataProviderMock.addWeight).toHaveBeenCalledWith(sampleWeights[0]);
    });

    it('should set eventTriggered to DELETE when deleteWeight is called', async () => {
        service.deleteWeight(1);
        expect(service.eventTriggered).toBe(service.EventTrigger.DELETE);
        expect(dataProviderMock.deleteWeight).toHaveBeenCalledWith(1);
    });

    it('should set eventTriggered to UPDATE when updateWeight is called', async () => {
        service.updateWeight(sampleWeights[0]);
        expect(service.eventTriggered).toBe(service.EventTrigger.UPDATE);
        expect(dataProviderMock.updateWeight).toHaveBeenCalledWith(sampleWeights[0]);
    });

    it('should return true if the last event matches EventTrigger', () => {
        service.eventTriggered = service.EventTrigger.ADD;
        expect(service.isLastEvent(service.EventTrigger.ADD)).toBe(true);
        expect(service.isLastEvent(service.EventTrigger.DELETE)).toBe(false);
    });

    it('should correctly emit firstWeight$ and lastWeight$', async () => {
        service.getWeights();
        const lastWeight = await firstValueFrom(service.lastWeight$.pipe(filter(w => w !== undefined)));
        const firstWeight = await firstValueFrom(service.firstWeight$.pipe(filter(w => w !== undefined)));
        expect(lastWeight).toEqual(sampleWeights[0]);
        expect(firstWeight).toEqual(sampleWeights[1]);
    });

    it('should handle empty weights array', async () => {
        dataProviderMock.getWeights.mockResolvedValueOnce([]);
        service.getWeights();
        const weights = await firstValueFrom(service.weights$.pipe(filter(w => w !== null), take(1)));
        expect(weights).toEqual([]);
    });

    it('should update weights$ after adding a new weight', async () => {
        const newWeight: Weight = { id: 3, date: new Date('2024-03-01'), weight: 76, weight_units: WeightUnits.KG };
        dataProviderMock.getWeights.mockResolvedValueOnce([...sampleWeights, newWeight]);
        service.addWeight(newWeight);
        const weights = await firstValueFrom(service.weights$.pipe(filter(w => w.length > 2)));
        expect(weights).toContainEqual(newWeight);
    });

    it('should update weights$ after deleting a weight', async () => {
        dataProviderMock.getWeights.mockResolvedValueOnce(sampleWeights.slice(1));
        service.deleteWeight(sampleWeights[0].id ?? 0);
        const weights = await firstValueFrom(service.weights$.pipe(filter(w => w.length === 1)));
        expect(weights).toEqual([sampleWeights[1]]);
    });

    it('should update weights$ after updating a weight', async () => {
        const updatedWeight: Weight = { ...sampleWeights[0], weight: 85 };
        dataProviderMock.getWeights.mockResolvedValueOnce([updatedWeight, sampleWeights[1]]);
        service.updateWeight(updatedWeight);
        const weights = await firstValueFrom(service.weights$.pipe(filter(w => w[0]?.weight === 85)));
        expect(weights[0]).toEqual(updatedWeight);
    });

    it('should emit updated weights on multiple actions', async () => {
        const newWeight: Weight = { id: 3, date: new Date(), weight: 75, weight_units: WeightUnits.KG };
        const updatedWeights = [...sampleWeights, newWeight];
        dataProviderMock.getWeights.mockResolvedValueOnce(updatedWeights);
        service.addWeight(newWeight);
        const weightsAfterAdd = await firstValueFrom(service.weights$.pipe(filter(w => w.length === 3)));
        expect(weightsAfterAdd).toEqual(updatedWeights);

        dataProviderMock.getWeights.mockResolvedValueOnce(updatedWeights.filter(w => w.id !== newWeight.id));
        service.deleteWeight(newWeight.id ?? 0);
        const weightsAfterDelete = await firstValueFrom(service.weights$.pipe(filter(w => w.length === 2)));
        expect(weightsAfterDelete).toEqual(sampleWeights);
    });
});
