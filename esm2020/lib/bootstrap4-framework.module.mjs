import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Framework, FrameworkLibraryService, JsonSchemaFormModule, JsonSchemaFormService, WidgetLibraryModule, WidgetLibraryService } from '@zajsf/core';
import { Bootstrap4FrameworkComponent } from './bootstrap4-framework.component';
import { Bootstrap4Framework } from './bootstrap4.framework';
import * as i0 from "@angular/core";
export class Bootstrap4FrameworkModule {
}
Bootstrap4FrameworkModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap4FrameworkModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Bootstrap4FrameworkModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap4FrameworkModule, declarations: [Bootstrap4FrameworkComponent], imports: [JsonSchemaFormModule,
        CommonModule,
        WidgetLibraryModule], exports: [JsonSchemaFormModule,
        Bootstrap4FrameworkComponent] });
Bootstrap4FrameworkModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap4FrameworkModule, providers: [
        JsonSchemaFormService,
        FrameworkLibraryService,
        WidgetLibraryService,
        { provide: Framework, useClass: Bootstrap4Framework, multi: true },
    ], imports: [JsonSchemaFormModule,
        CommonModule,
        WidgetLibraryModule, JsonSchemaFormModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap4FrameworkModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        JsonSchemaFormModule,
                        CommonModule,
                        WidgetLibraryModule,
                    ],
                    declarations: [
                        Bootstrap4FrameworkComponent,
                    ],
                    exports: [
                        JsonSchemaFormModule,
                        Bootstrap4FrameworkComponent,
                    ],
                    providers: [
                        JsonSchemaFormService,
                        FrameworkLibraryService,
                        WidgetLibraryService,
                        { provide: Framework, useClass: Bootstrap4Framework, multi: true },
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwNC1mcmFtZXdvcmsubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtYm9vdHN0cmFwNC9zcmMvbGliL2Jvb3RzdHJhcDQtZnJhbWV3b3JrLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQ0gsU0FBUyxFQUNULHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIscUJBQXFCLEVBQ3JCLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDdkIsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDaEYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7O0FBc0I3RCxNQUFNLE9BQU8seUJBQXlCOztzSEFBekIseUJBQXlCO3VIQUF6Qix5QkFBeUIsaUJBYjlCLDRCQUE0QixhQUw1QixvQkFBb0I7UUFDcEIsWUFBWTtRQUNaLG1CQUFtQixhQU1uQixvQkFBb0I7UUFDcEIsNEJBQTRCO3VIQVN2Qix5QkFBeUIsYUFQdkI7UUFDUCxxQkFBcUI7UUFDckIsdUJBQXVCO1FBQ3ZCLG9CQUFvQjtRQUNwQixFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7S0FDckUsWUFoQkcsb0JBQW9CO1FBQ3BCLFlBQVk7UUFDWixtQkFBbUIsRUFNbkIsb0JBQW9COzJGQVVmLHlCQUF5QjtrQkFwQnJDLFFBQVE7bUJBQUM7b0JBQ04sT0FBTyxFQUFFO3dCQUNMLG9CQUFvQjt3QkFDcEIsWUFBWTt3QkFDWixtQkFBbUI7cUJBQ3RCO29CQUNELFlBQVksRUFBRTt3QkFDViw0QkFBNEI7cUJBQy9CO29CQUNELE9BQU8sRUFBRTt3QkFDTCxvQkFBb0I7d0JBQ3BCLDRCQUE0QjtxQkFDL0I7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLHFCQUFxQjt3QkFDckIsdUJBQXVCO3dCQUN2QixvQkFBb0I7d0JBQ3BCLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtxQkFDckU7aUJBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gICAgRnJhbWV3b3JrLFxuICAgIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLFxuICAgIEpzb25TY2hlbWFGb3JtTW9kdWxlLFxuICAgIEpzb25TY2hlbWFGb3JtU2VydmljZSxcbiAgICBXaWRnZXRMaWJyYXJ5TW9kdWxlLFxuICAgIFdpZGdldExpYnJhcnlTZXJ2aWNlXG59IGZyb20gJ0B6YWpzZi9jb3JlJztcbmltcG9ydCB7IEJvb3RzdHJhcDRGcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL2Jvb3RzdHJhcDQtZnJhbWV3b3JrLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBCb290c3RyYXA0RnJhbWV3b3JrIH0gZnJvbSAnLi9ib290c3RyYXA0LmZyYW1ld29yayc7XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW1xuICAgICAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICAgICAgQ29tbW9uTW9kdWxlLFxuICAgICAgICBXaWRnZXRMaWJyYXJ5TW9kdWxlLFxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIEJvb3RzdHJhcDRGcmFtZXdvcmtDb21wb25lbnQsXG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIEpzb25TY2hlbWFGb3JtTW9kdWxlLFxuICAgICAgICBCb290c3RyYXA0RnJhbWV3b3JrQ29tcG9uZW50LFxuICAgIF0sXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEpzb25TY2hlbWFGb3JtU2VydmljZSxcbiAgICAgICAgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UsXG4gICAgICAgIFdpZGdldExpYnJhcnlTZXJ2aWNlLFxuICAgICAgICB7IHByb3ZpZGU6IEZyYW1ld29yaywgdXNlQ2xhc3M6IEJvb3RzdHJhcDRGcmFtZXdvcmssIG11bHRpOiB0cnVlIH0sXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBCb290c3RyYXA0RnJhbWV3b3JrTW9kdWxlIHtcbn1cbiJdfQ==