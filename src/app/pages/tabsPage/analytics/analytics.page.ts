import { Component, OnInit, signal } from '@angular/core';
import { WeightLossPaceComponent } from './components/WeightLossPace/WeightLossPace.component';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
    selector: 'app-analitics',
    templateUrl: './analytics.page.html',
    standalone: true,
    imports: [IonButton, IonContent, WeightLossPaceComponent],
})
export class AnaliticsPage implements OnInit {

    weights = toSignal(this.weightTracker.weights$);
    lastWeight = toSignal(this.weightTracker.lastWeight$);
    goal = toSignal(this.userConfig.goal$);
    isButtonActive = signal(false);

    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly userConfig: UserConfigService
    ) { }

    ngOnInit() {
        this.weightTracker.updateWeights().subscribe();
        this.weightTracker.updateLastWeight().subscribe();
        this.userConfig.updateGoal().subscribe();
    }

    exportDataCSV() {
        this.isButtonActive.set(true);
        this.weightTracker.exportDataCSV();
        this.isButtonActive.set(false);
    }
}
