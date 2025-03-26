import { ChangeDetectionStrategy, Component, effect, input, Input, OnInit, output, signal } from '@angular/core';
import {IonPicker, IonPickerColumn, IonPickerColumnOption} from '@ionic/angular/standalone';
import { WeightUnits } from '@models/types/Weight';

@Component({
    selector: 'app-weight-form',
    imports: [IonPicker, IonPickerColumn, IonPickerColumnOption],
    templateUrl: './WeightForm.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class WeightFormComponent implements OnInit{
    inputWeightValue = input.required<number>();
    inputWeightUnit = input(WeightUnits.KG)

    outputWeightValue = output<number>();

    lastWeight = signal(70)
    lastWeightDecimal = signal(0)

    weightOptions!: number[];
    weightOptionsDecimal!: number[];

    constructor(){
        effect( () => {
            this.lastWeight.set(this.inputWeightValue())
        })
    }

    ngOnInit(): void {
        this.weightOptions = this.generateRange(5.0, 300.0);
        this.weightOptionsDecimal = this.generateRange(0, 9);
    }

    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.lastWeight.set(value);
        this.outputWeightValue.emit(this.lastWeight() + this.lastWeightDecimal() / 10)
    }

    updateActualWeightDecimal(value: any) {
        if (typeof value !== 'number') return;

        this.lastWeightDecimal.set(value);
        this.outputWeightValue.emit(this.lastWeight() + this.lastWeightDecimal() / 10)
    }

    generateRange(start: number, end: number): number[] {
        return Array(end - start + 1).fill(0).map((_, idx) => start + idx);
    }
}
