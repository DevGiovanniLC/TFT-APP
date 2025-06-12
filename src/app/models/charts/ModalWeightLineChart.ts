import BMICategory from '@models/types/BMICategory';
import { Goal } from '@models/types/Goal.type';
import { Weight } from '@models/types/Weight.type';
import { TranslateService } from '@ngx-translate/core';
import { TimeService } from '@services/Time.service';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { ChartData, ChartOptions } from 'chart.js';
import { AnnotationOptions, LineAnnotationOptions } from 'chartjs-plugin-annotation';
import Conf from 'src/app/conf';

export default class ModalWeightLineChart {
    private readonly weights: Weight[];
    private readonly goal?: Goal;
    private readonly trendData: { x: number; y: number }[];
    private readonly categories: BMICategory[];

    private readonly translateService: TranslateService;

    constructor(
        translateService: TranslateService,
        analysisService: WeightAnalysisService,
        weights: Weight[],
        goal: Goal | undefined,
        categories: BMICategory[]
    ) {
        this.translateService = translateService;

        this.weights = weights;
        this.goal = goal;
        this.trendData = analysisService.getTrendData(weights);
        this.categories = categories;
    }

    getData(): ChartData<'line'> {
        const labels = this.weights.map((w) => new Date(w.date).getTime());
        return {
            labels,
            datasets: [
                {
                    label: `${this.translateService.instant('KEY_WORDS.WEIGHT')} (kg)`,
                    data: this.weights.map((w) => w.weight),
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.1,
                    pointRadius: 4,
                },
                {
                    label: `${this.translateService.instant('KEY_WORDS.TREND')}`,
                    data: this.trendData,
                    parsing: false,
                    fill: false,
                    borderDash: [6, 6],
                    borderColor: '#fa0000',
                    pointRadius: 0,
                    tension: 0,
                    segment: { borderDash: [6, 6] },
                    backgroundColor: 'transparent',
                    hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'transparent',
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                },
            ],
        };
    }

