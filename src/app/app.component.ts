import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { ConfigService } from '@services/Config.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor(
        private readonly dataProvider: DataProviderService,
        private readonly navCtrl: NavController,
        private readonly config: ConfigService
    ) {
        this.initApp();
    }

    initApp() {
        this.dataProvider.initialize().then(async () => {
            const user = await this.config.getUser();
            if (!user) {
                this.navCtrl.navigateRoot('/initial');
            }
            SplashScreen.hide();
        });
    }
}
