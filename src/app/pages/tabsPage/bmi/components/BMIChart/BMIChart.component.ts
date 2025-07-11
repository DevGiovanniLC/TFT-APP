import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, input, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { BMIDoughnutChart } from '@models/charts/BMIDoghnoutChart';
import { BMIPluginDoughnut } from '@models/charts/plugins/BMIDoughnutPlugin';
import { ChartData, ChartOptions, Plugin } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BMIService } from '@services/BMI.service';

@Component({
    selector: 'app-bmichart',
    imports: [ChartModule],
    styleUrl: './BMIChart.component.css',
    templateUrl: './BMIChart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMIChartComponent {
    bmi = input.required<number | null>();
    data!: ChartData<'doughnut'>;
    options!: ChartOptions<'doughnut'>;
    plugins = signal<Plugin[]>([]);

    constructor(
        private readonly translateService: TranslateService,
        private readonly bmiService: BMIService,
        private readonly cdr: ChangeDetectorRef,
        private readonly route: ActivatedRoute
    ) {
        effect(() => {
            this.updateChart(this.bmi());
        });
    }

    ngOnInit() {
        this.route.url.subscribe(() => {
            this.updateChart(this.bmi());
        });
    }

    updateChart(bmiRaw: number | null) {
        const bmi = bmiRaw;
        if (Number.isNaN(bmi) || !bmi) return;

        this.cdr.detectChanges();
        const chart = new BMIDoughnutChart(this.bmiService, bmiRaw);
        this.data = chart.getData();
        this.options = chart.getOptions();
        this.plugins.update((p) => {
            p.pop();
            p.push(BMIPluginDoughnut(this.translateService, this.bmiService, bmi));
            return p
        });
        this.cdr.detectChanges();
    }
}
