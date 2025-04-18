import { Component, computed } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonIcon, ModalController } from '@ionic/angular/standalone';
import { ItemRegisterComponent } from './components/ItemRegister/ItemRegister.component';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightRegisterComponent } from '../homePage/components/WeightRegister/WeightRegister.component';

@Component({
    selector: 'app-tab2',
    templateUrl: 'register.page.html',
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle,
        IonButton, ItemRegisterComponent,
        IonButtons, IonIcon
    ],
})
export class RegisterPage {

    registers = toSignal(this.weightTracker.weights$);

    readonly reversedRegisters = computed(() => {
        const list = this.registers()?.reverse();
        return list?.map((curr, i) => {
            const prev = list[i + 1];
            const progress = Number((prev ? curr?.weight - prev?.weight : 0).toFixed(2));
            return { ...curr, progress };
        });
    });


    constructor(private readonly weightTracker: WeightTrackerService, private readonly modalCtrl: ModalController) {
        this.weightTracker.updateWeights().subscribe();
        this.weightTracker.updateLastWeight().subscribe();
    }

    deleteWeight(id: number) {
        this.weightTracker.deleteWeight(id);
        this.weightTracker.updateWeights().subscribe();
    }

    async openModal() {
        const modal = await this.modalCtrl.create({
            component: WeightRegisterComponent,
            cssClass: 'small-modal',
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();
        if (role === 'confirm') {
            this.weightTracker.addWeight(data);
            this.weightTracker.updateWeights().subscribe();
        }
    }


}
