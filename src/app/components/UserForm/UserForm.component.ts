import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { User } from '@models/types/User';

@Component({
    selector: 'app-user-form',
    imports: [
        FormsModule,
        IonSelect, IonSelectOption
    ],
    templateUrl: './UserForm.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {

    inputUser = input<User | undefined>({
        name: undefined,
        age: undefined,
        height: undefined,
        gender: undefined,
        email: undefined,
        goal_weight: undefined,
        goal_units: undefined,
        goal_date: undefined
    });

    outputUser!: User;

    setUser = output<User>();

    constructor() { }

    ngOnInit(): void {
        const user = this.inputUser();
        if (!user) return

        this.outputUser = user
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
        this.setUser.emit(this.outputUser);
    }

    validateName(event: Event): void {
        const input = event.target as HTMLInputElement;
        const name = input.value.trim();
        input.value = name.charAt(0).toUpperCase() + name.slice(1);
        this.setUser.emit(this.outputUser);
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
        this.setUser.emit(this.outputUser);
    }

    validateGender(): void {
        this.setUser.emit(this.outputUser);
    }
}
