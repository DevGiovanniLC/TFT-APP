import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, input, OnInit, output, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { Weight, WeightUnits, emptyWeight } from '@models/Weight';
import { IonButton, ModalController } from "@ionic/angular/standalone";
import { ChartModule } from 'primeng/chart';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightRegisterComponent } from '@components/WeightRegister/WeightRegister.component';

@Component({
    selector: 'app-main-display',
    imports: [
        IonButton,
        ChartModule
    ],
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplay implements OnInit {
    readonly weights = input.required<Weight[]>();
    readonly goal = input.required<Weight>();
    weightAdded = output<Weight>();

    chart = viewChild<any>('chart');

    svgImageStart: HTMLImageElement = new Image();
    svgImageProgress: HTMLImageElement = new Image();

    firstWeight: WritableSignal<Weight> = signal(emptyWeight);
    lastWeight: WritableSignal<Weight> = signal(emptyWeight);

    progression: Signal<number> = computed(() => {
        return this.calculationFunctionsService.weightProgression(this.firstWeight()?.weight, this.lastWeight()?.weight, this.goal()?.weight);
    })

    plugins: any[] = [];


    data: any;
    options: any;


    constructor(private calculationFunctionsService: CalculationFunctionsService, private modalCtrl: ModalController, private cdr: ChangeDetectorRef) {
        effect(() => {
            if (this.weights().length <= 0) return;
            this.lastWeight = signal(this.weights()[this.weights().length - 1]);
            this.firstWeight = signal(this.weights()[0]);
            cdr.detectChanges();
            this.initChart(this.progression());
            cdr.detectChanges();
        })
    }

    async openModal() {
        const modal = await this.modalCtrl.create({
            component: WeightRegisterComponent,
            cssClass: 'small-modal',
            breakpoints: [0, 0.45, 0.5],
            initialBreakpoint: 0.45,
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm') {
            this.weightAdded.emit(data)
        }

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
                    ctx.drawImage(this.svgImageStart, startX - 12, startY - 8, 25, 25);
                }

                if (this.svgImageProgress.complete) {
                    ctx.drawImage(this.svgImageProgress, progressX - 10, progressY - 18, 25, 25);
                }
            }
        };



        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart: any) => {
                const { ctx, chartArea } = chart;
                if (!chartArea) return;

                const { width, height } = chartArea;
                ctx.save();

                // Definir estilos
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'var(--color-accent)';

                const centerX = width / 2 + chartArea.left;
                const centerY = height / 2 + chartArea.top;


                ctx.font = 'bold 11px sans-serif';
                ctx.fillStyle = '#343a40';
                ctx.fillText(`Progression ${Number(this.progression()).toFixed(0)} %`, centerX, centerY - 40);

                ctx.font = 'bold 30px sans-serif';
                ctx.fillStyle = '#343a40';
                ctx.fillText(`${this.lastWeight()?.weight} ${this.lastWeight()?.weight_units}`, centerX, centerY + 5);

                ctx.font = '11px sans-serif ';
                ctx.fillStyle = '#1e8260';
                ctx.fillText(`${this.differenceTime(this.lastWeight()?.date, new Date())}`, centerX, centerY + 40);

                ctx.restore();
            }
        };


        this.svgImageStart.src = 'assets/icons/goal.svg';
        this.svgImageProgress.src = 'assets/icons/runner.svg';

        this.plugins.push(customSVGsPlugin);
        this.plugins.push(centerTextPlugin);
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

    private initChart(progression: number) {
        const documentStyle = getComputedStyle(document.documentElement);

        this.data = {
            labels: ['Progress'],
            datasets: [
                {
                    data: [progression, 100 - progression],
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
        };
    }

}
