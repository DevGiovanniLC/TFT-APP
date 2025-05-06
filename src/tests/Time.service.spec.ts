import { TimeService } from '../app/services/Time.service';
import { environment } from '@envs/environment';

describe('TimeService', () => {
    let service: TimeService;

    beforeEach(() => {
        service = new TimeService();
    });

    it('should return the fixed date when environment.testing is true', () => {
        // @ts-ignore: override testing flag for test simulation
        environment.testing = true;

        const result = service.now();
        expect(result.toISOString()).toBe('2025-05-30T17:54:12.535Z');
    });

    it('should return the current date when environment.testing is false', () => {
        // @ts-ignore: override testing flag for test simulation
        environment.testing = false;

        const result = service.now();
        const now = new Date();

        // Ensure the returned date is within 1 second of the actual current time
        expect(Math.abs(result.getTime() - now.getTime()) < 1000).toBe(true);
    });

    it('should always return a valid Date instance', () => {
        // Check under both conditions
        for (const flag of [true, false]) {
            // @ts-ignore
            environment.testing = flag;
            const result = service.now();
            expect(result instanceof Date).toBe(true);
            expect(result.toString()).not.toBe('Invalid Date');
        }
    });

    it('should be consistent during testing: multiple calls return same date', () => {
        // @ts-ignore
        environment.testing = true;
        const first = service.now();
        const second = service.now();

        expect(first.getTime()).toBe(second.getTime());
    });

    it('should return increasing times during real mode', () => {
        // @ts-ignore
        environment.testing = false;

        const first = service.now();
        const delay = 10; // milliseconds
        const second = new Promise<Date>((resolve) => setTimeout(() => resolve(service.now()), delay));

        return second.then((later) => {
            expect(later.getTime()).toBeGreaterThanOrEqual(first.getTime());
        });
    });
});
