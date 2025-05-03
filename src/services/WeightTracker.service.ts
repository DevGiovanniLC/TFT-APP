import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);
    private readonly firstWeightSubject = new BehaviorSubject<Weight | null>(null);
    private readonly lastWeightSubject = new BehaviorSubject<Weight | null>(null);

    readonly weights$: Observable<Weight[]> = this.weightsSubject.asObservable();
    readonly firstWeight$: Observable<Weight | null> = this.firstWeightSubject.asObservable();
    readonly lastWeight$: Observable<Weight | null> = this.lastWeightSubject.asObservable();


    constructor(private readonly dataProvider: DataProviderService) { }

    updateWeights(): Observable<Weight[]> {
        return from(this.dataProvider.getWeights()).pipe(
            tap((weights) => {this.updateLastWeight(); this.updateFirstWeight();}),
            tap((weights) => this.weightsSubject.next(weights))
        );
    }

    updateLastWeight(): Observable<Weight | null> {
        return this.weights$.pipe(
            map((weights) => {
                return weights.length > 0 ? weights[0] : null;
            }),
            tap((parsed) => this.lastWeightSubject.next(parsed))
        );
    }

    updateFirstWeight(): Observable<Weight | null> {
        return this.weights$.pipe(
            map((weights) => {
                return weights.length > 0 ? weights[weights.length - 1] : null;
            }),
            tap((parsed) => this.firstWeightSubject.next(parsed))
        );
    }

    addWeight(value: Weight): boolean {
        this.dataProvider.addWeight(value);
        this.updateWeights();
        return true;
    }

    deleteWeight(value: number): boolean {
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
