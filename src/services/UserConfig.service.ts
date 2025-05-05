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

    updateUser() {
        return from(this.dataProvider.getUser()).pipe(
            tap((user) => {
                if (user) {
                    this.userSubject.next(user);
                } else this.userSubject.next(undefined);
            })
        );
    }

    updateGoal(): Observable<Goal> {
        return from(this.dataProvider.getGoal()).pipe(
            map((goal) => ({
                ...goal,
                date: goal.date ? new Date(goal.date) : undefined,
            })),
            tap((goal) => this.goalSubject.next(goal))
        );
    }

    setUser(user: User) {
        this.dataProvider.setUser(user);
        this.userSubject.next(user);

        if (user.goal_weight === undefined || user.goal_units === undefined) {
            this.goalSubject.next(undefined);
            return
        }

        const goal: Goal = {
            weight: user?.goal_weight,
            weight_units: user?.goal_units,
            date: user?.goal_date,
        };

        this.goalSubject.next(goal);
    }
}
