import { ChangeDetectionStrategy, Component, input, OnInit, signal } from '@angular/core';
import { IonSelect, IonSelectOption, IonButton, IonHeader, IonToolbar, IonButtons, ModalController, IonContent } from '@ionic/angular/standalone';
import { Gender, User } from '@models/types/User';
import { FormsModule } from '@angular/forms';
import { UserFormComponent } from '@shared/UserForm/UserForm.component';

@Component({
    selector: 'app-personal-info-modal',
    imports: [
        FormsModule,
        IonButtons, IonButton, IonHeader, IonToolbar, IonContent,
        UserFormComponent
    ],
    templateUrl: './PersonalInfoModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PersonalInfoModalComponent implements OnInit {

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
    ) {}

    ngOnInit(): void {}



    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    async confirm() {
        return this.modalCtrl.dismiss(this.user, 'confirm');
    }

    updateUser(user: User) {
        this.user = user;
    }


}
