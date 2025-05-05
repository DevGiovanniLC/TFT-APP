import { ChangeDetectionStrategy, Component, effect, input, Signal, signal } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { Goal } from '@models/types/Goal';
import { Weight, WeightUnits } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

@Component({
    selector: 'app-weight-loss-pace',
    imports: [IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle],
    templateUrl: './WeightLossPace.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightLossPaceComponent {
    readonly lastWeight = input.required<Weight | undefined>();
    readonly goal = input.required<Goal | undefined>();

    paceWeek = signal(0);
    paceMonth = signal(0);
    weightUnits = signal(WeightUnits.KG);
    isGoal = signal(false);

    constructor(private readonly CalculationFunctionsService: CalculationFunctionsService) {
        effect(() => {
            const goal = this.goal();
            const lastWeight = this.lastWeight();

            const lastWeightDate = new Date(lastWeight?.date ?? NaN);
            const goalDate = new Date(goal?.date ?? NaN);

            if (!goal || !lastWeight || !goalDate || isNaN(goalDate.getTime()) || isNaN(lastWeightDate.getTime())) return;

            this.isGoal.set(true);

            this.paceWeek.set(
                this.CalculationFunctionsService.PaceWeekWeightLoss(
                    lastWeight?.weight,
                    goal.weight,
                    lastWeightDate,
                    goalDate
                )
            );
            this.paceMonth.set(
                this.CalculationFunctionsService.PaceMonthWeightLoss(
                    lastWeight?.weight,
                    goal.weight,
                    lastWeightDate,
                    goalDate
                )
            );

            this.weightUnits.set(lastWeight?.weight_units);
        });
    }
}
