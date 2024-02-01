import { Injectable } from '@angular/core';
import { Framework } from './framework';
import { NoFrameworkComponent } from './no-framework.component';
import * as i0 from "@angular/core";
// No framework - plain HTML controls (styles from form layout only)
export class NoFramework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'no-framework';
        this.text = 'None (plain HTML)';
        this.framework = NoFrameworkComponent;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: NoFramework, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: NoFramework }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: NoFramework, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8uZnJhbWV3b3JrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtY29yZS9zcmMvbGliL2ZyYW1ld29yay1saWJyYXJ5L25vLmZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7O0FBQ2hFLG9FQUFvRTtBQUdwRSxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFEMUM7O1FBRUUsU0FBSSxHQUFHLGNBQWMsQ0FBQztRQUN0QixTQUFJLEdBQUUsbUJBQW1CLENBQUM7UUFDMUIsY0FBUyxHQUFHLG9CQUFvQixDQUFDO0tBQ2xDOzhHQUpZLFdBQVc7a0hBQVgsV0FBVzs7MkZBQVgsV0FBVztrQkFEdkIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZyYW1ld29yayB9IGZyb20gJy4vZnJhbWV3b3JrJztcbmltcG9ydCB7IE5vRnJhbWV3b3JrQ29tcG9uZW50IH0gZnJvbSAnLi9uby1mcmFtZXdvcmsuY29tcG9uZW50Jztcbi8vIE5vIGZyYW1ld29yayAtIHBsYWluIEhUTUwgY29udHJvbHMgKHN0eWxlcyBmcm9tIGZvcm0gbGF5b3V0IG9ubHkpXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOb0ZyYW1ld29yayBleHRlbmRzIEZyYW1ld29yayB7XG4gIG5hbWUgPSAnbm8tZnJhbWV3b3JrJztcbiAgdGV4dCA9J05vbmUgKHBsYWluIEhUTUwpJztcbiAgZnJhbWV3b3JrID0gTm9GcmFtZXdvcmtDb21wb25lbnQ7XG59XG4iXX0=