import { Component } from '@angular/core';
import { IonItem, IonLabel } from '@ionic/angular/standalone';
import Weight from 'src/models/Weight';
import { WeightTrackerService } from 'src/services/WeightTracker.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonItem, IonLabel],
})
export class Tab1Page {

  weights: Weight[] = [];

  constructor(private weightTrackerService: WeightTrackerService) {
    this.getWeights();
  }

  async getWeights(){
    this.weights =await this.weightTrackerService.getWeights();
  }


}
