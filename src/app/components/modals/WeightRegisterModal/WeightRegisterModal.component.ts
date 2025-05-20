import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonDatetime, IonContent, ModalController, IonModal, IonDatetimeButton } from '@ionic/angular/standalone';

import { Weight, WeightUnits } from '@models/types/Weight.type';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { WeightFormComponent } from '@components/forms/WeightForm/WeightForm.component';
import { TimeService } from '@services/Time.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';

@Component({
    imports: [
        IonContent,
        IonDatetime,
        IonModal,
        IonDatetimeButton,
        FormsModule,
        WeightFormComponent,
        ModalHeaderComponent,
    ],
    templateUrl: './WeightRegisterModal.component.html',
    styleUrl: './WeightRegisterModal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightRegisterComponent implements OnInit {
    @Input() inputWeight: Weight | null = null;

    readonly selectedDate = signal<string | null>(null);
    readonly lastWeight = toSignal(this.weightTracker.lastWeight$, { initialValue: null });
    readonly lastWeightUnit = signal<WeightUnits>(WeightUnits.KG);

    private readonly nextWeight = signal(0);
    private readonly nextDate = signal<Date>(this.timeService.now());


    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly timeService: TimeService,
        private readonly modalCtrl: ModalController,
    ) { }

    ngOnInit(): void {
        const last = this.lastWeight();
        const input = this.inputWeight;

        this.nextWeight.set(input?.weight ?? last?.weight ?? 0);
        this.nextDate.set(input?.date ?? this.timeService.now());

        if (input) {
            const date = input.date;
            const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString()
                .substring(0, 16);
            this.selectedDate.set(localISO);
        }
    }

    controlSteps(step: number) {
        if (step > -1)  this.cancel();
        if (step < 1) this.confirm();
    }

    private cancel() {
        this.modalCtrl.dismiss(null, 'cancel');
    }

    private confirm() {
        const newWeight: Weight = {
            id: this.inputWeight?.id,
            weight: this.nextWeight(),
            weight_units: this.lastWeightUnit(),
            date: this.nextDate(),
        };
        this.modalCtrl.dismiss(newWeight, 'confirm');
    }

    updateNextWeight(value: number) {
        if (typeof value === 'number') this.nextWeight.set(value);
    }

    updateNextDate(value: string | string[] | null | undefined) {
        if (typeof value === 'string') this.nextDate.set(new Date(value));
    }
}
