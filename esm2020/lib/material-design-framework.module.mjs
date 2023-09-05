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
}
MaterialDesignFrameworkModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MaterialDesignFrameworkModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, declarations: [i1.FlexLayoutRootComponent, i2.FlexLayoutSectionComponent, i3.MaterialAddReferenceComponent, i4.MaterialOneOfComponent, i5.MaterialButtonComponent, i6.MaterialButtonGroupComponent, i7.MaterialCheckboxComponent, i8.MaterialCheckboxesComponent, i9.MaterialChipListComponent, i10.MaterialDatepickerComponent, i11.MaterialFileComponent, i12.MaterialInputComponent, i13.MaterialNumberComponent, i14.MaterialRadiosComponent, i15.MaterialSelectComponent, i16.MaterialSliderComponent, i17.MaterialStepperComponent, i18.MaterialTabsComponent, i19.MaterialTextareaComponent, i20.MaterialDesignFrameworkComponent], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule,
        MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
        MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
        MatStepperModule, MatTabsModule, MatTooltipModule,
        MatToolbarModule, MatMenuModule, MatToolbarModule, WidgetLibraryModule,
        JsonSchemaFormModule], exports: [JsonSchemaFormModule, i1.FlexLayoutRootComponent, i2.FlexLayoutSectionComponent, i3.MaterialAddReferenceComponent, i4.MaterialOneOfComponent, i5.MaterialButtonComponent, i6.MaterialButtonGroupComponent, i7.MaterialCheckboxComponent, i8.MaterialCheckboxesComponent, i9.MaterialChipListComponent, i10.MaterialDatepickerComponent, i11.MaterialFileComponent, i12.MaterialInputComponent, i13.MaterialNumberComponent, i14.MaterialRadiosComponent, i15.MaterialSelectComponent, i16.MaterialSliderComponent, i17.MaterialStepperComponent, i18.MaterialTabsComponent, i19.MaterialTextareaComponent, i20.MaterialDesignFrameworkComponent] });
MaterialDesignFrameworkModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, providers: [
        JsonSchemaFormService,
        FrameworkLibraryService,
        WidgetLibraryService,
        { provide: Framework, useClass: MaterialDesignFramework, multi: true },
    ], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule, ANGULAR_MATERIAL_MODULES, WidgetLibraryModule,
        JsonSchemaFormModule, JsonSchemaFormModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        ...ANGULAR_MATERIAL_MODULES,
                        WidgetLibraryModule,
                        JsonSchemaFormModule,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1tYXRlcmlhbC9zcmMvbGliL21hdGVyaWFsLWRlc2lnbi1mcmFtZXdvcmsubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDeEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0Is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TyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtxQkFDekU7aUJBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgTWF0QXV0b2NvbXBsZXRlTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYXV0b2NvbXBsZXRlJztcbmltcG9ydCB7IE1hdEJ1dHRvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbic7XG5pbXBvcnQgeyBNYXRCdXR0b25Ub2dnbGVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24tdG9nZ2xlJztcbmltcG9ydCB7IE1hdENhcmRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jYXJkJztcbmltcG9ydCB7IE1hdENoZWNrYm94TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2hlY2tib3gnO1xuaW1wb3J0IHsgTWF0Q2hpcHNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jaGlwcyc7XG5pbXBvcnQgeyBNYXROYXRpdmVEYXRlTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQgeyBNYXREYXRlcGlja2VyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGF0ZXBpY2tlcic7XG5pbXBvcnQgeyBNYXRFeHBhbnNpb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9leHBhbnNpb24nO1xuaW1wb3J0IHsgTWF0Rm9ybUZpZWxkTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZCc7XG5pbXBvcnQgeyBNYXRJY29uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbic7XG5pbXBvcnQgeyBNYXRJbnB1dE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2lucHV0JztcbmltcG9ydCB7IE1hdE1lbnVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9tZW51JztcbmltcG9ydCB7IE1hdFJhZGlvTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvcmFkaW8nO1xuaW1wb3J0IHsgTWF0U2VsZWN0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0JztcbmltcG9ydCB7IE1hdFNsaWRlVG9nZ2xlTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2xpZGUtdG9nZ2xlJztcbmltcG9ydCB7IE1hdFNsaWRlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NsaWRlcic7XG5pbXBvcnQgeyBNYXRTdGVwcGVyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc3RlcHBlcic7XG5pbXBvcnQgeyBNYXRUYWJzTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvdGFicyc7XG5pbXBvcnQgeyBNYXRUb29sYmFyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvdG9vbGJhcic7XG5pbXBvcnQgeyBNYXRUb29sdGlwTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvdG9vbHRpcCc7XG5pbXBvcnQge1xuICAgIEZyYW1ld29yayxcbiAgICBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICBKc29uU2NoZW1hRm9ybVNlcnZpY2UsXG4gICAgV2lkZ2V0TGlicmFyeU1vZHVsZSwgV2lkZ2V0TGlicmFyeVNlcnZpY2Vcbn0gZnJvbSAnQHphanNmL2NvcmUnO1xuaW1wb3J0IHsgTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmsgfSBmcm9tICcuL21hdGVyaWFsLWRlc2lnbi5mcmFtZXdvcmsnO1xuaW1wb3J0IHsgTUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFMgfSBmcm9tICcuL3dpZGdldHMvcHVibGljX2FwaSc7XG5cblxuLyoqXG4gKiB1bnVzZWQgQGFuZ3VsYXIvbWF0ZXJpYWwgbW9kdWxlczpcbiAqIE1hdERpYWxvZ01vZHVsZSwgTWF0R3JpZExpc3RNb2R1bGUsIE1hdExpc3RNb2R1bGUsIE1hdE1lbnVNb2R1bGUsXG4gKiBNYXRQYWdpbmF0b3JNb2R1bGUsIE1hdFByb2dyZXNzQmFyTW9kdWxlLCBNYXRQcm9ncmVzc1NwaW5uZXJNb2R1bGUsXG4gKiBNYXRTaWRlbmF2TW9kdWxlLCBNYXRTbmFja0Jhck1vZHVsZSwgTWF0U29ydE1vZHVsZSwgTWF0VGFibGVNb2R1bGUsXG4gKiAsXG4gKi9cbmV4cG9ydCBjb25zdCBBTkdVTEFSX01BVEVSSUFMX01PRFVMRVMgPSBbXG4gIE1hdEF1dG9jb21wbGV0ZU1vZHVsZSwgTWF0QnV0dG9uTW9kdWxlLCBNYXRCdXR0b25Ub2dnbGVNb2R1bGUsIE1hdENhcmRNb2R1bGUsXG4gIE1hdENoZWNrYm94TW9kdWxlLCBNYXRDaGlwc01vZHVsZSwgTWF0RGF0ZXBpY2tlck1vZHVsZSwgTWF0RXhwYW5zaW9uTW9kdWxlLFxuICBNYXRGb3JtRmllbGRNb2R1bGUsIE1hdEljb25Nb2R1bGUsIE1hdElucHV0TW9kdWxlLCBNYXROYXRpdmVEYXRlTW9kdWxlLFxuICBNYXRSYWRpb01vZHVsZSwgTWF0U2VsZWN0TW9kdWxlLCBNYXRTbGlkZXJNb2R1bGUsIE1hdFNsaWRlVG9nZ2xlTW9kdWxlLFxuICBNYXRTdGVwcGVyTW9kdWxlLCBNYXRUYWJzTW9kdWxlLCBNYXRUb29sdGlwTW9kdWxlLFxuICBNYXRUb29sYmFyTW9kdWxlLCBNYXRNZW51TW9kdWxlLCBNYXRUb29sYmFyTW9kdWxlLFxuXTtcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZSxcbiAgICAgICAgRm9ybXNNb2R1bGUsXG4gICAgICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgICAgIC4uLkFOR1VMQVJfTUFURVJJQUxfTU9EVUxFUyxcbiAgICAgICAgV2lkZ2V0TGlicmFyeU1vZHVsZSxcbiAgICAgICAgSnNvblNjaGVtYUZvcm1Nb2R1bGUsXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgLi4uTUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFMsXG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIEpzb25TY2hlbWFGb3JtTW9kdWxlLFxuICAgICAgICAuLi5NQVRFUklBTF9GUkFNRVdPUktfQ09NUE9ORU5UUyxcbiAgICBdLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBKc29uU2NoZW1hRm9ybVNlcnZpY2UsXG4gICAgICAgIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLFxuICAgICAgICBXaWRnZXRMaWJyYXJ5U2VydmljZSxcbiAgICAgICAgeyBwcm92aWRlOiBGcmFtZXdvcmssIHVzZUNsYXNzOiBNYXRlcmlhbERlc2lnbkZyYW1ld29yaywgbXVsdGk6IHRydWUgfSxcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsRGVzaWduRnJhbWV3b3JrTW9kdWxlIHtcbiAgY29uc3RydWN0b3IoKSB7XG5cbiAgfVxufVxuIl19