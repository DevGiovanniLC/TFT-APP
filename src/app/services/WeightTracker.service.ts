import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CalculationFunctionsService } from './CalculationFunctions.service';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);

    readonly weights$ = this.weightsSubject.asObservable();
    readonly firstWeight$ = this.weights$.pipe(map(weights => weights.at(-1)));
    readonly lastWeight$ = this.weights$.pipe(map(weights => weights[0]));

    constructor(
        private readonly dataProvider: DataProviderService,
        private readonly calculationFunctions: CalculationFunctionsService,
    ) { }

    private refreshWeights(): void {
        this.dataProvider.getWeights().then(weights => this.weightsSubject.next(weights));
    }

    getWeights(): Observable<Weight[]> {
        this.refreshWeights();
        return this.weights$;
    }

    addWeight(weight: Weight): void {
        this.dataProvider.addWeight(weight);
        this.refreshWeights();
    }

    deleteWeight(id: number): void {
        this.dataProvider.deleteWeight(id);
        this.refreshWeights();
    }

    updateWeight(weight: Weight): void {
        this.dataProvider.updateWeight(weight);
        this.refreshWeights();
    }

    async exportDataCSV(): Promise<void> {
        const [user, weights] = await Promise.all([
            this.dataProvider.getUser(),
            this.dataProvider.getWeights()
        ]);
        if (!user || !weights) return;
        const csv = await this.calculationFunctions.parseDataToCSV(user, weights);
        this.dataProvider.exportDataCSV(csv);
    }
}
