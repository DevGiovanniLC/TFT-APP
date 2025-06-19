import { Pipe, type PipeTransform } from '@angular/core';
@Pipe({
    name: 'signedNumber',
})
export class SignedNumberPipe implements PipeTransform {
    transform(value: number | undefined | string): string {
        if (!value) return '';

        if (typeof value === 'string') {
            const parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) return value;
            value = parsedValue;
        }

        if (value > 0) return `▲ ${value.toFixed(1)}`;

        if (value < 0) return `▼ ${(-1 * value).toFixed(1)}`;

        return value.toString();
    }
}
