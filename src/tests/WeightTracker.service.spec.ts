/// <reference types="jest" />
import { expect } from '@jest/globals';
import { filter, firstValueFrom, take } from 'rxjs';

import { WeightTrackerService } from '@services/WeightTracker.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { Weight, WeightUnits } from '@models/types/Weight.type';

describe('WeightTrackerService (Unit Tests with Jest)', () => {
    let service: WeightTrackerService;
    let dataProviderMock: jest.Mocked<DataProviderService>;

    // Muestra de datos de peso para pruebas
    const sampleWeights: Weight[] = [
        { id: 1, date: new Date('2024-01-01'), weight: 80, weight_units: WeightUnits.KG },
        { id: 2, date: new Date('2024-02-01'), weight: 78, weight_units: WeightUnits.KG },
    ];

    beforeEach(() => {
        // Configuramos mocks del DataProvider con resultados iniciales
        dataProviderMock = {
            getWeights: jest.fn().mockResolvedValue(sampleWeights),
            addWeight: jest.fn().mockResolvedValue(true),
            deleteWeight: jest.fn().mockResolvedValue(true),
            updateWeight: jest.fn().mockResolvedValue(true),
        } as any;

        // Instanciamos el servicio con el mock
        service = new WeightTrackerService(dataProviderMock);
    });

    it('should initialize with default weights as an empty array', async () => {
        // Inicialmente, el observable weights$ debe emitir array vacío
        const weights = await firstValueFrom(service.weights$);
        expect(weights).toEqual([]);
    });

    it('should fetch weights and update weightsSubject on getWeights()', async () => {
        // Llamada a getWeights() debe invocar al provider y actualizar weights$
        service.getWeights();
        const weights = await firstValueFrom(service.weights$.pipe(filter((w) => w.length > 0)));
        expect(dataProviderMock.getWeights).toHaveBeenCalled();
        expect(weights).toEqual(sampleWeights);
    });

    it('should set eventTriggered to ADD when addWeight is called', async () => {
        // Al añadir peso, eventTriggered debe ser ADD y llamarse addWeight en provider
        service.addWeight(sampleWeights[0]);
        expect(service.eventTriggered).toBe(service.EventTrigger.ADD);
        expect(dataProviderMock.addWeight).toHaveBeenCalledWith(sampleWeights[0]);
    });

    it('should set eventTriggered to DELETE when deleteWeight is called', async () => {
        // Al eliminar peso, eventTriggered debe ser DELETE
        service.deleteWeight(1);
        expect(service.eventTriggered).toBe(service.EventTrigger.DELETE);
        expect(dataProviderMock.deleteWeight).toHaveBeenCalledWith(1);
    });

    it('should set eventTriggered to UPDATE when updateWeight is called', async () => {
        // Al actualizar peso, eventTriggered debe ser UPDATE
        service.updateWeight(sampleWeights[0]);
        expect(service.eventTriggered).toBe(service.EventTrigger.UPDATE);
        expect(dataProviderMock.updateWeight).toHaveBeenCalledWith(sampleWeights[0]);
    });

    it('should return true if the last event matches EventTrigger', () => {
        // isLastEvent refleja correctamente el último evento disparado
        service.eventTriggered = service.EventTrigger.ADD;
        expect(service.isLastEvent(service.EventTrigger.ADD)).toBe(true);
        expect(service.isLastEvent(service.EventTrigger.DELETE)).toBe(false);
    });

    it('should correctly emit firstWeight$ and lastWeight$', async () => {
        // Tras getWeights(), lastWeight$ emite primer elemento, firstWeight$ el último
        service.getWeights();
        const lastWeight = await firstValueFrom(service.lastWeight$.pipe(filter((w) => w !== undefined)));
        const firstWeight = await firstValueFrom(service.firstWeight$.pipe(filter((w) => w !== undefined)));
        expect(lastWeight).toEqual(sampleWeights[0]);
        expect(firstWeight).toEqual(sampleWeights[1]);
    });

    it('should handle empty weights array', async () => {
        // Si getWeights retorna array vacío, weights$ emite []
        dataProviderMock.getWeights.mockResolvedValueOnce([]);
        service.getWeights();
        const weights = await firstValueFrom(
            service.weights$.pipe(
                filter((w) => w !== null),
                take(1)
            )
        );
        expect(weights).toEqual([]);
    });

    it('should update weights$ after adding a new weight', async () => {
        // Añadir nuevo peso provoca nueva emisión con elemento incluido
        const newWeight: Weight = { id: 3, date: new Date('2024-03-01'), weight: 76, weight_units: WeightUnits.KG };
        dataProviderMock.getWeights.mockResolvedValueOnce([...sampleWeights, newWeight]);
        service.addWeight(newWeight);
        const weights = await firstValueFrom(service.weights$.pipe(filter((w) => w.length > 2)));
        expect(weights).toContainEqual(newWeight);
    });

    it('should update weights$ after deleting a weight', async () => {
        // Eliminar peso provoca emisión sin ese elemento
        dataProviderMock.getWeights.mockResolvedValueOnce(sampleWeights.slice(1));
        service.deleteWeight(sampleWeights[0].id ?? 0);
        const weights = await firstValueFrom(service.weights$.pipe(filter((w) => w.length === 1)));
        expect(weights).toEqual([sampleWeights[1]]);
    });

    it('should update weights$ after updating a weight', async () => {
        // Actualizar peso provoca cambio en la emisión
        const updatedWeight: Weight = { ...sampleWeights[0], weight: 85 };
        dataProviderMock.getWeights.mockResolvedValueOnce([updatedWeight, sampleWeights[1]]);
        service.updateWeight(updatedWeight);
        const weights = await firstValueFrom(service.weights$.pipe(filter((w) => w[0]?.weight === 85)));
        expect(weights[0]).toEqual(updatedWeight);
    });

    it('should emit updated weights on multiple actions', async () => {
        // Secuencia de add y delete refleja emisiones correctas
        const newWeight: Weight = { id: 3, date: new Date(), weight: 75, weight_units: WeightUnits.KG };
        const updatedWeights = [...sampleWeights, newWeight];
        dataProviderMock.getWeights.mockResolvedValueOnce(updatedWeights);
        service.addWeight(newWeight);
        const weightsAfterAdd = await firstValueFrom(service.weights$.pipe(filter((w) => w.length === 3)));
        expect(weightsAfterAdd).toEqual(updatedWeights);

        dataProviderMock.getWeights.mockResolvedValueOnce(updatedWeights.filter((w) => w.id !== newWeight.id));
        service.deleteWeight(newWeight.id ?? 0);
        const weightsAfterDelete = await firstValueFrom(service.weights$.pipe(filter((w) => w.length === 2)));
        expect(weightsAfterDelete).toEqual(sampleWeights);
    });
});
