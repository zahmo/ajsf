import { Injectable } from '@angular/core';
import { CssFramework } from '@zajsf/cssframework';
import { cssFrameworkCfgBootstrap4 } from './bootstrap4-cssframework';
import { Bootstrap4FrameworkComponent } from './bootstrap4-framework.component';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/cssframework";
// Bootstrap 4 Framework
// https://github.com/ng-bootstrap/ng-bootstrap
export class Bootstrap4Framework extends CssFramework {
    constructor(cssFWService) {
        super(cssFrameworkCfgBootstrap4, cssFWService);
        this.cssFWService = cssFWService;
        this.framework = Bootstrap4FrameworkComponent;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap4Framework, deps: [{ token: i1.CssframeworkService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap4Framework }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap4Framework, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.CssframeworkService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwNC5mcmFtZXdvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1ib290c3RyYXA0L3NyYy9saWIvYm9vdHN0cmFwNC5mcmFtZXdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsWUFBWSxFQUF1QixNQUFNLHFCQUFxQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDOzs7QUFFaEYsd0JBQXdCO0FBQ3hCLCtDQUErQztBQUcvQyxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsWUFBWTtJQUluRCxZQUFtQixZQUFnQztRQUNqRCxLQUFLLENBQUMseUJBQXlCLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFEN0IsaUJBQVksR0FBWixZQUFZLENBQW9CO1FBRm5ELGNBQVMsR0FBRyw0QkFBNEIsQ0FBQztJQUl6QyxDQUFDOzhHQU5VLG1CQUFtQjtrSEFBbkIsbUJBQW1COzsyRkFBbkIsbUJBQW1CO2tCQUQvQixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ3NzRnJhbWV3b3JrLCBDc3NmcmFtZXdvcmtTZXJ2aWNlIH0gZnJvbSAnQHphanNmL2Nzc2ZyYW1ld29yayc7XG5pbXBvcnQgeyBjc3NGcmFtZXdvcmtDZmdCb290c3RyYXA0IH0gZnJvbSAnLi9ib290c3RyYXA0LWNzc2ZyYW1ld29yayc7XG5pbXBvcnQgeyBCb290c3RyYXA0RnJhbWV3b3JrQ29tcG9uZW50IH0gZnJvbSAnLi9ib290c3RyYXA0LWZyYW1ld29yay5jb21wb25lbnQnO1xuXG4vLyBCb290c3RyYXAgNCBGcmFtZXdvcmtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCb290c3RyYXA0RnJhbWV3b3JrIGV4dGVuZHMgQ3NzRnJhbWV3b3JrIHtcbiAgXG4gIGZyYW1ld29yayA9IEJvb3RzdHJhcDRGcmFtZXdvcmtDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGNzc0ZXU2VydmljZTpDc3NmcmFtZXdvcmtTZXJ2aWNlKXtcbiAgICBzdXBlcihjc3NGcmFtZXdvcmtDZmdCb290c3RyYXA0LGNzc0ZXU2VydmljZSk7XG4gIH1cbn1cbiJdfQ==