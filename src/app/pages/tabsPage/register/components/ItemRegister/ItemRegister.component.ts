import { AfterViewInit, ChangeDetectionStrategy, Component, effect, input, OnDestroy, output, signal, viewChild, ElementRef, Renderer2, } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';
import { Weight } from '@models/types/Weight';
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { SignedNumberPipe } from 'src/app/pipes/signedNumber.pipe';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-item-register',
    imports: [IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, SignedNumberPipe, DatePipe],
    templateUrl: './ItemRegister.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemRegisterComponent implements AfterViewInit, OnDestroy {
    //Gesto de eliminar registro
    private swipeGesture!: Gesture;
    private readonly SWIPE_THRESHOLD = -100;
    private readonly MAX_TRANSLATE = -120;
    private readonly START_REPORT_AFTER = 10;

    private readonly swipeContainer = viewChild('swipeContainer', { read: ElementRef });
    private readonly cardElement = viewChild('cardElement', { read: ElementRef });

    //Inputs
    id = input.required<number>();
    weight = input.required<Weight>();
    progress = input.required<number>();

    //Outputs
    entryClick = output<Weight>();
    deleteWeight = output<number>();

    color = signal('');

    constructor(
        private readonly gestureCtrl: GestureController,
        private readonly renderer: Renderer2
    ) {
        effect(() => {
            this.color.set(this.checkColor(this.progress()));
        });
    }

    ngAfterViewInit(): void {
        const containerRef = this.swipeContainer();
        const cardRef = this.cardElement();
        if (!containerRef || !cardRef) return;

        const containerEl = containerRef.nativeElement;
        const cardEl = cardRef.nativeElement;

        this.swipeGesture = this.gestureCtrl.create({
            el: containerEl,
            gestureName: 'swipe-to-delete',
            threshold: this.START_REPORT_AFTER,
            onMove: (ev) => this.handleMove(ev.deltaX, cardEl),
            onEnd: (ev) => this.handleEnd(ev.deltaX, cardEl),
        });
        this.swipeGesture.enable(true);
    }

    private handleMove(deltaX: number, card: HTMLElement): void {
        const x = Math.min(0, deltaX);
        const translateX = x < this.MAX_TRANSLATE ? this.MAX_TRANSLATE : x;
        this.renderer.setStyle(card, 'transition', 'none');
        this.renderer.setStyle(card, 'transform', `translateX(${translateX}px)`);
    }

    private handleEnd(deltaX: number, card: HTMLElement): void {
        if (deltaX < this.SWIPE_THRESHOLD) {
            this.renderer.setStyle(card, 'transition', 'transform 0.3s ease-out');
            this.renderer.setStyle(card, 'transform', `translateX(${this.MAX_TRANSLATE}px)`);
            setTimeout(() => this.deleteButton(card), 100);
        } else {
            this.renderer.setStyle(card, 'transition', 'transform 0.2s ease-out');
            this.renderer.setStyle(card, 'transform', 'translateX(0)');
        }
    }

    private deleteButton(card: HTMLElement): void {
        this.renderer.setStyle(card, 'transition', 'transform 0.2s ease-out');
        this.renderer.setStyle(card, 'transform', 'translateX(0)');
        this.deleteWeight.emit(this.weight().id);
    }

    cardClick(): void {
        this.entryClick.emit(this.weight());
    }

    ngOnDestroy(): void {
        this.swipeGesture.destroy();
    }

    private checkColor(progress: number): string {
        if (progress >= 1.5) return '#be6363';
        if (progress > 0) return '#f7d25c';
        if (progress < 0) return '#b3ea97';
        return '#e8e8e8';
    }
}
