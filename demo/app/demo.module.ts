import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Bootstrap3FrameworkModule } from '@zajsf/bootstrap3';
import { Bootstrap4FrameworkModule } from '@zajsf/bootstrap4';
import { Framework, JsonSchemaFormModule } from '@zajsf/core';


import { DaisyUIFrameworkModule } from '@zajsf/daisyui';
import { MaterialDesignFrameworkModule } from '@zajsf/material';

import { CSS_FRAMEWORK_CFG, CssFramework, CssFrameworkModule, css_fw } from '@zajsf/cssframework';
import { AceEditorDirective } from './ace-editor.directive';
import { DemoRootComponent } from './demo-root.component';
import { DemoComponent } from './demo.component';
import { routes } from './demo.routes';


let cssFrameworkCfgBootstrap4:css_fw.frameworkcfg={
    "name":"cssfw-bootstrap4",
    "scripts": [
        "//code.jquery.com/jquery-3.3.1.slim.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js",
        "//stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
    ],
    "stylesheets": [
        "//stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
        "/assets/cssframework-assets/bootstrap5-framework.css"
    ],
    "widgetstyles": {
        "__themes__": [
            "bootstrap4_default"
        ],
        "$ref": {
            "fieldHtmlClass": "btn pull-right btn-default"
        },
        "__array_item_nonref__": {
            "htmlClass": "list-group-item"
        },
        "__form_group__": {
            "htmlClass": "form-group"
        },
        "__control_label__": {
            "labelHtmlClass": "control-label"
        },
        "__active__": {
            "activeClass": "active"
        },
        "__required_asterisk__": "text-danger",
        "__screen_reader__": "sr-only",
        "__remove_item__": "close pull-right",
        "__help_block__": "help-block",
        "__field_addon_left__": "input-group-text input-group-prepend",
        "__field_addon_right__": "input-group-text input-group-append",
        "alt-date": {},
        "alt-datetime": {},
        "__array__": {
            "htmlClass": "list-group"
        },
        "array": {},
        "authfieldset": {},
        "advancedfieldset": {},
        "button": {
            "fieldHtmlClass": "btn btn-sm btn-info"
        },
        "checkbox": { "fieldHtmlClass": "checkbox" },
        "checkboxes": {
            "fieldHtmlClass": "checkbox"
        },
        "checkboxbuttons": {
            "fieldHtmlClass": "sr-only",
            "htmlClass": "btn-group",
            "itemLabelHtmlClass": "btn"
        },
        "checkboxes-inline": {
            "htmlClass": "checkbox",
            "itemLabelHtmlClass": "checkbox-inline"
        },
        "date": {},
        "datetime-local": {},
        "fieldset": {},
        "integer": {},
        "number": {},
        "optionfieldset": {},
        "password": {},
        "radiobuttons": {
            "fieldHtmlClass": "sr-only",
            "htmlClass": "btn-group",
            "itemLabelHtmlClass": "btn"
        },
        "radio": { "fieldHtmlClass": "radio" },
        "radios": {
            "fieldHtmlClass": "radio"
        },
        "radios-inline": {
            "htmlClass": "radio",
            "itemLabelHtmlClass": "radio-inline"
        },
        "range": {},
        "section": {},
        "selectfieldset": {},
        "select": {},
        "submit": {
            "fieldHtmlClass": "btn btn-info"
        },
        "text": {},
        "tabs": {
            "labelHtmlClass": "nav nav-tabs",
            "htmlClass": "tab-content",
            "fieldHtmlClass": "tab-pane"
        },
        "tabarray": {
            "labelHtmlClass": "nav nav-tabs",
            "htmlClass": "tab-content",
            "fieldHtmlClass": "tab-pane"
        },
        "textarea": {},
        "default": {
            "fieldHtmlClass": "form-control"
        }
    }
}

