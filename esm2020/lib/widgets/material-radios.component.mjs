import { Component, Input } from '@angular/core';
import { buildTitleMap } from '@zajsf/core';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/core";
import * as i2 from "@angular/common";
import * as i3 from "@angular/forms";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/radio";
export class MaterialRadiosComponent {
    constructor(jsf) {
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.flexDirection = 'column';
        this.radiosList = [];
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        if (this.layoutNode.type === 'radios-inline') {
            this.flexDirection = 'row';
        }
        this.radiosList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, true);
        this.jsf.initializeControl(this, !this.options.readonly);
    }
    updateValue(value) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, value);
    }
}
MaterialRadiosComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialRadiosComponent, deps: [{ token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component });
MaterialRadiosComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.9", type: MaterialRadiosComponent, selector: "material-radios-widget", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, ngImport: i0, template: `
    <div>
      <div *ngIf="options?.title">
        <label
          [attr.for]="'control' + layoutNode?._id"
          [class]="options?.labelHtmlClass || ''"
          [style.display]="options?.notitle ? 'none' : ''"
          [innerHTML]="options?.title"></label>
      </div>
      <mat-radio-group *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [style.flex-direction]="flexDirection"
        [name]="controlName"
        (blur)="options.showErrors = true">
        <mat-radio-button *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-radio-button>
      </mat-radio-group>
      <mat-radio-group *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [style.flex-direction]="flexDirection"
        [disabled]="controlDisabled || options?.readonly"
        [name]="controlName"
        [value]="controlValue">
        <mat-radio-button *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value"
          (click)="updateValue(radioItem?.value)">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>`, isInline: true, styles: ["mat-radio-group{display:inline-flex}mat-radio-button{margin:2px}mat-error{font-size:75%}\n"], dependencies: [{ kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i3.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "directive", type: i4.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i5.MatRadioGroup, selector: "mat-radio-group", exportAs: ["matRadioGroup"] }, { kind: "component", type: i5.MatRadioButton, selector: "mat-radio-button", inputs: ["disableRipple", "tabIndex"], exportAs: ["matRadioButton"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialRadiosComponent, decorators: [{
            type: Component,
            args: [{ selector: 'material-radios-widget', template: `
    <div>
      <div *ngIf="options?.title">
        <label
          [attr.for]="'control' + layoutNode?._id"
          [class]="options?.labelHtmlClass || ''"
          [style.display]="options?.notitle ? 'none' : ''"
          [innerHTML]="options?.title"></label>
      </div>
      <mat-radio-group *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [style.flex-direction]="flexDirection"
        [name]="controlName"
        (blur)="options.showErrors = true">
        <mat-radio-button *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-radio-button>
      </mat-radio-group>
      <mat-radio-group *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.readonly]="options?.readonly ? 'readonly' : null"
        [attr.required]="options?.required"
        [style.flex-direction]="flexDirection"
        [disabled]="controlDisabled || options?.readonly"
        [name]="controlName"
        [value]="controlValue">
        <mat-radio-button *ngFor="let radioItem of radiosList"
          [id]="'control' + layoutNode?._id + '/' + radioItem?.name"
          [value]="radioItem?.value"
          (click)="updateValue(radioItem?.value)">
          <span [innerHTML]="radioItem?.name"></span>
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="options?.showErrors && options?.errorMessage"
        [innerHTML]="options?.errorMessage"></mat-error>
    </div>`, styles: ["mat-radio-group{display:inline-flex}mat-radio-button{margin:2px}mat-error{font-size:75%}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.JsonSchemaFormService }]; }, propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtcmFkaW9zLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC1yYWRpb3MuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBRXpELE9BQU8sRUFBeUIsYUFBYSxFQUFFLE1BQU0sYUFBYSxDQUFDOzs7Ozs7O0FBdURuRSxNQUFNLE9BQU8sdUJBQXVCO0lBYWxDLFlBQ1UsR0FBMEI7UUFBMUIsUUFBRyxHQUFILEdBQUcsQ0FBdUI7UUFWcEMsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDeEIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFFckIsa0JBQWEsR0FBRyxRQUFRLENBQUM7UUFDekIsZUFBVSxHQUFVLEVBQUUsQ0FBQztJQU9uQixDQUFDO0lBRUwsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssZUFBZSxFQUFFO1lBQzVDLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1NBQzVCO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQ3hCLENBQUM7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFLO1FBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDOztvSEFoQ1UsdUJBQXVCO3dHQUF2Qix1QkFBdUIsd0pBakR4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQXdDRDsyRkFTRSx1QkFBdUI7a0JBcERuQyxTQUFTOytCQUVFLHdCQUF3QixZQUN4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQXdDRDs0R0FrQkEsVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSwgYnVpbGRUaXRsZU1hcCB9IGZyb20gJ0B6YWpzZi9jb3JlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ21hdGVyaWFsLXJhZGlvcy13aWRnZXQnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXY+XG4gICAgICA8ZGl2ICpuZ0lmPVwib3B0aW9ucz8udGl0bGVcIj5cbiAgICAgICAgPGxhYmVsXG4gICAgICAgICAgW2F0dHIuZm9yXT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZFwiXG4gICAgICAgICAgW2NsYXNzXT1cIm9wdGlvbnM/LmxhYmVsSHRtbENsYXNzIHx8ICcnXCJcbiAgICAgICAgICBbc3R5bGUuZGlzcGxheV09XCJvcHRpb25zPy5ub3RpdGxlID8gJ25vbmUnIDogJydcIlxuICAgICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8udGl0bGVcIj48L2xhYmVsPlxuICAgICAgPC9kaXY+XG4gICAgICA8bWF0LXJhZGlvLWdyb3VwICpuZ0lmPVwiYm91bmRDb250cm9sXCJcbiAgICAgICAgW2Zvcm1Db250cm9sXT1cImZvcm1Db250cm9sXCJcbiAgICAgICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWQgKyAnU3RhdHVzJ1wiXG4gICAgICAgIFthdHRyLnJlYWRvbmx5XT1cIm9wdGlvbnM/LnJlYWRvbmx5ID8gJ3JlYWRvbmx5JyA6IG51bGxcIlxuICAgICAgICBbYXR0ci5yZXF1aXJlZF09XCJvcHRpb25zPy5yZXF1aXJlZFwiXG4gICAgICAgIFtzdHlsZS5mbGV4LWRpcmVjdGlvbl09XCJmbGV4RGlyZWN0aW9uXCJcbiAgICAgICAgW25hbWVdPVwiY29udHJvbE5hbWVcIlxuICAgICAgICAoYmx1cik9XCJvcHRpb25zLnNob3dFcnJvcnMgPSB0cnVlXCI+XG4gICAgICAgIDxtYXQtcmFkaW8tYnV0dG9uICpuZ0Zvcj1cImxldCByYWRpb0l0ZW0gb2YgcmFkaW9zTGlzdFwiXG4gICAgICAgICAgW2lkXT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZCArICcvJyArIHJhZGlvSXRlbT8ubmFtZVwiXG4gICAgICAgICAgW3ZhbHVlXT1cInJhZGlvSXRlbT8udmFsdWVcIj5cbiAgICAgICAgICA8c3BhbiBbaW5uZXJIVE1MXT1cInJhZGlvSXRlbT8ubmFtZVwiPjwvc3Bhbj5cbiAgICAgICAgPC9tYXQtcmFkaW8tYnV0dG9uPlxuICAgICAgPC9tYXQtcmFkaW8tZ3JvdXA+XG4gICAgICA8bWF0LXJhZGlvLWdyb3VwICpuZ0lmPVwiIWJvdW5kQ29udHJvbFwiXG4gICAgICAgIFthdHRyLmFyaWEtZGVzY3JpYmVkYnldPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ1N0YXR1cydcIlxuICAgICAgICBbYXR0ci5yZWFkb25seV09XCJvcHRpb25zPy5yZWFkb25seSA/ICdyZWFkb25seScgOiBudWxsXCJcbiAgICAgICAgW2F0dHIucmVxdWlyZWRdPVwib3B0aW9ucz8ucmVxdWlyZWRcIlxuICAgICAgICBbc3R5bGUuZmxleC1kaXJlY3Rpb25dPVwiZmxleERpcmVjdGlvblwiXG4gICAgICAgIFtkaXNhYmxlZF09XCJjb250cm9sRGlzYWJsZWQgfHwgb3B0aW9ucz8ucmVhZG9ubHlcIlxuICAgICAgICBbbmFtZV09XCJjb250cm9sTmFtZVwiXG4gICAgICAgIFt2YWx1ZV09XCJjb250cm9sVmFsdWVcIj5cbiAgICAgICAgPG1hdC1yYWRpby1idXR0b24gKm5nRm9yPVwibGV0IHJhZGlvSXRlbSBvZiByYWRpb3NMaXN0XCJcbiAgICAgICAgICBbaWRdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJy8nICsgcmFkaW9JdGVtPy5uYW1lXCJcbiAgICAgICAgICBbdmFsdWVdPVwicmFkaW9JdGVtPy52YWx1ZVwiXG4gICAgICAgICAgKGNsaWNrKT1cInVwZGF0ZVZhbHVlKHJhZGlvSXRlbT8udmFsdWUpXCI+XG4gICAgICAgICAgPHNwYW4gW2lubmVySFRNTF09XCJyYWRpb0l0ZW0/Lm5hbWVcIj48L3NwYW4+XG4gICAgICAgIDwvbWF0LXJhZGlvLWJ1dHRvbj5cbiAgICAgIDwvbWF0LXJhZGlvLWdyb3VwPlxuICAgICAgPG1hdC1lcnJvciAqbmdJZj1cIm9wdGlvbnM/LnNob3dFcnJvcnMgJiYgb3B0aW9ucz8uZXJyb3JNZXNzYWdlXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5lcnJvck1lc3NhZ2VcIj48L21hdC1lcnJvcj5cbiAgICA8L2Rpdj5gLFxuICBzdHlsZXM6IFtgXG4gICAgLyogVE9ETyhtZGMtbWlncmF0aW9uKTogVGhlIGZvbGxvd2luZyBydWxlIHRhcmdldHMgaW50ZXJuYWwgY2xhc3NlcyBvZiByYWRpbyB0aGF0IG1heSBubyBsb25nZXIgYXBwbHkgZm9yIHRoZSBNREMgdmVyc2lvbi4gKi9cbiAgICBtYXQtcmFkaW8tZ3JvdXAgeyBkaXNwbGF5OiBpbmxpbmUtZmxleDsgfVxuICAgIC8qIFRPRE8obWRjLW1pZ3JhdGlvbik6IFRoZSBmb2xsb3dpbmcgcnVsZSB0YXJnZXRzIGludGVybmFsIGNsYXNzZXMgb2YgcmFkaW8gdGhhdCBtYXkgbm8gbG9uZ2VyIGFwcGx5IGZvciB0aGUgTURDIHZlcnNpb24uICovXG4gICAgbWF0LXJhZGlvLWJ1dHRvbiB7IG1hcmdpbjogMnB4OyB9XG4gICAgbWF0LWVycm9yIHsgZm9udC1zaXplOiA3NSU7IH1cbiAgYF1cbn0pXG5leHBvcnQgY2xhc3MgTWF0ZXJpYWxSYWRpb3NDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBmb3JtQ29udHJvbDogQWJzdHJhY3RDb250cm9sO1xuICBjb250cm9sTmFtZTogc3RyaW5nO1xuICBjb250cm9sVmFsdWU6IGFueTtcbiAgY29udHJvbERpc2FibGVkID0gZmFsc2U7XG4gIGJvdW5kQ29udHJvbCA9IGZhbHNlO1xuICBvcHRpb25zOiBhbnk7XG4gIGZsZXhEaXJlY3Rpb24gPSAnY29sdW1uJztcbiAgcmFkaW9zTGlzdDogYW55W10gPSBbXTtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zIHx8IHt9O1xuICAgIGlmICh0aGlzLmxheW91dE5vZGUudHlwZSA9PT0gJ3JhZGlvcy1pbmxpbmUnKSB7XG4gICAgICB0aGlzLmZsZXhEaXJlY3Rpb24gPSAncm93JztcbiAgICB9XG4gICAgdGhpcy5yYWRpb3NMaXN0ID0gYnVpbGRUaXRsZU1hcChcbiAgICAgIHRoaXMub3B0aW9ucy50aXRsZU1hcCB8fCB0aGlzLm9wdGlvbnMuZW51bU5hbWVzLFxuICAgICAgdGhpcy5vcHRpb25zLmVudW0sIHRydWVcbiAgICApO1xuICAgIHRoaXMuanNmLmluaXRpYWxpemVDb250cm9sKHRoaXMsICF0aGlzLm9wdGlvbnMucmVhZG9ubHkpO1xuICB9XG5cbiAgdXBkYXRlVmFsdWUodmFsdWUpIHtcbiAgICB0aGlzLm9wdGlvbnMuc2hvd0Vycm9ycyA9IHRydWU7XG4gICAgdGhpcy5qc2YudXBkYXRlVmFsdWUodGhpcywgdmFsdWUpO1xuICB9XG59XG4iXX0=