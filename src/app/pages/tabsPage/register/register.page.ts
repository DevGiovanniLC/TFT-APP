import { Component, computed, signal } from '@angular/core';
import { IonContent, ModalController, AlertController } from '@ionic/angular/standalone';
import { ItemRegisterComponent } from './components/ItemRegister/ItemRegister.component';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightRegisterComponent } from '../../../components/modals/WeightRegisterModal/WeightRegisterModal.component';
import { Weight } from '@models/types/Weight';

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
        private readonly weightTracker: WeightTrackerService,
        private readonly modalCtrl: ModalController,
        private readonly alertCtrl: AlertController
    ) {}

    async confirmDelete(id: number) {
        if (this.isPressingButton()) return;
        this.isPressingButton.set(true);

        let alert;

        if (this.reversedRegisters()?.length === 1) {
            alert = await this.alertCtrl.create({
                header: 'Deletion Not Allowed',
                message: `This is the only weight entry in your register. At least one entry must be kept`,
                cssClass: 'small-alert',
                buttons: [
                    {
                        text: 'OK',
                        role: 'cancel',
                    },
                ],
            });
        } else {
            alert = await this.alertCtrl.create({
                header: 'DELETE WEIGHT',
                message: `Are you sure you want to delete this weight entry? \n This action cannot be undone.`,
                cssClass: 'small-alert',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                    },
                    {
                        text: 'Delete',
                        role: 'confirm',
                        handler: () => {
                            this.deleteWeight(id);
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
