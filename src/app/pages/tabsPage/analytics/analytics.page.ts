import { Component } from '@angular/core';
import { WeightLossPaceComponent } from './components/WeightLossPace/WeightLossPace.component';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, IonButton, AlertController } from '@ionic/angular/standalone';
import { DocumentsService } from '@services/Documents.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-analitics',
    templateUrl: './analytics.page.html',
    standalone: true,
    imports: [IonButton, IonContent, WeightLossPaceComponent, TranslateModule],
})
export class AnaliticsPage {

    weights = toSignal(this.weightTracker.weights$);
    lastWeight = toSignal(this.weightTracker.lastWeight$);
    goal = toSignal(this.userConfig.goal$);
    isButtonActive = false

    constructor(
        private readonly translateService: TranslateService,
        private readonly weightTracker: WeightTrackerService,
        private readonly userConfig: UserConfigService,
        private readonly documentService: DocumentsService,
        private readonly alertCtrl: AlertController
    ) { }

    async alertExport() {
        this.isButtonActive = true;
        const alert = await this.alertCtrl.create({
            header:  this.translateService.instant('TAB3.EXPORT_ALERT.TITLE'),
            message: this.translateService.instant('TAB3.EXPORT_ALERT.MESSAGE'),
            cssClass: 'small-alert export-alert',
            buttons: [
                {
                    text: this.translateService.instant('KEY_WORDS.CANCEL'),
                    role: 'cancel',
                },
                {
                    text: this.translateService.instant('KEY_WORDS.OK'),
                    role: 'confirm',
                    handler: () => this.documentService.exportAllDataToCSV(),
                },
            ],
        });
        await alert.present();
        this.isButtonActive = false;
    }
}
