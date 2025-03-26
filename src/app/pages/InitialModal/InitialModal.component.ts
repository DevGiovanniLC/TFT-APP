import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    IonContent, IonTitle, IonHeader,
    IonToolbar, ModalController ,
    IonButton, IonButtons} from '@ionic/angular/standalone';
import { WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@shared/components/WeightForm/WeightForm.component';
import { GoalModalComponent } from './components/GoalModal/GoalModal.component';

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

    constructor(private modalCtrl: ModalController){
        this.openModal()
    }

    nextStep() {
        this.step += 1;
    }

    backStep() {
        this.step -= 1;
    }

        async openModal() {

            const modal = await this.modalCtrl.create({
                component: GoalModalComponent,
                cssClass: 'small-modal',
                componentProps: {
                    text:{
                        title: 'Register Weight',
                        weightStepTitle: 'Select the weight',
                        dateStepTitle: 'Pick the date'
                    }
                }
            });
            modal.present();

            const { data, role } = await modal.onDidDismiss();

        }


    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.actualWeight.set(value);
    }
}


