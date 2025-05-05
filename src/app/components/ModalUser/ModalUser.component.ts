import { ChangeDetectionStrategy, Component, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserConfigService } from '@services/UserConfig.service';
import { ModalHeaderComponent } from '@components/ModalHeader/ModalHeader.component';
import { ModalController, IonButton } from '@ionic/angular/standalone';
import { UserFormComponent } from '@components/UserForm/UserForm.component';
import { User } from '@models/types/User';
import { Weight } from '@models/types/Weight';
import { GoalModalComponent } from '@pages/initialPage/components/GoalModal/GoalModal.component';
import { DatePipe } from '@angular/common';


@Component({
    selector: 'app-modal-user',
    imports: [
        IonButton,
        ModalHeaderComponent,
        UserFormComponent,
        DatePipe
    ],
    templateUrl: './ModalUser.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUserComponent {

    inputUser = toSignal(this.userConfig.user$);
    isGoalDate = signal(false);

    user = signal<User | undefined>(undefined);

    constructor(
        private readonly userConfig: UserConfigService,
        private readonly modalCtrl: ModalController,
    ) {
        this.userConfig.updateUser().subscribe();
    }

    ngOnInit(): void {
        const user = this.inputUser();
        if (!user) return
        this.user.set(user);
        this.isGoalDate.set(this.validateDate(user.goal_date));
    }

    controlSteps($event: number) {
        if ($event == -1) this.cancel();
        if ($event == 1) this.confim();
    }

    confim() {
        const user = this.user();
        if (!user) return;
        this.userConfig.setUser(user);
        this.userConfig.updateUser().subscribe();
        this.userConfig.updateGoal().subscribe();
        this.modalCtrl.dismiss(undefined, 'confirm');
    }

    cancel() {
        this.modalCtrl.dismiss();
    }

    setUser(user: User) {
        this.user.set(user);
    }

    private validateDate(date: Date | undefined ) {
        if (!date) return false;
        if (date === new Date(0)) return false;
        if (isNaN(new Date(date).getTime() ?? NaN)) return false;
        return true;
    }


    async openModal() {
        const user = this.user();

        const goal = {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date,
        }

        const modal = await this.modalCtrl.create({
            component: GoalModalComponent,
            cssClass: 'small-modal',
            componentProps: {
                inputWeight: goal,
            },
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm') {
            const goal = data as Weight;
            this.user.update((user) => {
                if (!user) return user;
                return {
                    ...user,
                    goal_weight: goal.weight,
                    goal_units: goal.weight_units,
                    goal_date: goal.date,
                };
            });
            this.isGoalDate.set(this.validateDate(goal.date ?? null));
        }
    }
}
