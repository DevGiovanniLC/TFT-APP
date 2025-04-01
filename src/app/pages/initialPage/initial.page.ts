import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    IonContent,
    IonTitle,
    IonHeader,
    IonToolbar,
    ModalController,
    IonButtons,
    IonButton,
    IonSelect,
    IonSelectOption,
    NavController
} from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@components/WeightForm/WeightForm.component';
import { GoalModalComponent } from './components/GoalModal/GoalModal.component';
import { Gender, User } from '@models/types/User';
import { FormsModule } from '@angular/forms';
import { SimpleDatePipe } from '@pipes/SimpleDate.pipe';
import { ConfigService } from '@services/Config.service';
import { WeightTrackerService } from '@services/WeightTracker.service';

@Component({
    selector: 'app-initial-modal',
    imports: [
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonSelect,
        IonSelectOption,
        WeightFormComponent,
        SimpleDatePipe,
        FormsModule,
    ],
    templateUrl: './Initial.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialPage {
    step = 0;
    FINAL_STEP = 4;

    name!: string;
    age!: number;
    height!: number;
    gender: Gender = Gender.OTHER;

    actualWeight = signal(70);
    lastWeightUnit = WeightUnits.KG;

    goalWeight!: Weight | null;
    isGoal = signal(false);



    constructor(
        private modalCtrl: ModalController,
        private config: ConfigService,
        private weightTracker: WeightTrackerService,
        private navCtrl: NavController,
    ) {}

    nextStep() {
        this.step += 1;


        if (this.step === this.FINAL_STEP) {
            const actualWeight: Weight = {
                weight: this.actualWeight(),
                weight_units: this.lastWeightUnit,
                date: new Date(),
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
        if (this.isGoal() && !isNaN(this.goalWeight?.date?.getTime() || NaN)) return true;
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
