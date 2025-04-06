import { Injectable, signal } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';
import { User } from '@models/types/User';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    isUser;

    constructor(private readonly dataProvider: DataProviderService) {
        this.isUser = signal(false);
    }

    getUser() {
        return this.dataProvider.getUser();
    }

    setUser(user: User) {
        this.dataProvider.setUser(user);
        this.isUser.update((value) => !value);
    }

    subscribe() {
        return this.isUser;
    }
}
