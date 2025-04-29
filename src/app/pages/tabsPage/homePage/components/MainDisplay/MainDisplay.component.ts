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
} from '@angular/core';
import { Weight } from '@models/types/Weight';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightRegisterComponent } from '@pages/tabsPage/homePage/components/WeightRegister/WeightRegister.component';
import { TextPlugin, SVGIconsPlugin } from '@plugins/chartjs/HomeDoughnutPlugin';
import HomeDoughnutChart from '@models/charts/HomeDoghnoutChart';
import { ChartData, ChartOptions, Plugin } from 'chart.js';

@Component({
    selector: 'app-main-display',
    standalone: true,
    imports: [IonButton, ChartModule],
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplay {
    // Inputs / Outputs
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
    data!: ChartData<'doughnut'>;
    options!: ChartOptions<'doughnut'>;
    plugins = signal<Plugin[]>([]);

    constructor(
        private readonly calculationFunctionsService: CalculationFunctionsService,
        private readonly modalCtrl: ModalController,
        private readonly cdr: ChangeDetectorRef
    ) {
        effect(() => this.updateChart(this.progression, this.lastWeight));
    }



    private updateChart(progression: Signal<number>, lastWeight: Signal<Weight | null>) {
        const doughnutChart: any = new HomeDoughnutChart(progression());
        this.data = doughnutChart.getData();
        this.options = doughnutChart.getOptions();
        this.plugins.update(() => []);

        this.plugins.update((p: Plugin[]) => {
            p.push(TextPlugin(progression, lastWeight));
            return p;
        });


        if (Number.isNaN(progression())) return;

        this.plugins.update((p: Plugin[]) => {
            p.push(SVGIconsPlugin());
            return p;
        });

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
