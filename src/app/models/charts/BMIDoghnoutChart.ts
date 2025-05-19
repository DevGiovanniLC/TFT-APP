import { ChartData, ChartOptions } from 'chart.js';

export class BMIDoughnutChart {
    private readonly bmi: number;

    constructor(bmi: number) {
        this.bmi = bmi;
    }

    private getBmiColor(): string {
        if (this.bmi < 16) return '#f2adad';
        if (this.bmi < 18.5) return '#c7b85a';
        if (this.bmi < 25) return '#4caf50';
        if (this.bmi < 30) return '#c7b85a';
        return '#f2adad';
    }

    getData(): ChartData<'doughnut'> {
        const style = getComputedStyle(document.documentElement);
        const accentColor = style.getPropertyValue('--color-accent').trim();
        const bmiColor = this.getBmiColor();

        return {
            labels: ['BMI', 'Remaining'],
            datasets: [
                {
                    data: [this.bmi, Math.max(0, 40 - this.bmi)],
                    backgroundColor: [bmiColor, accentColor],
                    borderWidth: 0,
                },
            ],
        };
    }

    getOptions(): ChartOptions<'doughnut'> {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '92%',
            radius: 140,
            hover: {
                mode: 'x',
            },
            animations: {
                x: {duration: 0},
                y: {duration: 0},
            },
            animation: {
                animateScale: false,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart',
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false, intersect: false },
            },
        };
    }
}
