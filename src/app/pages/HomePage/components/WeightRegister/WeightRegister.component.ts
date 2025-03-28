import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IonDatetime,
    IonContent, IonTitle, IonHeader,
    IonToolbar,
    ModalController,
    IonButton, IonButtons} from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

import { WeightTrackerService } from '@services/WeightTracker.service';
import { WeightFormComponent } from '@shared/components/WeightForm/WeightForm.component';

@Component({
    selector: 'app-weight-register',
    imports: [
    IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
    IonDatetime,
    FormsModule, WeightFormComponent,
],
    templateUrl: './WeightRegister.component.html',
    styleUrls: ['./WeightRegister.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class WeightRegisterComponent {
    step = signal(0);

    lastWeight = signal(70)
    lastWeightUnit = signal(WeightUnits.KG)

    actualWeight = signal(70)
    actualDate = signal(new Date())

    readonly text: any;
    private modalCtrl = inject(ModalController);


    constructor(private weightTracker: WeightTrackerService, private calculationFunctionsService: CalculationFunctionsService) {

        effect(() => {
            this.getActualWeight();
        });
    }


    async getActualWeight() {
        if (!this.weightTracker.isAvailable()) return;
        if (!(await this.weightTracker.getActualWeight())?.weight) return;
        this.lastWeight.set(Math.floor((await this.weightTracker.getActualWeight())?.weight));
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
            weight: this.actualWeight(),
            weight_units: this.lastWeightUnit(),
            date: new Date(this.calculationFunctionsService.formatDate(this.actualDate()))
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



