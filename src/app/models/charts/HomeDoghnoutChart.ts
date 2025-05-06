import { ChartData, ChartOptions } from 'chart.js';

export default class HomeDoughnutChart {
    private readonly dataset: number[];

    constructor(progression: number) {

        this.dataset = [progression, 100 - progression];

        if (Number.isNaN(progression)) this.dataset = [100, 0];
        if (progression < 0) this.dataset = [0, 100];
        if (progression > 100) this.dataset = [100, 0];
    }

    getData(): ChartData<'doughnut'> {
        const documentStyle = getComputedStyle(document.documentElement);

        const backgroundColor = [
            documentStyle.getPropertyValue('--color-tertiary'),
            documentStyle.getPropertyValue('--color-accent'),
        ]

        return {
            labels: ['Progress'],
            datasets: [
                {
                    data: this.dataset,
                    backgroundColor: backgroundColor
                },
            ],
        }
    }

    getOptions(): ChartOptions<'doughnut'> {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '92%',
            radius: 120,
            animations: {
                x: {
                    duration: 0,
                },
                y: {
                    duration: 0,
                },
            },
            animation: {
                animateScale: false,
                animateRotate: true,

                duration: 1000,

                easing: 'easeOutQuart',
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                },
            },
        }
    }
}

