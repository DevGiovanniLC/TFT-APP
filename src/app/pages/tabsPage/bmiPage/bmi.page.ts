import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { IonContent, IonButton, ModalController } from '@ionic/angular/standalone';
import { BMIChartComponent } from './components/BMIChart/BMIChart.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';
import { BMICategoriesComponent } from './components/BMICategories/BMICategories.component';
import { PersonalInfoModalComponent } from '@pages/tabsPage/bmiPage/components/PersonalInfoModal/PersonalInfoModal.component';
import { User } from '@models/types/User';

@Component({
    selector: 'app-tab3',
    templateUrl: 'bmi.page.html',
    standalone: true,
    imports: [
    IonContent, IonButton,
    BMIChartComponent, BMICategoriesComponent
],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMIPage {
    user = toSignal(this.config.user$, { initialValue: null });
    lastWeight = toSignal(this.weightTracker.lastWeight$, { initialValue: null });

    bmi = computed(() => {
        const height = this.user()?.height
        const weight = this.lastWeight();

        if (!height || !weight) return null;

        return weight.weight / Math.pow(height/100, 2);
    });


    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly config: UserConfigService,
        private readonly modalCtrl: ModalController
    ) {
        this.weightTracker.updateWeights().subscribe();
        this.weightTracker.updateLastWeight().subscribe();
        this.config.updateUser().subscribe();
    }


    async openModal() {
        const modal = await this.modalCtrl.create({
            component: PersonalInfoModalComponent,
            cssClass: 'small-modal',
            componentProps: {
                inputUser: this.user,
            },
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm') {
            const user = data as User;
            this.config.setUser(user);
            this.config.updateUser().subscribe();
        }
    }
}
