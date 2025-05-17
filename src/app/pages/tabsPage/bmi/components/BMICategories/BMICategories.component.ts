import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonButton, IonIcon, PopoverController } from '@ionic/angular/standalone';
import { BMIInfoPopoverComponent } from '../BMIInfoPopover/ BMIInfoPopover.component';

@Component({
    selector: 'app-bmicategories',
    imports: [IonButton, IonIcon],
    templateUrl: './BMICategories.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMICategoriesComponent {
    bmi = input.required<number>();

    bmiCategories = [
        { label: '🔴 Obesity Class II', min: 35, max: 39.9, alert: '#f2adad' },
        { label: '🔴 Obesity Class I', min: 30, max: 34.9, alert: '#c7b85a' },
        { label: '🟡 High Overweight', min: 28, max: 29.9, alert: '#1E8260' },
        { label: '🟡 Pre-obese', min: 25, max: 27.9, alert: '#1E8260' },
        { label: '🟢 Normal', min: 18.5, max: 24.9, alert: '#4caf50' },
        { label: '🟡 Mild Thinness', min: 17, max: 18.49, alert: '#adccf2' },
        { label: '🟡 Moderate Thinness', min: 16, max: 16.99, alert: '#cdc827' },
        { label: '🔴 Severe Thinness', min: 0, max: 15.99, alert: '#f15757' },
    ];

    constructor(private readonly popoverController: PopoverController) {}

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
