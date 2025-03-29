import { ChangeDetectorRef, Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { ConfigService } from '@services/Config.service';
import { ModalController } from "@ionic/angular/standalone";
import { InitialModalComponent } from '@pages/InitialModal/InitialModal.component';
import { Weight } from '@models/types/Weight';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { User } from '@models/types/User';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor(
        private dataProvider: DataProviderService,
        private config: ConfigService,
        private modalCtrl: ModalController,
        private weightTracker: WeightTrackerService,
    ) {
        this.initApp()
            .then(async () => {
                const user = await config.getUser();
                if (!user) {
                    this.openModal();
                }
            })
    }

    async openModal() {
        const modal = await this.modalCtrl.create({
            component: InitialModalComponent,
            cssClass: 'small-modal',
            componentProps: {
                text: {
                    title: 'Register Weight',
                    weightStepTitle: 'Select the weight',
                    dateStepTitle: 'Pick the date'
                }
            }
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();
        if (role === 'confirm') {
            const actualWeight = data.actual_weight as Weight;
            const goal: Weight = data.goal as Weight;

            const user: User = {
                name: data.name,
                email: data.email,
                age: data.age,
                height: data.height,
                gender: data.gender,
                goal_weight: goal?.weight,
                goal_units: goal?.weight_units,
                goal_date: goal?.date
            }

            this.config.setUser(user);
            this.weightTracker.addWeight(actualWeight);
        }
    }

    async initApp() {
        await this.dataProvider.initialize();
        SplashScreen.hide();
    }
}
