import 'chartjs-adapter-date-fns';
import { Component, effect, input, signal, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Weight } from '@models/types/Weight.type';
import annotationPlugin from 'chartjs-plugin-annotation';
import HomeWeightLineChart from '@models/charts/HomeWeightLineChart';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { TimeService } from '@services/Time.service';
import { Goal } from '@models/types/Goal.type';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { ChartZoomButtonComponent } from '../ChartZoomButton/ChartZoomButton.component';
import zoomPlugin from 'chartjs-plugin-zoom';
import { TranslateModule, TranslateService } from '@ngx-translate/core';



@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule, IonSelect, IonSelectOption, ChartZoomButtonComponent, TranslateModule],
    styleUrl: './WeightLineChart.component.css',
    templateUrl: './WeightLineChart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightLineChartComponent {
    readonly weights = input.required<Weight[]>();
    readonly goal = input.required<Goal | undefined>();

    data!: ChartData<'line'>;
    options!: ChartOptions<'line'>;

    chartMode = signal('total');
    isEmpty = signal(false);

    constructor(
        private readonly translateService: TranslateService,
        private readonly weightAnalysisService: WeightAnalysisService,
        private readonly timeService: TimeService,
    ) {
        Chart.register(annotationPlugin);
        Chart.register(zoomPlugin);

        effect(() => {
            this.updateWeightChart();
        });
    }

    async updateWeightChart() {
        if (!this.weights()) return;
        if (!this.goal()) return;

        const weights: WritableSignal<Weight[]> = signal(this.weights());

        if (this.chartMode() == 'week') {
            weights.set(
                this.weights().filter(
                    (w) => w.date.getTime() > this.timeService.now().getTime() - TimeService.MS_PER_WEEK && w.date.getTime() < this.timeService.now().getTime()
                )
            );
        } else if (this.chartMode() == 'month') {
            weights.set(
                this.weights().filter(
                    (w) => w.date.getTime() > this.timeService.now().getTime() - TimeService.MS_PER_MONTH && w.date.getTime() < this.timeService.now().getTime()
                )
            );
        }

        if (weights().length == 0) this.isEmpty.set(true);
        else this.isEmpty.set(false);

        const weightChart = new HomeWeightLineChart(this.translateService ,this.weightAnalysisService, this.chartMode, weights, this.goal);

        this.data = weightChart.getData();
        this.options = weightChart.getOptions();
    }

    validateGoalDate() {
        const date = this.goal()?.date;
        if (!date) return false;
        if (isNaN(date.getTime() ?? NaN)) return false;
        if (date.getTime() === new Date(0).getTime()) return false;
        return true;
    }

    setChartMode(value: string) {
        this.chartMode.set(value);
    }
}
