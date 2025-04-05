import { ConfigService } from '@services/Config.service';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { User } from '@models/types/User';

describe('ConfigService', () => {
    let service: ConfigService;
    let dataProviderMock: jest.Mocked<DataProviderService>;

    const mockUser: User = { name: 'Test', age: 30, height: 170, gender: 'male' as any, email: 'test@test.com', goal_weight: 65, goal_units: 'kg' as any, goal_date: new Date() };

    beforeEach(() => {
        dataProviderMock = {
            getUser: jest.fn().mockResolvedValue(mockUser),
            setUser: jest.fn(),
            // Se pueden agregar más si se expanden los métodos
        } as any;

        service = new ConfigService(dataProviderMock);
    });

    it('Debería inicializar la señal isUser en false', () => {
        expect(service.subscribe()()).toBe(false);
    });

    it('Debería obtener el usuario desde el DataProvider', async () => {
        const user = await service.getUser();
        expect(dataProviderMock.getUser).toHaveBeenCalled();
        expect(user).toEqual(mockUser);
    });

    it('Debería establecer el usuario y actualizar isUser', () => {
        const before = service.subscribe()();
        service.setUser(mockUser);
        const after = service.subscribe()();

        expect(dataProviderMock.setUser).toHaveBeenCalledWith(mockUser);
        expect(before).toBe(false);
        expect(after).toBe(true);
    });

    it('Debería retornar la señal para suscribirse', () => {
        const signal = service.subscribe();
        expect(typeof signal).toBe('function');
        expect(signal()).toBe(false);
    });
});
