import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    input,
    OnInit,
    output,
    signal,
} from '@angular/core';
import { IonPicker, IonPickerColumn, IonPickerColumnOption, PickerColumn } from '@ionic/angular/standalone';
import { WeightUnits } from '@models/types/Weight';

@Component({
    selector: 'app-weight-form',
    imports: [IonPicker, IonPickerColumn, IonPickerColumnOption],
    templateUrl: './WeightForm.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightFormComponent implements OnInit, AfterViewInit {
    inputWeightValue = input.required<number | undefined>();
    inputWeightUnit = input(WeightUnits.KG);

    outputWeightValue = output<number>();

    lastWeight = signal(70);
    lastWeightDecimal = signal(0);

    weightOptions!: number[];
    weightOptionsDecimal!: number[];

    constructor(private readonly cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.weightOptions = this.generateRange(30, 100);
        this.weightOptionsDecimal = this.generateRange(0, 9);
        this.lastWeight.set(Math.floor(this.inputWeightValue() ?? 0));
        this.lastWeightDecimal.set(Math.round(((this.inputWeightValue() ?? 0) % 1) * 10));
    }

    ngAfterViewInit(): void {
        this.weightOptions = this.weightOptions.concat(this.generateRange(101, 250));
        this.cdr.detectChanges();
    }

    updateActualWeight(value: any) {
        if (typeof value !== 'number') return;

        this.lastWeight.set(value);
        this.outputWeightValue.emit(this.lastWeight() + this.lastWeightDecimal() / 10);
    }

    updateActualWeightDecimal(value: PickerColumn['options'][number]['value']) {
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
