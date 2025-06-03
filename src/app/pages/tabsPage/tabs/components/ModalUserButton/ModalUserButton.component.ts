import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IonButton, IonButtons, IonIcon, ModalController } from '@ionic/angular/standalone';
import { ModalUserComponent } from '@components/modals/UserModal/UserModal.component';

@Component({
    selector: 'app-modal-user-button',
    imports: [IonButton, IonButtons, IonIcon],
    templateUrl: './ModalUserButton.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUserButtonComponent {
    readonly isPressingButton = signal(false);

    constructor(private readonly modalCtrl: ModalController) {}

    async openModal() {
        if (this.isPressingButton()) return;
        this.isPressingButton.set(true);

        const modal = await this.modalCtrl.create({
            component: ModalUserComponent,
            cssClass: 'small-modal',
        });
        await modal.present();

        this.isPressingButton.set(false);
    }
}
