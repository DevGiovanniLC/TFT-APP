import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
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
export class WeightRegisterComponent implements OnInit {
    @Input() inputWeight: Weight | null = null;
    selectedDate = signal<string | null>(null);

    lastWeight = toSignal(this.weightTracker.lastWeight$, { initialValue: null });
    lastWeightUnit = <WeightUnits>(WeightUnits.KG);

    actualWeight = signal(this.lastWeight()?.weight ?? 0);
    actualDate = signal(this.timeService.now());
    step = signal(0);

    private readonly modalCtrl = inject(ModalController);

    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly timeService: TimeService
    ) { }

    ngOnInit(): void {
        this.actualWeight.set(this.inputWeight?.weight ?? this.lastWeight()?.weight ?? 0);
        this.actualDate.set(this.inputWeight?.date ?? this.timeService.now());

        const date = this.inputWeight!.date;
        const tzOffsetMs = date.getTimezoneOffset() * 60000;
        const localISO = new Date(date.getTime() - tzOffsetMs).toISOString().substring(0, 16);
        this.selectedDate.set(localISO);
    }


    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        const newWeight: Weight = {
            id: this.inputWeight?.id ?? this.weightTracker.generateWeightId(),
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
