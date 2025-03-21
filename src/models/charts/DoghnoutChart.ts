import { Signal } from "@angular/core";

export const DoghnoutChart = (progression: Signal<number>) => {
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
            }, animation: {
                duration: 0,
                animateScale: false, // Desactivar animación de escala
                animateRotate: false, // Desactivar animación de rotación
                animations: {
                    colors: {
                        type: 'color',
                        properties: ['backgroundColor'],
                        from: 'transparent',
                        to: 'backgroundColor'
                    },
                    opacity: {
                        type: 'number',
                        easing: 'easeInOutQuad',
                        duration: 5000,
                        from: 0,
                        to: 1,
                        loop: false
                    }
                }
            }
        },
    }


}
