import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { DataProvider } from 'src/interfaces/DataProvider';
import  DBConnection from 'src/services/DBConnection';
import JSONProvider from './JSONProvider';

@Injectable({
  providedIn: 'root'
})

export class DataProviderService {
  connectionStatus = signal(false);

  private dataProvider!: DataProvider;


  constructor() {

  }

  async initialize() {
    //this.dataProvider = new DBConnection();
    this.dataProvider = new JSONProvider();
    await this.dataProvider.initializeConnection();
    this.connectionStatus.set(true);
  }

  async getWeights(): Promise<any> {
    return await this.dataProvider.getWeights();
  }

  isConnected(): boolean {
    return this.connectionStatus();
  }



}
