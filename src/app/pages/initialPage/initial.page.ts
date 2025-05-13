import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IonContent, ModalController, IonButton, NavController } from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightFormComponent } from '@components/forms/WeightForm/WeightForm.component';
import { GoalModalComponent } from '../../components/modals/GoalModal/GoalModal.component';
import { User } from '@models/types/User';
import { FormsModule } from '@angular/forms';
import { UserConfigService } from '@services/UserConfig.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { TimeService } from '@services/Time.service';
import { DatePipe } from '@angular/common';
import { UserFormComponent } from '@components/forms/UserForm/UserForm.component';
import { HeaderMode, ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { Goal } from '@models/types/Goal';

@Component({
    selector: 'app-initial-modal',
    imports: [
        IonButton,
        IonContent,
        ModalHeaderComponent,
        WeightFormComponent,
        DatePipe,
        FormsModule,
        UserFormComponent,
    ],
    templateUrl: './Initial.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialPage {
    HeaderEnum = HeaderMode;

    FINAL_STEP = 3;
    step = 0;

    user = signal<User>({
        name: undefined,
        age: undefined,
        height: undefined,
        gender: undefined,
        email: undefined,
        goal_weight: undefined,
        goal_units: undefined,
        goal_date: undefined,
    });

    actualWeight = signal(80);
    lastWeightUnit = WeightUnits.KG;

    goal!: Goal;
    isGoal = signal(false);

    constructor(
        private readonly modalCtrl: ModalController,
        private readonly config: UserConfigService,
        private readonly weightTracker: WeightTrackerService,
        private readonly navCtrl: NavController,
        private readonly timeService: TimeService
    ) {}

    controlSteps(step: number) {
        this.step = step;
        if (this.step <= this.FINAL_STEP) return;

        const actualWeight: Weight = {
            id: 0,
            weight: this.actualWeight(),
            weight_units: this.lastWeightUnit,
            date: this.timeService.now(),
        };

        this.user.update((user) => {
            return {
                ...user,
                goal_weight: this.goal?.weight,
                goal_units: this.goal?.weight_units,
                goal_date: this.goal?.date,
            };
        });

        this.config.setUser(this.user());
        this.weightTracker.addWeight(actualWeight);
        this.navCtrl.navigateRoot('/tabs/tab1');
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
            this.goal = data as Weight;
            this.isGoal.set(true);
        }
    }

    validateGoalDate() {
        if (this.isGoal() && !isNaN(this.goal?.date?.getTime() ?? NaN)) return true;
        return false;
    }

    updateActualWeight(value: number) {
        if (typeof value !== 'number') return;

        this.actualWeight.set(value);
    }

    updateUser(user: User) {
        this.user.set(user);
    }
}
