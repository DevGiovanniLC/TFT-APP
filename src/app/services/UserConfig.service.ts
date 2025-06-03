import { Injectable } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';
import { User } from '@models/types/User.type';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Goal } from '@models/types/Goal.type';
import { map, tap } from 'rxjs/operators';

/**
 * Enum que representa los posibles desencadenantes de eventos
 * cuando la configuración del usuario cambia.
 */
enum EventTrigger {
    /** No se ha disparado ningún evento */
    NONE,
    /** La configuración ha sido actualizada */
    CHANGED
}

@Injectable({ providedIn: 'root' })
/**
 * Servicio para gestionar la configuración y eventos del usuario.
 * - Provee streams reactivos de usuario y objetivo (goal).
 * - Permite obtener y persistir datos mediante DataProviderService.
 * - Emite un flag de evento cuando el usuario se actualiza.
 *
 * @export
 * @class UserConfigService
 */
export class UserConfigService {
    /** Acceso al enum dentro de la instancia */
    readonly EventTrigger = EventTrigger;

    /** Estado del último evento (NONE | CHANGED) */
    eventTriggered = EventTrigger.NONE;

    /** BehaviorSubject interno del usuario */
    private readonly userSubject = new BehaviorSubject<User | undefined>(undefined);
    /** BehaviorSubject interno del objetivo */
    private readonly goalSubject = new BehaviorSubject<Goal | undefined>(undefined);

    /** Observable público que emite el usuario actual */
    readonly user$ = this.userSubject.asObservable();
    /** Observable público que emite el objetivo actual */
    readonly goal$ = this.goalSubject.asObservable();

    constructor(private readonly dataProvider: DataProviderService) { }

    getUser(): Observable<User | undefined> {
        return from(this.dataProvider.getUser()).pipe(
            tap(user => this.userSubject.next(user ?? undefined))
        );
    }

    getGoal(): Observable<Goal | undefined> {
        return from(this.dataProvider.getGoal()).pipe(
            map(goal =>
                goal
                    ? { ...goal, date: goal.date ? new Date(goal.date) : undefined }
                    : undefined
            ),
            tap(parsedGoal => this.goalSubject.next(parsedGoal))
        );
    }

    setUser(user: User): void {
        this.eventTriggered = EventTrigger.CHANGED;
        this.dataProvider.setUser(user);
        // Recarga valores
        this.getUser().subscribe();
        this.getGoal().subscribe();
    }
}
