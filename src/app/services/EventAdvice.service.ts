import { computed, effect, Injectable, signal } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { WeightAnalysisService } from './WeightAnalysis.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Weight } from '@models/types/Weight.type';
import { AlertController } from '@ionic/angular/standalone';
import { BMIService } from './BMI.service';
import { TimeService } from './Time.service';
import { PreferenceService, BMIPreferenceKey } from './Preference.service';
import { TranslateService } from '@ngx-translate/core';
import { UserConfigEvent, WeightTrackerEvent } from '@models/enums/Events';
import { AlertMode } from '@models/enums/AlertOverlay';
import { Goal } from '@models/types/Goal.type';



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

    private readonly alerted = signal(false);

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
            if (
                this.checkBMI(this.bmi()) ||
                this.checkGoal(this.lastWeight(), this.goal()) ||
                this.checkLastWeight(this.lastWeight()) ||
                true
            ) return this.resetEvents();
        })
    }

    private resetEvents(): void {

        if (this.userConfig.eventTriggered === UserConfigEvent.CHANGED) {
            this.preference.setGoal('GOAL_REACHED', true);
            this.preference.setGoal('GOAL_NOT_REACHED', true);
        }

        this.userConfig.eventTriggered = UserConfigEvent.NONE;
        this.weightTracker.eventTriggered = WeightTrackerEvent.NONE;
    }



    private checkBMI(bmi?: number | null): boolean {
        if (!bmi || !this.weightTracker.isLastEvent(WeightTrackerEvent.ADD)) return false;

        if (bmi < 16 && this.preference.getBMI('BMI_ALERT_16')) {
            this.showBMIAlert(
                this.translateService.instant('ALERTS.BMI_VERY_LOW.TITLE'),
                this.translateService.instant('ALERTS.BMI_VERY_LOW.MESSAGE'),
                AlertMode.DANGER,
                ['BMI_ALERT_16', 'BMI_ALERT_18_5']
            );
            return true;
        } else if (bmi < 18.5 && this.preference.getBMI('BMI_ALERT_18_5')) {
            this.showBMIAlert(
                this.translateService.instant('ALERTS.BMI_LOW.TITLE'),
                this.translateService.instant('ALERTS.BMI_LOW.MESSAGE'),
                AlertMode.WARNING,
                ['BMI_ALERT_18_5']
            );
            return true;
        } else if (bmi >= 40 && this.preference.getBMI('BMI_ALERT_40')) {
            this.showBMIAlert(
                this.translateService.instant('ALERTS.BMI_VERY_HIGH.TITLE'),
                this.translateService.instant('ALERTS.BMI_VERY_HIGH.MESSAGE'),
                AlertMode.DANGER,
                ['BMI_ALERT_40', 'BMI_ALERT_35']
            );
            return true;
        } else if (bmi >= 35 && this.preference.getBMI('BMI_ALERT_35')) {
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



    private checkLastWeight(lastWeight?: Weight): boolean {
        if (!lastWeight) return false;

        const prev = this.history[this.history.length - 1];

        return (
            this.checkLastWeightNotRegistered(lastWeight) ||
            this.checkLastWeightDuplicated(lastWeight, prev)
        )
    }

    private checkGoal(lastWeight?: Weight, goal?: Goal): boolean {
        return (
            this.checkGoalRecheable(this.monthsPaceLossGoal(), this.weeksPaceLossGoal()) ||
            this.checkGoalReached(lastWeight, goal) ||
            this.checkGoalNotReached(lastWeight, goal)
        );

    }


    // LAST WEIGHT CHECKS
    private checkLastWeightNotRegistered(lastWeight: Weight): boolean {
        if (
            this.alerted() ||
            !this.weightTracker.isLastEvent(WeightTrackerEvent.NONE) ||
            !this.preference.getWeight('WEIGHT_NOT_REGISTERED') ||
            this.timeService.weekDifference(lastWeight.date, this.timeService.now()) < 1
        ) return false;

        this.preference.setWeight('WEIGHT_NOT_REGISTERED', false);
        this.alerted.set(true);

        setTimeout(
            () =>
                this.alert(
                    this.translateService.instant('ALERTS.WEIGHT_NOT_REGISTERED.TITLE'),
                    this.translateService.instant('ALERTS.WEIGHT_NOT_REGISTERED.MESSAGE')
                ),
            1000
        )

        return true;
    }

    private checkLastWeightDuplicated(lastWeight: Weight, prev: Weight): boolean {
        if (
            !this.weightTracker.isLastEvent(WeightTrackerEvent.ADD) ||
            !this.preference.getWeight('WEIGHT_DUPLICATED') ||
            !this.timeService.isSameDay(lastWeight.date, prev.date) ||
            lastWeight.id === prev.id
        ) {
            this.history.push(lastWeight);
            return false;
        }

        this.preference.setWeight('WEIGHT_DUPLICATED', false);

        this.alert(
            this.translateService.instant('ALERTS.WEIGHT_REGISTERED.TITLE'),
            this.translateService.instant('ALERTS.WEIGHT_REGISTERED.MESSAGE')
        );

        return true;
    }


    // GOAL CHECKS
    private checkGoalRecheable(monthsPaceLoss: number, weeksPaceLoss: number): boolean {
        if (
            (monthsPaceLoss < 4 && weeksPaceLoss < 1) ||
            !(this.userConfig.eventTriggered === UserConfigEvent.CHANGED)
        ) return false;

        this.alert(
            this.translateService.instant('ALERTS.GOAL_PROBLEM.TITLE'),
            this.translateService.instant('ALERTS.GOAL_PROBLEM.MESSAGE')
        );
        return true
    }

    private checkGoalReached(lastWeight: Weight | undefined, goal: Goal | undefined): boolean {
        if (
            (!lastWeight || !goal || !goal.weight) ||
            !this.preference.getGoal('GOAL_REACHED') ||
            !this.weightTracker.isLastEvent(WeightTrackerEvent.ADD) ||
            lastWeight.weight > goal.weight
        ) return false;

        this.preference.setGoal('GOAL_REACHED', false);

        this.alert(
            this.translateService.instant('ALERTS.GOAL_REACHED.TITLE'),
            this.translateService.instant('ALERTS.GOAL_REACHED.MESSAGE')
        );

        return true;
    }

    private checkGoalNotReached(lastWeight: Weight | undefined, goal: Goal | undefined): boolean {
        if (
            (!lastWeight || !goal || !goal.date) ||
            !this.preference.getGoal('GOAL_NOT_REACHED') ||
            !this.weightTracker.isLastEvent(WeightTrackerEvent.ADD) ||
            goal.date.getTime() >= lastWeight.date.getTime()
        ) return false;

        this.preference.setGoal('GOAL_NOT_REACHED', false);

        this.alert(
            this.translateService.instant('ALERTS.GOAL_NOT_REACHED.TITLE'),
            this.translateService.instant('ALERTS.GOAL_NOT_REACHED.MESSAGE')
        );

        return true;
    }


    //ALERTS
    private async showBMIAlert(header: string, message: string, mode: AlertMode, keysToDisable: BMIPreferenceKey[]) {
        await this.alert(header, message, mode);
        keysToDisable.forEach((key) => this.preference.setBMI(key, false));
    }

    private async alert(header: string, message: string, alertMode: AlertMode = AlertMode.INFO): Promise<void> {
        const alertModal = await this.alertCtrl.create({
            header,
            message,
            cssClass: `small-alert alert-${alertMode}`,
            buttons: [{ text: this.translateService.instant('KEY_WORDS.OK'), role: 'cancel', handler: () => setTimeout(() => this.alerted.set(false), 2000) }],
        });
        await alertModal.present();
    }


    // PACE CALCULATIONS
    private calcPace(type: 'month' | 'week'): number {
        const lastWeight = this.lastWeight();
        const goal = this.goal();
        if (!goal?.weight || !goal.date || !lastWeight?.weight) return NaN;
        return type === 'month'
            ? this.weightAnalysis.monthWeightLossPace(lastWeight.weight, goal.weight, lastWeight.date, goal.date)
            : this.weightAnalysis.weekWeightLossPace(lastWeight.weight, goal.weight, lastWeight.date, goal.date);
    }
}
