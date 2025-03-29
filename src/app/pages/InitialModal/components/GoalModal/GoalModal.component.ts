import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
    IonDatetime,
    IonContent, IonTitle, IonHeader,
    IonToolbar,
    ModalController,
    IonButton, IonButtons,
    IonToggle
} from '@ionic/angular/standalone';
import { Weight, WeightUnits } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';

import { WeightFormComponent } from '@shared/components/WeightForm/WeightForm.component';

@Component({
    selector: 'app-goal-modal',
    imports: [
        IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar,
        IonDatetime,
        FormsModule, WeightFormComponent, IonToggle
    ],
    templateUrl: './GoalModal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalModalComponent {

    @ViewChild('modalContainer') contentRef!: IonContent;
    @ViewChild('dateTitle') titleRef!: ElementRef<HTMLElement>;

    isWithDate = signal(false)

    lastWeight = signal(70)
    lastWeightUnit = signal(WeightUnits.KG)

    actualWeight = signal(70)
    actualDate = signal(new Date())

    private modalCtrl = inject(ModalController);

    constructor(private calculationFunctionsService: CalculationFunctionsService, private cdr: ChangeDetectorRef) { }

    cancel() {
        return this.modalCtrl.dismiss(null, 'cancel');
    }

    confirm() {
        const newWeight: Weight = {
            weight: this.actualWeight(),
            weight_units: this.lastWeightUnit(),
            date: this.isWithDate() ? new Date(this.calculationFunctionsService.formatDate(this.actualDate())) : new Date(NaN)
        };

        return this.modalCtrl.dismiss(newWeight, 'confirm');
    }

    updateActualWeight(value: number) {
        if (typeof value !== 'number') return;

        this.actualWeight.set(value);
    }


    updateActualDate(value: any) {
        if (typeof value !== 'string') return;

        this.actualDate.set(new Date(value));
    }

    toggleDate() {
        this.isWithDate.set(!this.isWithDate())
        this.titleRef.nativeElement.classList.toggle('hidden')
        this.scrollToTitle()
    }

    private async scrollToTitle() {
        const content = this.contentRef
        const title = this.titleRef?.nativeElement

        if (content && title) {
            const y = title.offsetTop;
            content.scrollToPoint(0, y, 1500);
        }
    }

}


