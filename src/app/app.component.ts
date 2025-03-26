import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { ConfigService } from '@services/Config.service';
import { ModalController } from "@ionic/angular/standalone";
import { InitialModalComponent } from '@pages/InitialModal/InitialModal.component';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor(private dataProvider: DataProviderService, config: ConfigService, private modalCtrl: ModalController) {
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
    }

    async initApp() {
        // await SplashScreen.show({
        //     showDuration: 2000, // Opcional: duración en ms
        //     autoHide: true      // Ocultar automáticamente después de showDuration
        // });
        await this.dataProvider.initialize();
        SplashScreen.hide();
    }
}
