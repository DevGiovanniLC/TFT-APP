import { ChartData, ChartOptions } from 'chart.js';

export default class HomeDoughnutChart {
    private readonly dataset: number[];
    private readonly progression: number;

    constructor(progression: number) {
        this.progression = progression;
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
                    borderWidth: 0,
                },
            ],
        };
    }

    getOptions(): ChartOptions<'doughnut'> {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '94%',
            radius: 110,
            hover: {
                mode: 'x',
            },
            animations: {
                x: { duration: 0 },
                y: { duration: 0 },
            },
            animation: this.checkAnimation(),
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false, intersect: false },
            },
        };
    }


    private checkAnimation(): ChartOptions<'doughnut'>['animation'] {
        if (!this.progression || isNaN(this.progression)) return { duration: 0 };

        return {
            animateScale: false,
            animateRotate: true,
            duration: 1000,
            easing: 'easeOutQuart'
        }
    }
}


