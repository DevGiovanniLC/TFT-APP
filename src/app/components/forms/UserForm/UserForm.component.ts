import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { User } from '@models/types/User.type';

@Component({
    selector: 'app-user-form',
    imports: [FormsModule, IonSelect, IonSelectOption],
    templateUrl: './UserForm.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
    inputUser = input<User | undefined>();
    setUser = output<User>();

    user: User = {
        name: undefined,
        age: undefined,
        height: undefined,
        gender: undefined,
        email: undefined,
        goal_weight: undefined,
        goal_units: undefined,
        goal_date: undefined,
    };

    ngOnInit(): void {
        const user = this.inputUser();
        if (user) this.user = { ...user };
    }

    onNameChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const name = input.value.trim();
        this.user.name = name.charAt(0).toUpperCase() + name.slice(1);
        input.value = this.user.name;
        this.emitUser();
    }

    onAgeChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value: number | undefined = Number(input.value);
        value = isNaN(value) || value <= 0 ? undefined : Math.min(value, 120);
        this.user.age = value;
        input.value = value ? String(value) : '';
        this.emitUser();
    }

    onHeightChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value: number | undefined = Number(input.value);
        value = isNaN(value) || value <= 0 ? undefined : Math.min(value, 300);
        this.user.height = value;
        input.value = value ? String(value) : '';
        this.emitUser();
    }

    onGenderChange(): void {
        this.emitUser();
    }

    private emitUser(): void {
        this.setUser.emit({ ...this.user });
    }
}
