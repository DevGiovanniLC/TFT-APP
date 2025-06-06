import { Signal } from '@angular/core';
import { Goal } from '@models/types/Goal.type';
import { Weight } from '@models/types/Weight.type';
import { TranslateService } from '@ngx-translate/core';
import { TimeService } from '@services/Time.service';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { ChartData, ChartOptions } from 'chart.js';
import { LineAnnotationOptions } from 'chartjs-plugin-annotation';

type point = {
    x: number;
    y: number;
};

export default class HomeWeightLineChart {
    private readonly chartMode: string;
    private readonly weights: Weight[];
    private readonly goal?: Goal;

    private readonly viewTrend: boolean;
    private readonly trendData: point[];

    private readonly translateService: TranslateService;

    constructor(
        translateService: TranslateService,
        analysisService: WeightAnalysisService,
        chartMode: Signal<string>,
        weights: Signal<Weight[]>,
        goal: Signal<Goal | undefined>
    ) {
        this.translateService = translateService;

        this.chartMode = chartMode();
        this.weights = weights();
        this.goal = goal();

        this.viewTrend = this.chartMode === 'viewGoal' && this.weights.length > 1;

        this.trendData = this.viewTrend ? analysisService.getTrendData(this.weights) : [];
    }

    getData(): ChartData<'line'> {
        const { weights, chartMode, viewTrend, trendData } = this;
        const isCompact = (chartMode === 'viewGoal' || chartMode === 'total') && weights.length > 1;
        return {
            labels: weights.map((w) => new Date(w.date).getTime()),
            datasets: [
                {
                    label: `${this.translateService.instant('KEY_WORDS.WEIGHT')} (kg)`,
                    data: weights.map((w) => w.weight),
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.1,
                    pointRadius: isCompact ? 0 : 4,
                    hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'transparent',
                    pointHoverRadius: isCompact ? 0 : 4,
                    pointHitRadius: isCompact ? 0 : 4,
                },
                {
                    label: `${this.translateService.instant('KEY_WORDS.TREND')}`,
                    data: viewTrend ? trendData : [],
                    parsing: false,
                    fill: false,
                    borderDash: [6, 6],
                    backgroundColor: 'transparent',
                    borderColor: '#fa0000',
                    pointRadius: 0,
                    tension: 0,
                    segment: { borderDash: [6, 6] },
                    hoverBackgroundColor: 'transparent',
                    hoverBorderColor: 'transparent',
                    pointHoverRadius: 0,
                    pointHitRadius: 0,
                },
            ],
        };
    }

    private annotationConfig(chartMode: string, goalWeight?: number) {
        if (!goalWeight) return {};

        const goalLine: LineAnnotationOptions = {
            yMin: goalWeight,
            yMax: goalWeight,
            borderColor: '#343A40',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
                display: true,
                content: `${this.translateService.instant('KEY_WORDS.GOAL')}`,
                position: `${chartMode === 'viewGoal' ? 'end' : 'center'}`,
                backgroundColor: 'rgba(0, 167, 20, 0.9)',
                color: '#fff',
                padding: { x: 5, y: 2 },
                font: {
                    weight: 'bold',
                    size: 9,
                },
            },
        };

        return { goalLine };
    }

    getOptions(): ChartOptions<'line'> {
        const { weights, chartMode, goal, viewTrend, trendData } = this;
        if (!weights.length) return {};

        const goalWeight = goal?.weight ?? NaN;
        const goalDate = goal?.date;
        const minWeight = Math.min(...weights.map((w) => w.weight));
        const maxWeight = Math.max(...weights.map((w) => w.weight));
        const marginY =
            (goalWeight ? Math.max(maxWeight, goalWeight) - Math.min(minWeight, goalWeight) : maxWeight - minWeight) *
                0.2 || 1;

        const dates = weights.map((w) => new Date(w.date).getTime());
        const minDate = Math.min(...dates) - TimeService.MS_PER_DAY;
        const maxDate = Math.max(...dates);

        let goalDateMaxRange: number = maxDate;
        if (chartMode === 'viewGoal' && goalWeight > 0 && goalDate) {
            goalDateMaxRange = Math.max(maxDate, goalDate.getTime()) + 15 * TimeService.MS_PER_DAY;
        } else if (chartMode === 'total') {
            goalDateMaxRange = maxDate + 15 * TimeService.MS_PER_DAY;
        } else if (chartMode === 'week' || chartMode === 'month') {
            goalDateMaxRange = maxDate + 1 * TimeService.MS_PER_DAY;
        }

        return {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: '#00BD7E',
            elements: {
                point: { hitRadius: 6, hoverRadius: 7 },
            },
            plugins: {
                annotation: {
                    annotations: this.annotationConfig(chartMode, goalWeight),
                },
                legend: {
                    display: viewTrend && trendData.length > 1,
                    onClick: () => {},
                    position: 'top',
                        labels: {
                        font: { size: 14 },
                        padding: 10,
                        boxWidth: 32.5,
                        boxHeight: 1,
                    }
                },
            },
            animation: { duration: 0 },
            locale: this.translateService.currentLang,
            scales: {
                x: {
                    type: 'time',
                    min: minDate,
                    max: goalDateMaxRange,
                    time: {
                        unit: 'day',
                        displayFormats: { day: 'dd/MM/yy' },
                    },
                    title: { display: false, text: 'Date' },
                    ticks: { padding: 15, color: '#343a40', maxTicksLimit: 5 },
                },
                y: {
                    min: Math.round(goalWeight ? Math.min(minWeight, goalWeight) - marginY : minWeight - marginY),
                    max: Math.round(goalWeight ? Math.max(maxWeight, goalWeight) + marginY : maxWeight + marginY),
                    title: { display: false, text: `${this.translateService.instant('KEY_WORDS.WEIGHT')} (kg)` },
                    ticks: { font: { size: 13 }, color: '#343a40', maxTicksLimit: 8 },
                },
            },
        };
    }
}
