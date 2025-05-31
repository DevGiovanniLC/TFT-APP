import { Injectable } from '@angular/core';
import { Device, DeviceInfo, GetLanguageCodeResult } from '@capacitor/device';

@Injectable({
    providedIn: 'root'
})
export class DeviceInfoService {
    private deviceInfo: DeviceInfo | null;
    private language: string;
    constructor() {
        this.deviceInfo = null;
        this.language = 'en';
        this.init();
    }

    private init() {
        Device.getLanguageCode().then(languageCode => {
            this.language = languageCode.value;
        });

        Device.getInfo().then(info => {
            this.deviceInfo = info;
        });

    }

    getLanguage(): string {
        return this.language
    }



}
