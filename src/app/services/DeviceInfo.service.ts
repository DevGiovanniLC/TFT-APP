import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class DeviceInfoService {
    private readonly AVAILABLE_LANGUAGES = ['en', 'es'];
    private readonly DEFAULT_LANGUAGE = 'en';

    private language!: string;

    constructor(
        private readonly translate: TranslateService
    ) {
        this.init();
    }

    private init() {
        Device.getLanguageCode().then(languageCode => {
            this.language = this.AVAILABLE_LANGUAGES.includes(languageCode.value) ? languageCode.value : this.DEFAULT_LANGUAGE;
            this.translate.setDefaultLang(this.language);
        }).catch(() => {
            const languageCode = this.translate.getBrowserLang() ?? this.DEFAULT_LANGUAGE;
            this.language = this.AVAILABLE_LANGUAGES.includes(languageCode) ? languageCode : this.DEFAULT_LANGUAGE;
        });
    }

    getLanguage(): string {
        return this.language
    }



}
