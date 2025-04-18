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
    standalone: true,
    imports: [IonButton, ChartModule],
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplay {
    // Inputs / Outputs
    readonly weights = input.required<Weight[]>();
    readonly lastWeight = input.required<Weight | null>();
    readonly firstWeight = input.required<Weight | null>();
    readonly goal = input.required<Weight | null>();



    weightAdded = output<Weight>();

    // Signals
    isButtonActive = signal(false);

    // Computed progression
    progression: Signal<number> = computed(() => {
        return this.calculationFunctionsService.weightProgression(
            this.firstWeight()?.weight ?? NaN,
            this.lastWeight()?.weight ?? NaN,
            this.goal()?.weight ?? NaN
        );
    });

    // Chart data
    doughnutChart: any;
    data!: DatasetChartOptions;
    options!: DatasetChartOptions;
    plugins: any = [];

    constructor(
        private readonly calculationFunctionsService: CalculationFunctionsService,
        private readonly modalCtrl: ModalController,
        private readonly cdr: ChangeDetectorRef
    ) {
        effect(() => {
            const weights = this.weights();
            this.goal();

            if (!weights) return;
            this.updateChart();
        });
    }

    private updateChart() {;


        this.doughnutChart = DoughnutChart(this.progression);
        this.data = this.doughnutChart.data;
        this.options = this.doughnutChart.options;

        this.plugins.push(centerTextPlugin(this.progression, this.lastWeight));

        if (Number.isNaN(this.progression())) return;
        this.plugins.push(customSVGsPluginForDoughnutChart());

        this.cdr.detectChanges();
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
