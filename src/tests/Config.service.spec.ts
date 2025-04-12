import { ConfigService } from '@services/Config.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { User } from '@models/types/User';

describe('ConfigService', () => {
    let service: ConfigService;
    let dataProviderMock: jest.Mocked<DataProviderService>;

    const mockUser: User = {
        name: 'Test',
        age: 30,
        height: 170,
        gender: 'male' as any,
        email: 'test@test.com',
        goal_weight: 65,
        goal_units: 'kg' as any,
        goal_date: new Date('2025-06-01'),
    };

    beforeEach(() => {
        dataProviderMock = {
            getUser: jest.fn().mockResolvedValue(mockUser),
            setUser: jest.fn(),
            // You can extend this mock if ConfigService adds more dependencies
        } as any;

        service = new ConfigService(dataProviderMock);
    });

    it('should initialize the isUser signal as false', () => {
        expect(service.subscribe()()).toBe(false);
    });

    it('should fetch the user from the DataProvider', async () => {
        const user = await service.getUser();
        expect(dataProviderMock.getUser).toHaveBeenCalled();
        expect(user).toEqual(mockUser);
    });

    it('should set the user and update the isUser signal to true', () => {
        const before = service.subscribe()();

        service.setUser(mockUser);

        const after = service.subscribe()();

        expect(dataProviderMock.setUser).toHaveBeenCalledWith(mockUser);
        expect(before).toBe(false);
        expect(after).toBe(true);
    });

    it('should return a signal function from subscribe()', () => {
        const signal = service.subscribe();
        expect(typeof signal).toBe('function');
        expect(signal()).toBe(false);
    });
});
