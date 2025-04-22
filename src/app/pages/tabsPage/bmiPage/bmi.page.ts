import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { BMIChartComponent } from './components/BMIChart/BMIChart.component';

@Component({
    selector: 'app-tab3',
    templateUrl: 'bmi.page.html',
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle,
        BMIChartComponent,
    ],
})
export class BMIPage {
    constructor() {}
}
