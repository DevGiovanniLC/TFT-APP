import { ChangeDetectionStrategy, Component, computed, effect } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { BMIChartComponent } from './components/BMIChart/BMIChart.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';

@Component({
    selector: 'app-tab3',
    templateUrl: 'bmi.page.html',
    standalone: true,
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle,
        BMIChartComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMIPage {
    user = toSignal(this.config.user$, { initialValue: null });
    lastWeight = toSignal(this.weightTracker.lastWeight$, { initialValue: null });

    bmi = computed(() => {
        const height = this.user()?.height! / 100;
        const weight = this.lastWeight();

        if (!height || !weight) return null;

        return weight.weight / ((height * height));
    });

    constructor(private readonly weightTracker: WeightTrackerService, private readonly config: UserConfigService) {
        this.weightTracker.updateWeights().subscribe();
        this.weightTracker.updateLastWeight().subscribe();
        this.config.updateUser().subscribe();
    }
}
