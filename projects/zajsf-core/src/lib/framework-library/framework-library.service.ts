import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { hasOwn } from '../shared/utility.functions';
import { WidgetLibraryService } from '../widget-library/widget-library.service';
import { Framework } from './framework';

// Possible future frameworks:
// - Foundation 6:
//   http://justindavis.co/2017/06/15/using-foundation-6-in-angular-4/
//   https://github.com/zurb/foundation-sites
// - Semantic UI:
//   https://github.com/edcarroll/ng2-semantic-ui
//   https://github.com/vladotesanovic/ngSemantic

@Injectable({
  providedIn: 'root',
})
export class FrameworkLibraryService {
  activeFramework: Framework = null;
  stylesheets: (HTMLStyleElement|HTMLLinkElement)[];
  scripts: HTMLScriptElement[];
  loadExternalAssets = false;
  defaultFramework: string;
  frameworkLibrary: { [name: string]: Framework } = {};

  activeFrameworkName$: Observable<string>;
  private activeFrameworkNameSubject: Subject<string>;
  private activeFrameworkName:string;

  constructor(
    @Inject(Framework) private frameworks: any[],
    @Inject(WidgetLibraryService) private widgetLibrary: WidgetLibraryService
  ) {
    this.frameworks.forEach(framework =>
      this.frameworkLibrary[framework.name] = framework
    );
    this.defaultFramework = this.frameworks[0].name;
    //this.setFramework(this.defaultFramework);
    
    this.activeFrameworkName=this.defaultFramework;
    this.activeFrameworkNameSubject = new Subject<string>();
    this.activeFrameworkName$ = this.activeFrameworkNameSubject.asObservable();
    this.setFramework(this.defaultFramework);
  }

  public setLoadExternalAssets(loadExternalAssets = true): void {
    this.loadExternalAssets = !!loadExternalAssets;
  }

  public setFramework(
    framework: string|Framework = this.defaultFramework,
    loadExternalAssets = this.loadExternalAssets
  ): boolean {
    this.activeFramework =
      typeof framework === 'string' && this.hasFramework(framework) ?
        this.frameworkLibrary[framework] :
      typeof framework === 'object' && hasOwn(framework, 'framework') ?
        framework :
        this.frameworkLibrary[this.defaultFramework];
    if(this.activeFramework.name !=this.activeFrameworkName){
      this.activeFrameworkName=this.activeFramework.name;
      this.activeFrameworkNameSubject.next(this.activeFrameworkName);
    }
    return this.registerFrameworkWidgets(this.activeFramework);
  }

  registerFrameworkWidgets(framework: Framework): boolean {
    return hasOwn(framework, 'widgets') ?
      this.widgetLibrary.registerFrameworkWidgets(framework.widgets) :
      this.widgetLibrary.unRegisterFrameworkWidgets();
  }

  public hasFramework(type: string): boolean {
    return hasOwn(this.frameworkLibrary, type);
  }

  public getFramework(): any {
    if (!this.activeFramework) { this.setFramework('default', true); }
    return this.activeFramework.framework;
  }

  public getFrameworkWidgets(): any {
    return this.activeFramework.widgets || {};
  }

  public getFrameworkStylesheets(load: boolean = this.loadExternalAssets): string[] {
    return (load && this.activeFramework.stylesheets) || [];
  }

  public getFrameworkScripts(load: boolean = this.loadExternalAssets): string[] {
    return (load && this.activeFramework.scripts) || [];
  }

  //applies to CssFramework classes
  public getFrameworkConfig(existingFramework?:any): any {
    let actFramework:Framework& { [key: string]: any; }=existingFramework||this.activeFramework;
    return actFramework.config;
  }

  //applies to CssFramework classes
  public getFrameworkThemes():{name:string,text:string}[] {
    let cssfwConfig=this.getFrameworkConfig();
    let themes;
    if(cssfwConfig){
      themes=cssfwConfig?.widgetstyles?.__themes__||[]
    }
    return themes
  }

  //applies to CssFramework classes
  public requestThemeChange(name:string,validateThemeExists:boolean=false,existingFramework?:any){
    let actFramework:Framework& { [key: string]: any; }=existingFramework||this.activeFramework;
    if(actFramework.requestThemeChange){
      if(validateThemeExists){  
        let themes=this.getFrameworkThemes();
        let foundThemes=themes.filter(thm=>{return thm.name==name});
        if(!foundThemes|| foundThemes.length==0){
          return false;
        }
      }
      actFramework.requestThemeChange(name);
      return true;
    }
  }
  //applies to CssFramework classes
  public getActiveTheme(existingFramework?:any):{name:string,text:string}{
    let actFramework:Framework& { [key: string]: any; }=existingFramework||this.activeFramework;
    if(actFramework.getActiveTheme){
      return actFramework.getActiveTheme();
    }
  }

  //applies to CssFramework classes
  public registerTheme(newTheme:{name:string,text:string},existingFramework?:any):boolean{
    let actFramework:Framework& { [key: string]: any; }=existingFramework||this.activeFramework;
    if(actFramework.registerTheme){
      return actFramework.registerTheme(newTheme);
    }
  }

    //applies to CssFramework classes
    public unregisterTheme(name:string,existingFramework?:any):boolean{
      let actFramework:Framework& { [key: string]: any; }=existingFramework||this.activeFramework;
      if(actFramework.registerTheme){
        return actFramework.unregisterTheme(name);
      }
    }
}
