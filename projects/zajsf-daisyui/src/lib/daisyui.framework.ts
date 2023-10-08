import { Injectable } from '@angular/core';
import { CssFramework, CssframeworkService } from '@zajsf/cssframework';
import { cssFrameworkCfgDaisyUI } from './daisui-cssframework';
import { DaisyUIFrameworkComponent } from './daisyui-framework.component';
import { DaisyUITabsComponent } from './widgets/daisyui-tabs.component';


@Injectable()
export class DaisyUIFramework extends CssFramework {

framework=DaisyUIFrameworkComponent;
  constructor(public cssFWService:CssframeworkService){
    super(cssFrameworkCfgDaisyUI,cssFWService);
    this.widgets= {

      'tabs': DaisyUITabsComponent,
    
    };
  }

}
