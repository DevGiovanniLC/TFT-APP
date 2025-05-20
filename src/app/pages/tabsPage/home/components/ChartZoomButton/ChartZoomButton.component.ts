import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonButtons, IonButton, IonIcon, ModalController } from "@ionic/angular/standalone";
import { ModalWeightLineChartComponent } from '../ModalWeightLineChart/ModalWeightLineChart.component';

@Component({
    selector: 'app-weight-graphic-zoom-button',
    imports: [IonIcon, IonButton, IonButtons],
    templateUrl: './ChartZoomButton.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartZoomButtonComponent {

    isPressingButton: boolean;

    constructor(private readonly modalCtrl: ModalController) {
        this.isPressingButton = false;
    }

    async openChartModal() {
        if (this.isPressingButton) return;
        this.isPressingButton = true;

        const modal = await this.modalCtrl.create({
            component: ModalWeightLineChartComponent,
            cssClass: 'small-modal',
        });
        modal.present();

        this.isPressingButton = false;
    }
}
