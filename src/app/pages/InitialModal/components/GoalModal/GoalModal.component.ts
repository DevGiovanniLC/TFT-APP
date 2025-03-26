import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
    IonDatetime,
    IonContent, IonTitle, IonHeader,
    IonToolbar,
    ModalController,
    IonButton, IonButtons,
    IonToggle
} from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

import { WeightFormComponent } from '@shared/components/WeightForm/WeightForm.component';

@Component({
    selector: 'app-goal-modal',
    imports: [
        IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
        IonDatetime,
        FormsModule, WeightFormComponent, IonToggle
    ],
    templateUrl: './GoalModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalModalComponent {
    isWithDate = signal(false)

    lastWeight = signal(70)
    lastWeightUnit = signal(WeightUnits.KG)

    actualWeight = signal(70)
    actualDate = signal(new Date())

    readonly text: any;
    private modalCtrl = inject(ModalController);

    constructor(private calculationFunctionsService: CalculationFunctionsService) {}

    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        const newWeight: Weight = {
            weight: this.actualWeight(),
            weight_units: this.lastWeightUnit(),
            date: this.isWithDate() ? new Date(this.calculationFunctionsService.formatDate(this.actualDate())) : new Date(0)
        };

        return this.modalCtrl.dismiss(newWeight, 'confirm');
    }

    updateActualWeight(value: number) {
        if (typeof value !== 'number') return;

        this.actualWeight.set(value);
    }


    updateActualDate(value: any) {
        if (typeof value !== 'string') return;

        this.actualDate.set(new Date(value));
    }

}
