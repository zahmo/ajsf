import { Framework } from './framework';
import { hasOwn } from '../shared/utility.functions';
import { Inject, Injectable } from '@angular/core';
import { WidgetLibraryService } from '../widget-library/widget-library.service';
import * as i0 from "@angular/core";
import * as i1 from "../widget-library/widget-library.service";
// Possible future frameworks:
// - Foundation 6:
//   http://justindavis.co/2017/06/15/using-foundation-6-in-angular-4/
//   https://github.com/zurb/foundation-sites
// - Semantic UI:
//   https://github.com/edcarroll/ng2-semantic-ui
//   https://github.com/vladotesanovic/ngSemantic
export class FrameworkLibraryService {
    constructor(frameworks, widgetLibrary) {
        this.frameworks = frameworks;
        this.widgetLibrary = widgetLibrary;
        this.activeFramework = null;
        this.loadExternalAssets = false;
        this.frameworkLibrary = {};
        this.frameworks.forEach(framework => this.frameworkLibrary[framework.name] = framework);
        this.defaultFramework = this.frameworks[0].name;
        this.setFramework(this.defaultFramework);
    }
    setLoadExternalAssets(loadExternalAssets = true) {
        this.loadExternalAssets = !!loadExternalAssets;
    }
    setFramework(framework = this.defaultFramework, loadExternalAssets = this.loadExternalAssets) {
        this.activeFramework =
            typeof framework === 'string' && this.hasFramework(framework) ?
                this.frameworkLibrary[framework] :
                typeof framework === 'object' && hasOwn(framework, 'framework') ?
                    framework :
                    this.frameworkLibrary[this.defaultFramework];
        return this.registerFrameworkWidgets(this.activeFramework);
    }
    registerFrameworkWidgets(framework) {
        return hasOwn(framework, 'widgets') ?
            this.widgetLibrary.registerFrameworkWidgets(framework.widgets) :
            this.widgetLibrary.unRegisterFrameworkWidgets();
    }
    hasFramework(type) {
        return hasOwn(this.frameworkLibrary, type);
    }
    getFramework() {
        if (!this.activeFramework) {
            this.setFramework('default', true);
        }
        return this.activeFramework.framework;
    }
    getFrameworkWidgets() {
        return this.activeFramework.widgets || {};
    }
    getFrameworkStylesheets(load = this.loadExternalAssets) {
        return (load && this.activeFramework.stylesheets) || [];
    }
    getFrameworkScripts(load = this.loadExternalAssets) {
        return (load && this.activeFramework.scripts) || [];
    }
}
FrameworkLibraryService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FrameworkLibraryService, deps: [{ token: Framework }, { token: WidgetLibraryService }], target: i0.ɵɵFactoryTarget.Injectable });
FrameworkLibraryService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FrameworkLibraryService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FrameworkLibraryService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [Framework]
                }] }, { type: i1.WidgetLibraryService, decorators: [{
                    type: Inject,
                    args: [WidgetLibraryService]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9mcmFtZXdvcmstbGlicmFyeS9mcmFtZXdvcmstbGlicmFyeS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDOzs7QUFFaEYsOEJBQThCO0FBQzlCLGtCQUFrQjtBQUNsQixzRUFBc0U7QUFDdEUsNkNBQTZDO0FBQzdDLGlCQUFpQjtBQUNqQixpREFBaUQ7QUFDakQsaURBQWlEO0FBS2pELE1BQU0sT0FBTyx1QkFBdUI7SUFRbEMsWUFDNkIsVUFBaUIsRUFDTixhQUFtQztRQUQ5QyxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQ04sa0JBQWEsR0FBYixhQUFhLENBQXNCO1FBVDNFLG9CQUFlLEdBQWMsSUFBSSxDQUFDO1FBR2xDLHVCQUFrQixHQUFHLEtBQUssQ0FBQztRQUUzQixxQkFBZ0IsR0FBa0MsRUFBRSxDQUFDO1FBTW5ELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUNsRCxDQUFDO1FBQ0YsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2hELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVNLHFCQUFxQixDQUFDLGtCQUFrQixHQUFHLElBQUk7UUFDcEQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQztJQUNqRCxDQUFDO0lBRU0sWUFBWSxDQUNqQixZQUE4QixJQUFJLENBQUMsZ0JBQWdCLEVBQ25ELGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0I7UUFFNUMsSUFBSSxDQUFDLGVBQWU7WUFDbEIsT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELFNBQVMsQ0FBQyxDQUFDO29CQUNYLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNqRCxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELHdCQUF3QixDQUFDLFNBQW9CO1FBQzNDLE9BQU8sTUFBTSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFFTSxZQUFZLENBQUMsSUFBWTtRQUM5QixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLFlBQVk7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUFFO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7SUFDeEMsQ0FBQztJQUVNLG1CQUFtQjtRQUN4QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUM1QyxDQUFDO0lBRU0sdUJBQXVCLENBQUMsT0FBZ0IsSUFBSSxDQUFDLGtCQUFrQjtRQUNwRSxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxPQUFnQixJQUFJLENBQUMsa0JBQWtCO1FBQ2hFLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdEQsQ0FBQzs7b0hBN0RVLHVCQUF1QixrQkFTeEIsU0FBUyxhQUNULG9CQUFvQjt3SEFWbkIsdUJBQXVCLGNBRnRCLE1BQU07MkZBRVAsdUJBQXVCO2tCQUhuQyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQjs7MEJBVUksTUFBTTsyQkFBQyxTQUFTOzswQkFDaEIsTUFBTTsyQkFBQyxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGcmFtZXdvcmsgfSBmcm9tICcuL2ZyYW1ld29yayc7XG5pbXBvcnQgeyBoYXNPd24gfSBmcm9tICcuLi9zaGFyZWQvdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBXaWRnZXRMaWJyYXJ5U2VydmljZSB9IGZyb20gJy4uL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5LnNlcnZpY2UnO1xuXG4vLyBQb3NzaWJsZSBmdXR1cmUgZnJhbWV3b3Jrczpcbi8vIC0gRm91bmRhdGlvbiA2OlxuLy8gICBodHRwOi8vanVzdGluZGF2aXMuY28vMjAxNy8wNi8xNS91c2luZy1mb3VuZGF0aW9uLTYtaW4tYW5ndWxhci00L1xuLy8gICBodHRwczovL2dpdGh1Yi5jb20venVyYi9mb3VuZGF0aW9uLXNpdGVzXG4vLyAtIFNlbWFudGljIFVJOlxuLy8gICBodHRwczovL2dpdGh1Yi5jb20vZWRjYXJyb2xsL25nMi1zZW1hbnRpYy11aVxuLy8gICBodHRwczovL2dpdGh1Yi5jb20vdmxhZG90ZXNhbm92aWMvbmdTZW1hbnRpY1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0pXG5leHBvcnQgY2xhc3MgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2Uge1xuICBhY3RpdmVGcmFtZXdvcms6IEZyYW1ld29yayA9IG51bGw7XG4gIHN0eWxlc2hlZXRzOiAoSFRNTFN0eWxlRWxlbWVudHxIVE1MTGlua0VsZW1lbnQpW107XG4gIHNjcmlwdHM6IEhUTUxTY3JpcHRFbGVtZW50W107XG4gIGxvYWRFeHRlcm5hbEFzc2V0cyA9IGZhbHNlO1xuICBkZWZhdWx0RnJhbWV3b3JrOiBzdHJpbmc7XG4gIGZyYW1ld29ya0xpYnJhcnk6IHsgW25hbWU6IHN0cmluZ106IEZyYW1ld29yayB9ID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChGcmFtZXdvcmspIHByaXZhdGUgZnJhbWV3b3JrczogYW55W10sXG4gICAgQEluamVjdChXaWRnZXRMaWJyYXJ5U2VydmljZSkgcHJpdmF0ZSB3aWRnZXRMaWJyYXJ5OiBXaWRnZXRMaWJyYXJ5U2VydmljZVxuICApIHtcbiAgICB0aGlzLmZyYW1ld29ya3MuZm9yRWFjaChmcmFtZXdvcmsgPT5cbiAgICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeVtmcmFtZXdvcmsubmFtZV0gPSBmcmFtZXdvcmtcbiAgICApO1xuICAgIHRoaXMuZGVmYXVsdEZyYW1ld29yayA9IHRoaXMuZnJhbWV3b3Jrc1swXS5uYW1lO1xuICAgIHRoaXMuc2V0RnJhbWV3b3JrKHRoaXMuZGVmYXVsdEZyYW1ld29yayk7XG4gIH1cblxuICBwdWJsaWMgc2V0TG9hZEV4dGVybmFsQXNzZXRzKGxvYWRFeHRlcm5hbEFzc2V0cyA9IHRydWUpOiB2b2lkIHtcbiAgICB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0cyA9ICEhbG9hZEV4dGVybmFsQXNzZXRzO1xuICB9XG5cbiAgcHVibGljIHNldEZyYW1ld29yayhcbiAgICBmcmFtZXdvcms6IHN0cmluZ3xGcmFtZXdvcmsgPSB0aGlzLmRlZmF1bHRGcmFtZXdvcmssXG4gICAgbG9hZEV4dGVybmFsQXNzZXRzID0gdGhpcy5sb2FkRXh0ZXJuYWxBc3NldHNcbiAgKTogYm9vbGVhbiB7XG4gICAgdGhpcy5hY3RpdmVGcmFtZXdvcmsgPVxuICAgICAgdHlwZW9mIGZyYW1ld29yayA9PT0gJ3N0cmluZycgJiYgdGhpcy5oYXNGcmFtZXdvcmsoZnJhbWV3b3JrKSA/XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeVtmcmFtZXdvcmtdIDpcbiAgICAgIHR5cGVvZiBmcmFtZXdvcmsgPT09ICdvYmplY3QnICYmIGhhc093bihmcmFtZXdvcmssICdmcmFtZXdvcmsnKSA/XG4gICAgICAgIGZyYW1ld29yayA6XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeVt0aGlzLmRlZmF1bHRGcmFtZXdvcmtdO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyRnJhbWV3b3JrV2lkZ2V0cyh0aGlzLmFjdGl2ZUZyYW1ld29yayk7XG4gIH1cblxuICByZWdpc3RlckZyYW1ld29ya1dpZGdldHMoZnJhbWV3b3JrOiBGcmFtZXdvcmspOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGFzT3duKGZyYW1ld29yaywgJ3dpZGdldHMnKSA/XG4gICAgICB0aGlzLndpZGdldExpYnJhcnkucmVnaXN0ZXJGcmFtZXdvcmtXaWRnZXRzKGZyYW1ld29yay53aWRnZXRzKSA6XG4gICAgICB0aGlzLndpZGdldExpYnJhcnkudW5SZWdpc3RlckZyYW1ld29ya1dpZGdldHMoKTtcbiAgfVxuXG4gIHB1YmxpYyBoYXNGcmFtZXdvcmsodHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhhc093bih0aGlzLmZyYW1ld29ya0xpYnJhcnksIHR5cGUpO1xuICB9XG5cbiAgcHVibGljIGdldEZyYW1ld29yaygpOiBhbnkge1xuICAgIGlmICghdGhpcy5hY3RpdmVGcmFtZXdvcmspIHsgdGhpcy5zZXRGcmFtZXdvcmsoJ2RlZmF1bHQnLCB0cnVlKTsgfVxuICAgIHJldHVybiB0aGlzLmFjdGl2ZUZyYW1ld29yay5mcmFtZXdvcms7XG4gIH1cblxuICBwdWJsaWMgZ2V0RnJhbWV3b3JrV2lkZ2V0cygpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZUZyYW1ld29yay53aWRnZXRzIHx8IHt9O1xuICB9XG5cbiAgcHVibGljIGdldEZyYW1ld29ya1N0eWxlc2hlZXRzKGxvYWQ6IGJvb2xlYW4gPSB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0cyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gKGxvYWQgJiYgdGhpcy5hY3RpdmVGcmFtZXdvcmsuc3R5bGVzaGVldHMpIHx8IFtdO1xuICB9XG5cbiAgcHVibGljIGdldEZyYW1ld29ya1NjcmlwdHMobG9hZDogYm9vbGVhbiA9IHRoaXMubG9hZEV4dGVybmFsQXNzZXRzKTogc3RyaW5nW10ge1xuICAgIHJldHVybiAobG9hZCAmJiB0aGlzLmFjdGl2ZUZyYW1ld29yay5zY3JpcHRzKSB8fCBbXTtcbiAgfVxufVxuIl19