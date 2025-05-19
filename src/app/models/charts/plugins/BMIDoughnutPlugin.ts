import { Chart } from 'chart.js';

const BODY_IMG_SRC = 'assets/icons/body.svg';
const MAX_BMI = 40;

const BMI_LEVELS = [
    { max: 16, text: 'Severe Thinness', color: '#f15757' },
    { max: 16.99, text: 'Moderate Thinness', color: '#cdc827' },
    { max: 18.49, text: 'Mild Thinness', color: '#cdc827' },
    { max: 24.9, text: 'Normal', color: '#4caf50' },
    { max: 27.9, text: 'Pre-obese', color: '#cdc827' },
    { max: 29.9, text: 'High Overweight', color: '#cdc827' },
    { max: 34.9, text: 'Obesity Class I', color: '#f15757' },
    { max: 39.9, text: 'Obesity Class II', color: '#f15757' },
    { max: Infinity, text: 'Obesity Class III', color: '#f15757' },
];

function getBMILevel(bmi: number) {
    return BMI_LEVELS.find(level => bmi <= level.max) ?? BMI_LEVELS[BMI_LEVELS.length - 1];
}

const bodyImg = new Image();
bodyImg.src = BODY_IMG_SRC;

export const BMIPluginDoughnut = (bmi: number) => ({
    id: 'bmiHumanFill',
    afterDraw(chart: Chart) {
        if (!bodyImg.complete) return;

        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;

        const { x: centerX, y: centerY, innerRadius, outerRadius } = meta.data[0] as any;
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
        const { color, text } = getBMILevel(bmi);

        tempCtx.fillStyle = color;
        tempCtx.fillRect(0, fillY, imgSize, fillHeight);

        tempCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(tempCanvas, imgX, imgY, imgSize, imgSize);

        // Dibuja el texto BMI
        ctx.font = 'bold 25px sans-serif';
        ctx.fillStyle = '#343a40';
        ctx.textAlign = 'center';
        ctx.fillText('BMI', centerX, centerY - 20);

        ctx.font = 'bold 45px sans-serif';
        ctx.fillText(bmi.toFixed(1), centerX, centerY + 40);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(text, centerX, centerY + 80);
    },
});
