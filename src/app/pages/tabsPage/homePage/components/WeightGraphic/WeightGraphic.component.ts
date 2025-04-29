import 'chartjs-adapter-date-fns';
import { Component, effect, input, signal, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Weight } from '@models/types/Weight';
import annotationPlugin from 'chartjs-plugin-annotation';
import HomeWeightChart from '@models/charts/HomeWeightChart';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { TimeService } from '@services/Time.service';

@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule, IonSelect, IonSelectOption],
    templateUrl: './WeightGraphic.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphic {
    readonly weights = input.required<Weight[]>();
    readonly goal = input.required<Weight | null>();

    data!: ChartData<'line'>;
    options!: ChartOptions<'line'>;

    chartMode = signal('total');
    isEmpty = signal(false);

    constructor(private readonly timeService: TimeService) {
        Chart.register(annotationPlugin);

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
                    (w) => w.date.getTime() > this.timeService.now().getTime() - 7 * 24 * 60 * 60 * 1000
                )
            );
        } else if (this.chartMode() == 'month') {
            weights.set(
                this.weights().filter(
                    (w) => w.date.getTime() > this.timeService.now().getTime() - 30 * 24 * 60 * 60 * 1000
                )
            );
        }

        if (weights().length == 0) this.isEmpty.set(true);
        else this.isEmpty.set(false);

        const weightChart: any = new HomeWeightChart(this.chartMode, weights, this.goal);

        this.data = weightChart.getData();
        this.options = weightChart.getOptions();
    }

    validateGoalDate() {
        if (!isNaN(this.goal()?.date?.getTime() ?? NaN)) return true;
        return false;
    }

    setChartMode(value: string) {
        this.chartMode.set(value);
    }
}
