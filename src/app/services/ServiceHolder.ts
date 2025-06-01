// translate-holder.ts
import { TranslateService } from '@ngx-translate/core';
import { BMIService } from './BMI.service';

export class ServiceHolder {
    static translateService: TranslateService;
    static BMIService: BMIService;

    static init( config: { translateService: TranslateService, BMIService: BMIService }) {
        ServiceHolder.translateService = config.translateService;
        ServiceHolder.BMIService = config.BMIService;
    }

}
