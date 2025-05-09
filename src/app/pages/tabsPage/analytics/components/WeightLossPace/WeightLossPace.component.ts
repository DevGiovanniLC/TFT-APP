import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon, IonButton, PopoverController } from '@ionic/angular/standalone';
import { Goal } from '@models/types/Goal';
import { Weight, WeightUnits } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightLossPaceInfoPopoverComponent } from '../WeightLossPaceInfoPopover/WeightLossPaceInfoPopover.component';

@Component({
    selector: 'app-weight-loss-pace',
    imports: [IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle],
    templateUrl: './WeightLossPace.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightLossPaceComponent {
    readonly lastWeight = input.required<Weight | undefined>();
    readonly goal = input.required<Goal | undefined>();
    readonly weights = input.required<Weight[] | undefined>();

    goalPaceWeek = signal(0);
    goalPaceMonth = signal(0);

    trendPaceWeek = signal(0);
    trendPaceMonth = signal(0);

    weightUnits = signal(WeightUnits.KG);

    isTrend = signal(false);
    isGoal = signal(false);

    constructor(
        private readonly CalculationFunctionsService: CalculationFunctionsService,
        private readonly popoverController: PopoverController
    ) {
        effect(() => {
            const goal = this.goal();
            const lastWeight = this.lastWeight();
            const weights = this.weights();
            const lastWeightDate = new Date(lastWeight?.date ?? NaN);
            const goalDate = new Date(goal?.date ?? NaN);

            this.calculateTrendPace(weights);

            if (!goal || !lastWeight || !goalDate || isNaN(goalDate.getTime()) || isNaN(lastWeightDate.getTime())) {
                this.isGoal.set(false);
                return;
            }

            this.calculateGoalPace(goal, lastWeight, goalDate, lastWeightDate);
            this.weightUnits.set(lastWeight?.weight_units);
        });
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
        if (weights) {
            const { weightPerWeek, weightPerMonth } = this.CalculationFunctionsService.trendWeightPace(weights);

            if (weightPerWeek && weightPerMonth) {
                this.isTrend.set(true);
                this.trendPaceWeek.set(weightPerWeek);
                this.trendPaceMonth.set(weightPerMonth);
            } else {
                this.isTrend.set(false);
            }
        }
    }

    private calculateGoalPace(goal: Goal, lastWeight: Weight, goalDate: Date, lastWeightDate: Date) {
        this.isGoal.set(true);

        this.goalPaceWeek.set(
            this.CalculationFunctionsService.weekWeightLossPace(
                lastWeight?.weight,
                goal.weight ?? NaN,
                lastWeightDate,
                goalDate
            )
        );
        this.goalPaceMonth.set(
            this.CalculationFunctionsService.monthWeightLossPace(
                lastWeight?.weight,
                goal.weight ?? NaN,
                lastWeightDate,
                goalDate
            )
        );
    }

    validateTrendPace(value: number, range: number): string {
        if (isNaN(value) || !value) return 'Not Logic';
        if (value >= -range && value <= range) return `${value.toFixed(2)} ${this.weightUnits()}`;
        return 'Not Logic';
    }



}
