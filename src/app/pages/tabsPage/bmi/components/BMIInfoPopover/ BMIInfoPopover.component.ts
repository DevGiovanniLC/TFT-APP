import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app--bmiinfo-popover',
    imports: [TranslateModule],
    templateUrl: './ BMIInfoPopover.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BMIInfoPopoverComponent {}
