import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IonDatetime,
    IonContent, IonTitle, IonHeader,
    IonToolbar,
    ModalController,
    IonButton, IonButtons,
    IonPicker, IonPickerColumn, IonPickerColumnOption
} from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

import { WeightTrackerService } from '@services/WeightTracker.service';

@Component({
    selector: 'app-weight-register',
    imports:
        [
            IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
            IonPicker, IonPickerColumn, IonPickerColumnOption, IonDatetime,
            FormsModule
        ],
    templateUrl: './WeightRegister.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class WeightRegisterComponent {
    step = signal(0);
    lastWeight = signal(70)
    lastWeightUnit = signal(WeightUnits.KG)
    actualDate = signal(new Date())
    weightOptions = this.generateRange(5, 300);


    constructor(private modalCtrl: ModalController, private weightTracker: WeightTrackerService, private calculationFunctionsService: CalculationFunctionsService) {
        effect(() => {
            this.getActualWeight();
        });
    }

    async getActualWeight() {
        if (!this.weightTracker.isAvailable()) return;
        if (!(await this.weightTracker.getActualWeight())?.weight) return;

        this.lastWeight.set((await this.weightTracker.getActualWeight())?.weight);
        this.lastWeightUnit.set((await this.weightTracker.getActualWeight())?.weight_units);
    }


    cancel() {
        if (this.step() === 1) {
            this.step.set(0);
            return;
        }
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        if (this.step() === 0) {
            this.step.set(1);
            return;
        }

        const newWeight: Weight = {
            weight: this.lastWeight(),
            weight_units: this.lastWeightUnit(),
            date: new Date(this.calculationFunctionsService.formatDate(this.actualDate()))
        };

        return this.modalCtrl.dismiss(newWeight, 'confirm');
    }

    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.lastWeight.set(value);
    }

    updateActualDate(value: any) {
        if (typeof value !== 'string') return;

        this.actualDate.set(new Date(value));
    }

    generateRange(start: number, end: number): number[] {
        return Array(end - start + 1).fill(0).map((_, idx) => start + idx);
    }
}



