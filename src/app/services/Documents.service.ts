import { Injectable } from '@angular/core';
import { User } from '@models/types/User';
import { Weight } from '@models/types/Weight';
import Papa from 'papaparse';
import { DataProviderService } from './data-providers/DataProvider.service';

@Injectable({
    providedIn: 'root'
})
export class DocumentsService {

    constructor(
        private readonly dataProvider: DataProviderService) { }

    async exportDataCSV(): Promise<void> {
        const [user, weights] = await Promise.all([
            this.dataProvider.getUser(),
            this.dataProvider.getWeights()
        ]);
        if (!user || !weights) return;
        const csv = await this.parseDataToCSV(user, weights);
        this.dataProvider.exportDataCSV(csv);
    }

    private async parseDataToCSV(user: User, weights: Weight[]): Promise<string> {
        const userCSV = Papa.unparse([{
            Name: user.name,
            Age: user.age,
            Height: user.height,
            Gender: user.gender,
            GoalDate: user.goal_date?.toISOString().slice(0, 10),
            GoalWeight: user.goal_weight,
            GoalUnits: user.goal_units
        }]);

        const weightsCSV = Papa.unparse(weights.map(w => ({
            Date: w.date.toISOString().slice(0, 10),
            Weight: w.weight,
            Units: w.weight_units
        })));

        return [
            '# User Data',
            userCSV,
            '',
            '# Weights Data',
            weightsCSV
        ].join('\n');
    }
}