    private getGoalLine(goalWeight: number): LineAnnotationOptions & { type: 'line' } {
        return {
            type: 'line',
            yMin: goalWeight,
            yMax: goalWeight,
            borderColor: '#343A40',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
                display: true,
                content: `${this.translateService.instant('KEY_WORDS.GOAL')}`,
                position: 'end',
                backgroundColor: 'rgba(0, 167, 20, 0.9)',
                color: '#fff',
                padding: { x: 5, y: 2 },
                font: {
                    weight: 'bold',
                    size: 9,
                },
            },
        };
    }

    private getCategoryLines(): ((LineAnnotationOptions & { type: 'line' }) | undefined)[] {
        return this.categories.map((cat) => {
            if (cat.maxWeightLimit === Infinity) return undefined;
            return {
                type: 'line',
                yMin: cat.maxWeightLimit,
                yMax: cat.maxWeightLimit,
                borderColor: cat.color,
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                    display: true,
                    content: cat.label,
                    position: 'end',
                    backgroundColor: cat.color,
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                },
            };
        });
    }

    private getGoalAnnotations(goalWeight: number, goalDate: Date): Record<string, AnnotationOptions> {
        return {
            goalPoint: {
                type: 'point',
                xScaleID: 'x',
                yScaleID: 'y',
                xValue: goalDate.getTime(),
                yValue: goalWeight,
                backgroundColor: 'black',
                radius: 6,
                borderWidth: 2,
                borderColor: '#00BD7E',
            },
            goalLabel: {
                type: 'label',
                xScaleID: 'x',
                yScaleID: 'y',
                xValue: goalDate.getTime(),
                yValue: goalWeight + 0.8,
                content: [
                    `${this.translateService.instant('KEY_WORDS.GOAL')}: ${goalWeight.toFixed(2)} kg`,
                    `${this.translateService.instant('KEY_WORDS.DATE')}: ${goalDate.toLocaleDateString('en-GB')}`,
                ],
                color: '#00BD7E',
                font: {
                    size: 11,
                    weight: 'bold',
                },
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                padding: 4,
            },
        };
    }

    private buildAnnotations(goalWeight: number, goalDate?: Date) {
        const lines = [
            ...(goalWeight && !isNaN(goalWeight) ? [this.getGoalLine(goalWeight)] : []),
            ...this.getCategoryLines(),
        ];
        const annotations: Record<string, AnnotationOptions> = {};
        lines.forEach((line, i) => {
            if (!line) return;
            if (line.type !== 'line') return;
            annotations[`line${i}`] = line;
        });

        if (goalWeight && goalDate) {
            Object.assign(annotations, this.getGoalAnnotations(goalWeight, goalDate));
        }

        return annotations;
    }

    getOptions(): ChartOptions<'line'> {
        const weights = this.weights;
        const goalWeight = this.goal?.weight ?? NaN;

        // Rango Y
        const minWeight = Math.min(...weights.map((w) => w.weight));
        const maxWeight = Math.max(...weights.map((w) => w.weight));
        const marginY =
            (goalWeight ? Math.max(maxWeight, goalWeight) - Math.min(minWeight, goalWeight) : maxWeight - minWeight) *
            0.2 || 1;

        // Rango X
        const dates = weights.map((w) => new Date(w.date).getTime());
        const minDate = Math.min(...dates) - 15 * TimeService.MS_PER_DAY;
        const maxDate = Math.max(...dates) + 15 * TimeService.MS_PER_DAY;

        const initialMinDate = Math.max(...dates) - 1 * TimeService.MS_PER_MONTH;
        const initialMaxDate = Math.max(...dates) + 15 * TimeService.MS_PER_DAY;
        const goalDate = (this.goal?.date?.getTime() ?? NaN) + 3 * TimeService.MS_PER_MONTH;

        return {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: '#00BD7E',
            elements: {
                point: { hitRadius: 7, hoverRadius: 8 },
            },
            plugins: {
                annotation: {
                    annotations: this.buildAnnotations(goalWeight, this.goal?.date),
                },
                legend: {
                    display: this.trendData.length > 1,
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        padding: 10,
                        boxWidth: 32.5,
                        boxHeight: 1,
                    }
                },
                zoom: {
                    limits: {
                        x: {
                            min: minDate,
                            max: Math.max(maxDate, goalDate),
                            minRange: 3 * TimeService.MS_PER_DAY, // mínimo 3 días visibles al hacer zoom
                        },
                        y: {
                            minRange: 2,
                            max: Conf.MAX_WEIGHT,
                            min: Conf.MIN_WEIGHT,
                        },
                    },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy',
                    },
                    pan: { enabled: true, mode: 'xy' },
                },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const date = new Date(items[0].parsed.x);
                            return date.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            });
                        },
                    },
                },
            },
            animation: { duration: 0 },
            scales: {
                x: {
                    min: initialMinDate,
                    max: initialMaxDate,
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: { day: 'dd/MM/yy' },
                    },
                    title: { display: false, text: 'Date' },
                    ticks: {
                        autoSkip: false,
                        padding: 15,
                        color: '#343a40',
                        maxTicksLimit: 5,
                        font: { size: 14 },
                    },
                },
                y: {
                    min: goalWeight
                        ? Math.round(Math.min(minWeight, goalWeight) - marginY)
                        : Math.round(minWeight - marginY),
                    max: goalWeight
                        ? Math.round(Math.max(maxWeight, goalWeight) + marginY)
                        : Math.round(maxWeight + marginY),
                    title: { display: false, text: 'Weights (kg)' },
                    ticks: {
                        autoSkip: false,
                        font: { size: 16 },
                        color: '#343a40',
                        callback: (value) => Number.isInteger(value) ? value : Number(value).toFixed(0),
                    },
                },
            },
        };
    }
}
