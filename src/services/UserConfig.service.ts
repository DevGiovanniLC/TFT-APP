import { Injectable } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';
import { User } from '@models/types/User';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';
import { Weight } from '@models/types/Weight';

@Injectable({
    providedIn: 'root',
})
export class UserConfigService {
    private readonly userSubject = new BehaviorSubject<User | null>(null);
    private readonly goalSubject = new BehaviorSubject<Weight | null>(null);

    readonly user$ = this.userSubject.asObservable();
    readonly goal$ = this.goalSubject.asObservable();

    constructor(private readonly dataProvider: DataProviderService) { }

    updateUser() {
        return from(this.dataProvider.getUser()).pipe(
            tap((user) => {
                if (user) {
                    this.userSubject.next(user);
                } else this.userSubject.next(null);
            })
        );
    }

    getGoal(): Observable<Weight | null> {
        return from(this.dataProvider.getGoal()).pipe(
            map((goal) => (goal ? { ...goal, date: new Date(goal.date) } : null))
        );
    }

    getHeight(): Observable<number | null | undefined> {
        return this.user$.pipe(
            map((user) => {
                if (!user) return null;

                return user.height;
            })
        );
    }

    setUser(user: User) {
        this.dataProvider.setUser(user);
    }
}
