import { Injectable } from '@angular/core';
import { Framework } from '@zajsf/core';
import { FlexLayoutRootComponent, FlexLayoutSectionComponent, MaterialAddReferenceComponent, MaterialButtonComponent, MaterialButtonGroupComponent, MaterialCheckboxComponent, MaterialCheckboxesComponent, MaterialChipListComponent, MaterialDatepickerComponent, MaterialDesignFrameworkComponent, MaterialFileComponent, MaterialInputComponent, MaterialNumberComponent, MaterialOneOfComponent, MaterialRadiosComponent, MaterialSelectComponent, MaterialSliderComponent, MaterialStepperComponent, MaterialTabsComponent, MaterialTextareaComponent } from './widgets/public_api';
import * as i0 from "@angular/core";
// Material Design Framework
// https://github.com/angular/material2
export class MaterialDesignFramework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'material-design';
        this.framework = MaterialDesignFrameworkComponent;
        this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        this.widgets = {
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
    }
}
MaterialDesignFramework.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFramework, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
MaterialDesignFramework.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFramework });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFramework, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLW1hdGVyaWFsL3NyYy9saWIvbWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUNILHVCQUF1QixFQUN2QiwwQkFBMEIsRUFDMUIsNkJBQTZCLEVBQzdCLHVCQUF1QixFQUN2Qiw0QkFBNEIsRUFDNUIseUJBQXlCLEVBQ3pCLDJCQUEyQixFQUMzQix5QkFBeUIsRUFDekIsMkJBQTJCLEVBQzNCLGdDQUFnQyxFQUNoQyxxQkFBcUIsRUFDckIsc0JBQXNCLEVBQ3RCLHVCQUF1QixFQUN2QixzQkFBc0IsRUFDdEIsdUJBQXVCLEVBQ3ZCLHVCQUF1QixFQUN2Qix1QkFBdUIsRUFDdkIsd0JBQXdCLEVBQ3hCLHFCQUFxQixFQUNyQix5QkFBeUIsRUFDNUIsTUFBTSxzQkFBc0IsQ0FBQzs7QUFHOUIsNEJBQTRCO0FBQzVCLHVDQUF1QztBQUd2QyxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsU0FBUztJQUR0RDs7UUFFRSxTQUFJLEdBQUcsaUJBQWlCLENBQUM7UUFFekIsY0FBUyxHQUFHLGdDQUFnQyxDQUFDO1FBRTdDLGdCQUFXLEdBQUc7WUFDWixtREFBbUQ7WUFDbkQsMERBQTBEO1NBQzNELENBQUM7UUFFRixZQUFPLEdBQUc7WUFDUixNQUFNLEVBQUUsdUJBQXVCO1lBQy9CLFNBQVMsRUFBRSwwQkFBMEI7WUFDckMsTUFBTSxFQUFFLDZCQUE2QjtZQUNyQyxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLGNBQWMsRUFBRSw0QkFBNEI7WUFDNUMsVUFBVSxFQUFFLHlCQUF5QjtZQUNyQyxZQUFZLEVBQUUsMkJBQTJCO1lBQ3pDLFdBQVcsRUFBRSx5QkFBeUI7WUFDdEMsTUFBTSxFQUFFLDJCQUEyQjtZQUNuQyxNQUFNLEVBQUUscUJBQXFCO1lBQzdCLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsUUFBUSxFQUFFLHNCQUFzQjtZQUNoQyxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxTQUFTLEVBQUUsd0JBQXdCO1lBQ25DLE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsTUFBTSxFQUFFLHNCQUFzQjtZQUM5QixVQUFVLEVBQUUseUJBQXlCO1lBQ3JDLFVBQVUsRUFBRSxNQUFNO1lBQ2xCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLE9BQU8sRUFBRSxNQUFNO1lBQ2YsaUJBQWlCLEVBQUUsU0FBUztZQUM1QixRQUFRLEVBQUUsTUFBTTtZQUNoQixPQUFPLEVBQUUsTUFBTTtZQUNmLFNBQVMsRUFBRSxRQUFRO1lBQ25CLGNBQWMsRUFBRSxjQUFjO1lBQzlCLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFFBQVEsRUFBRSxTQUFTO1NBQ3BCLENBQUM7S0FDSDs7b0hBNUNZLHVCQUF1Qjt3SEFBdkIsdUJBQXVCOzJGQUF2Qix1QkFBdUI7a0JBRG5DLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGcmFtZXdvcmsgfSBmcm9tICdAemFqc2YvY29yZSc7XG5pbXBvcnQge1xuICAgIEZsZXhMYXlvdXRSb290Q29tcG9uZW50LFxuICAgIEZsZXhMYXlvdXRTZWN0aW9uQ29tcG9uZW50LFxuICAgIE1hdGVyaWFsQWRkUmVmZXJlbmNlQ29tcG9uZW50LFxuICAgIE1hdGVyaWFsQnV0dG9uQ29tcG9uZW50LFxuICAgIE1hdGVyaWFsQnV0dG9uR3JvdXBDb21wb25lbnQsXG4gICAgTWF0ZXJpYWxDaGVja2JveENvbXBvbmVudCxcbiAgICBNYXRlcmlhbENoZWNrYm94ZXNDb21wb25lbnQsXG4gICAgTWF0ZXJpYWxDaGlwTGlzdENvbXBvbmVudCxcbiAgICBNYXRlcmlhbERhdGVwaWNrZXJDb21wb25lbnQsXG4gICAgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmtDb21wb25lbnQsXG4gICAgTWF0ZXJpYWxGaWxlQ29tcG9uZW50LFxuICAgIE1hdGVyaWFsSW5wdXRDb21wb25lbnQsXG4gICAgTWF0ZXJpYWxOdW1iZXJDb21wb25lbnQsXG4gICAgTWF0ZXJpYWxPbmVPZkNvbXBvbmVudCxcbiAgICBNYXRlcmlhbFJhZGlvc0NvbXBvbmVudCxcbiAgICBNYXRlcmlhbFNlbGVjdENvbXBvbmVudCxcbiAgICBNYXRlcmlhbFNsaWRlckNvbXBvbmVudCxcbiAgICBNYXRlcmlhbFN0ZXBwZXJDb21wb25lbnQsXG4gICAgTWF0ZXJpYWxUYWJzQ29tcG9uZW50LFxuICAgIE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnRcbn0gZnJvbSAnLi93aWRnZXRzL3B1YmxpY19hcGknO1xuXG5cbi8vIE1hdGVyaWFsIERlc2lnbiBGcmFtZXdvcmtcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL21hdGVyaWFsMlxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmsgZXh0ZW5kcyBGcmFtZXdvcmsge1xuICBuYW1lID0gJ21hdGVyaWFsLWRlc2lnbic7XG5cbiAgZnJhbWV3b3JrID0gTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmtDb21wb25lbnQ7XG5cbiAgc3R5bGVzaGVldHMgPSBbXG4gICAgJy8vZm9udHMuZ29vZ2xlYXBpcy5jb20vaWNvbj9mYW1pbHk9TWF0ZXJpYWwrSWNvbnMnLFxuICAgICcvL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2Nzcz9mYW1pbHk9Um9ib3RvOjMwMCw0MDAsNTAwLDcwMCcsXG4gIF07XG5cbiAgd2lkZ2V0cyA9IHtcbiAgICAncm9vdCc6IEZsZXhMYXlvdXRSb290Q29tcG9uZW50LFxuICAgICdzZWN0aW9uJzogRmxleExheW91dFNlY3Rpb25Db21wb25lbnQsXG4gICAgJyRyZWYnOiBNYXRlcmlhbEFkZFJlZmVyZW5jZUNvbXBvbmVudCxcbiAgICAnYnV0dG9uJzogTWF0ZXJpYWxCdXR0b25Db21wb25lbnQsXG4gICAgJ2J1dHRvbi1ncm91cCc6IE1hdGVyaWFsQnV0dG9uR3JvdXBDb21wb25lbnQsXG4gICAgJ2NoZWNrYm94JzogTWF0ZXJpYWxDaGVja2JveENvbXBvbmVudCxcbiAgICAnY2hlY2tib3hlcyc6IE1hdGVyaWFsQ2hlY2tib3hlc0NvbXBvbmVudCxcbiAgICAnY2hpcC1saXN0JzogTWF0ZXJpYWxDaGlwTGlzdENvbXBvbmVudCxcbiAgICAnZGF0ZSc6IE1hdGVyaWFsRGF0ZXBpY2tlckNvbXBvbmVudCxcbiAgICAnZmlsZSc6IE1hdGVyaWFsRmlsZUNvbXBvbmVudCxcbiAgICAnbnVtYmVyJzogTWF0ZXJpYWxOdW1iZXJDb21wb25lbnQsXG4gICAgJ29uZS1vZic6IE1hdGVyaWFsT25lT2ZDb21wb25lbnQsXG4gICAgJ3JhZGlvcyc6IE1hdGVyaWFsUmFkaW9zQ29tcG9uZW50LFxuICAgICdzZWxlY3QnOiBNYXRlcmlhbFNlbGVjdENvbXBvbmVudCxcbiAgICAnc2xpZGVyJzogTWF0ZXJpYWxTbGlkZXJDb21wb25lbnQsXG4gICAgJ3N0ZXBwZXInOiBNYXRlcmlhbFN0ZXBwZXJDb21wb25lbnQsXG4gICAgJ3RhYnMnOiBNYXRlcmlhbFRhYnNDb21wb25lbnQsXG4gICAgJ3RleHQnOiBNYXRlcmlhbElucHV0Q29tcG9uZW50LFxuICAgICd0ZXh0YXJlYSc6IE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnQsXG4gICAgJ2FsdC1kYXRlJzogJ2RhdGUnLFxuICAgICdhbnktb2YnOiAnb25lLW9mJyxcbiAgICAnY2FyZCc6ICdzZWN0aW9uJyxcbiAgICAnY29sb3InOiAndGV4dCcsXG4gICAgJ2V4cGFuc2lvbi1wYW5lbCc6ICdzZWN0aW9uJyxcbiAgICAnaGlkZGVuJzogJ25vbmUnLFxuICAgICdpbWFnZSc6ICdub25lJyxcbiAgICAnaW50ZWdlcic6ICdudW1iZXInLFxuICAgICdyYWRpb2J1dHRvbnMnOiAnYnV0dG9uLWdyb3VwJyxcbiAgICAncmFuZ2UnOiAnc2xpZGVyJyxcbiAgICAnc3VibWl0JzogJ2J1dHRvbicsXG4gICAgJ3RhZ3NpbnB1dCc6ICdjaGlwLWxpc3QnLFxuICAgICd3aXphcmQnOiAnc3RlcHBlcicsXG4gIH07XG59XG4iXX0=