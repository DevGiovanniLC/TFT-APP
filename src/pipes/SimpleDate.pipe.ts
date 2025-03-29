import { Pipe, type PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
    name: 'simpleDate',
})
export class SimpleDatePipe implements PipeTransform {
    transform(value: Date | string | number | undefined, format: string = 'dd/MM/yyyy'): string {
        if (!value) return '';
        return formatDate(value, format, 'en-US');
    }
}
