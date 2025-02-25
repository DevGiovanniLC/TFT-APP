import { AfterViewInit, Component, effect, Input, OnInit, Signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import 'chartjs-adapter-date-fns';
import Weight from '@models/Weight';
import { grid } from 'ionicons/icons';

@Component({
    selector: 'app-weight-graphic',
    imports: [ChartModule],
    templateUrl: './WeightGraphic.component.html',
})
export class WeightGraphic {
    @Input({ required: true }) weights!: Signal<Weight[]>

    data: any;
    options: any;

    constructor() {
        effect(() => {
            this.data = this.configureDataGraphic(this.weights());
            this.options = this.configureOptionGraphic(this.data.datasets[0].data);
        })
    }

    private configureDataGraphic(weights: Weight[]) {
        return {
            labels: weights.map((w) => w.date),
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: weights.map((w) => w.weight),
                    fill: false,
                    borderColor: '#00BD7E',
                    tension: 0.4,
                },
            ],
        };
    }

    private configureOptionGraphic(pesos: number[]) {
        const minPeso = Math.min(...pesos);
        const maxPeso = Math.max(...pesos);

        // Calcular un margen (por ejemplo, 20% del rango) para dar un efecto "zoom"
        const rango = maxPeso - minPeso;
        const margen = rango * 0.2 || 1; // Si el rango es 0, se asigna un margen mínimo

        return {
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
                    title: {
                        display: false,
                        text: 'Weight (kg)',
                    },
                    grid: {}
                },
            },
        };
    }
}
