import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IonContent, IonTitle, IonHeader,
    IonItem, IonToolbar,
    ModalController,
    IonButton, IonButtons,
    IonPicker, IonPickerColumn, IonPickerColumnOption
} from '@ionic/angular/standalone';

import { WeightTrackerService } from '@services/WeightTracker.service';

@Component({
    selector: 'app-weight-register',
    styleUrls: ['./WeightRegister.component.css'],
    imports:
        [
            IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
            IonPicker, IonPickerColumn, IonPickerColumnOption,
            FormsModule
        ],
    templateUrl: './WeightRegister.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class WeightRegisterComponent {
    name!: string;
    actualWeight = signal(70)

    constructor(private modalCtrl: ModalController, private weightTracker: WeightTrackerService) {
        effect(() => {
            if (this.weightTracker.isAvailable()) {
                this.getActualWeight();
            }
        });
    }

    async getActualWeight() {
        this.actualWeight.set(await this.weightTracker.getActualWeight());
    }


    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        return this.modalCtrl.dismiss(this.actualWeight(), 'confirm');
    }

    generateRange(start: number, end: number): number[] {
        return Array(end - start + 1).fill(0).map((_, idx) => start + idx);
    }
}

