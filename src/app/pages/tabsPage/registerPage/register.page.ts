import { Component, computed } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { ItemRegisterComponent } from './components/ItemRegister/ItemRegister.component';
import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { toSignal } from '@angular/core/rxjs-interop';
@Component({
    selector: 'app-tab2',
    templateUrl: 'register.page.html',
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, ItemRegisterComponent],
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


    constructor(private readonly weightTracker: WeightTrackerService) {
        this.weightTracker.updateWeights().subscribe();
    }




}
