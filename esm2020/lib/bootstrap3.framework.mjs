import { Injectable } from '@angular/core';
import { Framework } from '@ajsf/core';
import { Bootstrap3FrameworkComponent } from './bootstrap3-framework.component';
import * as i0 from "@angular/core";
// Bootstrap 3 Framework
// https://github.com/valor-software/ng2-bootstrap
export class Bootstrap3Framework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'bootstrap-3';
        this.framework = Bootstrap3FrameworkComponent;
        this.stylesheets = [
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css',
        ];
        this.scripts = [
            '//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js',
            '//ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
            '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
        ];
    }
}
Bootstrap3Framework.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap3Framework, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
Bootstrap3Framework.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap3Framework });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap3Framework, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwMy5mcmFtZXdvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLWJvb3RzdHJhcDMvc3JjL2xpYi9ib290c3RyYXAzLmZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDckMsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sa0NBQWtDLENBQUM7O0FBRTlFLHdCQUF3QjtBQUN4QixrREFBa0Q7QUFHbEQsTUFBTSxPQUFPLG1CQUFvQixTQUFRLFNBQVM7SUFEbEQ7O1FBRUUsU0FBSSxHQUFHLGFBQWEsQ0FBQztRQUVyQixjQUFTLEdBQUcsNEJBQTRCLENBQUM7UUFFekMsZ0JBQVcsR0FBRztZQUNaLGlFQUFpRTtZQUNqRSx1RUFBdUU7U0FDeEUsQ0FBQztRQUVGLFlBQU8sR0FBRztZQUNSLDREQUE0RDtZQUM1RCxrRUFBa0U7WUFDbEUsK0RBQStEO1NBQ2hFLENBQUM7S0FDSDs7Z0hBZlksbUJBQW1CO29IQUFuQixtQkFBbUI7MkZBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZyYW1ld29ya30gZnJvbSAnQGFqc2YvY29yZSc7XG5pbXBvcnQge0Jvb3RzdHJhcDNGcmFtZXdvcmtDb21wb25lbnR9IGZyb20gJy4vYm9vdHN0cmFwMy1mcmFtZXdvcmsuY29tcG9uZW50JztcblxuLy8gQm9vdHN0cmFwIDMgRnJhbWV3b3JrXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdmFsb3Itc29mdHdhcmUvbmcyLWJvb3RzdHJhcFxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwM0ZyYW1ld29yayBleHRlbmRzIEZyYW1ld29yayB7XG4gIG5hbWUgPSAnYm9vdHN0cmFwLTMnO1xuXG4gIGZyYW1ld29yayA9IEJvb3RzdHJhcDNGcmFtZXdvcmtDb21wb25lbnQ7XG5cbiAgc3R5bGVzaGVldHMgPSBbXG4gICAgJy8vbWF4Y2RuLmJvb3RzdHJhcGNkbi5jb20vYm9vdHN0cmFwLzMuMy43L2Nzcy9ib290c3RyYXAubWluLmNzcycsXG4gICAgJy8vbWF4Y2RuLmJvb3RzdHJhcGNkbi5jb20vYm9vdHN0cmFwLzMuMy43L2Nzcy9ib290c3RyYXAtdGhlbWUubWluLmNzcycsXG4gIF07XG5cbiAgc2NyaXB0cyA9IFtcbiAgICAnLy9hamF4Lmdvb2dsZWFwaXMuY29tL2FqYXgvbGlicy9qcXVlcnkvMi4yLjQvanF1ZXJ5Lm1pbi5qcycsXG4gICAgJy8vYWpheC5nb29nbGVhcGlzLmNvbS9hamF4L2xpYnMvanF1ZXJ5dWkvMS4xMi4xL2pxdWVyeS11aS5taW4uanMnLFxuICAgICcvL21heGNkbi5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC8zLjMuNy9qcy9ib290c3RyYXAubWluLmpzJyxcbiAgXTtcbn1cbiJdfQ==