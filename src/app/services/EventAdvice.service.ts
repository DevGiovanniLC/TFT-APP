import { computed, effect, Injectable } from '@angular/core';
import { UserConfigService } from './UserConfig.service';
import { WeightTrackerService } from './WeightTracker.service';
import { WeightAnalysisService } from './WeightAnalysis.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Weight } from '@models/types/Weight.type';
import { AlertController } from '@ionic/angular/standalone';
import { BMIService } from './BMI.service';
import { TimeService } from './Time.service';



@Injectable({
    providedIn: 'root'
})
export class EventAdviceService {

    private readonly goal = toSignal(this.userConfig.goal$);
    private readonly lastWeight = toSignal(this.weightTracker.lastWeight$);
    private readonly bmi = toSignal(this.bmiService.bmi$);

    private readonly monthsPaceLoss = computed(() => {
        const lastWeight = this.lastWeight();
        const goal = this.goal();
        if (!goal || !lastWeight || !lastWeight.weight || !goal.weight || !goal.date) return NaN;

        return this.weightAnalysis.monthWeightLossPace(lastWeight?.weight, goal.weight, lastWeight?.date, goal.date);
    })

    private readonly weeksPaceLoss = computed(() => {
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
    ) {
        effect(() => this.checking())
    }

    private checking(): void {
        const lastWeight = this.lastWeight();
        const goal = this.goal()
        const bmi = this.bmi();

        if (lastWeight) {
            this.checkLastWeight(lastWeight);
            this.history.lastWeight.push(lastWeight);
        }

        if (bmi && this.weightTracker.eventTriggered === this.weightTracker.EventTrigger.ADD) {
            this.checkBMI(bmi);
        }
    }

    private checkBMI(bmi: number) {
        if (bmi < 16) {
            this.alert("Very Low BMI!⚠️",
                "Your BMI is significantly below the healthy range. This could affect your well-being. Please consider talking to a healthcare provider to get the support you deserve.",
                AlertMode.DANGER
            );
        } else if (bmi < 18.5) {
            this.alert("Low BMI!⚠️",
                "Your current BMI suggests you might be underweight. A health check-up could help ensure you're feeling your best.",
                AlertMode.WARNING
            );
        } else if (bmi >= 40) {
            this.alert("Very High BMI!⚠️",
                "Your BMI is currently over 40. This is considered a high-risk range. We recommend consulting a healthcare professional to explore options and support your well-being.",
                AlertMode.DANGER
            );
        } else if (bmi >= 35) {
            this.alert("High BMI!⚠️",
                "Your BMI suggests an elevated health risk. Making gradual, healthy changes and getting guidance can make a big difference.",
                AlertMode.WARNING
            );
        }
    }

    private checkLastWeight(lastWeight: Weight): void {
        const isLastWeekRegister = this.timeService.weekDifference(lastWeight.date, this.timeService.now()) < 1
        const isTwiceRegistersToday = this.history.lastWeight.length >= 1 && this.timeService.isSameDay(lastWeight.date, this.history.lastWeight[this.history.lastWeight.length - 1].date);

        if (!isLastWeekRegister && this.weightTracker.eventTriggered === this.weightTracker.EventTrigger.NONE) {
            this.alert("Keep Your Progress Going!🕐",
                "Try to register your weight every week, it will help you to keep your progress going!"
            );
        } else if (isTwiceRegistersToday && this.weightTracker.eventTriggered === this.weightTracker.EventTrigger.ADD) {
            this.alert("A Friendly Reminder",
                "You’ve registered your weight multiple times today. For accurate tracking and less stress, try weighing yourself just once daily or a few times per week."
            );
        }
    }

    private checkGoal(): void {

    }

    private async alert(header: string, message: string, alertMode?: AlertMode): Promise<void> {
        const alertModal = await this.alertCtrl.create({
            header: header,
            message: message,
            cssClass: `small-alert alert-${alertMode}`,
            buttons: [
                {
                    text: 'OK',
                    role: 'cancel',
                }
            ],
        });

        await alertModal.present();
    }
}

enum AlertMode {
    WARNING = "warning",
    DANGER = "danger",
}

