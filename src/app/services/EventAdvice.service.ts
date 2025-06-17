import { computed, effect, Injectable } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { WeightAnalysisService } from './WeightAnalysis.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Weight } from '@models/types/Weight.type';
import { AlertController } from '@ionic/angular/standalone';
import { BMIService } from './BMI.service';
import { TimeService } from './Time.service';
import { PreferenceService, Preference } from './Preference.service';
import { TranslateService } from '@ngx-translate/core';
import { UserConfigEvent, WeightTrackerEvent } from '@models/enums/Events';
import { AlertMode } from '@models/enums/AlertOverlay';



@Injectable({ providedIn: 'root' })
/**
 * Servicio que supervisa eventos de salud (peso, BMI y objetivos)
 * y muestra consejos/alertas al usuario mediante modales.
 * @export
 * @class EventAdviceService
 */
export class EventAdviceService {
    /** Señal del objetivo configurado por el usuario */
    private readonly goal = toSignal(this.userConfig.goal$);
    /** Señal del último peso registrado */
    private readonly lastWeight = toSignal(this.weightTracker.lastWeight$);
    /** Señal del BMI calculado */
    private readonly bmi = toSignal(this.bmiService.bmi$);

    /** Ritmo de pérdida de peso mensual comparado con el objetivo */
    private readonly monthsPaceLossGoal = computed(() => this.calcPace('month'));
    /** Ritmo de pérdida de peso semanal comparado con el objetivo */
    private readonly weeksPaceLossGoal = computed(() => this.calcPace('week'));

    /** Histórico de registros de peso para comparaciones */
    private readonly history: Weight[] = [];

    constructor(
        private readonly translateService: TranslateService,
        private readonly bmiService: BMIService,
        private readonly userConfig: UserConfigService,
        private readonly weightTracker: WeightTrackerService,
        private readonly weightAnalysis: WeightAnalysisService,
        private readonly alertCtrl: AlertController,
        private readonly timeService: TimeService,
        private readonly preference: PreferenceService
    ) {
        effect(() => {
            if (this.checkBMI(this.bmi())) return this.resetEvents();
            this.checkLastWeight(this.lastWeight());
            this.checkGoal(this.monthsPaceLossGoal(), this.weeksPaceLossGoal())
            this.resetEvents();
        })

    }

    private resetEvents(): void {
        this.userConfig.eventTriggered = UserConfigEvent.NONE;
        this.weightTracker.eventTriggered = WeightTrackerEvent.NONE;
    }

    private calcPace(type: 'month' | 'week'): number {
        const lastWeight = this.lastWeight();
        const goal = this.goal();
        if (!goal?.weight || !goal.date || !lastWeight?.weight) return NaN;
        return type === 'month'
            ? this.weightAnalysis.monthWeightLossPace(lastWeight.weight, goal.weight, lastWeight.date, goal.date)
            : this.weightAnalysis.weekWeightLossPace(lastWeight.weight, goal.weight, lastWeight.date, goal.date);
    }

    private checkBMI(bmi?: number | null): boolean {
        if (!bmi || !this.weightTracker.isLastEvent(WeightTrackerEvent.ADD)) return false;

        const prefs = {
            BMI_ALERT_40: this.preference.get('BMI_ALERT_40'),
            BMI_ALERT_35: this.preference.get('BMI_ALERT_35'),
            BMI_ALERT_18_5: this.preference.get('BMI_ALERT_18_5'),
            BMI_ALERT_16: this.preference.get('BMI_ALERT_16'),
        } as Record<keyof Preference, boolean>;

        if (bmi < 16 && prefs.BMI_ALERT_16) {
            this.showBMIAlert(
                this.translateService.instant('ALERTS.BMI_VERY_LOW.TITLE'),
                this.translateService.instant('ALERTS.BMI_VERY_LOW.MESSAGE'),
                AlertMode.DANGER,
                ['BMI_ALERT_16', 'BMI_ALERT_18_5']
            );
            return true;
        } else if (bmi < 18.5 && prefs.BMI_ALERT_18_5) {
            this.showBMIAlert(
                this.translateService.instant('ALERTS.BMI_LOW.TITLE'),
                this.translateService.instant('ALERTS.BMI_LOW.MESSAGE'),
                AlertMode.WARNING,
                ['BMI_ALERT_18_5']
            );
            return true;
        } else if (bmi >= 40 && prefs.BMI_ALERT_40) {
            this.showBMIAlert(
                this.translateService.instant('ALERTS.BMI_VERY_HIGH.TITLE'),
                this.translateService.instant('ALERTS.BMI_VERY_HIGH.MESSAGE'),
                AlertMode.DANGER,
                ['BMI_ALERT_40', 'BMI_ALERT_35']
            );
            return true;
        } else if (bmi >= 35 && prefs.BMI_ALERT_35) {
            this.showBMIAlert(
                this.translateService.instant('ALERTS.BMI_HIGH.TITLE'),
                this.translateService.instant('ALERTS.BMI_HIGH.MESSAGE'),
                AlertMode.WARNING,
                ['BMI_ALERT_35']
            );
            return true;
        }

        return false;
    }

    private async showBMIAlert(header: string, message: string, mode: AlertMode, keysToDisable: (keyof Preference)[]) {
        await this.alert(header, message, mode);
        keysToDisable.forEach((key) => this.preference.set(key, false));
    }

    private checkLastWeight(lastWeight?: Weight): void {
        if (!lastWeight) return;

        const prev = this.history[this.history.length - 1];
        const isRecent = this.timeService.weekDifference(lastWeight.date, this.timeService.now()) < 1;
        const isDuplicateToday =
            prev && this.timeService.isSameDay(lastWeight.date, prev.date) && lastWeight.id !== prev.id;

        if (!isRecent && this.weightTracker.isLastEvent(WeightTrackerEvent.NONE)) {
            setTimeout(
                () =>
                    this.alert(
                        this.translateService.instant('ALERTS.WEIGHT_NOT_REGISTERED.TITLE'),
                        this.translateService.instant('ALERTS.WEIGHT_NOT_REGISTERED.MESSAGE')
                    ),
                1500
            );
        } else if (isDuplicateToday && this.weightTracker.isLastEvent(WeightTrackerEvent.ADD)) {
            this.alert(
                this.translateService.instant('ALERTS.WEIGHT_REGISTERED.TITLE'),
                this.translateService.instant('ALERTS.WEIGHT_REGISTERED.MESSAGE')
            );
        }

        this.history.push(lastWeight);
    }

    private checkGoal(monthsPaceLoss: number, weeksPaceLoss: number): void {
        if (
            (monthsPaceLoss > 4 || weeksPaceLoss > 1) &&
            this.userConfig.eventTriggered === UserConfigEvent.CHANGED
        ) {
            this.alert(
                this.translateService.instant('ALERTS.GOAL_PROBLEM.TITLE'),
                this.translateService.instant('ALERTS.GOAL_PROBLEM.MESSAGE')
            );
        }
    }

    private async alert(header: string, message: string, alertMode: AlertMode = AlertMode.INFO): Promise<void> {
        const alertModal = await this.alertCtrl.create({
            header,
            message,
            cssClass: `small-alert alert-${alertMode}`,
            buttons: [{ text: this.translateService.instant('KEY_WORDS.OK'), role: 'cancel' }],
        });
        await alertModal.present();
    }
}
