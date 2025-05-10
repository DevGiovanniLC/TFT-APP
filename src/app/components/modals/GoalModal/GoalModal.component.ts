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

import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@components/forms/WeightForm/WeightForm.component';
import { TimeService } from '@services/Time.service';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';

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
    ],
    templateUrl: './GoalModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalModalComponent {
    @Input() inputWeight: Weight | null = null;

    readonly actualDate = this.timeService.now();
    readonly isWithDate = signal(false);

    readonly lastWeight = signal<number>(70);
    readonly lastWeightUnit = signal<WeightUnits>(WeightUnits.KG);

    nextDeadlineGoal = this.timeService.now();
    nextWeightGoal = 70;

    constructor(
        private readonly timeService: TimeService,
        private readonly modalCtrl: ModalController
    ) { }

    ngOnInit(): void {
        this.lastWeight.set(this.inputWeight?.weight ?? 70);
        this.lastWeightUnit.set(this.inputWeight?.weight_units ?? WeightUnits.KG);
        this.nextWeightGoal = this.inputWeight?.weight ?? 70;
        if (this.inputWeight?.date && !isNaN(new Date(this.inputWeight?.date)?.getTime() ?? NaN)) {
            this.nextDeadlineGoal = new Date(this.inputWeight?.date);
            this.isWithDate.set(true);
        } else this.nextDeadlineGoal = new Date(this.timeService.now());
    }

    controlSteps(step: number) {
        if (step == -1) this.cancel();
        if (step == 1) this.confirm();
    }

    private cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    private confirm() {
        const newWeight: Weight = {
            id: 0,
            weight: this.nextWeightGoal,
            weight_units: this.lastWeightUnit(),
            date: this.isWithDate() ? this.nextDeadlineGoal : new Date(NaN),
        };

        return this.modalCtrl.dismiss(newWeight, 'confirm');
    }

    updateActualWeight(value: number) {
        if (typeof value !== 'number') return;

        this.nextWeightGoal = value;
    }

    updateActualDate(value: string | string[] | undefined | null) {
        if (typeof value !== 'string') return;

        this.nextDeadlineGoal = new Date(value);
    }

    toggleDate() {
        this.isWithDate.set(!this.isWithDate());
    }
}
