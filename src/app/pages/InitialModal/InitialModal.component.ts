import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    IonContent, IonTitle, IonHeader,
    IonToolbar,
    IonButton, IonButtons} from '@ionic/angular/standalone';
import { WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@shared/components/WeightForm/WeightForm.component';

@Component({
    selector: 'app-initial-modal',
    imports:
        [
            IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
            WeightFormComponent
        ],
    templateUrl: './InitialModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialModalComponent {
    step = 0;
    name=''
    age=0
    height=0
    actualWeight = signal(70)
    lastWeightUnit = WeightUnits.KG

    constructor(){}

    nextStep() {
        this.step += 1;
    }

    backStep() {
        this.step -= 1;
    }


    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.actualWeight.set(value);
    }
}


