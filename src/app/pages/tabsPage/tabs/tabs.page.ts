import { Component, EnvironmentInjector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonTitle } from '@ionic/angular/standalone';
import { ModalWeightButtonComponent } from './components/ModalWeightButton/ModalWeightButton.component';
import { ModalUserButtonComponent } from './components/ModalUserButton/ModalUserButton.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    imports: [
        IonTabs,
        IonTabBar,
        IonTabButton,
        IonIcon,
        IonLabel,
        IonHeader,
        IonTitle,
        ModalWeightButtonComponent,
        ModalUserButtonComponent,
        TranslateModule,
    ],
})
export class TabsPage {
    public environmentInjector = inject(EnvironmentInjector);

    constructor(public readonly router: Router) {}

    isCurrentTab(tab: string): boolean {
        return this.router.url.includes(tab);
    }
}
