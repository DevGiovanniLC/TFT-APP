import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
    IonModal,
    IonDatetime,
    IonContent,
    IonHeader,
    IonToolbar,
    ModalController,
    IonButton,
    IonButtons,
    IonDatetimeButton,
    IonToggle,
} from '@ionic/angular/standalone';

import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@components/WeightForm/WeightForm.component';

@Component({
    selector: 'app-goal-modal',
    imports: [
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonToolbar,
        FormsModule,
        WeightFormComponent,
        IonToggle,
        IonDatetimeButton,
        IonModal,
        IonDatetime,
    ],
    templateUrl: './GoalModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalModalComponent {
    isWithDate = signal(false);

    lastWeight = signal(70);
    lastWeightUnit = signal(WeightUnits.KG);

    actualWeight = signal(70);
    actualDate = signal(new Date());

    private readonly modalCtrl = inject(ModalController);

    constructor() {}

    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        const newWeight: Weight = {
            weight: this.actualWeight(),
            weight_units: this.lastWeightUnit(),
            date: this.isWithDate() ? this.actualDate() : new Date(NaN),
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

    toggleDate() {
        this.isWithDate.set(!this.isWithDate());
    }
}
