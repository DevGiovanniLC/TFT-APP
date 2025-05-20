import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonButtons, IonButton, IonIcon, ModalController } from "@ionic/angular/standalone";
import { ModalWeightLineChart } from '../ModalWeightLineChart/ModalWeightLineChart.component';

@Component({
    selector: 'app-weight-graphic-zoom-button',
    imports: [IonIcon, IonButton, IonButtons],
    templateUrl: './ChartZoomButton.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartZoomButton {

    isPressingButton: boolean;

    constructor(private readonly modalCtrl: ModalController) {
        this.isPressingButton = false;
    }

    async openChartModal() {
        if (this.isPressingButton) return;
        this.isPressingButton = true;

        const modal = await this.modalCtrl.create({
            component: ModalWeightLineChart,
            cssClass: 'small-modal',
        });
        modal.present();

        this.isPressingButton = false;
    }
}
