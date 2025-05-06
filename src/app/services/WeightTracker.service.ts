import { Injectable } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { DataProviderService } from './data-providers/DataProvider.service';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';
import { NotificationService } from './Notification.service';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private readonly weightsSubject = new BehaviorSubject<Weight[]>([]);
    private readonly firstWeightSubject = new BehaviorSubject<Weight | undefined>(undefined);
    private readonly lastWeightSubject = new BehaviorSubject<Weight | undefined>(undefined);

    readonly weights$: Observable<Weight[]> = this.weightsSubject.asObservable();
    readonly firstWeight$: Observable<Weight | undefined> = this.firstWeightSubject.asObservable();
    readonly lastWeight$: Observable<Weight | undefined> = this.lastWeightSubject.asObservable();

    constructor(
        private readonly dataProvider: DataProviderService,
        private readonly notificationService: NotificationService
    ) { }

    updateWeights(): Observable<Weight[]> {
        return from(this.dataProvider.getWeights()).pipe(tap((weights) => this.weightsSubject.next(weights)));
    }

    updateLastWeight(): Observable<Weight> {
        return this.weights$.pipe(
            map((weights) => weights[0]),
            tap((parsed) => this.lastWeightSubject.next(parsed))
        );
    }

    updateFirstWeight(): Observable<Weight> {
        return this.weights$.pipe(
            map((weights) => {
                return weights[weights.length - 1];
            }),
            tap((parsed) => this.firstWeightSubject.next(parsed))
        );
    }

    addWeight(value: Weight): boolean {
        this.dataProvider.addWeight(value);
        this.updateWeights().subscribe();
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

    exportDataCSV() {
        this.dataProvider.exportDataCSV()
        try {
            this.notificationService.showPushNotificationExportation();
        } catch (err) {
            this.notificationService.requestPermission();
            console.error('❌:', err);
        }
        this.notificationService.showToast('CSV corretly exported to documents folder');
    }

}
