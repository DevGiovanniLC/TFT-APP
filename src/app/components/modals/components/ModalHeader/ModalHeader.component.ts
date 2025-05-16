import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/angular/standalone';

@Component({
    selector: 'app-modal-header',
    imports: [IonHeader, IonToolbar, IonButtons, IonButton],
    templateUrl: './ModalHeader.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHeaderComponent {
    HeaderEnum = HeaderMode;

    MAX_STEPS = input<number>(0);
    headerMode = input<HeaderMode>(HeaderMode.static);

    outputStep = output<number>();

    step = 0;

    nextStep() {
        this.step++;
        this.outputStep.emit(this.step);
        return this.step;
    }

    backStep(): number {
        this.step--;
        this.outputStep.emit(this.step);
        return this.step;
    }
}

export enum HeaderMode {
    static,
    sequence,
    back
}
