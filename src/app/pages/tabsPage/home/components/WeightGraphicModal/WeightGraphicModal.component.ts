import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { ModalController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-weight-graphic-modal',
    imports: [ModalHeaderComponent],
    templateUrl: './WeightGraphicModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphicModalComponent {

    constructor(private readonly modalCtrl: ModalController) { }

    cancel() {
        this.modalCtrl.dismiss();
    }
}
