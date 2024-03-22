import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/core";
import * as i2 from "@angular/common";
import * as i3 from "@angular/material/button";
export class MaterialAddReferenceComponent {
    constructor(jsf) {
        this.jsf = jsf;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
    }
    get showAddButton() {
        return !this.layoutNode.arrayItem ||
            this.layoutIndex[this.layoutIndex.length - 1] < this.options.maxItems;
    }
    addItem(event) {
        event.preventDefault();
        this.jsf.addItem(this);
    }
    get buttonText() {
        const parent = {
            dataIndex: this.dataIndex.slice(0, -1),
            layoutIndex: this.layoutIndex.slice(0, -1),
            layoutNode: this.jsf.getParentNode(this),
        };
        return parent.layoutNode.add ||
            this.jsf.setArrayItemTitle(parent, this.layoutNode, this.itemCount);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: MaterialAddReferenceComponent, deps: [{ token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.2.3", type: MaterialAddReferenceComponent, selector: "material-add-reference-widget", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, ngImport: i0, template: `
    <section [class]="options?.htmlClass || ''" align="end">
      <button mat-raised-button *ngIf="showAddButton"
        [color]="options?.color || 'accent'"
        [disabled]="options?.readonly"
        (click)="addItem($event)">
        <span *ngIf="options?.icon" [class]="options?.icon"></span>
        <span *ngIf="options?.title" [innerHTML]="buttonText"></span>
      </button>
    </section>`, isInline: true, dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i3.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }], changeDetection: i0.ChangeDetectionStrategy.Default }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: MaterialAddReferenceComponent, decorators: [{
            type: Component,
            args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-add-reference-widget',
                    template: `
    <section [class]="options?.htmlClass || ''" align="end">
      <button mat-raised-button *ngIf="showAddButton"
        [color]="options?.color || 'accent'"
        [disabled]="options?.readonly"
        (click)="addItem($event)">
        <span *ngIf="options?.icon" [class]="options?.icon"></span>
        <span *ngIf="options?.title" [innerHTML]="buttonText"></span>
      </button>
    </section>`,
                    changeDetection: ChangeDetectionStrategy.Default,
                }]
        }], ctorParameters: () => [{ type: i1.JsonSchemaFormService }], propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1tYXRlcmlhbC9zcmMvbGliL3dpZGdldHMvbWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7Ozs7O0FBbUJsRixNQUFNLE9BQU8sNkJBQTZCO0lBU3hDLFlBQ1UsR0FBMEI7UUFBMUIsUUFBRyxHQUFILEdBQUcsQ0FBdUI7SUFDaEMsQ0FBQztJQUVMLFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUztZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQzFFLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBSztRQUNYLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1osTUFBTSxNQUFNLEdBQVE7WUFDbEIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7U0FDekMsQ0FBQztRQUNGLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHO1lBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7OEdBbkNVLDZCQUE2QjtrR0FBN0IsNkJBQTZCLCtKQVo5Qjs7Ozs7Ozs7O2VBU0c7OzJGQUdGLDZCQUE2QjtrQkFmekMsU0FBUzttQkFBQztvQkFDVCw4Q0FBOEM7b0JBQzlDLFFBQVEsRUFBRSwrQkFBK0I7b0JBQ3pDLFFBQVEsRUFBRTs7Ozs7Ozs7O2VBU0c7b0JBQ2IsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87aUJBQ2pEOzBGQU1VLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQHphanNmL2NvcmUnO1xuXG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnbWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxzZWN0aW9uIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIiBhbGlnbj1cImVuZFwiPlxuICAgICAgPGJ1dHRvbiBtYXQtcmFpc2VkLWJ1dHRvbiAqbmdJZj1cInNob3dBZGRCdXR0b25cIlxuICAgICAgICBbY29sb3JdPVwib3B0aW9ucz8uY29sb3IgfHwgJ2FjY2VudCdcIlxuICAgICAgICBbZGlzYWJsZWRdPVwib3B0aW9ucz8ucmVhZG9ubHlcIlxuICAgICAgICAoY2xpY2spPVwiYWRkSXRlbSgkZXZlbnQpXCI+XG4gICAgICAgIDxzcGFuICpuZ0lmPVwib3B0aW9ucz8uaWNvblwiIFtjbGFzc109XCJvcHRpb25zPy5pY29uXCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiAqbmdJZj1cIm9wdGlvbnM/LnRpdGxlXCIgW2lubmVySFRNTF09XCJidXR0b25UZXh0XCI+PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9zZWN0aW9uPmAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbn0pXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxBZGRSZWZlcmVuY2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBvcHRpb25zOiBhbnk7XG4gIGl0ZW1Db3VudDogbnVtYmVyO1xuICBwcmV2aW91c0xheW91dEluZGV4OiBudW1iZXJbXTtcbiAgcHJldmlvdXNEYXRhSW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge307XG4gIH1cblxuICBnZXQgc2hvd0FkZEJ1dHRvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMubGF5b3V0Tm9kZS5hcnJheUl0ZW0gfHxcbiAgICAgIHRoaXMubGF5b3V0SW5kZXhbdGhpcy5sYXlvdXRJbmRleC5sZW5ndGggLSAxXSA8IHRoaXMub3B0aW9ucy5tYXhJdGVtcztcbiAgfVxuXG4gIGFkZEl0ZW0oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuanNmLmFkZEl0ZW0odGhpcyk7XG4gIH1cblxuICBnZXQgYnV0dG9uVGV4dCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhcmVudDogYW55ID0ge1xuICAgICAgZGF0YUluZGV4OiB0aGlzLmRhdGFJbmRleC5zbGljZSgwLCAtMSksXG4gICAgICBsYXlvdXRJbmRleDogdGhpcy5sYXlvdXRJbmRleC5zbGljZSgwLCAtMSksXG4gICAgICBsYXlvdXROb2RlOiB0aGlzLmpzZi5nZXRQYXJlbnROb2RlKHRoaXMpLFxuICAgIH07XG4gICAgcmV0dXJuIHBhcmVudC5sYXlvdXROb2RlLmFkZCB8fFxuICAgICAgdGhpcy5qc2Yuc2V0QXJyYXlJdGVtVGl0bGUocGFyZW50LCB0aGlzLmxheW91dE5vZGUsIHRoaXMuaXRlbUNvdW50KTtcbiAgfVxufVxuIl19