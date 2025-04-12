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

    it('should retrieve and sort weights by descending date', async () => {
        const weights = await service.getWeights();

        expect(weights[0].weight).toBe(70);
        expect(weights[1].weight).toBe(68);
        expect(weights[2].weight).toBe(66);
    });

    it('should return the most recent weight', async () => {
        const actual = await service.getActualWeight();
        expect(actual.weight).toBe(66);
        expect(actual.date.toISOString()).toBe('2023-03-01T00:00:00.000Z');
    });

    it('should return the goal with date as a valid Date object', async () => {
        const goal = await service.getGoal();
        expect(goal.weight).toBe(65);
        expect(goal.date instanceof Date).toBe(true);
    });

    it('should add a new weight successfully', async () => {
        const newWeight: Weight = {
            weight: 64.5,
            date: new Date('2023-03-15'),
            weight_units: WeightUnits.KG,
        };

        await service.addWeight(newWeight);

        expect(dataProviderMock.addWeight).toHaveBeenCalledWith(newWeight);
    });

    it('should add a weight in pounds (WeightUnits.LB)', async () => {
        const newWeight: Weight = {
            weight: 140,
            date: new Date('2023-03-20'),
            weight_units: WeightUnits.LB,
        };

        await service.addWeight(newWeight);

        expect(dataProviderMock.addWeight).toHaveBeenCalledWith(newWeight);
    });

    it('should return true if service is available', () => {
        expect(service.isAvailable()).toBe(true);
        expect(dataProviderMock.isConnected).toHaveBeenCalled();
    });

    it('should return an empty array if no weights are found', async () => {
        dataProviderMock.getWeights.mockResolvedValueOnce([]);

        const weights = await service.getWeights();

        expect(weights).toEqual([]);
    });

    it('should return null if no goal is defined', async () => {
        dataProviderMock.getGoal.mockResolvedValueOnce(null as any);

        const goal = await service.getGoal();

        expect(goal).toBeNull();
    });

    it('should throw an error if retrieving weights fails', async () => {
        dataProviderMock.getWeights.mockRejectedValueOnce(new Error('Failed to fetch weights'));

        await expect(service.getWeights()).rejects.toThrow('Failed to fetch weights');
    });

    it('should throw an error if retrieving goal fails', async () => {
        dataProviderMock.getGoal.mockRejectedValueOnce(new Error('Failed to fetch goal'));

        await expect(service.getGoal()).rejects.toThrow('Failed to fetch goal');
    });
});
