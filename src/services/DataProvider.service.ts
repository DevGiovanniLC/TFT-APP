import { Injectable } from '@angular/core';
import { DBConnection } from 'src/models/DBConnection';
import { DataProvider } from 'src/interfaces/DataProvider';

@Injectable({
  providedIn: 'root'
})


export class DataProviderService {

  private db: DataProvider;


  constructor() {
    this.db = new DBConnection();
  }

  async initialize() {
    await this.db.initializeConnection();
  }

  async getWeights(): Promise<any> {
    return await this.db.getWeights();
  }


}
