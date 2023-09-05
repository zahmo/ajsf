import { Injectable } from '@angular/core';
import { Framework } from '@zajsf/core';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwNC5mcmFtZXdvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1ib290c3RyYXA0L3NyYy9saWIvYm9vdHN0cmFwNC5mcmFtZXdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDOztBQUVoRix3QkFBd0I7QUFDeEIsK0NBQStDO0FBRy9DLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxTQUFTO0lBRGxEOztRQUVFLFNBQUksR0FBRyxhQUFhLENBQUM7UUFFckIsY0FBUyxHQUFHLDRCQUE0QixDQUFDO1FBRXpDLGdCQUFXLEdBQUc7WUFDWixvRUFBb0U7U0FDckUsQ0FBQztRQUVGLFlBQU8sR0FBRztZQUNSLDRDQUE0QztZQUM1QyxxRUFBcUU7WUFDckUsa0VBQWtFO1NBQ25FLENBQUM7S0FDSDs7Z0hBZFksbUJBQW1CO29IQUFuQixtQkFBbUI7MkZBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZyYW1ld29yayB9IGZyb20gJ0B6YWpzZi9jb3JlJztcbmltcG9ydCB7IEJvb3RzdHJhcDRGcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL2Jvb3RzdHJhcDQtZnJhbWV3b3JrLmNvbXBvbmVudCc7XG5cbi8vIEJvb3RzdHJhcCA0IEZyYW1ld29ya1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25nLWJvb3RzdHJhcC9uZy1ib290c3RyYXBcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcDRGcmFtZXdvcmsgZXh0ZW5kcyBGcmFtZXdvcmsge1xuICBuYW1lID0gJ2Jvb3RzdHJhcC00JztcblxuICBmcmFtZXdvcmsgPSBCb290c3RyYXA0RnJhbWV3b3JrQ29tcG9uZW50O1xuXG4gIHN0eWxlc2hlZXRzID0gW1xuICAgICcvL3N0YWNrcGF0aC5ib290c3RyYXBjZG4uY29tL2Jvb3RzdHJhcC80LjMuMS9jc3MvYm9vdHN0cmFwLm1pbi5jc3MnXG4gIF07XG5cbiAgc2NyaXB0cyA9IFtcbiAgICAnLy9jb2RlLmpxdWVyeS5jb20vanF1ZXJ5LTMuMy4xLnNsaW0ubWluLmpzJyxcbiAgICAnLy9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvcG9wcGVyLmpzLzEuMTQuNy91bWQvcG9wcGVyLm1pbi5qcycsXG4gICAgJy8vc3RhY2twYXRoLmJvb3RzdHJhcGNkbi5jb20vYm9vdHN0cmFwLzQuMy4xL2pzL2Jvb3RzdHJhcC5taW4uanMnLFxuICBdO1xufVxuIl19