import 'chartjs-adapter-date-fns';
import { Component, effect, Signal, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Weight } from '@models/Weight';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart } from 'chart.js';

@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule, IonButton],
    templateUrl: './WeightGraphic.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphic {
    readonly weights = input.required<Signal<Weight[]>>();
    readonly goal = input.required<Signal<Weight>>();

    data = signal({});
    options = signal({});

    viewGoal = signal(true);

    text = {
        viewGoal: 'View Goal',
        hideGoal: 'Only Tracked Progress',
    };

    constructor() {
        effect(() => {
            const goal = this.goal();
            const weights = this.weights();
            this.options.set(
                this.configureOptionGraphic(this.viewGoal(), weights(), goal().weight, new Date(goal().date))
            );
            this.data.set(this.configureDataGraphic(this.weights()()));
        });
    }

    ngOnInit() {
        Chart.register(annotationPlugin);
    }

    toggleViewGoal() {
        this.viewGoal.update((value) => !value);
    }

    private configureDataGraphic(weights: Weight[]) {
        return {
            labels: weights.map((w) => w.date),
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

    private configureOptionGraphic(viewGoal: boolean, dataWeights: Weight[], goal: number, goalDate: Date) {
        if (dataWeights.length === 0 || isNaN(goalDate.getTime()) || isNaN(goal)) return [];

        const minWeight = Math.min(...dataWeights.map((w) => w.weight));
        const maxWeight = Math.max(...dataWeights.map((w) => w.weight));
        const MaxRangeY = maxWeight - Math.min(minWeight, goal);
        const marginY = MaxRangeY * 0.2 || 1; // Si el rango es 0, se asigna un margen mínimo

        const validDates = dataWeights.map((w) => new Date(w.date));
        const maxDate = Math.max(...validDates.map((w) => w.getTime()));
        const minDate = Math.min(...validDates.map((w) => w.getTime()));
        const rangeX = new Date(Math.max(maxDate, goalDate.getTime()));
        let goalDateRange;

        if (viewGoal) {
            goalDateRange = new Date(rangeX.getTime() + 15 * 24 * 60 * 60 * 1000); // Sumar 15 días para que haya un padding en la gráfica
        } else {
            goalDateRange = new Date(maxDate + 15 * 24 * 60 * 60 * 1000); // Sumar 15 días para que haya un padding en la gráfica
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
                    annotations: this.configurationAnnotationPlugin(viewGoal, goal, goalDate),
                },
                legend: {
                    display: true,
                    onClick: () => { },
                    position: 'top',
                },
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
                        color: '#343a40',
                        maxTicksLimit: 6,
                    },
                },
                y: {
                    // Se establece el rango "acercado" usando el mínimo y máximo en base a la meta con margen y redondeo al entero mayor
                    min: Math.ceil(Math.min(minWeight, goal) - marginY),
                    max: Math.ceil(Math.max(maxWeight, goal) + marginY),
                    title: {
                        display: false,
                        text: 'Weights (kg)',
                    },
                    ticks: {
                        color: '#343a40',
                    },
                },
            },
        };
    }
}
