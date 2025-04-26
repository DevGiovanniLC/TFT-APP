import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonSelect, IonSelectOption, IonButton, IonHeader, IonToolbar, IonButtons, ModalController, IonContent } from '@ionic/angular/standalone';
import { Gender, User } from '@models/types/User';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-personal-info-modal',
    imports: [
        FormsModule,
        IonSelect, IonSelectOption, IonButtons, IonButton, IonHeader, IonToolbar, IonContent
    ],
    templateUrl: './PersonalInfoModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PersonalInfoModalComponent {

    name!: string;
    age!: number;
    height!: number;
    gender: Gender = Gender.OTHER;

    constructor(
        private readonly modalCtrl: ModalController
    ) {

    }

    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    async confirm() {
        const user: User = {
            name: this.name,
            email: undefined,
            age: this.age,
            height: this.height,
            gender: this.gender,
            goal_weight: undefined,
            goal_units: undefined,
            goal_date: undefined,
        }

        return this.modalCtrl.dismiss(user, 'confirm');

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



}
