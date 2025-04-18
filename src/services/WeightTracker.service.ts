import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);
    private readonly lastWeightSubject = new BehaviorSubject<Weight | null>(null);
    readonly weights$: Observable<Weight[]> = this.weightsSubject.asObservable();
    readonly lastWeight$: Observable<Weight | null> = this.lastWeightSubject.asObservable();

    constructor(private readonly dataProvider: DataProviderService) { }

    updateWeights(): Observable<Weight[]> {
        return from(this.dataProvider.getWeights()).pipe(
            map(weights =>
                weights
                    .map(w => ({ ...w, date: new Date(w.date) }))
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
            ),
            tap(parsed => this.weightsSubject.next(parsed))
        );
    }

    updateLastWeight(): Observable<Weight | null> {
        return this.weights$.pipe(
            map(weights => { return weights.length > 0 ? weights[weights.length - 1] : null }),
            tap(parsed => this.lastWeightSubject.next(parsed))
        );
    }


    addWeight(value: Weight): boolean{
        this.dataProvider.addWeight(value)
        this.updateWeights()
        return true;
    }

    deleteWeight(value: number): boolean{
        this.dataProvider.deleteWeight(value);
        this.updateWeights();
        return true;
    }

    updateWeight(value: Weight): boolean {
        this.dataProvider.updateWeight(value);
        this.updateWeights();
        return true;
    }

    generateWeightId(): number {
        return this.dataProvider.generateWeightId();
    }

    isAvailable(): boolean {
        return this.dataProvider.isConnected();
    }
}
