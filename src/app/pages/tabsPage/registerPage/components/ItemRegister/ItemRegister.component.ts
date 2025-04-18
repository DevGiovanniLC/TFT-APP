import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, input, OnInit, output, signal } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { SimpleDatePipe } from '@pipes/SimpleDate.pipe';
import { SignedNumberPipe } from '@pipes/signedNumber.pipe';

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
        SimpleDatePipe,
    ],
    templateUrl: './ItemRegister.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemRegisterComponent implements OnInit {
    id = input.required<number>();
    weight = input.required<Weight>();
    progress = input.required<number>();
    deleteWeight = output<number>();

    color = signal('')

    constructor(private readonly cdr: ChangeDetectorRef) {
        effect(() => {
            this.color.set(this.checkColor(this.progress()));
            this.cdr.detectChanges();
        })
    }

    ngOnInit(): void { }

    checkColor(progress: number): string {
        if (progress >= 1.5) return '#be6363';
        if (progress > 0) return '#f7d25c';
        if (progress < 0) return '#b3ea97';
        return '#e8e8e8'
    }

    delete() {
        this.deleteWeight.emit(this.weight().id);
    }
}