let cssFrameworkCfgDaisyUI:css_fw.frameworkcfg={
    "name": "cssfw-daisyui",
    "scripts": [],
    "stylesheets": [
        "/assets/cssframework-assets/daisyui-framework.css"
    ],
    "widgetstyles": {
        "__themes__": [
            "zajsf_default"
        ],
        "$ref": {
            "fieldHtmlClass": "btn btn-sm btn-info pull-right"
        },
        "__array_item_nonref__": {
            "htmlClass": "border shadow-md p-1"
        },
        "__form_group__": {
            "htmlClass": "mb-1"
        },
        "__control_label__": {
            "labelHtmlClass": "control-label"
        },
        "__active__": {
            "activeClass": "active"
        },
        "__required_asterisk__": "text-danger",
        "__screen_reader__": "sr-only",
        "__remove_item__": "float-right text-2xl opacity-50",
        "__help_block__": "help-block",
        "__field_addon_left__": "input-group-addon",
        "__field_addon_right__": "input-group-addon",
        "alt-date": {
            "fieldHtmlClass": "input input-md input-bordered w-full"
        },
        "alt-datetime": {
            "fieldHtmlClass": "input input-md input-bordered w-full"
        },
        "__array__": {
            "htmlClass": "border shadow-md p-1"
        },
        "array": {},
        "authfieldset": {},
        "advancedfieldset": {},
        "button": {
            "fieldHtmlClass": "btn btn-sm btn-info"
        },
        "checkbox": {
            "fieldHtmlClass": "checkbox"
        },
        "checkboxes": {
            "fieldHtmlClass": "checkbox"
        },
        "checkboxbuttons": {
            "fieldHtmlClass": "w-px",
            "labelHtmlClass": "tabs tabs-boxed",
            "htmlClass": "btn-group",
            "itemLabelHtmlClass": "btn",
            "activeClass": "btn-info"
        },
        "checkboxes-inline": {
            "fieldHtmlClass": "checkbox",
            "htmlClass": "inline-flex",
            "itemLabelHtmlClass": "checkbox-inline"
        },
        "date": {
            "fieldHtmlClass": "input input-md input-bordered w-full"
        },
        "datetime-local": {
            "fieldHtmlClass": "input input-md input-bordered w-full"
        },
        "fieldset": {},
        "integer": {
            "fieldHtmlClass": "input input-md input-bordered w-full max-w-xs"
        },
        "number": {
            "fieldHtmlClass": "input input-md input-bordered w-full max-w-xs"
        },
        "optionfieldset": {},
        "password": {
            "fieldHtmlClass": "input input-md input-bordered w-full"
        },
        "radiobuttons": {
            "fieldHtmlClass": "w-px",
            "labelHtmlClass": "tabs tabs-boxed",
            "htmlClass": "btn-group",
            "itemLabelHtmlClass": "btn",
            "activeClass": "btn-info"
        },
        "radio": {
            "fieldHtmlClass": "radio"
        },
        "radios": {
            "fieldHtmlClass": "radio"
        },
        "radios-inline": {
            "htmlClass": "inline-flex",
            "fieldHtmlClass": "radio",
            "itemLabelHtmlClass": "radio-inline"
        },
        "range": {
            "fieldHtmlClass": "range range-info"
        },
        "section": {},
        "selectfieldset": {},
        "select": {
            "fieldHtmlClass": "select select-md select-bordered w-full"
        },
        "submit": {
            "fieldHtmlClass": "btn btn-sm btn-info rounded-full"
        },
        "text": {
            "fieldHtmlClass": "input input-md input-bordered w-full"
        },
        "tabs": {
            "labelHtmlClass": "tabs tabs-boxed",
            "htmlClass": "",
            "itemLabelHtmlClass": "tab",
            "activeClass": "tab-active"
        },
        "tabarray": {
            "labelHtmlClass": "tabs tabs-boxed",
            "htmlClass": "",
            "itemLabelHtmlClass": "tab",
            "activeClass": "tab-active"
        },
        "textarea": {
            "fieldHtmlClass": "textarea textarea-bordered w-full"
        },
        "default": {
            "fieldHtmlClass": "form-control"
        }
    }
}

