import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    input,
    output,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { Weight, emptyWeight } from '@models/types/Weight';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightRegisterComponent } from '@pages/tabsPage/homePage/components/WeightRegister/WeightRegister.component';
import { centerTextPlugin, customSVGsPluginForDoughnutChart } from '@plugins/chartjs/ChartPlugins';
import { DoughnutChart } from '@models/charts/DoghnoutChart';
import { DatasetChartOptions } from 'chart.js';

@Component({
    selector: 'app-main-display',
    imports: [IonButton, ChartModule],
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplay {
    readonly weights = input.required<Weight[]>();
    readonly goal = input.required<Weight>();
    weightAdded = output<Weight>();

    firstWeight: WritableSignal<Weight> = signal(emptyWeight);
    lastWeight: WritableSignal<Weight> = signal(emptyWeight);
    progression: Signal<number> = computed(() => {
        return this.calculationFunctionsService.weightProgression(
            this.firstWeight()?.weight,
            this.lastWeight()?.weight,
            this.goal()?.weight
        );
    });

    doghnoutChart: any;
    data!: DatasetChartOptions;
    options!: DatasetChartOptions;
    plugins: any = [];

    isButtonActive = signal(false);

    constructor(
        private readonly calculationFunctionsService: CalculationFunctionsService,
        private readonly modalCtrl: ModalController,
        private readonly cdr: ChangeDetectorRef
    ) {
        effect(() => {
            this.goal();
            this.weights();
            this.updateChart(this.cdr);
        });
    }

    async updateChart(cdr: ChangeDetectorRef) {
        if (this.weights().length <= 0) return;
        this.lastWeight.set(this.weights()[this.weights().length - 1]);
        this.firstWeight.set(this.weights()[0]);

        this.doghnoutChart = DoughnutChart(this.progression);
        this.data = this.doghnoutChart.data;
        this.options = this.doghnoutChart.options;

        this.plugins.push(centerTextPlugin(this.progression, this.lastWeight));

        if (Number.isNaN(this.progression())) return;

        this.plugins.push(customSVGsPluginForDoughnutChart());

        cdr.detectChanges();
    }

    async openModal() {
        this.isButtonActive.set(true);
        const modal = await this.modalCtrl.create({
            component: WeightRegisterComponent,
            cssClass: 'small-modal',
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm') {
            this.weightAdded.emit(data as Weight);
        }
        this.isButtonActive.set(false);
    }
}
