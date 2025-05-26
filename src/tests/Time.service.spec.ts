/// <reference types="jest" />
import { expect } from '@jest/globals';
import { TimeService } from '../app/services/Time.service';
import { environment } from '@envs/environment';

describe('TimeService (Unit Tests with Jest)', () => {
    let service: TimeService;

    beforeEach(() => {
        service = new TimeService();
    });

    it('should return the fixed date when environment.testing is true', () => {
        environment.testing = true;
        const result = service.now();
        expect(result.toISOString()).toBe('2025-05-30T17:54:12.535Z');
    });

    it('should return the current date when environment.testing is false', () => {
        environment.testing = false;
        const result = service.now();
        const now = new Date();
        expect(Math.abs(result.getTime() - now.getTime()) < 1000).toBe(true);
    });

    it('should always return a valid Date instance', () => {
        for (const flag of [true, false]) {
            environment.testing = flag;
            const result = service.now();
            expect(result instanceof Date).toBe(true);
            expect(result.toString()).not.toBe('Invalid Date');
        }
    });

    it('should be consistent during testing: multiple calls return same date', () => {
        environment.testing = true;
        const first = service.now();
        const second = service.now();
        expect(first.getTime()).toBe(second.getTime());
    });

    it('should return increasing times during real mode', () => {
        environment.testing = false;
        const first = service.now();
        const delay = 10;
        return new Promise<Date>((resolve) => setTimeout(() => resolve(service.now()), delay))
            .then((later) => {
                expect(later.getTime()).toBeGreaterThanOrEqual(first.getTime());
            });
    });

    it('should define MS_PER_DAY, MS_PER_WEEK, and MS_PER_MONTH correctly', () => {
        expect(TimeService.MS_PER_DAY).toBe(86400000);
        expect(TimeService.MS_PER_WEEK).toBe(86400000 * 7);
        expect(TimeService.MS_PER_MONTH).toBeCloseTo(86400000 * 30.44, 2);
    });

    it('getTime should handle Date, string, undefined, null, and 0', () => {
        const date = new Date('2024-01-01T00:00:00Z');
        const dateStr = '2024-01-01T00:00:00Z';
        expect(TimeService.getTime(date)).toBe(date.getTime());
        expect(TimeService.getTime(dateStr)).toBe(date.getTime());
        expect(TimeService.getTime(undefined)).toBe(0);
        expect(TimeService.getTime(null as any)).toBe(0);
        expect(TimeService.getTime(0 as any)).toBe(new Date(0).getTime());
    });

    it('isSameDay should identify same and different days', () => {
        const date1 = new Date('2024-05-30T10:00:00');
        const date2 = new Date('2024-05-30T23:59:59');
        const date3 = new Date('2024-05-31T00:00:00');
        const date4 = new Date('2023-05-30T10:00:00');

        expect(service.isSameDay(date1, date2)).toBe(true);
        expect(service.isSameDay(date1, date3)).toBe(false);
        expect(service.isSameDay(date1, date4)).toBe(false);
        expect(service.isSameDay(null as any, date2)).toBe(false);
        expect(service.isSameDay(date1, null as any)).toBe(false);
        expect(service.isSameDay(undefined as any, undefined as any)).toBe(false);
    });

    it('should calculate weekDifference, monthDifference, and dayDifference correctly', () => {
        const start = new Date('2024-01-01');
        const end = new Date('2024-01-15');
        expect(service.weekDifference(start, end)).toBeCloseTo(2, 1);
        expect(service.monthDifference(start, end)).toBeCloseTo(0.46, 1);
        expect(service.dayDifference(start, end)).toBe(14);
    });

    it('dateDifference should return 0 if start or end is invalid', () => {
        const end = new Date('2024-01-01');
        expect(service['dateDifference'](undefined as any, end, 1)).toBe(0);
        expect(service['dateDifference'](end, undefined as any, 1)).toBe(0);
        expect(service['dateDifference'](undefined as any, undefined as any, 1)).toBe(0);
    });

    it('dateDifference should handle negative differences', () => {
        const start = new Date('2024-01-10');
        const end = new Date('2024-01-01');
        expect(service.dayDifference(start, end)).toBeLessThan(0);
    });

    it('dateDifference should handle custom divisors', () => {
        const start = new Date('2024-01-01');
        const end = new Date('2024-01-02');
        expect(service['dateDifference'](start, end, 1000)).toBeCloseTo(86400, 0); // in seconds
    });

    it('should handle weird input types in getTime gracefully', () => {
        expect(TimeService.getTime({} as any)).toBeNaN();
        expect(TimeService.getTime([] as any)).toBeNaN();
    });

    it('should handle very large date differences', () => {
        const start = new Date('2000-01-01');
        const end = new Date('2050-01-01');
        expect(service.monthDifference(start, end)).toBeGreaterThan(599);
    });
});
