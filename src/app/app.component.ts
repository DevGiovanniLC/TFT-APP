import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { ConfigService } from '@services/Config.service';
import { NavController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor(
        private dataProvider: DataProviderService,
        private navCtrl: NavController,
        private config: ConfigService
    ) {
        this.initApp().then(async () => {
            const user = await config.getUser();
            if (!user) {
                this.navCtrl.navigateRoot('/initial');
            }
        });
    }

    async initApp() {
        await this.dataProvider.initialize();
        SplashScreen.hide();
    }
}