let cssFrameworkCfgBootstrap5:css_fw.frameworkcfg={
    "name": "cssfw-bootstrap5",
    "scripts": [

        "//cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"

    ],
    "stylesheets": [
        "//cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
        "/assets/cssframework-assets/bootstrap5-framework.css"
    ],
    "widgetstyles": {
        "__themes__": [
            "bootstrap5_default"
        ],
        "$ref": {
            "fieldHtmlClass": "btn pull-right btn-default"
        },
        "__array_item_nonref__": {
            "htmlClass": "list-group-item"
        },
        "__form_group__": {
            "htmlClass": "form-group"
        },
        "__control_label__": {
            "labelHtmlClass": "control-label"
        },
        "__active__": {
            "activeClass": "active"
        },
        "__required_asterisk__": "text-danger",
        "__screen_reader__": "visually-hidden",
        "__remove_item__": "btn-close  float-end",
        "__help_block__": "help-block",
        "__field_addon_left__": "input-group-text",
        "__field_addon_right__": "input-group-text",
        "alt-date": {},
        "alt-datetime": {},
        "__array__": {
            "htmlClass": "list-group"
        },
        "array": {},
        "authfieldset": {},
        "advancedfieldset": {},
        "button": {
            "fieldHtmlClass": "btn btn-sm btn-info"
        },
        "checkbox": { "fieldHtmlClass": "checkbox" },
        "checkboxes": {
            "fieldHtmlClass": "checkbox"
        },
        "checkboxbuttons": {
            "fieldHtmlClass": "sr-only",
            "htmlClass": "btn-group",
            "itemLabelHtmlClass": "btn"
        },
        "checkboxes-inline": {
            "htmlClass": "checkbox",
            "itemLabelHtmlClass": "checkbox-inline"
        },
        "date": {},
        "datetime-local": {},
        "fieldset": {},
        "integer": {},
        "number": {},
        "optionfieldset": {},
        "password": {},
        "radiobuttons": {
            "fieldHtmlClass": "sr-only",
            "htmlClass": "btn-group",
            "itemLabelHtmlClass": "btn"
        },
        "radio": { "fieldHtmlClass": "radio" },
        "radios": {
            "fieldHtmlClass": "radio"
        },
        "radios-inline": {
            "htmlClass": "radio",
            "itemLabelHtmlClass": "radio-inline"
        },
        "range": {},
        "section": {},
        "selectfieldset": {},
        "select": {},
        "submit": {
            "fieldHtmlClass": "btn btn-info"
        },
        "text": {},
        "tabs": {
            "labelHtmlClass": "nav nav-tabs",
            "htmlClass": "tab-content",
            "fieldHtmlClass": "tab-pane"
        },
        "tabarray": {
            "labelHtmlClass": "nav nav-tabs",
            "htmlClass": "tab-content",
            "fieldHtmlClass": "tab-pane"
        },
        "textarea": {},
        "default": {
            "fieldHtmlClass": "form-control"
        }
    }
}

@NgModule({
  declarations: [AceEditorDirective, DemoComponent, DemoRootComponent],
  imports: [
    BrowserModule, BrowserAnimationsModule, FormsModule,
    HttpClientModule, MatButtonModule, MatCardModule, MatCheckboxModule,
    MatIconModule, MatMenuModule, MatSelectModule, MatToolbarModule,
    RouterModule.forRoot(routes, {}),
    Bootstrap4FrameworkModule,
    Bootstrap3FrameworkModule,
    MaterialDesignFrameworkModule,
    DaisyUIFrameworkModule,
    CssFrameworkModule,
    JsonSchemaFormModule
  ],
  bootstrap: [DemoRootComponent],
  providers:[
    {provide:CSS_FRAMEWORK_CFG,useValue:cssFrameworkCfgBootstrap4,multi:true},
    {provide:CSS_FRAMEWORK_CFG,useValue:cssFrameworkCfgDaisyUI,multi:true},
    {provide:CSS_FRAMEWORK_CFG,useValue:cssFrameworkCfgBootstrap5,multi:true},
    { provide: Framework, useValue: new CssFramework(cssFrameworkCfgBootstrap4), multi: true },
    { provide: Framework, useValue: new CssFramework(cssFrameworkCfgDaisyUI), multi: true },
    { provide: Framework, useValue: new CssFramework(cssFrameworkCfgBootstrap4), multi: true },
    { provide: Framework, useValue: new CssFramework(cssFrameworkCfgBootstrap5), multi: true },
  ]
})

export class DemoModule { }
