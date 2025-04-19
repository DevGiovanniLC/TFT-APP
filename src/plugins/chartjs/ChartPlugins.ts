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
