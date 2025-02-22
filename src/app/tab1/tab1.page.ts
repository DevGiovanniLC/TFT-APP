import { AfterViewInit, ChangeDetectorRef, Component, effect, signal, WritableSignal } from '@angular/core';
import { IonItem, IonLabel,IonButton } from '@ionic/angular/standalone';
import Weight from 'src/models/Weight';
import { WeightTrackerService } from 'src/services/WeightTracker.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonButton],
})
export class Tab1Page implements AfterViewInit {

  weights: WritableSignal<Weight[]> = signal<Weight[]>([]);

  constructor(private weightTrackerService: WeightTrackerService, private cdr: ChangeDetectorRef) {
    effect(() => {
      if (this.weightTrackerService.isAvailable()) {
        this.getWeights();
        this.cdr.detectChanges();
      }
    })
  }

  ngAfterViewInit(): void {

  }

  async getWeights() {
    this.weights.set(await this.weightTrackerService.getWeights());
  }


}
