import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient } from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { DeviceInfoService } from '@services/DeviceInfo.service';

window.addEventListener('DOMContentLoaded', () => {
    defineCustomElements(window);
});

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initApp(deviceInfoService: DeviceInfoService) {
    return () => deviceInfoService.init();
}

bootstrapApplication(AppComponent, {
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initApp,
            deps: [DeviceInfoService],
            multi: true,
        },
        provideHttpClient(),
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular({ mode: 'md' }),
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
            },
        }),
        importProvidersFrom(
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient],
                },
            })
        ),
    ],
});
