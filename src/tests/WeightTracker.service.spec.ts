/// <reference types="jest" />
import { expect } from '@jest/globals';
import { filter, firstValueFrom } from 'rxjs';

import { WeightTrackerService } from '@services/WeightTracker.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { Weight, WeightUnits } from '@models/types/Weight.type';

describe('WeightTrackerService (Unit Tests with Jest)', () => {
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
        service.getWeights(); // Llamamos a la actualización
        const weights = await firstValueFrom(service.weights$.pipe(
            filter(w => w.length > 0)
        ));
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
        service.getWeights(); // Asegura que se actualicen los datos
        const lastWeight = await firstValueFrom(service.lastWeight$.pipe(
            filter(w => w !== undefined)
        ));
        const firstWeight = await firstValueFrom(service.firstWeight$.pipe(
            filter(w => w !== undefined)
        ));
        expect(lastWeight).toEqual(sampleWeights[0]);
        expect(firstWeight).toEqual(sampleWeights[1]);
    });
});
