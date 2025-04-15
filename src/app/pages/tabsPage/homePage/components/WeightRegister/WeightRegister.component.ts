import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IonDatetime,
    IonContent,
    IonHeader,
    IonToolbar,
    ModalController,
    IonModal,
    IonDatetimeButton,
    IonButton,
    IonButtons,
} from '@ionic/angular/standalone';

import { Weight, WeightUnits } from '@models/types/Weight';

import { WeightTrackerService } from '@services/WeightTracker.service';
import { WeightFormComponent } from '@components/WeightForm/WeightForm.component';
import { TimeService } from '@services/Time.service';
import { from } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-weight-register',
    imports: [
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonToolbar,
        IonDatetime,
        IonButtons,
        IonModal,
        IonDatetimeButton,
        FormsModule,
        WeightFormComponent,
    ],
    templateUrl: './WeightRegister.component.html',
    styleUrls: ['./WeightRegister.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightRegisterComponent {
    step = signal(0);

    lastWeight = toSignal(this.weightTracker.lastWeight$, { initialValue: null });
    lastWeightUnit = <WeightUnits>(WeightUnits.KG);

    actualWeight = signal(70);
    actualDate = signal(this.timeService.now());

    private readonly modalCtrl = inject(ModalController);

    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly timeService: TimeService
    ) {
        effect(() => {

        });
    }

    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        const newWeight: Weight = {
            weight: this.actualWeight(),
            weight_units: this.lastWeightUnit,
            date: this.actualDate(),
        };

        return this.modalCtrl.dismiss(newWeight, 'confirm');
    }

    updateActualWeight(value: number) {
        if (typeof value !== 'number') return;
        this.actualWeight.set(value);
    }

    updateActualDate(value: any) {
        if (typeof value !== 'string') return;

        this.actualDate.set(new Date(value));
    }
}
