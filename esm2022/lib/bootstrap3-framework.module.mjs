import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Framework, FrameworkLibraryService, JsonSchemaFormModule, JsonSchemaFormService, WidgetLibraryModule, WidgetLibraryService } from '@zajsf/core';
import { CssFrameworkModule } from '@zajsf/cssframework';
import { Bootstrap3FrameworkComponent } from './bootstrap3-framework.component';
import { Bootstrap3Framework } from './bootstrap3.framework';
import * as i0 from "@angular/core";
export class Bootstrap3FrameworkModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap3FrameworkModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap3FrameworkModule, declarations: [Bootstrap3FrameworkComponent], imports: [JsonSchemaFormModule,
            CommonModule,
            WidgetLibraryModule,
            CssFrameworkModule], exports: [JsonSchemaFormModule,
            Bootstrap3FrameworkComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap3FrameworkModule, providers: [
            JsonSchemaFormService,
            FrameworkLibraryService,
            WidgetLibraryService,
            { provide: Framework, useClass: Bootstrap3Framework, multi: true },
        ], imports: [JsonSchemaFormModule,
            CommonModule,
            WidgetLibraryModule,
            CssFrameworkModule, JsonSchemaFormModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: Bootstrap3FrameworkModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        JsonSchemaFormModule,
                        CommonModule,
                        WidgetLibraryModule,
                        CssFrameworkModule
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwMy1mcmFtZXdvcmsubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtYm9vdHN0cmFwMy9zcmMvbGliL2Jvb3RzdHJhcDMtZnJhbWV3b3JrLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQ0gsU0FBUyxFQUNULHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIscUJBQXFCLEVBQ3JCLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDdkIsTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDekQsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDaEYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7O0FBdUI3RCxNQUFNLE9BQU8seUJBQXlCOzhHQUF6Qix5QkFBeUI7K0dBQXpCLHlCQUF5QixpQkFiOUIsNEJBQTRCLGFBTjVCLG9CQUFvQjtZQUNwQixZQUFZO1lBQ1osbUJBQW1CO1lBQ25CLGtCQUFrQixhQU1sQixvQkFBb0I7WUFDcEIsNEJBQTRCOytHQVN2Qix5QkFBeUIsYUFQdkI7WUFDUCxxQkFBcUI7WUFDckIsdUJBQXVCO1lBQ3ZCLG9CQUFvQjtZQUNwQixFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7U0FDckUsWUFqQkcsb0JBQW9CO1lBQ3BCLFlBQVk7WUFDWixtQkFBbUI7WUFDbkIsa0JBQWtCLEVBTWxCLG9CQUFvQjs7MkZBVWYseUJBQXlCO2tCQXJCckMsUUFBUTttQkFBQztvQkFDTixPQUFPLEVBQUU7d0JBQ0wsb0JBQW9CO3dCQUNwQixZQUFZO3dCQUNaLG1CQUFtQjt3QkFDbkIsa0JBQWtCO3FCQUNyQjtvQkFDRCxZQUFZLEVBQUU7d0JBQ1YsNEJBQTRCO3FCQUMvQjtvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsb0JBQW9CO3dCQUNwQiw0QkFBNEI7cUJBQy9CO29CQUNELFNBQVMsRUFBRTt3QkFDUCxxQkFBcUI7d0JBQ3JCLHVCQUF1Qjt3QkFDdkIsb0JBQW9CO3dCQUNwQixFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7cUJBQ3JFO2lCQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICAgIEZyYW1ld29yayxcbiAgICBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICBKc29uU2NoZW1hRm9ybVNlcnZpY2UsXG4gICAgV2lkZ2V0TGlicmFyeU1vZHVsZSxcbiAgICBXaWRnZXRMaWJyYXJ5U2VydmljZVxufSBmcm9tICdAemFqc2YvY29yZSc7XG5pbXBvcnQgeyBDc3NGcmFtZXdvcmtNb2R1bGUgfSBmcm9tICdAemFqc2YvY3NzZnJhbWV3b3JrJztcbmltcG9ydCB7IEJvb3RzdHJhcDNGcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL2Jvb3RzdHJhcDMtZnJhbWV3b3JrLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBCb290c3RyYXAzRnJhbWV3b3JrIH0gZnJvbSAnLi9ib290c3RyYXAzLmZyYW1ld29yayc7XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW1xuICAgICAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICAgICAgQ29tbW9uTW9kdWxlLFxuICAgICAgICBXaWRnZXRMaWJyYXJ5TW9kdWxlLFxuICAgICAgICBDc3NGcmFtZXdvcmtNb2R1bGVcbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBCb290c3RyYXAzRnJhbWV3b3JrQ29tcG9uZW50LFxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICAgICAgQm9vdHN0cmFwM0ZyYW1ld29ya0NvbXBvbmVudCxcbiAgICBdLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBKc29uU2NoZW1hRm9ybVNlcnZpY2UsXG4gICAgICAgIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLFxuICAgICAgICBXaWRnZXRMaWJyYXJ5U2VydmljZSxcbiAgICAgICAgeyBwcm92aWRlOiBGcmFtZXdvcmssIHVzZUNsYXNzOiBCb290c3RyYXAzRnJhbWV3b3JrLCBtdWx0aTogdHJ1ZSB9LFxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQm9vdHN0cmFwM0ZyYW1ld29ya01vZHVsZSB7XG59XG4iXX0=