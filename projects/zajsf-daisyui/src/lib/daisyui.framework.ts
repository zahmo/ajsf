import { Inject, Injectable, Optional } from '@angular/core';
import { CssFramework, CssframeworkService } from '@zajsf/cssframework';
import { cssFrameworkCfgDaisyUI, getCssFrameworkCfgPrefixed } from './daisui-cssframework';
import { DaisyUIFrameworkComponent } from './daisyui-framework.component';
import { DaisyUIFrameworkComponentPrefixed } from './daisyui-framework.prefixed.component';
import { DUIOPTIONS } from './tokens.defs';
import { DaisyUITabsComponent } from './widgets/daisyui-tabs.component';


@Injectable()
export class DaisyUIFramework extends CssFramework {

framework=DaisyUIFrameworkComponent;
  constructor(public cssFWService:CssframeworkService,@Inject(DUIOPTIONS) 
  @Optional() private duiOptions:any={classPrefix:true}//use class prefix by default
  ){
     let cssFrameworkCfg=cssFrameworkCfgDaisyUI;
    if(duiOptions?.classPrefix){
      cssFrameworkCfg=getCssFrameworkCfgPrefixed(cssFrameworkCfgDaisyUI)
    }
    super(cssFrameworkCfg,cssFWService);
    if(duiOptions?.classPrefix){
      this.framework=DaisyUIFrameworkComponentPrefixed;
    }
    this.widgets= {

      'tabs': DaisyUITabsComponent,
    
    };
  }

}
