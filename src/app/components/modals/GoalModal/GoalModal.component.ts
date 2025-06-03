import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IonModal,
    IonDatetime,
    IonContent,
    ModalController,
    IonDatetimeButton,
    IonToggle,
} from '@ionic/angular/standalone';

import { Weight, WeightUnits } from '@models/types/Weight.type';
import { WeightFormComponent } from '@components/forms/WeightForm/WeightForm.component';
import { TimeService } from '@services/Time.service';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { TranslateModule } from '@ngx-translate/core';
import { DeviceInfoService } from '@services/DeviceInfo.service';

@Component({
    imports: [
        IonContent,
        FormsModule,
        WeightFormComponent,
        IonToggle,
        IonDatetimeButton,
        IonModal,
        IonDatetime,
        ModalHeaderComponent,
        TranslateModule,
    ],
    templateUrl: './GoalModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalModalComponent {
    @Input() inputWeight: Weight | null = null;

    readonly isWithDate = signal(false);
    readonly lastWeight = signal<number>(70);
    readonly lastWeightUnit = signal<WeightUnits>(WeightUnits.KG);
    readonly actualDate = this.timeService.now();
    readonly language = signal<string>('en-GB');

    nextDeadlineGoal: Date = this.timeService.now();
    nextWeightGoal = 70;

    constructor(
        private readonly deviceInfo: DeviceInfoService,
        private readonly timeService: TimeService,
        private readonly modalCtrl: ModalController
    ) {}

    ngOnInit(): void {
        this.language.set(this.deviceInfo.getLanguage());
        const weight = this.inputWeight?.weight ?? 70;
        const weightUnit = this.inputWeight?.weight_units ?? WeightUnits.KG;
        const date = this.inputWeight?.date;

        this.lastWeight.set(weight);
        this.lastWeightUnit.set(weightUnit);
        this.nextWeightGoal = weight;

        if (date && !isNaN(new Date(date).getTime())) {
            this.nextDeadlineGoal = new Date(date);
            this.isWithDate.set(true);
        } else {
            this.nextDeadlineGoal = new Date(this.timeService.now());
        }
    }

    controlSteps(step: number) {
        if (step == -1) this.cancel();
        if (step == 1) this.confirm();
    }

    private cancel() {
        this.modalCtrl.dismiss(null, 'cancel');
    }

    private confirm() {
        const newWeight: Weight = {
            id: 0,
            weight: this.nextWeightGoal,
            weight_units: this.lastWeightUnit(),
            date: this.isWithDate() ? this.nextDeadlineGoal : new Date(NaN),
        };
        this.modalCtrl.dismiss(newWeight, 'confirm');
    }

    updateActualWeight(value: number) {
        if (typeof value === 'number') {
            this.nextWeightGoal = value;
        }
    }

    updateActualDate(value: string | string[] | null | undefined) {
        if (typeof value === 'string') {
            this.nextDeadlineGoal = new Date(value);
        }
    }

    toggleDate() {
        this.isWithDate.set(!this.isWithDate());
    }
}
