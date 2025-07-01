import { effect, Injectable } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { combineLatest, map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { User } from '@models/types/User.type';
import BMICategory from '@models/types/BMICategory';

@Injectable({ providedIn: 'root' })
/**
 * Servicio que calcula el Índice de Masa Corporal (IMC) y categoriza el estado de salud del usuario.
 * @export
 * @class BMIService
 */
export class BMIService {

    BMI_CATEGORIES: BMICategory[] = [
        {
            translateLabel: 'TAB2.CATEGORIES.OBESITY_CLASS_III', label: '',
            max: Infinity, min: 40, maxWeightLimit: undefined,
            color: '#f2adad', emoji: '🔴',
        },
        {
            translateLabel: 'TAB2.CATEGORIES.OBESITY_CLASS_II', label: '',
            max: 39.9, min: 35, maxWeightLimit: undefined,
            color: '#f2adad', emoji: '🔴',
        },
        {
            translateLabel: 'TAB2.CATEGORIES.OBESITY_CLASS_I', label: '',
            max: 34.9, min: 30, maxWeightLimit: undefined,
            color: '#f2adad', emoji: '🔴',
        },
        {
            translateLabel: 'TAB2.CATEGORIES.OVERWEIGHT', label: '',
            max: 29.9, min: 25, maxWeightLimit: undefined,
            color: '#c7b85a', emoji: '🟡',
        },
        {
            translateLabel: 'TAB2.CATEGORIES.NORMAL', label: '',
            max: 24.9, min: 18.5, maxWeightLimit: undefined,
            color: '#4caf50', emoji: '🟢',
        },
        {
            translateLabel: 'TAB2.CATEGORIES.MILD_THINNING', label: '',
            max: 18.49, min: 17, maxWeightLimit: undefined,
            color: '#c7b85a', emoji: '🟡',
        },
        {
            translateLabel: 'TAB2.CATEGORIES.MODERATE_THINNING', label: '',
            max: 16.9, min: 16, maxWeightLimit: undefined,
            color: '#c7b85a', emoji: '🟡',
        },
        {
            translateLabel: 'TAB2.CATEGORIES.SEVERE_THINNING', label: '',
            max: 15.9, min: -Infinity, maxWeightLimit: undefined,
            color: '#f2adad', emoji: '🔴',
        },
    ];

    private readonly user = toSignal(this.userConfig.user$, { initialValue: null });

    readonly bmi$: Observable<number | null> = combineLatest([
        this.userConfig.user$,
        this.weightTracker.lastWeight$,
    ]).pipe(
        map(([user, weight]) => {
            const height = user?.height;
            const w = weight?.weight;
            if (!height || !w) return null;
            const bmi = w / (height / 100) ** 2;
            return Math.round(bmi * 10) / 10;
        })
    );

    constructor(
        private readonly translateService: TranslateService,
        private readonly userConfig: UserConfigService,
        private readonly weightTracker: WeightTrackerService
    ) {
        effect(() => {
            this.updateMaxWeightLimit(this.user());
            this.updateLabels();
        });
    }

    getBMICategory(bmi: number | null): BMICategory {
        const bmiCategories = this.BMI_CATEGORIES;
        if (!bmi) return bmiCategories[0];
        const category = bmiCategories.find((cat) => bmi <= cat.max && bmi >= cat.min) ?? bmiCategories[0];
        return category;
    }

    private updateLabels() {
        const bmiCategories = this.BMI_CATEGORIES;
        this.translateService.get(bmiCategories.map((cat) => cat.translateLabel)).subscribe((translations) => {
            this.BMI_CATEGORIES.forEach((cat) => {
                cat.label = translations[cat.translateLabel];
            });
        });
    }

    private updateMaxWeightLimit(user: User | undefined | null): void {
        if (!user) return;

        const height = user.height;
        if (!height || height <= 0) return;

        this.BMI_CATEGORIES.forEach((cat) => {
            const h2 = (height / 100) ** 2;
            cat.maxWeightLimit = Number((cat.max * h2).toFixed(1));
        });
    }
}
