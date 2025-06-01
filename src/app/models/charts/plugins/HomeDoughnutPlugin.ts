import { Injector, Signal } from '@angular/core';
import { Weight } from '@models/types/Weight.type';
import { ServiceHolder } from '@services/ServiceHolder';
import { TimeService } from '@services/Time.service';
import { Chart } from 'chart.js';
import type { ArcElement } from 'chart.js';

const injector = Injector.create({ providers: [TimeService] });
const timeService = injector.get(TimeService);
const translateService = ServiceHolder.translateService;

const loadSVG = (src: string) => {
    const img = new Image();
    img.src = src;
    return img;
};

const svgStart = loadSVG('assets/icons/goal.svg');
const svgProgress = loadSVG('assets/icons/runner.svg');

export const SVGIconsPlugin = () => ({
    id: 'customSVG',
    afterDraw: (chart: Chart) => {
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;


        // Usa el tipo ArcElement de Chart.js para tipar correctamente
        const { x: cx, y: cy, innerRadius, startAngle, endAngle } = meta.data[0] as ArcElement;
        const radius = innerRadius + 2;

        const getCoords = (angle: number) => [
            cx + radius * Math.cos(angle),
            cy + radius * Math.sin(angle),
        ];

        const [startX, startY] = getCoords(startAngle);
        const [progressX, progressY] = getCoords(endAngle);

        const ctx = chart.ctx;

        if (svgStart.complete) ctx.drawImage(svgStart, startX - 12, startY - 14, 30, 30);

        if (svgProgress.complete) {
            ctx.save();
            ctx.translate(progressX, progressY);

            // Calcular el punto donde ubicar el SVG
            let progressPercent = (endAngle - startAngle) / (Math.PI * 2);
            if (progressPercent < 0) progressPercent += 1;

            // Puntos donde hacer el flip al SVG
            if (progressPercent >= 0.28 && progressPercent < 0.75) ctx.scale(-1, 1);

            ctx.drawImage(svgProgress, -15, -15, 30, 30);
            ctx.restore();
        }
    },
});

const getProgressionText = (progress: number) => {
    if (progress >= 100) return { text: `${translateService.instant('TAB1.MESSAGES.COMPLETED')}✅`, offset: -38, color: '#343a40' };
    if (progress >= 90) return { text: `${translateService.instant('TAB1.MESSAGES.JUST_A_LITTLE')}👍`, offset: -38, color: '#343a40' };
    if (progress >= 80) return { text: `${translateService.instant('TAB1.MESSAGES.JUST_A_BIT')}👍`, offset: -38, color: '#343a40' };
    if (progress >= 50) return { text: `${translateService.instant('TAB1.MESSAGES.WONDERFULLY_DONE')}🎉`, offset: -38, color: '#1E8260' };
    if (progress >= 20) return { text: `${translateService.instant('TAB1.MESSAGES.GOOD_JOB')}😁`, offset: -38, color: '#343a40' };
    if (progress >= 5) return { text: `${translateService.instant('TAB1.MESSAGES.KEEP_GOING')}💪`, offset: -38, color: '#343a40' };
    if (progress >= 0) return { text: `${translateService.instant('TAB1.MESSAGES.LETS_START')}👍`, offset: -38, color: '#343a40' };
    if (isNaN(progress)) return { text: "", offset: -38, color: '#343a40' };
    return { text: `${translateService.instant('TAB1.MESSAGES.DO_BETTER')}`, offset: -35, color: '#C7B85A' };
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
        if (progress <= 100) ctx.fillText(`${translateService.instant('TAB1.PROGRESSION')} ${isNaN(progress) ? 0 : progress.toFixed(0)} %`, centerX, centerY - 60);

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
    if (days > 365) return `${Math.floor(days / 365)} ${translateService.instant('TAB1.TIME.YEARS_AGO')}`;
    if (days > 30) return `${Math.floor(days / 30)} ${translateService.instant('TAB1.TIME.MONTHS_AGO')}`;
    if (days > 7) return `${Math.floor(days / 7)} ${translateService.instant('TAB1.TIME.WEEKS_AGO')}`;
    if (days > 2) return `${Math.floor(days)} ${translateService.instant('TAB1.TIME.DAYS_AGO')}`;
    if (days > 1) return translateService.instant('TAB1.TIME.YESTERDAY');
    return translateService.instant('TAB1.TIME.TODAY');
}
