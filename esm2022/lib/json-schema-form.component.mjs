import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JsonSchemaFormService } from './json-schema-form.service';
import { convertSchemaToDraft6 } from './shared/convert-schema-to-draft6.function';
import { resolveSchemaReferences } from './shared/json-schema.functions';
import { JsonPointer } from './shared/jsonpointer.functions';
import { forEach, hasOwn } from './shared/utility.functions';
import { hasValue, inArray, isArray, isEmpty, isObject } from './shared/validator.functions';
import * as i0 from "@angular/core";
import * as i1 from "./framework-library/framework-library.service";
import * as i2 from "./widget-library/widget-library.service";
import * as i3 from "./json-schema-form.service";
import * as i4 from "@angular/common";
import * as i5 from "@angular/forms";
import * as i6 from "./widget-library/root.component";
export const JSON_SCHEMA_FORM_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => JsonSchemaFormComponent),
    multi: true,
};
/**
 * @module 'JsonSchemaFormComponent' - Angular JSON Schema Form
 *
 * Root module of the Angular JSON Schema Form client-side library,
 * an Angular library which generates an HTML form from a JSON schema
 * structured data model and/or a JSON Schema Form layout description.
 *
 * This library also validates input data by the user, using both validators on
 * individual controls to provide real-time feedback while the user is filling
 * out the form, and then validating the entire input against the schema when
 * the form is submitted to make sure the returned JSON data object is valid.
 *
 * This library is similar to, and mostly API compatible with:
 *
 * - JSON Schema Form's Angular Schema Form library for AngularJs
 *   http://schemaform.io
 *   http://schemaform.io/examples/bootstrap-example.html (examples)
 *
 * - Mozilla's react-jsonschema-form library for React
 *   https://github.com/mozilla-services/react-jsonschema-form
 *   https://mozilla-services.github.io/react-jsonschema-form (examples)
 *
 * - Joshfire's JSON Form library for jQuery
 *   https://github.com/joshfire/jsonform
 *   http://ulion.github.io/jsonform/playground (examples)
 *
 * This library depends on:
 *  - Angular (obviously)                  https://angular.io
 *  - lodash, JavaScript utility library   https://github.com/lodash/lodash
 *  - ajv, Another JSON Schema validator   https://github.com/epoberezkin/ajv
 *
 * In addition, the Example Playground also depends on:
 *  - brace, Browserified Ace editor       http://thlorenz.github.io/brace
 */
