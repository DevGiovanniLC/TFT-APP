import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight } from '@models/types/Weight';
import { WeightGraphic } from '@pages/tabsPage/homePage/components/WeightGraphic/WeightGraphic.component';
import { MainDisplay } from '@pages/tabsPage/homePage/components/MainDisplay/MainDisplay.component';
import { UserConfigService } from '@services/UserConfig.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-tab1',
    templateUrl: 'Home.page.html',
    standalone: true,
    imports: [IonContent, WeightGraphic, MainDisplay],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit{
    goal = toSignal(this.userConfig.getGoal(), { initialValue: null });
    weights = toSignal(this.weightTracker.weights$, { initialValue: [] });
    actualWeight = toSignal(this.weightTracker.lastWeight$, { initialValue: null });
    firstWeight = toSignal(this.weightTracker.firstWeight$, { initialValue: null });

    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly userConfig: UserConfigService
    ) {}

    ngOnInit(): void {
        this.weightTracker.updateWeights().subscribe();
        this.weightTracker.updateLastWeight().subscribe();
        this.weightTracker.updateFirstWeight().subscribe();
        this.userConfig.getGoal().subscribe();
    }



    addWeight($event: Weight) {
        this.weightTracker.addWeight($event);
        this.weightTracker.updateWeights().subscribe();
        this.weightTracker.updateLastWeight().subscribe();
    }
}
