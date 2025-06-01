import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { UserConfigService } from '@services/UserConfig.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { EventAdviceService } from '@services/EventAdvice.service';
import { TranslateService } from '@ngx-translate/core';
import { DeviceInfoService } from '@services/DeviceInfo.service';
import { ServiceHolder } from '@services/ServiceHolder';
import { BMIService } from '@services/BMI.service';



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
        private readonly translate: TranslateService,
        private readonly bmiService: BMIService,
        // No quitar necesario para inicializar constructor
        private readonly deviceInfo: DeviceInfoService,
        private readonly eventAdvice: EventAdviceService,
    ) {
        this.initServices();
        this.initApp();
    }

    private initApp() {
        this.dataProvider.initialize().then((connectionStatus) => {
            if (!connectionStatus) throw new Error('Connection to database failed, please try again or reinstall the app');
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

    private initServices() {
        ServiceHolder.init(
            {
                translateService: this.translate,
                BMIService: this.bmiService
            }
        );
    }

    private hideSplash() {
        setTimeout(() => {
            SplashScreen.hide();
        }, 500);
    }
}
