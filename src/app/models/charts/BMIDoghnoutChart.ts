import { BMIService } from '@services/BMI.service';
import { ChartData, ChartOptions } from 'chart.js';

export class BMIDoughnutChart {
    private readonly bmi: number;
    private readonly bmiService: BMIService;

    constructor(bmiService: BMIService, bmi: number) {
        this.bmi = bmi;
        this.bmiService = bmiService;
    }

    getData(): ChartData<'doughnut'> {
        const style = getComputedStyle(document.documentElement);
        const accentColor = style.getPropertyValue('--color-accent').trim();
        const bmiColor = this.bmiService.getBMICategory(this.bmi).color;

        return {
            labels: ['BMI', 'Remaining'],
            datasets: [
                {
                    data: [100, 0],
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
            cutout: '93%',
            radius: 140,
            hover: {
                mode: 'x',
            },
            animations: {
                x: { duration: 0 },
                y: { duration: 0 },
            },
            animation: {
                duration: 0,
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false, intersect: false },
            },
        };
    }
}
