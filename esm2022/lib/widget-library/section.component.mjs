import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../json-schema-form.service";
import * as i2 from "@angular/common";
import * as i3 from "./root.component";
export class SectionComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.expanded = true;
    }
    get sectionTitle() {
        return this.options.notitle ? null : this.jsf.setItemTitle(this);
    }
    ngOnInit() {
        this.jsf.initializeControl(this);
        this.options = this.layoutNode.options || {};
        this.expanded = typeof this.options.expanded === 'boolean' ?
            this.options.expanded : !this.options.expandable;
        switch (this.layoutNode.type) {
            case 'fieldset':
            case 'array':
            case 'tab':
            case 'advancedfieldset':
            case 'authfieldset':
            case 'optionfieldset':
            case 'selectfieldset':
                this.containerType = 'fieldset';
                break;
            default: // 'div', 'flex', 'section', 'conditional', 'actions', 'tagsinput'
                this.containerType = 'div';
                break;
        }
    }
    toggleExpanded() {
        if (this.options.expandable) {
            this.expanded = !this.expanded;
        }
    }
    // Set attributes for flexbox container
    // (child attributes are set in root.component)
    getFlexAttribute(attribute) {
        const flexActive = this.layoutNode.type === 'flex' ||
            !!this.options.displayFlex ||
            this.options.display === 'flex';
        if (attribute !== 'flex' && !flexActive) {
            return null;
        }
        switch (attribute) {
            case 'is-flex':
                return flexActive;
            case 'display':
                return flexActive ? 'flex' : 'initial';
            case 'flex-direction':
            case 'flex-wrap':
                const index = ['flex-direction', 'flex-wrap'].indexOf(attribute);
                return (this.options['flex-flow'] || '').split(/\s+/)[index] ||
                    this.options[attribute] || ['column', 'nowrap'][index];
            case 'justify-content':
            case 'align-items':
            case 'align-content':
                return this.options[attribute];
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: SectionComponent, deps: [{ token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.4", type: SectionComponent, selector: "section-widget", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, ngImport: i0, template: `
    <div *ngIf="containerType === 'div'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <label *ngIf="sectionTitle"
        class="legend"
        [class]="options?.labelHtmlClass || ''"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></label>
      <root-widget *ngIf="expanded"
        [dataIndex]="dataIndex"
        [layout]="layoutNode.items"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [isOrderable]="options?.orderable"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.align-content]="getFlexAttribute('align-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"></root-widget>
    </div>
    <fieldset *ngIf="containerType === 'fieldset'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded"
      [disabled]="options?.readonly">
      <legend *ngIf="sectionTitle"
        class="legend"
        [class]="options?.labelHtmlClass || ''"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></legend>
      <div *ngIf="options?.messageLocation !== 'bottom'">
        <p *ngIf="options?.description"
        class="help-block"
        [class]="options?.labelHelpBlockClass || ''"
        [innerHTML]="options?.description"></p>
      </div>
      <root-widget *ngIf="expanded"
        [dataIndex]="dataIndex"
        [layout]="layoutNode.items"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [isOrderable]="options?.orderable"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.align-content]="getFlexAttribute('align-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"></root-widget>
      <div *ngIf="options?.messageLocation === 'bottom'">
        <p *ngIf="options?.description"
        class="help-block"
        [class]="options?.labelHelpBlockClass || ''"
        [innerHTML]="options?.description"></p>
      </div>
    </fieldset>`, isInline: true, styles: [".legend{font-weight:700}.expandable>legend:before,.expandable>label:before{content:\"\\25b6\";padding-right:.3em}.expanded>legend:before,.expanded>label:before{content:\"\\25bc\";padding-right:.2em}\n"], dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i3.RootComponent, selector: "root-widget", inputs: ["dataIndex", "layoutIndex", "layout", "isOrderable", "isFlexItem"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: SectionComponent, decorators: [{
            type: Component,
            args: [{ selector: 'section-widget', template: `
    <div *ngIf="containerType === 'div'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded">
      <label *ngIf="sectionTitle"
        class="legend"
        [class]="options?.labelHtmlClass || ''"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></label>
      <root-widget *ngIf="expanded"
        [dataIndex]="dataIndex"
        [layout]="layoutNode.items"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [isOrderable]="options?.orderable"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.align-content]="getFlexAttribute('align-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"></root-widget>
    </div>
    <fieldset *ngIf="containerType === 'fieldset'"
      [class]="options?.htmlClass || ''"
      [class.expandable]="options?.expandable && !expanded"
      [class.expanded]="options?.expandable && expanded"
      [disabled]="options?.readonly">
      <legend *ngIf="sectionTitle"
        class="legend"
        [class]="options?.labelHtmlClass || ''"
        [innerHTML]="sectionTitle"
        (click)="toggleExpanded()"></legend>
      <div *ngIf="options?.messageLocation !== 'bottom'">
        <p *ngIf="options?.description"
        class="help-block"
        [class]="options?.labelHelpBlockClass || ''"
        [innerHTML]="options?.description"></p>
      </div>
      <root-widget *ngIf="expanded"
        [dataIndex]="dataIndex"
        [layout]="layoutNode.items"
        [layoutIndex]="layoutIndex"
        [isFlexItem]="getFlexAttribute('is-flex')"
        [isOrderable]="options?.orderable"
        [class.form-flex-column]="getFlexAttribute('flex-direction') === 'column'"
        [class.form-flex-row]="getFlexAttribute('flex-direction') === 'row'"
        [style.align-content]="getFlexAttribute('align-content')"
        [style.align-items]="getFlexAttribute('align-items')"
        [style.display]="getFlexAttribute('display')"
        [style.flex-direction]="getFlexAttribute('flex-direction')"
        [style.flex-wrap]="getFlexAttribute('flex-wrap')"
        [style.justify-content]="getFlexAttribute('justify-content')"></root-widget>
      <div *ngIf="options?.messageLocation === 'bottom'">
        <p *ngIf="options?.description"
        class="help-block"
        [class]="options?.labelHelpBlockClass || ''"
        [innerHTML]="options?.description"></p>
      </div>
    </fieldset>`, styles: [".legend{font-weight:700}.expandable>legend:before,.expandable>label:before{content:\"\\25b6\";padding-right:.3em}.expanded>legend:before,.expanded>label:before{content:\"\\25bc\";padding-right:.2em}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.JsonSchemaFormService }]; }, propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1jb3JlL3NyYy9saWIvd2lkZ2V0LWxpYnJhcnkvc2VjdGlvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7Ozs7O0FBMkV6RCxNQUFNLE9BQU8sZ0JBQWdCO0lBUTNCLFlBQ1UsR0FBMEI7UUFBMUIsUUFBRyxHQUFILEdBQUcsQ0FBdUI7UUFQcEMsYUFBUSxHQUFHLElBQUksQ0FBQztJQVFaLENBQUM7SUFFTCxJQUFJLFlBQVk7UUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDbkQsUUFBUSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtZQUM1QixLQUFLLFVBQVUsQ0FBQztZQUFDLEtBQUssT0FBTyxDQUFDO1lBQUMsS0FBSyxLQUFLLENBQUM7WUFBQyxLQUFLLGtCQUFrQixDQUFDO1lBQ25FLEtBQUssY0FBYyxDQUFDO1lBQUMsS0FBSyxnQkFBZ0IsQ0FBQztZQUFDLEtBQUssZ0JBQWdCO2dCQUMvRCxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztnQkFDbEMsTUFBTTtZQUNOLFNBQVMsa0VBQWtFO2dCQUN6RSxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztnQkFDN0IsTUFBTTtTQUNQO0lBQ0gsQ0FBQztJQUVELGNBQWM7UUFDWixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7U0FBRTtJQUNsRSxDQUFDO0lBRUQsdUNBQXVDO0lBQ3ZDLCtDQUErQztJQUMvQyxnQkFBZ0IsQ0FBQyxTQUFpQjtRQUNoQyxNQUFNLFVBQVUsR0FDZCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxNQUFNO1lBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDO1FBQ2xDLElBQUksU0FBUyxLQUFLLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFDekQsUUFBUSxTQUFTLEVBQUU7WUFDakIsS0FBSyxTQUFTO2dCQUNaLE9BQU8sVUFBVSxDQUFDO1lBQ3BCLEtBQUssU0FBUztnQkFDWixPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDekMsS0FBSyxnQkFBZ0IsQ0FBQztZQUFDLEtBQUssV0FBVztnQkFDckMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pFLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0QsS0FBSyxpQkFBaUIsQ0FBQztZQUFDLEtBQUssYUFBYSxDQUFDO1lBQUMsS0FBSyxlQUFlO2dCQUM5RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDbEM7SUFDSCxDQUFDOzhHQXhEVSxnQkFBZ0I7a0dBQWhCLGdCQUFnQixnSkFwRWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dCQTZESTs7MkZBT0gsZ0JBQWdCO2tCQXZFNUIsU0FBUzsrQkFFRSxnQkFBZ0IsWUFDaEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0JBNkRJOzRHQVdMLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICcuLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuXG5cbkBDb21wb25lbnQoe1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y29tcG9uZW50LXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnc2VjdGlvbi13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgKm5nSWY9XCJjb250YWluZXJUeXBlID09PSAnZGl2J1wiXG4gICAgICBbY2xhc3NdPVwib3B0aW9ucz8uaHRtbENsYXNzIHx8ICcnXCJcbiAgICAgIFtjbGFzcy5leHBhbmRhYmxlXT1cIm9wdGlvbnM/LmV4cGFuZGFibGUgJiYgIWV4cGFuZGVkXCJcbiAgICAgIFtjbGFzcy5leHBhbmRlZF09XCJvcHRpb25zPy5leHBhbmRhYmxlICYmIGV4cGFuZGVkXCI+XG4gICAgICA8bGFiZWwgKm5nSWY9XCJzZWN0aW9uVGl0bGVcIlxuICAgICAgICBjbGFzcz1cImxlZ2VuZFwiXG4gICAgICAgIFtjbGFzc109XCJvcHRpb25zPy5sYWJlbEh0bWxDbGFzcyB8fCAnJ1wiXG4gICAgICAgIFtpbm5lckhUTUxdPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgKGNsaWNrKT1cInRvZ2dsZUV4cGFuZGVkKClcIj48L2xhYmVsPlxuICAgICAgPHJvb3Qtd2lkZ2V0ICpuZ0lmPVwiZXhwYW5kZWRcIlxuICAgICAgICBbZGF0YUluZGV4XT1cImRhdGFJbmRleFwiXG4gICAgICAgIFtsYXlvdXRdPVwibGF5b3V0Tm9kZS5pdGVtc1wiXG4gICAgICAgIFtsYXlvdXRJbmRleF09XCJsYXlvdXRJbmRleFwiXG4gICAgICAgIFtpc0ZsZXhJdGVtXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2lzLWZsZXgnKVwiXG4gICAgICAgIFtpc09yZGVyYWJsZV09XCJvcHRpb25zPy5vcmRlcmFibGVcIlxuICAgICAgICBbY2xhc3MuZm9ybS1mbGV4LWNvbHVtbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpID09PSAnY29sdW1uJ1wiXG4gICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtcm93XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdyb3cnXCJcbiAgICAgICAgW3N0eWxlLmFsaWduLWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24tY29udGVudCcpXCJcbiAgICAgICAgW3N0eWxlLmFsaWduLWl0ZW1zXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2FsaWduLWl0ZW1zJylcIlxuICAgICAgICBbc3R5bGUuZGlzcGxheV09XCJnZXRGbGV4QXR0cmlidXRlKCdkaXNwbGF5JylcIlxuICAgICAgICBbc3R5bGUuZmxleC1kaXJlY3Rpb25dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKVwiXG4gICAgICAgIFtzdHlsZS5mbGV4LXdyYXBdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC13cmFwJylcIlxuICAgICAgICBbc3R5bGUuanVzdGlmeS1jb250ZW50XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2p1c3RpZnktY29udGVudCcpXCI+PC9yb290LXdpZGdldD5cbiAgICA8L2Rpdj5cbiAgICA8ZmllbGRzZXQgKm5nSWY9XCJjb250YWluZXJUeXBlID09PSAnZmllbGRzZXQnXCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIlxuICAgICAgW2NsYXNzLmV4cGFuZGFibGVdPVwib3B0aW9ucz8uZXhwYW5kYWJsZSAmJiAhZXhwYW5kZWRcIlxuICAgICAgW2NsYXNzLmV4cGFuZGVkXT1cIm9wdGlvbnM/LmV4cGFuZGFibGUgJiYgZXhwYW5kZWRcIlxuICAgICAgW2Rpc2FibGVkXT1cIm9wdGlvbnM/LnJlYWRvbmx5XCI+XG4gICAgICA8bGVnZW5kICpuZ0lmPVwic2VjdGlvblRpdGxlXCJcbiAgICAgICAgY2xhc3M9XCJsZWdlbmRcIlxuICAgICAgICBbY2xhc3NdPVwib3B0aW9ucz8ubGFiZWxIdG1sQ2xhc3MgfHwgJydcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cInNlY3Rpb25UaXRsZVwiXG4gICAgICAgIChjbGljayk9XCJ0b2dnbGVFeHBhbmRlZCgpXCI+PC9sZWdlbmQ+XG4gICAgICA8ZGl2ICpuZ0lmPVwib3B0aW9ucz8ubWVzc2FnZUxvY2F0aW9uICE9PSAnYm90dG9tJ1wiPlxuICAgICAgICA8cCAqbmdJZj1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uXCJcbiAgICAgICAgY2xhc3M9XCJoZWxwLWJsb2NrXCJcbiAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/LmxhYmVsSGVscEJsb2NrQ2xhc3MgfHwgJydcIlxuICAgICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uXCI+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgICA8cm9vdC13aWRnZXQgKm5nSWY9XCJleHBhbmRlZFwiXG4gICAgICAgIFtkYXRhSW5kZXhdPVwiZGF0YUluZGV4XCJcbiAgICAgICAgW2xheW91dF09XCJsYXlvdXROb2RlLml0ZW1zXCJcbiAgICAgICAgW2xheW91dEluZGV4XT1cImxheW91dEluZGV4XCJcbiAgICAgICAgW2lzRmxleEl0ZW1dPVwiZ2V0RmxleEF0dHJpYnV0ZSgnaXMtZmxleCcpXCJcbiAgICAgICAgW2lzT3JkZXJhYmxlXT1cIm9wdGlvbnM/Lm9yZGVyYWJsZVwiXG4gICAgICAgIFtjbGFzcy5mb3JtLWZsZXgtY29sdW1uXT1cImdldEZsZXhBdHRyaWJ1dGUoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdjb2x1bW4nXCJcbiAgICAgICAgW2NsYXNzLmZvcm0tZmxleC1yb3ddPVwiZ2V0RmxleEF0dHJpYnV0ZSgnZmxleC1kaXJlY3Rpb24nKSA9PT0gJ3JvdydcIlxuICAgICAgICBbc3R5bGUuYWxpZ24tY29udGVudF09XCJnZXRGbGV4QXR0cmlidXRlKCdhbGlnbi1jb250ZW50JylcIlxuICAgICAgICBbc3R5bGUuYWxpZ24taXRlbXNdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnYWxpZ24taXRlbXMnKVwiXG4gICAgICAgIFtzdHlsZS5kaXNwbGF5XT1cImdldEZsZXhBdHRyaWJ1dGUoJ2Rpc3BsYXknKVwiXG4gICAgICAgIFtzdHlsZS5mbGV4LWRpcmVjdGlvbl09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LWRpcmVjdGlvbicpXCJcbiAgICAgICAgW3N0eWxlLmZsZXgtd3JhcF09XCJnZXRGbGV4QXR0cmlidXRlKCdmbGV4LXdyYXAnKVwiXG4gICAgICAgIFtzdHlsZS5qdXN0aWZ5LWNvbnRlbnRdPVwiZ2V0RmxleEF0dHJpYnV0ZSgnanVzdGlmeS1jb250ZW50JylcIj48L3Jvb3Qtd2lkZ2V0PlxuICAgICAgPGRpdiAqbmdJZj1cIm9wdGlvbnM/Lm1lc3NhZ2VMb2NhdGlvbiA9PT0gJ2JvdHRvbSdcIj5cbiAgICAgICAgPHAgKm5nSWY9XCJvcHRpb25zPy5kZXNjcmlwdGlvblwiXG4gICAgICAgIGNsYXNzPVwiaGVscC1ibG9ja1wiXG4gICAgICAgIFtjbGFzc109XCJvcHRpb25zPy5sYWJlbEhlbHBCbG9ja0NsYXNzIHx8ICcnXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5kZXNjcmlwdGlvblwiPjwvcD5cbiAgICAgIDwvZGl2PlxuICAgIDwvZmllbGRzZXQ+YCxcbiAgc3R5bGVzOiBbYFxuICAgIC5sZWdlbmQgeyBmb250LXdlaWdodDogYm9sZDsgfVxuICAgIC5leHBhbmRhYmxlID4gbGVnZW5kOmJlZm9yZSwgLmV4cGFuZGFibGUgPiBsYWJlbDpiZWZvcmUgIHsgY29udGVudDogJ+KWtic7IHBhZGRpbmctcmlnaHQ6IC4zZW07IH1cbiAgICAuZXhwYW5kZWQgPiBsZWdlbmQ6YmVmb3JlLCAuZXhwYW5kZWQgPiBsYWJlbDpiZWZvcmUgIHsgY29udGVudDogJ+KWvCc7IHBhZGRpbmctcmlnaHQ6IC4yZW07IH1cbiAgYF0sXG59KVxuZXhwb3J0IGNsYXNzIFNlY3Rpb25Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBvcHRpb25zOiBhbnk7XG4gIGV4cGFuZGVkID0gdHJ1ZTtcbiAgY29udGFpbmVyVHlwZTogc3RyaW5nO1xuICBASW5wdXQoKSBsYXlvdXROb2RlOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dEluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgZGF0YUluZGV4OiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgZ2V0IHNlY3Rpb25UaXRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLm5vdGl0bGUgPyBudWxsIDogdGhpcy5qc2Yuc2V0SXRlbVRpdGxlKHRoaXMpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5qc2YuaW5pdGlhbGl6ZUNvbnRyb2wodGhpcyk7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge307XG4gICAgdGhpcy5leHBhbmRlZCA9IHR5cGVvZiB0aGlzLm9wdGlvbnMuZXhwYW5kZWQgPT09ICdib29sZWFuJyA/XG4gICAgICB0aGlzLm9wdGlvbnMuZXhwYW5kZWQgOiAhdGhpcy5vcHRpb25zLmV4cGFuZGFibGU7XG4gICAgc3dpdGNoICh0aGlzLmxheW91dE5vZGUudHlwZSkge1xuICAgICAgY2FzZSAnZmllbGRzZXQnOiBjYXNlICdhcnJheSc6IGNhc2UgJ3RhYic6IGNhc2UgJ2FkdmFuY2VkZmllbGRzZXQnOlxuICAgICAgY2FzZSAnYXV0aGZpZWxkc2V0JzogY2FzZSAnb3B0aW9uZmllbGRzZXQnOiBjYXNlICdzZWxlY3RmaWVsZHNldCc6XG4gICAgICAgIHRoaXMuY29udGFpbmVyVHlwZSA9ICdmaWVsZHNldCc7XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vICdkaXYnLCAnZmxleCcsICdzZWN0aW9uJywgJ2NvbmRpdGlvbmFsJywgJ2FjdGlvbnMnLCAndGFnc2lucHV0J1xuICAgICAgICB0aGlzLmNvbnRhaW5lclR5cGUgPSAnZGl2JztcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZUV4cGFuZGVkKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZXhwYW5kYWJsZSkgeyB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7IH1cbiAgfVxuXG4gIC8vIFNldCBhdHRyaWJ1dGVzIGZvciBmbGV4Ym94IGNvbnRhaW5lclxuICAvLyAoY2hpbGQgYXR0cmlidXRlcyBhcmUgc2V0IGluIHJvb3QuY29tcG9uZW50KVxuICBnZXRGbGV4QXR0cmlidXRlKGF0dHJpYnV0ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZmxleEFjdGl2ZTogYm9vbGVhbiA9XG4gICAgICB0aGlzLmxheW91dE5vZGUudHlwZSA9PT0gJ2ZsZXgnIHx8XG4gICAgICAhIXRoaXMub3B0aW9ucy5kaXNwbGF5RmxleCB8fFxuICAgICAgdGhpcy5vcHRpb25zLmRpc3BsYXkgPT09ICdmbGV4JztcbiAgICBpZiAoYXR0cmlidXRlICE9PSAnZmxleCcgJiYgIWZsZXhBY3RpdmUpIHsgcmV0dXJuIG51bGw7IH1cbiAgICBzd2l0Y2ggKGF0dHJpYnV0ZSkge1xuICAgICAgY2FzZSAnaXMtZmxleCc6XG4gICAgICAgIHJldHVybiBmbGV4QWN0aXZlO1xuICAgICAgY2FzZSAnZGlzcGxheSc6XG4gICAgICAgIHJldHVybiBmbGV4QWN0aXZlID8gJ2ZsZXgnIDogJ2luaXRpYWwnO1xuICAgICAgY2FzZSAnZmxleC1kaXJlY3Rpb24nOiBjYXNlICdmbGV4LXdyYXAnOlxuICAgICAgICBjb25zdCBpbmRleCA9IFsnZmxleC1kaXJlY3Rpb24nLCAnZmxleC13cmFwJ10uaW5kZXhPZihhdHRyaWJ1dGUpO1xuICAgICAgICByZXR1cm4gKHRoaXMub3B0aW9uc1snZmxleC1mbG93J10gfHwgJycpLnNwbGl0KC9cXHMrLylbaW5kZXhdIHx8XG4gICAgICAgICAgdGhpcy5vcHRpb25zW2F0dHJpYnV0ZV0gfHwgWydjb2x1bW4nLCAnbm93cmFwJ11baW5kZXhdO1xuICAgICAgY2FzZSAnanVzdGlmeS1jb250ZW50JzogY2FzZSAnYWxpZ24taXRlbXMnOiBjYXNlICdhbGlnbi1jb250ZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1thdHRyaWJ1dGVdO1xuICAgIH1cbiAgfVxufVxuIl19