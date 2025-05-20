import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight } from '@models/types/Weight.type';
import { WeightLineChartComponent } from '@pages/tabsPage/home/components/WeightLineChart/WeightLineChart.component';
import { MainDisplayComponent } from '@pages/tabsPage/home/components/MainDisplay/MainDisplay.component';
import { UserConfigService } from '@services/UserConfig.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-tab1',
    templateUrl: 'Home.page.html',
    standalone: true,
    imports: [IonContent, WeightLineChartComponent, MainDisplayComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
    goal = toSignal(this.userConfig.goal$);
    weights = toSignal(this.weightTracker.weights$, { initialValue: [] });
    lastWeight = toSignal(this.weightTracker.lastWeight$);
    firstWeight = toSignal(this.weightTracker.firstWeight$);

    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly userConfig: UserConfigService
    ) { }

    addWeight($event: Weight) {
        this.weightTracker.addWeight($event);
    }
}
