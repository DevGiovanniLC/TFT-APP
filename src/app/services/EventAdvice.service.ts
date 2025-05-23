import { computed, effect, Injectable } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { WeightAnalysisService } from './WeightAnalysis.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Weight } from '@models/types/Weight.type';
import { AlertController } from '@ionic/angular/standalone';
import { BMIService } from './BMI.service';
import { TimeService } from './Time.service';
import { PreferenceService } from './Preference.service';



@Injectable({
    providedIn: 'root'
})
export class EventAdviceService {

    private readonly goal = toSignal(this.userConfig.goal$);
    private readonly lastWeight = toSignal(this.weightTracker.lastWeight$);
    private readonly bmi = toSignal(this.bmiService.bmi$);

    private readonly monthsPaceLossGoal = computed(() => {
        const lastWeight = this.lastWeight();
        const goal = this.goal();
        if (!goal || !lastWeight || !lastWeight.weight || !goal.weight || !goal.date) return NaN;

        return this.weightAnalysis.monthWeightLossPace(lastWeight?.weight, goal.weight, lastWeight?.date, goal.date);
    })

    private readonly weeksPaceLossGoal = computed(() => {
        const lastWeight = this.lastWeight();
        const goal = this.goal();
        if (!goal || !lastWeight || !lastWeight.weight || !goal.weight || !goal.date) return NaN;

        return this.weightAnalysis.weekWeightLossPace(lastWeight?.weight, goal.weight, lastWeight?.date, goal.date);
    })

    private readonly history = {
        lastWeight: [] as Weight[],
    }

    constructor(
        private readonly bmiService: BMIService,
        private readonly userConfig: UserConfigService,
        private readonly weightTracker: WeightTrackerService,
        private readonly weightAnalysis: WeightAnalysisService,
        private readonly alertCtrl: AlertController,
        private readonly timeService: TimeService,
        private readonly preference: PreferenceService,
    ) {
        effect(() => this.checkBMI(this.bmi()));
        effect(() => this.checkLastWeight(this.lastWeight()));
        effect(() => this.checkGoal(this.monthsPaceLossGoal(), this.weeksPaceLossGoal()));
    }

    private checkBMI(bmi: number | null | undefined): void {

        if (!bmi || this.weightTracker.isLastEvent(this.weightTracker.EventTrigger.ADD)) return;

        const prefs = {
            KEY_BMI_ALERT_40: this.preference.get('BMI_ALERT_40'),
            KEY_BMI_ALERT_35: this.preference.get('BMI_ALERT_35'),
            KEY_BMI_ALERT_18_5: this.preference.get('BMI_ALERT_18_5'),
            KEY_BMI_ALERT_16: this.preference.get('BMI_ALERT_16'),
        }

        if (bmi < 16 && prefs.KEY_BMI_ALERT_16) {
            this.alert("Very Low BMI!⚠️",
                "Your BMI is significantly below the healthy range. This could affect your well-being. Please consider talking to a healthcare provider to get the support you deserve.",
                AlertMode.DANGER
            );

            this.preference.set('BMI_ALERT_16', false);
            this.preference.set('BMI_ALERT_18_5', false);

        } else if (bmi < 18.5 && prefs.KEY_BMI_ALERT_18_5) {
            this.alert("Low BMI!⚠️",
                "Your current BMI suggests you might be underweight. A health check-up could help ensure you're feeling your best.",
                AlertMode.WARNING
            );

            this.preference.set('BMI_ALERT_18_5', false);

        } else if (bmi >= 40 && prefs.KEY_BMI_ALERT_40) {
            this.alert("Very High BMI!⚠️",
                "Your BMI is currently over 40. This is considered a high-risk range. We recommend consulting a healthcare professional to explore options and support your well-being.",
                AlertMode.DANGER
            );

            this.preference.set('BMI_ALERT_40', false);
            this.preference.set('BMI_ALERT_35', false);

        } else if (bmi >= 35 && prefs.KEY_BMI_ALERT_35) {
            alert(prefs.KEY_BMI_ALERT_35);
            this.alert("High BMI!⚠️",
                "Your BMI suggests an elevated health risk. Making gradual, healthy changes and getting guidance can make a big difference.",
                AlertMode.WARNING
            );

            this.preference.set('BMI_ALERT_35', false);

        }
    }

    private checkLastWeight(lastWeight: Weight | undefined): void {

        if (!lastWeight) return;

        const preLastWeight = this.history.lastWeight[this.history.lastWeight.length - 1];

        const isLastWeekRegister = this.timeService.weekDifference(lastWeight.date, this.timeService.now()) < 1
        const isTwiceRegistersToday = this.history.lastWeight.length >= 1 && this.timeService.isSameDay(lastWeight.date, preLastWeight?.date);

        if (!isLastWeekRegister && this.weightTracker.isLastEvent(this.weightTracker.EventTrigger.NONE)) {
            this.alert("Keep Your Progress Going!🕐",
                "Try to register your weight every week, it will help you to keep your progress going!"
            );
        } else if (isTwiceRegistersToday && this.weightTracker.isLastEvent(this.weightTracker.EventTrigger.ADD) && lastWeight.id !== preLastWeight?.id) {
            this.alert("A Friendly Reminder",
                "You’ve registered your weight multiple times today. For accurate tracking and less stress, try weighing yourself just once daily or a few times per week."
            );
        }

        this.history.lastWeight.push(lastWeight);
    }

    private checkGoal(monthsPaceLoss: number, weeksPaceLoss: number): void {
        if ((monthsPaceLoss > 4 || weeksPaceLoss > 1) && this.userConfig.eventTriggered === this.userConfig.EventTrigger.CHANGED) {
            this.alert("Set a Goal You Can Achieve",
                "Your current goal may be too ambitious for the time frame you’ve set."
            );
        }
    }

    private async alert(header: string, message: string, alertMode: AlertMode = AlertMode.INFO): Promise<void> {
        const alertModal = await this.alertCtrl.create({
            header: header,
            message: message,
            cssClass: `small-alert alert-${alertMode}`,
            buttons: [
                {
                    text: 'CONFIRM',
                    role: 'cancel',
                }
            ],
        });

        await alertModal.present();
    }
}

enum AlertMode {
    INFO = "info",
    WARNING = "warning",
    DANGER = "danger",
}

