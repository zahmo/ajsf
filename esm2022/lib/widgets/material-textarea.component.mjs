import { Component, Inject, Input, Optional } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import * as i0 from "@angular/core";
import * as i1 from "@zajsf/core";
import * as i2 from "@angular/common";
import * as i3 from "@angular/forms";
import * as i4 from "@angular/material/form-field";
import * as i5 from "@angular/material/input";
export class MaterialTextareaComponent {
    constructor(matFormFieldDefaultOptions, jsf) {
        this.matFormFieldDefaultOptions = matFormFieldDefaultOptions;
        this.jsf = jsf;
        this.controlDisabled = false;
        this.boundControl = false;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
        this.jsf.initializeControl(this);
        if (!this.options.notitle && !this.options.description && this.options.placeholder) {
            this.options.description = this.options.placeholder;
        }
    }
    updateValue(event) {
        this.jsf.updateValue(this, event.target.value);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: MaterialTextareaComponent, deps: [{ token: MAT_FORM_FIELD_DEFAULT_OPTIONS, optional: true }, { token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.2.3", type: MaterialTextareaComponent, selector: "material-textarea-widget", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, ngImport: i0, template: `
    <mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'fill'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
      [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
      [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <textarea matInput *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [required]="options?.required"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [style.width]="'100%'"
        (blur)="options.showErrors = true"></textarea>
      <textarea matInput *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [required]="options?.required"
        [disabled]="controlDisabled"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [style.width]="'100%'"
        [value]="controlValue"
        (input)="updateValue($event)"
        (blur)="options.showErrors = true"></textarea>
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
    </mat-form-field>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`, isInline: true, styles: ["mat-error{font-size:75%;margin-top:-1rem;margin-bottom:.5rem}::ng-deep json-schema-form mat-form-field .mat-mdc-form-field-wrapper .mat-form-field-flex .mat-form-field-infix{width:initial}\n"], dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i3.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: i4.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i4.MatLabel, selector: "mat-label" }, { kind: "directive", type: i4.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i4.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i4.MatPrefix, selector: "[matPrefix], [matIconPrefix], [matTextPrefix]", inputs: ["matTextPrefix"] }, { kind: "directive", type: i4.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "directive", type: i5.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.3", ngImport: i0, type: MaterialTextareaComponent, decorators: [{
            type: Component,
            args: [{ selector: 'material-textarea-widget', template: `
    <mat-form-field [appearance]="options?.appearance || matFormFieldDefaultOptions?.appearance || 'fill'"
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || matFormFieldDefaultOptions?.floatLabel || (options?.notitle ? 'never' : 'auto')"
      [hideRequiredMarker]="options?.hideRequired ? 'true' : 'false'"
      [style.width]="'100%'">
      <mat-label *ngIf="!options?.notitle">{{options?.title}}</mat-label>
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <textarea matInput *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [required]="options?.required"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [style.width]="'100%'"
        (blur)="options.showErrors = true"></textarea>
      <textarea matInput *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
        [attr.maxlength]="options?.maxLength"
        [attr.minlength]="options?.minLength"
        [attr.pattern]="options?.pattern"
        [required]="options?.required"
        [disabled]="controlDisabled"
        [id]="'control' + layoutNode?._id"
        [name]="controlName"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [readonly]="options?.readonly ? 'readonly' : null"
        [style.width]="'100%'"
        [value]="controlValue"
        (input)="updateValue($event)"
        (blur)="options.showErrors = true"></textarea>
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
    </mat-form-field>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`, styles: ["mat-error{font-size:75%;margin-top:-1rem;margin-bottom:.5rem}::ng-deep json-schema-form mat-form-field .mat-mdc-form-field-wrapper .mat-form-field-flex .mat-form-field-infix{width:initial}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_FORM_FIELD_DEFAULT_OPTIONS]
                }, {
                    type: Optional
                }] }, { type: i1.JsonSchemaFormService }], propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtdGV4dGFyZWEuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtbWF0ZXJpYWwvc3JjL2xpYi93aWRnZXRzL21hdGVyaWFsLXRleHRhcmVhLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQVUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNFLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7Ozs7O0FBMEQ5RSxNQUFNLE9BQU8seUJBQXlCO0lBV3BDLFlBQzZELDBCQUEwQixFQUM3RSxHQUEwQjtRQUR5QiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQUE7UUFDN0UsUUFBRyxHQUFILEdBQUcsQ0FBdUI7UUFUcEMsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDeEIsaUJBQVksR0FBRyxLQUFLLENBQUM7SUFTakIsQ0FBQztJQUVMLFFBQVE7UUFDTixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQ2xGLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ3JEO0lBQ0gsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFLO1FBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakQsQ0FBQzs4R0ExQlUseUJBQXlCLGtCQVkxQiw4QkFBOEI7a0dBWjdCLHlCQUF5QiwwSkFwRDFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dURBNkMyQzs7MkZBTzFDLHlCQUF5QjtrQkF2RHJDLFNBQVM7K0JBRUUsMEJBQTBCLFlBQzFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dURBNkMyQzs7MEJBbUJsRCxNQUFNOzJCQUFDLDhCQUE4Qjs7MEJBQUcsUUFBUTs2RUFMMUMsVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdCwgSW5wdXQsIE9uSW5pdCwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE1BVF9GT1JNX0ZJRUxEX0RFRkFVTFRfT1BUSU9OUyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnQHphanNmL2NvcmUnO1xuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ21hdGVyaWFsLXRleHRhcmVhLXdpZGdldCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPG1hdC1mb3JtLWZpZWxkIFthcHBlYXJhbmNlXT1cIm9wdGlvbnM/LmFwcGVhcmFuY2UgfHwgbWF0Rm9ybUZpZWxkRGVmYXVsdE9wdGlvbnM/LmFwcGVhcmFuY2UgfHwgJ2ZpbGwnXCJcbiAgICAgIFtjbGFzc109XCJvcHRpb25zPy5odG1sQ2xhc3MgfHwgJydcIlxuICAgICAgW2Zsb2F0TGFiZWxdPVwib3B0aW9ucz8uZmxvYXRMYWJlbCB8fCBtYXRGb3JtRmllbGREZWZhdWx0T3B0aW9ucz8uZmxvYXRMYWJlbCB8fCAob3B0aW9ucz8ubm90aXRsZSA/ICduZXZlcicgOiAnYXV0bycpXCJcbiAgICAgIFtoaWRlUmVxdWlyZWRNYXJrZXJdPVwib3B0aW9ucz8uaGlkZVJlcXVpcmVkID8gJ3RydWUnIDogJ2ZhbHNlJ1wiXG4gICAgICBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCI+XG4gICAgICA8bWF0LWxhYmVsICpuZ0lmPVwiIW9wdGlvbnM/Lm5vdGl0bGVcIj57e29wdGlvbnM/LnRpdGxlfX08L21hdC1sYWJlbD5cbiAgICAgIDxzcGFuIG1hdFByZWZpeCAqbmdJZj1cIm9wdGlvbnM/LnByZWZpeCB8fCBvcHRpb25zPy5maWVsZEFkZG9uTGVmdFwiXG4gICAgICAgIFtpbm5lckhUTUxdPVwib3B0aW9ucz8ucHJlZml4IHx8IG9wdGlvbnM/LmZpZWxkQWRkb25MZWZ0XCI+PC9zcGFuPlxuICAgICAgPHRleHRhcmVhIG1hdElucHV0ICpuZ0lmPVwiYm91bmRDb250cm9sXCJcbiAgICAgICAgW2Zvcm1Db250cm9sXT1cImZvcm1Db250cm9sXCJcbiAgICAgICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWQgKyAnU3RhdHVzJ1wiXG4gICAgICAgIFthdHRyLmxpc3RdPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ0F1dG9jb21wbGV0ZSdcIlxuICAgICAgICBbYXR0ci5tYXhsZW5ndGhdPVwib3B0aW9ucz8ubWF4TGVuZ3RoXCJcbiAgICAgICAgW2F0dHIubWlubGVuZ3RoXT1cIm9wdGlvbnM/Lm1pbkxlbmd0aFwiXG4gICAgICAgIFthdHRyLnBhdHRlcm5dPVwib3B0aW9ucz8ucGF0dGVyblwiXG4gICAgICAgIFtyZXF1aXJlZF09XCJvcHRpb25zPy5yZXF1aXJlZFwiXG4gICAgICAgIFtpZF09XCInY29udHJvbCcgKyBsYXlvdXROb2RlPy5faWRcIlxuICAgICAgICBbbmFtZV09XCJjb250cm9sTmFtZVwiXG4gICAgICAgIFtwbGFjZWhvbGRlcl09XCJvcHRpb25zPy5ub3RpdGxlID8gb3B0aW9ucz8ucGxhY2Vob2xkZXIgOiBvcHRpb25zPy50aXRsZVwiXG4gICAgICAgIFtyZWFkb25seV09XCJvcHRpb25zPy5yZWFkb25seSA/ICdyZWFkb25seScgOiBudWxsXCJcbiAgICAgICAgW3N0eWxlLndpZHRoXT1cIicxMDAlJ1wiXG4gICAgICAgIChibHVyKT1cIm9wdGlvbnMuc2hvd0Vycm9ycyA9IHRydWVcIj48L3RleHRhcmVhPlxuICAgICAgPHRleHRhcmVhIG1hdElucHV0ICpuZ0lmPVwiIWJvdW5kQ29udHJvbFwiXG4gICAgICAgIFthdHRyLmFyaWEtZGVzY3JpYmVkYnldPVwiJ2NvbnRyb2wnICsgbGF5b3V0Tm9kZT8uX2lkICsgJ1N0YXR1cydcIlxuICAgICAgICBbYXR0ci5saXN0XT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZCArICdBdXRvY29tcGxldGUnXCJcbiAgICAgICAgW2F0dHIubWF4bGVuZ3RoXT1cIm9wdGlvbnM/Lm1heExlbmd0aFwiXG4gICAgICAgIFthdHRyLm1pbmxlbmd0aF09XCJvcHRpb25zPy5taW5MZW5ndGhcIlxuICAgICAgICBbYXR0ci5wYXR0ZXJuXT1cIm9wdGlvbnM/LnBhdHRlcm5cIlxuICAgICAgICBbcmVxdWlyZWRdPVwib3B0aW9ucz8ucmVxdWlyZWRcIlxuICAgICAgICBbZGlzYWJsZWRdPVwiY29udHJvbERpc2FibGVkXCJcbiAgICAgICAgW2lkXT1cIidjb250cm9sJyArIGxheW91dE5vZGU/Ll9pZFwiXG4gICAgICAgIFtuYW1lXT1cImNvbnRyb2xOYW1lXCJcbiAgICAgICAgW3BsYWNlaG9sZGVyXT1cIm9wdGlvbnM/Lm5vdGl0bGUgPyBvcHRpb25zPy5wbGFjZWhvbGRlciA6IG9wdGlvbnM/LnRpdGxlXCJcbiAgICAgICAgW3JlYWRvbmx5XT1cIm9wdGlvbnM/LnJlYWRvbmx5ID8gJ3JlYWRvbmx5JyA6IG51bGxcIlxuICAgICAgICBbc3R5bGUud2lkdGhdPVwiJzEwMCUnXCJcbiAgICAgICAgW3ZhbHVlXT1cImNvbnRyb2xWYWx1ZVwiXG4gICAgICAgIChpbnB1dCk9XCJ1cGRhdGVWYWx1ZSgkZXZlbnQpXCJcbiAgICAgICAgKGJsdXIpPVwib3B0aW9ucy5zaG93RXJyb3JzID0gdHJ1ZVwiPjwvdGV4dGFyZWE+XG4gICAgICA8c3BhbiBtYXRTdWZmaXggKm5nSWY9XCJvcHRpb25zPy5zdWZmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvblJpZ2h0XCJcbiAgICAgICAgW2lubmVySFRNTF09XCJvcHRpb25zPy5zdWZmaXggfHwgb3B0aW9ucz8uZmllbGRBZGRvblJpZ2h0XCI+PC9zcGFuPlxuICAgICAgPG1hdC1oaW50ICpuZ0lmPVwib3B0aW9ucz8uZGVzY3JpcHRpb24gJiYgKCFvcHRpb25zPy5zaG93RXJyb3JzIHx8ICFvcHRpb25zPy5lcnJvck1lc3NhZ2UpXCJcbiAgICAgICAgYWxpZ249XCJlbmRcIiBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmRlc2NyaXB0aW9uXCI+PC9tYXQtaGludD5cbiAgICA8L21hdC1mb3JtLWZpZWxkPlxuICAgIDxtYXQtZXJyb3IgKm5nSWY9XCJvcHRpb25zPy5zaG93RXJyb3JzICYmIG9wdGlvbnM/LmVycm9yTWVzc2FnZVwiXG4gICAgICBbaW5uZXJIVE1MXT1cIm9wdGlvbnM/LmVycm9yTWVzc2FnZVwiPjwvbWF0LWVycm9yPmAsXG4gIHN0eWxlczogW2BcbiAgICBtYXQtZXJyb3IgeyBmb250LXNpemU6IDc1JTsgbWFyZ2luLXRvcDogLTFyZW07IG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfVxuICAgIDo6bmctZGVlcCBqc29uLXNjaGVtYS1mb3JtIG1hdC1mb3JtLWZpZWxkIC5tYXQtbWRjLWZvcm0tZmllbGQtd3JhcHBlciAubWF0LWZvcm0tZmllbGQtZmxleFxuICAgICAgLm1hdC1mb3JtLWZpZWxkLWluZml4IHsgd2lkdGg6IGluaXRpYWw7IH1cbiAgYF0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsVGV4dGFyZWFDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBmb3JtQ29udHJvbDogQWJzdHJhY3RDb250cm9sO1xuICBjb250cm9sTmFtZTogc3RyaW5nO1xuICBjb250cm9sVmFsdWU6IGFueTtcbiAgY29udHJvbERpc2FibGVkID0gZmFsc2U7XG4gIGJvdW5kQ29udHJvbCA9IGZhbHNlO1xuICBvcHRpb25zOiBhbnk7XG4gIEBJbnB1dCgpIGxheW91dE5vZGU6IGFueTtcbiAgQElucHV0KCkgbGF5b3V0SW5kZXg6IG51bWJlcltdO1xuICBASW5wdXQoKSBkYXRhSW5kZXg6IG51bWJlcltdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTUFUX0ZPUk1fRklFTERfREVGQVVMVF9PUFRJT05TKSBAT3B0aW9uYWwoKSBwdWJsaWMgbWF0Rm9ybUZpZWxkRGVmYXVsdE9wdGlvbnMsXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuanNmLmluaXRpYWxpemVDb250cm9sKHRoaXMpO1xuICAgIGlmICghdGhpcy5vcHRpb25zLm5vdGl0bGUgJiYgIXRoaXMub3B0aW9ucy5kZXNjcmlwdGlvbiAmJiB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5kZXNjcmlwdGlvbiA9IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcjtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWYWx1ZShldmVudCkge1xuICAgIHRoaXMuanNmLnVwZGF0ZVZhbHVlKHRoaXMsIGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH1cbn1cbiJdfQ==