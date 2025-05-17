import { ChangeDetectionStrategy, Component, effect, input, Signal } from '@angular/core';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { ModalController } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Weight } from '@models/types/Weight';
import { Goal } from '@models/types/Goal';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';
import ModalWeightChart from '@models/charts/ModalWeightChart';
import { BMIService } from '@services/BMI.service';



@Component({
    selector: 'app-weight-graphic-modal',
    imports: [ModalHeaderComponent, ChartModule],
    templateUrl: './WeightGraphicModal.component.html',
    styleUrl: './WeightGraphicModal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightGraphicModalComponent {
    data!: ChartData<'line'>;
    options!: ChartOptions<'line'>;

    private readonly goal = toSignal(this.userService.goal$);
    private readonly weights = toSignal(this.weightTrackerService.weights$);


    constructor(
        private readonly modalCtrl: ModalController,
        private readonly calculateFunctionsService: WeightAnalysisService,
        private readonly weightTrackerService: WeightTrackerService,
        private readonly userService: UserConfigService,
        private readonly BMIService: BMIService
    ) {
        Chart.register(zoomPlugin);

        effect(() => {
            this.updateWeightChart(this.weights(), this.goal(), this.BMIService.getBMILimitsForHeight());
        });
    }

    updateWeightChart(weights: Weight[] | undefined, goal: Goal | undefined, categories: { label: string; bmi: number; weight: number; alert: string; }[]) {
        if (!weights) return;
        const weightChart = new ModalWeightChart(this.calculateFunctionsService, weights, goal, categories);
        this.data = weightChart.getData();
        this.options = weightChart.getOptions();
    }


    exit() {
        this.modalCtrl.dismiss();
    }
}
