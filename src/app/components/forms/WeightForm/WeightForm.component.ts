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
import Conf from 'src/app/conf';

const BOUND = 20;

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

    lastWeight = signal(Conf.DEFAULT_WEIGHT);
    lastWeightDecimal = signal(0);

    weightOptions: number[] = [];
    weightOptionsDecimal: number[] = [];

    constructor(private readonly cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        const value = this.inputWeightValue() ?? Conf.DEFAULT_WEIGHT;
        const intValue = Math.floor(value);
        const decimalValue = Math.round((value % 1) * 10);

        this.weightOptions.push(...this.generateRange(intValue - BOUND, intValue + BOUND));
        this.lastWeight.set(intValue);

        this.weightOptionsDecimal = this.generateRange(0, 9);
        this.lastWeightDecimal.set(decimalValue);
    }

    ngAfterViewInit(): void {
        this.weightOptions.unshift(...this.generateRange(Conf.MIN_WEIGHT, this.lastWeight() - BOUND - 1));
        this.weightOptions.push(...this.generateRange(this.lastWeight() + BOUND + 1, Conf.MAX_WEIGHT));
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

