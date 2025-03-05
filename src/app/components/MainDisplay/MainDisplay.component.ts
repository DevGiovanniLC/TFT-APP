import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, ElementRef, input, OnInit, signal, Signal, viewChild } from '@angular/core';
import { Weight, WeightUnits } from '@models/Weight';
import { IonButton } from "@ionic/angular/standalone";
import { ChartModule } from 'primeng/chart';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-main-display',
    imports: [
        IonButton,
        ChartModule
    ],
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplayComponent implements OnInit {
    readonly weights = input.required<Signal<Weight[]>>();
    readonly goal = input.required<Signal<Weight>>();

    chart = viewChild<any>('chart');

    svgImageStart: HTMLImageElement = new Image();
    svgImageProgress: HTMLImageElement = new Image();


    actualWeight = signal(0);
    weightUnits = signal(WeightUnits.KG);
    dateWeight = signal(new Date());
    firstWeight = signal(0)
    progression = computed(() => {
        return this.calculationFunctionsService.weightProgression(this.firstWeight(), this.actualWeight(), this.goal()().weight);
    })


    data: any;
    options: any;


    constructor(private calculationFunctionsService: CalculationFunctionsService, private cdr: ChangeDetectorRef) {
        effect(() => {
            this.actualWeight.set(this.weights()()[0]?.weight);
            this.firstWeight.set(this.weights()()[this.weights()().length - 1]?.weight);
            this.weightUnits.set(this.weights()()[0]?.weight_units);
            this.dateWeight.set(new Date(this.weights()()[0]?.date));
        })

        effect(() => {
            this.progression();
            this.initChart();
            cdr.detectChanges();
        })
    }




    ngOnInit(): void {

        const customSVGsPlugin = {
            id: 'customSVG',
            afterDraw: (chartInstance: any) => {

                const ctx = chartInstance.ctx;

                const meta = chartInstance.getDatasetMeta(0);
                if (!meta || !meta.data || meta.data.length === 0) {
                    return;
                }

                const segment = meta.data[0];

                const centerX = segment.x;
                const centerY = segment.y;
                const outerRadius = segment.outerRadius;

                const startAngle = segment.startAngle;
                const startX = centerX + outerRadius * Math.cos(startAngle);
                const startY = centerY + outerRadius * Math.sin(startAngle);

                const endAngle = segment.endAngle;
                const progressX = centerX + outerRadius * Math.cos(endAngle);
                const progressY = centerY + outerRadius * Math.sin(endAngle);


                if (this.svgImageStart.complete) {
                    ctx.drawImage(this.svgImageStart, startX - 12, startY - 10, 30, 30);
                }

                if (this.svgImageProgress.complete) {
                    ctx.drawImage(this.svgImageProgress, progressX - 15, progressY - 18, 28, 28);
                }
            }
        };



        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart: any) => {
                const { ctx, chartArea } = chart;
                if (!chartArea) return; // Evita errores si el gráfico no está listo

                const { width, height } = chartArea;
                ctx.save();

                // Definir estilos
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'var(--color-accent)';

                const centerX = width / 2 + chartArea.left;
                const centerY = height / 2 + chartArea.top;


                ctx.font = 'bold 30px sans-serif';
                ctx.fillStyle = '#343a40';
                ctx.fillText(`${this.actualWeight()} ${this.weightUnits()}`, centerX, centerY);

                ctx.font = '11px sans-serif ';
                ctx.fillStyle = '#1e8260';
                ctx.fillText(`${this.differenceTime(this.dateWeight(), new Date())}`, centerX, centerY + 40);

                ctx.restore();
            }
        };


        Chart.register(customSVGsPlugin);
        Chart.register(centerTextPlugin);
        this.svgImageStart.src = 'assets/icons/goal.svg';
        this.svgImageProgress.src = 'assets/icons/runner.svg';
    }



    private differenceTime(dateStart: Date, dateEnd: Date) {
        const days = this.calculationFunctionsService.dayDifference(dateStart, dateEnd);

        const cases = new Map<(val: number) => boolean, () => string>([
            [(v) => v > 365, () => `${Math.floor(days / 365)} years ago`],
            [(v) => v > 30, () => `${Math.floor(days / 30)} months ago`],
            [(v) => v > 7, () => `${Math.floor(days / 7)} weeks ago`],
        ]);

        let result = `${Math.floor(days)} days ago`;

        for (const [condition, action] of cases) {
            if (condition(days)) {
                result = action();
                break;
            }
        }

        return result;

    }

    private initChart() {
        const documentStyle = getComputedStyle(document.documentElement);

        this.data = {
            labels: ['Progress'],
            datasets: [
                {
                    data: [this.progression(), 90 - this.progression()],
                    backgroundColor: [documentStyle.getPropertyValue('--color-tertiary'), documentStyle.getPropertyValue('--color-accent')],
                }
            ]
        };

        this.options = {
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
            }
        };
    }

}
