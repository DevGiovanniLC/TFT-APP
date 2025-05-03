import { Signal } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { ChartData, ChartOptions } from 'chart.js';
import { AnnotationOptions, LineAnnotationOptions } from 'chartjs-plugin-annotation';


export default class HomeWeightChart {
    private readonly chartMode: string;
    private readonly weights: Weight[];
    private readonly goal: Weight | null;
    private readonly viewTrend: boolean;


    constructor(chartMode: Signal<string>, weights: Signal<Weight[]>, goal: Signal<Weight | null>) {
        this.chartMode = chartMode();
        this.weights = weights();
        this.goal = goal();
        this.viewTrend = this.chartMode == 'viewGoal' && this.weights.length >= 7;
    }

    private calculateTrendData(dataWeights: Weight[], goal: Date | undefined) {

        //Calculo de la línea de tendencia basada en las últimas 2 semanas de datos
        const goalDate = goal && typeof goal === 'object' ? this.goal?.date : null;

        const lastWeight = dataWeights[dataWeights.length - 1];
        const lastDate = new Date(lastWeight.date).getTime();

        const recentWeights = dataWeights.filter(w => new Date(w.date).getTime() >= lastDate - 14 * 24 * 60 * 60 * 1000);
        const xData = recentWeights.map(w => new Date(w.date).getTime());
        const yData = recentWeights.map(w => w.weight);
        const n = xData.length;
        const sumX = xData.reduce((a, b) => a + b, 0);
        const sumY = yData.reduce((a, b) => a + b, 0);
        const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
        const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const futureTrendData = goalDate && !isNaN(goalDate.getTime()) ? [
            { x: lastDate, y: lastWeight.weight },
            { x: goalDate.getTime(), y: slope * goalDate.getTime() + intercept }
        ] : [];

        return futureTrendData;
    }

    getData(): ChartData<'line'> {
        const dataWeights = this.weights;


        return {
            labels: dataWeights.map((w) => new Date(w.date).getTime()),
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: dataWeights.map((w) => w.weight),
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.4,
                    pointRadius: (ctx: { chart: any; dataIndex: number }) => {
                        const dataset = ctx.chart.data.datasets[0];
                        const total = dataset.data.length;
                        let spacing = 0;

                        if (this.chartMode === 'viewGoal') {
                            spacing = Math.ceil(total / 5);
                        } else {
                            spacing = Math.ceil(total / 15);
                        }

                        const isFirst = ctx.dataIndex === 0;
                        const isLast = ctx.dataIndex === total - 1;
                        const isSpaced = ctx.dataIndex % spacing === 0;

                        return isFirst || isLast || total <= 20 || isSpaced ? 3 : 0;
                    }
                },
                {
                    label: 'Trend',
                    data: this.viewTrend ? this.calculateTrendData(dataWeights, this.goal?.date) : [],
                    parsing: false,
                    fill: false,
                    borderDash: [6, 6],
                    borderColor: '#ff6384',
                    pointRadius: 0,
                    tension: 0,
                    segment: {
                        borderDash: [6, 6]
                    },
                    hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'transparent',
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                },
            ],
        }
    }

    annotationConfig(chartMode: string, goalWeight: number, goalDate: Date | undefined) {
        if (!goalWeight) return [];
        if (!goalDate) return [];

        const goalLabel: AnnotationOptions = {
            type: 'label',
            yValue: goalWeight + 3,
            xValue: chartMode === 'viewGoal' ? goalDate.getTime() : NaN,
            content: ['Goal'],
            padding: 0,
            color: '#343A40',
            font: {
                size: 11,
            },
        };

        const goalLine: LineAnnotationOptions = {
            yMin: goalWeight,
            yMax: goalWeight,
            borderColor: '#343A40',
            borderWidth: 2,
            borderDash: [5, 5],
        };

        const goalPoint: AnnotationOptions = {
            type: 'point', // aquí sí puedes ponerlo
            xScaleID: 'x',
            yScaleID: 'y',
            xValue: goalDate.getTime(),
            yValue: goalWeight,
            backgroundColor: '#1E8260',
            radius: 5,
            borderWidth: 2,
            borderColor: '#00BD7E',
        };

        return {
            goalPoint,
            goalLabel,
            goalLine,
        };
    }

    getOptions(): ChartOptions<'line'> {
        const dataWeights = this.weights;

        // Verifica si el modo de gráfico es 'viewGoal' y si hay suficientes datos para mostrar la tendencia de una manera lógica
        const goalWeight = this.goal && typeof this.goal === 'object' ? this.goal?.weight : Number.POSITIVE_INFINITY;
        const goalDate = this.goal && typeof this.goal === 'object' ? this.goal?.date : null;

        // Rango de pesos para el eje Y
        const minWeight = Math.min(...dataWeights.map((w) => w.weight));
        const maxWeight = Math.max(...dataWeights.map((w) => w.weight));
        const maxRangeY = goalWeight ? maxWeight - Math.min(minWeight, goalWeight) : maxWeight - minWeight;
        const marginY = maxRangeY * 0.2 || 1;

        // Rango de fechas para el eje X
        const validDates = dataWeights.map((w) => new Date(w.date));
        const maxDate = Math.max(...validDates.map((w) => w.getTime()));
        const minDate = Math.min(...validDates.map((w) => w.getTime())) - 1 * 24 * 60 * 60 * 1000;
        const rangeX = goalDate ? new Date(Math.max(maxDate, goalDate.getTime())) : new Date(maxDate);
        let goalDateMaxRange;

        // Visualización de datos en base al modo de gráfico
        if (this.chartMode === 'viewGoal' && (this.goal?.weight ?? NaN) > 0) {
            goalDateMaxRange = new Date(rangeX.getTime() + 15 * 24 * 60 * 60 * 1000);
        } else if (this.chartMode === 'total') {
            goalDateMaxRange = new Date(maxDate + 15 * 24 * 60 * 60 * 1000);
        } else if (this.chartMode === 'week') {
            goalDateMaxRange = new Date(maxDate + 1 * 24 * 60 * 60 * 1000);
        } else if (this.chartMode === 'month') {
            goalDateMaxRange = new Date(maxDate + 1 * 24 * 60 * 60 * 1000);
        }

        goalDateMaxRange = goalDateMaxRange?.getTime();

        return {
            responsive: true,
            maintainAspectRatio: false,

            backgroundColor: '#00BD7E',
            elements: {
                point: {
                    hitRadius: 6,
                    hoverRadius: 7,
                },
            },
            plugins: {
                annotation: {
                    annotations: this.annotationConfig(this.chartMode, this.goal?.weight ?? NaN, this.goal?.date),
                },
                legend: {
                    display: this.viewTrend ? true : false,
                    onClick: () => { },
                    position: 'top',
                },
            },
            animation: {duration: 0 },
            scales: {
                x: {
                    type: 'time',
                    min: minDate,
                    max: goalDateMaxRange,
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
                        padding: 15,
                        color: '#343a40',
                        maxTicksLimit: 6,
                    },
                },
                y: {
                    min: goalWeight
                        ? Math.round(Math.min(minWeight, goalWeight) - marginY)
                        : Math.round(minWeight - marginY),
                    max: goalWeight
                        ? Math.round(Math.max(maxWeight, goalWeight) + marginY)
                        : Math.round(maxWeight + marginY),
                    title: {
                        display: false,
                        text: 'Weights (kg)',
                    },
                    ticks: {
                        font: {
                            size: 10,
                        },
                        color: '#343a40',
                        maxTicksLimit: 8,
                    },
                },
            },
        }
    }
}
