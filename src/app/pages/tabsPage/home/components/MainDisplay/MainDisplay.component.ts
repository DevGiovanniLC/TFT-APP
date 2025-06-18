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
import { Weight } from '@models/types/Weight.type';
import { IonButton, ModalController, IonCard } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { WeightRegisterComponent } from '@components/modals/WeightRegisterModal/WeightRegisterModal.component';
import { TextPlugin, SVGIconsPlugin } from '@models/charts/plugins/HomeDoughnutPlugin';
import HomeDoughnutChart from '@models/charts/HomeDoghnoutChart';
import { ChartData, ChartOptions, Plugin } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { Goal } from '@models/types/Goal.type';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TimeService } from '@services/Time.service';

@Component({
    selector: 'app-main-display',
    standalone: true,
    imports: [IonCard, IonButton, ChartModule, DatePipe, TranslateModule],
    styleUrl: './MainDisplay.component.css',
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplayComponent {
    // Inputs / Outputs
    readonly lastWeight = input.required<Weight | undefined>();
    readonly firstWeight = input.required<Weight | undefined>();
    readonly goal = input.required<Goal | undefined>();
    readonly weightAdded = output<Weight>();

    // Signals
    isButtonActive = signal(false);
    progression: Signal<number> = computed(() =>
        this.calculationFunctionsService.weightProgression(
            this.firstWeight()?.weight ?? NaN,
            this.lastWeight()?.weight ?? NaN,
            this.goal()?.weight ?? NaN
        )
    );

    // Chart data
    data!: ChartData<'doughnut'>;
    options!: ChartOptions<'doughnut'>;
    readonly plugins = signal<Plugin[]>([]);

    constructor(
        private readonly translateService: TranslateService,
        private readonly timeService: TimeService,
        private readonly calculationFunctionsService: WeightAnalysisService,
        private readonly modalCtrl: ModalController,
        private readonly cdr: ChangeDetectorRef,
        private readonly route: ActivatedRoute
    ) {
        this.plugins.set([
            SVGIconsPlugin(this.progression),
            TextPlugin(this.translateService, this.timeService, this.progression, this.lastWeight),
        ]);

        effect(() => {
            this.lastWeight() // No quitar fuerza actualización cuando se agrega un peso
            this.updateChart(this.progression);
        });
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
