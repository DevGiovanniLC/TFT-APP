import { Component, EnvironmentInjector, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
} from '@ionic/angular/standalone';
import { ModalWeightButtonComponent } from './components/ModalWeightButton/ModalWeightButton.component';
import { ModalUserButtonComponent } from './components/ModalUserButton/ModalUserButton.component';

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
        IonToolbar,
        IonTitle,
        ModalWeightButtonComponent,
        ModalUserButtonComponent,
    ],
})
export class TabsPage {
    public environmentInjector = inject(EnvironmentInjector);

    constructor(public router: Router) {}

    isCurrentTab(tab: string): boolean {
        return this.router.url.includes(tab);
    }
}
