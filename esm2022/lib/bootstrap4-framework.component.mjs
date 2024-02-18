import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/core";
import * as i2 from "@zajsf/cssframework";
/**
 * Bootstrap 4 framework for Angular JSON Schema Form.
 *
 */
export class Bootstrap4FrameworkComponent {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.3", ngImport: i0, type: Bootstrap4FrameworkComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.1.3", type: Bootstrap4FrameworkComponent, selector: "bootstrap-4-framework", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, usesOnChanges: true, ngImport: i0, template: `
  <div>
    <css-framework [layoutNode]="layoutNode" 
    [layoutIndex]="layoutIndex" 
    [dataIndex]="dataIndex">
    </css-framework>
  </div>
  `, isInline: true, styles: [":host ::ng-deep .list-group-item .form-control-feedback{top:40px}:host ::ng-deep .checkbox,:host ::ng-deep .radio{margin-top:0;margin-bottom:0}:host ::ng-deep .checkbox-inline,:host ::ng-deep .checkbox-inline+.checkbox-inline,:host ::ng-deep .checkbox-inline+.radio-inline,:host ::ng-deep .radio-inline,:host ::ng-deep .radio-inline+.radio-inline,:host ::ng-deep .radio-inline+.checkbox-inline{margin-left:0;margin-right:10px}:host ::ng-deep .checkbox-inline:last-child,:host ::ng-deep .radio-inline:last-child{margin-right:0}:host ::ng-deep .ng-invalid.ng-touched{border:1px solid #f44336}.input-group .form-control:first-child,.input-group-text:first-child,.input-group-btn:first-child>.btn,.input-group-btn:first-child>.btn-group>.btn,.input-group-btn:first-child>.dropdown-toggle,.input-group-btn:last-child>.btn:not(:last-child):not(.dropdown-toggle),.input-group-btn:last-child>.btn-group:not(:last-child)>.btn{border-top-right-radius:0;border-bottom-right-radius:0}.input-group-text:first-child{border-right:0}.input-group .form-control:last-child,.input-group-text:last-child,.input-group-btn:last-child>.btn,.input-group-btn:last-child>.btn-group>.btn,.input-group-btn:last-child>.dropdown-toggle,.input-group-btn:first-child>.btn:not(:first-child),.input-group-btn:first-child>.btn-group:not(:first-child)>.btn{border-top-left-radius:0;border-bottom-left-radius:0}.input-group-text:last-child{border-left:0}.input-group .form-control:not(:first-child):not(:last-child),.input-group-text:not(:first-child):not(:last-child),.input-group-btn:not(:first-child):not(:last-child){border-radius:0}\n"], dependencies: [{ kind: "component", type: i2.CssFrameworkComponent, selector: "css-framework", inputs: ["layoutNode", "layoutIndex", "dataIndex", "widgetStyles"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.3", ngImport: i0, type: Bootstrap4FrameworkComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bootstrap-4-framework', template: `
  <div>
    <css-framework [layoutNode]="layoutNode" 
    [layoutIndex]="layoutIndex" 
    [dataIndex]="dataIndex">
    </css-framework>
  </div>
  `, encapsulation: ViewEncapsulation.None, styles: [":host ::ng-deep .list-group-item .form-control-feedback{top:40px}:host ::ng-deep .checkbox,:host ::ng-deep .radio{margin-top:0;margin-bottom:0}:host ::ng-deep .checkbox-inline,:host ::ng-deep .checkbox-inline+.checkbox-inline,:host ::ng-deep .checkbox-inline+.radio-inline,:host ::ng-deep .radio-inline,:host ::ng-deep .radio-inline+.radio-inline,:host ::ng-deep .radio-inline+.checkbox-inline{margin-left:0;margin-right:10px}:host ::ng-deep .checkbox-inline:last-child,:host ::ng-deep .radio-inline:last-child{margin-right:0}:host ::ng-deep .ng-invalid.ng-touched{border:1px solid #f44336}.input-group .form-control:first-child,.input-group-text:first-child,.input-group-btn:first-child>.btn,.input-group-btn:first-child>.btn-group>.btn,.input-group-btn:first-child>.dropdown-toggle,.input-group-btn:last-child>.btn:not(:last-child):not(.dropdown-toggle),.input-group-btn:last-child>.btn-group:not(:last-child)>.btn{border-top-right-radius:0;border-bottom-right-radius:0}.input-group-text:first-child{border-right:0}.input-group .form-control:last-child,.input-group-text:last-child,.input-group-btn:last-child>.btn,.input-group-btn:last-child>.btn-group>.btn,.input-group-btn:last-child>.dropdown-toggle,.input-group-btn:first-child>.btn:not(:first-child),.input-group-btn:first-child>.btn-group:not(:first-child)>.btn{border-top-left-radius:0;border-bottom-left-radius:0}.input-group-text:last-child{border-left:0}.input-group .form-control:not(:first-child):not(:last-child),.input-group-text:not(:first-child):not(:last-child),.input-group-btn:not(:first-child):not(:last-child){border-radius:0}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.JsonSchemaFormService }], propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwNC1mcmFtZXdvcmsuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtYm9vdHN0cmFwNC9zcmMvbGliL2Jvb3RzdHJhcDQtZnJhbWV3b3JrLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUwsU0FBUyxFQUNULEtBQUssRUFHTCxpQkFBaUIsRUFDbEIsTUFBTSxlQUFlLENBQUM7Ozs7QUFHdkI7OztHQUdHO0FBZUgsTUFBTSxPQUFPLDRCQUE0QjtJQWV2QyxZQUNTLGNBQWlDLEVBQ2pDLEdBQTBCO1FBRDFCLG1CQUFjLEdBQWQsY0FBYyxDQUFtQjtRQUNqQyxRQUFHLEdBQUgsR0FBRyxDQUF1QjtRQWhCbkMseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBSTdCLGdCQUFXLEdBQVEsSUFBSSxDQUFDO1FBQ3hCLGdCQUFXLEdBQVEsRUFBRSxDQUFDO1FBQ3RCLFVBQUssR0FBUSxFQUFFLENBQUM7UUFDaEIsZ0JBQVcsR0FBUSxJQUFJLENBQUM7UUFDeEIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7SUFVcEIsQ0FBQztJQUlELFFBQVE7SUFFUixDQUFDO0lBRUQsV0FBVztJQUVYLENBQUM7OEdBN0JVLDRCQUE0QjtrR0FBNUIsNEJBQTRCLDRLQVg3Qjs7Ozs7OztHQU9UOzsyRkFJVSw0QkFBNEI7a0JBZHhDLFNBQVM7K0JBRUUsdUJBQXVCLFlBQ3ZCOzs7Ozs7O0dBT1QsaUJBRWEsaUJBQWlCLENBQUMsSUFBSTswSEFZM0IsVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkluaXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQHphanNmL2NvcmUnO1xuXG4vKipcbiAqIEJvb3RzdHJhcCA0IGZyYW1ld29yayBmb3IgQW5ndWxhciBKU09OIFNjaGVtYSBGb3JtLlxuICpcbiAqL1xuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdib290c3RyYXAtNC1mcmFtZXdvcmsnLFxuICB0ZW1wbGF0ZTogYFxuICA8ZGl2PlxuICAgIDxjc3MtZnJhbWV3b3JrIFtsYXlvdXROb2RlXT1cImxheW91dE5vZGVcIiBcbiAgICBbbGF5b3V0SW5kZXhdPVwibGF5b3V0SW5kZXhcIiBcbiAgICBbZGF0YUluZGV4XT1cImRhdGFJbmRleFwiPlxuICAgIDwvY3NzLWZyYW1ld29yaz5cbiAgPC9kaXY+XG4gIGAsXG4gIHN0eWxlVXJsczogWycuL2Jvb3RzdHJhcDQtZnJhbWV3b3JrLmNvbXBvbmVudC5zY3NzJ10sXG4gIGVuY2Fwc3VsYXRpb246Vmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBCb290c3RyYXA0RnJhbWV3b3JrQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMge1xuICBmcmFtZXdvcmtJbml0aWFsaXplZCA9IGZhbHNlO1xuICB3aWRnZXRPcHRpb25zOiBhbnk7IC8vIE9wdGlvbnMgcGFzc2VkIHRvIGNoaWxkIHdpZGdldFxuICB3aWRnZXRMYXlvdXROb2RlOiBhbnk7IC8vIGxheW91dE5vZGUgcGFzc2VkIHRvIGNoaWxkIHdpZGdldFxuICBvcHRpb25zOiBhbnk7IC8vIE9wdGlvbnMgdXNlZCBpbiB0aGlzIGZyYW1ld29ya1xuICBmb3JtQ29udHJvbDogYW55ID0gbnVsbDtcbiAgZGVidWdPdXRwdXQ6IGFueSA9ICcnO1xuICBkZWJ1ZzogYW55ID0gJyc7XG4gIHBhcmVudEFycmF5OiBhbnkgPSBudWxsO1xuICBpc09yZGVyYWJsZSA9IGZhbHNlO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcbiAgXG4gIFxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHB1YmxpYyBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHtcbiAgfVxuICBcbiAgXG4gIFxuICBuZ09uSW5pdCgpIHtcbiAgXG4gIH1cbiAgXG4gIG5nT25DaGFuZ2VzKCkge1xuICBcbiAgfVxuICBcbiAgXG4gIFxuICBcbiAgXG4gIFxuICB9XG4gICJdfQ==