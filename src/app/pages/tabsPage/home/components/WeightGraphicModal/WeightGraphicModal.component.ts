import { ChangeDetectionStrategy, Component, effect, input, Signal } from '@angular/core';
import { ModalHeaderComponent } from '@components/modals/components/ModalHeader/ModalHeader.component';
import { ModalController } from '@ionic/angular/standalone';
import { ChartModule } from 'primeng/chart';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Weight } from '@models/types/Weight';
import { Goal } from '@models/types/Goal';
import { toSignal } from '@angular/core/rxjs-interop';
import { CalculationFunctionsService } from '@services/CalculationFunctions.service';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { UserConfigService } from '@services/UserConfig.service';
import ModalWeightChart from '@models/charts/ModalWeightChart';



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
        private readonly calculateFunctionsService: CalculationFunctionsService,
        private readonly weightTrackerService: WeightTrackerService,
        private readonly userService: UserConfigService
    ) {
        Chart.register(zoomPlugin);

        effect(() => {
            this.updateWeightChart(this.weights(), this.goal());
        });
    }

    updateWeightChart(weights: Weight[] | undefined, goal: Goal | undefined) {
        if (!weights) return;
        const weightChart = new ModalWeightChart(this.calculateFunctionsService, weights, goal);
        this.data = weightChart.getData();
        this.options = weightChart.getOptions();
    }


    exit() {
        this.modalCtrl.dismiss();
    }
}
