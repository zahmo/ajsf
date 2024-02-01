import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/core";
import * as i2 from "@zajsf/cssframework";
/**
 * Bootstrap 3 framework for Angular JSON Schema Form.
 */
export class Bootstrap3FrameworkComponent {
    constructor(changeDetector, jsf) {
        this.changeDetector = changeDetector;
        this.jsf = jsf;
        this.frameworkInitialized = false;
        this.formControl = null;
        this.debugOutput = '';
        this.debug = '';
        this.parentArray = null;
        this.isOrderable = false;
    }
    ngOnInit() {
    }
    ngOnChanges() {
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: Bootstrap3FrameworkComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.4", type: Bootstrap3FrameworkComponent, selector: "bootstrap-3-framework", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, usesOnChanges: true, ngImport: i0, template: `
  <div>
    <css-framework [layoutNode]="layoutNode" 
    [layoutIndex]="layoutIndex" 
    [dataIndex]="dataIndex">
    </css-framework>
  </div>
  `, isInline: true, styles: [":host ::ng-deep .list-group-item .form-control-feedback{top:40px}:host ::ng-deep .checkbox,:host ::ng-deep .radio{margin-top:0;margin-bottom:0}:host ::ng-deep .checkbox-inline,:host ::ng-deep .checkbox-inline+.checkbox-inline,:host ::ng-deep .checkbox-inline+.radio-inline,:host ::ng-deep .radio-inline,:host ::ng-deep .radio-inline+.radio-inline,:host ::ng-deep .radio-inline+.checkbox-inline{margin-left:0;margin-right:10px}:host ::ng-deep .checkbox-inline:last-child,:host ::ng-deep .radio-inline:last-child{margin-right:0}:host ::ng-deep .ng-invalid.ng-touched{border:1px solid #f44336}\n"], dependencies: [{ kind: "component", type: i2.CssFrameworkComponent, selector: "css-framework", inputs: ["layoutNode", "layoutIndex", "dataIndex", "widgetStyles"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: Bootstrap3FrameworkComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bootstrap-3-framework', template: `
  <div>
    <css-framework [layoutNode]="layoutNode" 
    [layoutIndex]="layoutIndex" 
    [dataIndex]="dataIndex">
    </css-framework>
  </div>
  `, encapsulation: ViewEncapsulation.None, styles: [":host ::ng-deep .list-group-item .form-control-feedback{top:40px}:host ::ng-deep .checkbox,:host ::ng-deep .radio{margin-top:0;margin-bottom:0}:host ::ng-deep .checkbox-inline,:host ::ng-deep .checkbox-inline+.checkbox-inline,:host ::ng-deep .checkbox-inline+.radio-inline,:host ::ng-deep .radio-inline,:host ::ng-deep .radio-inline+.radio-inline,:host ::ng-deep .radio-inline+.checkbox-inline{margin-left:0;margin-right:10px}:host ::ng-deep .checkbox-inline:last-child,:host ::ng-deep .radio-inline:last-child{margin-right:0}:host ::ng-deep .ng-invalid.ng-touched{border:1px solid #f44336}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }, { type: i1.JsonSchemaFormService }]; }, propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwMy1mcmFtZXdvcmsuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtYm9vdHN0cmFwMy9zcmMvbGliL2Jvb3RzdHJhcDMtZnJhbWV3b3JrLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXFCLFNBQVMsRUFBRSxLQUFLLEVBQXFCLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDOzs7O0FBRzFHOztHQUVHO0FBZUgsTUFBTSxPQUFPLDRCQUE0QjtJQWV2QyxZQUNTLGNBQWlDLEVBQ2pDLEdBQTBCO1FBRDFCLG1CQUFjLEdBQWQsY0FBYyxDQUFtQjtRQUNqQyxRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQWhCbkMseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBSTdCLGdCQUFXLEdBQVEsSUFBSSxDQUFDO1FBQ3hCLGdCQUFXLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLFVBQUssR0FBUSxFQUFFLENBQUM7UUFDaEIsZ0JBQVcsR0FBUSxJQUFJLENBQUM7UUFDeEIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7SUFVcEIsQ0FBQztJQUlELFFBQVE7SUFFUixDQUFDO0lBRUQsV0FBVztJQUVYLENBQUM7OEdBN0JVLDRCQUE0QjtrR0FBNUIsNEJBQTRCLDRLQVg3Qjs7Ozs7OztHQU9UOzsyRkFJVSw0QkFBNEI7a0JBZHhDLFNBQVM7K0JBRUUsdUJBQXVCLFlBQ3ZCOzs7Ozs7O0dBT1QsaUJBRWEsaUJBQWlCLENBQUMsSUFBSTs0SUFZM0IsVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBJbnB1dCwgT25DaGFuZ2VzLCBPbkluaXQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICdAemFqc2YvY29yZSc7XG5cbi8qKlxuICogQm9vdHN0cmFwIDMgZnJhbWV3b3JrIGZvciBBbmd1bGFyIEpTT04gU2NoZW1hIEZvcm0uXG4gKi9cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnYm9vdHN0cmFwLTMtZnJhbWV3b3JrJyxcbiAgdGVtcGxhdGU6IGBcbiAgPGRpdj5cbiAgICA8Y3NzLWZyYW1ld29yayBbbGF5b3V0Tm9kZV09XCJsYXlvdXROb2RlXCIgXG4gICAgW2xheW91dEluZGV4XT1cImxheW91dEluZGV4XCIgXG4gICAgW2RhdGFJbmRleF09XCJkYXRhSW5kZXhcIj5cbiAgICA8L2Nzcy1mcmFtZXdvcms+XG4gIDwvZGl2PlxuICBgLFxuICBzdHlsZVVybHM6IFsnLi9ib290c3RyYXAzLWZyYW1ld29yay5jb21wb25lbnQuc2NzcyddLFxuICBlbmNhcHN1bGF0aW9uOlZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwM0ZyYW1ld29ya0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzICB7XG4gIGZyYW1ld29ya0luaXRpYWxpemVkID0gZmFsc2U7XG4gIHdpZGdldE9wdGlvbnM6IGFueTsgLy8gT3B0aW9ucyBwYXNzZWQgdG8gY2hpbGQgd2lkZ2V0XG4gIHdpZGdldExheW91dE5vZGU6IGFueTsgLy8gbGF5b3V0Tm9kZSBwYXNzZWQgdG8gY2hpbGQgd2lkZ2V0XG4gIG9wdGlvbnM6IGFueTsgLy8gT3B0aW9ucyB1c2VkIGluIHRoaXMgZnJhbWV3b3JrXG4gIGZvcm1Db250cm9sOiBhbnkgPSBudWxsO1xuICBkZWJ1Z091dHB1dDogYW55ID0gJyc7XG4gIGRlYnVnOiBhbnkgPSAnJztcbiAgcGFyZW50QXJyYXk6IGFueSA9IG51bGw7XG4gIGlzT3JkZXJhYmxlID0gZmFsc2U7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuICBcbiAgXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHVibGljIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkge1xuICB9XG4gIFxuICBcbiAgXG4gIG5nT25Jbml0KCkge1xuICBcbiAgfVxuICBcbiAgbmdPbkNoYW5nZXMoKSB7XG4gIFxuICB9XG4gIFxuICBcbiAgXG4gIFxuICBcbiAgXG4gIH1cbiJdfQ==