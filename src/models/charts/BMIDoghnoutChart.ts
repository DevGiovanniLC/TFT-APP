
export const BMIDoughnutChart = (bmi: number) => {
    const documentStyle = getComputedStyle(document.documentElement);

    const dataSet = [bmi, 40-bmi];

    return {
        data: {
            labels: ['Progress'],
            datasets: [
                {
                    data: dataSet,
                    backgroundColor: () =>{
                        let bmiColor = documentStyle.getPropertyValue('--color-tertiary');
                        if (bmi < 18.5) bmiColor = '#adccf2';
                        if (bmi >= 25) bmiColor = '#dbe388';
                        if (bmi >= 30) bmiColor = '#f2adad';

                        return [
                            bmiColor,
                            documentStyle.getPropertyValue('--color-accent'),
                        ]
                    }
                },
            ],
        },

        options: {
            responsive: false,
            maintainAspectRatio: true,
            cutout: '93%',
            radius: 180,
            animation: {
                // Desactivar la animación de desplazamiento
                animateScale: false,
                x: {
                    duration: 0,
                },
                y: {
                    duration: 0,
                },
                animateRotate: true,
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
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                },
            },
        },
    };
};
