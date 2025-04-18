import { ChangeDetectionStrategy, Component, effect, input, OnInit, output, signal } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { SignedNumberPipe } from '@pipes/signedNumber.pipe';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-item-register',
    imports: [
        IonCard,
        IonCardHeader,
        IonCardSubtitle,
        IonCardTitle,
        IonCardContent,
        IonButton,
        SignedNumberPipe,
        DatePipe
    ],
    templateUrl: './ItemRegister.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemRegisterComponent implements OnInit {

    id = input.required<number>();
    weight = input.required<Weight>();
    progress = input.required<number>();

    entryClick = output<Weight>();
    deleteWeight = output<number>();

    color = signal('')

    constructor() {
        effect(() => {
            this.color.set(this.checkColor(this.progress()));
        })
    }

    ngOnInit(): void { }

    checkColor(progress: number): string {
        if (progress >= 1.5) return '#be6363';
        if (progress > 0) return '#f7d25c';
        if (progress < 0) return '#b3ea97';
        return '#e8e8e8'
    }

    deleteButton() {
        this.deleteWeight.emit(this.weight().id);
    }

    cardClick() {
        this.entryClick.emit(this.weight());
    }
}
