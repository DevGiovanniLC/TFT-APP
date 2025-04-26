import { Injector, Signal } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { TimeService } from '@services/Time.service';
import { Chart } from 'chart.js';

const injector = Injector.create({ providers: [CalculationFunctionsService, TimeService] });
const calculationFunctionsService = injector.get(CalculationFunctionsService);
const timeService = injector.get(TimeService);

export const customSVGsPluginForDoughnutChart = () => {
    const svgImageStart: HTMLImageElement = new Image();
    const svgImageProgress: HTMLImageElement = new Image();
    svgImageStart.src = 'assets/icons/goal.svg';
    svgImageProgress.src = 'assets/icons/runner.svg';

    return {
        id: 'customSVG',
        afterDraw: (chartInstance: any) => {
            const ctx = chartInstance.ctx;

            const meta = chartInstance.getDatasetMeta(0);
            if (!meta?.data || meta.data.length === 0) {
                return;
            }

            const segment = meta.data[0];

            const centerX = segment.x;
            const centerY = segment.y;
            const innerRadius = segment.innerRadius + 2;

            const startAngle = segment.startAngle;
            const startX = centerX + innerRadius * Math.cos(startAngle);
            const startY = centerY + innerRadius * Math.sin(startAngle);

            const endAngle = segment.endAngle;
            const progressX = centerX + innerRadius * Math.cos(endAngle);
            const progressY = centerY + innerRadius * Math.sin(endAngle);

            if (svgImageStart.complete) {
                ctx.drawImage(svgImageStart, startX - 12, startY - 8, 25, 25);
            }

            if (svgImageProgress.complete) {
                ctx.drawImage(svgImageProgress, progressX - 10, progressY - 18, 25, 25);
            }

            ctx.restore();
        },
    };
};

export const centerTextPlugin = (progression: Signal<number>, lastWeight: Signal<Weight | null>) => {
    return {
        id: 'centerText',
        afterDraw: (chart: Chart) => {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;

            const { width, height } = chartArea;
            ctx.save();

            // Definir estilos
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'var(--color-accent)';

            const centerX = width / 2 + chartArea.left;
            const centerY = height / 2 + chartArea.top;

            let offset = Number.isNaN(progression()) ? -10 : 0;

            ctx.font = '13px system-ui';
            ctx.fillStyle = '#343a40';
            const textOffset = 20;

            if (progression() < 100)
                ctx.fillText(`Progression ${Number(progression()).toFixed(0)} %`, centerX, centerY - 40);
            if (progression() > 100) ctx.fillText(`Completed✅`, centerX, centerY - 35);
            else if (progression() > 90) {
                ctx.fillText(``, centerX, centerY - 26);
                ctx.fillText(`Just a little bit more 👍`, centerX, centerY - textOffset);
            } else if (progression() > 80) {
                ctx.fillText(`Just a bit more 👍`, centerX, centerY - textOffset);
            } else if (progression() > 50) {
                ctx.fillStyle = '#1E8260';
                ctx.fillText(`Greatfully done 🎉`, centerX, centerY - textOffset);
            } else if (progression() > 20) {
                ctx.fillText(`Good job 😁`, centerX, centerY - textOffset);
            } else if (progression() > 5) {
                ctx.fillText(`Keep going 💪`, centerX, centerY - textOffset);
            } else if (progression() < -1) {
                ctx.fillStyle = '#C7B85A';
                ctx.fillText(`You can do better`, centerX, centerY - textOffset);
            } else offset = -10;

            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = '#343a40';
            ctx.fillText(`${lastWeight()?.weight} ${lastWeight()?.weight_units}`, centerX, centerY + offset + 10);

            ctx.font = '13px system-ui';
            ctx.fillStyle = '#1e8260';
            ctx.fillText(
                `${differenceTime(lastWeight()?.date ?? timeService.now(), timeService.now())}`,
                centerX,
                centerY + 50
            );

            ctx.restore();
        },
    };
};

