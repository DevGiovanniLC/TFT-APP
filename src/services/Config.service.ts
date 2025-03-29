import { Injectable, signal } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    isUser;


    constructor(private dataProvider: DataProviderService) {
        this.isUser =  signal(false)
    }

    getUser() {
        return this.dataProvider.getUser();
    }

    setUser(user: any) {
        this.dataProvider.setUser(user);
        this.isUser.update( (value) => !value);
    }

    subscribe() {
        return this.isUser
    }



}
