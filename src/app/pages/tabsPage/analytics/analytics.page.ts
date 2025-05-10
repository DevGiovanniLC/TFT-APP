import { Component, OnInit } from '@angular/core';
import { WeightLossPaceComponent } from './components/WeightLossPace/WeightLossPace.component';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, IonButton, AlertController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-analitics',
    templateUrl: './analytics.page.html',
    standalone: true,
    imports: [IonButton, IonContent, WeightLossPaceComponent],
})
export class AnaliticsPage implements OnInit {

    weights = toSignal(this.weightTracker.weights$);
    lastWeight = toSignal(this.weightTracker.lastWeight$);
    goal = toSignal(this.userConfig.goal$);
    isButtonActive = false

    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly userConfig: UserConfigService,
        private readonly alertCtrl: AlertController
    ) { }

    ngOnInit() {
        this.weightTracker.getWeights().subscribe();
        this.weightTracker.getLastWeight().subscribe();
        this.userConfig.getGoal().subscribe();
    }

    async alertExport() {
        this.isButtonActive = true;
        const alert = await this.alertCtrl.create({
            header: 'Export CSV',
            message: 'Are you sure you want to export your data to CSV?',
            cssClass: 'small-alert export-alert',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Export',
                    role: 'confirm',
                    handler: () =>  this.weightTracker.exportDataCSV()
                },
            ],
        });
        await alert.present();
        this.isButtonActive = false;
    }
}
