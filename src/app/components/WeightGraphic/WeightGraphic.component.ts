import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import 'chartjs-adapter-date-fns';
import { tick } from '@angular/core/testing';
import { max, min } from 'rxjs';

@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule],
    templateUrl: './WeightGraphic.component.html',
})
export class WeightGraphic implements OnInit {
    data: any;
    options: any;

    constructor() {
        this.configureGraphic();
    }

    ngOnInit(): void {}

    configureGraphic() {
        this.data = {
            labels: [
                '2025-02-01',
                '2025-02-05',
                '2025-02-10',
                '2025-02-15',
                '2025-02-20',
            ],
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: [70, 69.5, 69, 68.8, 68.5],
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.4,
                },
            ],
        };
        const pesos = this.data.datasets[0].data;
        const minPeso = Math.min(...pesos);
        const maxPeso = Math.max(...pesos);

        // Calcular un margen (por ejemplo, 20% del rango) para dar un efecto "zoom"
        const rango = maxPeso - minPeso;
        const margen = rango * 0.2 || 1; // Si el rango es 0, se asigna un margen mínimo

        // Configurar las opciones del gráfico
        this.options = {
            responsive: true,
            maintainAspectRatio: true,
            pointBackgroundColor: '#00BD7E',
            plugins: {
                legend: {
                    display: false,
                    onClick: () => {},
                    position: 'top',
                },
                title: {
                    display: false,
                    text: 'Evolución del Peso (Vista Ampliada)',
                },
            },
            scales: {
                x: {
                    type: 'time', // Eje de tiempo para las fechas
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM dd, yyyy',
                        displayFormats: {
                            day: 'MMM dd',
                        },
                    },
                    title: {
                        display: false,
                        text: 'Date',
                    },
                },
                y: {
                    // Se establece el rango "acercado" usando el mínimo y máximo con margen
                    min: minPeso - margen,
                    max: maxPeso + margen,
                    ticks: {
                        // Se puede ajustar el stepSize o dejar que Chart.js lo calcule automáticamente
                        // stepSize: ((maxPeso + margen) - (minPeso - margen)) / 10
                    },
                    title: {
                        display: false,
                        text: 'Weight (kg)',
                    },
                },
            },
        };
    }
}
