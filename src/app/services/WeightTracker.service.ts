import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight.type';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WeightTrackerEvent } from '@models/enums/Events';




@Injectable({
    providedIn: 'root',
})
/**
 * Servicio para gestionar el historial de pesos del usuario.
 * - Provee streams reactivos de la lista completa de pesos,
 *   así como del primer y último registro.
 * - Permite realizar operaciones CRUD sobre registros de peso,
 *   disparando eventos correspondientes.
 *
 * @export
 * @class WeightTrackerService
 */
export class WeightTrackerService {
    /** Evento disparado tras la última operación */
    eventTriggered = WeightTrackerEvent.NONE;

    /** Subject interno que mantiene el array de registros de peso */
    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);

    /** Observable público con el array de todos los registros, ordenado descendentemente */
    readonly weights$: Observable<Weight[]> = this.weightsSubject.asObservable();

    /** Observable que emite el registro más antiguo (al final del array) */
    readonly firstWeight$: Observable<Weight | undefined> = this.weights$.pipe(map((weights) => weights.length > 0 ? weights[weights.length - 1] : undefined));

    /** Observable que emite el registro más reciente (al inicio del array) */
    readonly lastWeight$: Observable<Weight | undefined> = this.weights$.pipe(map((weights) => weights[0]));

    constructor(private readonly dataProvider: DataProviderService) {}

    private refreshWeights(): void {
        this.dataProvider.getWeights().then((weights) => {
            this.weightsSubject.next(weights);
        });
    }

    getWeights(): Observable<Weight[]> {
        this.refreshWeights();
        return this.weights$;
    }

    addWeight(weight: Weight): void {
        this.eventTriggered = WeightTrackerEvent.ADD;
        this.dataProvider.addWeight(weight);
        this.refreshWeights();
    }

    deleteWeight(id: number): void {
        this.eventTriggered = WeightTrackerEvent.DELETE;
        this.dataProvider.deleteWeight(id);
        this.refreshWeights();
    }

    updateWeight(weight: Weight): void {
        this.eventTriggered = WeightTrackerEvent.UPDATE;
        this.dataProvider.updateWeight(weight);
        this.refreshWeights();
    }

    isLastEvent(event: WeightTrackerEvent): boolean {
        return this.eventTriggered === event;
    }
}
