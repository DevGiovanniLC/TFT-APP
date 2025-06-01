import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class DeviceInfoService {
    private readonly AVAILABLE_LANGUAGES = ['en', 'es'];
    private readonly DEFAULT_LANGUAGE = 'en';

    private language: string;

    constructor(
        private readonly translate: TranslateService
    ) {
        this.language = this.AVAILABLE_LANGUAGES.includes(this.translate.currentLang) ? this.translate.currentLang : this.DEFAULT_LANGUAGE;
    }

    async init(): Promise<void> {
        const languageCode = await Device.getLanguageCode()
        this.language = this.AVAILABLE_LANGUAGES.includes(languageCode.value) ? languageCode.value : this.DEFAULT_LANGUAGE;
        this.translate.setDefaultLang(this.language);

        this.translate.use(this.language);
    }

}
