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

   setTheme(name:string){
      this.frameworkThemeSubject.next(name);
   }
}
