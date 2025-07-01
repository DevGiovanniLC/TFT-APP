import { Injectable } from '@angular/core';
import { User } from '@models/types/User.type';
import { Weight } from '@models/types/Weight.type';
import Papa from 'papaparse';
import { DataProviderService } from './data-providers/DataProvider.service';
import { TranslateService } from '@ngx-translate/core';
import { WeightTrackerService } from './WeightTracker.service';

@Injectable({ providedIn: 'root' })
/**
 * Servicio que maneja la exportación de datos del usuario y pesos a CSV,
 * así como la creación y compartición de imágenes de logros.
 * @export
 * @class DocumentsService
 */
export class DocumentsService {

    constructor(
        private readonly dataProvider: DataProviderService,
        private readonly translateService: TranslateService,
        private readonly weightTracker: WeightTrackerService,
    ) { }

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



    private async createGoalReachedImage(): Promise<Blob> {

        const lostWeight = this.weightTracker.getLostWeight();

        const initialWeight = this.weightTracker.getInitialWeight();

        const currentWeight = this.weightTracker.getCurrentWeight();

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d')!;

        // 🌱 Fondo degradado de verde oscuro a verde claro
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#35a667');
        gradient.addColorStop(1, '#b9ffb9');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 📸 Imagen personalizada sobre el trofeo
        const img = new Image();
        img.src = 'assets/icons/app/icon-app.png';

        const imgWidth = 250;
        const imgHeight = 250;

        await new Promise<void>((resolve) => {
            img.onload = () => {
                // Dibuja la imagen centrada
                ctx.drawImage(img, (canvas.width - imgWidth) / 2, 50, imgWidth, imgHeight);
                resolve();
            };
            img.onerror = () => resolve(); // Fallback si falla
        });

        // APP Name
        ctx.font = 'bold 64px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Vita Weight', canvas.width / 2, imgHeight + 75);

        // Title
        ctx.font = 'bold 48px sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(this.translateService.instant('ALERTS.GOAL_REACHED.SHARED_IMAGE.TITLE'), canvas.width / 2, 420);

        // Weight loss message
        ctx.font = 'bold 40px sans-serif';
        ctx.fillStyle = '#333';
        ctx.fillText(`${this.translateService.instant('ALERTS.GOAL_REACHED.SHARED_IMAGE.MESSAGE')} ${lostWeight} kg`, canvas.width / 2, 510);

        // Initial weight message
        ctx.font = '34px sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.translateService.instant('TAB1.STARTING_WEIGHT')}: ${initialWeight} kg`, 50, 650);

        // Final weight message
        ctx.font = '34px sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.translateService.instant('TAB1.CURRENT_WEIGHT')}: ${currentWeight} kg`, canvas.width - 30, 650);

        // Emoji
        ctx.font = '72px serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('🏆', canvas.width / 2, 650);

        // Exportar como PNG
        return await new Promise<Blob>((resolve) =>
            canvas.toBlob(blob => resolve(blob!), 'image/png', 1),
        );
    }




    async shareImage(title: string, text: string): Promise<void> {
        const image = new Blob([await this.createGoalReachedImage()], { type: 'image/png' });
        return this.dataProvider.shareImage(image, title, text);
    }
}
