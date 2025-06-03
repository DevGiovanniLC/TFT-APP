import { Injectable } from '@angular/core';
import { User } from '@models/types/User.type';
import { Weight } from '@models/types/Weight.type';
import Papa from 'papaparse';
import { DataProviderService } from './data-providers/DataProvider.service';

@Injectable({ providedIn: 'root' })
/**
 * Servicio para exportar datos de usuario y registros de peso a CSV.
 * @export
 * @class DocumentsService
 */
export class DocumentsService {
    constructor(private readonly dataProvider: DataProviderService) {}

    async exportAllDataToCSV(): Promise<void> {
        const [user, weights] = await Promise.all([this.dataProvider.getUser(), this.dataProvider.getWeights()]);
        if (!user || !weights?.length) return;

        const csv = this.buildCSV(user, weights);
        this.dataProvider.exportDataCSV(csv);
    }

    private buildCSV(user: User, weights: Weight[]): string {
        // Sección de datos de usuario
        const userCSV = Papa.unparse([
            {
                Name: user.name,
                Age: user.age,
                Height: user.height,
                Gender: user.gender,
                GoalDate: user.goal_date?.toISOString().slice(0, 10) ?? '',
                GoalWeight: user.goal_weight,
                GoalUnits: user.goal_units,
            },
        ]);

        // Sección de datos de peso
        const weightsCSV = Papa.unparse(
            weights.map((w) => ({
                Date: w.date.toISOString().slice(0, 10),
                Weight: w.weight,
                Units: w.weight_units,
            }))
        );

        // Combina ambas secciones con títulos
        return ['# User Data', userCSV, '', '# Weights Data', weightsCSV].join('\n');
    }
}
