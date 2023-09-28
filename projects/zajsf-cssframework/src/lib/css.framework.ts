import { Inject, Injectable } from '@angular/core';
import { Framework } from '@zajsf/core';
import { CssFrameworkComponent } from './css-framework.component';
import { CSS_FRAMEWORK_CFG, css_fw } from './css-framework.defs';



@Injectable()
export class CssFramework extends Framework {
  name = 'css';
 

  framework = CssFrameworkComponent;
  config:css_fw.frameworkcfg
  constructor(@Inject(CSS_FRAMEWORK_CFG ) cfg:css_fw.frameworkcfg){
        super();
        
        this.name=cfg.name;
        this.stylesheets=cfg.stylesheets;
        this.scripts=cfg.scripts;
        this.config=cfg;
  }
  /*
  stylesheets = [
    //TODO-enable for dev only
    cdn.tailwindcss.com/3.3.3'
  ];


  scripts = [

  ];
  */

}
