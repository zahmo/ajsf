import { Injectable } from '@angular/core';
import { CssFramework } from '@zajsf/cssframework';
import { cssFrameworkCfgBootstrap3 } from './bootstrap3-cssframework';
import { Bootstrap3FrameworkComponent } from './bootstrap3-framework.component';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/cssframework";
// Bootstrap 3 Framework
// https://github.com/valor-software/ng2-bootstrap
export class Bootstrap3Framework extends CssFramework {
    constructor(cssFWService) {
        super(cssFrameworkCfgBootstrap3, cssFWService);
        this.cssFWService = cssFWService;
        this.name = 'bootstrap-3';
        this.framework = Bootstrap3FrameworkComponent;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap3Framework, deps: [{ token: i1.CssframeworkService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap3Framework }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap3Framework, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.CssframeworkService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwMy5mcmFtZXdvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1ib290c3RyYXAzL3NyYy9saWIvYm9vdHN0cmFwMy5mcmFtZXdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsWUFBWSxFQUF1QixNQUFNLHFCQUFxQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDOzs7QUFFaEYsd0JBQXdCO0FBQ3hCLGtEQUFrRDtBQUdsRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsWUFBWTtJQUtuRCxZQUFtQixZQUFnQztRQUNqRCxLQUFLLENBQUMseUJBQXlCLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFEN0IsaUJBQVksR0FBWixZQUFZLENBQW9CO1FBSm5ELFNBQUksR0FBRyxhQUFhLENBQUM7UUFFckIsY0FBUyxHQUFHLDRCQUE0QixDQUFDO0lBSXpDLENBQUM7OEdBUFUsbUJBQW1CO2tIQUFuQixtQkFBbUI7OzJGQUFuQixtQkFBbUI7a0JBRC9CLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDc3NGcmFtZXdvcmssIENzc2ZyYW1ld29ya1NlcnZpY2UgfSBmcm9tICdAemFqc2YvY3NzZnJhbWV3b3JrJztcbmltcG9ydCB7IGNzc0ZyYW1ld29ya0NmZ0Jvb3RzdHJhcDMgfSBmcm9tICcuL2Jvb3RzdHJhcDMtY3NzZnJhbWV3b3JrJztcbmltcG9ydCB7IEJvb3RzdHJhcDNGcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL2Jvb3RzdHJhcDMtZnJhbWV3b3JrLmNvbXBvbmVudCc7XG5cbi8vIEJvb3RzdHJhcCAzIEZyYW1ld29ya1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZhbG9yLXNvZnR3YXJlL25nMi1ib290c3RyYXBcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcDNGcmFtZXdvcmsgZXh0ZW5kcyBDc3NGcmFtZXdvcmsge1xuICBuYW1lID0gJ2Jvb3RzdHJhcC0zJztcblxuICBmcmFtZXdvcmsgPSBCb290c3RyYXAzRnJhbWV3b3JrQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjc3NGV1NlcnZpY2U6Q3NzZnJhbWV3b3JrU2VydmljZSl7XG4gICAgc3VwZXIoY3NzRnJhbWV3b3JrQ2ZnQm9vdHN0cmFwMyxjc3NGV1NlcnZpY2UpO1xuICB9XG59XG4iXX0=