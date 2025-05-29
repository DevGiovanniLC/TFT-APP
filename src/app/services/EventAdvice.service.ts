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

enum AlertMode {
    INFO = "info",
    WARNING = "warning",
    DANGER = "danger",
}

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

    /**
     * Crea una instancia de EventAdviceService e inicializa efectos
     * para reaccionar a cambios en BMI, peso y objetivos.
     * @param bmiService - Servicio para cálculo de BMI.
     * @param userConfig - Servicio para configuración y eventos del usuario.
     * @param weightTracker - Servicio para obtener registro de peso.
     * @param weightAnalysis - Servicio para análisis de ritmo de pérdida.
     * @param alertCtrl - Controlador de alertas de Ionic.
     * @param timeService - Servicio de utilidades de fecha/tiempo.
     * @param preference - Servicio para preferencias de alertas.
     */
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

    /**
     * Calcula el ritmo de pérdida de peso respecto al objetivo en semanas o meses.
     * @param type - 'week' o 'month' indicando unidad de tiempo.
     * @returns Ritmo de pérdida (kg/unidad) o NaN si faltan datos.
     */
    private calcPace(type: 'month' | 'week'): number {
        const lastWeight = this.lastWeight();
        const goal = this.goal();
        if (!goal?.weight || !goal.date || !lastWeight?.weight) return NaN;
        return type === 'month'
            ? this.weightAnalysis.monthWeightLossPace(
                lastWeight.weight,
                goal.weight,
                lastWeight.date,
                goal.date
            )
            : this.weightAnalysis.weekWeightLossPace(
                lastWeight.weight,
                goal.weight,
                lastWeight.date,
                goal.date
            );
    }

    /**
     * Verifica el BMI tras un nuevo registro de peso y muestra alertas según preferencias.
     * @param bmi - Valor numérico de BMI o null.
     */
    private checkBMI(bmi?: number | null): void {
        if (!bmi || !this.weightTracker.isLastEvent(this.weightTracker.EventTrigger.ADD)) return;

        const prefs = {
            'BMI_ALERT_40': this.preference.get('BMI_ALERT_40'),
            'BMI_ALERT_35': this.preference.get('BMI_ALERT_35'),
            'BMI_ALERT_18_5': this.preference.get('BMI_ALERT_18_5'),
            'BMI_ALERT_16': this.preference.get('BMI_ALERT_16'),
        } as Record<keyof Preference, boolean>;

        if (bmi < 16 && prefs.BMI_ALERT_16) {
            this.showBMIAlert(
                "Very Low BMI!⚠️",
                "Your BMI is significantly below the healthy range. Please consider consulting a healthcare provider.",
                AlertMode.DANGER,
                ['BMI_ALERT_16', 'BMI_ALERT_18_5']
            );
        } else if (bmi < 18.5 && prefs.BMI_ALERT_18_5) {
            this.showBMIAlert(
                "Low BMI!⚠️",
                "Your current BMI suggests you might be underweight. A health check-up could help.",
                AlertMode.WARNING,
                ['BMI_ALERT_18_5']
            );
        } else if (bmi >= 40 && prefs.BMI_ALERT_40) {
            this.showBMIAlert(
                "Very High BMI!⚠️",
                "Your BMI is over 40, a high-risk range. We recommend consulting a professional.",
                AlertMode.DANGER,
                ['BMI_ALERT_40', 'BMI_ALERT_35']
            );
        } else if (bmi >= 35 && prefs.BMI_ALERT_35) {
            this.showBMIAlert(
                "High BMI!⚠️",
                "Your BMI suggests elevated risk. Gradual healthy changes can make a big difference.",
                AlertMode.WARNING,
                ['BMI_ALERT_35']
            );
        }
    }

    /**
     * Muestra una alerta de BMI y desactiva preferencias especificadas.
     * @param header - Título de la alerta.
     * @param message - Mensaje descriptivo.
     * @param mode - Nivel de alerta (info, warning, danger).
     * @param keysToDisable - Claves de preferencias a desactivar.
     */
    private async showBMIAlert(
        header: string,
        message: string,
        mode: AlertMode,
        keysToDisable: (keyof Preference)[]
    ) {
        await this.alert(header, message, mode);
        keysToDisable.forEach(key => this.preference.set(key, false));
    }

    /**
     * Verifica frecuencia y duplicados de registros de peso, mostrando consejos.
     * @param lastWeight - Último registro de peso.
     */
    private checkLastWeight(lastWeight?: Weight): void {
        if (!lastWeight) return;

        const prev = this.history[this.history.length - 1];
        const isRecent = this.timeService.weekDifference(lastWeight.date, this.timeService.now()) < 1;
        const isDuplicateToday = prev &&
            this.timeService.isSameDay(lastWeight.date, prev.date) &&
            lastWeight.id !== prev.id;

        if (!isRecent && this.weightTracker.isLastEvent(this.weightTracker.EventTrigger.NONE)) {
            this.alert(
                "Keep Your Progress Going!🕐",
                "Try to register your weight every week to track progress."
            );
        } else if (isDuplicateToday && this.weightTracker.isLastEvent(this.weightTracker.EventTrigger.ADD)) {
            this.alert(
                "A Friendly Reminder😊",
                "You've registered weight multiple times today. once daily is sufficient."
            );
        }

        this.history.push(lastWeight);
    }

    /**
     * Comprueba si la meta es demasiado ambiciosa según el ritmo calculado.
     * @param monthsPaceLoss - Ritmo mensual.
     * @param weeksPaceLoss - Ritmo semanal.
     */
    private checkGoal(monthsPaceLoss: number, weeksPaceLoss: number): void {
        if ((monthsPaceLoss > 4 || weeksPaceLoss > 1) &&
            this.userConfig.eventTriggered === this.userConfig.EventTrigger.CHANGED) {

            this.alert(
                "Set a Goal You Can Achieve 🎯",
                "Your current goal may be too ambitious for the timeframe."
            );

            this.userConfig.eventTriggered = this.userConfig.EventTrigger.NONE;
        }
    }

    /**
     * Crea y presenta un modal de alerta con Ionic.
     * @param header - Título de la alerta.
     * @param message - Mensaje de cuerpo.
     * @param alertMode - Estilo de alerta (info, warning, danger).
     */
    private async alert(
        header: string,
        message: string,
        alertMode: AlertMode = AlertMode.INFO
    ): Promise<void> {
        const alertModal = await this.alertCtrl.create({
            header,
            message,
            cssClass: `small-alert alert-${alertMode}`,
            buttons: [{ text: 'CONFIRM', role: 'cancel' }],
        });
        await alertModal.present();
    }
}
