import { Component, computed, signal, ViewChild } from '@angular/core';
import { IonContent, ModalController, AlertController, IonSpinner } from '@ionic/angular/standalone';
import { ItemRegisterComponent } from './components/ItemRegister/ItemRegister.component';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightRegisterComponent } from '../../../components/modals/WeightRegisterModal/WeightRegisterModal.component';
import { Weight } from '@models/types/Weight.type';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-tab2',
    templateUrl: 'register.page.html',
    imports: [IonSpinner, IonContent, ItemRegisterComponent],
})
export class RegisterPage {
    readonly weights = toSignal(this.weightTracker.weights$, { initialValue: [] });
    readonly isPressingButton = signal(false);
    @ViewChild('contentRef', { static: false }) contentRef!: IonContent;
    readonly isRefreshing = signal(false);
    readonly limit = signal(10);


    readonly registers = computed(() => {
        const weights = this.weights();
        const limit = this.limit();
        if (!weights) return [];

        // Corta los pesos al límite especificado
        const paginated = weights.slice(0, limit);

        // Calcula progreso entre cada peso y el anterior inmediato
        return paginated.map((curr, i) => {
            const prev = weights[i + 1]; // Usa el índice global, no de `paginated`
            const progress = Number((prev ? curr.weight - prev.weight : 0).toFixed(2));
            return { ...curr, progress };
        });
    });


    constructor(
        private readonly translateService: TranslateService,
        private readonly weightTracker: WeightTrackerService,
        private readonly modalCtrl: ModalController,
        private readonly alertCtrl: AlertController
    ) { }

    async handleScroll() {
        const el = await this.contentRef.getScrollElement();
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;

        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

        if (isNearBottom && !this.isRefreshing() && this.registers().length < this.weights().length) {
            this.loadMoreItems();
        }
    }

    loadMoreItems() {
        this.isRefreshing.set(true);
        setTimeout(() => {
            this.limit.update((limit) => limit + 10);
            this.isRefreshing.set(false);
        },1000);
    }

    async confirmDelete(id: number, deleteCallback: () => void, cancelCallback: () => void) {
        if (this.isPressingButton()) return;
        this.isPressingButton.set(true);

        let alert;

        if (this.registers()?.length === 1) {
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
