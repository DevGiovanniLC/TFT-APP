import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, input, OnInit, output, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { Weight, WeightUnits, emptyWeight } from '@models/types/Weight';
import { IonButton, ModalController } from "@ionic/angular/standalone";
import { ChartModule } from 'primeng/chart';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightRegisterComponent } from '@components/WeightRegister/WeightRegister.component';
import { centerTextPlugin, customSVGsPluginForDoughnutChart } from 'src/app/plugins/chartjs/ChartPlugins';
import { DoghnoutChart } from '@models/charts/DoghnoutChart';
import { Title } from 'chart.js';

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



    firstWeight: WritableSignal<Weight> = signal(emptyWeight);
    lastWeight: WritableSignal<Weight> = signal(emptyWeight);

    progression: Signal<number> = computed(() => {
        return this.calculationFunctionsService.weightProgression(this.firstWeight()?.weight, this.lastWeight()?.weight, this.goal()?.weight);
    })

    doghnoutChart: any;
    data: any;
    options: any;
    plugins: any[] = [];

    constructor(private calculationFunctionsService: CalculationFunctionsService, private modalCtrl: ModalController, private cdr: ChangeDetectorRef) {
        effect(() => {
            if (this.weights().length <= 0) return;
            this.lastWeight.set(this.weights()[this.weights().length - 1]);
            this.firstWeight.set(this.weights()[0]);

            this.doghnoutChart = DoghnoutChart(this.progression, this.lastWeight);
            this.data = this.doghnoutChart.data
            this.options = this.doghnoutChart.options
            cdr.detectChanges();
        })

    }

    ngOnInit(): void {
        const svgImageStart: HTMLImageElement = new Image();
        const svgImageProgress: HTMLImageElement = new Image();
        svgImageStart.src = 'assets/icons/goal.svg';
        svgImageProgress.src = 'assets/icons/runner.svg';
        this.plugins = [
            customSVGsPluginForDoughnutChart(svgImageStart, svgImageProgress),
            centerTextPlugin(this.progression, this.lastWeight)
        ];
    }

    async openModal() {
        const modal = await this.modalCtrl.create({
            component: WeightRegisterComponent,
            cssClass: 'small-modal',
            breakpoints: [0, 0.45, 0.75],
            initialBreakpoint: 0.75,
            componentProps: {
                text:{
                    title: 'Register Weight',
                    weightStepTitle: 'Select the weight',
                    dateStepTitle: 'Pick the date'
                }
            }
        });
        modal.present();

        const { data, role } = await modal.onDidDismiss();

        if (role === 'confirm') {
            this.weightAdded.emit(data)
        }

    }

}
