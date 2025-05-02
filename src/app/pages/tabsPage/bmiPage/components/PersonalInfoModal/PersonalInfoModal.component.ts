import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular/standalone';
import { User } from '@models/types/User';
import { FormsModule } from '@angular/forms';
import { UserFormComponent } from '@components/UserForm/UserForm.component';
import { ModalHeaderComponent } from '@components/ModalHeader/ModalHeader.component';

@Component({
    selector: 'app-personal-info-modal',
    imports: [
        FormsModule,
        IonContent,
        UserFormComponent,
        ModalHeaderComponent
    ],
    templateUrl: './PersonalInfoModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PersonalInfoModalComponent {

    inputUser = input<User>(
        {
            name: undefined,
            age: undefined,
            height: undefined,
            gender: undefined,
            email: undefined,
            goal_weight: undefined,
            goal_units: undefined,
            goal_date: undefined
        }
    )

    user!: User;

    constructor(
        private readonly modalCtrl: ModalController
    ) { }

    controlSteps(step: number) {
        if (step == -1) this.cancel()
        if (step == 1) this.confirm()
    }

    updateUser(user: User) {
        this.user = user;
    }

    private cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    private confirm() {
        return this.modalCtrl.dismiss(this.user, 'confirm');
    }

}
