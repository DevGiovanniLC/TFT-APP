import { Signal } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { configurationAnnotationPlugin } from '@plugins/chartjs/ChartPlugins';

export const WeightChart = (chartMode: Signal<string>, weights: Signal<Weight[]>, goal: Signal<Weight | null>) => {

    if (weights().length === 0) return [];

    const allWeights = weights();
    const dataWeights = allWeights;

    // Verifica si el modo de gráfico es 'viewGoal' y si hay suficientes datos para mostrar la tendencia de una manera lógica
    const viewTrend = chartMode() == 'viewGoal' && weights().length >= 7;

    const goalWeight = goal && typeof goal() === 'object' ? goal()?.weight : Number.POSITIVE_INFINITY;
    const goalDate = goal && typeof goal() === 'object' ? goal()?.date : null;

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
    if (chartMode() === 'viewGoal' && (goal()?.weight ?? NaN) > 0) {
        goalDateMaxRange = new Date(rangeX.getTime() + 15 * 24 * 60 * 60 * 1000);
    } else if (chartMode() === 'total') {
        goalDateMaxRange = new Date(maxDate + 15 * 24 * 60 * 60 * 1000);
    } else if (chartMode() === 'week') {
        goalDateMaxRange = new Date(maxDate + 1 * 24 * 60 * 60 * 1000);
    } else if (chartMode() === 'month') {
        goalDateMaxRange = new Date(maxDate + 1 * 24 * 60 * 60 * 1000);
    }


    // Línea de tendencia basada en las últimas 2 semanas de datos
    const lastWeight = allWeights[allWeights.length - 1];
    const lastDate = new Date(lastWeight.date).getTime();
    const recentWeights = allWeights.filter(w => new Date(w.date).getTime() >= lastDate - 14 * 24 * 60 * 60 * 1000);

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


    return {
        data: {
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

                        if (chartMode() === 'viewGoal') {
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
                    data: viewTrend ? futureTrendData : [],
                    parsing: false,
                    fill: false,
                    borderDash: [6, 6],
                    borderColor: '#ff6384',
                    pointRadius: 0,
                    tension: 0,
                    segment: {
                        borderDash: [6, 6]
                    },
                    interaction: {
                        mode: null
                    },
                    hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'transparent',
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                },
            ],
        },
        options: {
            responsive: false,
            maintainAspectRatio: true,
            pointBackgroundColor: '#00BD7E',
            elements: {
                point: {
                    hitRadius: 6,
                    hoverRadius: 7,
                },
            },
            plugins: {
                annotation: {
                    annotations: configurationAnnotationPlugin(chartMode(), goal()?.weight ?? NaN, goal()?.date),
                },
                legend: {
                    display: viewTrend ? true : false,
                    onClick: () => { },
                    position: 'top',
                },
                centerText: false,
            },
            animation: {
                duration: 1300,
                delay: 100,
            },
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
                        callback: function (value: number) {
                            return `${value} ${dataWeights[0].weight_units}`;
                        },
                        font: {
                            size: 10,
                        },
                        color: '#343a40',
                        maxTicksLimit: 8,
                    },
                },
            },
        },
    };
};
