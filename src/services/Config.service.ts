import { Injectable } from '@angular/core';
import { DataProviderService } from './data-providers/DataProvider.service';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor(private dataProvider: DataProviderService) {}

    getUser() {
        return this.dataProvider.getUser();
    }

    setUser(user: any) {
        return this.dataProvider.setUser(user);
    }

}
