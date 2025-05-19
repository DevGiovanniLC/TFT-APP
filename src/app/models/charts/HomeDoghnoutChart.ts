import { ChartData, ChartOptions } from 'chart.js';

export default class HomeDoughnutChart {
    private readonly dataset: number[];

    constructor(progression: number) {
        if (isNaN(progression)) {
            this.dataset = [100, 0];
            return;
        }

        progression = Math.max(0, Math.min(100, progression));
        this.dataset = [progression, 100 - progression];
    }

    getData(): ChartData<'doughnut'> {
        const style = getComputedStyle(document.documentElement);
        const backgroundColor = [
            style.getPropertyValue('--color-tertiary').trim(),
            style.getPropertyValue('--color-accent').trim(),
        ];

        return {
            labels: ['Progression', 'Remaining'],
            datasets: [
                {
                    data: this.dataset,
                    backgroundColor,
                },
            ],
        };
    }

    getOptions(): ChartOptions<'doughnut'> {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '92%',
            radius: 110,
            hover: {
                mode: 'x',
            },
            animations: {
                x: { duration: 0 },
                y: { duration: 0 },
            },
            animation: {
                animateScale: false,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart',
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
        };
    }
}
