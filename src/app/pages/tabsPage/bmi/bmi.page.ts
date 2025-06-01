import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent, IonButton, ModalController } from '@ionic/angular/standalone';
import { BMIChartComponent } from './components/BMIChart/BMIChart.component';
import { BMICategoriesComponent } from './components/BMICategories/BMICategories.component';
import { ModalUserComponent } from '../../../components/modals/UserModal/UserModal.component';
import { BMIService } from '@services/BMI.service';
import { UserConfigService } from '@services/UserConfig.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tab3',
    templateUrl: 'bmi.page.html',
    standalone: true,
    imports: [IonContent, IonButton, BMIChartComponent, BMICategoriesComponent, TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMIPage {
    private readonly user = toSignal(this.userConfig.user$, { initialValue: null });
    readonly bmi = toSignal(this.BMIService.bmi$, { initialValue: null });

    constructor(
        private readonly BMIService: BMIService,
        private readonly userConfig: UserConfigService,
        private readonly modalCtrl: ModalController
    ) {}

    async openModal() {
        const modal = await this.modalCtrl.create({
            component: ModalUserComponent,
            cssClass: 'small-modal',
            componentProps: {
                inputUser: this.user,
            },
        });
        modal.present();
    }
}
