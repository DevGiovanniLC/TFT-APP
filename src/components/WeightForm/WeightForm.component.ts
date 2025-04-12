import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular/standalone';
import { WeightUnits } from '@models/types/Weight';

@Component({
    selector: 'app-weight-form',
    imports: [IonPicker, IonPickerColumn, IonPickerColumnOption],
    templateUrl: './WeightForm.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightFormComponent {
    inputWeightValue = input.required<number>();
    inputWeightUnit = input(WeightUnits.KG);

    outputWeightValue = output<number>();

    lastWeight = signal(70);
    lastWeightDecimal = signal(0);

    readonly weightOptions = this.generateRange(30, 250);
    readonly weightOptionsDecimal = this.generateRange(0, 9);

    constructor() {
        effect(() => {
            this.lastWeight.set(Math.floor(this.inputWeightValue()));
            this.lastWeightDecimal.set(Math.round((this.inputWeightValue() % 1) * 10));
        });
    }

    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.lastWeight.set(value);
        this.outputWeightValue.emit(this.lastWeight() + this.lastWeightDecimal() / 10);
    }

    updateActualWeightDecimal(value: any) {
        if (typeof value !== 'number') return;

        this.lastWeightDecimal.set(value);
        this.outputWeightValue.emit(this.lastWeight() + this.lastWeightDecimal() / 10);
    }

    generateRange(start: number, end: number): number[] {
        const length = end - start + 1;
        const range = new Array(length);
        for (let i = 0; i < length; i++) {
            range[i] = start + i;
        }
        return range;
    }
}
