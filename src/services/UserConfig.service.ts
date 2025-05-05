import { Injectable } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';
import { User } from '@models/types/User';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';
import { Weight } from '@models/types/Weight';
import { Goal } from '@models/types/Goal';

@Injectable({
    providedIn: 'root',
})
export class UserConfigService {
    private readonly userSubject = new BehaviorSubject<User | undefined>(undefined);
    private readonly goalSubject = new BehaviorSubject<Weight | null>(null);

    readonly user$ = this.userSubject.asObservable();
    readonly goal$ = this.goalSubject.asObservable();

    constructor(private readonly dataProvider: DataProviderService) { }

    updateUser() {
        return from(this.dataProvider.getUser()).pipe(
            tap((user) => {
                if (user) {
                    this.userSubject.next(user);
                } else this.userSubject.next(undefined);
            })
        );
    }

    getGoal(): Observable<Goal> {
        return from(this.dataProvider.getGoal()).pipe(
            map((goal) => ({
                ...goal,
                date: goal.date ? new Date(goal.date) : undefined,
            }))
        );
    }

    setUser(user: User) {
        this.dataProvider.setUser(user);
    }
}
