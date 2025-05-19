import { Injector, Signal } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { TimeService } from '@services/Time.service';
import { Chart } from 'chart.js';

const injector = Injector.create({ providers: [WeightAnalysisService, TimeService] });
const timeService = injector.get(TimeService);

const loadSVG = (src: string) => {
    const img = new Image();
    img.src = src;
    return img;
};

const svgImageStart = loadSVG('assets/icons/goal.svg');
const svgImageProgress = loadSVG('assets/icons/runner.svg');

export const SVGIconsPlugin = () => ({
    id: 'customSVG',
    afterDraw: (chart: Chart) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;

        const segment = meta.data[0] as any;
        const { x: centerX, y: centerY, innerRadius, startAngle, endAngle } = segment;
        const radius = innerRadius + 2;

        const getCoords = (angle: number) => [
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle),
        ];

        const [startX, startY] = getCoords(startAngle);
        const [progressX, progressY] = getCoords(endAngle);

        const ctx = chart.ctx;
        if (svgImageStart.complete) ctx.drawImage(svgImageStart, startX - 12, startY - 14, 30, 30);
        if (svgImageProgress.complete) ctx.drawImage(svgImageProgress, progressX - 10, progressY - 18, 30, 30);
        ctx.restore();
    },
});

const getProgressionText = (progress: number) => {
    if (progress >= 100) return { text: 'Completed✅', offset: -38, color: '#343a40' };
    if (progress >= 90) return { text: 'Just a little bit more 👍', offset: -38, color: '#343a40' };
    if (progress >= 80) return { text: 'Just a bit more 👍', offset: -38, color: '#343a40' };
    if (progress >= 50) return { text: 'Wonderfully done 🎉', offset: -38, color: '#1E8260' };
    if (progress >= 20) return { text: 'Good job 😁', offset: -38, color: '#343a40' };
    if (progress >= 5) return { text: 'Keep going 💪', offset: -38, color: '#343a40' };
    if (progress >= 0) return { text: "Let's start👍", offset: -38, color: '#343a40' };
    if (isNaN(progress)) return { text: "", offset: -38, color: '#343a40' };
    return { text: 'You can do better', offset: -35, color: '#C7B85A' };
};

export const TextPlugin = (progression: Signal<number>, lastWeight: Signal<Weight | undefined>) => ({
    id: 'centerText',
    afterDraw: (chart: Chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        const progress = Number(Math.min(100, progression()));
        const { text, offset, color } = getProgressionText(progress);

        ctx.font = 'bold 13px system-ui';
        ctx.fillStyle = '#343a40';
        if (progress <= 100) ctx.fillText(`Progression ${isNaN(progress) ? 0 : progress.toFixed(0)} %`, centerX, centerY - 60);

        ctx.font = '13px system-ui';
        ctx.fillStyle = '#343a40';
        if (text) {
            ctx.fillStyle = color;
            ctx.fillText(text, centerX + 3, centerY + offset);
        }

        ctx.font = 'bold 35px sans-serif';
        ctx.fillStyle = '#343a40';
        const weight = lastWeight();

        ctx.fillText(
            `${weight?.weight ?? 'No Data'} ${weight?.weight_units ?? ''}`,
            centerX,
            centerY + (isNaN(progress) ? 0 : 5)
        );

        ctx.font = '16px system-ui';
        ctx.fillStyle = '#1e8260';
        ctx.fillText(
            differenceTime(weight?.date ?? timeService.now(), timeService.now()),
            centerX,
            centerY + 62
        );

        ctx.restore();
    },
});

function differenceTime(dateStart: Date, dateEnd: Date) {
    const days = timeService.dayDifference(new Date(dateStart), new Date(dateEnd));
    if (days > 365) return `${Math.floor(days / 365)} years ago`;
    if (days > 30) return `${Math.floor(days / 30)} months ago`;
    if (days > 7) return `${Math.floor(days / 7)} weeks ago`;
    if (days > 2) return `${Math.floor(days)} days ago`;
    if (days > 1) return 'Yesterday';
    return 'Today';
}
