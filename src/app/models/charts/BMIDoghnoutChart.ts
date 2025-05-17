import { ChartData, ChartOptions } from 'chart.js';

export class BMIDoughnutChart {
    bmi: number;
    dataset: number[];

    constructor(bmi: number) {
        this.bmi = bmi;
        this.dataset = [bmi, 40 - bmi];
    }

    getData(): ChartData<'doughnut'> {
        const documentStyle = getComputedStyle(document.documentElement);

        let bmiColor = documentStyle.getPropertyValue('--color-tertiary');

        if (this.bmi < 16) bmiColor = '#f2adad';
        if (this.bmi < 18.5 && this.bmi >= 16) bmiColor = '#c7b85a';
        if (this.bmi >= 18.5 && this.bmi < 25) bmiColor = '#4caf50';
        if (this.bmi >= 25 && this.bmi < 30) bmiColor = '#c7b85a';
        if (this.bmi >= 30) bmiColor = '#f2adad';

        return {
            labels: ['Progress'],
            datasets: [
                {
                    data: this.dataset,
                    backgroundColor: [bmiColor, documentStyle.getPropertyValue('--color-accent')],
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
            animations: {
                x: { duration: 0 },
                y: { duration: 0 },
            },
            animation: {
                // Desactivar la animación de desplazamiento
                animateScale: false,
                animateRotate: true,

                // Duración de la animación (en milisegundos)
                duration: 1000,

                // Función de temporización (easing) - puedes ajustarla a tu gusto
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
        };
    }
}
