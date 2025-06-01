import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

enum HeaderEnum {
    Static,
    Sequence,
    Back
}

@Component({
    selector: 'app-modal-header',
    imports: [IonHeader, IonToolbar, IonButtons, IonButton, TranslateModule],
    templateUrl: './ModalHeader.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHeaderComponent {
    static readonly HeaderEnum = HeaderEnum

    headerEnum = HeaderEnum;
    MAX_STEPS = input<number>(0);
    headerMode = input<HeaderEnum>(HeaderEnum.Static);

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


