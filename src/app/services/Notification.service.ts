import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(
        private readonly toastController: ToastController,
        private platform: Platform
    ) { }

    async showToast(message: string) {
        await this.platform.ready();
        const toast = await this.toastController.create({
            message: `📁 ${message}`,
            duration: 4000,
            position: 'top',
            color: 'primary',
            cssClass: 'custom-toast'
        });

        toast.present();
    }

    async showPushNotificationExportation() {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: '✅ CSV file saved',
                    body: 'CSV file saved to documents folder',
                    id: 1,
                    sound: 'default',
                    smallIcon: 'ic_stat_notify',
                    actionTypeId: '',

                }
            ]
        });
    }

    async requestPermission(): Promise<boolean> {
        const { display } = await LocalNotifications.requestPermissions();
        if (display !== 'granted') return false;
        return true;
    }
}
