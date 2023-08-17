import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@ajsf/core";
import * as i2 from "@angular/common";
export class FlexLayoutRootComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.isFlexItem = false;
    }
    removeItem(item) {
        this.jsf.removeItem(item);
    }
    // Set attributes for flexbox child
    // (container attributes are set in flex-layout-section.component)
    getFlexAttribute(node, attribute) {
        const index = ['flex-grow', 'flex-shrink', 'flex-basis'].indexOf(attribute);
        return ((node.options || {}).flex || '').split(/\s+/)[index] ||
            (node.options || {})[attribute] || ['1', '1', 'auto'][index];
    }
    showWidget(layoutNode) {
        return this.jsf.evaluateCondition(layoutNode, this.dataIndex);
    }
}
FlexLayoutRootComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FlexLayoutRootComponent, deps: [{ token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component });
FlexLayoutRootComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.9", type: FlexLayoutRootComponent, selector: "flex-layout-root-widget", inputs: { dataIndex: "dataIndex", layoutIndex: "layoutIndex", layout: "layout", isFlexItem: "isFlexItem" }, ngImport: i0, template: `
    <div *ngFor="let layoutNode of layout; let i = index"
      [class.form-flex-item]="isFlexItem"
      [style.flex-grow]="getFlexAttribute(layoutNode, 'flex-grow')"
      [style.flex-shrink]="getFlexAttribute(layoutNode, 'flex-shrink')"
      [style.flex-basis]="getFlexAttribute(layoutNode, 'flex-basis')"
      [style.align-self]="(layoutNode?.options || {})['align-self']"
      [style.order]="layoutNode?.options?.order"
      [attr.fxFlex]="layoutNode?.options?.fxFlex"
      [attr.fxFlexOrder]="layoutNode?.options?.fxFlexOrder"
      [attr.fxFlexOffset]="layoutNode?.options?.fxFlexOffset"
      [attr.fxFlexAlign]="layoutNode?.options?.fxFlexAlign">
      <select-framework-widget *ngIf="showWidget(layoutNode)"
        [dataIndex]="layoutNode?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [layoutNode]="layoutNode"></select-framework-widget>
    <div>`, isInline: true, dependencies: [{ kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i1.SelectFrameworkComponent, selector: "select-framework-widget", inputs: ["layoutNode", "layoutIndex", "dataIndex"] }], changeDetection: i0.ChangeDetectionStrategy.Default });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FlexLayoutRootComponent, decorators: [{
            type: Component,
            args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'flex-layout-root-widget',
                    template: `
    <div *ngFor="let layoutNode of layout; let i = index"
      [class.form-flex-item]="isFlexItem"
      [style.flex-grow]="getFlexAttribute(layoutNode, 'flex-grow')"
      [style.flex-shrink]="getFlexAttribute(layoutNode, 'flex-shrink')"
      [style.flex-basis]="getFlexAttribute(layoutNode, 'flex-basis')"
      [style.align-self]="(layoutNode?.options || {})['align-self']"
      [style.order]="layoutNode?.options?.order"
      [attr.fxFlex]="layoutNode?.options?.fxFlex"
      [attr.fxFlexOrder]="layoutNode?.options?.fxFlexOrder"
      [attr.fxFlexOffset]="layoutNode?.options?.fxFlexOffset"
      [attr.fxFlexAlign]="layoutNode?.options?.fxFlexAlign">
      <select-framework-widget *ngIf="showWidget(layoutNode)"
        [dataIndex]="layoutNode?.arrayItem ? (dataIndex || []).concat(i) : (dataIndex || [])"
        [layoutIndex]="(layoutIndex || []).concat(i)"
        [layoutNode]="layoutNode"></select-framework-widget>
    <div>`,
                    changeDetection: ChangeDetectionStrategy.Default,
                }]
        }], ctorParameters: function () { return [{ type: i1.JsonSchemaFormService }]; }, propDecorators: { dataIndex: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], layout: [{
                type: Input
            }], isFlexItem: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1sYXlvdXQtcm9vdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9mbGV4LWxheW91dC1yb290LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQXlCMUUsTUFBTSxPQUFPLHVCQUF1QjtJQU1sQyxZQUNVLEdBQTBCO1FBQTFCLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBSDNCLGVBQVUsR0FBRyxLQUFLLENBQUM7SUFJeEIsQ0FBQztJQUVMLFVBQVUsQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxrRUFBa0U7SUFDbEUsZ0JBQWdCLENBQUMsSUFBUyxFQUFFLFNBQWlCO1FBQzNDLE1BQU0sS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUMxRCxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoRSxDQUFDOztvSEF4QlUsdUJBQXVCO3dHQUF2Qix1QkFBdUIsMktBbkJ4Qjs7Ozs7Ozs7Ozs7Ozs7OztVQWdCRjsyRkFHRyx1QkFBdUI7a0JBdEJuQyxTQUFTO21CQUFDO29CQUNULDhDQUE4QztvQkFDOUMsUUFBUSxFQUFFLHlCQUF5QjtvQkFDbkMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7O1VBZ0JGO29CQUNSLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO2lCQUNqRDs0R0FFVSxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICdAYWpzZi9jb3JlJztcbmltcG9ydCB7IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdmbGV4LWxheW91dC1yb290LXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiAqbmdGb3I9XCJsZXQgbGF5b3V0Tm9kZSBvZiBsYXlvdXQ7IGxldCBpID0gaW5kZXhcIlxuICAgICAgW2NsYXNzLmZvcm0tZmxleC1pdGVtXT1cImlzRmxleEl0ZW1cIlxuICAgICAgW3N0eWxlLmZsZXgtZ3Jvd109XCJnZXRGbGV4QXR0cmlidXRlKGxheW91dE5vZGUsICdmbGV4LWdyb3cnKVwiXG4gICAgICBbc3R5bGUuZmxleC1zaHJpbmtdPVwiZ2V0RmxleEF0dHJpYnV0ZShsYXlvdXROb2RlLCAnZmxleC1zaHJpbmsnKVwiXG4gICAgICBbc3R5bGUuZmxleC1iYXNpc109XCJnZXRGbGV4QXR0cmlidXRlKGxheW91dE5vZGUsICdmbGV4LWJhc2lzJylcIlxuICAgICAgW3N0eWxlLmFsaWduLXNlbGZdPVwiKGxheW91dE5vZGU/Lm9wdGlvbnMgfHwge30pWydhbGlnbi1zZWxmJ11cIlxuICAgICAgW3N0eWxlLm9yZGVyXT1cImxheW91dE5vZGU/Lm9wdGlvbnM/Lm9yZGVyXCJcbiAgICAgIFthdHRyLmZ4RmxleF09XCJsYXlvdXROb2RlPy5vcHRpb25zPy5meEZsZXhcIlxuICAgICAgW2F0dHIuZnhGbGV4T3JkZXJdPVwibGF5b3V0Tm9kZT8ub3B0aW9ucz8uZnhGbGV4T3JkZXJcIlxuICAgICAgW2F0dHIuZnhGbGV4T2Zmc2V0XT1cImxheW91dE5vZGU/Lm9wdGlvbnM/LmZ4RmxleE9mZnNldFwiXG4gICAgICBbYXR0ci5meEZsZXhBbGlnbl09XCJsYXlvdXROb2RlPy5vcHRpb25zPy5meEZsZXhBbGlnblwiPlxuICAgICAgPHNlbGVjdC1mcmFtZXdvcmstd2lkZ2V0ICpuZ0lmPVwic2hvd1dpZGdldChsYXlvdXROb2RlKVwiXG4gICAgICAgIFtkYXRhSW5kZXhdPVwibGF5b3V0Tm9kZT8uYXJyYXlJdGVtID8gKGRhdGFJbmRleCB8fCBbXSkuY29uY2F0KGkpIDogKGRhdGFJbmRleCB8fCBbXSlcIlxuICAgICAgICBbbGF5b3V0SW5kZXhdPVwiKGxheW91dEluZGV4IHx8IFtdKS5jb25jYXQoaSlcIlxuICAgICAgICBbbGF5b3V0Tm9kZV09XCJsYXlvdXROb2RlXCI+PC9zZWxlY3QtZnJhbWV3b3JrLXdpZGdldD5cbiAgICA8ZGl2PmAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbn0pXG5leHBvcnQgY2xhc3MgRmxleExheW91dFJvb3RDb21wb25lbnQge1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGxheW91dDogYW55W107XG4gIEBJbnB1dCgpIGlzRmxleEl0ZW0gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgcmVtb3ZlSXRlbShpdGVtKSB7XG4gICAgdGhpcy5qc2YucmVtb3ZlSXRlbShpdGVtKTtcbiAgfVxuXG4gIC8vIFNldCBhdHRyaWJ1dGVzIGZvciBmbGV4Ym94IGNoaWxkXG4gIC8vIChjb250YWluZXIgYXR0cmlidXRlcyBhcmUgc2V0IGluIGZsZXgtbGF5b3V0LXNlY3Rpb24uY29tcG9uZW50KVxuICBnZXRGbGV4QXR0cmlidXRlKG5vZGU6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpbmRleCA9IFsnZmxleC1ncm93JywgJ2ZsZXgtc2hyaW5rJywgJ2ZsZXgtYmFzaXMnXS5pbmRleE9mKGF0dHJpYnV0ZSk7XG4gICAgcmV0dXJuICgobm9kZS5vcHRpb25zIHx8IHt9KS5mbGV4IHx8ICcnKS5zcGxpdCgvXFxzKy8pW2luZGV4XSB8fFxuICAgICAgKG5vZGUub3B0aW9ucyB8fCB7fSlbYXR0cmlidXRlXSB8fCBbJzEnLCAnMScsICdhdXRvJ11baW5kZXhdO1xuICB9XG5cbiAgc2hvd1dpZGdldChsYXlvdXROb2RlOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5qc2YuZXZhbHVhdGVDb25kaXRpb24obGF5b3V0Tm9kZSwgdGhpcy5kYXRhSW5kZXgpO1xuICB9XG59XG4iXX0=