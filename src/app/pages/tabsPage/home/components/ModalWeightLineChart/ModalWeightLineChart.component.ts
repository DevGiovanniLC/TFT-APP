import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { ModalController } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Weight } from '@models/types/Weight.type';
import { Goal } from '@models/types/Goal.type';
import { toSignal } from '@angular/core/rxjs-interop';
import { WeightAnalysisService } from '@services/WeightAnalysis.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';
import ModalWeightLineChart from '@models/charts/ModalWeightLineChart';
import { BMICategory, BMIService } from '@services/BMI.service';
import { TranslateService } from '@ngx-translate/core';



@Component({
    selector: 'app-weight-graphic-modal',
    imports: [ModalHeaderComponent, ChartModule],
    templateUrl: './ModalWeightLineChart.component.html',
    styleUrl: './ModalWeightLineChart.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalWeightLineChartComponent {
    data!: ChartData<'line'>;
    options!: ChartOptions<'line'>;

    private readonly goal = toSignal(this.userService.goal$);
    private readonly weights = toSignal(this.weightTrackerService.weights$);


    constructor(
        private readonly translateService: TranslateService,
        private readonly modalCtrl: ModalController,
        private readonly weightAnalysis: WeightAnalysisService,
        private readonly weightTrackerService: WeightTrackerService,
        private readonly userService: UserConfigService,
        private readonly BMIService: BMIService
    ) {
        Chart.register(zoomPlugin);

        effect(() => {
            this.updateWeightChart(this.weights(), this.goal(), this.BMIService.BMI_CATEGORIES);
        });
    }

    updateWeightChart(weights: Weight[] | undefined, goal: Goal | undefined, categories: BMICategory[]) {
        if (!weights) return;
        const weightChart = new ModalWeightLineChart(this.translateService, this.weightAnalysis, weights, goal, categories);
        this.data = weightChart.getData();
        this.options = weightChart.getOptions();
    }


    exit() {
        this.modalCtrl.dismiss();
    }
}
