import { ChangeDetectorRef, OnChanges, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
import * as i0 from "@angular/core";
/**
 * Bootstrap 3 framework for Angular JSON Schema Form.
 */
export declare class Bootstrap3FrameworkComponent implements OnInit, OnChanges {
    changeDetector: ChangeDetectorRef;
    jsf: JsonSchemaFormService;
    frameworkInitialized: boolean;
    widgetOptions: any;
    widgetLayoutNode: any;
    options: any;
    formControl: any;
    debugOutput: any;
    debug: any;
    parentArray: any;
    isOrderable: boolean;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(changeDetector: ChangeDetectorRef, jsf: JsonSchemaFormService);
    get showRemoveButton(): boolean;
    ngOnInit(): void;
    ngOnChanges(): void;
    initializeFramework(): void;
    updateHelpBlock(status: any): void;
    setTitle(): string;
    removeItem(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<Bootstrap3FrameworkComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Bootstrap3FrameworkComponent, "bootstrap-3-framework", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false, never>;
}
