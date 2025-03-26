import { Injector, Signal } from "@angular/core";
import { Weight } from "@models/types/Weight";
import { CalculationFunctionsService } from "@services/CalculationFunctions.service";
import { delay } from "rxjs";

const injector = Injector.create({ providers: [CalculationFunctionsService] });
const calculationFunctionsService = injector.get(CalculationFunctionsService);


export const WeightChart = (chartMode: Signal<String>, weights: Signal<Weight[]>, goal: Signal<Weight>) => {
    if (weights().length === 0) return [];

    const dataWeights = weights();

    const goalWeight = goal && typeof goal() === 'object' ? goal()?.weight : Number.POSITIVE_INFINITY;
    const goalDate = goal && typeof goal() === 'object' ? goal()?.date : null;

    const minWeight = Math.min(...dataWeights.map((w) => w.weight));
    const maxWeight = Math.max(...dataWeights.map((w) => w.weight));
    const maxRangeY = goalWeight ? maxWeight - Math.min(minWeight, goalWeight) : maxWeight - minWeight;
    const marginY = maxRangeY * 0.2 || 1; // Si el rango es 0, se asigna un margen mínimo

    const validDates = dataWeights.map((w) => new Date(w.date));
    const maxDate = Math.max(...validDates.map((w) => w.getTime()));
    const minDate = Math.min(...validDates.map((w) => w.getTime())) - 1* 24 * 60 * 60 * 1000;
    const rangeX = goalDate ? new Date(Math.max(maxDate, goalDate.getTime())) : new Date(maxDate);
    let goalDateMaxRange;

    if (chartMode() === 'viewGoal' && goal()?.weight > 0) {
        goalDateMaxRange = new Date(rangeX.getTime() + 15 * 24 * 60 * 60 * 1000); // Agrega 15 días a la fecha máxima
    }
    else if (chartMode() === 'total') {
        goalDateMaxRange = new Date(maxDate + 15 * 24 * 60 * 60 * 1000); // Agrega 15 días a la fecha máxima
    }
    else if (chartMode() === 'week') {
        goalDateMaxRange = new Date(maxDate +  1* 24 * 60 * 60 * 1000); // Agrega 7 días a la fecha máxima
    }
    else if (chartMode() === 'month') {
        goalDateMaxRange = new Date(maxDate +  1* 24 * 60 * 60 * 1000); // Agrega 30 días a la fecha máxima
    }


    return {
        data: {
            labels: dataWeights.map((w) => calculationFunctionsService.formatDate(w.date).getTime()),
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: dataWeights.map((w) => w.weight),
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.4,
                },
            ],
        },
        options: {
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
                    annotations: configurationAnnotationPlugin(chartMode(), goal()?.weight, goal()?.date),
                },
                legend: {
                    display: false,
                    onClick: () => { },
                    position: 'top',
                },
                centerText: false
            },animation: {
                duration: 1300,
                delay: 100,
            },
            scales: {
                x: {
                    type: 'time', // Eje de tiempo para las fechas
                    min: minDate,
                    max: goalDateMaxRange, // Fecha máxima (ajústala según tu dataset)
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
                    // Se establece el rango "acercado" usando el mínimo y máximo en base a la meta con margen y redondeo al entero mayor
                    min: goalWeight ? Math.round(Math.min(minWeight, goalWeight) - marginY) : Math.round(minWeight - marginY),
                    max: goalWeight ? Math.round(Math.max(maxWeight, goalWeight) + marginY) : Math.round(maxWeight + marginY),
                    title: {
                        display: false,
                        text: 'Weights (kg)',
                    },
                    ticks: {
                        callback: function (value: number) {
                            return `${value} ${dataWeights[0].weight_units}`; // Agrega "kg" como sufijo a los valores del eje Y
                        },
                        font: {
                            size: 10 // Ajusta el tamaño de la fuente (puedes probar con otros valores)
                        },
                        color: '#343a40',
                        maxTicksLimit: 8,
                    },
                },
            },
        },
    }
}



export function configurationAnnotationPlugin(chartMode: String, goalWeight: number, goalDate: Date): any {
    if (!goalWeight) return [];
    return {
        goalLabel: {
            type: 'label',
            yValue: goalWeight + 2,
            xValue: chartMode === 'viewGoal' ? goalDate : NaN,
            content: ['Goal'],
            padding: 0,
            color: '#343A40',
            font: {
                size: 11,
            },
        },
        goalLine: {
            type: 'line',
            yMin: goalWeight,
            yMax: goalWeight,
            borderColor: '#343A40',
            borderWidth: 2,
            borderDash: [5, 5],
        },
        goalPoint: {
            type: 'point',
            xValue: goalDate,
            yValue: goalWeight,
            backgroundColor: '#1E8260',
            radius: 3,
            borderWidth: 2,
            borderColor: '#00BD7E',
        },
    };
}
