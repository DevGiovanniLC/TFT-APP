import 'chartjs-adapter-date-fns';
import { Component, effect, input, signal, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Weight } from '@models/types/Weight';
import annotationPlugin from 'chartjs-plugin-annotation';
import HomeWeightChart from '@models/charts/HomeWeightChart';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { TimeService } from '@services/Time.service';
import { Goal } from '@models/types/Goal';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightGraphicZoomButtonComponent } from '../WeightGraphicZoomButton/WeightGraphicZoomButton.component';
import zoomPlugin from 'chartjs-plugin-zoom';



@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule, IonSelect, IonSelectOption, WeightGraphicZoomButtonComponent],
    styleUrl: './WeightGraphic.component.css',
    templateUrl: './WeightGraphic.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphic {
    readonly weights = input.required<Weight[]>();
    readonly goal = input.required<Goal | undefined>();

    data!: ChartData<'line'>;
    options!: ChartOptions<'line'>;

    chartMode = signal('total');
    isEmpty = signal(false);

    constructor(
        private readonly timeService: TimeService,
        private readonly calculateFunctionsService: CalculationFunctionsService
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
                    (w) => w.date.getTime() > this.timeService.now().getTime() - 7 * 24 * 60 * 60 * 1000 && w.date.getTime() < this.timeService.now().getTime()
                )
            );
        } else if (this.chartMode() == 'month') {
            weights.set(
                this.weights().filter(
                    (w) => w.date.getTime() > this.timeService.now().getTime() - 30 * 24 * 60 * 60 * 1000 && w.date.getTime() < this.timeService.now().getTime()
                )
            );
        }

        if (weights().length == 0) this.isEmpty.set(true);
        else this.isEmpty.set(false);

        const weightChart = new HomeWeightChart(this.calculateFunctionsService, this.chartMode, weights, this.goal);

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
