import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, input, OnInit, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { BMIDoughnutChart } from '@models/charts/BMIDoghnoutChart';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { BMIPluginDoughnut } from '@plugins/chartjs/ChartPlugins';

@Component({
    selector: 'app-bmichart',
    imports: [ChartModule],
    templateUrl: './BMIChart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMIChartComponent{

    bmi = input.required<number | null>();
    data: any;
    options: any;
    plugins: any = [];

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
        const chart = BMIDoughnutChart(bmi);
        this.data = chart.data;
        this.options = chart.options;
        this.plugins.pop()
        this.plugins.push(BMIPluginDoughnut(bmi));

        this.cdr.detectChanges();
    }

}
