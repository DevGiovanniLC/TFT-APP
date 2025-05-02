import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
    IonModal,
    IonDatetime,
    IonContent,
    ModalController,
    IonDatetimeButton,
    IonToggle,
} from '@ionic/angular/standalone';

import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@components/WeightForm/WeightForm.component';
import { TimeService } from '@services/Time.service';
import { ModalHeaderComponent } from '@components/ModalHeader/ModalHeader.component';

@Component({
    selector: 'app-goal-modal',
    imports: [
        IonContent,
        FormsModule,
        WeightFormComponent,
        IonToggle,
        IonDatetimeButton,
        IonModal,
        IonDatetime,
        ModalHeaderComponent
    ],
    templateUrl: './GoalModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalModalComponent {
    isWithDate = signal(false);

    lastWeight = signal(70);
    lastWeightUnit = signal(WeightUnits.KG);

    actualWeight = signal(70);
    actualDate = signal(this.timeService.now());

    private readonly modalCtrl = inject(ModalController);

    constructor(private readonly timeService: TimeService) { }

    controlSteps(step: number) {
        if (step == -1) this.cancel()
        if (step == 1) this.confirm()
    }

    private cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    private confirm() {
        const newWeight: Weight = {
            id: 0,
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

    updateActualDate(value: string | string[] | undefined | null) {
        if (typeof value !== 'string') return;

        this.actualDate.set(new Date(value));
    }

    toggleDate() {
        this.isWithDate.set(!this.isWithDate());
    }
}
