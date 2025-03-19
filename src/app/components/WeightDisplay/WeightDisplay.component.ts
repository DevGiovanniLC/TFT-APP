import { ChangeDetectionStrategy, Component, effect, input, Signal, signal } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

@Component({
    selector: 'app-weight-display',
    imports: [IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle],
    templateUrl: './WeightDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightDisplay {
    readonly weights = input.required<Signal<Weight[]>>();
    readonly goal = input.required<Signal<Weight>>();

    paceWeek = signal(0);
    paceMonth = signal(0);
    weightUnits = signal(WeightUnits.KG);

    constructor(private CalculationFunctionsService: CalculationFunctionsService) {
        effect(() => {
            const goal = this.goal();
            const WeightList = this.weights();
            const actualWeight = WeightList()[0];
            const actualWeightDate = new Date(actualWeight?.date);
            const goalDate = new Date(goal().date);

            if (!goal || !WeightList) return;
            this.paceWeek.set(
                this.CalculationFunctionsService.PaceWeekWeightLoss(
                    actualWeight?.weight,
                    goal().weight,
                    actualWeightDate,
                    goalDate
                )
            );
            this.paceMonth.set(
                this.CalculationFunctionsService.PaceMonthWeightLoss(
                    actualWeight?.weight,
                    goal().weight,
                    actualWeightDate,
                    goalDate
                )
            );

            this.weightUnits.set(actualWeight?.weight_units);
        });
    }
}
