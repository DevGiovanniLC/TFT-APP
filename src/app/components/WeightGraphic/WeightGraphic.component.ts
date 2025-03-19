import 'chartjs-adapter-date-fns';
import { Component, effect, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Weight } from '@models/types/Weight';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart } from 'chart.js';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { infinite } from 'ionicons/icons';

@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule, IonSelect, IonSelectOption],
    templateUrl: './WeightGraphic.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphic {
    readonly weights = input.required<Weight[]>();
    readonly goal = input.required<Weight>();

    data = signal({});
    options = signal({});

    viewGoal = signal(true);

    text = {
        viewGoal: 'View Goal',
        hideGoal: 'Only Tracked Progress',
    };

    constructor(private calculationFunctionsService: CalculationFunctionsService) {
        effect(() => {
            this.options.set(
                this.configureOptionGraphic(this.viewGoal(), this.weights(), this.goal())
            );
            this.data.set(this.configureDataGraphic(this.weights()));
        });
    }

    ngOnInit() {
        Chart.register(annotationPlugin);
    }

    graphicMode(value: string) {
        if (value === 'viewGoal') {
            this.viewGoal.set(true);
        }else{
            this.viewGoal.set(false);
        }
    }

    private configureDataGraphic(weights: Weight[]) {
        return {
            labels: weights.map((w) => this.calculationFunctionsService.formatDate(w.date).getTime()),
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: weights.map((w) => w.weight),
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.4,
                },
            ],
        };
    }

    private configurationAnnotationPlugin(viewGoal: boolean, goal: number, goalDate: Date): any {
        return {
            goalLabel: {
                type: 'label',
                yValue: goal + 2,
                xValue: viewGoal ? goalDate : NaN,
                content: ['Goal'],
                padding: 0,
                color: '#343A40',
                font: {
                    size: 11,
                },
            },
            goalLine: {
                type: 'line',
                yMin: goal,
                yMax: goal,
                borderColor: '#343A40',
                borderWidth: 2,
                borderDash: [5, 5],
            },
            goalPoint: {
                type: 'point',
                xValue: goalDate,
                yValue: goal,
                backgroundColor: '#1E8260',
                radius: 3,
                borderWidth: 2,
                borderColor: '#00BD7E',
            },
        };
    }

    private configureOptionGraphic(viewGoal: boolean, dataWeights: Weight[], goal: Weight) {
        if (dataWeights.length === 0) return [];

        const goalWeight = goal && typeof goal === 'object' ? goal.weight : -infinite;
        const goalDate = goal && typeof goal === 'object' ? goal.date : null;

        const minWeight = Math.min(...dataWeights.map((w) => w.weight));
        const maxWeight = Math.max(...dataWeights.map((w) => w.weight));
        const maxRangeY = goalWeight ? maxWeight - Math.min(minWeight, goalWeight) : maxWeight - minWeight;
        const marginY = maxRangeY * 0.2 || 1; // Si el rango es 0, se asigna un margen mínimo

        const validDates = dataWeights.map((w) => new Date(w.date));
        const maxDate = Math.max(...validDates.map((w) => w.getTime()));
        const minDate = Math.min(...validDates.map((w) => w.getTime()));
        const rangeX = goalDate ? new Date(Math.max(maxDate, goalDate.getTime())) : new Date(maxDate);
        let goalDateRange;

        if (viewGoal && goal?.weight > 0) {
            goalDateRange = new Date(rangeX.getTime() + 15 * 24 * 60 * 60 * 1000);
        } else {
            goalDateRange = new Date(maxDate + 15 * 24 * 60 * 60 * 1000);
        }

        let pluginAnnotation

        if (viewGoal && goal?.weight > 0) {
            pluginAnnotation = this.configurationAnnotationPlugin(viewGoal, goal.weight, goal.date);
        }else {
            pluginAnnotation = [];
        }


        return {
            responsive: true,
            maintainAspectRatio: true,
            pointBackgroundColor: '#00BD7E',
            elements: {
                point: {
                    radius: 5,
                    hitRadius: 8,
                    hoverRadius: 8,
                }
            },
            plugins: {
                annotation: {
                    annotations: pluginAnnotation,
                },
                legend: {
                    display: false,
                    onClick: () => { },
                    position: 'top',
                },
                centerText: false
            },
            scales: {
                x: {
                    type: 'time', // Eje de tiempo para las fechas
                    min: minDate,
                    max: goalDateRange, // Fecha máxima (ajústala según tu dataset)
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd',
                        },
                    },
                    title: {
                        display: false,
                        text: 'Date',
                    },
                    ticks: {
                        padding:15,
                        color: '#343a40',
                        maxTicksLimit: 6,
                    },
                },
                y: {
                    // Se establece el rango "acercado" usando el mínimo y máximo en base a la meta con margen y redondeo al entero mayor
                    min: goalWeight ? Math.ceil(Math.min(minWeight, goalWeight) - marginY) : Math.ceil(minWeight - marginY),
                    max: goalWeight ? Math.ceil(Math.max(maxWeight, goalWeight) + marginY) : Math.ceil(maxWeight + marginY),
                    title: {
                        display: false,
                        text: 'Weights (kg)',
                    },
                    ticks: {
                        callback: function(value: number) {
                            return `${value} ${dataWeights[0].weight_units}` ; // Agrega "kg" como sufijo a los valores del eje Y
                        },
                        font: {
                            size: 10 // Ajusta el tamaño de la fuente (puedes probar con otros valores)
                        },
                        color: '#343a40',
                    },
                },
            },
        };
    }
}
