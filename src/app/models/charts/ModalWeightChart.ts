import { Goal } from '@models/types/Goal';
import { Weight } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { ChartData, ChartOptions } from 'chart.js';
import { AnnotationOptions, LineAnnotationOptions } from 'chartjs-plugin-annotation';

export default class ModalWeightChart {
    private readonly weights: Weight[];
    private readonly goal: Goal | undefined;
    private readonly trendData: { x: number; y: number; }[];
    private readonly categories: { label: string; bmi: number; weight: number; alert: string; }[];

    constructor(
        calculateFunctionsService: CalculationFunctionsService,
        weights: Weight[],
        goal: Goal | undefined,
        categories: { label: string; bmi: number; weight: number; alert: string; }[]
    ) {
        this.weights = weights;
        this.goal = goal;
        this.trendData = calculateFunctionsService.getTrendData(this.weights)
        this.categories = categories;
    }

    getData(): ChartData<'line'> {

        return {
            labels: this.weights?.map((w: Weight) => new Date(w.date).getTime()),
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: this.weights?.map((w: Weight) => w.weight),
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.1,
                    pointRadius: 4,
                },
                {
                    label: 'Trend',
                    data: this.trendData,
                    parsing: false,
                    fill: false,
                    borderDash: [6, 6],
                    borderColor: '#fa0000',
                    pointRadius: 0,
                    tension: 0,
                    segment: {
                        borderDash: [6, 6],
                    },
                    backgroundColor: 'transparent',
                    hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'transparent',
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                },
            ],
        };
    }

    annotationConfig(goalWeight: number, goalDate: Date | undefined) {
        if (!goalWeight) return {};

        const goalLine: LineAnnotationOptions = {
            yMin: goalWeight,
            yMax: goalWeight,
            borderColor: '#343A40',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
                display: true,
                content: 'Goal',
                position: 'end',
                backgroundColor: 'rgba(0,0,0,0.9)',
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 10
                }
            }
        };

        const bmiLineCategories: LineAnnotationOptions[] = this.categories.map(category => {
            return {
                yMin: category.weight,
                yMax: category.weight,
                borderColor: category.alert,
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    display: true,
                    content: category.label,
                    position: 'end',
                    backgroundColor: category.alert,
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 10
                    }
                }
            };
        })


        if (!goalDate) {
            return {
                goalLine,
                ...bmiLineCategories
            };
        }

        const goalPoint: AnnotationOptions = {
            type: 'point',
            xScaleID: 'x',
            yScaleID: 'y',
            xValue: goalDate?.getTime(),
            yValue: goalWeight,
            backgroundColor: '#1E8260',
            radius: 6,
            borderWidth: 2,
            borderColor: '#00BD7E',
        };

        return {
            goalPoint,
            goalLine,
            ...bmiLineCategories
        };
    }

    getOptions(): ChartOptions<'line'> {
        const dataWeights = this.weights;

        // Verifica si el modo de gráfico es 'viewGoal' y si hay suficientes datos para mostrar la tendencia de una manera lógica
        const goalWeight = this.goal && typeof this.goal === 'object' ? this.goal?.weight : Number.POSITIVE_INFINITY;

        // Rango de pesos para el eje Y
        const minWeight = Math.min(...dataWeights.map((w) => w.weight));
        const maxWeight = Math.max(...dataWeights.map((w) => w.weight));
        const maxRangeY = goalWeight ? maxWeight - Math.min(minWeight, goalWeight) : maxWeight - minWeight;
        const marginY = maxRangeY * 0.2 || 1;

        // Rango de fechas para el eje X
        const validDates = dataWeights.map((w) => new Date(w.date));
        const maxDate = Math.max(...validDates.map((w) => w.getTime()));
        const minDate = Math.min(...validDates.map((w) => w.getTime())) - 1 * 24 * 60 * 60 * 1000;
        const rangeX = new Date(maxDate)
        const goalDateMaxRange = new Date(rangeX.getTime() + 15 * 24 * 60 * 60 * 1000).getTime();



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
                    annotations: this.annotationConfig(this.goal?.weight ?? NaN, this.goal?.date),
                },
                legend: {
                    display: this.trendData.length > 1,
                    onClick: () => { },
                    position: 'top',
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true,
                        },
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    },
                }
            },
            animation: { duration: 0 },
            scales: {
                x: {
                    min: minDate,
                    max: goalDateMaxRange,
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'dd/MM/yyyy',
                        },
                    },
                    title: {
                        display: false,
                        text: 'Date',
                    },
                    ticks: {
                        padding: 15,
                        color: '#343a40',
                        maxTicksLimit: 8,
                        font: {
                            size: 15,
                        }
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
                            size: 16,
                        },
                        color: '#343a40',
                    },
                },
            },
        };
    }
}
