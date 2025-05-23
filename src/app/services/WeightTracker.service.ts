import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight.type';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

enum EventTrigger {
    NONE,
    ADD,
    DELETE,
    UPDATE,
}

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {

    readonly EventTrigger = EventTrigger;
    eventTriggered = EventTrigger.NONE;

    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);

    readonly weights$ = this.weightsSubject.asObservable();
    readonly firstWeight$ = this.weights$.pipe(map(weights => weights.at(-1)));
    readonly lastWeight$ = this.weights$.pipe(map(weights => weights[0]));

    constructor(
        private readonly dataProvider: DataProviderService,
    ) { }

    private refreshWeights(): void {
        this.dataProvider.getWeights().then(weights => this.weightsSubject.next(weights));
    }

    getWeights(): Observable<Weight[]> {
        this.refreshWeights();
        return this.weights$;
    }

    addWeight(weight: Weight): void {
        this.eventTriggered = EventTrigger.ADD;
        this.dataProvider.addWeight(weight);
        this.refreshWeights();
    }

    deleteWeight(id: number): void {
        this.eventTriggered = EventTrigger.DELETE;
        this.dataProvider.deleteWeight(id);
        this.refreshWeights();
    }

    updateWeight(weight: Weight): void {
        this.eventTriggered = EventTrigger.UPDATE;
        this.dataProvider.updateWeight(weight);
        this.refreshWeights();
    }

    isLastEvent(event: EventTrigger): boolean {
        return this.eventTriggered === event;
    }
}
