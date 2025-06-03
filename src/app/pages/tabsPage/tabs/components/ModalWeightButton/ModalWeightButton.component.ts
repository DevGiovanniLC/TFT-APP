import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IonButton, IonButtons, IonIcon, ModalController } from '@ionic/angular/standalone';
import { Weight } from '@models/types/Weight.type';
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

    async openModal() {
        if (this.isPressingButton()) return;
        this.isPressingButton.set(true);

        const modal = await this.modalCtrl.create({
            component: WeightRegisterComponent,
            cssClass: 'small-modal',
        });

        await modal.present();

        const { data, role } = await modal.onDidDismiss();

        this.confirmAction(role, data as Weight);

        this.isPressingButton.set(false);
    }

    private confirmAction(role: string | undefined, data: Weight) {
        if (role !== 'confirm') return;
        this.weightTracker.addWeight(data);
    }
}
