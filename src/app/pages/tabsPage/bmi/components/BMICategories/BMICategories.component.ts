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
    ) { }

    protected getTextColor(bmiValue: number): string {
        return this.bmiService.getBMICategory(bmiValue).color;
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
