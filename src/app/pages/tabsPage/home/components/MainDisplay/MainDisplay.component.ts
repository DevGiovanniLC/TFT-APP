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
import { WeightRegisterComponent } from '@components/modals/WeightRegisterModal/WeightRegisterModal.component';
import { TextPlugin, SVGIconsPlugin } from '@models/charts/plugins/HomeDoughnutPlugin';
import HomeDoughnutChart from '@models/charts/HomeDoghnoutChart';
import { ChartData, ChartOptions, Plugin } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { Goal } from '@models/types/Goal';

@Component({
    selector: 'app-main-display',
    standalone: true,
    imports: [IonButton, ChartModule],
    styleUrl: './MainDisplay.component.css',
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplay {
    // Inputs / Outputs
    readonly lastWeight = input.required<Weight | undefined>();
    readonly firstWeight = input.required<Weight | undefined>();
    readonly goal = input.required<Goal | undefined>();
    readonly weightAdded = output<Weight>();

    // Signals
    isButtonActive = signal(false);
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
    readonly plugins = signal<Plugin[]>([]);

    constructor(
        private readonly calculationFunctionsService: CalculationFunctionsService,
        private readonly modalCtrl: ModalController,
        private readonly cdr: ChangeDetectorRef,
        private readonly route: ActivatedRoute
    ) {
        this.plugins.update((p: Plugin[]) => {
            p.push(TextPlugin(this.progression, this.lastWeight));
            return p;
        });

        effect(() => this.updateChart(this.progression));
    }

    ngOnInit() {
        this.route.url.subscribe(() => {
            this.updateChart(this.progression);
        });
    }

    private updateChart(progression: Signal<number>) {
        const doughnutChart = new HomeDoughnutChart(progression());
        this.data = doughnutChart.getData();
        this.options = doughnutChart.getOptions();

        if (Number.isNaN(this.progression())) return;

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
