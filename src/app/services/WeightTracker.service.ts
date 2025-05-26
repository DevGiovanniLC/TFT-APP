import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight.type';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Enum que representa los eventos disparados tras operaciones en registros de peso.
 */
enum EventTrigger {
    /** No se ha disparado ningún evento */
    NONE,
    /** Se ha añadido un nuevo registro de peso */
    ADD,
    /** Se ha eliminado un registro de peso */
    DELETE,
    /** Se ha actualizado un registro de peso */
    UPDATE,
}

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
    /** Acceso al enum de eventos dentro de la instancia */
    readonly EventTrigger = EventTrigger;

    /** Evento disparado tras la última operación */
    eventTriggered = EventTrigger.NONE;

    /** Subject interno que mantiene el array de registros de peso */
    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);

    /** Observable público con el array de todos los registros, ordenado descendentemente */
    readonly weights$: Observable<Weight[]> = this.weightsSubject.asObservable();

    /** Observable que emite el registro más antiguo (al final del array) */
    readonly firstWeight$: Observable<Weight | undefined> = this.weights$.pipe(
        map(weights => weights.at(-1))
    );

    /** Observable que emite el registro más reciente (al inicio del array) */
    readonly lastWeight$: Observable<Weight | undefined> = this.weights$.pipe(
        map(weights => weights[0])
    );

    /**
     * Constructor del servicio.
     * @param dataProvider Servicio que accede al almacenamiento persistente de datos.
     */
    constructor(private readonly dataProvider: DataProviderService) { }

    /**
     * Refresca el array de registros de peso desde el proveedor de datos.
     * @private
     */
    private refreshWeights(): void {
        this.dataProvider.getWeights().then(weights => {
            this.weightsSubject.next(weights);
        });
    }

    /**
     * Inicia la carga de registros de peso y devuelve el Observable para suscripción.
     * @returns Observable que emite el array de registros de peso.
     * @example
     * ```ts
     * this.weightTracker.getWeights().subscribe(weights => console.log(weights));
     * ```
     */
    getWeights(): Observable<Weight[]> {
        this.refreshWeights();
        return this.weights$;
    }

    /**
     * Añade un nuevo registro de peso y refresca el listado.
     * Dispara el evento ADD.
     * @param weight Objeto Weight a añadir.
     */
    addWeight(weight: Weight): void {
        this.eventTriggered = EventTrigger.ADD;
        this.dataProvider.addWeight(weight);
        this.refreshWeights();
    }

    /**
     * Elimina un registro de peso por su identificador y refresca el listado.
     * Dispara el evento DELETE.
     * @param id Identificador del registro a eliminar.
     */
    deleteWeight(id: number): void {
        this.eventTriggered = EventTrigger.DELETE;
        this.dataProvider.deleteWeight(id);
        this.refreshWeights();
    }

    /**
     * Actualiza un registro de peso existente y refresca el listado.
     * Dispara el evento UPDATE.
     * @param weight Objeto Weight con datos actualizados.
     */
    updateWeight(weight: Weight): void {
        this.eventTriggered = EventTrigger.UPDATE;
        this.dataProvider.updateWeight(weight);
        this.refreshWeights();
    }

    /**
     * Comprueba si el último evento disparado coincide con el proporcionado.
     * @param event Evento a verificar (ADD, DELETE, UPDATE, NONE).
     * @returns true si coincide, false en caso contrario.
     */
    isLastEvent(event: EventTrigger): boolean {
        return this.eventTriggered === event;
    }
}
