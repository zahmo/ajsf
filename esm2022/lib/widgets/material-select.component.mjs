import { Component, Inject, Input, Optional } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { buildTitleMap, isArray } from '@zajsf/core';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/core";
import * as i2 from "@angular/common";
import * as i3 from "@angular/forms";
import * as i4 from "@angular/material/core";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/select";
export class MaterialSelectComponent {
    constructor(matFormFieldDefaultOptions, jsf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
        this.selectList = [];
        this.isArray = isArray;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.selectList = buildTitleMap(this.options.titleMap || this.options.enumNames, this.options.enum, !!this.options.required, !!this.options.flatList);
        this.jsf.initializeControl(this, !this.options.readonly);
        if (!this.options.notitle && !this.options.description && this.options.placeholder) {
            this.options.description = this.options.placeholder;
        }
    }
    updateValue(event) {
        this.options.showErrors = true;
        this.jsf.updateValue(this, event.value);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: MaterialSelectComponent, deps: [{ token: MAT_FORM_FIELD_DEFAULT_OPTIONS, optional: true }, { token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.4", type: MaterialSelectComponent, selector: "material-select-widget", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, ngImport: i0, template: `
    <mat-form-field
      [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'fill'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
      [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
      [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <mat-select *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        (blur)="options.showErrors = true">
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option *ngIf="!isArray(selectItem?.items)"
            [value]="selectItem?.value">
            <span [innerHTML]="selectItem?.name"></span>
          </mat-option>
          <mat-optgroup *ngIf="isArray(selectItem?.items)"
            [label]="selectItem?.group">
            <mat-option *ngFor="let subItem of selectItem.items"
              [value]="subItem?.value">
              <span [innerHTML]="subItem?.name"></span>
            </mat-option>
          </mat-optgroup>
        </ng-template>
      </mat-select>
      <mat-select *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [disabled]="controlDisabled || options?.readonly"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        [value]="controlValue"
        (blur)="options.showErrors = true"
        (change)="updateValue($event)">
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option *ngIf="!isArray(selectItem?.items)"
            [attr.selected]="selectItem?.value === controlValue"
            [value]="selectItem?.value">
            <span [innerHTML]="selectItem?.name"></span>
          </mat-option>
          <mat-optgroup *ngIf="isArray(selectItem?.items)"
            [label]="selectItem?.group">
            <mat-option *ngFor="let subItem of selectItem.items"
              [attr.selected]="subItem?.value === controlValue"
              [value]="subItem?.value">
              <span [innerHTML]="subItem?.name"></span>
            </mat-option>
          </mat-optgroup>
        </ng-template>
      </mat-select>
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
    </mat-form-field>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`, isInline: true, styles: ["mat-error{font-size:75%;margin-top:-1rem;margin-bottom:.5rem}::ng-deep json-schema-form mat-form-field .mat-mdc-form-field-wrapper .mat-form-field-flex .mat-form-field-infix{width:initial}\n"], dependencies: [{ kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i3.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: i4.MatOption, selector: "mat-option", exportAs: ["matOption"] }, { kind: "component", type: i4.MatOptgroup, selector: "mat-optgroup", inputs: ["disabled"], exportAs: ["matOptgroup"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatLabel, selector: "mat-label" }, { kind: "directive", type: i5.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i5.MatPrefix, selector: "[matPrefix], [matIconPrefix], [matTextPrefix]", inputs: ["matTextPrefix"] }, { kind: "directive", type: i5.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "component", type: i6.MatSelect, selector: "mat-select", inputs: ["disabled", "disableRipple", "tabIndex", "panelWidth", "hideSingleSelectionIndicator"], exportAs: ["matSelect"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: MaterialSelectComponent, decorators: [{
            type: Component,
            args: [{ selector: 'material-select-widget', template: `
    <mat-form-field
      [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'fill'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
      [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
      [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <mat-select *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        (blur)="options.showErrors = true">
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option *ngIf="!isArray(selectItem?.items)"
            [value]="selectItem?.value">
            <span [innerHTML]="selectItem?.name"></span>
          </mat-option>
          <mat-optgroup *ngIf="isArray(selectItem?.items)"
            [label]="selectItem?.group">
            <mat-option *ngFor="let subItem of selectItem.items"
              [value]="subItem?.value">
              <span [innerHTML]="subItem?.name"></span>
            </mat-option>
          </mat-optgroup>
        </ng-template>
      </mat-select>
      <mat-select *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [disabled]="controlDisabled || options?.readonly"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        [value]="controlValue"
        (blur)="options.showErrors = true"
        (change)="updateValue($event)">
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option *ngIf="!isArray(selectItem?.items)"
            [attr.selected]="selectItem?.value === controlValue"
            [value]="selectItem?.value">
            <span [innerHTML]="selectItem?.name"></span>
          </mat-option>
          <mat-optgroup *ngIf="isArray(selectItem?.items)"
            [label]="selectItem?.group">
            <mat-option *ngFor="let subItem of selectItem.items"
              [attr.selected]="subItem?.value === controlValue"
              [value]="subItem?.value">
              <span [innerHTML]="subItem?.name"></span>
            </mat-option>
          </mat-optgroup>
        </ng-template>
      </mat-select>
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
    </mat-form-field>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`, styles: ["mat-error{font-size:75%;margin-top:-1rem;margin-bottom:.5rem}::ng-deep json-schema-form mat-form-field .mat-mdc-form-field-wrapper .mat-form-field-flex .mat-form-field-infix{width:initial}\n"] }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_FORM_FIELD_DEFAULT_OPTIONS]
                }, {
                    type: Optional
                }] }, { type: i1.JsonSchemaFormService }]; }, propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtc2VsZWN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC1zZWxlY3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBVSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUUsT0FBTyxFQUF5QixhQUFhLEVBQUUsT0FBTyxFQUFFLE1BQU0sYUFBYSxDQUFDOzs7Ozs7OztBQWdGNUUsTUFBTSxPQUFPLHVCQUF1QjtJQWFsQyxZQUM2RCwwQkFBMEIsRUFDN0UsR0FBMEI7UUFEeUIsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUFBO1FBQzdFLFFBQUcsR0FBSCxHQUFHLENBQXVCO1FBWHBDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBRXJCLGVBQVUsR0FBVSxFQUFFLENBQUM7UUFDdkIsWUFBTyxHQUFHLE9BQU8sQ0FBQztJQVFkLENBQUM7SUFFTCxRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUNwRSxDQUFDO1FBQ0YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQ2xGLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ3JEO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFLO1FBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQzs4R0FqQ1UsdUJBQXVCLGtCQWN4Qiw4QkFBOEI7a0dBZDdCLHVCQUF1Qix3SkEzRXhCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1REFvRTJDOzsyRkFPMUMsdUJBQXVCO2tCQTlFbkMsU0FBUzsrQkFFRSx3QkFBd0IsWUFDeEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VEQW9FMkM7OzBCQXFCbEQsTUFBTTsyQkFBQyw4QkFBOEI7OzBCQUFHLFFBQVE7Z0ZBTDFDLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QsIElucHV0LCBPbkluaXQsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBNQVRfRk9STV9GSUVMRF9ERUZBVUxUX09QVElPTlMgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7IEpzb25TY2hlbWFGb3JtU2VydmljZSwgYnVpbGRUaXRsZU1hcCwgaXNBcnJheSB9IGZyb20gJ0B6YWpzZi9jb3JlJztcblxuQENvbXBvbmVudCh7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpjb21wb25lbnQtc2VsZWN0b3JcbiAgc2VsZWN0b3I6ICdtYXRlcmlhbC1zZWxlY3Qtd2lkZ2V0JyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bWF0LWZvcm0tZmllbGRcbiAgICAgIFthcHBlYXJhbmNlXT1cIm9wdGlvbnM/LmFwcGVhcmFuY2UgfHwgbWF0Rm9ybUZpZWxkRGVmYXVsdE9wdGlvbnM/LmFwcGVhcmFuY2UgfHwgJ2ZpbGwnXCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIlxuICAgICAgW2Zsb2F0TGFiZWxdPVwib3B0aW9ucz8uZmxvYXRMYWJlbCB8fCBtYXRGb3JtRmllbGREZWZhdWx0T3B0aW9ucz8uZmxvYXRMYWJlbCB8fCAob3B0aW9ucz8ubm90aXRsZSA/ICduZXZlcicgOiAnYXV0bycpXCJcbiAgICAgIFtoaWRlUmVxdWlyZWRNYXJrZXJdPVwib3B0aW9ucz8uaGlkZVJlcXVpcmVkID8gJ3RydWUnIDogJ2ZhbHNlJ1wiXG4gICAgICBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCI+XG4gICAgICA8bWF0LWxhYmVsICpuZ0lmPVwiIW9wdGlvbnM/Lm5vdGl0bGVcIj57e29wdGlvbnM/LnRpdGxlfX08L21hdC1sYWJlbD5cbiAgICAgIDxzcGFuIG1hdFByZWZpeCAqbmdJZj1cIm9wdGlvbnM/LnByZWZpeCB8fCBvcHRpb25zPy5maWVsZEFkZG9uTGVmdFwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8ucHJlZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25MZWZ0XCI+PC9zcGFuPlxuICAgICAgPG1hdC1zZWxlY3QgKm5nSWY9XCJib3VuZENvbnRyb2xcIlxuICAgICAgICBbZm9ybUNvbnRyb2xdPVwiZm9ybUNvbnRyb2xcIlxuICAgICAgICBbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZCArICdTdGF0dXMnXCJcbiAgICAgICAgW2F0dHIubmFtZV09XCJjb250cm9sTmFtZVwiXG4gICAgICAgIFtpZF09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWRcIlxuICAgICAgICBbbXVsdGlwbGVdPVwib3B0aW9ucz8ubXVsdGlwbGVcIlxuICAgICAgICBbcGxhY2Vob2xkZXJdPVwib3B0aW9ucz8ubm90aXRsZSA/IG9wdGlvbnM/LnBsYWNlaG9sZGVyIDogb3B0aW9ucz8udGl0bGVcIlxuICAgICAgICBbcmVxdWlyZWRdPVwib3B0aW9ucz8ucmVxdWlyZWRcIlxuICAgICAgICBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCJcbiAgICAgICAgKGJsdXIpPVwib3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZVwiPlxuICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LXNlbGVjdEl0ZW0gW25nRm9yT2ZdPVwic2VsZWN0TGlzdFwiPlxuICAgICAgICAgIDxtYXQtb3B0aW9uICpuZ0lmPVwiIWlzQXJyYXkoc2VsZWN0SXRlbT8uaXRlbXMpXCJcbiAgICAgICAgICAgIFt2YWx1ZV09XCJzZWxlY3RJdGVtPy52YWx1ZVwiPlxuICAgICAgICAgICAgPHNwYW4gW2lubmVySFRNTF09XCJzZWxlY3RJdGVtPy5uYW1lXCI+PC9zcGFuPlxuICAgICAgICAgIDwvbWF0LW9wdGlvbj5cbiAgICAgICAgICA8bWF0LW9wdGdyb3VwICpuZ0lmPVwiaXNBcnJheShzZWxlY3RJdGVtPy5pdGVtcylcIlxuICAgICAgICAgICAgW2xhYmVsXT1cInNlbGVjdEl0ZW0/Lmdyb3VwXCI+XG4gICAgICAgICAgICA8bWF0LW9wdGlvbiAqbmdGb3I9XCJsZXQgc3ViSXRlbSBvZiBzZWxlY3RJdGVtLml0ZW1zXCJcbiAgICAgICAgICAgICAgW3ZhbHVlXT1cInN1Ykl0ZW0/LnZhbHVlXCI+XG4gICAgICAgICAgICAgIDxzcGFuIFtpbm5lckhUTUxdPVwic3ViSXRlbT8ubmFtZVwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvbWF0LW9wdGlvbj5cbiAgICAgICAgICA8L21hdC1vcHRncm91cD5cbiAgICAgICAgPC9uZy10ZW1wbGF0ZT5cbiAgICAgIDwvbWF0LXNlbGVjdD5cbiAgICAgIDxtYXQtc2VsZWN0ICpuZ0lmPVwiIWJvdW5kQ29udHJvbFwiXG4gICAgICAgIFthdHRyLmFyaWEtZGVzY3JpYmVkYnldPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ1N0YXR1cydcIlxuICAgICAgICBbYXR0ci5uYW1lXT1cImNvbnRyb2xOYW1lXCJcbiAgICAgICAgW2Rpc2FibGVkXT1cImNvbnRyb2xEaXNhYmxlZCB8fCBvcHRpb25zPy5yZWFkb25seVwiXG4gICAgICAgIFtpZF09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWRcIlxuICAgICAgICBbbXVsdGlwbGVdPVwib3B0aW9ucz8ubXVsdGlwbGVcIlxuICAgICAgICBbcGxhY2Vob2xkZXJdPVwib3B0aW9ucz8ubm90aXRsZSA/IG9wdGlvbnM/LnBsYWNlaG9sZGVyIDogb3B0aW9ucz8udGl0bGVcIlxuICAgICAgICBbcmVxdWlyZWRdPVwib3B0aW9ucz8ucmVxdWlyZWRcIlxuICAgICAgICBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCJcbiAgICAgICAgW3ZhbHVlXT1cImNvbnRyb2xWYWx1ZVwiXG4gICAgICAgIChibHVyKT1cIm9wdGlvbnMuc2hvd0Vycm9ycyA9IHRydWVcIlxuICAgICAgICAoY2hhbmdlKT1cInVwZGF0ZVZhbHVlKCRldmVudClcIj5cbiAgICAgICAgPG5nLXRlbXBsYXRlIG5nRm9yIGxldC1zZWxlY3RJdGVtIFtuZ0Zvck9mXT1cInNlbGVjdExpc3RcIj5cbiAgICAgICAgICA8bWF0LW9wdGlvbiAqbmdJZj1cIiFpc0FycmF5KHNlbGVjdEl0ZW0/Lml0ZW1zKVwiXG4gICAgICAgICAgICBbYXR0ci5zZWxlY3RlZF09XCJzZWxlY3RJdGVtPy52YWx1ZSA9PT0gY29udHJvbFZhbHVlXCJcbiAgICAgICAgICAgIFt2YWx1ZV09XCJzZWxlY3RJdGVtPy52YWx1ZVwiPlxuICAgICAgICAgICAgPHNwYW4gW2lubmVySFRNTF09XCJzZWxlY3RJdGVtPy5uYW1lXCI+PC9zcGFuPlxuICAgICAgICAgIDwvbWF0LW9wdGlvbj5cbiAgICAgICAgICA8bWF0LW9wdGdyb3VwICpuZ0lmPVwiaXNBcnJheShzZWxlY3RJdGVtPy5pdGVtcylcIlxuICAgICAgICAgICAgW2xhYmVsXT1cInNlbGVjdEl0ZW0/Lmdyb3VwXCI+XG4gICAgICAgICAgICA8bWF0LW9wdGlvbiAqbmdGb3I9XCJsZXQgc3ViSXRlbSBvZiBzZWxlY3RJdGVtLml0ZW1zXCJcbiAgICAgICAgICAgICAgW2F0dHIuc2VsZWN0ZWRdPVwic3ViSXRlbT8udmFsdWUgPT09IGNvbnRyb2xWYWx1ZVwiXG4gICAgICAgICAgICAgIFt2YWx1ZV09XCJzdWJJdGVtPy52YWx1ZVwiPlxuICAgICAgICAgICAgICA8c3BhbiBbaW5uZXJIVE1MXT1cInN1Ykl0ZW0/Lm5hbWVcIj48L3NwYW4+XG4gICAgICAgICAgICA8L21hdC1vcHRpb24+XG4gICAgICAgICAgPC9tYXQtb3B0Z3JvdXA+XG4gICAgICAgIDwvbmctdGVtcGxhdGU+XG4gICAgICA8L21hdC1zZWxlY3Q+XG4gICAgICA8c3BhbiBtYXRTdWZmaXggKm5nSWY9XCJvcHRpb25zPy5zdWZmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvblJpZ2h0XCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5zdWZmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvblJpZ2h0XCI+PC9zcGFuPlxuICAgICAgPG1hdC1oaW50ICpuZ0lmPVwib3B0aW9ucz8uZGVzY3JpcHRpb24gJiYgKCFvcHRpb25zPy5zaG93RXJyb3JzIHx8ICFvcHRpb25zPy5lcnJvck1lc3NhZ2UpXCJcbiAgICAgICAgYWxpZ249XCJlbmRcIiBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uXCI+PC9tYXQtaGludD5cbiAgICA8L21hdC1mb3JtLWZpZWxkPlxuICAgIDxtYXQtZXJyb3IgKm5nSWY9XCJvcHRpb25zPy5zaG93RXJyb3JzICYmIG9wdGlvbnM/LmVycm9yTWVzc2FnZVwiXG4gICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmVycm9yTWVzc2FnZVwiPjwvbWF0LWVycm9yPmAsXG4gIHN0eWxlczogW2BcbiAgICBtYXQtZXJyb3IgeyBmb250LXNpemU6IDc1JTsgbWFyZ2luLXRvcDogLTFyZW07IG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfVxuICAgIDo6bmctZGVlcCBqc29uLXNjaGVtYS1mb3JtIG1hdC1mb3JtLWZpZWxkIC5tYXQtbWRjLWZvcm0tZmllbGQtd3JhcHBlciAubWF0LWZvcm0tZmllbGQtZmxleFxuICAgICAgLm1hdC1mb3JtLWZpZWxkLWluZml4IHsgd2lkdGg6IGluaXRpYWw7IH1cbiAgYF0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsU2VsZWN0Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgZm9ybUNvbnRyb2w6IEFic3RyYWN0Q29udHJvbDtcbiAgY29udHJvbE5hbWU6IHN0cmluZztcbiAgY29udHJvbFZhbHVlOiBhbnk7XG4gIGNvbnRyb2xEaXNhYmxlZCA9IGZhbHNlO1xuICBib3VuZENvbnRyb2wgPSBmYWxzZTtcbiAgb3B0aW9uczogYW55O1xuICBzZWxlY3RMaXN0OiBhbnlbXSA9IFtdO1xuICBpc0FycmF5ID0gaXNBcnJheTtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChNQVRfRk9STV9GSUVMRF9ERUZBVUxUX09QVElPTlMpIEBPcHRpb25hbCgpIHB1YmxpYyBtYXRGb3JtRmllbGREZWZhdWx0T3B0aW9ucyxcbiAgICBwcml2YXRlIGpzZjogSnNvblNjaGVtYUZvcm1TZXJ2aWNlXG4gICkgeyB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5sYXlvdXROb2RlLm9wdGlvbnMgfHwge307XG4gICAgdGhpcy5zZWxlY3RMaXN0ID0gYnVpbGRUaXRsZU1hcChcbiAgICAgIHRoaXMub3B0aW9ucy50aXRsZU1hcCB8fCB0aGlzLm9wdGlvbnMuZW51bU5hbWVzLFxuICAgICAgdGhpcy5vcHRpb25zLmVudW0sICEhdGhpcy5vcHRpb25zLnJlcXVpcmVkLCAhIXRoaXMub3B0aW9ucy5mbGF0TGlzdFxuICAgICk7XG4gICAgdGhpcy5qc2YuaW5pdGlhbGl6ZUNvbnRyb2wodGhpcywgIXRoaXMub3B0aW9ucy5yZWFkb25seSk7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMubm90aXRsZSAmJiAhdGhpcy5vcHRpb25zLmRlc2NyaXB0aW9uICYmIHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcikge1xuICAgICAgdGhpcy5vcHRpb25zLmRlc2NyaXB0aW9uID0gdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZhbHVlKGV2ZW50KSB7XG4gICAgdGhpcy5vcHRpb25zLnNob3dFcnJvcnMgPSB0cnVlO1xuICAgIHRoaXMuanNmLnVwZGF0ZVZhbHVlKHRoaXMsIGV2ZW50LnZhbHVlKTtcbiAgfVxufVxuIl19