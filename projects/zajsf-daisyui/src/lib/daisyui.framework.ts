import { Injectable } from '@angular/core';
import { Framework } from '@zajsf/core';
import { DaisyUIFrameworkComponent } from './daisyui-framework.component';
import { DaisyUITabsComponent } from './widgets/daisyui-tabs.component';


@Injectable()
export class DaisyUIFramework extends Framework {
  name = 'daisyui';

  framework = DaisyUIFrameworkComponent;

  /*
  stylesheets = [
    //TODO-enable for dev only
    cdn.tailwindcss.com/3.3.3'
  ];


  scripts = [

  ];
  */

  widgets = {

    'tabs': DaisyUITabsComponent,
  
  };
}
