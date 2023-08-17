import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Framework, JsonSchemaFormService, WidgetLibraryService, FrameworkLibraryService, JsonSchemaFormModule, WidgetLibraryModule } from '@ajsf/core';
import { Bootstrap3Framework } from './bootstrap3.framework';
import { Bootstrap3FrameworkComponent } from './bootstrap3-framework.component';
import * as i0 from "@angular/core";
export class Bootstrap3FrameworkModule {
}
Bootstrap3FrameworkModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap3FrameworkModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Bootstrap3FrameworkModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap3FrameworkModule, declarations: [Bootstrap3FrameworkComponent], imports: [JsonSchemaFormModule,
        CommonModule,
        WidgetLibraryModule], exports: [JsonSchemaFormModule,
        Bootstrap3FrameworkComponent] });
Bootstrap3FrameworkModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap3FrameworkModule, providers: [
        JsonSchemaFormService,
        FrameworkLibraryService,
        WidgetLibraryService,
        { provide: Framework, useClass: Bootstrap3Framework, multi: true },
    ], imports: [JsonSchemaFormModule,
        CommonModule,
        WidgetLibraryModule, JsonSchemaFormModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: Bootstrap3FrameworkModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        JsonSchemaFormModule,
                        CommonModule,
                        WidgetLibraryModule,
                    ],
                    declarations: [
                        Bootstrap3FrameworkComponent,
                    ],
                    exports: [
                        JsonSchemaFormModule,
                        Bootstrap3FrameworkComponent,
                    ],
                    providers: [
                        JsonSchemaFormService,
                        FrameworkLibraryService,
                        WidgetLibraryService,
                        { provide: Framework, useClass: Bootstrap3Framework, multi: true },
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwMy1mcmFtZXdvcmsubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYWpzZi1ib290c3RyYXAzL3NyYy9saWIvYm9vdHN0cmFwMy1mcmFtZXdvcmsubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFDTCxTQUFTLEVBQ1QscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLG1CQUFtQixFQUNwQixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQzs7QUFzQjlFLE1BQU0sT0FBTyx5QkFBeUI7O3NIQUF6Qix5QkFBeUI7dUhBQXpCLHlCQUF5QixpQkFiOUIsNEJBQTRCLGFBTDVCLG9CQUFvQjtRQUNwQixZQUFZO1FBQ1osbUJBQW1CLGFBTW5CLG9CQUFvQjtRQUNwQiw0QkFBNEI7dUhBU3ZCLHlCQUF5QixhQVB2QjtRQUNQLHFCQUFxQjtRQUNyQix1QkFBdUI7UUFDdkIsb0JBQW9CO1FBQ3BCLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtLQUNyRSxZQWhCRyxvQkFBb0I7UUFDcEIsWUFBWTtRQUNaLG1CQUFtQixFQU1uQixvQkFBb0I7MkZBVWYseUJBQXlCO2tCQXBCckMsUUFBUTttQkFBQztvQkFDTixPQUFPLEVBQUU7d0JBQ0wsb0JBQW9CO3dCQUNwQixZQUFZO3dCQUNaLG1CQUFtQjtxQkFDdEI7b0JBQ0QsWUFBWSxFQUFFO3dCQUNWLDRCQUE0QjtxQkFDL0I7b0JBQ0QsT0FBTyxFQUFFO3dCQUNMLG9CQUFvQjt3QkFDcEIsNEJBQTRCO3FCQUMvQjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1AscUJBQXFCO3dCQUNyQix1QkFBdUI7d0JBQ3ZCLG9CQUFvQjt3QkFDcEIsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO3FCQUNyRTtpQkFDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBGcmFtZXdvcmssXG4gIEpzb25TY2hlbWFGb3JtU2VydmljZSxcbiAgV2lkZ2V0TGlicmFyeVNlcnZpY2UsXG4gIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLFxuICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgV2lkZ2V0TGlicmFyeU1vZHVsZVxufSBmcm9tICdAYWpzZi9jb3JlJztcbmltcG9ydCB7Qm9vdHN0cmFwM0ZyYW1ld29ya30gZnJvbSAnLi9ib290c3RyYXAzLmZyYW1ld29yayc7XG5pbXBvcnQge0Jvb3RzdHJhcDNGcmFtZXdvcmtDb21wb25lbnR9IGZyb20gJy4vYm9vdHN0cmFwMy1mcmFtZXdvcmsuY29tcG9uZW50JztcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIEpzb25TY2hlbWFGb3JtTW9kdWxlLFxuICAgICAgICBDb21tb25Nb2R1bGUsXG4gICAgICAgIFdpZGdldExpYnJhcnlNb2R1bGUsXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgQm9vdHN0cmFwM0ZyYW1ld29ya0NvbXBvbmVudCxcbiAgICBdLFxuICAgIGV4cG9ydHM6IFtcbiAgICAgICAgSnNvblNjaGVtYUZvcm1Nb2R1bGUsXG4gICAgICAgIEJvb3RzdHJhcDNGcmFtZXdvcmtDb21wb25lbnQsXG4gICAgXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICAgICAgICBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICAgICAgV2lkZ2V0TGlicmFyeVNlcnZpY2UsXG4gICAgICAgIHsgcHJvdmlkZTogRnJhbWV3b3JrLCB1c2VDbGFzczogQm9vdHN0cmFwM0ZyYW1ld29yaywgbXVsdGk6IHRydWUgfSxcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEJvb3RzdHJhcDNGcmFtZXdvcmtNb2R1bGUge1xufVxuIl19