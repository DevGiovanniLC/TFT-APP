import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { BMIDoughnutChart } from '@models/charts/BMIDoghnoutChart';
import { BMIPluginDoughnut } from '@plugins/chartjs/BMIDoughnutPlugin';
import { ChartData, ChartOptions, Plugin } from 'chart.js';

@Component({
    selector: 'app-bmichart',
    imports: [ChartModule],
    templateUrl: './BMIChart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMIChartComponent {

    bmi = input.required<number | null>();
    data!: ChartData<'doughnut'>;
    options!: ChartOptions<'doughnut'>;
    plugins: Plugin[] = [];

    constructor(private readonly cdr: ChangeDetectorRef) {
        effect(() => {
            const bmi = this.bmi();

            if (
                Number.isNaN(this.bmi()) ||
                !bmi
            ) return;

            this.updateChart(bmi);
        })
    }

    updateChart(bmi: number) {
        const chart = new BMIDoughnutChart(bmi);
        this.data = chart.getData();
        this.options = chart.getOptions();
        this.plugins.pop()
        this.plugins.push(BMIPluginDoughnut(bmi));

        this.cdr.detectChanges();
    }

}