function differenceTime(dateStart: Date, dateEnd: Date) {
    const days = calculationFunctionsService.dayDifference(new Date(dateStart), new Date(dateEnd));

    const cases = new Map<(val: number) => boolean, () => string>([
        [(v) => v > 365, () => `${Math.floor(days / 365)} years ago`],
        [(v) => v > 30, () => `${Math.floor(days / 30)} months ago`],
        [(v) => v > 7, () => `${Math.floor(days / 7)} weeks ago`],
        [(v) => v > 2, () => `${Math.floor(days)} days ago`],
        [(v) => v > 1, () => `Yesterday`],
    ]);

    let result = `Today`;

    for (const [condition, action] of cases) {
        if (condition(days)) {
            result = action();
            break;
        }
    }

    return result;
}


export const configurationAnnotationPlugin = (chartMode: string, goalWeight: number, goalDate: Date | undefined) => {
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


export const BMIPluginDoughnut = (bmi: number) => {
    const img = new Image();
    img.src = 'assets/icons/body.svg'; // Tu silueta transparente

    return {
        id: 'bmiHumanFill',
        afterDraw(chart: any) {
            if (!img.complete) return;

            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            if (!meta?.data?.length) return;

            const segment = meta.data[0];
            const { x: centerX, y: centerY, innerRadius, outerRadius } = segment;

            const targetRadius = innerRadius + (outerRadius - innerRadius) / 2;
            const imgSize = targetRadius * 0.3;

            const imgX = centerX - imgSize / 2;
            const imgY = imgSize + 30;

            // Dibuja la silueta base
            ctx.save();
            ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            ctx.restore();

            //  Canvas temporal para rellenar solo lo verde
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imgSize;
            tempCanvas.height = imgSize;
            const tempCtx = tempCanvas.getContext('2d')!;

            // Dibuja la silueta en el temporal
            tempCtx.drawImage(img, 0, 0, imgSize, imgSize);

            //Aplicar máscara para el relleno
            tempCtx.globalCompositeOperation = 'source-in';

            const fillHeight = imgSize * (bmi / 40);
            const fillY = imgSize - fillHeight;


            const alertColor = getColor(bmi);

            tempCtx.fillStyle = alertColor
            tempCtx.fillRect(0, fillY, imgSize, fillHeight);

            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = '#343a40';
            ctx.fillText(`BMI`, centerX - 28, centerY - 20);

            ctx.font = 'bold 50px sans-serif';
            ctx.fillStyle = '#343a40';
            ctx.fillText(bmi.toFixed(1), centerX - 50, centerY + 40);


            const text = getTextLevel(bmi);
            const textWidth = ctx.measureText(text).width;

            const centeredX = centerX - textWidth / 5;

            ctx.font = 'bold 20px sans-serif';
            ctx.fillStyle = alertColor;
            ctx.fillText(text, centeredX, centerY + 100);


            tempCtx.globalCompositeOperation = 'source-over'; // Regresar a normal

            // Dibuja el canvas temporal relleno encima del original
            ctx.drawImage(tempCanvas, imgX, imgY, imgSize, imgSize);
        }
    };

};

const getColor = (bmi: number): string => {
    if (bmi >= 30) return '#f15757';  // Obesidad
    if (bmi >= 25) return '#cdc827';  // Sobre peso
    if (bmi < 18.49) return '#adccf2';  // Bajo de peso
    else return '#4caf50';  // Normal
}

const getTextLevel = (bmi: number): string => {
    if (bmi < 16) return 'Severe Thinness';               // Delgadez severa
    if (bmi >= 16 && bmi <= 16.99) return 'Moderate Thinness'; // Delgadez moderada
    if (bmi >= 17 && bmi <= 18.49) return 'Mild Thinness';     // Delgadez leve
    if (bmi >= 18.5 && bmi <= 24.9) return 'Normal';           // Normal (saludable)
    if (bmi >= 25 && bmi <= 27.9) return 'Pre-obese';          // Preobesidad
    if (bmi >= 28 && bmi <= 29.9) return 'High Overweight';    // Sobrepeso alto
    if (bmi >= 30 && bmi <= 34.9) return 'Obesity Class I';    // Obesidad grado I
    if (bmi >= 35 && bmi <= 39.9) return 'Obesity Class II';   // Obesidad grado II
    if (bmi >= 40) return 'Obesity Class III';                 // Obesidad grado III (mórbida)

    return 'Unknown';
}


