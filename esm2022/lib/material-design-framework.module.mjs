import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Framework, FrameworkLibraryService, JsonSchemaFormModule, JsonSchemaFormService, WidgetLibraryModule, WidgetLibraryService } from '@zajsf/core';
import { CssFrameworkModule } from '@zajsf/cssframework';
import { MaterialDesignFramework } from './material-design.framework';
import { MATERIAL_FRAMEWORK_COMPONENTS } from './widgets/public_api';
import * as i0 from "@angular/core";
import * as i1 from "./widgets/flex-layout-root.component";
import * as i2 from "./widgets/flex-layout-section.component";
import * as i3 from "./widgets/material-add-reference.component";
import * as i4 from "./widgets/material-one-of.component";
import * as i5 from "./widgets/material-button.component";
import * as i6 from "./widgets/material-button-group.component";
import * as i7 from "./widgets/material-checkbox.component";
import * as i8 from "./widgets/material-checkboxes.component";
import * as i9 from "./widgets/material-chip-list.component";
import * as i10 from "./widgets/material-datepicker.component";
import * as i11 from "./widgets/material-file.component";
import * as i12 from "./widgets/material-input.component";
import * as i13 from "./widgets/material-number.component";
import * as i14 from "./widgets/material-radios.component";
import * as i15 from "./widgets/material-select.component";
import * as i16 from "./widgets/material-slider.component";
import * as i17 from "./widgets/material-stepper.component";
import * as i18 from "./widgets/material-tabs.component";
import * as i19 from "./widgets/material-textarea.component";
import * as i20 from "./material-design-framework.component";
/**
 * unused @angular/material modules:
 * MatDialogModule, MatGridListModule, MatListModule, MatMenuModule,
 * MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
 * MatSidenavModule, MatSnackBarModule, MatSortModule, MatTableModule,
 * ,
 */
