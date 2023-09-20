import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Framework, FrameworkLibraryService, JsonSchemaFormModule, JsonSchemaFormService, WidgetLibraryModule, WidgetLibraryService } from '@zajsf/core';

import { DaisyUIFrameworkComponent } from './daisyui-framework.component';
import { DaisyUIFramework } from './daisyui.framework';
import { DaisyUITabsComponent } from './widgets/daisyui-tabs.component';



@NgModule({
  declarations: [
    DaisyUIFrameworkComponent,
    DaisyUITabsComponent
  ],
  imports: [
    JsonSchemaFormModule,
    CommonModule,
    WidgetLibraryModule,
  ],
  exports: [
    DaisyUIFrameworkComponent,
    JsonSchemaFormModule,
    DaisyUITabsComponent
  ],
  providers: [
    JsonSchemaFormService,
    FrameworkLibraryService,
    WidgetLibraryService,
    { provide: Framework, useClass: DaisyUIFramework, multi: true },
]
})
export class DaisyUIFrameworkModule { }
