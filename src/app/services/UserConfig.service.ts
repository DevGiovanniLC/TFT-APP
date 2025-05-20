import { Injectable } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';
import { User } from '@models/types/User.type';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Goal } from '@models/types/Goal.type';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserConfigService {
    private userSubject = new BehaviorSubject<User | undefined>(undefined);
    private goalSubject = new BehaviorSubject<Goal | undefined>(undefined);

    readonly user$ = this.userSubject.asObservable();
    readonly goal$ = this.goalSubject.asObservable();

    constructor(private dataProvider: DataProviderService) { }

    getUser(): Observable<User | undefined> {
        return from(this.dataProvider.getUser()).pipe(
            tap(user => this.userSubject.next(user ?? undefined))
        );
    }

    getGoal(): Observable<Goal | undefined> {
        return from(this.dataProvider.getGoal()).pipe(
            map(goal => goal ? { ...goal, date: goal.date ? new Date(goal.date) : undefined } : undefined),
            tap(goal => this.goalSubject.next(goal))
        );
    }

    setUser(user: User): void {
        this.dataProvider.setUser(user);
        this.getUser().subscribe();
        this.getGoal().subscribe();
    }
}
