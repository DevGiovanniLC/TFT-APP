import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, effect, input, output, Signal, signal, WritableSignal } from '@angular/core';
import { Weight, emptyWeight } from '@models/types/Weight';
import { IonButton, ModalController } from "@ionic/angular/standalone";
import { ChartModule } from 'primeng/chart';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightRegisterComponent } from '@pages/HomePage/components/WeightRegister/WeightRegister.component';
import { centerTextPlugin, customSVGsPluginForDoughnutChart } from 'src/app/plugins/chartjs/ChartPlugins';
import { DoughnutChart } from '@models/charts/DoghnoutChart';

@Component({
    selector: 'app-main-display',
    imports: [
        IonButton,
        ChartModule
    ],
    templateUrl: './MainDisplay.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDisplay {
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
    plugins: any = [];

    isButtonActive = signal(false);

    constructor(private calculationFunctionsService: CalculationFunctionsService, private modalCtrl: ModalController, private cdr: ChangeDetectorRef) {
        effect(() => {
            this.goal()
            this.weights()
            this.updateChart(cdr);
        })

    }

    async updateChart(cdr: ChangeDetectorRef) {
        if (this.weights().length <= 0) return;
        this.lastWeight.set(this.weights()[this.weights().length - 1]);
        this.firstWeight.set(this.weights()[0]);

        this.doghnoutChart = DoughnutChart(this.progression);
        this.data = this.doghnoutChart.data
        this.options = this.doghnoutChart.options
        this.plugins.push(centerTextPlugin(this.progression, this.lastWeight))
        if (!Number.isNaN(this.progression())) return
        this.plugins = [customSVGsPluginForDoughnutChart(), centerTextPlugin(this.progression, this.lastWeight)]
        cdr.detectChanges();
    }

    async openModal() {
        this.isButtonActive.set(true);
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
        this.isButtonActive.set(false);
    }

}
