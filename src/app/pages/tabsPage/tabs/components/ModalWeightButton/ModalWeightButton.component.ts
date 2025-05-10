import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IonButton, IonButtons, IonIcon, ModalController } from '@ionic/angular/standalone';
import { Weight } from '@models/types/Weight';
import { WeightRegisterComponent } from '@components/modals/WeightRegisterModal/WeightRegisterModal.component';
import { WeightTrackerService } from '@services/WeightTracker.service';

@Component({
    selector: 'app-modal-weight-button',
    imports: [IonButton, IonButtons, IonIcon],
    templateUrl: './ModalWeightButton.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalWeightButtonComponent {
    readonly isPressingButton = signal(false);

    constructor(
        private readonly modalCtrl: ModalController,
        private readonly weightTracker: WeightTrackerService
    ) {}

    async openModal(weight?: Weight) {
        if (this.isPressingButton()) return;
        this.isPressingButton.set(true);

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
        }
        this.isPressingButton.set(false);
    }
}
