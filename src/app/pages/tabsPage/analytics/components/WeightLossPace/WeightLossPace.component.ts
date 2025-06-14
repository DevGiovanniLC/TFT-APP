import { ChangeDetectionStrategy, Component, computed, effect, input, OnInit, signal } from '@angular/core';
import {
    IonCard,
    IonCardTitle,
    IonCardSubtitle,
    IonIcon,
    IonButton,
    PopoverController,
} from '@ionic/angular/standalone';
import { Goal } from '@models/types/Goal.type';
import { Weight, WeightUnits } from '@models/types/Weight.type';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { WeightLossPaceInfoPopoverComponent } from '../WeightLossPaceInfoPopover/WeightLossPaceInfoPopover.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-weight-loss-pace',
    imports: [IonButton, IonIcon, IonCard, IonCardTitle, IonCardSubtitle, TranslateModule],
    templateUrl: './WeightLossPace.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightLossPaceComponent implements OnInit {
    readonly lastWeight = input.required<Weight | undefined>();
    readonly goal = input.required<Goal | undefined>();
    readonly weights = input.required<Weight[] | undefined>();

    goalPaceWeek = computed(() => {
        return this.CalculationFunctionsService.weekWeightLossPace(
            this.lastWeight()?.weight ?? NaN,
            this.goal()?.weight ?? NaN,
            this.lastWeight()?.date ?? new Date(NaN),
            this.goal()?.date ?? new Date(NaN)
        )
    });

    goalPaceMonth = computed(() => {
        return this.CalculationFunctionsService.monthWeightLossPace(
            this.lastWeight()?.weight ?? NaN,
            this.goal()?.weight ?? NaN,
            this.lastWeight()?.date ?? new Date(NaN),
            this.goal()?.date ?? new Date(NaN)
        )
    });

    trendPaceWeek = signal(NaN);
    trendPaceMonth = signal(NaN);

    weightUnits = signal(WeightUnits.KG);

    isTrend = signal(false);
    isGoal = signal(false);

    constructor(
        private readonly CalculationFunctionsService: WeightAnalysisService,
        private readonly popoverController: PopoverController
    ) {
        effect(() => {
            this.calculateTrendPace(this.weights());
        });
    }

    ngOnInit(): void {
        if (this.goal()?.date) this.isGoal.set(true);
        const weightUnits = this.lastWeight()?.weight_units ?? WeightUnits.KG;
        this.weightUnits.set(weightUnits);
    }

    async openInfoPopover() {
        const popover = await this.popoverController.create({
            component: WeightLossPaceInfoPopoverComponent,
            alignment: 'center',
            showBackdrop: true,
            backdropDismiss: true,
            cssClass: 'bmi-popover-custom',
        });

        await popover.present();
    }

    private calculateTrendPace(weights: Weight[] | undefined) {
        if (!weights) return

        const { weightPerWeek, weightPerMonth } = this.CalculationFunctionsService.trendWeightPace(weights);

        if (weightPerWeek && weightPerMonth) {
            this.isTrend.set(true);
            this.trendPaceWeek.set(weightPerWeek);
            this.trendPaceMonth.set(weightPerMonth);
            return;
        }

        this.isTrend.set(false);
    }

    protected validateGoal(){
        if (this.goal()?.date) return true;
        return false;
    }

    protected validateTrendPace(value: number, range: number): string {
        if (isNaN(value) || !value || !this.isTrend()) return 'Not Logic';
        if (value >= -range && value <= range) return `${value.toFixed(2)} ${this.weightUnits()}`;
        return 'Not Logic';
    }
}
