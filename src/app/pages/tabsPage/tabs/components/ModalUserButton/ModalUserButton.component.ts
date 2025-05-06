import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonButton, IonButtons, IonIcon, ModalController } from '@ionic/angular/standalone';
import { ModalUserComponent } from '@components/modals/UserModal/UserModal.component';

@Component({
    selector: 'app-modal-user-button',
    imports: [IonButton, IonButtons, IonIcon],
    templateUrl: './ModalUserButton.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUserButtonComponent {
    isPressingButton: boolean;

    constructor(private readonly modalCtrl: ModalController) {
        this.isPressingButton = false;
    }

    async openModal() {
        if (this.isPressingButton) return;
        this.isPressingButton = true;

        const modal = await this.modalCtrl.create({
            component: ModalUserComponent,
            cssClass: 'small-modal',
        });
        modal.present();

        this.isPressingButton = false;
    }
}
