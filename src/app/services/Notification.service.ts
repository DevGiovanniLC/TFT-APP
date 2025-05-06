import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(
        private readonly toastController: ToastController
    ) { }

    async showToast(message: string) {
        const toast = await this.toastController.create({
            message: `📁 ${message}`,
            duration: 4000,
            position: 'top',
            color: 'primary',
            cssClass: 'custom-toast'
        });
        await toast.present();
    }
}
