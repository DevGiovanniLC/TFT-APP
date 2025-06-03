import { Component, computed, signal } from '@angular/core';
import { IonContent, ModalController, AlertController } from '@ionic/angular/standalone';
import { ItemRegisterComponent } from './components/ItemRegister/ItemRegister.component';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightRegisterComponent } from '../../../components/modals/WeightRegisterModal/WeightRegisterModal.component';
import { Weight } from '@models/types/Weight.type';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-tab2',
    templateUrl: 'register.page.html',
    imports: [IonContent, ItemRegisterComponent],
})
export class RegisterPage {
    readonly registers = toSignal(this.weightTracker.weights$, { initialValue: [] });
    readonly isPressingButton = signal(false);

    readonly reversedRegisters = computed(() => {
        return this.registers()?.map((curr, i) => {
            const prev = this.registers()?.[i + 1];
            const progress = Number((prev ? curr?.weight - prev?.weight : 0).toFixed(2));
            return { ...curr, progress };
        });
    });

    constructor(
        private readonly translateService: TranslateService,
        private readonly weightTracker: WeightTrackerService,
        private readonly modalCtrl: ModalController,
        private readonly alertCtrl: AlertController
    ) {}

    async confirmDelete(id: number, deleteCallback: () => void, cancelCallback: () => void) {
        if (this.isPressingButton()) return;
        this.isPressingButton.set(true);

        let alert;

        if (this.reversedRegisters()?.length === 1) {
            alert = await this.alertCtrl.create({
                header: this.translateService.instant('TAB4.ALERT_DELETE_NOT_ALLOWED.TITLE'),
                message: this.translateService.instant('TAB4.ALERT_DELETE_NOT_ALLOWED.MESSAGE'),
                cssClass: 'small-alert',
                buttons: [
                    {
                        text: this.translateService.instant('KEY_WORDS.OK'),
                        role: 'cancel',
                        handler: () => {
                            cancelCallback();
                        },
                    },
                ],
            });
        } else {
            alert = await this.alertCtrl.create({
                header: this.translateService.instant('TAB4.ALERT_DELETE_CONFIRM.TITLE'),
                message: this.translateService.instant('TAB4.ALERT_DELETE_CONFIRM.MESSAGE'),
                cssClass: 'small-alert',
                buttons: [
                    {
                        text: this.translateService.instant('KEY_WORDS.CANCEL'),
                        role: 'cancel',
                        handler: () => {
                            cancelCallback();
                        },
                    },
                    {
                        text: this.translateService.instant('KEY_WORDS.DELETE'),
                        role: 'confirm',
                        handler: () => {
                            deleteCallback();
                            setTimeout(() => this.deleteWeight(id), 450);
                        },
                    },
                ],
            });
        }
        await alert.present();
        this.isPressingButton.set(false);
    }

    deleteWeight(id: number) {
        this.weightTracker.deleteWeight(id);
    }

    async openWeightModal(weight?: Weight) {
        if (this.isPressingButton()) return;
        this.isPressingButton.set(true);

        const modal = await this.modalCtrl.create({
            component: WeightRegisterComponent,
            cssClass: 'small-modal',
            componentProps: { inputWeight: weight ?? null },
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();
        if (role === 'confirm') {
            if (weight) {
                this.weightTracker.updateWeight(data);
            } else {
                this.weightTracker.addWeight(data);
            }
        }
        this.isPressingButton.set(false);
    }
}
