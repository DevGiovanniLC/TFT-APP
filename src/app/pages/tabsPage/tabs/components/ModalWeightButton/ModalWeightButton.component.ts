import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonButton, IonButtons, IonIcon, ModalController } from '@ionic/angular/standalone';
import { Weight } from '@models/types/Weight';
import { WeightRegisterComponent } from '@components/WeightRegister/WeightRegister.component';
import { WeightTrackerService } from '@services/WeightTracker.service';

@Component({
    selector: 'app-modal-weight-button',
    imports: [
        IonButton,
        IonButtons,
        IonIcon
    ],
    templateUrl: './ModalWeightButton.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalWeightButtonComponent {
    isPressingButton: boolean;

    constructor(
        private readonly modalCtrl: ModalController,
        private readonly weightTracker: WeightTrackerService
    ){
        this.isPressingButton = false;
    }

    async openModal(weight?: Weight) {
        if (this.isPressingButton) return;
        this.isPressingButton = true;

        const modal = await this.modalCtrl.create({
            component: WeightRegisterComponent,
            cssClass: 'small-modal',
            componentProps: { inputWeight: weight ?? null },
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();
        if (role === 'confirm') {
            if (weight) {
                this.weightTracker.updateWeight(data);
            } else {
                this.weightTracker.addWeight(data);
            }
            this.weightTracker.updateWeights().subscribe();
        }
        this.isPressingButton = false;
    }
}
