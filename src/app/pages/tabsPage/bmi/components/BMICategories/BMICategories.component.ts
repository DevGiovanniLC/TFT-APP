import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonButton, IonIcon, PopoverController } from '@ionic/angular/standalone';
import { BMIInfoPopoverComponent } from '../BMIInfoPopover/ BMIInfoPopover.component';
import { TranslateModule } from '@ngx-translate/core';
import { BMIService } from '@services/BMI.service';

@Component({
    selector: 'app-bmicategories',
    imports: [IonButton, IonIcon, TranslateModule],
    templateUrl: './BMICategories.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMICategoriesComponent {
    bmi = input.required<number>();

    bmiCategories = this.bmiService.BMI_CATEGORIES;

    constructor(
        private readonly bmiService: BMIService,
        private readonly popoverController: PopoverController
    ) {}

    getTextColor(bmiValue: number): string {
        if (bmiValue < 16) return 'text-red-600';
        if (bmiValue >= 16 && bmiValue <= 18.49) return 'text-yellow-500';
        if (bmiValue >= 18.5 && bmiValue <= 24.9) return 'text-green-600';
        if (bmiValue >= 25 && bmiValue <= 29.9) return 'text-yellow-500';
        if (bmiValue >= 30) return 'text-red-600';
        return 'text-slate-600'; // por defecto
    }

    async openInfoPopover() {
        const popover = await this.popoverController.create({
            component: BMIInfoPopoverComponent,
            alignment: 'center',
            showBackdrop: true,
            backdropDismiss: true,
            cssClass: 'bmi-popover-custom',
        });

        await popover.present();
    }
}
