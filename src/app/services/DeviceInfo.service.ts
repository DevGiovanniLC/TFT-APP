import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';
import conf from '../conf';

@Injectable({
    providedIn: 'root',
})
export class DeviceInfoService {
    private language: string;

    constructor(private readonly translate: TranslateService) {
        this.language = conf.AVAILABLE_LANGUAGES.includes(this.translate.currentLang)
            ? this.translate.currentLang
            : conf.DEFAULT_LANGUAGE;
    }

    async init(): Promise<void> {
        const languageCode = await Device.getLanguageCode();
        this.language = conf.AVAILABLE_LANGUAGES.includes(languageCode.value)
            ? languageCode.value
            : conf.DEFAULT_LANGUAGE;
        this.translate.setDefaultLang(this.language);

        this.translate.use(this.language);
    }

    getLanguage(): string {
        return this.language;
    }
}
