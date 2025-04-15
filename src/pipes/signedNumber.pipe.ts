import { Pipe, type PipeTransform } from '@angular/core';
@Pipe({
    name: 'signedNumber',
})
export class SignedNumberPipe implements PipeTransform {
    transform(value: number | undefined): string {
        if (!value) return '';

        if (value > 0) return `🢁 +${value.toFixed(1)}`;

        if (value < 0) return `🢃 ${value.toFixed(1)}`;

        return value.toString();
    }
}
