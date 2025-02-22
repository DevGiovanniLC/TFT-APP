import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DataProviderService } from 'src/services/DataProvider.service';
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
    await this.dataProvider.initialize();
    SplashScreen.hide();
  }
}
