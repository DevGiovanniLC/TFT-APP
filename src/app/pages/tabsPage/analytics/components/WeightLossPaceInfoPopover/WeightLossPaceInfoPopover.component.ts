import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-weight-loss-pace-info-popover',
    imports: [TranslateModule],
    templateUrl: './WeightLossPaceInfoPopover.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeightLossPaceInfoPopoverComponent {}
