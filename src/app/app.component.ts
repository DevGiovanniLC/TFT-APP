import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { UserConfigService } from '@services/UserConfig.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { EventAdviceService } from '@services/EventAdvice.service';
import { DeviceInfoService } from '@services/DeviceInfo.service';

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
        private readonly weightTracker: WeightTrackerService,
        // No quitar necesario para inicializar constructor
        private readonly deviceInfo: DeviceInfoService,
        private readonly eventAdvice: EventAdviceService
    ) {
        this.initApp();
    }

    private initApp() {
        this.dataProvider.initialize().then((connectionStatus) => {
            if (!connectionStatus)
                throw new Error('Connection to database failed, please try again or reinstall the app');
            this.initData();
            this.hideSplash();
        });
    }

    private initData() {
        this.weightTracker.getWeights().subscribe();
        this.config.getGoal().subscribe();
        this.config.getUser().subscribe((user) => {
            if (!user) {
                this.navCtrl.navigateRoot('/initial');
            }
        });
    }

    private hideSplash() {
        setTimeout(() => {
            SplashScreen.hide();
        }, 500);
    }
}
