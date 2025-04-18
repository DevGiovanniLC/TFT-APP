import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    ModalController,
    IonButtons,
    IonButton,
    IonSelect,
    IonSelectOption,
    NavController,
} from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@components/WeightForm/WeightForm.component';
import { GoalModalComponent } from './components/GoalModal/GoalModal.component';
import { Gender, User } from '@models/types/User';
import { FormsModule } from '@angular/forms';
import { UserConfigService } from '@services/UserConfig.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { TimeService } from '@services/Time.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-initial-modal',
    imports: [
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonToolbar,
        IonSelect,
        IonSelectOption,
        WeightFormComponent,
        DatePipe,
        FormsModule,
    ],
    templateUrl: './Initial.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialPage {
    readonly FINAL_STEP = 4;

    step = 0;

    name!: string;
    age!: number;
    height!: number;
    gender: Gender = Gender.OTHER;

    actualWeight = signal(80);
    lastWeightUnit = WeightUnits.KG;

    goalWeight!: Weight | null;
    isGoal = signal(false);

    constructor(
        private readonly modalCtrl: ModalController,
        private readonly config: UserConfigService,
        private readonly weightTracker: WeightTrackerService,
        private readonly navCtrl: NavController,
        private readonly timeService: TimeService
    ) {}

    nextStep() {
        this.step += 1;

        if (this.step === this.FINAL_STEP) {
            const actualWeight: Weight = {
                id: 0,
                weight: this.actualWeight(),
                weight_units: this.lastWeightUnit,
                date: this.timeService.now(),
            };

            const structuredData: User = {
                name: this.name,
                email: undefined,
                age: this.age,
                height: this.height,
                gender: this.gender,
                goal_weight: this.goalWeight?.weight,
                goal_units: this.goalWeight?.weight_units,
                goal_date: this.goalWeight?.date,
            };

            this.config.setUser(structuredData);
            this.weightTracker.addWeight(actualWeight);
            this.navCtrl.navigateRoot('/tabs/tab1');
        }
    }

    backStep() {
        if (this.step === 0) return;
        this.step -= 1;
    }

    async openModal() {
        const modal = await this.modalCtrl.create({
            component: GoalModalComponent,
            cssClass: 'small-modal',
            componentProps: {
                text: {
                    title: 'Register Weight',
                    weightStepTitle: 'Select the weight',
                    dateStepTitle: 'Pick the date',
                },
            },
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm') {
            this.goalWeight = data as Weight;
            this.isGoal.set(true);
        }
    }

    validateGoalDate() {
        if (this.isGoal() && !isNaN(this.goalWeight?.date?.getTime() ?? NaN)) return true;
        return false;
    }

    validateHeight(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = Number(input.value);

        if (value < 0) {
            value = NaN;
        }

        if (value > 999) {
            value = 999;
        }

        input.value = String(value.toFixed(0));
    }

    validateName(event: Event): void {
        const input = event.target as HTMLInputElement;
        const name = input.value.trim();
        input.value = name.charAt(0).toUpperCase() + name.slice(1);
    }

    validateAge(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = Number(input.value);

        if (value < 0) {
            value = NaN;
        }

        if (value > 120) {
            value = 120;
        }

        input.value = String(value.toFixed(0));
    }

    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.actualWeight.set(value);
    }
}
