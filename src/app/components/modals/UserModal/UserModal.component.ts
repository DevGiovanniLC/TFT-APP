import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserConfigService } from '@services/UserConfig.service';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { ModalController, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { UserFormComponent } from '@components/forms/UserForm/UserForm.component';
import { User } from '@models/types/User.type';
import { Weight } from '@models/types/Weight.type';
import { GoalModalComponent } from '@components/modals/GoalModal/GoalModal.component';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    imports: [IonContent, IonButton, IonIcon, ModalHeaderComponent, UserFormComponent, DatePipe, TranslateModule],
    templateUrl: './UserModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUserComponent {
    readonly inputUser = toSignal(this.userConfig.user$);
    readonly isGoalDate = signal(false);
    readonly isButtonActive = signal(false);
    readonly user = signal<User | undefined>(undefined);

    constructor(
        private readonly userConfig: UserConfigService,
        private readonly modalCtrl: ModalController
    ) { }

    ngOnInit(): void {
        const user = this.inputUser();
        if (user) {
            this.user.set(user);
            this.isGoalDate.set(this.isValidDate(user.goal_date));
        }
    }


    controlSteps(step: number) {
        if (step == -1)  this.cancel();
        if (step == 1) this.confirm();
    }

    private confirm() {
        const user = this.user();
        if (!user) return;
        this.userConfig.setUser(user);
        this.modalCtrl.dismiss(undefined, 'confirm');
    }

    private cancel() {
        this.modalCtrl.dismiss();
    }

    setUser(user: User) {
        this.user.set(user);
    }

    private isValidDate(date?: Date) {
        if (!date) return false;
        const d = new Date(date);
        return !isNaN(d.getTime()) && d.getTime() !== 0;
    }

    deleteGoal() {
        this.user.update(user =>
            user
                ? { ...user, goal_weight: undefined, goal_units: undefined, goal_date: undefined }
                : user
        );
        this.isGoalDate.set(false);
    }

    async openModal() {
        if (this.isButtonActive()) return;
        this.isButtonActive.set(true);

        const user = this.user();
        const goal = {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date,
        };

        const modal = await this.modalCtrl.create({
            component: GoalModalComponent,
            cssClass: 'small-modal',
            componentProps: { inputWeight: goal },
        });
        await modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm' && data) {
            const goalData = data as Weight;
            this.user.update(user =>
                user
                    ? {
                        ...user,
                        goal_weight: goalData.weight,
                        goal_units: goalData.weight_units,
                        goal_date: goalData.date,
                    }
                    : user
            );
            this.isGoalDate.set(this.isValidDate(goalData.date));
        }
        this.isButtonActive.set(false);
    }
}
