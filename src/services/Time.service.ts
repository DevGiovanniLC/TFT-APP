import { Injectable } from '@angular/core';
import { environment } from '@envs/environment';


@Injectable({
    providedIn: 'root'  // Esto permite que el servicio esté disponible en toda la aplicación.
})
export class TimeService {
    now(): Date {
        return environment.testing ?
            new Date('2025-05-30T17:54:12.535Z')
            : new Date();
    }
}
