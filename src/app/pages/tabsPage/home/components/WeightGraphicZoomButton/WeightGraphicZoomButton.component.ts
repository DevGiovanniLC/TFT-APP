import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonButtons, IonButton, IonIcon, ModalController } from "@ionic/angular/standalone";
import { WeightGraphicModalComponent } from '../WeightGraphicModal/WeightGraphicModal.component';

@Component({
    selector: 'app-weight-graphic-zoom-button',
    imports: [IonIcon, IonButton, IonButtons,],
    templateUrl: './WeightGraphicZoomButton.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphicZoomButtonComponent {

    isPressingButton: boolean;

    constructor(private readonly modalCtrl: ModalController) {
        this.isPressingButton = false;
    }

    async openChartModal() {
        if (this.isPressingButton) return;
        this.isPressingButton = true;

        const modal = await this.modalCtrl.create({
            component: WeightGraphicModalComponent,
            cssClass: 'small-modal',
        });
        modal.present();

        this.isPressingButton = false;
    }
}
