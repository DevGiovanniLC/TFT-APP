import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { UserConfigService } from '@services/UserConfig.service';
import { NotificationService } from '@services/Notification.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor(
        private readonly dataProvider: DataProviderService,
        private readonly navCtrl: NavController,
        private readonly config: UserConfigService,
        private readonly notificationService: NotificationService
    ) {
        this.initApp();
        this.notificationService.requestPermission();
    }

    initApp() {
        this.dataProvider.initialize().then(() => {
            this.config.updateUser().subscribe((user) => {
                if (!user) {
                    this.navCtrl.navigateRoot('/initial');
                }
            });

            SplashScreen.hide();
        });
    }
}
