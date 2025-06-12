import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IonContent, ModalController, IonButton, NavController } from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight.type';
import { WeightFormComponent } from '@components/forms/WeightForm/WeightForm.component';
import { GoalModalComponent } from '../../components/modals/GoalModal/GoalModal.component';
import { User } from '@models/types/User.type';
import { FormsModule } from '@angular/forms';
import { UserConfigService } from '@services/UserConfig.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { TimeService } from '@services/Time.service';
import { CommonModule, DatePipe } from '@angular/common';
import { UserFormComponent } from '@components/forms/UserForm/UserForm.component';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { Goal } from '@models/types/Goal.type';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Conf from 'src/app/conf';

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
        CommonModule,
        TranslateModule,
    ],
    templateUrl: './Initial.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialPage {
    readonly HeaderEnum = ModalHeaderComponent.HeaderEnum;
    readonly FINAL_STEP = 3;

    step = 0;
    user = signal<User>({} as User);
    actualWeight = signal(Conf.DEFAULT_WEIGHT);
    lastWeightUnit = WeightUnits.KG;
    goal?: Goal;
    isGoal = signal(false);

    constructor(
        readonly translate: TranslateService,
        private readonly modalCtrl: ModalController,
        private readonly config: UserConfigService,
        private readonly weightTracker: WeightTrackerService,
        private readonly navCtrl: NavController,
        private readonly timeService: TimeService
    ) {}

    controlSteps(step: number) {
        this.step = step;
        if (this.step > this.FINAL_STEP) {
            this.saveUserData();
        }
    }

    private saveUserData() {
        const actualWeight: Weight = {
            id: 0,
            weight: this.actualWeight(),
            weight_units: this.lastWeightUnit,
            date: this.timeService.now(),
        };

        this.user.update((user) => ({
            ...user,
            goal_weight: this.goal?.weight,
            goal_units: this.goal?.weight_units,
            goal_date: this.goal?.date,
        }));

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
        await modal.present();

        const { data, role } = await modal.onDidDismiss();
        if (role === 'confirm') {
            this.goal = data as Goal;
            this.isGoal.set(true);
        }
    }

    validateGoalDate(): boolean {
        return !!(this.isGoal() && this.goal?.date && !isNaN(this.goal.date.getTime()));
    }

    updateActualWeight(value: number) {
        if (typeof value === 'number') {
            this.actualWeight.set(value);
        }
    }

    updateUser(user: User) {
        this.user.set(user);
    }
}
