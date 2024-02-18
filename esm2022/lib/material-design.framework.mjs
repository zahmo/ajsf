import { Injectable } from '@angular/core';
import { CssFramework } from '@zajsf/cssframework';
import { cssFrameworkCfgMaterialDesign } from './material-design-cssframework';
import { FlexLayoutRootComponent, FlexLayoutSectionComponent, MaterialAddReferenceComponent, MaterialButtonComponent, MaterialButtonGroupComponent, MaterialCheckboxComponent, MaterialCheckboxesComponent, MaterialChipListComponent, MaterialDatepickerComponent, MaterialDesignFrameworkComponent, MaterialFileComponent, MaterialInputComponent, MaterialNumberComponent, MaterialOneOfComponent, MaterialRadiosComponent, MaterialSelectComponent, MaterialSliderComponent, MaterialStepperComponent, MaterialTabsComponent, MaterialTextareaComponent } from './widgets/public_api';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/cssframework";
// Material Design Framework
// https://github.com/angular/material2
export class MaterialDesignFramework extends CssFramework {
    constructor(cssFWService) {
        super(cssFrameworkCfgMaterialDesign, cssFWService);
        this.cssFWService = cssFWService;
        this.name = 'material-design';
        this.framework = MaterialDesignFrameworkComponent;
        this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        this._widgets = {
            'root': FlexLayoutRootComponent,
            'section': FlexLayoutSectionComponent,
            '$ref': MaterialAddReferenceComponent,
            'button': MaterialButtonComponent,
            'button-group': MaterialButtonGroupComponent,
            'checkbox': MaterialCheckboxComponent,
            'checkboxes': MaterialCheckboxesComponent,
            'chip-list': MaterialChipListComponent,
            'date': MaterialDatepickerComponent,
            'file': MaterialFileComponent,
            'number': MaterialNumberComponent,
            'one-of': MaterialOneOfComponent,
            'radios': MaterialRadiosComponent,
            'select': MaterialSelectComponent,
            'slider': MaterialSliderComponent,
            'stepper': MaterialStepperComponent,
            'tabs': MaterialTabsComponent,
            'text': MaterialInputComponent,
            'textarea': MaterialTextareaComponent,
            'alt-date': 'date',
            'any-of': 'one-of',
            'card': 'section',
            'color': 'text',
            'expansion-panel': 'section',
            'hidden': 'none',
            'image': 'none',
            'integer': 'number',
            'radiobuttons': 'button-group',
            'range': 'slider',
            'submit': 'button',
            'tagsinput': 'chip-list',
            'wizard': 'stepper',
        };
        this.widgets = this._widgets;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.3", ngImport: i0, type: MaterialDesignFramework, deps: [{ token: i1.CssframeworkService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.3", ngImport: i0, type: MaterialDesignFramework }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.3", ngImport: i0, type: MaterialDesignFramework, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.CssframeworkService }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLW1hdGVyaWFsL3NyYy9saWIvbWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxZQUFZLEVBQXVCLE1BQU0scUJBQXFCLENBQUM7QUFDeEUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDL0UsT0FBTyxFQUNMLHVCQUF1QixFQUN2QiwwQkFBMEIsRUFDMUIsNkJBQTZCLEVBQzdCLHVCQUF1QixFQUN2Qiw0QkFBNEIsRUFDNUIseUJBQXlCLEVBQ3pCLDJCQUEyQixFQUMzQix5QkFBeUIsRUFDekIsMkJBQTJCLEVBQzNCLGdDQUFnQyxFQUNoQyxxQkFBcUIsRUFDckIsc0JBQXNCLEVBQ3RCLHVCQUF1QixFQUN2QixzQkFBc0IsRUFDdEIsdUJBQXVCLEVBQ3ZCLHVCQUF1QixFQUN2Qix1QkFBdUIsRUFDdkIsd0JBQXdCLEVBQ3hCLHFCQUFxQixFQUNyQix5QkFBeUIsRUFDMUIsTUFBTSxzQkFBc0IsQ0FBQzs7O0FBRzlCLDRCQUE0QjtBQUM1Qix1Q0FBdUM7QUFHdkMsTUFBTSxPQUFPLHVCQUF3QixTQUFRLFlBQVk7SUE2Q3ZELFlBQW1CLFlBQWdDO1FBQ2pELEtBQUssQ0FBQyw2QkFBNkIsRUFBQyxZQUFZLENBQUMsQ0FBQztRQURqQyxpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUE1Q25ELFNBQUksR0FBRyxpQkFBaUIsQ0FBQztRQUV6QixjQUFTLEdBQUcsZ0NBQWdDLENBQUM7UUFFN0MsZ0JBQVcsR0FBRztZQUNaLG1EQUFtRDtZQUNuRCwwREFBMEQ7U0FDM0QsQ0FBQztRQUVGLGFBQVEsR0FBRztZQUNULE1BQU0sRUFBRSx1QkFBdUI7WUFDL0IsU0FBUyxFQUFFLDBCQUEwQjtZQUNyQyxNQUFNLEVBQUUsNkJBQTZCO1lBQ3JDLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsY0FBYyxFQUFFLDRCQUE0QjtZQUM1QyxVQUFVLEVBQUUseUJBQXlCO1lBQ3JDLFlBQVksRUFBRSwyQkFBMkI7WUFDekMsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxNQUFNLEVBQUUsMkJBQTJCO1lBQ25DLE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxRQUFRLEVBQUUsc0JBQXNCO1lBQ2hDLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLFNBQVMsRUFBRSx3QkFBd0I7WUFDbkMsTUFBTSxFQUFFLHFCQUFxQjtZQUM3QixNQUFNLEVBQUUsc0JBQXNCO1lBQzlCLFVBQVUsRUFBRSx5QkFBeUI7WUFDckMsVUFBVSxFQUFFLE1BQU07WUFDbEIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsTUFBTSxFQUFFLFNBQVM7WUFDakIsT0FBTyxFQUFFLE1BQU07WUFDZixpQkFBaUIsRUFBRSxTQUFTO1lBQzVCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLE9BQU8sRUFBRSxNQUFNO1lBQ2YsU0FBUyxFQUFFLFFBQVE7WUFDbkIsY0FBYyxFQUFFLGNBQWM7WUFDOUIsT0FBTyxFQUFFLFFBQVE7WUFDakIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsUUFBUSxFQUFFLFNBQVM7U0FDcEIsQ0FBQztRQUlBLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQTtJQUM1QixDQUFDOzhHQWhEVSx1QkFBdUI7a0hBQXZCLHVCQUF1Qjs7MkZBQXZCLHVCQUF1QjtrQkFEbkMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENzc0ZyYW1ld29yaywgQ3NzZnJhbWV3b3JrU2VydmljZSB9IGZyb20gJ0B6YWpzZi9jc3NmcmFtZXdvcmsnO1xuaW1wb3J0IHsgY3NzRnJhbWV3b3JrQ2ZnTWF0ZXJpYWxEZXNpZ24gfSBmcm9tICcuL21hdGVyaWFsLWRlc2lnbi1jc3NmcmFtZXdvcmsnO1xuaW1wb3J0IHtcbiAgRmxleExheW91dFJvb3RDb21wb25lbnQsXG4gIEZsZXhMYXlvdXRTZWN0aW9uQ29tcG9uZW50LFxuICBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCxcbiAgTWF0ZXJpYWxCdXR0b25Db21wb25lbnQsXG4gIE1hdGVyaWFsQnV0dG9uR3JvdXBDb21wb25lbnQsXG4gIE1hdGVyaWFsQ2hlY2tib3hDb21wb25lbnQsXG4gIE1hdGVyaWFsQ2hlY2tib3hlc0NvbXBvbmVudCxcbiAgTWF0ZXJpYWxDaGlwTGlzdENvbXBvbmVudCxcbiAgTWF0ZXJpYWxEYXRlcGlja2VyQ29tcG9uZW50LFxuICBNYXRlcmlhbERlc2lnbkZyYW1ld29ya0NvbXBvbmVudCxcbiAgTWF0ZXJpYWxGaWxlQ29tcG9uZW50LFxuICBNYXRlcmlhbElucHV0Q29tcG9uZW50LFxuICBNYXRlcmlhbE51bWJlckNvbXBvbmVudCxcbiAgTWF0ZXJpYWxPbmVPZkNvbXBvbmVudCxcbiAgTWF0ZXJpYWxSYWRpb3NDb21wb25lbnQsXG4gIE1hdGVyaWFsU2VsZWN0Q29tcG9uZW50LFxuICBNYXRlcmlhbFNsaWRlckNvbXBvbmVudCxcbiAgTWF0ZXJpYWxTdGVwcGVyQ29tcG9uZW50LFxuICBNYXRlcmlhbFRhYnNDb21wb25lbnQsXG4gIE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnRcbn0gZnJvbSAnLi93aWRnZXRzL3B1YmxpY19hcGknO1xuXG5cbi8vIE1hdGVyaWFsIERlc2lnbiBGcmFtZXdvcmtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMlxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmsgZXh0ZW5kcyBDc3NGcmFtZXdvcmsge1xuICBuYW1lID0gJ21hdGVyaWFsLWRlc2lnbic7XG5cbiAgZnJhbWV3b3JrID0gTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmtDb21wb25lbnQ7XG5cbiAgc3R5bGVzaGVldHMgPSBbXG4gICAgJy8vZm9udHMuZ29vZ2xlYXBpcy5jb20vaWNvbj9mYW1pbHk9TWF0ZXJpYWwrSWNvbnMnLFxuICAgICcvL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2Nzcz9mYW1pbHk9Um9ib3RvOjMwMCw0MDAsNTAwLDcwMCcsXG4gIF07XG5cbiAgX3dpZGdldHMgPSB7XG4gICAgJ3Jvb3QnOiBGbGV4TGF5b3V0Um9vdENvbXBvbmVudCxcbiAgICAnc2VjdGlvbic6IEZsZXhMYXlvdXRTZWN0aW9uQ29tcG9uZW50LFxuICAgICckcmVmJzogTWF0ZXJpYWxBZGRSZWZlcmVuY2VDb21wb25lbnQsXG4gICAgJ2J1dHRvbic6IE1hdGVyaWFsQnV0dG9uQ29tcG9uZW50LFxuICAgICdidXR0b24tZ3JvdXAnOiBNYXRlcmlhbEJ1dHRvbkdyb3VwQ29tcG9uZW50LFxuICAgICdjaGVja2JveCc6IE1hdGVyaWFsQ2hlY2tib3hDb21wb25lbnQsXG4gICAgJ2NoZWNrYm94ZXMnOiBNYXRlcmlhbENoZWNrYm94ZXNDb21wb25lbnQsXG4gICAgJ2NoaXAtbGlzdCc6IE1hdGVyaWFsQ2hpcExpc3RDb21wb25lbnQsXG4gICAgJ2RhdGUnOiBNYXRlcmlhbERhdGVwaWNrZXJDb21wb25lbnQsXG4gICAgJ2ZpbGUnOiBNYXRlcmlhbEZpbGVDb21wb25lbnQsXG4gICAgJ251bWJlcic6IE1hdGVyaWFsTnVtYmVyQ29tcG9uZW50LFxuICAgICdvbmUtb2YnOiBNYXRlcmlhbE9uZU9mQ29tcG9uZW50LFxuICAgICdyYWRpb3MnOiBNYXRlcmlhbFJhZGlvc0NvbXBvbmVudCxcbiAgICAnc2VsZWN0JzogTWF0ZXJpYWxTZWxlY3RDb21wb25lbnQsXG4gICAgJ3NsaWRlcic6IE1hdGVyaWFsU2xpZGVyQ29tcG9uZW50LFxuICAgICdzdGVwcGVyJzogTWF0ZXJpYWxTdGVwcGVyQ29tcG9uZW50LFxuICAgICd0YWJzJzogTWF0ZXJpYWxUYWJzQ29tcG9uZW50LFxuICAgICd0ZXh0JzogTWF0ZXJpYWxJbnB1dENvbXBvbmVudCxcbiAgICAndGV4dGFyZWEnOiBNYXRlcmlhbFRleHRhcmVhQ29tcG9uZW50LFxuICAgICdhbHQtZGF0ZSc6ICdkYXRlJyxcbiAgICAnYW55LW9mJzogJ29uZS1vZicsXG4gICAgJ2NhcmQnOiAnc2VjdGlvbicsXG4gICAgJ2NvbG9yJzogJ3RleHQnLFxuICAgICdleHBhbnNpb24tcGFuZWwnOiAnc2VjdGlvbicsXG4gICAgJ2hpZGRlbic6ICdub25lJyxcbiAgICAnaW1hZ2UnOiAnbm9uZScsXG4gICAgJ2ludGVnZXInOiAnbnVtYmVyJyxcbiAgICAncmFkaW9idXR0b25zJzogJ2J1dHRvbi1ncm91cCcsXG4gICAgJ3JhbmdlJzogJ3NsaWRlcicsXG4gICAgJ3N1Ym1pdCc6ICdidXR0b24nLFxuICAgICd0YWdzaW5wdXQnOiAnY2hpcC1saXN0JyxcbiAgICAnd2l6YXJkJzogJ3N0ZXBwZXInLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjc3NGV1NlcnZpY2U6Q3NzZnJhbWV3b3JrU2VydmljZSl7XG4gICAgc3VwZXIoY3NzRnJhbWV3b3JrQ2ZnTWF0ZXJpYWxEZXNpZ24sY3NzRldTZXJ2aWNlKTtcbiAgICB0aGlzLndpZGdldHM9dGhpcy5fd2lkZ2V0c1xuICB9XG5cblxufVxuIl19