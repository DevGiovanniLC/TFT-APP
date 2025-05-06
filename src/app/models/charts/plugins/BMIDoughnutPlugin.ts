import { Chart } from 'chart.js';

export const BMIPluginDoughnut = (bmi: number) => {
    const img = new Image();
    img.src = 'assets/icons/body.svg'; // Tu silueta transparente

    return {
        id: 'bmiHumanFill',
        afterDraw(chart: Chart) {
            if (!img.complete) return;

            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            if (!meta?.data?.length) return;

            const segment = meta.data[0];
            const {
                x: centerX,
                y: centerY,
                innerRadius,
                outerRadius,
            } = segment as unknown as { x: number; y: number; innerRadius: number; outerRadius: number };

            const targetRadius = innerRadius + (outerRadius - innerRadius) / 2;
            const imgSize = targetRadius * 0.3;

            const imgX = centerX - imgSize / 2;
            const imgY = imgSize;

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

            tempCtx.fillStyle = alertColor;
            tempCtx.fillRect(0, fillY, imgSize, fillHeight);

            ctx.font = 'bold 25px sans-serif';
            ctx.fillStyle = '#343a40';
            ctx.fillText(`BMI`, centerX - 25, centerY - 20);

            ctx.font = 'bold 45px sans-serif';
            ctx.fillStyle = '#343a40';
            ctx.fillText(bmi.toFixed(1), centerX - 45, centerY + 40);

            const text = getTextLevel(bmi);
            const textWidth = ctx.measureText(text).width;

            const centeredX = centerX - textWidth / 6;

            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = alertColor;
            ctx.fillText(text, centeredX, centerY + 80);

            tempCtx.globalCompositeOperation = 'source-over'; // Regresar a normal

            // Dibuja el canvas temporal relleno encima del original
            ctx.drawImage(tempCanvas, imgX, imgY, imgSize, imgSize);
        },
    };
};

const getColor = (bmi: number): string => {
    if (bmi >= 30) return '#f15757'; // Obesidad
    if (bmi >= 25) return '#cdc827'; // Sobre peso
    if (bmi < 18.49)
        return '#adccf2'; // Bajo de peso
    else return '#4caf50'; // Normal
};

const getTextLevel = (bmi: number): string => {
    const levels = [
        { max: 16, text: 'Severe Thinness' },
        { max: 16.99, text: 'Moderate Thinness' },
        { max: 18.49, text: 'Mild Thinness' },
        { max: 24.9, text: 'Normal' },
        { max: 27.9, text: 'Pre-obese' },
        { max: 29.9, text: 'High Overweight' },
        { max: 34.9, text: 'Obesity Class I' },
        { max: 39.9, text: 'Obesity Class II' },
        { max: Infinity, text: 'Obesity Class III' },
    ];

    return levels.find((level) => bmi <= level.max)?.text ?? 'Unknown';
};
