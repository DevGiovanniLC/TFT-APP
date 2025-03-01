import { Component, effect, input, Signal, signal } from '@angular/core';
import { Weight } from '@models/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightTrackerService } from '@services/WeightTracker.service';

@Component({
    selector: 'app-weight-display',
    imports: [],
    templateUrl: './WeightDisplay.component.html',
})
export class WeightDisplay {
    readonly weights = input.required<Signal<Weight[]>>();
    readonly goal = input.required<Signal<Weight>>();

    paceWeek = signal(0);
    paceMonth = signal(0);

    constructor(private CalculationFunctionsService: CalculationFunctionsService) {
        effect(() => {
            const goal = this.goal()();
            const actualWeight = this.weights()()[0];
            const actualWeightDate = new Date(actualWeight?.date);
            const goalDate = new Date(goal.date);

            if (!goal || !actualWeight) return;
            this.paceWeek.set(
                this.CalculationFunctionsService.PaceWeekWeightLoss(
                    actualWeight.weight,
                    goal.weight,
                    actualWeightDate,
                    goalDate
                )
            );
            this.paceMonth.set(
                this.CalculationFunctionsService.PaceMonthWeightLoss(
                    actualWeight.weight,
                    goal.weight,
                    actualWeightDate,
                    goalDate
                )
            );
        });
    }
}
