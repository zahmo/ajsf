import { Injectable } from '@angular/core';
import { Framework } from './framework';
import { NoFrameworkComponent } from './no-framework.component';
import * as i0 from "@angular/core";
// No framework - plain HTML controls (styles from form layout only)
export class NoFramework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'no-framework';
        this.framework = NoFrameworkComponent;
    }
}
NoFramework.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NoFramework, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
NoFramework.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NoFramework });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: NoFramework, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm8uZnJhbWV3b3JrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtY29yZS9zcmMvbGliL2ZyYW1ld29yay1saWJyYXJ5L25vLmZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7O0FBQ2hFLG9FQUFvRTtBQUdwRSxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFEMUM7O1FBRUUsU0FBSSxHQUFHLGNBQWMsQ0FBQztRQUV0QixjQUFTLEdBQUcsb0JBQW9CLENBQUM7S0FDbEM7O3dHQUpZLFdBQVc7NEdBQVgsV0FBVzsyRkFBWCxXQUFXO2tCQUR2QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRnJhbWV3b3JrIH0gZnJvbSAnLi9mcmFtZXdvcmsnO1xuaW1wb3J0IHsgTm9GcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL25vLWZyYW1ld29yay5jb21wb25lbnQnO1xuLy8gTm8gZnJhbWV3b3JrIC0gcGxhaW4gSFRNTCBjb250cm9scyAoc3R5bGVzIGZyb20gZm9ybSBsYXlvdXQgb25seSlcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5vRnJhbWV3b3JrIGV4dGVuZHMgRnJhbWV3b3JrIHtcbiAgbmFtZSA9ICduby1mcmFtZXdvcmsnO1xuXG4gIGZyYW1ld29yayA9IE5vRnJhbWV3b3JrQ29tcG9uZW50O1xufVxuIl19