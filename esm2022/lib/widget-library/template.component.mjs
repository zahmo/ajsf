import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../json-schema-form.service";
export class TemplateComponent {
    constructor(componentFactory, jsf) {
        this.componentFactory = componentFactory;
        this.jsf = jsf;
        this.newComponent = null;
    }
    ngOnInit() {
        this.updateComponent();
    }
    ngOnChanges() {
        this.updateComponent();
    }
    updateComponent() {
        if (this.widgetContainer && !this.newComponent && this.layoutNode.options.template) {
            this.newComponent = this.widgetContainer.createComponent(this.componentFactory.resolveComponentFactory(this.layoutNode.options.template));
        }
        if (this.newComponent) {
            for (const input of ['layoutNode', 'layoutIndex', 'dataIndex']) {
                this.newComponent.instance[input] = this[input];
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: TemplateComponent, deps: [{ token: i0.ComponentFactoryResolver }, { token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.2.3", type: TemplateComponent, selector: "template-widget", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, viewQueries: [{ propertyName: "widgetContainer", first: true, predicate: ["widgetContainer"], descendants: true, read: ViewContainerRef, static: true }], usesOnChanges: true, ngImport: i0, template: `<div #widgetContainer></div>`, isInline: true }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: TemplateComponent, decorators: [{
            type: Component,
            args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'template-widget',
                    template: `<div #widgetContainer></div>`,
                }]
        }], ctorParameters: () => [{ type: i0.ComponentFactoryResolver }, { type: i1.JsonSchemaFormService }], propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }], widgetContainer: [{
                type: ViewChild,
                args: ['widgetContainer', { read: ViewContainerRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtY29yZS9zcmMvbGliL3dpZGdldC1saWJyYXJ5L3RlbXBsYXRlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUdULEtBQUssRUFHTCxTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2YsTUFBTSxlQUFlLENBQUM7OztBQVN6QixNQUFNLE9BQU8saUJBQWlCO0lBUTVCLFlBQ1UsZ0JBQTBDLEVBQzFDLEdBQTBCO1FBRDFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBMEI7UUFDMUMsUUFBRyxHQUFILEdBQUcsQ0FBdUI7UUFUcEMsaUJBQVksR0FBc0IsSUFBSSxDQUFDO0lBVW5DLENBQUM7SUFFTCxRQUFRO1FBQ04sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDbEYsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FDdEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUNoRixDQUFDO1NBQ0g7UUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDckIsS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqRDtTQUNGO0lBQ0gsQ0FBQzs4R0FoQ1UsaUJBQWlCO2tHQUFqQixpQkFBaUIsZ1BBS1UsZ0JBQWdCLGdFQVA1Qyw4QkFBOEI7OzJGQUU3QixpQkFBaUI7a0JBTDdCLFNBQVM7bUJBQUM7b0JBQ1QsOENBQThDO29CQUM5QyxRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixRQUFRLEVBQUUsOEJBQThCO2lCQUN6QztpSUFHVSxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFFSixlQUFlO3NCQURoQixTQUFTO3VCQUFDLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFHLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgQ29tcG9uZW50UmVmLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkluaXQsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NvbnRhaW5lclJlZlxuICB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ3RlbXBsYXRlLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgPGRpdiAjd2lkZ2V0Q29udGFpbmVyPjwvZGl2PmAsXG59KVxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMge1xuICBuZXdDb21wb25lbnQ6IENvbXBvbmVudFJlZjxhbnk+ID0gbnVsbDtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG4gIEBWaWV3Q2hpbGQoJ3dpZGdldENvbnRhaW5lcicsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiAsIHN0YXRpYzogdHJ1ZX0pXG4gICAgd2lkZ2V0Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIHByaXZhdGUganNmOiBKc29uU2NoZW1hRm9ybVNlcnZpY2VcbiAgKSB7IH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudCgpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoKSB7XG4gICAgdGhpcy51cGRhdGVDb21wb25lbnQoKTtcbiAgfVxuXG4gIHVwZGF0ZUNvbXBvbmVudCgpIHtcbiAgICBpZiAodGhpcy53aWRnZXRDb250YWluZXIgJiYgIXRoaXMubmV3Q29tcG9uZW50ICYmIHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zLnRlbXBsYXRlKSB7XG4gICAgICB0aGlzLm5ld0NvbXBvbmVudCA9IHRoaXMud2lkZ2V0Q29udGFpbmVyLmNyZWF0ZUNvbXBvbmVudChcbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5LnJlc29sdmVDb21wb25lbnRGYWN0b3J5KHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zLnRlbXBsYXRlKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubmV3Q29tcG9uZW50KSB7XG4gICAgICBmb3IgKGNvbnN0IGlucHV0IG9mIFsnbGF5b3V0Tm9kZScsICdsYXlvdXRJbmRleCcsICdkYXRhSW5kZXgnXSkge1xuICAgICAgICB0aGlzLm5ld0NvbXBvbmVudC5pbnN0YW5jZVtpbnB1dF0gPSB0aGlzW2lucHV0XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==