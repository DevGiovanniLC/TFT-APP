import { Signal } from "@angular/core";
import { Weight } from "@models/types/Weight";
import { centerTextPlugin, customSVGsPluginForDoughnutChart } from "src/app/plugins/chartjs/ChartPlugins";

export const DoghnoutChart = (progression: Signal<number>, lastWeight: Signal<Weight>) => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        data: {
            labels: ['Progress'],
            datasets: [
                {
                    data: [progression(), 100 - progression()],
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
