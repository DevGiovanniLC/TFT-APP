import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { UserConfigService } from '@services/UserConfig.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor(
        private readonly dataProvider: DataProviderService,
        private readonly navCtrl: NavController,
        private readonly config: UserConfigService
    ) {
        this.initApp();
    }

    initApp() {
        this.dataProvider.initialize().then(() => {

            this.config.updateUser().subscribe(
                user => {
                    if (!user) {
                        this.navCtrl.navigateRoot('/initial');
                    }
                }
            )

            SplashScreen.hide();
        });
    }
}
