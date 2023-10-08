import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CssframeworkService {

  frameworkTheme$: Observable<string>;

  private frameworkThemeSubject: Subject<string>;
  constructor() {
    this.frameworkThemeSubject = new Subject<string>();
    this.frameworkTheme$ = this.frameworkThemeSubject.asObservable();
   }

   //TODO-review: this acts as a public api to change the theme
   //but doesn't do the actual change, instead it relies on 
   //the CssFramewkCoromponent having subscribed to listen 
   //and perform the actual theme change
   requestThemeChange(themeName:string){
      this.frameworkThemeSubject.next(themeName);
   }
}
