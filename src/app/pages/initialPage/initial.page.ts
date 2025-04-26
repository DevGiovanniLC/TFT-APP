import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    ModalController,
    IonButtons,
    IonButton,
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
import { UserFormComponent } from '@shared/UserForm/UserForm.component';

@Component({
    selector: 'app-initial-modal',
    imports: [
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonToolbar,
        WeightFormComponent,
        DatePipe,
        FormsModule,
        UserFormComponent,
    ],
    templateUrl: './Initial.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialPage {
    readonly FINAL_STEP = 4;

    step = 0;

    user = signal<User>({
        name: undefined,
        age: undefined,
        height: undefined,
        gender: undefined,
        email: undefined,
        goal_weight: undefined,
        goal_units: undefined,
        goal_date: undefined
    });

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
    ) { }

    nextStep() {
        this.step += 1;

        if (this.step === this.FINAL_STEP) {
            const actualWeight: Weight = {
                id: 0,
                weight: this.actualWeight(),
                weight_units: this.lastWeightUnit,
                date: this.timeService.now(),
            };

            this.user.update((user) => {
                return {
                    ...user,
                    goal_weight: this.goalWeight?.weight,
                    goal_units: this.goalWeight?.weight_units,
                    goal_date: this.goalWeight?.date,
                };
            });

            this.config.setUser(this.user());
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

    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.actualWeight.set(value);
    }

    updateUser(user: User) {
        this.user.set(user);
    }
}
