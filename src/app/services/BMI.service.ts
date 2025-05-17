import { Injectable } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { combineLatest, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root'
})
export class BMIService {

    user = toSignal(this.userConfig.user$, { initialValue: null });

    readonly bmi$ = combineLatest([
        this.userConfig.user$,
        this.weightTracker.lastWeight$
    ]).pipe(
        map(([user, weight]) => {
            if (!user?.height || !weight?.weight) return null;
            return weight.weight / Math.pow(user.height / 100, 2);
        })
    );

    constructor(
        private readonly userConfig: UserConfigService,
        private readonly weightTracker: WeightTrackerService
    ) { }


    getBMILimitsForHeight(): { label: string; bmi: number; weight: number; alert: string }[] {

        const height = this.user()?.height;

        if (!height || height <= 0) return [];

        const h = height / 100;
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

        return bmiCategories.map(c => ({
            label: c.label,
            bmi: c.max,
            weight: +(c.max * h * h).toFixed(1),
            alert: c.alert
        }));
    }

}
