import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);
    readonly weights$: Observable<Weight[]> = this.weightsSubject.asObservable();

    constructor(private readonly dataProvider: DataProviderService) { }


    getWeights(): Observable<Weight[]> {
        return from(this.dataProvider.getWeights()).pipe(
            map(weights =>
                weights
                    .map(w => ({ ...w, date: new Date(w.date) }))
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
            ),
            tap(parsed => this.weightsSubject.next(parsed))
        );
    }


    getActualWeight(): Observable<Weight | null> {
        return this.weights$.pipe(
            map(weights => (weights.length > 0 ? weights[weights.length - 1] : null))
        );
    }


    getGoal(): Observable<Weight | null> {
        return from(this.dataProvider.getGoal()).pipe(
            map(goal => (goal ? { ...goal, date: new Date(goal.date) } : null))
        );
    }


    addWeight(value: Weight): boolean{
        this.getWeights()
        return this.dataProvider.addWeight(value)
    }


    isAvailable(): boolean {
        return this.dataProvider.isConnected();
    }
}
