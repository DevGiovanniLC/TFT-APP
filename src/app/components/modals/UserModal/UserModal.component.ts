import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserConfigService } from '@services/UserConfig.service';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { ModalController, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { UserFormComponent } from '@components/forms/UserForm/UserForm.component';
import { User } from '@models/types/User';
import { Weight } from '@models/types/Weight';
import { GoalModalComponent } from '@components/modals/GoalModal/GoalModal.component';
import { DatePipe } from '@angular/common';

@Component({
    imports: [IonContent, IonButton, IonIcon, ModalHeaderComponent, UserFormComponent, DatePipe],
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
    ) {}

    ngOnInit(): void {
        const user = this.inputUser();
        if (!user) return;
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
        this.userConfig.getUser().subscribe();
        this.userConfig.getGoal().subscribe();
        this.modalCtrl.dismiss(undefined, 'confirm');
    }

    cancel() {
        this.modalCtrl.dismiss();
    }

    setUser(user: User) {
        this.user.set(user);
    }

    private validateDate(date: Date | undefined) {
        if (!date) return false;
        if (date == new Date(0)) return false;
        if (isNaN(new Date(date).getTime() ?? NaN)) return false;
        return true;
    }

    deleteGoal() {
        this.user.update((user) => {
            if (!user) return user;
            return {
                ...user,
                goal_weight: undefined,
                goal_units: undefined,
                goal_date: undefined,
            };
        });
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
        this.isButtonActive.set(false);
    }
}
