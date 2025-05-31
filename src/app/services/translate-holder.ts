// translate-holder.ts
import { TranslateService } from '@ngx-translate/core';

let translateService: TranslateService;

export function setTranslate(t: TranslateService) {
    translateService = t;
}

export function getTranslate(): TranslateService {
    return translateService;
}
