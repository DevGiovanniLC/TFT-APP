import { TranslateService } from '@ngx-translate/core';
import { BMIService } from '@services/BMI.service';
import { Chart } from 'chart.js';
import type { ArcElement } from 'chart.js';

const BODY_IMG_SRC = 'assets/icons/body.svg';
const MAX_BMI = 40;

// Cargar imagen de silueta
const bodyImg = new Image();
bodyImg.src = BODY_IMG_SRC;

// Mapas por gráfico para evitar variables globales
const animationFrameMap = new WeakMap<Chart, number>();
const animatedBMIMap = new WeakMap<Chart, number>();
const animationSpeed = 0.4;

export const BMIPluginDoughnut = (
    translateService: TranslateService,
    bmiService: BMIService,
    bmi: number
) => ({
    id: 'bmiHumanFill',
    afterDraw(chart: Chart) {
        const animatedBMI = animatedBMIMap.get(chart) ?? 0;

        if (!bodyImg.complete) return;

        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;

        const arc = meta.data[0] as ArcElement;
        const { x: centerX, y: centerY, innerRadius, outerRadius } = arc;

        if (!isFinite(centerX) || !isFinite(centerY) || !innerRadius || !outerRadius) return;

        const radius = innerRadius + (outerRadius - innerRadius) / 2;
        const imgSize = radius * 0.29;

        if (imgSize <= 0) return;

        const imgX = centerX - imgSize / 2;
        const imgY = centerY - imgSize / 2 - 80;

        // Dibuja la silueta base
        ctx.save();
        ctx.drawImage(bodyImg, imgX, imgY, imgSize, imgSize);
        ctx.restore();

        // Canvas temporal
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgSize;
        tempCanvas.height = imgSize;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(bodyImg, 0, 0, imgSize, imgSize);
        tempCtx.globalCompositeOperation = 'source-in';

        // Animación del valor actual
        const clampedBMI = Math.min(bmi, MAX_BMI);
        let newAnimatedBMI = animatedBMI;

        if (newAnimatedBMI < clampedBMI) {
            newAnimatedBMI = Math.min(newAnimatedBMI + animationSpeed, clampedBMI);
        } else if (newAnimatedBMI > clampedBMI) {
            newAnimatedBMI = Math.max(newAnimatedBMI - animationSpeed, clampedBMI);
        }

        animatedBMIMap.set(chart, newAnimatedBMI);

        const { color: labelColor, label } = bmiService.getBMICategory(bmi);
        const { color: silhouetteColor } = bmiService.getBMICategory(newAnimatedBMI);

        const fillHeight = (imgSize * newAnimatedBMI) / MAX_BMI;
        const fillY = imgSize - fillHeight;

        tempCtx.fillStyle = silhouetteColor;
        tempCtx.fillRect(0, fillY, imgSize, fillHeight);
        ctx.drawImage(tempCanvas, imgX, imgY, imgSize, imgSize);

        // Dibujar textos
        ctx.font = 'bold 25px sans-serif';
        ctx.fillStyle = '#343a40';
        ctx.textAlign = 'center';
        ctx.fillText(translateService.instant('KEY_WORDS.BMI'), centerX, centerY - 20);

        ctx.font = 'bold 45px sans-serif';
        ctx.fillText(newAnimatedBMI.toFixed(1), centerX, centerY + 40);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = labelColor;
        ctx.fillText(label, centerX, centerY + 80);

        // Animación en bucle
        if (newAnimatedBMI !== clampedBMI && !animationFrameMap.get(chart)) {
            const frameId = requestAnimationFrame(() => {
                animationFrameMap.delete(chart);
                chart.update('none'); // Redibuja sin animar datasets
            });
            animationFrameMap.set(chart, frameId);
        }
    }
});
