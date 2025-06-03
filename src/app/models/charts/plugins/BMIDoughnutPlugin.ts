import { TranslateService } from '@ngx-translate/core';
import { BMIService } from '@services/BMI.service';
import { Chart } from 'chart.js';
import type { ArcElement } from 'chart.js';

const BODY_IMG_SRC = 'assets/icons/body.svg';
const MAX_BMI = 40;



function getBMICategory(bmiService: BMIService, bmi: number) {
    const bmiCategories = bmiService.BMI_CATEGORIES
    const category = bmiCategories.find(cat => bmi < cat.max && bmi > cat.min) ?? bmiCategories[0]
    return category
}

const bodyImg = new Image();
bodyImg.src = BODY_IMG_SRC;

export const BMIPluginDoughnut = (translateService: TranslateService, bmiService: BMIService, bmi: number) => ({
    id: 'bmiHumanFill',
    afterDraw(chart: Chart) {
        if (!bodyImg.complete) return;

        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;

        const arc = meta.data[0] as ArcElement;
        const { x: centerX, y: centerY, innerRadius, outerRadius } = arc;
        const radius = innerRadius + (outerRadius - innerRadius) / 2;
        const imgSize = radius * 0.29;
        const imgX = centerX - imgSize / 2;
        const imgY = centerY - imgSize / 2 - 80;

        // Dibuja la silueta base
        ctx.save();
        ctx.drawImage(bodyImg, imgX, imgY, imgSize, imgSize);
        ctx.restore();

        // Prepara el canvas temporal
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgSize;
        tempCanvas.height = imgSize;
        const tempCtx = tempCanvas.getContext('2d')!;

        tempCtx.drawImage(bodyImg, 0, 0, imgSize, imgSize);
        tempCtx.globalCompositeOperation = 'source-in';

        const fillHeight = imgSize * Math.min(bmi, MAX_BMI) / MAX_BMI;
        const fillY = imgSize - fillHeight;
        const { color, label } = getBMICategory(bmiService, bmi);

        tempCtx.fillStyle = color;
        tempCtx.fillRect(0, fillY, imgSize, fillHeight);

        tempCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tempCanvas, imgX, imgY, imgSize, imgSize);

        // Dibuja el texto BMI
        ctx.font = 'bold 25px sans-serif';
        ctx.fillStyle = '#343a40';
        ctx.textAlign = 'center';
        ctx.fillText(translateService.instant('KEY_WORDS.BMI'), centerX, centerY - 20);

        ctx.font = 'bold 45px sans-serif';
        ctx.fillText(bmi.toFixed(1), centerX, centerY + 40);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(label, centerX, centerY + 80);
    },
});
