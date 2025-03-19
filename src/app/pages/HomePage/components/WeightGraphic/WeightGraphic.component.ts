import 'chartjs-adapter-date-fns';
import { Component, effect, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Weight } from '@models/types/Weight';
import annotationPlugin from 'chartjs-plugin-annotation';
import { configurationAnnotationPlugin, WeightChart } from '@models/charts/WeightChart';
import { Chart } from 'chart.js';

@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule, IonSelect, IonSelectOption],
    templateUrl: './WeightGraphic.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphic {
    readonly weights = input.required<Weight[]>();
    readonly goal = input.required<Weight>();
    weightChart: any;
    data: any;
    options: any;


    viewGoal = signal(true);

    constructor() {
        Chart.register(annotationPlugin);

        effect(() => {
            this.weightChart = WeightChart(this.viewGoal, this.weights, this.goal);

            this.data = this.weightChart.data;
            this.options = this.weightChart.options;
        });

    }

    graphicMode(value: string) {
        if (value === 'viewGoal') {
            this.viewGoal.set(true);
        } else {
            this.viewGoal.set(false);
        }
    }


}
