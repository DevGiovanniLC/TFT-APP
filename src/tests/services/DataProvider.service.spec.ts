import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';

// Mocks
jest.mock('@services/data-providers/DBConnection');
jest.mock('@services/data-providers/LocalStorageProvider');

import DBConnection from '@services/data-providers/DBConnection';
import LocalStorageProvider from '@services/data-providers/LocalStorageProvider';
import { environment } from '@envs/environment';

describe('DataProviderService', () => {
    let service: DataProviderService;

    const mockWeight: Weight = { weight: 70, date: new Date(), weight_units: 'kg' as any };
    const mockUser: User = { name: 'Test', age: 30, height: 170, gender: 'male' as any, email: 'test@test.com', goal_weight: 65, goal_units: 'kg' as any, goal_date: new Date() };

    const dataProviderMock = {
        initializeConnection: jest.fn(),
        getWeights: jest.fn().mockResolvedValue([mockWeight]),
        getGoal: jest.fn().mockResolvedValue(mockWeight),
        getUser: jest.fn().mockResolvedValue(mockUser),
        setUser: jest.fn(),
        addWeight: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new DataProviderService();
    });

    describe('en entorno de desarrollo', () => {
        beforeEach(async () => {
            (environment as any).production = false;
            (LocalStorageProvider as any).mockImplementation(() => dataProviderMock);

            await service.initialize();
        });

        it('Debería usar LocalStorageProvider en desarrollo', async () => {
            expect(LocalStorageProvider).toHaveBeenCalled();
            expect(dataProviderMock.initializeConnection).toHaveBeenCalled();
            expect(service.isConnected()).toBe(true);
        });

        it('Debería delegar getWeights al proveedor', async () => {
            const weights = await service.getWeights();
            expect(dataProviderMock.getWeights).toHaveBeenCalled();
            expect(weights).toEqual([mockWeight]);
        });

        it('Debería delegar getGoal al proveedor', async () => {
            const goal = await service.getGoal();
            expect(goal).toEqual(mockWeight);
        });

        it('Debería delegar getUser al proveedor', async () => {
            const user = await service.getUser();
            expect(user).toEqual(mockUser);
        });

        it('Debería delegar setUser al proveedor', () => {
            service.setUser(mockUser);
            expect(dataProviderMock.setUser).toHaveBeenCalledWith(mockUser);
        });

        it('Debería delegar addWeight al proveedor', () => {
            service.addWeight(mockWeight);
            expect(dataProviderMock.addWeight).toHaveBeenCalledWith(mockWeight);
        });
    });

    describe('en entorno de producción', () => {
        beforeEach(async () => {
            (environment as any).production = true;
            (DBConnection as any).mockImplementation(() => dataProviderMock);

            await service.initialize();
        });

        it('Debería usar DBConnection en producción', async () => {
            expect(DBConnection).toHaveBeenCalled();
            expect(dataProviderMock.initializeConnection).toHaveBeenCalled();
            expect(service.isConnected()).toBe(true);
        });
    });
});
