import { Injector, Signal } from "@angular/core";
import { Weight } from "@models/types/Weight";
import { CalculationFunctionsService } from "@services/CalculationFunctions.service";

const injector = Injector.create({providers:[CalculationFunctionsService]});
const calculationFunctionsService = injector.get(CalculationFunctionsService);

export const customSVGsPluginForDoughnutChart = (svgImageStart: HTMLImageElement, svgImageProgress: HTMLImageElement) => {
    return {
        id: 'customSVG',
        afterDraw: (chartInstance: any) => {

            const ctx = chartInstance.ctx;

            const meta = chartInstance.getDatasetMeta(0);
            if (!meta || !meta.data || meta.data.length === 0) {
                return;
            }

            const segment = meta.data[0];

            const centerX = segment.x;
            const centerY = segment.y;
            const outerRadius = segment.outerRadius;

            const startAngle = segment.startAngle;
            const startX = centerX + outerRadius * Math.cos(startAngle);
            const startY = centerY + outerRadius * Math.sin(startAngle);

            const endAngle = segment.endAngle;
            const progressX = centerX + outerRadius * Math.cos(endAngle);
            const progressY = centerY + outerRadius * Math.sin(endAngle);


            if (svgImageStart.complete) {
                ctx.drawImage(svgImageStart, startX - 12, startY - 8, 25, 25);
            }

            if (svgImageProgress.complete) {
                ctx.drawImage(svgImageProgress, progressX - 10, progressY - 18, 25, 25);
            }
        }
    }

}




export const centerTextPlugin = (progression: Signal<Number>, lastWeight: Signal<Weight>) => {
    return {
        id: 'centerText',
        afterDraw: (chart: any) => {
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


            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#343a40';
            ctx.fillText(`Progression ${Number(progression()).toFixed(0)} %`, centerX, centerY - 35);

            ctx.font = 'bold 30px sans-serif';
            ctx.fillStyle = '#343a40';
            ctx.fillText(`${lastWeight()?.weight} ${lastWeight()?.weight_units}`, centerX, centerY + 5);

            ctx.font = '13px sans-serif ';
            ctx.fillStyle = '#1e8260';
            ctx.fillText(`${differenceTime(lastWeight()?.date, new Date())}`, centerX, centerY + 50);

            ctx.restore();
        }
    };
}










function differenceTime(dateStart: Date, dateEnd: Date) {
    const days = calculationFunctionsService.dayDifference(dateStart, dateEnd);

    const cases = new Map<(val: number) => boolean, () => string>([
        [(v) => v > 365, () => `${Math.floor(days / 365)} years ago`],
        [(v) => v > 30, () => `${Math.floor(days / 30)} months ago`],
        [(v) => v > 7, () => `${Math.floor(days / 7)} weeks ago`],
    ]);

    let result = `${Math.floor(days)} days ago`;

    for (const [condition, action] of cases) {
        if (condition(days)) {
            result = action();
            break;
        }
    }

    return result;

}
