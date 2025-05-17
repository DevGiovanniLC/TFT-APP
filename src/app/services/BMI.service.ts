import { Injectable } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { combineLatest, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class BMIService {
    private readonly user = toSignal(this.userConfig.user$, { initialValue: null });

    readonly bmi$ = combineLatest([
        this.userConfig.user$,
        this.weightTracker.lastWeight$
    ]).pipe(
        map(([user, weight]) => {
            const height = user?.height;
            const w = weight?.weight;
            if (!height || !w) return null;
            const bmi = w / ((height / 100) ** 2);
            return Math.round(bmi * 10) / 10;
        })
    );

    constructor(
        private readonly userConfig: UserConfigService,
        private readonly weightTracker: WeightTrackerService
    ) { }

    getBMILimitsForHeight() {
        const height = this.user()?.height;
        if (!height || height <= 0) return [];

        const h2 = (height / 100) ** 2;
        const bmiCategories = [
            { label: 'Severe Thinness', max: 15.99, alert: '#f2adad' },
            { label: 'Moderate Thinness', max: 16.99, alert: '#c7b85a' },
            { label: 'Mild Thinness', max: 18.49, alert: '#c7b85a' },
            { label: 'Normal', max: 24.9, alert: '#4caf50' },
            { label: 'Pre-obese', max: 27.9, alert: '#c7b85a' },
            { label: 'High Overweight', max: 29.9, alert: '#c7b85a' },
            { label: 'Obesity Class I', max: 34.9, alert: '#f2adad' },
            { label: 'Obesity Class II', max: 39.9, alert: '#f2adad' }
        ];

        return bmiCategories.map(({ label, max, alert }) => ({
            label,
            bmi: max,
            weight: +(max * h2).toFixed(1),
            alert
        }));
    }
}
