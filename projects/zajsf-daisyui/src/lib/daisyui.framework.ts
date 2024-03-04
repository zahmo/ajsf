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
  constructor(public cssFWService:CssframeworkService,@Inject(DUIOPTIONS) @Optional() private duiOptions:any={}){
     let cssFrameworkCfg=cssFrameworkCfgDaisyUI;
    if(duiOptions?.classPrefix){

      /*
        cssFrameworkCfgDaisyUI.widgetstyles.tabs={
          "labelHtmlClass": "dui-tabs-md dui-tabs-boxed",
          "htmlClass": "",
          "itemLabelHtmlClass": "dui-tab",
          "activeClass": "dui-tab-active"
      }
      cssFrameworkCfgDaisyUI.widgetstyles.tabarray=cssFrameworkCfgDaisyUI.widgetstyles.tabs;
    */
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
