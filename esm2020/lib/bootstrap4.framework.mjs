import { Injectable } from '@angular/core';
import { Framework } from '@ajsf/core';
import { Bootstrap4FrameworkComponent } from './bootstrap4-framework.component';
import * as i0 from "@angular/core";
// Bootstrap 4 Framework
// https://github.com/ng-bootstrap/ng-bootstrap
export class Bootstrap4Framework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'bootstrap-4';
        this.framework = Bootstrap4FrameworkComponent;
        this.stylesheets = [
            '//stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'
        ];
        this.scripts = [
            '//code.jquery.com/jquery-3.3.1.slim.min.js',
            '//cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
            '//stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
        ];
    }
}
Bootstrap4Framework.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap4Framework, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
Bootstrap4Framework.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap4Framework });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap4Framework, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwNC5mcmFtZXdvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLWJvb3RzdHJhcDQvc3JjL2xpYi9ib290c3RyYXA0LmZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDckMsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sa0NBQWtDLENBQUM7O0FBRTlFLHdCQUF3QjtBQUN4QiwrQ0FBK0M7QUFHL0MsTUFBTSxPQUFPLG1CQUFvQixTQUFRLFNBQVM7SUFEbEQ7O1FBRUUsU0FBSSxHQUFHLGFBQWEsQ0FBQztRQUVyQixjQUFTLEdBQUcsNEJBQTRCLENBQUM7UUFFekMsZ0JBQVcsR0FBRztZQUNaLG9FQUFvRTtTQUNyRSxDQUFDO1FBRUYsWUFBTyxHQUFHO1lBQ1IsNENBQTRDO1lBQzVDLHFFQUFxRTtZQUNyRSxrRUFBa0U7U0FDbkUsQ0FBQztLQUNIOztnSEFkWSxtQkFBbUI7b0hBQW5CLG1CQUFtQjsyRkFBbkIsbUJBQW1CO2tCQUQvQixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RnJhbWV3b3JrfSBmcm9tICdAYWpzZi9jb3JlJztcbmltcG9ydCB7Qm9vdHN0cmFwNEZyYW1ld29ya0NvbXBvbmVudH0gZnJvbSAnLi9ib290c3RyYXA0LWZyYW1ld29yay5jb21wb25lbnQnO1xuXG4vLyBCb290c3RyYXAgNCBGcmFtZXdvcmtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9uZy1ib290c3RyYXAvbmctYm9vdHN0cmFwXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCb290c3RyYXA0RnJhbWV3b3JrIGV4dGVuZHMgRnJhbWV3b3JrIHtcbiAgbmFtZSA9ICdib290c3RyYXAtNCc7XG5cbiAgZnJhbWV3b3JrID0gQm9vdHN0cmFwNEZyYW1ld29ya0NvbXBvbmVudDtcblxuICBzdHlsZXNoZWV0cyA9IFtcbiAgICAnLy9zdGFja3BhdGguYm9vdHN0cmFwY2RuLmNvbS9ib290c3RyYXAvNC4zLjEvY3NzL2Jvb3RzdHJhcC5taW4uY3NzJ1xuICBdO1xuXG4gIHNjcmlwdHMgPSBbXG4gICAgJy8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS0zLjMuMS5zbGltLm1pbi5qcycsXG4gICAgJy8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL3BvcHBlci5qcy8xLjE0LjcvdW1kL3BvcHBlci5taW4uanMnLFxuICAgICcvL3N0YWNrcGF0aC5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC80LjMuMS9qcy9ib290c3RyYXAubWluLmpzJyxcbiAgXTtcbn1cbiJdfQ==