export const ANGULAR_MATERIAL_MODULES = [
    MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule,
    MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
    MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
    MatStepperModule, MatTabsModule, MatTooltipModule,
    MatToolbarModule, MatMenuModule, MatToolbarModule,
];
export class MaterialDesignFrameworkModule {
    constructor() {
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: MaterialDesignFrameworkModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.4", ngImport: i0, type: MaterialDesignFrameworkModule, declarations: [i1.FlexLayoutRootComponent, i2.FlexLayoutSectionComponent, i3.MaterialAddReferenceComponent, i4.MaterialOneOfComponent, i5.MaterialButtonComponent, i6.MaterialButtonGroupComponent, i7.MaterialCheckboxComponent, i8.MaterialCheckboxesComponent, i9.MaterialChipListComponent, i10.MaterialDatepickerComponent, i11.MaterialFileComponent, i12.MaterialInputComponent, i13.MaterialNumberComponent, i14.MaterialRadiosComponent, i15.MaterialSelectComponent, i16.MaterialSliderComponent, i17.MaterialStepperComponent, i18.MaterialTabsComponent, i19.MaterialTextareaComponent, i20.MaterialDesignFrameworkComponent], imports: [CommonModule,
            FormsModule,
            ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule,
            MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule,
            MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
            MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
            MatStepperModule, MatTabsModule, MatTooltipModule,
            MatToolbarModule, MatMenuModule, MatToolbarModule, WidgetLibraryModule,
            JsonSchemaFormModule,
            CssFrameworkModule], exports: [JsonSchemaFormModule, i1.FlexLayoutRootComponent, i2.FlexLayoutSectionComponent, i3.MaterialAddReferenceComponent, i4.MaterialOneOfComponent, i5.MaterialButtonComponent, i6.MaterialButtonGroupComponent, i7.MaterialCheckboxComponent, i8.MaterialCheckboxesComponent, i9.MaterialChipListComponent, i10.MaterialDatepickerComponent, i11.MaterialFileComponent, i12.MaterialInputComponent, i13.MaterialNumberComponent, i14.MaterialRadiosComponent, i15.MaterialSelectComponent, i16.MaterialSliderComponent, i17.MaterialStepperComponent, i18.MaterialTabsComponent, i19.MaterialTextareaComponent, i20.MaterialDesignFrameworkComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: MaterialDesignFrameworkModule, providers: [
            JsonSchemaFormService,
            FrameworkLibraryService,
            WidgetLibraryService,
            { provide: Framework, useClass: MaterialDesignFramework, multi: true },
        ], imports: [CommonModule,
            FormsModule,
            ReactiveFormsModule, ANGULAR_MATERIAL_MODULES, WidgetLibraryModule,
            JsonSchemaFormModule,
            CssFrameworkModule, JsonSchemaFormModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: MaterialDesignFrameworkModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        ...ANGULAR_MATERIAL_MODULES,
                        WidgetLibraryModule,
                        JsonSchemaFormModule,
                        CssFrameworkModule
                    ],
                    declarations: [
                        ...MATERIAL_FRAMEWORK_COMPONENTS,
                    ],
                    exports: [
                        JsonSchemaFormModule,
                        ...MATERIAL_FRAMEWORK_COMPONENTS,
                    ],
                    providers: [
                        JsonSchemaFormService,
                        FrameworkLibraryService,
                        WidgetLibraryService,
                        { provide: Framework, useClass: MaterialDesignFramework, multi: true },
                    ]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1tYXRlcmlhbC9zcmMvbGliL21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDeEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0Is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QkFBNkI7cUJBQ25DO29CQUNELFNBQVMsRUFBRTt3QkFDUCxxQkFBcUI7d0JBQ3JCLHVCQUF1Qjt3QkFDdkIsb0JBQW9CO3dCQUNwQixFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7cUJBQ3pFO2lCQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE1hdEF1dG9jb21wbGV0ZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2F1dG9jb21wbGV0ZSc7XG5pbXBvcnQgeyBNYXRCdXR0b25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xuaW1wb3J0IHsgTWF0QnV0dG9uVG9nZ2xlTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uLXRvZ2dsZSc7XG5pbXBvcnQgeyBNYXRDYXJkTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2FyZCc7XG5pbXBvcnQgeyBNYXRDaGVja2JveE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NoZWNrYm94JztcbmltcG9ydCB7IE1hdENoaXBzTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2hpcHMnO1xuaW1wb3J0IHsgTWF0TmF0aXZlRGF0ZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHsgTWF0RGF0ZXBpY2tlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RhdGVwaWNrZXInO1xuaW1wb3J0IHsgTWF0RXhwYW5zaW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZXhwYW5zaW9uJztcbmltcG9ydCB7IE1hdEZvcm1GaWVsZE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQnO1xuaW1wb3J0IHsgTWF0SWNvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nO1xuaW1wb3J0IHsgTWF0SW5wdXRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dCc7XG5pbXBvcnQgeyBNYXRNZW51TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbWVudSc7XG5pbXBvcnQgeyBNYXRSYWRpb01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3JhZGlvJztcbmltcG9ydCB7IE1hdFNlbGVjdE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NlbGVjdCc7XG5pbXBvcnQgeyBNYXRTbGlkZVRvZ2dsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NsaWRlLXRvZ2dsZSc7XG5pbXBvcnQgeyBNYXRTbGlkZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zbGlkZXInO1xuaW1wb3J0IHsgTWF0U3RlcHBlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3N0ZXBwZXInO1xuaW1wb3J0IHsgTWF0VGFic01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3RhYnMnO1xuaW1wb3J0IHsgTWF0VG9vbGJhck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3Rvb2xiYXInO1xuaW1wb3J0IHsgTWF0VG9vbHRpcE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3Rvb2x0aXAnO1xuaW1wb3J0IHtcbiAgICBGcmFtZXdvcmssXG4gICAgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UsXG4gICAgSnNvblNjaGVtYUZvcm1Nb2R1bGUsXG4gICAgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICAgIFdpZGdldExpYnJhcnlNb2R1bGUsIFdpZGdldExpYnJhcnlTZXJ2aWNlXG59IGZyb20gJ0B6YWpzZi9jb3JlJztcbmltcG9ydCB7IENzc0ZyYW1ld29ya01vZHVsZSB9IGZyb20gJ0B6YWpzZi9jc3NmcmFtZXdvcmsnO1xuaW1wb3J0IHsgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmsgfSBmcm9tICcuL21hdGVyaWFsLWRlc2lnbi5mcmFtZXdvcmsnO1xuaW1wb3J0IHsgTUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFMgfSBmcm9tICcuL3dpZGdldHMvcHVibGljX2FwaSc7XG5cblxuLyoqXG4gKiB1bnVzZWQgQGFuZ3VsYXIvbWF0ZXJpYWwgbW9kdWxlczpcbiAqIE1hdERpYWxvZ01vZHVsZSwgTWF0R3JpZExpc3RNb2R1bGUsIE1hdExpc3RNb2R1bGUsIE1hdE1lbnVNb2R1bGUsXG4gKiBNYXRQYWdpbmF0b3JNb2R1bGUsIE1hdFByb2dyZXNzQmFyTW9kdWxlLCBNYXRQcm9ncmVzc1NwaW5uZXJNb2R1bGUsXG4gKiBNYXRTaWRlbmF2TW9kdWxlLCBNYXRTbmFja0Jhck1vZHVsZSwgTWF0U29ydE1vZHVsZSwgTWF0VGFibGVNb2R1bGUsXG4gKiAsXG4gKi9cbmV4cG9ydCBjb25zdCBBTkdVTEFSX01BVEVSSUFMX01PRFVMRVMgPSBbXG4gIE1hdEF1dG9jb21wbGV0ZU1vZHVsZSwgTWF0QnV0dG9uTW9kdWxlLCBNYXRCdXR0b25Ub2dnbGVNb2R1bGUsIE1hdENhcmRNb2R1bGUsXG4gIE1hdENoZWNrYm94TW9kdWxlLCBNYXRDaGlwc01vZHVsZSwgTWF0RGF0ZXBpY2tlck1vZHVsZSwgTWF0RXhwYW5zaW9uTW9kdWxlLFxuICBNYXRGb3JtRmllbGRNb2R1bGUsIE1hdEljb25Nb2R1bGUsIE1hdElucHV0TW9kdWxlLCBNYXROYXRpdmVEYXRlTW9kdWxlLFxuICBNYXRSYWRpb01vZHVsZSwgTWF0U2VsZWN0TW9kdWxlLCBNYXRTbGlkZXJNb2R1bGUsIE1hdFNsaWRlVG9nZ2xlTW9kdWxlLFxuICBNYXRTdGVwcGVyTW9kdWxlLCBNYXRUYWJzTW9kdWxlLCBNYXRUb29sdGlwTW9kdWxlLFxuICBNYXRUb29sYmFyTW9kdWxlLCBNYXRNZW51TW9kdWxlLCBNYXRUb29sYmFyTW9kdWxlLFxuXTtcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZSxcbiAgICAgICAgRm9ybXNNb2R1bGUsXG4gICAgICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgICAgIC4uLkFOR1VMQVJfTUFURVJJQUxfTU9EVUxFUyxcbiAgICAgICAgV2lkZ2V0TGlicmFyeU1vZHVsZSxcbiAgICAgICAgSnNvblNjaGVtYUZvcm1Nb2R1bGUsXG4gICAgICAgIENzc0ZyYW1ld29ya01vZHVsZVxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIC4uLk1BVEVSSUFMX0ZSQU1FV09SS19DT01QT05FTlRTLFxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICAgICAgLi4uTUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFMsXG4gICAgXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICAgICAgICBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICAgICAgV2lkZ2V0TGlicmFyeVNlcnZpY2UsXG4gICAgICAgIHsgcHJvdmlkZTogRnJhbWV3b3JrLCB1c2VDbGFzczogTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmssIG11bHRpOiB0cnVlIH0sXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbERlc2lnbkZyYW1ld29ya01vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuXG4gIH1cbn1cbiJdfQ==