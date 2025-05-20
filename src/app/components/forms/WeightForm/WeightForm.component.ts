import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    input,
    OnInit,
    output,
    signal,
    AfterViewInit,
} from '@angular/core';
import { IonPicker, IonPickerColumn, IonPickerColumnOption, PickerColumn } from '@ionic/angular/standalone';
import { WeightUnits } from '@models/types/Weight.type';

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

    weightOptions: number[] = [];
    weightOptionsDecimal: number[] = [];

    constructor(private readonly cdr: ChangeDetectorRef) {
        this.weightOptions.push(...this.generateRange(25, 100));
    }

    ngOnInit(): void {
        this.weightOptions.push(...this.generateRange(101, 176));
        this.weightOptionsDecimal = this.generateRange(0, 9);
        const value = this.inputWeightValue() ?? 0;
        this.lastWeight.set(Math.floor(value));
        this.lastWeightDecimal.set(Math.round((value % 1) * 10));
    }

    ngAfterViewInit(): void {
        this.weightOptions.push(...this.generateRange(177, 250));
        this.cdr.detectChanges();
    }

    updateActualWeight(value: number) {
        this.lastWeight.set(value);
        this.emitWeight();
    }

    updateActualWeightDecimal(value: number) {
        this.lastWeightDecimal.set(value);
        this.emitWeight();
    }

    columnValueToNumber(value: PickerColumn['options'][number]['value']): number {
        return Number(value);
    }

    private emitWeight() {
        this.outputWeightValue.emit(this.lastWeight() + this.lastWeightDecimal() / 10);
    }

    private generateRange(start: number, end: number): number[] {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
}