export class JsonSchemaFormComponent {
    get value() {
        return this.objectWrap ? this.jsf.data['1'] : this.jsf.data;
    }
    set value(value) {
        this.setFormValues(value, false);
    }
    constructor(changeDetector, frameworkLibrary, widgetLibrary, jsf) {
        this.changeDetector = changeDetector;
        this.frameworkLibrary = frameworkLibrary;
        this.widgetLibrary = widgetLibrary;
        this.jsf = jsf;
        // TODO: quickfix to avoid subscribing twice to the same emitters
        this.unsubscribeOnActivateForm$ = new Subject();
        this.formValueSubscription = null;
        this.formInitialized = false;
        this.objectWrap = false; // Is non-object input schema wrapped in an object?
        this.previousInputs = {
            schema: null, layout: null, data: null, options: null, framework: null,
            widgets: null, form: null, model: null, JSONSchema: null, UISchema: null,
            formData: null, loadExternalAssets: null, debug: null,
        };
        // Outputs
        this.onChanges = new EventEmitter(); // Live unvalidated internal form data
        this.onSubmit = new EventEmitter(); // Complete validated form data
        this.isValid = new EventEmitter(); // Is current data valid?
        this.validationErrors = new EventEmitter(); // Validation errors (if any)
        this.formSchema = new EventEmitter(); // Final schema used to create form
        this.formLayout = new EventEmitter(); // Final layout used to create form
        // Outputs for possible 2-way data binding
        // Only the one input providing the initial form data will be bound.
        // If there is no inital data, input '{}' to activate 2-way data binding.
        // There is no 2-way binding if inital data is combined inside the 'form' input.
        this.dataChange = new EventEmitter();
        this.modelChange = new EventEmitter();
        this.formDataChange = new EventEmitter();
        this.ngModelChange = new EventEmitter();
    }
    ngOnDestroy() {
        this.dataChangesSubs?.unsubscribe();
        this.statusChangesSubs?.unsubscribe();
        this.isValidChangesSubs?.unsubscribe();
        this.validationErrorChangesSubs?.unsubscribe();
        this.dataChangesSubs = null;
        this.statusChangesSubs = null;
        this.isValidChangesSubs = null;
        this.validationErrorChangesSubs = null;
    }
    resetScriptsAndStyleSheets() {
        document.querySelectorAll('.ajsf').forEach(element => element.remove());
    }
    loadScripts(scriptList) {
        const scripts = scriptList || this.frameworkLibrary.getFrameworkScripts();
        scripts.map(script => {
            const scriptTag = document.createElement('script');
            scriptTag.src = script;
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.setAttribute('class', 'ajsf');
            document.getElementsByTagName('head')[0].appendChild(scriptTag);
        });
    }
    loadStyleSheets(styleList) {
        const stylesheets = styleList || this.frameworkLibrary.getFrameworkStylesheets();
        stylesheets.map(stylesheet => {
            const linkTag = document.createElement('link');
            linkTag.rel = 'stylesheet';
            linkTag.href = stylesheet;
            linkTag.setAttribute('class', 'ajsf');
            document.getElementsByTagName('head')[0].appendChild(linkTag);
        });
    }
    loadAssets() {
        this.frameworkLibrary.getFrameworkAssetConfig().then(assetCfg => {
            this.resetScriptsAndStyleSheets();
            this.loadScripts(assetCfg.scripts);
            this.loadStyleSheets(assetCfg.stylesheets);
        }).catch(err => {
            console.log(err);
            this.resetScriptsAndStyleSheets();
            this.loadScripts();
            this.loadStyleSheets();
        });
    }
    ngOnInit() {
        this.updateForm();
        this.loadAssets();
    }
    ngOnChanges(changes) {
        this.updateForm();
        // Check if there's changes in Framework then load assets if that's the
        if (changes.framework) {
            if (!changes.framework.isFirstChange() &&
                (changes.framework.previousValue !== changes.framework.currentValue)) {
                this.loadAssets();
            }
        }
    }
    writeValue(value) {
        this.setFormValues(value, false);
        if (!this.formValuesInput) {
            this.formValuesInput = 'ngModel';
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    //see note
    //https://angular.io/guide/update-to-version-15#v15-bc-06
    setDisabledState(isDisabled) {
        if (this.jsf.formOptions.formDisabled !== !!isDisabled) {
            this.jsf.formOptions.formDisabled = !!isDisabled;
            this.initializeForm();
        }
    }
    updateForm() {
        let changedData;
        if (!this.formInitialized || !this.formValuesInput ||
            (this.language && this.language !== this.jsf.language)) {
            this.initializeForm();
        }
        else {
            if (this.language && this.language !== this.jsf.language) {
                this.jsf.setLanguage(this.language);
            }
            // Get names of changed inputs
            let changedInput = Object.keys(this.previousInputs)
                .filter(input => this.previousInputs[input] !== this[input]);
            let resetFirst = true;
            if (changedInput.length === 1 && changedInput[0] === 'form' &&
                this.formValuesInput.startsWith('form.')) {
                // If only 'form' input changed, get names of changed keys
                changedInput = Object.keys(this.previousInputs.form || {})
                    .filter(key => !isEqual(this.previousInputs.form[key], this.form[key]))
                    .map(key => `form.${key}`);
                resetFirst = false;
            }
            // If only input values have changed, update the form values
            if (changedInput.length === 1 && changedInput[0] === this.formValuesInput) {
                if (this.formValuesInput.indexOf('.') === -1) {
                    changedData = this[this.formValuesInput];
                    this.setFormValues(changedData, resetFirst);
                }
                else {
                    const [input, key] = this.formValuesInput.split('.');
                    changedData = this[input][key];
                    this.setFormValues(changedData, resetFirst);
                }
                // If anything else has changed, re-render the entire form
            }
            else if (changedInput.length) {
                this.initializeForm(changedData);
                if (this.onChange) {
                    this.onChange(this.jsf.formValues);
                }
                if (this.onTouched) {
                    this.onTouched(this.jsf.formValues);
                }
            }
            //set framework theme
            if (this.theme && this.theme !== this.frameworkLibrary.getActiveTheme()?.name) {
                this.frameworkLibrary.requestThemeChange(this.theme);
            }
            // Update previous inputs
            Object.keys(this.previousInputs)
                .filter(input => this.previousInputs[input] !== this[input])
                .forEach(input => this.previousInputs[input] = this[input]);
        }
    }
    setFormValues(formValues, resetFirst = true) {
        if (formValues) {
            const newFormValues = this.objectWrap ? formValues['1'] : formValues;
            if (!this.jsf.formGroup) {
                this.jsf.formValues = formValues;
                this.activateForm();
            }
            else if (resetFirst) { //changed to avoid reset events
                this.jsf.formGroup.reset({}, { emitEvent: false });
            }
            if (this.jsf.formGroup) { //changed to avoid reset events
                this.jsf.formGroup.patchValue(newFormValues, { emitEvent: false });
            }
            if (this.onChange) {
                this.onChange(newFormValues);
            }
            if (this.onTouched) {
                this.onTouched(newFormValues);
            }
        }
        else {
            this.jsf.formGroup.reset();
        }
    }
    submitForm() {
        const validData = this.jsf.validData;
        this.onSubmit.emit(this.objectWrap ? validData['1'] : validData);
    }
    /**
     * 'initializeForm' function
     *
     * - Update 'schema', 'layout', and 'formValues', from inputs.
     *
     * - Create 'schemaRefLibrary' and 'schemaRecursiveRefMap'
     *   to resolve schema $ref links, including recursive $ref links.
     *
     * - Create 'dataRecursiveRefMap' to resolve recursive links in data
     *   and corectly set output formats for recursively nested values.
     *
     * - Create 'layoutRefLibrary' and 'templateRefLibrary' to store
     *   new layout nodes and formGroup elements to use when dynamically
     *   adding form components to arrays and recursive $ref points.
     *
     * - Create 'dataMap' to map the data to the schema and template.
     *
     * - Create the master 'formGroupTemplate' then from it 'formGroup'
     *   the Angular formGroup used to control the reactive form.
     */
    initializeForm(initialData) {
        if (this.schema || this.layout || this.data || this.form || this.model ||
            this.JSONSchema || this.UISchema || this.formData || this.ngModel ||
            this.jsf.data) {
            // Reset all form values to defaults
            this.jsf.resetAllValues();
            this.initializeOptions(); // Update options
            this.initializeSchema(); // Update schema, schemaRefLibrary,
            // schemaRecursiveRefMap, & dataRecursiveRefMap
            this.initializeLayout(); // Update layout, layoutRefLibrary,
            this.initializeData(); // Update formValues
            if (initialData) {
                this.jsf.formValues = initialData;
            }
            this.activateForm(); // Update dataMap, templateRefLibrary,
            // formGroupTemplate, formGroup
            // Uncomment individual lines to output debugging information to console:
            // (These always work.)
            // console.log('loading form...');
            // console.log('schema', this.jsf.schema);
            // console.log('layout', this.jsf.layout);
            // console.log('options', this.options);
            // console.log('formValues', this.jsf.formValues);
            // console.log('formGroupTemplate', this.jsf.formGroupTemplate);
            // console.log('formGroup', this.jsf.formGroup);
            // console.log('formGroup.value', this.jsf.formGroup.value);
            // console.log('schemaRefLibrary', this.jsf.schemaRefLibrary);
            // console.log('layoutRefLibrary', this.jsf.layoutRefLibrary);
            // console.log('templateRefLibrary', this.jsf.templateRefLibrary);
            // console.log('dataMap', this.jsf.dataMap);
            // console.log('arrayMap', this.jsf.arrayMap);
            // console.log('schemaRecursiveRefMap', this.jsf.schemaRecursiveRefMap);
            // console.log('dataRecursiveRefMap', this.jsf.dataRecursiveRefMap);
            // Uncomment individual lines to output debugging information to browser:
            // (These only work if the 'debug' option has also been set to 'true'.)
            if (this.debug || this.jsf.formOptions.debug) {
                const vars = [];
                // vars.push(this.jsf.schema);
                // vars.push(this.jsf.layout);
                // vars.push(this.options);
                // vars.push(this.jsf.formValues);
                // vars.push(this.jsf.formGroup.value);
                // vars.push(this.jsf.formGroupTemplate);
                // vars.push(this.jsf.formGroup);
                // vars.push(this.jsf.schemaRefLibrary);
                // vars.push(this.jsf.layoutRefLibrary);
                // vars.push(this.jsf.templateRefLibrary);
                // vars.push(this.jsf.dataMap);
                // vars.push(this.jsf.arrayMap);
                // vars.push(this.jsf.schemaRecursiveRefMap);
                // vars.push(this.jsf.dataRecursiveRefMap);
                this.debugOutput = vars.map(v => JSON.stringify(v, null, 2)).join('\n');
            }
            this.formInitialized = true;
        }
    }
    /**
     * 'initializeOptions' function
     *
     * Initialize 'options' (global form options) and set framework
     * Combine available inputs:
     * 1. options - recommended
     * 2. form.options - Single input style
     */
    initializeOptions() {
        if (this.language && this.language !== this.jsf.language) {
            this.jsf.setLanguage(this.language);
        }
        this.jsf.setOptions({ debug: !!this.debug });
        let loadExternalAssets = this.loadExternalAssets || false;
        let framework = this.framework || 'default';
        if (isObject(this.options)) {
            this.jsf.setOptions(this.options);
            loadExternalAssets = this.options.loadExternalAssets || loadExternalAssets;
            framework = this.options.framework || framework;
        }
        if (isObject(this.form) && isObject(this.form.options)) {
            this.jsf.setOptions(this.form.options);
            loadExternalAssets = this.form.options.loadExternalAssets || loadExternalAssets;
            framework = this.form.options.framework || framework;
        }
        if (isObject(this.widgets)) {
            this.jsf.setOptions({ widgets: this.widgets });
        }
        this.frameworkLibrary.setLoadExternalAssets(loadExternalAssets);
        this.frameworkLibrary.setFramework(framework);
        this.jsf.framework = this.frameworkLibrary.getFramework();
        if (isObject(this.jsf.formOptions.widgets)) {
            for (const widget of Object.keys(this.jsf.formOptions.widgets)) {
                this.widgetLibrary.registerWidget(widget, this.jsf.formOptions.widgets[widget]);
            }
        }
        if (isObject(this.form) && isObject(this.form.tpldata)) {
            this.jsf.setTpldata(this.form.tpldata);
        }
        if (this.theme) {
            this.frameworkLibrary.requestThemeChange(this.theme);
        }
    }
    /**
     * 'initializeSchema' function
     *
     * Initialize 'schema'
     * Use first available input:
     * 1. schema - recommended / Angular Schema Form style
     * 2. form.schema - Single input / JSON Form style
     * 3. JSONSchema - React JSON Schema Form style
     * 4. form.JSONSchema - For testing single input React JSON Schema Forms
     * 5. form - For testing single schema-only inputs
     *
     * ... if no schema input found, the 'activateForm' function, below,
     *     will make two additional attempts to build a schema
     * 6. If layout input - build schema from layout
     * 7. If data input - build schema from data
     */
    initializeSchema() {
        // TODO: update to allow non-object schemas
        if (isObject(this.schema)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.schema = cloneDeep(this.schema);
        }
        else if (hasOwn(this.form, 'schema') && isObject(this.form.schema)) {
            this.jsf.schema = cloneDeep(this.form.schema);
        }
        else if (isObject(this.JSONSchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.schema = cloneDeep(this.JSONSchema);
        }
        else if (hasOwn(this.form, 'JSONSchema') && isObject(this.form.JSONSchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.schema = cloneDeep(this.form.JSONSchema);
        }
        else if (hasOwn(this.form, 'properties') && isObject(this.form.properties)) {
            this.jsf.schema = cloneDeep(this.form);
        }
        else if (isObject(this.form)) {
            // TODO: Handle other types of form input
        }
        if (!isEmpty(this.jsf.schema)) {
            // If other types also allowed, render schema as an object
            if (inArray('object', this.jsf.schema.type)) {
                this.jsf.schema.type = 'object';
            }
            // Wrap non-object schemas in object.
            if (hasOwn(this.jsf.schema, 'type') && this.jsf.schema.type !== 'object') {
                this.jsf.schema = {
                    'type': 'object',
                    'properties': { 1: this.jsf.schema }
                };
                this.objectWrap = true;
            }
            else if (!hasOwn(this.jsf.schema, 'type')) {
                // Add type = 'object' if missing
                if (isObject(this.jsf.schema.properties) ||
                    isObject(this.jsf.schema.patternProperties) ||
                    isObject(this.jsf.schema.additionalProperties)) {
                    this.jsf.schema.type = 'object';
                    // Fix JSON schema shorthand (JSON Form style)
                }
                else {
                    this.jsf.JsonFormCompatibility = true;
                    this.jsf.schema = {
                        'type': 'object',
                        'properties': this.jsf.schema
                    };
                }
            }
            // If needed, update JSON Schema to draft 6 format, including
            // draft 3 (JSON Form style) and draft 4 (Angular Schema Form style)
            this.jsf.schema = convertSchemaToDraft6(this.jsf.schema);
            // Initialize ajv and compile schema
            this.jsf.compileAjvSchema();
            // Create schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, & arrayMap
            this.jsf.schema = resolveSchemaReferences(this.jsf.schema, this.jsf.schemaRefLibrary, this.jsf.schemaRecursiveRefMap, this.jsf.dataRecursiveRefMap, this.jsf.arrayMap);
            if (hasOwn(this.jsf.schemaRefLibrary, '')) {
                this.jsf.hasRootReference = true;
            }
            // TODO: (?) Resolve external $ref links
            // // Create schemaRefLibrary & schemaRecursiveRefMap
            // this.parser.bundle(this.schema)
            //   .then(schema => this.schema = resolveSchemaReferences(
            //     schema, this.jsf.schemaRefLibrary,
            //     this.jsf.schemaRecursiveRefMap, this.jsf.dataRecursiveRefMap
            //   ));
        }
    }
    /**
     * 'initializeData' function
     *
     * Initialize 'formValues'
     * defulat or previously submitted values used to populate form
     * Use first available input:
     * 1. data - recommended
     * 2. model - Angular Schema Form style
     * 3. form.value - JSON Form style
     * 4. form.data - Single input style
     * 5. formData - React JSON Schema Form style
     * 6. form.formData - For easier testing of React JSON Schema Forms
     * 7. (none) no data - initialize data from schema and layout defaults only
     */
    initializeData() {
        if (hasValue(this.data)) {
            this.jsf.formValues = cloneDeep(this.data);
            this.formValuesInput = 'data';
        }
        else if (hasValue(this.model)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.model);
            this.formValuesInput = 'model';
        }
        else if (hasValue(this.ngModel)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.ngModel);
            this.formValuesInput = 'ngModel';
        }
        else if (isObject(this.form) && hasValue(this.form.value)) {
            this.jsf.JsonFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.form.value);
            this.formValuesInput = 'form.value';
        }
        else if (isObject(this.form) && hasValue(this.form.data)) {
            this.jsf.formValues = cloneDeep(this.form.data);
            this.formValuesInput = 'form.data';
        }
        else if (hasValue(this.formData)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.formValuesInput = 'formData';
        }
        else if (hasOwn(this.form, 'formData') && hasValue(this.form.formData)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            this.jsf.formValues = cloneDeep(this.form.formData);
            this.formValuesInput = 'form.formData';
        }
        else {
            this.formValuesInput = "data"; //null;
        }
    }
    /**
     * 'initializeLayout' function
     *
     * Initialize 'layout'
     * Use first available array input:
     * 1. layout - recommended
     * 2. form - Angular Schema Form style
     * 3. form.form - JSON Form style
     * 4. form.layout - Single input style
     * 5. (none) no layout - set default layout instead
     *    (full layout will be built later from the schema)
     *
     * Also, if alternate layout formats are available,
     * import from 'UISchema' or 'customFormItems'
     * used for React JSON Schema Form and JSON Form API compatibility
     * Use first available input:
     * 1. UISchema - React JSON Schema Form style
     * 2. form.UISchema - For testing single input React JSON Schema Forms
     * 2. form.customFormItems - JSON Form style
     * 3. (none) no input - don't import
     */
    initializeLayout() {
        // Rename JSON Form-style 'options' lists to
        // Angular Schema Form-style 'titleMap' lists.
        const fixJsonFormOptions = (layout) => {
            if (isObject(layout) || isArray(layout)) {
                forEach(layout, (value, key) => {
                    if (hasOwn(value, 'options') && isObject(value.options)) {
                        value.titleMap = value.options;
                        delete value.options;
                    }
                }, 'top-down');
            }
            return layout;
        };
        // Check for layout inputs and, if found, initialize form layout
        if (isArray(this.layout)) {
            this.jsf.layout = cloneDeep(this.layout);
        }
        else if (isArray(this.form)) {
            this.jsf.AngularSchemaFormCompatibility = true;
            this.jsf.layout = cloneDeep(this.form);
        }
        else if (this.form && isArray(this.form.form)) {
            this.jsf.JsonFormCompatibility = true;
            this.jsf.layout = fixJsonFormOptions(cloneDeep(this.form.form));
        }
        else if (this.form && isArray(this.form.layout)) {
            this.jsf.layout = cloneDeep(this.form.layout);
        }
        else {
            this.jsf.layout = ['*'];
        }
        // Check for alternate layout inputs
        let alternateLayout = null;
        if (isObject(this.UISchema)) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = cloneDeep(this.UISchema);
        }
        else if (hasOwn(this.form, 'UISchema')) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = cloneDeep(this.form.UISchema);
        }
        else if (hasOwn(this.form, 'uiSchema')) {
            this.jsf.ReactJsonSchemaFormCompatibility = true;
            alternateLayout = cloneDeep(this.form.uiSchema);
        }
        else if (hasOwn(this.form, 'customFormItems')) {
            this.jsf.JsonFormCompatibility = true;
            alternateLayout = fixJsonFormOptions(cloneDeep(this.form.customFormItems));
        }
        // if alternate layout found, copy alternate layout options into schema
        if (alternateLayout) {
            JsonPointer.forEachDeep(alternateLayout, (value, pointer) => {
                const schemaPointer = pointer
                    .replace(/\//g, '/properties/')
                    .replace(/\/properties\/items\/properties\//g, '/items/properties/')
                    .replace(/\/properties\/titleMap\/properties\//g, '/titleMap/properties/');
                if (hasValue(value) && hasValue(pointer)) {
                    let key = JsonPointer.toKey(pointer);
                    const groupPointer = (JsonPointer.parse(schemaPointer) || []).slice(0, -2);
                    let itemPointer;
                    // If 'ui:order' object found, copy into object schema root
                    if (key.toLowerCase() === 'ui:order') {
                        itemPointer = [...groupPointer, 'ui:order'];
                        // Copy other alternate layout options to schema 'x-schema-form',
                        // (like Angular Schema Form options) and remove any 'ui:' prefixes
                    }
                    else {
                        if (key.slice(0, 3).toLowerCase() === 'ui:') {
                            key = key.slice(3);
                        }
                        itemPointer = [...groupPointer, 'x-schema-form', key];
                    }
                    if (JsonPointer.has(this.jsf.schema, groupPointer) &&
                        !JsonPointer.has(this.jsf.schema, itemPointer)) {
                        JsonPointer.set(this.jsf.schema, itemPointer, value);
                    }
                }
            });
        }
    }
    /**
     * 'activateForm' function
     *
     * ...continued from 'initializeSchema' function, above
     * If 'schema' has not been initialized (i.e. no schema input found)
     * 6. If layout input - build schema from layout input
     * 7. If data input - build schema from data input
     *
     * Create final layout,
     * build the FormGroup template and the Angular FormGroup,
     * subscribe to changes,
     * and activate the form.
     */
    activateForm() {
        this.unsubscribeOnActivateForm$.next();
        // If 'schema' not initialized
        if (isEmpty(this.jsf.schema)) {
            // TODO: If full layout input (with no '*'), build schema from layout
            // if (!this.jsf.layout.includes('*')) {
            //   this.jsf.buildSchemaFromLayout();
            // } else
            // If data input, build schema from data
            if (!isEmpty(this.jsf.formValues)) {
                this.jsf.buildSchemaFromData();
            }
        }
        if (!isEmpty(this.jsf.schema)) {
            // If not already initialized, initialize ajv and compile schema
            this.jsf.compileAjvSchema();
            // Update all layout elements, add values, widgets, and validators,
            // replace any '*' with a layout built from all schema elements,
            // and update the FormGroup template with any new validators
            this.jsf.buildLayout(this.widgetLibrary);
            // Build the Angular FormGroup template from the schema
            this.jsf.buildFormGroupTemplate(this.jsf.formValues);
            // Build the real Angular FormGroup from the FormGroup template
            this.jsf.buildFormGroup();
        }
        if (this.jsf.formGroup) {
            // Reset initial form values
            if (!isEmpty(this.jsf.formValues) &&
                this.jsf.formOptions.setSchemaDefaults !== true &&
                this.jsf.formOptions.setLayoutDefaults !== true) {
                this.setFormValues(this.jsf.formValues);
            }
            // TODO: Figure out how to display calculated values without changing object data
            // See http://ulion.github.io/jsonform/playground/?example=templating-values
            // Calculate references to other fields
            // if (!isEmpty(this.jsf.formGroup.value)) {
            //   forEach(this.jsf.formGroup.value, (value, key, object, rootObject) => {
            //     if (typeof value === 'string') {
            //       object[key] = this.jsf.parseText(value, value, rootObject, key);
            //     }
            //   }, 'top-down');
            // }
            // Subscribe to form changes to output live data, validation, and errors
            this.dataChangesSubs = this.jsf.dataChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(data => {
                this.onChanges.emit(this.objectWrap ? data['1'] : data);
                if (this.formValuesInput && this.formValuesInput.indexOf('.') === -1) {
                    this[`${this.formValuesInput}Change`].emit(this.objectWrap ? data['1'] : data);
                }
            });
            // Trigger change detection on statusChanges to show updated errors
            this.statusChangesSubs = this.jsf.formGroup.statusChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(() => this.changeDetector.markForCheck());
            this.isValidChangesSubs = this.jsf.isValidChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(isValid => this.isValid.emit(isValid));
            this.validationErrorChangesSubs = this.jsf.validationErrorChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(err => this.validationErrors.emit(err));
            // Output final schema, final layout, and initial data
            this.formSchema.emit(this.jsf.schema);
            this.formLayout.emit(this.jsf.layout);
            this.onChanges.emit(this.objectWrap ? this.jsf.data['1'] : this.jsf.data);
            // If validateOnRender, output initial validation and any errors
            const validateOnRender = JsonPointer.get(this.jsf, '/formOptions/validateOnRender');
            if (validateOnRender) { // validateOnRender === 'auto' || true
                const touchAll = (control) => {
                    if (validateOnRender === true || hasValue(control.value)) {
                        control.markAsTouched();
                    }
                    Object.keys(control.controls || {})
                        .forEach(key => touchAll(control.controls[key]));
                };
                touchAll(this.jsf.formGroup);
                this.isValid.emit(this.jsf.isValid);
                this.validationErrors.emit(this.jsf.ajvErrors);
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: JsonSchemaFormComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.FrameworkLibraryService }, { token: i2.WidgetLibraryService }, { token: i3.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.4", type: JsonSchemaFormComponent, selector: "json-schema-form", inputs: { schema: "schema", layout: "layout", data: "data", options: "options", framework: "framework", widgets: "widgets", form: "form", model: "model", JSONSchema: "JSONSchema", UISchema: "UISchema", formData: "formData", ngModel: "ngModel", language: "language", loadExternalAssets: "loadExternalAssets", debug: "debug", theme: "theme", value: "value" }, outputs: { onChanges: "onChanges", onSubmit: "onSubmit", isValid: "isValid", validationErrors: "validationErrors", formSchema: "formSchema", formLayout: "formLayout", dataChange: "dataChange", modelChange: "modelChange", formDataChange: "formDataChange", ngModelChange: "ngModelChange" }, providers: [JsonSchemaFormService, JSON_SCHEMA_FORM_VALUE_ACCESSOR], usesOnChanges: true, ngImport: i0, template: "<form [autocomplete]=\"jsf?.formOptions?.autocomplete ? 'on' : 'off'\" class=\"json-schema-form\" (ngSubmit)=\"submitForm()\">\n  <root-widget [layout]=\"jsf?.layout\"></root-widget>\n</form>\n<div *ngIf=\"debug || jsf?.formOptions?.debug\">\n  Debug output:\n  <pre>{{debugOutput}}</pre>\n</div>", dependencies: [{ kind: "directive", type: i4.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i5.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i5.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i5.NgForm, selector: "form:not([ngNoForm]):not([formGroup]),ng-form,[ngForm]", inputs: ["ngFormOptions"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "component", type: i6.RootComponent, selector: "root-widget", inputs: ["dataIndex", "layoutIndex", "layout", "isOrderable", "isFlexItem"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.4", ngImport: i0, type: JsonSchemaFormComponent, decorators: [{
            type: Component,
            args: [{ selector: 'json-schema-form', changeDetection: ChangeDetectionStrategy.OnPush, providers: [JsonSchemaFormService, JSON_SCHEMA_FORM_VALUE_ACCESSOR], template: "<form [autocomplete]=\"jsf?.formOptions?.autocomplete ? 'on' : 'off'\" class=\"json-schema-form\" (ngSubmit)=\"submitForm()\">\n  <root-widget [layout]=\"jsf?.layout\"></root-widget>\n</form>\n<div *ngIf=\"debug || jsf?.formOptions?.debug\">\n  Debug output:\n  <pre>{{debugOutput}}</pre>\n</div>" }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }, { type: i1.FrameworkLibraryService }, { type: i2.WidgetLibraryService }, { type: i3.JsonSchemaFormService }]; }, propDecorators: { schema: [{
                type: Input
            }], layout: [{
                type: Input
            }], data: [{
                type: Input
            }], options: [{
                type: Input
            }], framework: [{
                type: Input
            }], widgets: [{
                type: Input
            }], form: [{
                type: Input
            }], model: [{
                type: Input
            }], JSONSchema: [{
                type: Input
            }], UISchema: [{
                type: Input
            }], formData: [{
                type: Input
            }], ngModel: [{
                type: Input
            }], language: [{
                type: Input
            }], loadExternalAssets: [{
                type: Input
            }], debug: [{
                type: Input
            }], theme: [{
                type: Input
            }], value: [{
                type: Input
            }], onChanges: [{
                type: Output
            }], onSubmit: [{
                type: Output
            }], isValid: [{
                type: Output
            }], validationErrors: [{
                type: Output
            }], formSchema: [{
                type: Output
            }], formLayout: [{
                type: Output
            }], dataChange: [{
                type: Output
            }], modelChange: [{
                type: Output
            }], formDataChange: [{
                type: Output
            }], ngModelChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1jb3JlL3NyYy9saWIvanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1jb3JlL3NyYy9saWIvanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQyxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLEtBQUssRUFJTCxNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF3QixpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxPQUFPLEVBQWdCLE1BQU0sTUFBTSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUzQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUNuRixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN6RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDN0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQ0wsUUFBUSxFQUNSLE9BQU8sRUFDUCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDVCxNQUFNLDhCQUE4QixDQUFDOzs7Ozs7OztBQUd0QyxNQUFNLENBQUMsTUFBTSwrQkFBK0IsR0FBUTtJ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QUMsTUFBTSxDQUFDLENBQUM7U0FDMUM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3BFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQy9DO2FBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDOUM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzVFLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ25EO2FBQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM1RSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hDO2FBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlCLHlDQUF5QztTQUMxQztRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FB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QixLQUFLO2dCQUdHLGtCQUFrQjtzQkFBMUIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBRUcsS0FBSztzQkFBYixLQUFLO2dCQUdGLEtBQUs7c0JBRFIsS0FBSztnQkFTSSxTQUFTO3NCQUFsQixNQUFNO2dCQUNHLFFBQVE7c0JBQWpCLE1BQU07Z0JBQ0csT0FBTztzQkFBaEIsTUFBTTtnQkFDRyxnQkFBZ0I7c0JBQXpCLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxVQUFVO3NCQUFuQixNQUFNO2dCQU1HLFVBQVU7c0JBQW5CLE1BQU07Z0JBQ0csV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxjQUFjO3NCQUF2QixNQUFNO2dCQUNHLGFBQWE7c0JBQXRCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnO1xuaW1wb3J0IGlzRXF1YWwgZnJvbSAnbG9kYXNoL2lzRXF1YWwnO1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUiB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFN1YmplY3QsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UgfSBmcm9tICcuL2ZyYW1ld29yay1saWJyYXJ5L2ZyYW1ld29yay1saWJyYXJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuaW1wb3J0IHsgY29udmVydFNjaGVtYVRvRHJhZnQ2IH0gZnJvbSAnLi9zaGFyZWQvY29udmVydC1zY2hlbWEtdG8tZHJhZnQ2LmZ1bmN0aW9uJztcbmltcG9ydCB7IHJlc29sdmVTY2hlbWFSZWZlcmVuY2VzIH0gZnJvbSAnLi9zaGFyZWQvanNvbi1zY2hlbWEuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyIH0gZnJvbSAnLi9zaGFyZWQvanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7IGZvckVhY2gsIGhhc093biB9IGZyb20gJy4vc2hhcmVkL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGhhc1ZhbHVlLFxuICBpbkFycmF5LFxuICBpc0FycmF5LFxuICBpc0VtcHR5LFxuICBpc09iamVjdFxufSBmcm9tICcuL3NoYXJlZC92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7IFdpZGdldExpYnJhcnlTZXJ2aWNlIH0gZnJvbSAnLi93aWRnZXQtbGlicmFyeS93aWRnZXQtbGlicmFyeS5zZXJ2aWNlJztcblxuZXhwb3J0IGNvbnN0IEpTT05fU0NIRU1BX0ZPUk1fVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEpzb25TY2hlbWFGb3JtQ29tcG9uZW50KSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIEBtb2R1bGUgJ0pzb25TY2hlbWFGb3JtQ29tcG9uZW50JyAtIEFuZ3VsYXIgSlNPTiBTY2hlbWEgRm9ybVxuICpcbiAqIFJvb3QgbW9kdWxlIG9mIHRoZSBBbmd1bGFyIEpTT04gU2NoZW1hIEZvcm0gY2xpZW50LXNpZGUgbGlicmFyeSxcbiAqIGFuIEFuZ3VsYXIgbGlicmFyeSB3aGljaCBnZW5lcmF0ZXMgYW4gSFRNTCBmb3JtIGZyb20gYSBKU09OIHNjaGVtYVxuICogc3RydWN0dXJlZCBkYXRhIG1vZGVsIGFuZC9vciBhIEpTT04gU2NoZW1hIEZvcm0gbGF5b3V0IGRlc2NyaXB0aW9uLlxuICpcbiAqIFRoaXMgbGlicmFyeSBhbHNvIHZhbGlkYXRlcyBpbnB1dCBkYXRhIGJ5IHRoZSB1c2VyLCB1c2luZyBib3RoIHZhbGlkYXRvcnMgb25cbiAqIGluZGl2aWR1YWwgY29udHJvbHMgdG8gcHJvdmlkZSByZWFsLXRpbWUgZmVlZGJhY2sgd2hpbGUgdGhlIHVzZXIgaXMgZmlsbGluZ1xuICogb3V0IHRoZSBmb3JtLCBhbmQgdGhlbiB2YWxpZGF0aW5nIHRoZSBlbnRpcmUgaW5wdXQgYWdhaW5zdCB0aGUgc2NoZW1hIHdoZW5cbiAqIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCB0byBtYWtlIHN1cmUgdGhlIHJldHVybmVkIEpTT04gZGF0YSBvYmplY3QgaXMgdmFsaWQuXG4gKlxuICogVGhpcyBsaWJyYXJ5IGlzIHNpbWlsYXIgdG8sIGFuZCBtb3N0bHkgQVBJIGNvbXBhdGlibGUgd2l0aDpcbiAqXG4gKiAtIEpTT04gU2NoZW1hIEZvcm0ncyBBbmd1bGFyIFNjaGVtYSBGb3JtIGxpYnJhcnkgZm9yIEFuZ3VsYXJKc1xuICogICBodHRwOi8vc2NoZW1hZm9ybS5pb1xuICogICBodHRwOi8vc2NoZW1hZm9ybS5pby9leGFtcGxlcy9ib290c3RyYXAtZXhhbXBsZS5odG1sIChleGFtcGxlcylcbiAqXG4gKiAtIE1vemlsbGEncyByZWFjdC1qc29uc2NoZW1hLWZvcm0gbGlicmFyeSBmb3IgUmVhY3RcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEtc2VydmljZXMvcmVhY3QtanNvbnNjaGVtYS1mb3JtXG4gKiAgIGh0dHBzOi8vbW96aWxsYS1zZXJ2aWNlcy5naXRodWIuaW8vcmVhY3QtanNvbnNjaGVtYS1mb3JtIChleGFtcGxlcylcbiAqXG4gKiAtIEpvc2hmaXJlJ3MgSlNPTiBGb3JtIGxpYnJhcnkgZm9yIGpRdWVyeVxuICogICBodHRwczovL2dpdGh1Yi5jb20vam9zaGZpcmUvanNvbmZvcm1cbiAqICAgaHR0cDovL3VsaW9uLmdpdGh1Yi5pby9qc29uZm9ybS9wbGF5Z3JvdW5kIChleGFtcGxlcylcbiAqXG4gKiBUaGlzIGxpYnJhcnkgZGVwZW5kcyBvbjpcbiAqICAtIEFuZ3VsYXIgKG9idmlvdXNseSkgICAgICAgICAgICAgICAgICBodHRwczovL2FuZ3VsYXIuaW9cbiAqICAtIGxvZGFzaCwgSmF2YVNjcmlwdCB1dGlsaXR5IGxpYnJhcnkgICBodHRwczovL2dpdGh1Yi5jb20vbG9kYXNoL2xvZGFzaFxuICogIC0gYWp2LCBBbm90aGVyIEpTT04gU2NoZW1hIHZhbGlkYXRvciAgIGh0dHBzOi8vZ2l0aHViLmNvbS9lcG9iZXJlemtpbi9hanZcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIEV4YW1wbGUgUGxheWdyb3VuZCBhbHNvIGRlcGVuZHMgb246XG4gKiAgLSBicmFjZSwgQnJvd3NlcmlmaWVkIEFjZSBlZGl0b3IgICAgICAgaHR0cDovL3RobG9yZW56LmdpdGh1Yi5pby9icmFjZVxuICovXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ2pzb24tc2NoZW1hLWZvcm0nLFxuICB0ZW1wbGF0ZVVybDogJy4vanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuaHRtbCcsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAvLyBBZGRpbmcgJ0pzb25TY2hlbWFGb3JtU2VydmljZScgaGVyZSwgaW5zdGVhZCBvZiBpbiB0aGUgbW9kdWxlLFxuICAvLyBjcmVhdGVzIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgdGhlIHNlcnZpY2UgZm9yIGVhY2ggY29tcG9uZW50XG4gIHByb3ZpZGVyczogIFsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLCBKU09OX1NDSEVNQV9GT1JNX1ZBTFVFX0FDQ0VTU09SIF0sXG59KVxuZXhwb3J0IGNsYXNzIEpzb25TY2hlbWFGb3JtQ29tcG9uZW50IGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uQ2hhbmdlcywgT25Jbml0LE9uRGVzdHJveSB7XG4gIC8vIFRPRE86IHF1aWNrZml4IHRvIGF2b2lkIHN1YnNjcmliaW5nIHR3aWNlIHRvIHRoZSBzYW1lIGVtaXR0ZXJzXG4gIHByaXZhdGUgdW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGRlYnVnT3V0cHV0OiBhbnk7IC8vIERlYnVnIGluZm9ybWF0aW9uLCBpZiByZXF1ZXN0ZWRcbiAgZm9ybVZhbHVlU3Vic2NyaXB0aW9uOiBhbnkgPSBudWxsO1xuICBmb3JtSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgb2JqZWN0V3JhcCA9IGZhbHNlOyAvLyBJcyBub24tb2JqZWN0IGlucHV0IHNjaGVtYSB3cmFwcGVkIGluIGFuIG9iamVjdD9cblxuICBmb3JtVmFsdWVzSW5wdXQ6IHN0cmluZzsgLy8gTmFtZSBvZiB0aGUgaW5wdXQgcHJvdmlkaW5nIHRoZSBmb3JtIGRhdGFcbiAgcHJldmlvdXNJbnB1dHM6IHsgLy8gUHJldmlvdXMgaW5wdXQgdmFsdWVzLCB0byBkZXRlY3Qgd2hpY2ggaW5wdXQgdHJpZ2dlcnMgb25DaGFuZ2VzXG4gICAgc2NoZW1hOiBhbnksIGxheW91dDogYW55W10sIGRhdGE6IGFueSwgb3B0aW9uczogYW55LCBmcmFtZXdvcms6IGFueSB8IHN0cmluZyxcbiAgICB3aWRnZXRzOiBhbnksIGZvcm06IGFueSwgbW9kZWw6IGFueSwgSlNPTlNjaGVtYTogYW55LCBVSVNjaGVtYTogYW55LFxuICAgIGZvcm1EYXRhOiBhbnksIGxvYWRFeHRlcm5hbEFzc2V0czogYm9vbGVhbiwgZGVidWc6IGJvb2xlYW4sXG4gIH0gPSB7XG4gICAgICBzY2hlbWE6IG51bGwsIGxheW91dDogbnVsbCwgZGF0YTogbnVsbCwgb3B0aW9uczogbnVsbCwgZnJhbWV3b3JrOiBudWxsLFxuICAgICAgd2lkZ2V0czogbnVsbCwgZm9ybTogbnVsbCwgbW9kZWw6IG51bGwsIEpTT05TY2hlbWE6IG51bGwsIFVJU2NoZW1hOiBudWxsLFxuICAgICAgZm9ybURhdGE6IG51bGwsIGxvYWRFeHRlcm5hbEFzc2V0czogbnVsbCwgZGVidWc6IG51bGwsXG4gICAgfTtcblxuICAvLyBSZWNvbW1lbmRlZCBpbnB1dHNcbiAgQElucHV0KCkgc2NoZW1hOiBhbnk7IC8vIFRoZSBKU09OIFNjaGVtYVxuICBASW5wdXQoKSBsYXlvdXQ6IGFueVtdOyAvLyBUaGUgZm9ybSBsYXlvdXRcbiAgQElucHV0KCkgZGF0YTogYW55OyAvLyBUaGUgZm9ybSBkYXRhXG4gIEBJbnB1dCgpIG9wdGlvbnM6IGFueTsgLy8gVGhlIGdsb2JhbCBmb3JtIG9wdGlvbnNcbiAgQElucHV0KCkgZnJhbWV3b3JrOiBhbnkgfCBzdHJpbmc7IC8vIFRoZSBmcmFtZXdvcmsgdG8gbG9hZFxuICBASW5wdXQoKSB3aWRnZXRzOiBhbnk7IC8vIEFueSBjdXN0b20gd2lkZ2V0cyB0byBsb2FkXG5cbiAgLy8gQWx0ZXJuYXRlIGNvbWJpbmVkIHNpbmdsZSBpbnB1dFxuICBASW5wdXQoKSBmb3JtOiBhbnk7IC8vIEZvciB0ZXN0aW5nLCBhbmQgSlNPTiBTY2hlbWEgRm9ybSBBUEkgY29tcGF0aWJpbGl0eVxuXG4gIC8vIEFuZ3VsYXIgU2NoZW1hIEZvcm0gQVBJIGNvbXBhdGliaWxpdHkgaW5wdXRcbiAgQElucHV0KCkgbW9kZWw6IGFueTsgLy8gQWx0ZXJuYXRlIGlucHV0IGZvciBmb3JtIGRhdGFcblxuICAvLyBSZWFjdCBKU09OIFNjaGVtYSBGb3JtIEFQSSBjb21wYXRpYmlsaXR5IGlucHV0c1xuICBASW5wdXQoKSBKU09OU2NoZW1hOiBhbnk7IC8vIEFsdGVybmF0ZSBpbnB1dCBmb3IgSlNPTiBTY2hlbWFcbiAgQElucHV0KCkgVUlTY2hlbWE6IGFueTsgLy8gVUkgc2NoZW1hIC0gYWx0ZXJuYXRlIGZvcm0gbGF5b3V0IGZvcm1hdFxuICBASW5wdXQoKSBmb3JtRGF0YTogYW55OyAvLyBBbHRlcm5hdGUgaW5wdXQgZm9yIGZvcm0gZGF0YVxuXG4gIEBJbnB1dCgpIG5nTW9kZWw6IGFueTsgLy8gQWx0ZXJuYXRlIGlucHV0IGZvciBBbmd1bGFyIGZvcm1zXG5cbiAgQElucHV0KCkgbGFuZ3VhZ2U6IHN0cmluZzsgLy8gTGFuZ3VhZ2VcblxuICAvLyBEZXZlbG9wbWVudCBpbnB1dHMsIGZvciB0ZXN0aW5nIGFuZCBkZWJ1Z2dpbmdcbiAgQElucHV0KCkgbG9hZEV4dGVybmFsQXNzZXRzOiBib29sZWFuOyAvLyBMb2FkIGV4dGVybmFsIGZyYW1ld29yayBhc3NldHM/XG4gIEBJbnB1dCgpIGRlYnVnOiBib29sZWFuOyAvLyBTaG93IGRlYnVnIGluZm9ybWF0aW9uP1xuXG4gIEBJbnB1dCgpIHRoZW1lOiBzdHJpbmc7IC8vIFRoZW1lXG5cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMub2JqZWN0V3JhcCA/IHRoaXMuanNmLmRhdGFbJzEnXSA6IHRoaXMuanNmLmRhdGE7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLnNldEZvcm1WYWx1ZXModmFsdWUsIGZhbHNlKTtcbiAgfVxuXG4gIC8vIE91dHB1dHNcbiAgQE91dHB1dCgpIG9uQ2hhbmdlcyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBMaXZlIHVudmFsaWRhdGVkIGludGVybmFsIGZvcm0gZGF0YVxuICBAT3V0cHV0KCkgb25TdWJtaXQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTsgLy8gQ29tcGxldGUgdmFsaWRhdGVkIGZvcm0gZGF0YVxuICBAT3V0cHV0KCkgaXNWYWxpZCA9IG5ldyBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4oKTsgLy8gSXMgY3VycmVudCBkYXRhIHZhbGlkP1xuICBAT3V0cHV0KCkgdmFsaWRhdGlvbkVycm9ycyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBWYWxpZGF0aW9uIGVycm9ycyAoaWYgYW55KVxuICBAT3V0cHV0KCkgZm9ybVNjaGVtYSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBGaW5hbCBzY2hlbWEgdXNlZCB0byBjcmVhdGUgZm9ybVxuICBAT3V0cHV0KCkgZm9ybUxheW91dCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBGaW5hbCBsYXlvdXQgdXNlZCB0byBjcmVhdGUgZm9ybVxuXG4gIC8vIE91dHB1dHMgZm9yIHBvc3NpYmxlIDItd2F5IGRhdGEgYmluZGluZ1xuICAvLyBPbmx5IHRoZSBvbmUgaW5wdXQgcHJvdmlkaW5nIHRoZSBpbml0aWFsIGZvcm0gZGF0YSB3aWxsIGJlIGJvdW5kLlxuICAvLyBJZiB0aGVyZSBpcyBubyBpbml0YWwgZGF0YSwgaW5wdXQgJ3t9JyB0byBhY3RpdmF0ZSAyLXdheSBkYXRhIGJpbmRpbmcuXG4gIC8vIFRoZXJlIGlzIG5vIDItd2F5IGJpbmRpbmcgaWYgaW5pdGFsIGRhdGEgaXMgY29tYmluZWQgaW5zaWRlIHRoZSAnZm9ybScgaW5wdXQuXG4gIEBPdXRwdXQoKSBkYXRhQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBtb2RlbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgZm9ybURhdGFDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIG5nTW9kZWxDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBvbkNoYW5nZTogRnVuY3Rpb247XG4gIG9uVG91Y2hlZDogRnVuY3Rpb247XG5cbiAgLy9UT0RPLXJldmlldyxtYXliZSB1c2UgdGFrZVVudGlsRGVzdHJveWVkIHJ4anMgb3BcbiAgZGF0YUNoYW5nZXNTdWJzOlN1YnNjcmlwdGlvbjtcbiAgc3RhdHVzQ2hhbmdlc1N1YnM6U3Vic2NyaXB0aW9uO1xuICBpc1ZhbGlkQ2hhbmdlc1N1YnM6U3Vic2NyaXB0aW9uO1xuICB2YWxpZGF0aW9uRXJyb3JDaGFuZ2VzU3ViczpTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBmcmFtZXdvcmtMaWJyYXJ5OiBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICBwcml2YXRlIHdpZGdldExpYnJhcnk6IFdpZGdldExpYnJhcnlTZXJ2aWNlLFxuICAgIHB1YmxpYyBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZSxcbiAgKSB7IH1cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5kYXRhQ2hhbmdlc1N1YnM/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5zdGF0dXNDaGFuZ2VzU3Vicz8udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLmlzVmFsaWRDaGFuZ2VzU3Vicz8udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnZhbGlkYXRpb25FcnJvckNoYW5nZXNTdWJzPy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuZGF0YUNoYW5nZXNTdWJzPW51bGw7XG4gICAgdGhpcy5zdGF0dXNDaGFuZ2VzU3Vicz1udWxsO1xuICAgIHRoaXMuaXNWYWxpZENoYW5nZXNTdWJzPW51bGw7XG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JDaGFuZ2VzU3Vicz1udWxsO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldFNjcmlwdHNBbmRTdHlsZVNoZWV0cygpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWpzZicpLmZvckVhY2goZWxlbWVudCA9PiBlbGVtZW50LnJlbW92ZSgpKTtcbiAgfVxuICBwcml2YXRlIGxvYWRTY3JpcHRzKHNjcmlwdExpc3Q/OnN0cmluZ1tdKSB7XG4gICAgY29uc3Qgc2NyaXB0cyA9IHNjcmlwdExpc3R8fHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmtTY3JpcHRzKCk7XG4gICAgc2NyaXB0cy5tYXAoc2NyaXB0ID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdFRhZzogSFRNTFNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIHNjcmlwdFRhZy5zcmMgPSBzY3JpcHQ7XG4gICAgICBzY3JpcHRUYWcudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgc2NyaXB0VGFnLmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdFRhZy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2Fqc2YnKTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0VGFnKTtcbiAgICB9KTtcbiAgfVxuICBwcml2YXRlIGxvYWRTdHlsZVNoZWV0cyhzdHlsZUxpc3Q/OnN0cmluZ1tdKSB7XG4gICAgY29uc3Qgc3R5bGVzaGVldHMgPSBzdHlsZUxpc3R8fHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmtTdHlsZXNoZWV0cygpO1xuICAgIHN0eWxlc2hlZXRzLm1hcChzdHlsZXNoZWV0ID0+IHtcbiAgICAgIGNvbnN0IGxpbmtUYWc6IEhUTUxMaW5rRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgIGxpbmtUYWcucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgICAgbGlua1RhZy5ocmVmID0gc3R5bGVzaGVldDtcbiAgICAgIGxpbmtUYWcuc2V0QXR0cmlidXRlKCdjbGFzcycsICdhanNmJyk7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGxpbmtUYWcpO1xuICAgIH0pO1xuICB9XG4gIHByaXZhdGUgbG9hZEFzc2V0cygpIHtcbiAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnkuZ2V0RnJhbWV3b3JrQXNzZXRDb25maWcoKS50aGVuKGFzc2V0Q2ZnPT57XG4gICAgICB0aGlzLnJlc2V0U2NyaXB0c0FuZFN0eWxlU2hlZXRzKCk7XG4gICAgICB0aGlzLmxvYWRTY3JpcHRzKGFzc2V0Q2ZnLnNjcmlwdHMpO1xuICAgICAgdGhpcy5sb2FkU3R5bGVTaGVldHMoYXNzZXRDZmcuc3R5bGVzaGVldHMpO1xuICAgIH0pLmNhdGNoKGVycj0+e1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIHRoaXMucmVzZXRTY3JpcHRzQW5kU3R5bGVTaGVldHMoKTtcbiAgICAgIHRoaXMubG9hZFNjcmlwdHMoKTtcbiAgICAgIHRoaXMubG9hZFN0eWxlU2hlZXRzKCk7XG4gICAgfSlcblxuICB9XG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMudXBkYXRlRm9ybSgpO1xuICAgIHRoaXMubG9hZEFzc2V0cygpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIHRoaXMudXBkYXRlRm9ybSgpO1xuICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgY2hhbmdlcyBpbiBGcmFtZXdvcmsgdGhlbiBsb2FkIGFzc2V0cyBpZiB0aGF0J3MgdGhlXG4gICAgaWYgKGNoYW5nZXMuZnJhbWV3b3JrKSB7XG4gICAgICBpZiAoIWNoYW5nZXMuZnJhbWV3b3JrLmlzRmlyc3RDaGFuZ2UoKSAmJlxuICAgICAgICAoY2hhbmdlcy5mcmFtZXdvcmsucHJldmlvdXNWYWx1ZSAhPT0gY2hhbmdlcy5mcmFtZXdvcmsuY3VycmVudFZhbHVlKSkge1xuICAgICAgICB0aGlzLmxvYWRBc3NldHMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLnNldEZvcm1WYWx1ZXModmFsdWUsIGZhbHNlKTtcbiAgICBpZiAoIXRoaXMuZm9ybVZhbHVlc0lucHV0KSB7IHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ25nTW9kZWwnOyB9XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBGdW5jdGlvbikge1xuICAgIHRoaXMub25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBGdW5jdGlvbikge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvL3NlZSBub3RlXG4gIC8vaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3VwZGF0ZS10by12ZXJzaW9uLTE1I3YxNS1iYy0wNlxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5qc2YuZm9ybU9wdGlvbnMuZm9ybURpc2FibGVkICE9PSAhIWlzRGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuanNmLmZvcm1PcHRpb25zLmZvcm1EaXNhYmxlZCA9ICEhaXNEaXNhYmxlZDtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZUZvcm0oKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVGb3JtKCkge1xuICAgICAgbGV0IGNoYW5nZWREYXRhO1xuICAgIGlmICghdGhpcy5mb3JtSW5pdGlhbGl6ZWQgfHwgIXRoaXMuZm9ybVZhbHVlc0lucHV0IHx8XG4gICAgICAodGhpcy5sYW5ndWFnZSAmJiB0aGlzLmxhbmd1YWdlICE9PSB0aGlzLmpzZi5sYW5ndWFnZSlcbiAgICAgIFxuICAgICkge1xuICAgICAgdGhpcy5pbml0aWFsaXplRm9ybSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5sYW5ndWFnZSAmJiB0aGlzLmxhbmd1YWdlICE9PSB0aGlzLmpzZi5sYW5ndWFnZSkge1xuICAgICAgICB0aGlzLmpzZi5zZXRMYW5ndWFnZSh0aGlzLmxhbmd1YWdlKTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IG5hbWVzIG9mIGNoYW5nZWQgaW5wdXRzXG4gICAgICBsZXQgY2hhbmdlZElucHV0ID0gT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cylcbiAgICAgICAgLmZpbHRlcihpbnB1dCA9PiB0aGlzLnByZXZpb3VzSW5wdXRzW2lucHV0XSAhPT0gdGhpc1tpbnB1dF0pO1xuICAgICAgbGV0IHJlc2V0Rmlyc3QgPSB0cnVlO1xuICAgICAgaWYgKGNoYW5nZWRJbnB1dC5sZW5ndGggPT09IDEgJiYgY2hhbmdlZElucHV0WzBdID09PSAnZm9ybScgJiZcbiAgICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQuc3RhcnRzV2l0aCgnZm9ybS4nKVxuICAgICAgKSB7XG4gICAgICAgIC8vIElmIG9ubHkgJ2Zvcm0nIGlucHV0IGNoYW5nZWQsIGdldCBuYW1lcyBvZiBjaGFuZ2VkIGtleXNcbiAgICAgICAgY2hhbmdlZElucHV0ID0gT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cy5mb3JtIHx8IHt9KVxuICAgICAgICAgIC5maWx0ZXIoa2V5ID0+ICFpc0VxdWFsKHRoaXMucHJldmlvdXNJbnB1dHMuZm9ybVtrZXldLCB0aGlzLmZvcm1ba2V5XSkpXG4gICAgICAgICAgLm1hcChrZXkgPT4gYGZvcm0uJHtrZXl9YCk7XG4gICAgICAgIHJlc2V0Rmlyc3QgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgb25seSBpbnB1dCB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLCB1cGRhdGUgdGhlIGZvcm0gdmFsdWVzXG4gICAgICBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCA9PT0gMSAmJiBjaGFuZ2VkSW5wdXRbMF0gPT09IHRoaXMuZm9ybVZhbHVlc0lucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm1WYWx1ZXNJbnB1dC5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgY2hhbmdlZERhdGE9dGhpc1t0aGlzLmZvcm1WYWx1ZXNJbnB1dF07XG4gICAgICAgICAgdGhpcy5zZXRGb3JtVmFsdWVzKGNoYW5nZWREYXRhLCByZXNldEZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBbaW5wdXQsIGtleV0gPSB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5zcGxpdCgnLicpO1xuICAgICAgICAgIGNoYW5nZWREYXRhPXRoaXNbaW5wdXRdW2tleV07XG4gICAgICAgICAgdGhpcy5zZXRGb3JtVmFsdWVzKGNoYW5nZWREYXRhLCByZXNldEZpcnN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGFueXRoaW5nIGVsc2UgaGFzIGNoYW5nZWQsIHJlLXJlbmRlciB0aGUgZW50aXJlIGZvcm1cbiAgICAgIH0gZWxzZSBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVGb3JtKGNoYW5nZWREYXRhKTtcbiAgICAgICAgaWYgKHRoaXMub25DaGFuZ2UpIHsgdGhpcy5vbkNoYW5nZSh0aGlzLmpzZi5mb3JtVmFsdWVzKTsgfVxuICAgICAgICBpZiAodGhpcy5vblRvdWNoZWQpIHsgdGhpcy5vblRvdWNoZWQodGhpcy5qc2YuZm9ybVZhbHVlcyk7IH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy9zZXQgZnJhbWV3b3JrIHRoZW1lXG4gICAgICBpZiAodGhpcy50aGVtZSAmJiB0aGlzLnRoZW1lICE9PSB0aGlzLmZyYW1ld29ya0xpYnJhcnkuZ2V0QWN0aXZlVGhlbWUoKT8ubmFtZSkge1xuICAgICAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnkucmVxdWVzdFRoZW1lQ2hhbmdlKHRoaXMudGhlbWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBVcGRhdGUgcHJldmlvdXMgaW5wdXRzXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnByZXZpb3VzSW5wdXRzKVxuICAgICAgICAuZmlsdGVyKGlucHV0ID0+IHRoaXMucHJldmlvdXNJbnB1dHNbaW5wdXRdICE9PSB0aGlzW2lucHV0XSlcbiAgICAgICAgLmZvckVhY2goaW5wdXQgPT4gdGhpcy5wcmV2aW91c0lucHV0c1tpbnB1dF0gPSB0aGlzW2lucHV0XSk7XG4gICAgfVxuICB9XG5cbiAgc2V0Rm9ybVZhbHVlcyhmb3JtVmFsdWVzOiBhbnksIHJlc2V0Rmlyc3QgPSB0cnVlKSB7XG4gICAgaWYgKGZvcm1WYWx1ZXMpIHtcbiAgICAgIGNvbnN0IG5ld0Zvcm1WYWx1ZXMgPSB0aGlzLm9iamVjdFdyYXAgPyBmb3JtVmFsdWVzWycxJ10gOiBmb3JtVmFsdWVzO1xuICAgICAgaWYgKCF0aGlzLmpzZi5mb3JtR3JvdXApIHtcbiAgICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGZvcm1WYWx1ZXM7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVGb3JtKCk7XG4gICAgICB9IGVsc2UgaWYgKHJlc2V0Rmlyc3QpIHsvL2NoYW5nZWQgdG8gYXZvaWQgcmVzZXQgZXZlbnRzXG4gICAgICAgIHRoaXMuanNmLmZvcm1Hcm91cC5yZXNldCh7fSx7ZW1pdEV2ZW50OmZhbHNlfSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5qc2YuZm9ybUdyb3VwKSB7Ly9jaGFuZ2VkIHRvIGF2b2lkIHJlc2V0IGV2ZW50c1xuICAgICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucGF0Y2hWYWx1ZShuZXdGb3JtVmFsdWVzLHtlbWl0RXZlbnQ6ZmFsc2V9KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9uQ2hhbmdlKSB7IHRoaXMub25DaGFuZ2UobmV3Rm9ybVZhbHVlcyk7IH1cbiAgICAgIGlmICh0aGlzLm9uVG91Y2hlZCkgeyB0aGlzLm9uVG91Y2hlZChuZXdGb3JtVmFsdWVzKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBzdWJtaXRGb3JtKCkge1xuICAgIGNvbnN0IHZhbGlkRGF0YSA9IHRoaXMuanNmLnZhbGlkRGF0YTtcbiAgICB0aGlzLm9uU3VibWl0LmVtaXQodGhpcy5vYmplY3RXcmFwID8gdmFsaWREYXRhWycxJ10gOiB2YWxpZERhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplRm9ybScgZnVuY3Rpb25cbiAgICpcbiAgICogLSBVcGRhdGUgJ3NjaGVtYScsICdsYXlvdXQnLCBhbmQgJ2Zvcm1WYWx1ZXMnLCBmcm9tIGlucHV0cy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ3NjaGVtYVJlZkxpYnJhcnknIGFuZCAnc2NoZW1hUmVjdXJzaXZlUmVmTWFwJ1xuICAgKiAgIHRvIHJlc29sdmUgc2NoZW1hICRyZWYgbGlua3MsIGluY2x1ZGluZyByZWN1cnNpdmUgJHJlZiBsaW5rcy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2RhdGFSZWN1cnNpdmVSZWZNYXAnIHRvIHJlc29sdmUgcmVjdXJzaXZlIGxpbmtzIGluIGRhdGFcbiAgICogICBhbmQgY29yZWN0bHkgc2V0IG91dHB1dCBmb3JtYXRzIGZvciByZWN1cnNpdmVseSBuZXN0ZWQgdmFsdWVzLlxuICAgKlxuICAgKiAtIENyZWF0ZSAnbGF5b3V0UmVmTGlicmFyeScgYW5kICd0ZW1wbGF0ZVJlZkxpYnJhcnknIHRvIHN0b3JlXG4gICAqICAgbmV3IGxheW91dCBub2RlcyBhbmQgZm9ybUdyb3VwIGVsZW1lbnRzIHRvIHVzZSB3aGVuIGR5bmFtaWNhbGx5XG4gICAqICAgYWRkaW5nIGZvcm0gY29tcG9uZW50cyB0byBhcnJheXMgYW5kIHJlY3Vyc2l2ZSAkcmVmIHBvaW50cy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2RhdGFNYXAnIHRvIG1hcCB0aGUgZGF0YSB0byB0aGUgc2NoZW1hIGFuZCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogLSBDcmVhdGUgdGhlIG1hc3RlciAnZm9ybUdyb3VwVGVtcGxhdGUnIHRoZW4gZnJvbSBpdCAnZm9ybUdyb3VwJ1xuICAgKiAgIHRoZSBBbmd1bGFyIGZvcm1Hcm91cCB1c2VkIHRvIGNvbnRyb2wgdGhlIHJlYWN0aXZlIGZvcm0uXG4gICAqL1xuICBpbml0aWFsaXplRm9ybShpbml0aWFsRGF0YT86YW55KSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5zY2hlbWEgfHwgdGhpcy5sYXlvdXQgfHwgdGhpcy5kYXRhIHx8IHRoaXMuZm9ybSB8fCB0aGlzLm1vZGVsIHx8XG4gICAgICB0aGlzLkpTT05TY2hlbWEgfHwgdGhpcy5VSVNjaGVtYSB8fCB0aGlzLmZvcm1EYXRhIHx8IHRoaXMubmdNb2RlbCB8fFxuICAgICAgdGhpcy5qc2YuZGF0YVxuICAgICkge1xuICAgICAgLy8gUmVzZXQgYWxsIGZvcm0gdmFsdWVzIHRvIGRlZmF1bHRzXG4gICAgICB0aGlzLmpzZi5yZXNldEFsbFZhbHVlcygpO1xuICAgICAgdGhpcy5pbml0aWFsaXplT3B0aW9ucygpOyAgIC8vIFVwZGF0ZSBvcHRpb25zXG4gICAgICB0aGlzLmluaXRpYWxpemVTY2hlbWEoKTsgICAgLy8gVXBkYXRlIHNjaGVtYSwgc2NoZW1hUmVmTGlicmFyeSxcbiAgICAgIC8vIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgJiBkYXRhUmVjdXJzaXZlUmVmTWFwXG4gICAgICB0aGlzLmluaXRpYWxpemVMYXlvdXQoKTsgICAgLy8gVXBkYXRlIGxheW91dCwgbGF5b3V0UmVmTGlicmFyeSxcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZURhdGEoKTsgICAgICAvLyBVcGRhdGUgZm9ybVZhbHVlc1xuICAgICAgaWYoaW5pdGlhbERhdGEpe1xuICAgICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzPWluaXRpYWxEYXRhO1xuICAgICAgfVxuICAgICAgdGhpcy5hY3RpdmF0ZUZvcm0oKTsgICAgICAgIC8vIFVwZGF0ZSBkYXRhTWFwLCB0ZW1wbGF0ZVJlZkxpYnJhcnksXG4gICAgICAvLyBmb3JtR3JvdXBUZW1wbGF0ZSwgZm9ybUdyb3VwXG5cbiAgICAgIC8vIFVuY29tbWVudCBpbmRpdmlkdWFsIGxpbmVzIHRvIG91dHB1dCBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24gdG8gY29uc29sZTpcbiAgICAgIC8vIChUaGVzZSBhbHdheXMgd29yay4pXG4gICAgICAvLyBjb25zb2xlLmxvZygnbG9hZGluZyBmb3JtLi4uJyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc2NoZW1hJywgdGhpcy5qc2Yuc2NoZW1hKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsYXlvdXQnLCB0aGlzLmpzZi5sYXlvdXQpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ29wdGlvbnMnLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1WYWx1ZXMnLCB0aGlzLmpzZi5mb3JtVmFsdWVzKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb3JtR3JvdXBUZW1wbGF0ZScsIHRoaXMuanNmLmZvcm1Hcm91cFRlbXBsYXRlKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmb3JtR3JvdXAnLCB0aGlzLmpzZi5mb3JtR3JvdXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1Hcm91cC52YWx1ZScsIHRoaXMuanNmLmZvcm1Hcm91cC52YWx1ZSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc2NoZW1hUmVmTGlicmFyeScsIHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2xheW91dFJlZkxpYnJhcnknLCB0aGlzLmpzZi5sYXlvdXRSZWZMaWJyYXJ5KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCd0ZW1wbGF0ZVJlZkxpYnJhcnknLCB0aGlzLmpzZi50ZW1wbGF0ZVJlZkxpYnJhcnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2RhdGFNYXAnLCB0aGlzLmpzZi5kYXRhTWFwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdhcnJheU1hcCcsIHRoaXMuanNmLmFycmF5TWFwKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzY2hlbWFSZWN1cnNpdmVSZWZNYXAnLCB0aGlzLmpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2RhdGFSZWN1cnNpdmVSZWZNYXAnLCB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwKTtcblxuICAgICAgLy8gVW5jb21tZW50IGluZGl2aWR1YWwgbGluZXMgdG8gb3V0cHV0IGRlYnVnZ2luZyBpbmZvcm1hdGlvbiB0byBicm93c2VyOlxuICAgICAgLy8gKFRoZXNlIG9ubHkgd29yayBpZiB0aGUgJ2RlYnVnJyBvcHRpb24gaGFzIGFsc28gYmVlbiBzZXQgdG8gJ3RydWUnLilcbiAgICAgIGlmICh0aGlzLmRlYnVnIHx8IHRoaXMuanNmLmZvcm1PcHRpb25zLmRlYnVnKSB7XG4gICAgICAgIGNvbnN0IHZhcnM6IGFueVtdID0gW107XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5zY2hlbWEpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YubGF5b3V0KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMub3B0aW9ucyk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5mb3JtVmFsdWVzKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1Hcm91cC52YWx1ZSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5mb3JtR3JvdXBUZW1wbGF0ZSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5mb3JtR3JvdXApO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5sYXlvdXRSZWZMaWJyYXJ5KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLnRlbXBsYXRlUmVmTGlicmFyeSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5kYXRhTWFwKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmFycmF5TWFwKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgICAgdGhpcy5kZWJ1Z091dHB1dCA9IHZhcnMubWFwKHYgPT4gSlNPTi5zdHJpbmdpZnkodiwgbnVsbCwgMikpLmpvaW4oJ1xcbicpO1xuICAgICAgfVxuICAgICAgdGhpcy5mb3JtSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZU9wdGlvbnMnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ29wdGlvbnMnIChnbG9iYWwgZm9ybSBvcHRpb25zKSBhbmQgc2V0IGZyYW1ld29ya1xuICAgKiBDb21iaW5lIGF2YWlsYWJsZSBpbnB1dHM6XG4gICAqIDEuIG9wdGlvbnMgLSByZWNvbW1lbmRlZFxuICAgKiAyLiBmb3JtLm9wdGlvbnMgLSBTaW5nbGUgaW5wdXQgc3R5bGVcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU9wdGlvbnMoKSB7XG4gICAgaWYgKHRoaXMubGFuZ3VhZ2UgJiYgdGhpcy5sYW5ndWFnZSAhPT0gdGhpcy5qc2YubGFuZ3VhZ2UpIHtcbiAgICAgIHRoaXMuanNmLnNldExhbmd1YWdlKHRoaXMubGFuZ3VhZ2UpO1xuICAgIH1cbiAgICB0aGlzLmpzZi5zZXRPcHRpb25zKHsgZGVidWc6ICEhdGhpcy5kZWJ1ZyB9KTtcbiAgICBsZXQgbG9hZEV4dGVybmFsQXNzZXRzOiBib29sZWFuID0gdGhpcy5sb2FkRXh0ZXJuYWxBc3NldHMgfHwgZmFsc2U7XG4gICAgbGV0IGZyYW1ld29yazogYW55ID0gdGhpcy5mcmFtZXdvcmsgfHwgJ2RlZmF1bHQnO1xuICAgIGlmIChpc09iamVjdCh0aGlzLm9wdGlvbnMpKSB7XG4gICAgICB0aGlzLmpzZi5zZXRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgICBsb2FkRXh0ZXJuYWxBc3NldHMgPSB0aGlzLm9wdGlvbnMubG9hZEV4dGVybmFsQXNzZXRzIHx8IGxvYWRFeHRlcm5hbEFzc2V0cztcbiAgICAgIGZyYW1ld29yayA9IHRoaXMub3B0aW9ucy5mcmFtZXdvcmsgfHwgZnJhbWV3b3JrO1xuICAgIH1cbiAgICBpZiAoaXNPYmplY3QodGhpcy5mb3JtKSAmJiBpc09iamVjdCh0aGlzLmZvcm0ub3B0aW9ucykpIHtcbiAgICAgIHRoaXMuanNmLnNldE9wdGlvbnModGhpcy5mb3JtLm9wdGlvbnMpO1xuICAgICAgbG9hZEV4dGVybmFsQXNzZXRzID0gdGhpcy5mb3JtLm9wdGlvbnMubG9hZEV4dGVybmFsQXNzZXRzIHx8IGxvYWRFeHRlcm5hbEFzc2V0cztcbiAgICAgIGZyYW1ld29yayA9IHRoaXMuZm9ybS5vcHRpb25zLmZyYW1ld29yayB8fCBmcmFtZXdvcms7XG4gICAgfVxuICAgIGlmIChpc09iamVjdCh0aGlzLndpZGdldHMpKSB7XG4gICAgICB0aGlzLmpzZi5zZXRPcHRpb25zKHsgd2lkZ2V0czogdGhpcy53aWRnZXRzIH0pO1xuICAgIH1cbiAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnkuc2V0TG9hZEV4dGVybmFsQXNzZXRzKGxvYWRFeHRlcm5hbEFzc2V0cyk7XG4gICAgdGhpcy5mcmFtZXdvcmtMaWJyYXJ5LnNldEZyYW1ld29yayhmcmFtZXdvcmspO1xuICAgIHRoaXMuanNmLmZyYW1ld29yayA9IHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmsoKTtcbiAgICBpZiAoaXNPYmplY3QodGhpcy5qc2YuZm9ybU9wdGlvbnMud2lkZ2V0cykpIHtcbiAgICAgIGZvciAoY29uc3Qgd2lkZ2V0IG9mIE9iamVjdC5rZXlzKHRoaXMuanNmLmZvcm1PcHRpb25zLndpZGdldHMpKSB7XG4gICAgICAgIHRoaXMud2lkZ2V0TGlicmFyeS5yZWdpc3RlcldpZGdldCh3aWRnZXQsIHRoaXMuanNmLmZvcm1PcHRpb25zLndpZGdldHNbd2lkZ2V0XSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGlzT2JqZWN0KHRoaXMuZm9ybS50cGxkYXRhKSkge1xuICAgICAgdGhpcy5qc2Yuc2V0VHBsZGF0YSh0aGlzLmZvcm0udHBsZGF0YSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRoZW1lKSB7XG4gICAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnkucmVxdWVzdFRoZW1lQ2hhbmdlKHRoaXMudGhlbWUpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplU2NoZW1hJyBmdW5jdGlvblxuICAgKlxuICAgKiBJbml0aWFsaXplICdzY2hlbWEnXG4gICAqIFVzZSBmaXJzdCBhdmFpbGFibGUgaW5wdXQ6XG4gICAqIDEuIHNjaGVtYSAtIHJlY29tbWVuZGVkIC8gQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiAyLiBmb3JtLnNjaGVtYSAtIFNpbmdsZSBpbnB1dCAvIEpTT04gRm9ybSBzdHlsZVxuICAgKiAzLiBKU09OU2NoZW1hIC0gUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiA0LiBmb3JtLkpTT05TY2hlbWEgLSBGb3IgdGVzdGluZyBzaW5nbGUgaW5wdXQgUmVhY3QgSlNPTiBTY2hlbWEgRm9ybXNcbiAgICogNS4gZm9ybSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBzY2hlbWEtb25seSBpbnB1dHNcbiAgICpcbiAgICogLi4uIGlmIG5vIHNjaGVtYSBpbnB1dCBmb3VuZCwgdGhlICdhY3RpdmF0ZUZvcm0nIGZ1bmN0aW9uLCBiZWxvdyxcbiAgICogICAgIHdpbGwgbWFrZSB0d28gYWRkaXRpb25hbCBhdHRlbXB0cyB0byBidWlsZCBhIHNjaGVtYVxuICAgKiA2LiBJZiBsYXlvdXQgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBsYXlvdXRcbiAgICogNy4gSWYgZGF0YSBpbnB1dCAtIGJ1aWxkIHNjaGVtYSBmcm9tIGRhdGFcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZVNjaGVtYSgpIHtcblxuICAgIC8vIFRPRE86IHVwZGF0ZSB0byBhbGxvdyBub24tb2JqZWN0IHNjaGVtYXNcblxuICAgIGlmIChpc09iamVjdCh0aGlzLnNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBjbG9uZURlZXAodGhpcy5zY2hlbWEpO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHRoaXMuZm9ybSwgJ3NjaGVtYScpICYmIGlzT2JqZWN0KHRoaXMuZm9ybS5zY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBjbG9uZURlZXAodGhpcy5mb3JtLnNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0aGlzLkpTT05TY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBjbG9uZURlZXAodGhpcy5KU09OU2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdKU09OU2NoZW1hJykgJiYgaXNPYmplY3QodGhpcy5mb3JtLkpTT05TY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBjbG9uZURlZXAodGhpcy5mb3JtLkpTT05TY2hlbWEpO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHRoaXMuZm9ybSwgJ3Byb3BlcnRpZXMnKSAmJiBpc09iamVjdCh0aGlzLmZvcm0ucHJvcGVydGllcykpIHtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLmZvcm0pO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodGhpcy5mb3JtKSkge1xuICAgICAgLy8gVE9ETzogSGFuZGxlIG90aGVyIHR5cGVzIG9mIGZvcm0gaW5wdXRcbiAgICB9XG5cbiAgICBpZiAoIWlzRW1wdHkodGhpcy5qc2Yuc2NoZW1hKSkge1xuXG4gICAgICAvLyBJZiBvdGhlciB0eXBlcyBhbHNvIGFsbG93ZWQsIHJlbmRlciBzY2hlbWEgYXMgYW4gb2JqZWN0XG4gICAgICBpZiAoaW5BcnJheSgnb2JqZWN0JywgdGhpcy5qc2Yuc2NoZW1hLnR5cGUpKSB7XG4gICAgICAgIHRoaXMuanNmLnNjaGVtYS50eXBlID0gJ29iamVjdCc7XG4gICAgICB9XG5cbiAgICAgIC8vIFdyYXAgbm9uLW9iamVjdCBzY2hlbWFzIGluIG9iamVjdC5cbiAgICAgIGlmIChoYXNPd24odGhpcy5qc2Yuc2NoZW1hLCAndHlwZScpICYmIHRoaXMuanNmLnNjaGVtYS50eXBlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aGlzLmpzZi5zY2hlbWEgPSB7XG4gICAgICAgICAgJ3R5cGUnOiAnb2JqZWN0JyxcbiAgICAgICAgICAncHJvcGVydGllcyc6IHsgMTogdGhpcy5qc2Yuc2NoZW1hIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vYmplY3RXcmFwID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoIWhhc093bih0aGlzLmpzZi5zY2hlbWEsICd0eXBlJykpIHtcblxuICAgICAgICAvLyBBZGQgdHlwZSA9ICdvYmplY3QnIGlmIG1pc3NpbmdcbiAgICAgICAgaWYgKGlzT2JqZWN0KHRoaXMuanNmLnNjaGVtYS5wcm9wZXJ0aWVzKSB8fFxuICAgICAgICAgIGlzT2JqZWN0KHRoaXMuanNmLnNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcykgfHxcbiAgICAgICAgICBpc09iamVjdCh0aGlzLmpzZi5zY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMuanNmLnNjaGVtYS50eXBlID0gJ29iamVjdCc7XG5cbiAgICAgICAgICAvLyBGaXggSlNPTiBzY2hlbWEgc2hvcnRoYW5kIChKU09OIEZvcm0gc3R5bGUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5qc2YuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmpzZi5zY2hlbWEgPSB7XG4gICAgICAgICAgICAndHlwZSc6ICdvYmplY3QnLFxuICAgICAgICAgICAgJ3Byb3BlcnRpZXMnOiB0aGlzLmpzZi5zY2hlbWFcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5lZWRlZCwgdXBkYXRlIEpTT04gU2NoZW1hIHRvIGRyYWZ0IDYgZm9ybWF0LCBpbmNsdWRpbmdcbiAgICAgIC8vIGRyYWZ0IDMgKEpTT04gRm9ybSBzdHlsZSkgYW5kIGRyYWZ0IDQgKEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGUpXG4gICAgICB0aGlzLmpzZi5zY2hlbWEgPSBjb252ZXJ0U2NoZW1hVG9EcmFmdDYodGhpcy5qc2Yuc2NoZW1hKTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBhanYgYW5kIGNvbXBpbGUgc2NoZW1hXG4gICAgICB0aGlzLmpzZi5jb21waWxlQWp2U2NoZW1hKCk7XG5cbiAgICAgIC8vIENyZWF0ZSBzY2hlbWFSZWZMaWJyYXJ5LCBzY2hlbWFSZWN1cnNpdmVSZWZNYXAsIGRhdGFSZWN1cnNpdmVSZWZNYXAsICYgYXJyYXlNYXBcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IHJlc29sdmVTY2hlbWFSZWZlcmVuY2VzKFxuICAgICAgICB0aGlzLmpzZi5zY2hlbWEsIHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnksIHRoaXMuanNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCxcbiAgICAgICAgdGhpcy5qc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwgdGhpcy5qc2YuYXJyYXlNYXBcbiAgICAgICk7XG4gICAgICBpZiAoaGFzT3duKHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnksICcnKSkge1xuICAgICAgICB0aGlzLmpzZi5oYXNSb290UmVmZXJlbmNlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogKD8pIFJlc29sdmUgZXh0ZXJuYWwgJHJlZiBsaW5rc1xuICAgICAgLy8gLy8gQ3JlYXRlIHNjaGVtYVJlZkxpYnJhcnkgJiBzY2hlbWFSZWN1cnNpdmVSZWZNYXBcbiAgICAgIC8vIHRoaXMucGFyc2VyLmJ1bmRsZSh0aGlzLnNjaGVtYSlcbiAgICAgIC8vICAgLnRoZW4oc2NoZW1hID0+IHRoaXMuc2NoZW1hID0gcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMoXG4gICAgICAvLyAgICAgc2NoZW1hLCB0aGlzLmpzZi5zY2hlbWFSZWZMaWJyYXJ5LFxuICAgICAgLy8gICAgIHRoaXMuanNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgdGhpcy5qc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcFxuICAgICAgLy8gICApKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVEYXRhJyBmdW5jdGlvblxuICAgKlxuICAgKiBJbml0aWFsaXplICdmb3JtVmFsdWVzJ1xuICAgKiBkZWZ1bGF0IG9yIHByZXZpb3VzbHkgc3VibWl0dGVkIHZhbHVlcyB1c2VkIHRvIHBvcHVsYXRlIGZvcm1cbiAgICogVXNlIGZpcnN0IGF2YWlsYWJsZSBpbnB1dDpcbiAgICogMS4gZGF0YSAtIHJlY29tbWVuZGVkXG4gICAqIDIuIG1vZGVsIC0gQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiAzLiBmb3JtLnZhbHVlIC0gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDQuIGZvcm0uZGF0YSAtIFNpbmdsZSBpbnB1dCBzdHlsZVxuICAgKiA1LiBmb3JtRGF0YSAtIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogNi4gZm9ybS5mb3JtRGF0YSAtIEZvciBlYXNpZXIgdGVzdGluZyBvZiBSZWFjdCBKU09OIFNjaGVtYSBGb3Jtc1xuICAgKiA3LiAobm9uZSkgbm8gZGF0YSAtIGluaXRpYWxpemUgZGF0YSBmcm9tIHNjaGVtYSBhbmQgbGF5b3V0IGRlZmF1bHRzIG9ubHlcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZURhdGEoKSB7XG4gICAgaWYgKGhhc1ZhbHVlKHRoaXMuZGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBjbG9uZURlZXAodGhpcy5kYXRhKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2RhdGEnO1xuICAgIH0gZWxzZSBpZiAoaGFzVmFsdWUodGhpcy5tb2RlbCkpIHtcbiAgICAgIHRoaXMuanNmLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMubW9kZWwpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnbW9kZWwnO1xuICAgIH0gZWxzZSBpZiAoaGFzVmFsdWUodGhpcy5uZ01vZGVsKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBjbG9uZURlZXAodGhpcy5uZ01vZGVsKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ25nTW9kZWwnO1xuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QodGhpcy5mb3JtKSAmJiBoYXNWYWx1ZSh0aGlzLmZvcm0udmFsdWUpKSB7XG4gICAgICB0aGlzLmpzZi5Kc29uRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLmZvcm0udmFsdWUpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZm9ybS52YWx1ZSc7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGhhc1ZhbHVlKHRoaXMuZm9ybS5kYXRhKSkge1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLmZvcm0uZGF0YSk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdmb3JtLmRhdGEnO1xuICAgIH0gZWxzZSBpZiAoaGFzVmFsdWUodGhpcy5mb3JtRGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2Zvcm1EYXRhJztcbiAgICB9IGVsc2UgaWYgKGhhc093bih0aGlzLmZvcm0sICdmb3JtRGF0YScpICYmIGhhc1ZhbHVlKHRoaXMuZm9ybS5mb3JtRGF0YSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBjbG9uZURlZXAodGhpcy5mb3JtLmZvcm1EYXRhKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2Zvcm0uZm9ybURhdGEnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9IFwiZGF0YVwiOy8vbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVMYXlvdXQnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ2xheW91dCdcbiAgICogVXNlIGZpcnN0IGF2YWlsYWJsZSBhcnJheSBpbnB1dDpcbiAgICogMS4gbGF5b3V0IC0gcmVjb21tZW5kZWRcbiAgICogMi4gZm9ybSAtIEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMy4gZm9ybS5mb3JtIC0gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDQuIGZvcm0ubGF5b3V0IC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqIDUuIChub25lKSBubyBsYXlvdXQgLSBzZXQgZGVmYXVsdCBsYXlvdXQgaW5zdGVhZFxuICAgKiAgICAoZnVsbCBsYXlvdXQgd2lsbCBiZSBidWlsdCBsYXRlciBmcm9tIHRoZSBzY2hlbWEpXG4gICAqXG4gICAqIEFsc28sIGlmIGFsdGVybmF0ZSBsYXlvdXQgZm9ybWF0cyBhcmUgYXZhaWxhYmxlLFxuICAgKiBpbXBvcnQgZnJvbSAnVUlTY2hlbWEnIG9yICdjdXN0b21Gb3JtSXRlbXMnXG4gICAqIHVzZWQgZm9yIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gYW5kIEpTT04gRm9ybSBBUEkgY29tcGF0aWJpbGl0eVxuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBVSVNjaGVtYSAtIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMi4gZm9ybS5VSVNjaGVtYSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBpbnB1dCBSZWFjdCBKU09OIFNjaGVtYSBGb3Jtc1xuICAgKiAyLiBmb3JtLmN1c3RvbUZvcm1JdGVtcyAtIEpTT04gRm9ybSBzdHlsZVxuICAgKiAzLiAobm9uZSkgbm8gaW5wdXQgLSBkb24ndCBpbXBvcnRcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUxheW91dCgpIHtcblxuICAgIC8vIFJlbmFtZSBKU09OIEZvcm0tc3R5bGUgJ29wdGlvbnMnIGxpc3RzIHRvXG4gICAgLy8gQW5ndWxhciBTY2hlbWEgRm9ybS1zdHlsZSAndGl0bGVNYXAnIGxpc3RzLlxuICAgIGNvbnN0IGZpeEpzb25Gb3JtT3B0aW9ucyA9IChsYXlvdXQ6IGFueSk6IGFueSA9PiB7XG4gICAgICBpZiAoaXNPYmplY3QobGF5b3V0KSB8fCBpc0FycmF5KGxheW91dCkpIHtcbiAgICAgICAgZm9yRWFjaChsYXlvdXQsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bih2YWx1ZSwgJ29wdGlvbnMnKSAmJiBpc09iamVjdCh2YWx1ZS5vcHRpb25zKSkge1xuICAgICAgICAgICAgdmFsdWUudGl0bGVNYXAgPSB2YWx1ZS5vcHRpb25zO1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlLm9wdGlvbnM7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAndG9wLWRvd24nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYXlvdXQ7XG4gICAgfTtcblxuICAgIC8vIENoZWNrIGZvciBsYXlvdXQgaW5wdXRzIGFuZCwgaWYgZm91bmQsIGluaXRpYWxpemUgZm9ybSBsYXlvdXRcbiAgICBpZiAoaXNBcnJheSh0aGlzLmxheW91dCkpIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGNsb25lRGVlcCh0aGlzLmxheW91dCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHRoaXMuZm9ybSkpIHtcbiAgICAgIHRoaXMuanNmLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybSAmJiBpc0FycmF5KHRoaXMuZm9ybS5mb3JtKSkge1xuICAgICAgdGhpcy5qc2YuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGZpeEpzb25Gb3JtT3B0aW9ucyhjbG9uZURlZXAodGhpcy5mb3JtLmZvcm0pKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybSAmJiBpc0FycmF5KHRoaXMuZm9ybS5sYXlvdXQpKSB7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtLmxheW91dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IFsnKiddO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBhbHRlcm5hdGUgbGF5b3V0IGlucHV0c1xuICAgIGxldCBhbHRlcm5hdGVMYXlvdXQ6IGFueSA9IG51bGw7XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuVUlTY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBjbG9uZURlZXAodGhpcy5VSVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnVUlTY2hlbWEnKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgYWx0ZXJuYXRlTGF5b3V0ID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5VSVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAndWlTY2hlbWEnKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgYWx0ZXJuYXRlTGF5b3V0ID0gY2xvbmVEZWVwKHRoaXMuZm9ybS51aVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnY3VzdG9tRm9ybUl0ZW1zJykpIHtcbiAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBmaXhKc29uRm9ybU9wdGlvbnMoY2xvbmVEZWVwKHRoaXMuZm9ybS5jdXN0b21Gb3JtSXRlbXMpKTtcbiAgICB9XG5cbiAgICAvLyBpZiBhbHRlcm5hdGUgbGF5b3V0IGZvdW5kLCBjb3B5IGFsdGVybmF0ZSBsYXlvdXQgb3B0aW9ucyBpbnRvIHNjaGVtYVxuICAgIGlmIChhbHRlcm5hdGVMYXlvdXQpIHtcbiAgICAgIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKGFsdGVybmF0ZUxheW91dCwgKHZhbHVlLCBwb2ludGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjaGVtYVBvaW50ZXIgPSBwb2ludGVyXG4gICAgICAgICAgLnJlcGxhY2UoL1xcLy9nLCAnL3Byb3BlcnRpZXMvJylcbiAgICAgICAgICAucmVwbGFjZSgvXFwvcHJvcGVydGllc1xcL2l0ZW1zXFwvcHJvcGVydGllc1xcLy9nLCAnL2l0ZW1zL3Byb3BlcnRpZXMvJylcbiAgICAgICAgICAucmVwbGFjZSgvXFwvcHJvcGVydGllc1xcL3RpdGxlTWFwXFwvcHJvcGVydGllc1xcLy9nLCAnL3RpdGxlTWFwL3Byb3BlcnRpZXMvJyk7XG4gICAgICAgIGlmIChoYXNWYWx1ZSh2YWx1ZSkgJiYgaGFzVmFsdWUocG9pbnRlcikpIHtcbiAgICAgICAgICBsZXQga2V5ID0gSnNvblBvaW50ZXIudG9LZXkocG9pbnRlcik7XG4gICAgICAgICAgY29uc3QgZ3JvdXBQb2ludGVyID0gKEpzb25Qb2ludGVyLnBhcnNlKHNjaGVtYVBvaW50ZXIpIHx8IFtdKS5zbGljZSgwLCAtMik7XG4gICAgICAgICAgbGV0IGl0ZW1Qb2ludGVyOiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAgICAgICAgIC8vIElmICd1aTpvcmRlcicgb2JqZWN0IGZvdW5kLCBjb3B5IGludG8gb2JqZWN0IHNjaGVtYSByb290XG4gICAgICAgICAgaWYgKGtleS50b0xvd2VyQ2FzZSgpID09PSAndWk6b3JkZXInKSB7XG4gICAgICAgICAgICBpdGVtUG9pbnRlciA9IFsuLi5ncm91cFBvaW50ZXIsICd1aTpvcmRlciddO1xuXG4gICAgICAgICAgICAvLyBDb3B5IG90aGVyIGFsdGVybmF0ZSBsYXlvdXQgb3B0aW9ucyB0byBzY2hlbWEgJ3gtc2NoZW1hLWZvcm0nLFxuICAgICAgICAgICAgLy8gKGxpa2UgQW5ndWxhciBTY2hlbWEgRm9ybSBvcHRpb25zKSBhbmQgcmVtb3ZlIGFueSAndWk6JyBwcmVmaXhlc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5LnNsaWNlKDAsIDMpLnRvTG93ZXJDYXNlKCkgPT09ICd1aTonKSB7IGtleSA9IGtleS5zbGljZSgzKTsgfVxuICAgICAgICAgICAgaXRlbVBvaW50ZXIgPSBbLi4uZ3JvdXBQb2ludGVyLCAneC1zY2hlbWEtZm9ybScsIGtleV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChKc29uUG9pbnRlci5oYXModGhpcy5qc2Yuc2NoZW1hLCBncm91cFBvaW50ZXIpICYmXG4gICAgICAgICAgICAhSnNvblBvaW50ZXIuaGFzKHRoaXMuanNmLnNjaGVtYSwgaXRlbVBvaW50ZXIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQodGhpcy5qc2Yuc2NoZW1hLCBpdGVtUG9pbnRlciwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdhY3RpdmF0ZUZvcm0nIGZ1bmN0aW9uXG4gICAqXG4gICAqIC4uLmNvbnRpbnVlZCBmcm9tICdpbml0aWFsaXplU2NoZW1hJyBmdW5jdGlvbiwgYWJvdmVcbiAgICogSWYgJ3NjaGVtYScgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIChpLmUuIG5vIHNjaGVtYSBpbnB1dCBmb3VuZClcbiAgICogNi4gSWYgbGF5b3V0IGlucHV0IC0gYnVpbGQgc2NoZW1hIGZyb20gbGF5b3V0IGlucHV0XG4gICAqIDcuIElmIGRhdGEgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBkYXRhIGlucHV0XG4gICAqXG4gICAqIENyZWF0ZSBmaW5hbCBsYXlvdXQsXG4gICAqIGJ1aWxkIHRoZSBGb3JtR3JvdXAgdGVtcGxhdGUgYW5kIHRoZSBBbmd1bGFyIEZvcm1Hcm91cCxcbiAgICogc3Vic2NyaWJlIHRvIGNoYW5nZXMsXG4gICAqIGFuZCBhY3RpdmF0ZSB0aGUgZm9ybS5cbiAgICovXG4gIHByaXZhdGUgYWN0aXZhdGVGb3JtKCkge1xuICAgIHRoaXMudW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQubmV4dCgpO1xuICAgIC8vIElmICdzY2hlbWEnIG5vdCBpbml0aWFsaXplZFxuICAgIGlmIChpc0VtcHR5KHRoaXMuanNmLnNjaGVtYSkpIHtcblxuICAgICAgLy8gVE9ETzogSWYgZnVsbCBsYXlvdXQgaW5wdXQgKHdpdGggbm8gJyonKSwgYnVpbGQgc2NoZW1hIGZyb20gbGF5b3V0XG4gICAgICAvLyBpZiAoIXRoaXMuanNmLmxheW91dC5pbmNsdWRlcygnKicpKSB7XG4gICAgICAvLyAgIHRoaXMuanNmLmJ1aWxkU2NoZW1hRnJvbUxheW91dCgpO1xuICAgICAgLy8gfSBlbHNlXG5cbiAgICAgIC8vIElmIGRhdGEgaW5wdXQsIGJ1aWxkIHNjaGVtYSBmcm9tIGRhdGFcbiAgICAgIGlmICghaXNFbXB0eSh0aGlzLmpzZi5mb3JtVmFsdWVzKSkge1xuICAgICAgICB0aGlzLmpzZi5idWlsZFNjaGVtYUZyb21EYXRhKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLnNjaGVtYSkpIHtcblxuICAgICAgLy8gSWYgbm90IGFscmVhZHkgaW5pdGlhbGl6ZWQsIGluaXRpYWxpemUgYWp2IGFuZCBjb21waWxlIHNjaGVtYVxuICAgICAgdGhpcy5qc2YuY29tcGlsZUFqdlNjaGVtYSgpO1xuXG4gICAgICAvLyBVcGRhdGUgYWxsIGxheW91dCBlbGVtZW50cywgYWRkIHZhbHVlcywgd2lkZ2V0cywgYW5kIHZhbGlkYXRvcnMsXG4gICAgICAvLyByZXBsYWNlIGFueSAnKicgd2l0aCBhIGxheW91dCBidWlsdCBmcm9tIGFsbCBzY2hlbWEgZWxlbWVudHMsXG4gICAgICAvLyBhbmQgdXBkYXRlIHRoZSBGb3JtR3JvdXAgdGVtcGxhdGUgd2l0aCBhbnkgbmV3IHZhbGlkYXRvcnNcbiAgICAgIHRoaXMuanNmLmJ1aWxkTGF5b3V0KHRoaXMud2lkZ2V0TGlicmFyeSk7XG5cbiAgICAgIC8vIEJ1aWxkIHRoZSBBbmd1bGFyIEZvcm1Hcm91cCB0ZW1wbGF0ZSBmcm9tIHRoZSBzY2hlbWFcbiAgICAgIHRoaXMuanNmLmJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUodGhpcy5qc2YuZm9ybVZhbHVlcyk7XG5cbiAgICAgIC8vIEJ1aWxkIHRoZSByZWFsIEFuZ3VsYXIgRm9ybUdyb3VwIGZyb20gdGhlIEZvcm1Hcm91cCB0ZW1wbGF0ZVxuICAgICAgdGhpcy5qc2YuYnVpbGRGb3JtR3JvdXAoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5qc2YuZm9ybUdyb3VwKSB7XG5cbiAgICAgIC8vIFJlc2V0IGluaXRpYWwgZm9ybSB2YWx1ZXNcbiAgICAgIGlmICghaXNFbXB0eSh0aGlzLmpzZi5mb3JtVmFsdWVzKSAmJlxuICAgICAgICB0aGlzLmpzZi5mb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyAhPT0gdHJ1ZSAmJlxuICAgICAgICB0aGlzLmpzZi5mb3JtT3B0aW9ucy5zZXRMYXlvdXREZWZhdWx0cyAhPT0gdHJ1ZVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh0aGlzLmpzZi5mb3JtVmFsdWVzKTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogRmlndXJlIG91dCBob3cgdG8gZGlzcGxheSBjYWxjdWxhdGVkIHZhbHVlcyB3aXRob3V0IGNoYW5naW5nIG9iamVjdCBkYXRhXG4gICAgICAvLyBTZWUgaHR0cDovL3VsaW9uLmdpdGh1Yi5pby9qc29uZm9ybS9wbGF5Z3JvdW5kLz9leGFtcGxlPXRlbXBsYXRpbmctdmFsdWVzXG4gICAgICAvLyBDYWxjdWxhdGUgcmVmZXJlbmNlcyB0byBvdGhlciBmaWVsZHNcbiAgICAgIC8vIGlmICghaXNFbXB0eSh0aGlzLmpzZi5mb3JtR3JvdXAudmFsdWUpKSB7XG4gICAgICAvLyAgIGZvckVhY2godGhpcy5qc2YuZm9ybUdyb3VwLnZhbHVlLCAodmFsdWUsIGtleSwgb2JqZWN0LCByb290T2JqZWN0KSA9PiB7XG4gICAgICAvLyAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vICAgICAgIG9iamVjdFtrZXldID0gdGhpcy5qc2YucGFyc2VUZXh0KHZhbHVlLCB2YWx1ZSwgcm9vdE9iamVjdCwga2V5KTtcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIH0sICd0b3AtZG93bicpO1xuICAgICAgLy8gfVxuXG4gICAgICAvLyBTdWJzY3JpYmUgdG8gZm9ybSBjaGFuZ2VzIHRvIG91dHB1dCBsaXZlIGRhdGEsIHZhbGlkYXRpb24sIGFuZCBlcnJvcnNcbiAgICAgIHRoaXMuZGF0YUNoYW5nZXNTdWJzPXRoaXMuanNmLmRhdGFDaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMudW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQpKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICAgIHRoaXMub25DaGFuZ2VzLmVtaXQodGhpcy5vYmplY3RXcmFwID8gZGF0YVsnMSddIDogZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLmZvcm1WYWx1ZXNJbnB1dCAmJiB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhpc1tgJHt0aGlzLmZvcm1WYWx1ZXNJbnB1dH1DaGFuZ2VgXS5lbWl0KHRoaXMub2JqZWN0V3JhcCA/IGRhdGFbJzEnXSA6IGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gVHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIG9uIHN0YXR1c0NoYW5nZXMgdG8gc2hvdyB1cGRhdGVkIGVycm9yc1xuICAgICAgdGhpcy5zdGF0dXNDaGFuZ2VzU3Vicz0gdGhpcy5qc2YuZm9ybUdyb3VwLnN0YXR1c0NoYW5nZXMucGlwZSh0YWtlVW50aWwodGhpcy51bnN1YnNjcmliZU9uQWN0aXZhdGVGb3JtJCkpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpKTtcbiAgICAgIHRoaXMuaXNWYWxpZENoYW5nZXNTdWJzPXRoaXMuanNmLmlzVmFsaWRDaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMudW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQpKS5zdWJzY3JpYmUoaXNWYWxpZCA9PiB0aGlzLmlzVmFsaWQuZW1pdChpc1ZhbGlkKSk7XG4gICAgICB0aGlzLnZhbGlkYXRpb25FcnJvckNoYW5nZXNTdWJzPXRoaXMuanNmLnZhbGlkYXRpb25FcnJvckNoYW5nZXMucGlwZSh0YWtlVW50aWwodGhpcy51bnN1YnNjcmliZU9uQWN0aXZhdGVGb3JtJCkpLnN1YnNjcmliZShlcnIgPT4gdGhpcy52YWxpZGF0aW9uRXJyb3JzLmVtaXQoZXJyKSk7XG5cbiAgICAgIC8vIE91dHB1dCBmaW5hbCBzY2hlbWEsIGZpbmFsIGxheW91dCwgYW5kIGluaXRpYWwgZGF0YVxuICAgICAgdGhpcy5mb3JtU2NoZW1hLmVtaXQodGhpcy5qc2Yuc2NoZW1hKTtcbiAgICAgIHRoaXMuZm9ybUxheW91dC5lbWl0KHRoaXMuanNmLmxheW91dCk7XG4gICAgICB0aGlzLm9uQ2hhbmdlcy5lbWl0KHRoaXMub2JqZWN0V3JhcCA/IHRoaXMuanNmLmRhdGFbJzEnXSA6IHRoaXMuanNmLmRhdGEpO1xuXG4gICAgICAvLyBJZiB2YWxpZGF0ZU9uUmVuZGVyLCBvdXRwdXQgaW5pdGlhbCB2YWxpZGF0aW9uIGFuZCBhbnkgZXJyb3JzXG4gICAgICBjb25zdCB2YWxpZGF0ZU9uUmVuZGVyID1cbiAgICAgICAgSnNvblBvaW50ZXIuZ2V0KHRoaXMuanNmLCAnL2Zvcm1PcHRpb25zL3ZhbGlkYXRlT25SZW5kZXInKTtcbiAgICAgIGlmICh2YWxpZGF0ZU9uUmVuZGVyKSB7IC8vIHZhbGlkYXRlT25SZW5kZXIgPT09ICdhdXRvJyB8fCB0cnVlXG4gICAgICAgIGNvbnN0IHRvdWNoQWxsID0gKGNvbnRyb2wpID0+IHtcbiAgICAgICAgICBpZiAodmFsaWRhdGVPblJlbmRlciA9PT0gdHJ1ZSB8fCBoYXNWYWx1ZShjb250cm9sLnZhbHVlKSkge1xuICAgICAgICAgICAgY29udHJvbC5tYXJrQXNUb3VjaGVkKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIE9iamVjdC5rZXlzKGNvbnRyb2wuY29udHJvbHMgfHwge30pXG4gICAgICAgICAgICAuZm9yRWFjaChrZXkgPT4gdG91Y2hBbGwoY29udHJvbC5jb250cm9sc1trZXldKSk7XG4gICAgICAgIH07XG4gICAgICAgIHRvdWNoQWxsKHRoaXMuanNmLmZvcm1Hcm91cCk7XG4gICAgICAgIHRoaXMuaXNWYWxpZC5lbWl0KHRoaXMuanNmLmlzVmFsaWQpO1xuICAgICAgICB0aGlzLnZhbGlkYXRpb25FcnJvcnMuZW1pdCh0aGlzLmpzZi5hanZFcnJvcnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iLCI8Zm9ybSBbYXV0b2NvbXBsZXRlXT1cImpzZj8uZm9ybU9wdGlvbnM/LmF1dG9jb21wbGV0ZSA/ICdvbicgOiAnb2ZmJ1wiIGNsYXNzPVwianNvbi1zY2hlbWEtZm9ybVwiIChuZ1N1Ym1pdCk9XCJzdWJtaXRGb3JtKClcIj5cbiAgPHJvb3Qtd2lkZ2V0IFtsYXlvdXRdPVwianNmPy5sYXlvdXRcIj48L3Jvb3Qtd2lkZ2V0PlxuPC9mb3JtPlxuPGRpdiAqbmdJZj1cImRlYnVnIHx8IGpzZj8uZm9ybU9wdGlvbnM/LmRlYnVnXCI+XG4gIERlYnVnIG91dHB1dDpcbiAgPHByZT57e2RlYnVnT3V0cHV0fX08L3ByZT5cbjwvZGl2PiJdfQ==