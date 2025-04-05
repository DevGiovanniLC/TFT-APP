import { WeightTrackerService } from '@services/WeightTracker.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { Weight, WeightUnits } from '@models/types/Weight';

describe('WeightTrackerService', () => {
    let service: WeightTrackerService;
    let dataProviderMock: jest.Mocked<DataProviderService>;

    const mockWeights: Weight[] = [
        { weight: 66, date: new Date('2023-03-01'), weight_units: WeightUnits.KG },
        { weight: 68, date: new Date('2023-02-01'), weight_units: WeightUnits.KG },
        { weight: 70, date: new Date('2023-01-01'), weight_units: WeightUnits.KG },
    ];

    const mockGoal: Weight = { weight: 65, date: new Date('2023-03-01'), weight_units: WeightUnits.KG };

    beforeEach(() => {
        dataProviderMock = {
            getWeights: jest.fn().mockResolvedValue([...mockWeights]),
            getGoal: jest.fn().mockResolvedValue({ ...mockGoal }),
            addWeight: jest.fn().mockResolvedValue(true),
            isConnected: jest.fn().mockReturnValue(true),
        } as any;

        service = new WeightTrackerService(dataProviderMock);
    });

    it('Debería obtener y ordenar los pesos por fecha', async () => {
        const weights = await service.getWeights();
        expect(dataProviderMock.getWeights).toHaveBeenCalled();

        expect(weights.length).toBe(3);

        expect(weights[0].date instanceof Date).toBe(true);

        expect(weights[0].weight).toBe(70);
        expect(weights[1].weight).toBe(68);
    });

    it('Debería devolver el peso más reciente', async () => {
        const actual = await service.getActualWeight();
        expect(actual.weight).toBe(66);
    });

    it('Debería devolver el objetivo con la fecha como objeto Date', async () => {
        const goal = await service.getGoal();
        expect(goal.weight).toBe(65);
        expect(goal.date instanceof Date).toBe(true);
    });

    it('Debería agregar un nuevo peso y llamar al proveedor de datos', async () => {
        const newWeight: Weight = {
            weight: 65,
            date: new Date('2023-03-10'),
            weight_units: WeightUnits.KG,
        };

        await service.addWeight(newWeight);

        expect(dataProviderMock.addWeight).toHaveBeenCalledWith(newWeight);
    });

    it('Debería indicar si el servicio está disponible', () => {
        expect(service.isAvailable()).toBe(true);
        expect(dataProviderMock.isConnected).toHaveBeenCalled();
    });
});
