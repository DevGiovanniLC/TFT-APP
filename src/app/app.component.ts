import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DataProviderService } from '@services/data-providers/DataProvider.service';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor(private dataProvider: DataProviderService) {
        this.initApp();
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
