import { Signal } from "@angular/core";

export const DoughnutChart = (progression: Signal<number>) => {
    const documentStyle = getComputedStyle(document.documentElement);

    let dataSet = [progression(), 100 - progression()];
    if (Number.isNaN(progression())) dataSet = [100, 0];
    if (progression() < 0) dataSet = [0, 100];
    if (progression() > 100) dataSet = [100, 0];

    return {
        data: {
            labels: ['Progress'],
            datasets: [
                {
                    data: dataSet,
                    backgroundColor: [documentStyle.getPropertyValue('--color-tertiary'), documentStyle.getPropertyValue('--color-accent')],
                }
            ]
        },

        options: {
            cutout: '93%',
            radius: 90,
            animation: {
                // Desactivar la animación de desplazamiento
                animateScale: false,
                x: {
                    duration: 0,
                },
                y:{
                    duration: 0,
                },

                // Mantener otras animaciones
                animateRotate: true,

                // Duración de la animación (en milisegundos)
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
                centerText: true,
                interaction: {
                    mode: 'nearest', // O 'index', dependiendo de tu preferencia
                    intersect: false, // Cambiar a `true` si quieres que solo funcione cuando el mouse esté directamente sobre los puntos
                },
            }
        },
    }
}
