import { Injectable } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';
import { User } from '@models/types/User';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';
import { Goal } from '@models/types/Goal';

@Injectable({
    providedIn: 'root',
})
export class UserConfigService {
    private readonly userSubject = new BehaviorSubject<User | undefined>(undefined);
    private readonly goalSubject = new BehaviorSubject<Goal | undefined>(undefined);

    readonly user$ = this.userSubject.asObservable();
    readonly goal$ = this.goalSubject.asObservable();

    constructor(private readonly dataProvider: DataProviderService) {}

    getUser() {
        return from(this.dataProvider.getUser()).pipe(
            tap((user) => {
                if (user) {
                    this.userSubject.next(user);
                } else this.userSubject.next(undefined);
            })
        );
    }

    getGoal(): Observable<Goal | undefined> {
        return from(this.dataProvider.getGoal()).pipe(
            map((goal) => {
                if (!goal) return undefined;
                return {
                    ...goal,
                    date: goal.date ? new Date(goal.date) : undefined,
                } as Goal;
            }),
            tap((goal) => this.goalSubject.next(goal ?? undefined))
        );
    }

    setUser(user: User) {
        this.dataProvider.setUser(user);
        this.getUser().subscribe();
        this.getGoal().subscribe();
    }
}
