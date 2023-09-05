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
    get value() {
        return this.objectWrap ? this.jsf.data['1'] : this.jsf.data;
    }
    set value(value) {
        this.setFormValues(value, false);
    }
    resetScriptsAndStyleSheets() {
        document.querySelectorAll('.ajsf').forEach(element => element.remove());
    }
    loadScripts() {
        const scripts = this.frameworkLibrary.getFrameworkScripts();
        scripts.map(script => {
            const scriptTag = document.createElement('script');
            scriptTag.src = script;
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.setAttribute('class', 'ajsf');
            document.getElementsByTagName('head')[0].appendChild(scriptTag);
        });
    }
    loadStyleSheets() {
        const stylesheets = this.frameworkLibrary.getFrameworkStylesheets();
        stylesheets.map(stylesheet => {
            const linkTag = document.createElement('link');
            linkTag.rel = 'stylesheet';
            linkTag.href = stylesheet;
            linkTag.setAttribute('class', 'ajsf');
            document.getElementsByTagName('head')[0].appendChild(linkTag);
        });
    }
    loadAssets() {
        this.resetScriptsAndStyleSheets();
        this.loadScripts();
        this.loadStyleSheets();
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
                    this.setFormValues(this[this.formValuesInput], resetFirst);
                }
                else {
                    const [input, key] = this.formValuesInput.split('.');
                    this.setFormValues(this[input][key], resetFirst);
                }
                // If anything else has changed, re-render the entire form
            }
            else if (changedInput.length) {
                this.initializeForm();
                if (this.onChange) {
                    this.onChange(this.jsf.formValues);
                }
                if (this.onTouched) {
                    this.onTouched(this.jsf.formValues);
                }
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
            else if (resetFirst) {
                this.jsf.formGroup.reset();
            }
            if (this.jsf.formGroup) {
                this.jsf.formGroup.patchValue(newFormValues);
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
    initializeForm() {
        if (this.schema || this.layout || this.data || this.form || this.model ||
            this.JSONSchema || this.UISchema || this.formData || this.ngModel ||
            this.jsf.data) {
            this.jsf.resetAllValues(); // Reset all form values to defaults
            this.initializeOptions(); // Update options
            this.initializeSchema(); // Update schema, schemaRefLibrary,
            // schemaRecursiveRefMap, & dataRecursiveRefMap
            this.initializeLayout(); // Update layout, layoutRefLibrary,
            this.initializeData(); // Update formValues
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
            this.formValuesInput = null;
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
            this.jsf.dataChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(data => {
                this.onChanges.emit(this.objectWrap ? data['1'] : data);
                if (this.formValuesInput && this.formValuesInput.indexOf('.') === -1) {
                    this[`${this.formValuesInput}Change`].emit(this.objectWrap ? data['1'] : data);
                }
            });
            // Trigger change detection on statusChanges to show updated errors
            this.jsf.formGroup.statusChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(() => this.changeDetector.markForCheck());
            this.jsf.isValidChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(isValid => this.isValid.emit(isValid));
            this.jsf.validationErrorChanges.pipe(takeUntil(this.unsubscribeOnActivateForm$)).subscribe(err => this.validationErrors.emit(err));
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
}
JsonSchemaFormComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.FrameworkLibraryService }, { token: i2.WidgetLibraryService }, { token: i3.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component });
JsonSchemaFormComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.9", type: JsonSchemaFormComponent, selector: "json-schema-form", inputs: { schema: "schema", layout: "layout", data: "data", options: "options", framework: "framework", widgets: "widgets", form: "form", model: "model", JSONSchema: "JSONSchema", UISchema: "UISchema", formData: "formData", ngModel: "ngModel", language: "language", loadExternalAssets: "loadExternalAssets", debug: "debug", value: "value" }, outputs: { onChanges: "onChanges", onSubmit: "onSubmit", isValid: "isValid", validationErrors: "validationErrors", formSchema: "formSchema", formLayout: "formLayout", dataChange: "dataChange", modelChange: "modelChange", formDataChange: "formDataChange", ngModelChange: "ngModelChange" }, providers: [JsonSchemaFormService, JSON_SCHEMA_FORM_VALUE_ACCESSOR], usesOnChanges: true, ngImport: i0, template: "<form [autocomplete]=\"jsf?.formOptions?.autocomplete ? 'on' : 'off'\" class=\"json-schema-form\" (ngSubmit)=\"submitForm()\">\n  <root-widget [layout]=\"jsf?.layout\"></root-widget>\n</form>\n<div *ngIf=\"debug || jsf?.formOptions?.debug\">\n  Debug output:\n  <pre>{{debugOutput}}</pre>\n</div>", dependencies: [{ kind: "directive", type: i4.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i5.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i5.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i5.NgForm, selector: "form:not([ngNoForm]):not([formGroup]),ng-form,[ngForm]", inputs: ["ngFormOptions"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "component", type: i6.RootComponent, selector: "root-widget", inputs: ["dataIndex", "layoutIndex", "layout", "isOrderable", "isFlexItem"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormComponent, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1jb3JlL3NyYy9saWIvanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1jb3JlL3NyYy9saWIvanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQyxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLEtBQUssRUFHTCxNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF3QixpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ25FLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM3RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFDTCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNULE1BQU0sOEJBQThCLENBQUM7Ozs7Ozs7O0FBR3RDLE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFRO0lB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QVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7U0FDbEM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7WUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUM7U0FDckM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUM7U0FDcEM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7WUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7U0FDbkM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3hFLElBQUksQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO1lBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFB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O29IQXpxQlUsdUJBQXVCO3dHQUF2Qix1QkFBdUIsa3FCQUZ0QixDQUFFLHFCQUFxQixFQUFFLCtCQUErQixDQUFFLCtDQ2hGeEUsMFNBTU07MkZENEVPLHVCQUF1QjtrQkFUbkMsU0FBUzsrQkFFRSxrQkFBa0IsbUJBRVgsdUJBQXVCLENBQUMsTUFBTSxhQUduQyxDQUFFLHFCQUFxQixFQUFFLCtCQUErQixDQUFFO3FOQXVCN0QsTUFBTTtzQkFBZCxLQUFLO2dCQUNHLE1BQU07c0JBQWQsS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUdHLElBQUk7c0JBQVosS0FBSztnQkFHRyxLQUFLO3NCQUFiLEtBQUs7Z0JBR0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBRUcsT0FBTztzQkFBZixLQUFLO2dCQUVHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBR0csa0JBQWtCO3NCQUExQixLQUFLO2dCQUNHLEtBQUs7c0JBQWIsS0FBSztnQkFHRixLQUFLO3NCQURSLEtBQUs7Z0JBU0ksU0FBUztzQkFBbEIsTUFBTTtnQkFDRyxRQUFRO3NCQUFqQixNQUFNO2dCQUNHLE9BQU87c0JBQWhCLE1BQU07Z0JBQ0csZ0JBQWdCO3NCQUF6QixNQUFNO2dCQUNHLFVBQVU7c0JBQW5CLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFNRyxVQUFVO3NCQUFuQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU07Z0JBQ0csY0FBYztzQkFBdkIsTUFBTTtnQkFDRyxhQUFhO3NCQUF0QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJztcbmltcG9ydCBpc0VxdWFsIGZyb20gJ2xvZGFzaC9pc0VxdWFsJztcblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgZm9yd2FyZFJlZixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25Jbml0LFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZXMsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRnJhbWV3b3JrTGlicmFyeVNlcnZpY2UgfSBmcm9tICcuL2ZyYW1ld29yay1saWJyYXJ5L2ZyYW1ld29yay1saWJyYXJ5LnNlcnZpY2UnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlIH0gZnJvbSAnLi9qc29uLXNjaGVtYS1mb3JtLnNlcnZpY2UnO1xuaW1wb3J0IHsgY29udmVydFNjaGVtYVRvRHJhZnQ2IH0gZnJvbSAnLi9zaGFyZWQvY29udmVydC1zY2hlbWEtdG8tZHJhZnQ2LmZ1bmN0aW9uJztcbmltcG9ydCB7IHJlc29sdmVTY2hlbWFSZWZlcmVuY2VzIH0gZnJvbSAnLi9zaGFyZWQvanNvbi1zY2hlbWEuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyIH0gZnJvbSAnLi9zaGFyZWQvanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7IGZvckVhY2gsIGhhc093biB9IGZyb20gJy4vc2hhcmVkL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGhhc1ZhbHVlLFxuICBpbkFycmF5LFxuICBpc0FycmF5LFxuICBpc0VtcHR5LFxuICBpc09iamVjdFxufSBmcm9tICcuL3NoYXJlZC92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7IFdpZGdldExpYnJhcnlTZXJ2aWNlIH0gZnJvbSAnLi93aWRnZXQtbGlicmFyeS93aWRnZXQtbGlicmFyeS5zZXJ2aWNlJztcblxuZXhwb3J0IGNvbnN0IEpTT05fU0NIRU1BX0ZPUk1fVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IEpzb25TY2hlbWFGb3JtQ29tcG9uZW50KSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKipcbiAqIEBtb2R1bGUgJ0pzb25TY2hlbWFGb3JtQ29tcG9uZW50JyAtIEFuZ3VsYXIgSlNPTiBTY2hlbWEgRm9ybVxuICpcbiAqIFJvb3QgbW9kdWxlIG9mIHRoZSBBbmd1bGFyIEpTT04gU2NoZW1hIEZvcm0gY2xpZW50LXNpZGUgbGlicmFyeSxcbiAqIGFuIEFuZ3VsYXIgbGlicmFyeSB3aGljaCBnZW5lcmF0ZXMgYW4gSFRNTCBmb3JtIGZyb20gYSBKU09OIHNjaGVtYVxuICogc3RydWN0dXJlZCBkYXRhIG1vZGVsIGFuZC9vciBhIEpTT04gU2NoZW1hIEZvcm0gbGF5b3V0IGRlc2NyaXB0aW9uLlxuICpcbiAqIFRoaXMgbGlicmFyeSBhbHNvIHZhbGlkYXRlcyBpbnB1dCBkYXRhIGJ5IHRoZSB1c2VyLCB1c2luZyBib3RoIHZhbGlkYXRvcnMgb25cbiAqIGluZGl2aWR1YWwgY29udHJvbHMgdG8gcHJvdmlkZSByZWFsLXRpbWUgZmVlZGJhY2sgd2hpbGUgdGhlIHVzZXIgaXMgZmlsbGluZ1xuICogb3V0IHRoZSBmb3JtLCBhbmQgdGhlbiB2YWxpZGF0aW5nIHRoZSBlbnRpcmUgaW5wdXQgYWdhaW5zdCB0aGUgc2NoZW1hIHdoZW5cbiAqIHRoZSBmb3JtIGlzIHN1Ym1pdHRlZCB0byBtYWtlIHN1cmUgdGhlIHJldHVybmVkIEpTT04gZGF0YSBvYmplY3QgaXMgdmFsaWQuXG4gKlxuICogVGhpcyBsaWJyYXJ5IGlzIHNpbWlsYXIgdG8sIGFuZCBtb3N0bHkgQVBJIGNvbXBhdGlibGUgd2l0aDpcbiAqXG4gKiAtIEpTT04gU2NoZW1hIEZvcm0ncyBBbmd1bGFyIFNjaGVtYSBGb3JtIGxpYnJhcnkgZm9yIEFuZ3VsYXJKc1xuICogICBodHRwOi8vc2NoZW1hZm9ybS5pb1xuICogICBodHRwOi8vc2NoZW1hZm9ybS5pby9leGFtcGxlcy9ib290c3RyYXAtZXhhbXBsZS5odG1sIChleGFtcGxlcylcbiAqXG4gKiAtIE1vemlsbGEncyByZWFjdC1qc29uc2NoZW1hLWZvcm0gbGlicmFyeSBmb3IgUmVhY3RcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEtc2VydmljZXMvcmVhY3QtanNvbnNjaGVtYS1mb3JtXG4gKiAgIGh0dHBzOi8vbW96aWxsYS1zZXJ2aWNlcy5naXRodWIuaW8vcmVhY3QtanNvbnNjaGVtYS1mb3JtIChleGFtcGxlcylcbiAqXG4gKiAtIEpvc2hmaXJlJ3MgSlNPTiBGb3JtIGxpYnJhcnkgZm9yIGpRdWVyeVxuICogICBodHRwczovL2dpdGh1Yi5jb20vam9zaGZpcmUvanNvbmZvcm1cbiAqICAgaHR0cDovL3VsaW9uLmdpdGh1Yi5pby9qc29uZm9ybS9wbGF5Z3JvdW5kIChleGFtcGxlcylcbiAqXG4gKiBUaGlzIGxpYnJhcnkgZGVwZW5kcyBvbjpcbiAqICAtIEFuZ3VsYXIgKG9idmlvdXNseSkgICAgICAgICAgICAgICAgICBodHRwczovL2FuZ3VsYXIuaW9cbiAqICAtIGxvZGFzaCwgSmF2YVNjcmlwdCB1dGlsaXR5IGxpYnJhcnkgICBodHRwczovL2dpdGh1Yi5jb20vbG9kYXNoL2xvZGFzaFxuICogIC0gYWp2LCBBbm90aGVyIEpTT04gU2NoZW1hIHZhbGlkYXRvciAgIGh0dHBzOi8vZ2l0aHViLmNvbS9lcG9iZXJlemtpbi9hanZcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIEV4YW1wbGUgUGxheWdyb3VuZCBhbHNvIGRlcGVuZHMgb246XG4gKiAgLSBicmFjZSwgQnJvd3NlcmlmaWVkIEFjZSBlZGl0b3IgICAgICAgaHR0cDovL3RobG9yZW56LmdpdGh1Yi5pby9icmFjZVxuICovXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ2pzb24tc2NoZW1hLWZvcm0nLFxuICB0ZW1wbGF0ZVVybDogJy4vanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQuaHRtbCcsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAvLyBBZGRpbmcgJ0pzb25TY2hlbWFGb3JtU2VydmljZScgaGVyZSwgaW5zdGVhZCBvZiBpbiB0aGUgbW9kdWxlLFxuICAvLyBjcmVhdGVzIGEgc2VwYXJhdGUgaW5zdGFuY2Ugb2YgdGhlIHNlcnZpY2UgZm9yIGVhY2ggY29tcG9uZW50XG4gIHByb3ZpZGVyczogIFsgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLCBKU09OX1NDSEVNQV9GT1JNX1ZBTFVFX0FDQ0VTU09SIF0sXG59KVxuZXhwb3J0IGNsYXNzIEpzb25TY2hlbWFGb3JtQ29tcG9uZW50IGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uQ2hhbmdlcywgT25Jbml0IHtcbiAgLy8gVE9ETzogcXVpY2tmaXggdG8gYXZvaWQgc3Vic2NyaWJpbmcgdHdpY2UgdG8gdGhlIHNhbWUgZW1pdHRlcnNcbiAgcHJpdmF0ZSB1bnN1YnNjcmliZU9uQWN0aXZhdGVGb3JtJCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgZGVidWdPdXRwdXQ6IGFueTsgLy8gRGVidWcgaW5mb3JtYXRpb24sIGlmIHJlcXVlc3RlZFxuICBmb3JtVmFsdWVTdWJzY3JpcHRpb246IGFueSA9IG51bGw7XG4gIGZvcm1Jbml0aWFsaXplZCA9IGZhbHNlO1xuICBvYmplY3RXcmFwID0gZmFsc2U7IC8vIElzIG5vbi1vYmplY3QgaW5wdXQgc2NoZW1hIHdyYXBwZWQgaW4gYW4gb2JqZWN0P1xuXG4gIGZvcm1WYWx1ZXNJbnB1dDogc3RyaW5nOyAvLyBOYW1lIG9mIHRoZSBpbnB1dCBwcm92aWRpbmcgdGhlIGZvcm0gZGF0YVxuICBwcmV2aW91c0lucHV0czogeyAvLyBQcmV2aW91cyBpbnB1dCB2YWx1ZXMsIHRvIGRldGVjdCB3aGljaCBpbnB1dCB0cmlnZ2VycyBvbkNoYW5nZXNcbiAgICBzY2hlbWE6IGFueSwgbGF5b3V0OiBhbnlbXSwgZGF0YTogYW55LCBvcHRpb25zOiBhbnksIGZyYW1ld29yazogYW55IHwgc3RyaW5nLFxuICAgIHdpZGdldHM6IGFueSwgZm9ybTogYW55LCBtb2RlbDogYW55LCBKU09OU2NoZW1hOiBhbnksIFVJU2NoZW1hOiBhbnksXG4gICAgZm9ybURhdGE6IGFueSwgbG9hZEV4dGVybmFsQXNzZXRzOiBib29sZWFuLCBkZWJ1ZzogYm9vbGVhbixcbiAgfSA9IHtcbiAgICAgIHNjaGVtYTogbnVsbCwgbGF5b3V0OiBudWxsLCBkYXRhOiBudWxsLCBvcHRpb25zOiBudWxsLCBmcmFtZXdvcms6IG51bGwsXG4gICAgICB3aWRnZXRzOiBudWxsLCBmb3JtOiBudWxsLCBtb2RlbDogbnVsbCwgSlNPTlNjaGVtYTogbnVsbCwgVUlTY2hlbWE6IG51bGwsXG4gICAgICBmb3JtRGF0YTogbnVsbCwgbG9hZEV4dGVybmFsQXNzZXRzOiBudWxsLCBkZWJ1ZzogbnVsbCxcbiAgICB9O1xuXG4gIC8vIFJlY29tbWVuZGVkIGlucHV0c1xuICBASW5wdXQoKSBzY2hlbWE6IGFueTsgLy8gVGhlIEpTT04gU2NoZW1hXG4gIEBJbnB1dCgpIGxheW91dDogYW55W107IC8vIFRoZSBmb3JtIGxheW91dFxuICBASW5wdXQoKSBkYXRhOiBhbnk7IC8vIFRoZSBmb3JtIGRhdGFcbiAgQElucHV0KCkgb3B0aW9uczogYW55OyAvLyBUaGUgZ2xvYmFsIGZvcm0gb3B0aW9uc1xuICBASW5wdXQoKSBmcmFtZXdvcms6IGFueSB8IHN0cmluZzsgLy8gVGhlIGZyYW1ld29yayB0byBsb2FkXG4gIEBJbnB1dCgpIHdpZGdldHM6IGFueTsgLy8gQW55IGN1c3RvbSB3aWRnZXRzIHRvIGxvYWRcblxuICAvLyBBbHRlcm5hdGUgY29tYmluZWQgc2luZ2xlIGlucHV0XG4gIEBJbnB1dCgpIGZvcm06IGFueTsgLy8gRm9yIHRlc3RpbmcsIGFuZCBKU09OIFNjaGVtYSBGb3JtIEFQSSBjb21wYXRpYmlsaXR5XG5cbiAgLy8gQW5ndWxhciBTY2hlbWEgRm9ybSBBUEkgY29tcGF0aWJpbGl0eSBpbnB1dFxuICBASW5wdXQoKSBtb2RlbDogYW55OyAvLyBBbHRlcm5hdGUgaW5wdXQgZm9yIGZvcm0gZGF0YVxuXG4gIC8vIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gQVBJIGNvbXBhdGliaWxpdHkgaW5wdXRzXG4gIEBJbnB1dCgpIEpTT05TY2hlbWE6IGFueTsgLy8gQWx0ZXJuYXRlIGlucHV0IGZvciBKU09OIFNjaGVtYVxuICBASW5wdXQoKSBVSVNjaGVtYTogYW55OyAvLyBVSSBzY2hlbWEgLSBhbHRlcm5hdGUgZm9ybSBsYXlvdXQgZm9ybWF0XG4gIEBJbnB1dCgpIGZvcm1EYXRhOiBhbnk7IC8vIEFsdGVybmF0ZSBpbnB1dCBmb3IgZm9ybSBkYXRhXG5cbiAgQElucHV0KCkgbmdNb2RlbDogYW55OyAvLyBBbHRlcm5hdGUgaW5wdXQgZm9yIEFuZ3VsYXIgZm9ybXNcblxuICBASW5wdXQoKSBsYW5ndWFnZTogc3RyaW5nOyAvLyBMYW5ndWFnZVxuXG4gIC8vIERldmVsb3BtZW50IGlucHV0cywgZm9yIHRlc3RpbmcgYW5kIGRlYnVnZ2luZ1xuICBASW5wdXQoKSBsb2FkRXh0ZXJuYWxBc3NldHM6IGJvb2xlYW47IC8vIExvYWQgZXh0ZXJuYWwgZnJhbWV3b3JrIGFzc2V0cz9cbiAgQElucHV0KCkgZGVidWc6IGJvb2xlYW47IC8vIFNob3cgZGVidWcgaW5mb3JtYXRpb24/XG5cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMub2JqZWN0V3JhcCA/IHRoaXMuanNmLmRhdGFbJzEnXSA6IHRoaXMuanNmLmRhdGE7XG4gIH1cbiAgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLnNldEZvcm1WYWx1ZXModmFsdWUsIGZhbHNlKTtcbiAgfVxuXG4gIC8vIE91dHB1dHNcbiAgQE91dHB1dCgpIG9uQ2hhbmdlcyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBMaXZlIHVudmFsaWRhdGVkIGludGVybmFsIGZvcm0gZGF0YVxuICBAT3V0cHV0KCkgb25TdWJtaXQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTsgLy8gQ29tcGxldGUgdmFsaWRhdGVkIGZvcm0gZGF0YVxuICBAT3V0cHV0KCkgaXNWYWxpZCA9IG5ldyBFdmVudEVtaXR0ZXI8Ym9vbGVhbj4oKTsgLy8gSXMgY3VycmVudCBkYXRhIHZhbGlkP1xuICBAT3V0cHV0KCkgdmFsaWRhdGlvbkVycm9ycyA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBWYWxpZGF0aW9uIGVycm9ycyAoaWYgYW55KVxuICBAT3V0cHV0KCkgZm9ybVNjaGVtYSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBGaW5hbCBzY2hlbWEgdXNlZCB0byBjcmVhdGUgZm9ybVxuICBAT3V0cHV0KCkgZm9ybUxheW91dCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpOyAvLyBGaW5hbCBsYXlvdXQgdXNlZCB0byBjcmVhdGUgZm9ybVxuXG4gIC8vIE91dHB1dHMgZm9yIHBvc3NpYmxlIDItd2F5IGRhdGEgYmluZGluZ1xuICAvLyBPbmx5IHRoZSBvbmUgaW5wdXQgcHJvdmlkaW5nIHRoZSBpbml0aWFsIGZvcm0gZGF0YSB3aWxsIGJlIGJvdW5kLlxuICAvLyBJZiB0aGVyZSBpcyBubyBpbml0YWwgZGF0YSwgaW5wdXQgJ3t9JyB0byBhY3RpdmF0ZSAyLXdheSBkYXRhIGJpbmRpbmcuXG4gIC8vIFRoZXJlIGlzIG5vIDItd2F5IGJpbmRpbmcgaWYgaW5pdGFsIGRhdGEgaXMgY29tYmluZWQgaW5zaWRlIHRoZSAnZm9ybScgaW5wdXQuXG4gIEBPdXRwdXQoKSBkYXRhQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBtb2RlbENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgZm9ybURhdGFDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIG5nTW9kZWxDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBvbkNoYW5nZTogRnVuY3Rpb247XG4gIG9uVG91Y2hlZDogRnVuY3Rpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBmcmFtZXdvcmtMaWJyYXJ5OiBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICBwcml2YXRlIHdpZGdldExpYnJhcnk6IFdpZGdldExpYnJhcnlTZXJ2aWNlLFxuICAgIHB1YmxpYyBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZSxcbiAgKSB7IH1cblxuICBwcml2YXRlIHJlc2V0U2NyaXB0c0FuZFN0eWxlU2hlZXRzKCkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hanNmJykuZm9yRWFjaChlbGVtZW50ID0+IGVsZW1lbnQucmVtb3ZlKCkpO1xuICB9XG4gIHByaXZhdGUgbG9hZFNjcmlwdHMoKSB7XG4gICAgY29uc3Qgc2NyaXB0cyA9IHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmtTY3JpcHRzKCk7XG4gICAgc2NyaXB0cy5tYXAoc2NyaXB0ID0+IHtcbiAgICAgIGNvbnN0IHNjcmlwdFRhZzogSFRNTFNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIHNjcmlwdFRhZy5zcmMgPSBzY3JpcHQ7XG4gICAgICBzY3JpcHRUYWcudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgc2NyaXB0VGFnLmFzeW5jID0gdHJ1ZTtcbiAgICAgIHNjcmlwdFRhZy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2Fqc2YnKTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0VGFnKTtcbiAgICB9KTtcbiAgfVxuICBwcml2YXRlIGxvYWRTdHlsZVNoZWV0cygpIHtcbiAgICBjb25zdCBzdHlsZXNoZWV0cyA9IHRoaXMuZnJhbWV3b3JrTGlicmFyeS5nZXRGcmFtZXdvcmtTdHlsZXNoZWV0cygpO1xuICAgIHN0eWxlc2hlZXRzLm1hcChzdHlsZXNoZWV0ID0+IHtcbiAgICAgIGNvbnN0IGxpbmtUYWc6IEhUTUxMaW5rRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICAgIGxpbmtUYWcucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgICAgbGlua1RhZy5ocmVmID0gc3R5bGVzaGVldDtcbiAgICAgIGxpbmtUYWcuc2V0QXR0cmlidXRlKCdjbGFzcycsICdhanNmJyk7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGxpbmtUYWcpO1xuICAgIH0pO1xuICB9XG4gIHByaXZhdGUgbG9hZEFzc2V0cygpIHtcbiAgICB0aGlzLnJlc2V0U2NyaXB0c0FuZFN0eWxlU2hlZXRzKCk7XG4gICAgdGhpcy5sb2FkU2NyaXB0cygpO1xuICAgIHRoaXMubG9hZFN0eWxlU2hlZXRzKCk7XG4gIH1cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy51cGRhdGVGb3JtKCk7XG4gICAgdGhpcy5sb2FkQXNzZXRzKCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgdGhpcy51cGRhdGVGb3JtKCk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBjaGFuZ2VzIGluIEZyYW1ld29yayB0aGVuIGxvYWQgYXNzZXRzIGlmIHRoYXQncyB0aGVcbiAgICBpZiAoY2hhbmdlcy5mcmFtZXdvcmspIHtcbiAgICAgIGlmICghY2hhbmdlcy5mcmFtZXdvcmsuaXNGaXJzdENoYW5nZSgpICYmXG4gICAgICAgIChjaGFuZ2VzLmZyYW1ld29yay5wcmV2aW91c1ZhbHVlICE9PSBjaGFuZ2VzLmZyYW1ld29yay5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIHRoaXMubG9hZEFzc2V0cygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWU6IGFueSkge1xuICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh2YWx1ZSwgZmFsc2UpO1xuICAgIGlmICghdGhpcy5mb3JtVmFsdWVzSW5wdXQpIHsgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnbmdNb2RlbCc7IH1cbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8vc2VlIG5vdGVcbiAgLy9odHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdXBkYXRlLXRvLXZlcnNpb24tMTUjdjE1LWJjLTA2XG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLmpzZi5mb3JtT3B0aW9ucy5mb3JtRGlzYWJsZWQgIT09ICEhaXNEaXNhYmxlZCkge1xuICAgICAgdGhpcy5qc2YuZm9ybU9wdGlvbnMuZm9ybURpc2FibGVkID0gISFpc0Rpc2FibGVkO1xuICAgICAgdGhpcy5pbml0aWFsaXplRm9ybSgpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUZvcm0oKSB7XG4gICAgaWYgKCF0aGlzLmZvcm1Jbml0aWFsaXplZCB8fCAhdGhpcy5mb3JtVmFsdWVzSW5wdXQgfHxcbiAgICAgICh0aGlzLmxhbmd1YWdlICYmIHRoaXMubGFuZ3VhZ2UgIT09IHRoaXMuanNmLmxhbmd1YWdlKVxuICAgICkge1xuICAgICAgdGhpcy5pbml0aWFsaXplRm9ybSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5sYW5ndWFnZSAmJiB0aGlzLmxhbmd1YWdlICE9PSB0aGlzLmpzZi5sYW5ndWFnZSkge1xuICAgICAgICB0aGlzLmpzZi5zZXRMYW5ndWFnZSh0aGlzLmxhbmd1YWdlKTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IG5hbWVzIG9mIGNoYW5nZWQgaW5wdXRzXG4gICAgICBsZXQgY2hhbmdlZElucHV0ID0gT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cylcbiAgICAgICAgLmZpbHRlcihpbnB1dCA9PiB0aGlzLnByZXZpb3VzSW5wdXRzW2lucHV0XSAhPT0gdGhpc1tpbnB1dF0pO1xuICAgICAgbGV0IHJlc2V0Rmlyc3QgPSB0cnVlO1xuICAgICAgaWYgKGNoYW5nZWRJbnB1dC5sZW5ndGggPT09IDEgJiYgY2hhbmdlZElucHV0WzBdID09PSAnZm9ybScgJiZcbiAgICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQuc3RhcnRzV2l0aCgnZm9ybS4nKVxuICAgICAgKSB7XG4gICAgICAgIC8vIElmIG9ubHkgJ2Zvcm0nIGlucHV0IGNoYW5nZWQsIGdldCBuYW1lcyBvZiBjaGFuZ2VkIGtleXNcbiAgICAgICAgY2hhbmdlZElucHV0ID0gT2JqZWN0LmtleXModGhpcy5wcmV2aW91c0lucHV0cy5mb3JtIHx8IHt9KVxuICAgICAgICAgIC5maWx0ZXIoa2V5ID0+ICFpc0VxdWFsKHRoaXMucHJldmlvdXNJbnB1dHMuZm9ybVtrZXldLCB0aGlzLmZvcm1ba2V5XSkpXG4gICAgICAgICAgLm1hcChrZXkgPT4gYGZvcm0uJHtrZXl9YCk7XG4gICAgICAgIHJlc2V0Rmlyc3QgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgb25seSBpbnB1dCB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLCB1cGRhdGUgdGhlIGZvcm0gdmFsdWVzXG4gICAgICBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCA9PT0gMSAmJiBjaGFuZ2VkSW5wdXRbMF0gPT09IHRoaXMuZm9ybVZhbHVlc0lucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm1WYWx1ZXNJbnB1dC5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zZXRGb3JtVmFsdWVzKHRoaXNbdGhpcy5mb3JtVmFsdWVzSW5wdXRdLCByZXNldEZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBbaW5wdXQsIGtleV0gPSB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5zcGxpdCgnLicpO1xuICAgICAgICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh0aGlzW2lucHV0XVtrZXldLCByZXNldEZpcnN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGFueXRoaW5nIGVsc2UgaGFzIGNoYW5nZWQsIHJlLXJlbmRlciB0aGUgZW50aXJlIGZvcm1cbiAgICAgIH0gZWxzZSBpZiAoY2hhbmdlZElucHV0Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVGb3JtKCk7XG4gICAgICAgIGlmICh0aGlzLm9uQ2hhbmdlKSB7IHRoaXMub25DaGFuZ2UodGhpcy5qc2YuZm9ybVZhbHVlcyk7IH1cbiAgICAgICAgaWYgKHRoaXMub25Ub3VjaGVkKSB7IHRoaXMub25Ub3VjaGVkKHRoaXMuanNmLmZvcm1WYWx1ZXMpOyB9XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSBwcmV2aW91cyBpbnB1dHNcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucHJldmlvdXNJbnB1dHMpXG4gICAgICAgIC5maWx0ZXIoaW5wdXQgPT4gdGhpcy5wcmV2aW91c0lucHV0c1tpbnB1dF0gIT09IHRoaXNbaW5wdXRdKVxuICAgICAgICAuZm9yRWFjaChpbnB1dCA9PiB0aGlzLnByZXZpb3VzSW5wdXRzW2lucHV0XSA9IHRoaXNbaW5wdXRdKTtcbiAgICB9XG4gIH1cblxuICBzZXRGb3JtVmFsdWVzKGZvcm1WYWx1ZXM6IGFueSwgcmVzZXRGaXJzdCA9IHRydWUpIHtcbiAgICBpZiAoZm9ybVZhbHVlcykge1xuICAgICAgY29uc3QgbmV3Rm9ybVZhbHVlcyA9IHRoaXMub2JqZWN0V3JhcCA/IGZvcm1WYWx1ZXNbJzEnXSA6IGZvcm1WYWx1ZXM7XG4gICAgICBpZiAoIXRoaXMuanNmLmZvcm1Hcm91cCkge1xuICAgICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gZm9ybVZhbHVlcztcbiAgICAgICAgdGhpcy5hY3RpdmF0ZUZvcm0oKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzZXRGaXJzdCkge1xuICAgICAgICB0aGlzLmpzZi5mb3JtR3JvdXAucmVzZXQoKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmpzZi5mb3JtR3JvdXApIHtcbiAgICAgICAgdGhpcy5qc2YuZm9ybUdyb3VwLnBhdGNoVmFsdWUobmV3Rm9ybVZhbHVlcyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vbkNoYW5nZSkgeyB0aGlzLm9uQ2hhbmdlKG5ld0Zvcm1WYWx1ZXMpOyB9XG4gICAgICBpZiAodGhpcy5vblRvdWNoZWQpIHsgdGhpcy5vblRvdWNoZWQobmV3Rm9ybVZhbHVlcyk7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5qc2YuZm9ybUdyb3VwLnJlc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgc3VibWl0Rm9ybSgpIHtcbiAgICBjb25zdCB2YWxpZERhdGEgPSB0aGlzLmpzZi52YWxpZERhdGE7XG4gICAgdGhpcy5vblN1Ym1pdC5lbWl0KHRoaXMub2JqZWN0V3JhcCA/IHZhbGlkRGF0YVsnMSddIDogdmFsaWREYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZUZvcm0nIGZ1bmN0aW9uXG4gICAqXG4gICAqIC0gVXBkYXRlICdzY2hlbWEnLCAnbGF5b3V0JywgYW5kICdmb3JtVmFsdWVzJywgZnJvbSBpbnB1dHMuXG4gICAqXG4gICAqIC0gQ3JlYXRlICdzY2hlbWFSZWZMaWJyYXJ5JyBhbmQgJ3NjaGVtYVJlY3Vyc2l2ZVJlZk1hcCdcbiAgICogICB0byByZXNvbHZlIHNjaGVtYSAkcmVmIGxpbmtzLCBpbmNsdWRpbmcgcmVjdXJzaXZlICRyZWYgbGlua3MuXG4gICAqXG4gICAqIC0gQ3JlYXRlICdkYXRhUmVjdXJzaXZlUmVmTWFwJyB0byByZXNvbHZlIHJlY3Vyc2l2ZSBsaW5rcyBpbiBkYXRhXG4gICAqICAgYW5kIGNvcmVjdGx5IHNldCBvdXRwdXQgZm9ybWF0cyBmb3IgcmVjdXJzaXZlbHkgbmVzdGVkIHZhbHVlcy5cbiAgICpcbiAgICogLSBDcmVhdGUgJ2xheW91dFJlZkxpYnJhcnknIGFuZCAndGVtcGxhdGVSZWZMaWJyYXJ5JyB0byBzdG9yZVxuICAgKiAgIG5ldyBsYXlvdXQgbm9kZXMgYW5kIGZvcm1Hcm91cCBlbGVtZW50cyB0byB1c2Ugd2hlbiBkeW5hbWljYWxseVxuICAgKiAgIGFkZGluZyBmb3JtIGNvbXBvbmVudHMgdG8gYXJyYXlzIGFuZCByZWN1cnNpdmUgJHJlZiBwb2ludHMuXG4gICAqXG4gICAqIC0gQ3JlYXRlICdkYXRhTWFwJyB0byBtYXAgdGhlIGRhdGEgdG8gdGhlIHNjaGVtYSBhbmQgdGVtcGxhdGUuXG4gICAqXG4gICAqIC0gQ3JlYXRlIHRoZSBtYXN0ZXIgJ2Zvcm1Hcm91cFRlbXBsYXRlJyB0aGVuIGZyb20gaXQgJ2Zvcm1Hcm91cCdcbiAgICogICB0aGUgQW5ndWxhciBmb3JtR3JvdXAgdXNlZCB0byBjb250cm9sIHRoZSByZWFjdGl2ZSBmb3JtLlxuICAgKi9cbiAgaW5pdGlhbGl6ZUZvcm0oKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5zY2hlbWEgfHwgdGhpcy5sYXlvdXQgfHwgdGhpcy5kYXRhIHx8IHRoaXMuZm9ybSB8fCB0aGlzLm1vZGVsIHx8XG4gICAgICB0aGlzLkpTT05TY2hlbWEgfHwgdGhpcy5VSVNjaGVtYSB8fCB0aGlzLmZvcm1EYXRhIHx8IHRoaXMubmdNb2RlbCB8fFxuICAgICAgdGhpcy5qc2YuZGF0YVxuICAgICkge1xuXG4gICAgICB0aGlzLmpzZi5yZXNldEFsbFZhbHVlcygpOyAgLy8gUmVzZXQgYWxsIGZvcm0gdmFsdWVzIHRvIGRlZmF1bHRzXG4gICAgICB0aGlzLmluaXRpYWxpemVPcHRpb25zKCk7ICAgLy8gVXBkYXRlIG9wdGlvbnNcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjaGVtYSgpOyAgICAvLyBVcGRhdGUgc2NoZW1hLCBzY2hlbWFSZWZMaWJyYXJ5LFxuICAgICAgLy8gc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCAmIGRhdGFSZWN1cnNpdmVSZWZNYXBcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZUxheW91dCgpOyAgICAvLyBVcGRhdGUgbGF5b3V0LCBsYXlvdXRSZWZMaWJyYXJ5LFxuICAgICAgdGhpcy5pbml0aWFsaXplRGF0YSgpOyAgICAgIC8vIFVwZGF0ZSBmb3JtVmFsdWVzXG4gICAgICB0aGlzLmFjdGl2YXRlRm9ybSgpOyAgICAgICAgLy8gVXBkYXRlIGRhdGFNYXAsIHRlbXBsYXRlUmVmTGlicmFyeSxcbiAgICAgIC8vIGZvcm1Hcm91cFRlbXBsYXRlLCBmb3JtR3JvdXBcblxuICAgICAgLy8gVW5jb21tZW50IGluZGl2aWR1YWwgbGluZXMgdG8gb3V0cHV0IGRlYnVnZ2luZyBpbmZvcm1hdGlvbiB0byBjb25zb2xlOlxuICAgICAgLy8gKFRoZXNlIGFsd2F5cyB3b3JrLilcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdsb2FkaW5nIGZvcm0uLi4nKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzY2hlbWEnLCB0aGlzLmpzZi5zY2hlbWEpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2xheW91dCcsIHRoaXMuanNmLmxheW91dCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnb3B0aW9ucycsIHRoaXMub3B0aW9ucyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZm9ybVZhbHVlcycsIHRoaXMuanNmLmZvcm1WYWx1ZXMpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1Hcm91cFRlbXBsYXRlJywgdGhpcy5qc2YuZm9ybUdyb3VwVGVtcGxhdGUpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2Zvcm1Hcm91cCcsIHRoaXMuanNmLmZvcm1Hcm91cCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZm9ybUdyb3VwLnZhbHVlJywgdGhpcy5qc2YuZm9ybUdyb3VwLnZhbHVlKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzY2hlbWFSZWZMaWJyYXJ5JywgdGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnbGF5b3V0UmVmTGlicmFyeScsIHRoaXMuanNmLmxheW91dFJlZkxpYnJhcnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3RlbXBsYXRlUmVmTGlicmFyeScsIHRoaXMuanNmLnRlbXBsYXRlUmVmTGlicmFyeSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZGF0YU1hcCcsIHRoaXMuanNmLmRhdGFNYXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2FycmF5TWFwJywgdGhpcy5qc2YuYXJyYXlNYXApO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3NjaGVtYVJlY3Vyc2l2ZVJlZk1hcCcsIHRoaXMuanNmLnNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZGF0YVJlY3Vyc2l2ZVJlZk1hcCcsIHRoaXMuanNmLmRhdGFSZWN1cnNpdmVSZWZNYXApO1xuXG4gICAgICAvLyBVbmNvbW1lbnQgaW5kaXZpZHVhbCBsaW5lcyB0byBvdXRwdXQgZGVidWdnaW5nIGluZm9ybWF0aW9uIHRvIGJyb3dzZXI6XG4gICAgICAvLyAoVGhlc2Ugb25seSB3b3JrIGlmIHRoZSAnZGVidWcnIG9wdGlvbiBoYXMgYWxzbyBiZWVuIHNldCB0byAndHJ1ZScuKVxuICAgICAgaWYgKHRoaXMuZGVidWcgfHwgdGhpcy5qc2YuZm9ybU9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgY29uc3QgdmFyczogYW55W10gPSBbXTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLnNjaGVtYSk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5sYXlvdXQpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5vcHRpb25zKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1WYWx1ZXMpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuZm9ybUdyb3VwLnZhbHVlKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1Hcm91cFRlbXBsYXRlKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmZvcm1Hcm91cCk7XG4gICAgICAgIC8vIHZhcnMucHVzaCh0aGlzLmpzZi5zY2hlbWFSZWZMaWJyYXJ5KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmxheW91dFJlZkxpYnJhcnkpO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YudGVtcGxhdGVSZWZMaWJyYXJ5KTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmRhdGFNYXApO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2YuYXJyYXlNYXApO1xuICAgICAgICAvLyB2YXJzLnB1c2godGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgICAgLy8gdmFycy5wdXNoKHRoaXMuanNmLmRhdGFSZWN1cnNpdmVSZWZNYXApO1xuICAgICAgICB0aGlzLmRlYnVnT3V0cHV0ID0gdmFycy5tYXAodiA9PiBKU09OLnN0cmluZ2lmeSh2LCBudWxsLCAyKSkuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmZvcm1Jbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdpbml0aWFsaXplT3B0aW9ucycgZnVuY3Rpb25cbiAgICpcbiAgICogSW5pdGlhbGl6ZSAnb3B0aW9ucycgKGdsb2JhbCBmb3JtIG9wdGlvbnMpIGFuZCBzZXQgZnJhbWV3b3JrXG4gICAqIENvbWJpbmUgYXZhaWxhYmxlIGlucHV0czpcbiAgICogMS4gb3B0aW9ucyAtIHJlY29tbWVuZGVkXG4gICAqIDIuIGZvcm0ub3B0aW9ucyAtIFNpbmdsZSBpbnB1dCBzdHlsZVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplT3B0aW9ucygpIHtcbiAgICBpZiAodGhpcy5sYW5ndWFnZSAmJiB0aGlzLmxhbmd1YWdlICE9PSB0aGlzLmpzZi5sYW5ndWFnZSkge1xuICAgICAgdGhpcy5qc2Yuc2V0TGFuZ3VhZ2UodGhpcy5sYW5ndWFnZSk7XG4gICAgfVxuICAgIHRoaXMuanNmLnNldE9wdGlvbnMoeyBkZWJ1ZzogISF0aGlzLmRlYnVnIH0pO1xuICAgIGxldCBsb2FkRXh0ZXJuYWxBc3NldHM6IGJvb2xlYW4gPSB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0cyB8fCBmYWxzZTtcbiAgICBsZXQgZnJhbWV3b3JrOiBhbnkgPSB0aGlzLmZyYW1ld29yayB8fCAnZGVmYXVsdCc7XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMub3B0aW9ucykpIHtcbiAgICAgIHRoaXMuanNmLnNldE9wdGlvbnModGhpcy5vcHRpb25zKTtcbiAgICAgIGxvYWRFeHRlcm5hbEFzc2V0cyA9IHRoaXMub3B0aW9ucy5sb2FkRXh0ZXJuYWxBc3NldHMgfHwgbG9hZEV4dGVybmFsQXNzZXRzO1xuICAgICAgZnJhbWV3b3JrID0gdGhpcy5vcHRpb25zLmZyYW1ld29yayB8fCBmcmFtZXdvcms7XG4gICAgfVxuICAgIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGlzT2JqZWN0KHRoaXMuZm9ybS5vcHRpb25zKSkge1xuICAgICAgdGhpcy5qc2Yuc2V0T3B0aW9ucyh0aGlzLmZvcm0ub3B0aW9ucyk7XG4gICAgICBsb2FkRXh0ZXJuYWxBc3NldHMgPSB0aGlzLmZvcm0ub3B0aW9ucy5sb2FkRXh0ZXJuYWxBc3NldHMgfHwgbG9hZEV4dGVybmFsQXNzZXRzO1xuICAgICAgZnJhbWV3b3JrID0gdGhpcy5mb3JtLm9wdGlvbnMuZnJhbWV3b3JrIHx8IGZyYW1ld29yaztcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMud2lkZ2V0cykpIHtcbiAgICAgIHRoaXMuanNmLnNldE9wdGlvbnMoeyB3aWRnZXRzOiB0aGlzLndpZGdldHMgfSk7XG4gICAgfVxuICAgIHRoaXMuZnJhbWV3b3JrTGlicmFyeS5zZXRMb2FkRXh0ZXJuYWxBc3NldHMobG9hZEV4dGVybmFsQXNzZXRzKTtcbiAgICB0aGlzLmZyYW1ld29ya0xpYnJhcnkuc2V0RnJhbWV3b3JrKGZyYW1ld29yayk7XG4gICAgdGhpcy5qc2YuZnJhbWV3b3JrID0gdGhpcy5mcmFtZXdvcmtMaWJyYXJ5LmdldEZyYW1ld29yaygpO1xuICAgIGlmIChpc09iamVjdCh0aGlzLmpzZi5mb3JtT3B0aW9ucy53aWRnZXRzKSkge1xuICAgICAgZm9yIChjb25zdCB3aWRnZXQgb2YgT2JqZWN0LmtleXModGhpcy5qc2YuZm9ybU9wdGlvbnMud2lkZ2V0cykpIHtcbiAgICAgICAgdGhpcy53aWRnZXRMaWJyYXJ5LnJlZ2lzdGVyV2lkZ2V0KHdpZGdldCwgdGhpcy5qc2YuZm9ybU9wdGlvbnMud2lkZ2V0c1t3aWRnZXRdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkgJiYgaXNPYmplY3QodGhpcy5mb3JtLnRwbGRhdGEpKSB7XG4gICAgICB0aGlzLmpzZi5zZXRUcGxkYXRhKHRoaXMuZm9ybS50cGxkYXRhKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVTY2hlbWEnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ3NjaGVtYSdcbiAgICogVXNlIGZpcnN0IGF2YWlsYWJsZSBpbnB1dDpcbiAgICogMS4gc2NoZW1hIC0gcmVjb21tZW5kZWQgLyBBbmd1bGFyIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDIuIGZvcm0uc2NoZW1hIC0gU2luZ2xlIGlucHV0IC8gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDMuIEpTT05TY2hlbWEgLSBSZWFjdCBKU09OIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDQuIGZvcm0uSlNPTlNjaGVtYSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBpbnB1dCBSZWFjdCBKU09OIFNjaGVtYSBGb3Jtc1xuICAgKiA1LiBmb3JtIC0gRm9yIHRlc3Rpbmcgc2luZ2xlIHNjaGVtYS1vbmx5IGlucHV0c1xuICAgKlxuICAgKiAuLi4gaWYgbm8gc2NoZW1hIGlucHV0IGZvdW5kLCB0aGUgJ2FjdGl2YXRlRm9ybScgZnVuY3Rpb24sIGJlbG93LFxuICAgKiAgICAgd2lsbCBtYWtlIHR3byBhZGRpdGlvbmFsIGF0dGVtcHRzIHRvIGJ1aWxkIGEgc2NoZW1hXG4gICAqIDYuIElmIGxheW91dCBpbnB1dCAtIGJ1aWxkIHNjaGVtYSBmcm9tIGxheW91dFxuICAgKiA3LiBJZiBkYXRhIGlucHV0IC0gYnVpbGQgc2NoZW1hIGZyb20gZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplU2NoZW1hKCkge1xuXG4gICAgLy8gVE9ETzogdXBkYXRlIHRvIGFsbG93IG5vbi1vYmplY3Qgc2NoZW1hc1xuXG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuc2NoZW1hKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLnNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnc2NoZW1hJykgJiYgaXNPYmplY3QodGhpcy5mb3JtLnNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLmZvcm0uc2NoZW1hKTtcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuSlNPTlNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLkpTT05TY2hlbWEpO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHRoaXMuZm9ybSwgJ0pTT05TY2hlbWEnKSAmJiBpc09iamVjdCh0aGlzLmZvcm0uSlNPTlNjaGVtYSkpIHtcbiAgICAgIHRoaXMuanNmLlJlYWN0SnNvblNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNsb25lRGVlcCh0aGlzLmZvcm0uSlNPTlNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAncHJvcGVydGllcycpICYmIGlzT2JqZWN0KHRoaXMuZm9ybS5wcm9wZXJ0aWVzKSkge1xuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gY2xvbmVEZWVwKHRoaXMuZm9ybSk7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0aGlzLmZvcm0pKSB7XG4gICAgICAvLyBUT0RPOiBIYW5kbGUgb3RoZXIgdHlwZXMgb2YgZm9ybSBpbnB1dFxuICAgIH1cblxuICAgIGlmICghaXNFbXB0eSh0aGlzLmpzZi5zY2hlbWEpKSB7XG5cbiAgICAgIC8vIElmIG90aGVyIHR5cGVzIGFsc28gYWxsb3dlZCwgcmVuZGVyIHNjaGVtYSBhcyBhbiBvYmplY3RcbiAgICAgIGlmIChpbkFycmF5KCdvYmplY3QnLCB0aGlzLmpzZi5zY2hlbWEudHlwZSkpIHtcbiAgICAgICAgdGhpcy5qc2Yuc2NoZW1hLnR5cGUgPSAnb2JqZWN0JztcbiAgICAgIH1cblxuICAgICAgLy8gV3JhcCBub24tb2JqZWN0IHNjaGVtYXMgaW4gb2JqZWN0LlxuICAgICAgaWYgKGhhc093bih0aGlzLmpzZi5zY2hlbWEsICd0eXBlJykgJiYgdGhpcy5qc2Yuc2NoZW1hLnR5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMuanNmLnNjaGVtYSA9IHtcbiAgICAgICAgICAndHlwZSc6ICdvYmplY3QnLFxuICAgICAgICAgICdwcm9wZXJ0aWVzJzogeyAxOiB0aGlzLmpzZi5zY2hlbWEgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9iamVjdFdyYXAgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICghaGFzT3duKHRoaXMuanNmLnNjaGVtYSwgJ3R5cGUnKSkge1xuXG4gICAgICAgIC8vIEFkZCB0eXBlID0gJ29iamVjdCcgaWYgbWlzc2luZ1xuICAgICAgICBpZiAoaXNPYmplY3QodGhpcy5qc2Yuc2NoZW1hLnByb3BlcnRpZXMpIHx8XG4gICAgICAgICAgaXNPYmplY3QodGhpcy5qc2Yuc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzKSB8fFxuICAgICAgICAgIGlzT2JqZWN0KHRoaXMuanNmLnNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcylcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5qc2Yuc2NoZW1hLnR5cGUgPSAnb2JqZWN0JztcblxuICAgICAgICAgIC8vIEZpeCBKU09OIHNjaGVtYSBzaG9ydGhhbmQgKEpTT04gRm9ybSBzdHlsZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmpzZi5Kc29uRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuanNmLnNjaGVtYSA9IHtcbiAgICAgICAgICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgICAgICAgICAncHJvcGVydGllcyc6IHRoaXMuanNmLnNjaGVtYVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbmVlZGVkLCB1cGRhdGUgSlNPTiBTY2hlbWEgdG8gZHJhZnQgNiBmb3JtYXQsIGluY2x1ZGluZ1xuICAgICAgLy8gZHJhZnQgMyAoSlNPTiBGb3JtIHN0eWxlKSBhbmQgZHJhZnQgNCAoQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZSlcbiAgICAgIHRoaXMuanNmLnNjaGVtYSA9IGNvbnZlcnRTY2hlbWFUb0RyYWZ0Nih0aGlzLmpzZi5zY2hlbWEpO1xuXG4gICAgICAvLyBJbml0aWFsaXplIGFqdiBhbmQgY29tcGlsZSBzY2hlbWFcbiAgICAgIHRoaXMuanNmLmNvbXBpbGVBanZTY2hlbWEoKTtcblxuICAgICAgLy8gQ3JlYXRlIHNjaGVtYVJlZkxpYnJhcnksIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgZGF0YVJlY3Vyc2l2ZVJlZk1hcCwgJiBhcnJheU1hcFxuICAgICAgdGhpcy5qc2Yuc2NoZW1hID0gcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMoXG4gICAgICAgIHRoaXMuanNmLnNjaGVtYSwgdGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSwgdGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLFxuICAgICAgICB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCB0aGlzLmpzZi5hcnJheU1hcFxuICAgICAgKTtcbiAgICAgIGlmIChoYXNPd24odGhpcy5qc2Yuc2NoZW1hUmVmTGlicmFyeSwgJycpKSB7XG4gICAgICAgIHRoaXMuanNmLmhhc1Jvb3RSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiAoPykgUmVzb2x2ZSBleHRlcm5hbCAkcmVmIGxpbmtzXG4gICAgICAvLyAvLyBDcmVhdGUgc2NoZW1hUmVmTGlicmFyeSAmIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcFxuICAgICAgLy8gdGhpcy5wYXJzZXIuYnVuZGxlKHRoaXMuc2NoZW1hKVxuICAgICAgLy8gICAudGhlbihzY2hlbWEgPT4gdGhpcy5zY2hlbWEgPSByZXNvbHZlU2NoZW1hUmVmZXJlbmNlcyhcbiAgICAgIC8vICAgICBzY2hlbWEsIHRoaXMuanNmLnNjaGVtYVJlZkxpYnJhcnksXG4gICAgICAvLyAgICAgdGhpcy5qc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCB0aGlzLmpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwXG4gICAgICAvLyAgICkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnaW5pdGlhbGl6ZURhdGEnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ2Zvcm1WYWx1ZXMnXG4gICAqIGRlZnVsYXQgb3IgcHJldmlvdXNseSBzdWJtaXR0ZWQgdmFsdWVzIHVzZWQgdG8gcG9wdWxhdGUgZm9ybVxuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBkYXRhIC0gcmVjb21tZW5kZWRcbiAgICogMi4gbW9kZWwgLSBBbmd1bGFyIFNjaGVtYSBGb3JtIHN0eWxlXG4gICAqIDMuIGZvcm0udmFsdWUgLSBKU09OIEZvcm0gc3R5bGVcbiAgICogNC4gZm9ybS5kYXRhIC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqIDUuIGZvcm1EYXRhIC0gUmVhY3QgSlNPTiBTY2hlbWEgRm9ybSBzdHlsZVxuICAgKiA2LiBmb3JtLmZvcm1EYXRhIC0gRm9yIGVhc2llciB0ZXN0aW5nIG9mIFJlYWN0IEpTT04gU2NoZW1hIEZvcm1zXG4gICAqIDcuIChub25lKSBubyBkYXRhIC0gaW5pdGlhbGl6ZSBkYXRhIGZyb20gc2NoZW1hIGFuZCBsYXlvdXQgZGVmYXVsdHMgb25seVxuICAgKi9cbiAgcHJpdmF0ZSBpbml0aWFsaXplRGF0YSgpIHtcbiAgICBpZiAoaGFzVmFsdWUodGhpcy5kYXRhKSkge1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLmRhdGEpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZGF0YSc7XG4gICAgfSBlbHNlIGlmIChoYXNWYWx1ZSh0aGlzLm1vZGVsKSkge1xuICAgICAgdGhpcy5qc2YuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmZvcm1WYWx1ZXMgPSBjbG9uZURlZXAodGhpcy5tb2RlbCk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdtb2RlbCc7XG4gICAgfSBlbHNlIGlmIChoYXNWYWx1ZSh0aGlzLm5nTW9kZWwpKSB7XG4gICAgICB0aGlzLmpzZi5Bbmd1bGFyU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLm5nTW9kZWwpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnbmdNb2RlbCc7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0aGlzLmZvcm0pICYmIGhhc1ZhbHVlKHRoaXMuZm9ybS52YWx1ZSkpIHtcbiAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMuZm9ybS52YWx1ZSk7XG4gICAgICB0aGlzLmZvcm1WYWx1ZXNJbnB1dCA9ICdmb3JtLnZhbHVlJztcbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuZm9ybSkgJiYgaGFzVmFsdWUodGhpcy5mb3JtLmRhdGEpKSB7XG4gICAgICB0aGlzLmpzZi5mb3JtVmFsdWVzID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5kYXRhKTtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gJ2Zvcm0uZGF0YSc7XG4gICAgfSBlbHNlIGlmIChoYXNWYWx1ZSh0aGlzLmZvcm1EYXRhKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZm9ybURhdGEnO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHRoaXMuZm9ybSwgJ2Zvcm1EYXRhJykgJiYgaGFzVmFsdWUodGhpcy5mb3JtLmZvcm1EYXRhKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5qc2YuZm9ybVZhbHVlcyA9IGNsb25lRGVlcCh0aGlzLmZvcm0uZm9ybURhdGEpO1xuICAgICAgdGhpcy5mb3JtVmFsdWVzSW5wdXQgPSAnZm9ybS5mb3JtRGF0YSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9ybVZhbHVlc0lucHV0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2luaXRpYWxpemVMYXlvdXQnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEluaXRpYWxpemUgJ2xheW91dCdcbiAgICogVXNlIGZpcnN0IGF2YWlsYWJsZSBhcnJheSBpbnB1dDpcbiAgICogMS4gbGF5b3V0IC0gcmVjb21tZW5kZWRcbiAgICogMi4gZm9ybSAtIEFuZ3VsYXIgU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMy4gZm9ybS5mb3JtIC0gSlNPTiBGb3JtIHN0eWxlXG4gICAqIDQuIGZvcm0ubGF5b3V0IC0gU2luZ2xlIGlucHV0IHN0eWxlXG4gICAqIDUuIChub25lKSBubyBsYXlvdXQgLSBzZXQgZGVmYXVsdCBsYXlvdXQgaW5zdGVhZFxuICAgKiAgICAoZnVsbCBsYXlvdXQgd2lsbCBiZSBidWlsdCBsYXRlciBmcm9tIHRoZSBzY2hlbWEpXG4gICAqXG4gICAqIEFsc28sIGlmIGFsdGVybmF0ZSBsYXlvdXQgZm9ybWF0cyBhcmUgYXZhaWxhYmxlLFxuICAgKiBpbXBvcnQgZnJvbSAnVUlTY2hlbWEnIG9yICdjdXN0b21Gb3JtSXRlbXMnXG4gICAqIHVzZWQgZm9yIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gYW5kIEpTT04gRm9ybSBBUEkgY29tcGF0aWJpbGl0eVxuICAgKiBVc2UgZmlyc3QgYXZhaWxhYmxlIGlucHV0OlxuICAgKiAxLiBVSVNjaGVtYSAtIFJlYWN0IEpTT04gU2NoZW1hIEZvcm0gc3R5bGVcbiAgICogMi4gZm9ybS5VSVNjaGVtYSAtIEZvciB0ZXN0aW5nIHNpbmdsZSBpbnB1dCBSZWFjdCBKU09OIFNjaGVtYSBGb3Jtc1xuICAgKiAyLiBmb3JtLmN1c3RvbUZvcm1JdGVtcyAtIEpTT04gRm9ybSBzdHlsZVxuICAgKiAzLiAobm9uZSkgbm8gaW5wdXQgLSBkb24ndCBpbXBvcnRcbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUxheW91dCgpIHtcblxuICAgIC8vIFJlbmFtZSBKU09OIEZvcm0tc3R5bGUgJ29wdGlvbnMnIGxpc3RzIHRvXG4gICAgLy8gQW5ndWxhciBTY2hlbWEgRm9ybS1zdHlsZSAndGl0bGVNYXAnIGxpc3RzLlxuICAgIGNvbnN0IGZpeEpzb25Gb3JtT3B0aW9ucyA9IChsYXlvdXQ6IGFueSk6IGFueSA9PiB7XG4gICAgICBpZiAoaXNPYmplY3QobGF5b3V0KSB8fCBpc0FycmF5KGxheW91dCkpIHtcbiAgICAgICAgZm9yRWFjaChsYXlvdXQsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bih2YWx1ZSwgJ29wdGlvbnMnKSAmJiBpc09iamVjdCh2YWx1ZS5vcHRpb25zKSkge1xuICAgICAgICAgICAgdmFsdWUudGl0bGVNYXAgPSB2YWx1ZS5vcHRpb25zO1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlLm9wdGlvbnM7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAndG9wLWRvd24nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYXlvdXQ7XG4gICAgfTtcblxuICAgIC8vIENoZWNrIGZvciBsYXlvdXQgaW5wdXRzIGFuZCwgaWYgZm91bmQsIGluaXRpYWxpemUgZm9ybSBsYXlvdXRcbiAgICBpZiAoaXNBcnJheSh0aGlzLmxheW91dCkpIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGNsb25lRGVlcCh0aGlzLmxheW91dCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHRoaXMuZm9ybSkpIHtcbiAgICAgIHRoaXMuanNmLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybSAmJiBpc0FycmF5KHRoaXMuZm9ybS5mb3JtKSkge1xuICAgICAgdGhpcy5qc2YuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IGZpeEpzb25Gb3JtT3B0aW9ucyhjbG9uZURlZXAodGhpcy5mb3JtLmZvcm0pKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybSAmJiBpc0FycmF5KHRoaXMuZm9ybS5sYXlvdXQpKSB7XG4gICAgICB0aGlzLmpzZi5sYXlvdXQgPSBjbG9uZURlZXAodGhpcy5mb3JtLmxheW91dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuanNmLmxheW91dCA9IFsnKiddO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBhbHRlcm5hdGUgbGF5b3V0IGlucHV0c1xuICAgIGxldCBhbHRlcm5hdGVMYXlvdXQ6IGFueSA9IG51bGw7XG4gICAgaWYgKGlzT2JqZWN0KHRoaXMuVUlTY2hlbWEpKSB7XG4gICAgICB0aGlzLmpzZi5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBjbG9uZURlZXAodGhpcy5VSVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnVUlTY2hlbWEnKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgYWx0ZXJuYXRlTGF5b3V0ID0gY2xvbmVEZWVwKHRoaXMuZm9ybS5VSVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAndWlTY2hlbWEnKSkge1xuICAgICAgdGhpcy5qc2YuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSB0cnVlO1xuICAgICAgYWx0ZXJuYXRlTGF5b3V0ID0gY2xvbmVEZWVwKHRoaXMuZm9ybS51aVNjaGVtYSk7XG4gICAgfSBlbHNlIGlmIChoYXNPd24odGhpcy5mb3JtLCAnY3VzdG9tRm9ybUl0ZW1zJykpIHtcbiAgICAgIHRoaXMuanNmLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IHRydWU7XG4gICAgICBhbHRlcm5hdGVMYXlvdXQgPSBmaXhKc29uRm9ybU9wdGlvbnMoY2xvbmVEZWVwKHRoaXMuZm9ybS5jdXN0b21Gb3JtSXRlbXMpKTtcbiAgICB9XG5cbiAgICAvLyBpZiBhbHRlcm5hdGUgbGF5b3V0IGZvdW5kLCBjb3B5IGFsdGVybmF0ZSBsYXlvdXQgb3B0aW9ucyBpbnRvIHNjaGVtYVxuICAgIGlmIChhbHRlcm5hdGVMYXlvdXQpIHtcbiAgICAgIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKGFsdGVybmF0ZUxheW91dCwgKHZhbHVlLCBwb2ludGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjaGVtYVBvaW50ZXIgPSBwb2ludGVyXG4gICAgICAgICAgLnJlcGxhY2UoL1xcLy9nLCAnL3Byb3BlcnRpZXMvJylcbiAgICAgICAgICAucmVwbGFjZSgvXFwvcHJvcGVydGllc1xcL2l0ZW1zXFwvcHJvcGVydGllc1xcLy9nLCAnL2l0ZW1zL3Byb3BlcnRpZXMvJylcbiAgICAgICAgICAucmVwbGFjZSgvXFwvcHJvcGVydGllc1xcL3RpdGxlTWFwXFwvcHJvcGVydGllc1xcLy9nLCAnL3RpdGxlTWFwL3Byb3BlcnRpZXMvJyk7XG4gICAgICAgIGlmIChoYXNWYWx1ZSh2YWx1ZSkgJiYgaGFzVmFsdWUocG9pbnRlcikpIHtcbiAgICAgICAgICBsZXQga2V5ID0gSnNvblBvaW50ZXIudG9LZXkocG9pbnRlcik7XG4gICAgICAgICAgY29uc3QgZ3JvdXBQb2ludGVyID0gKEpzb25Qb2ludGVyLnBhcnNlKHNjaGVtYVBvaW50ZXIpIHx8IFtdKS5zbGljZSgwLCAtMik7XG4gICAgICAgICAgbGV0IGl0ZW1Qb2ludGVyOiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAgICAgICAgIC8vIElmICd1aTpvcmRlcicgb2JqZWN0IGZvdW5kLCBjb3B5IGludG8gb2JqZWN0IHNjaGVtYSByb290XG4gICAgICAgICAgaWYgKGtleS50b0xvd2VyQ2FzZSgpID09PSAndWk6b3JkZXInKSB7XG4gICAgICAgICAgICBpdGVtUG9pbnRlciA9IFsuLi5ncm91cFBvaW50ZXIsICd1aTpvcmRlciddO1xuXG4gICAgICAgICAgICAvLyBDb3B5IG90aGVyIGFsdGVybmF0ZSBsYXlvdXQgb3B0aW9ucyB0byBzY2hlbWEgJ3gtc2NoZW1hLWZvcm0nLFxuICAgICAgICAgICAgLy8gKGxpa2UgQW5ndWxhciBTY2hlbWEgRm9ybSBvcHRpb25zKSBhbmQgcmVtb3ZlIGFueSAndWk6JyBwcmVmaXhlc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5LnNsaWNlKDAsIDMpLnRvTG93ZXJDYXNlKCkgPT09ICd1aTonKSB7IGtleSA9IGtleS5zbGljZSgzKTsgfVxuICAgICAgICAgICAgaXRlbVBvaW50ZXIgPSBbLi4uZ3JvdXBQb2ludGVyLCAneC1zY2hlbWEtZm9ybScsIGtleV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChKc29uUG9pbnRlci5oYXModGhpcy5qc2Yuc2NoZW1hLCBncm91cFBvaW50ZXIpICYmXG4gICAgICAgICAgICAhSnNvblBvaW50ZXIuaGFzKHRoaXMuanNmLnNjaGVtYSwgaXRlbVBvaW50ZXIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQodGhpcy5qc2Yuc2NoZW1hLCBpdGVtUG9pbnRlciwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdhY3RpdmF0ZUZvcm0nIGZ1bmN0aW9uXG4gICAqXG4gICAqIC4uLmNvbnRpbnVlZCBmcm9tICdpbml0aWFsaXplU2NoZW1hJyBmdW5jdGlvbiwgYWJvdmVcbiAgICogSWYgJ3NjaGVtYScgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkIChpLmUuIG5vIHNjaGVtYSBpbnB1dCBmb3VuZClcbiAgICogNi4gSWYgbGF5b3V0IGlucHV0IC0gYnVpbGQgc2NoZW1hIGZyb20gbGF5b3V0IGlucHV0XG4gICAqIDcuIElmIGRhdGEgaW5wdXQgLSBidWlsZCBzY2hlbWEgZnJvbSBkYXRhIGlucHV0XG4gICAqXG4gICAqIENyZWF0ZSBmaW5hbCBsYXlvdXQsXG4gICAqIGJ1aWxkIHRoZSBGb3JtR3JvdXAgdGVtcGxhdGUgYW5kIHRoZSBBbmd1bGFyIEZvcm1Hcm91cCxcbiAgICogc3Vic2NyaWJlIHRvIGNoYW5nZXMsXG4gICAqIGFuZCBhY3RpdmF0ZSB0aGUgZm9ybS5cbiAgICovXG4gIHByaXZhdGUgYWN0aXZhdGVGb3JtKCkge1xuICAgIHRoaXMudW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQubmV4dCgpO1xuICAgIC8vIElmICdzY2hlbWEnIG5vdCBpbml0aWFsaXplZFxuICAgIGlmIChpc0VtcHR5KHRoaXMuanNmLnNjaGVtYSkpIHtcblxuICAgICAgLy8gVE9ETzogSWYgZnVsbCBsYXlvdXQgaW5wdXQgKHdpdGggbm8gJyonKSwgYnVpbGQgc2NoZW1hIGZyb20gbGF5b3V0XG4gICAgICAvLyBpZiAoIXRoaXMuanNmLmxheW91dC5pbmNsdWRlcygnKicpKSB7XG4gICAgICAvLyAgIHRoaXMuanNmLmJ1aWxkU2NoZW1hRnJvbUxheW91dCgpO1xuICAgICAgLy8gfSBlbHNlXG5cbiAgICAgIC8vIElmIGRhdGEgaW5wdXQsIGJ1aWxkIHNjaGVtYSBmcm9tIGRhdGFcbiAgICAgIGlmICghaXNFbXB0eSh0aGlzLmpzZi5mb3JtVmFsdWVzKSkge1xuICAgICAgICB0aGlzLmpzZi5idWlsZFNjaGVtYUZyb21EYXRhKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpc0VtcHR5KHRoaXMuanNmLnNjaGVtYSkpIHtcblxuICAgICAgLy8gSWYgbm90IGFscmVhZHkgaW5pdGlhbGl6ZWQsIGluaXRpYWxpemUgYWp2IGFuZCBjb21waWxlIHNjaGVtYVxuICAgICAgdGhpcy5qc2YuY29tcGlsZUFqdlNjaGVtYSgpO1xuXG4gICAgICAvLyBVcGRhdGUgYWxsIGxheW91dCBlbGVtZW50cywgYWRkIHZhbHVlcywgd2lkZ2V0cywgYW5kIHZhbGlkYXRvcnMsXG4gICAgICAvLyByZXBsYWNlIGFueSAnKicgd2l0aCBhIGxheW91dCBidWlsdCBmcm9tIGFsbCBzY2hlbWEgZWxlbWVudHMsXG4gICAgICAvLyBhbmQgdXBkYXRlIHRoZSBGb3JtR3JvdXAgdGVtcGxhdGUgd2l0aCBhbnkgbmV3IHZhbGlkYXRvcnNcbiAgICAgIHRoaXMuanNmLmJ1aWxkTGF5b3V0KHRoaXMud2lkZ2V0TGlicmFyeSk7XG5cbiAgICAgIC8vIEJ1aWxkIHRoZSBBbmd1bGFyIEZvcm1Hcm91cCB0ZW1wbGF0ZSBmcm9tIHRoZSBzY2hlbWFcbiAgICAgIHRoaXMuanNmLmJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUodGhpcy5qc2YuZm9ybVZhbHVlcyk7XG5cbiAgICAgIC8vIEJ1aWxkIHRoZSByZWFsIEFuZ3VsYXIgRm9ybUdyb3VwIGZyb20gdGhlIEZvcm1Hcm91cCB0ZW1wbGF0ZVxuICAgICAgdGhpcy5qc2YuYnVpbGRGb3JtR3JvdXAoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5qc2YuZm9ybUdyb3VwKSB7XG5cbiAgICAgIC8vIFJlc2V0IGluaXRpYWwgZm9ybSB2YWx1ZXNcbiAgICAgIGlmICghaXNFbXB0eSh0aGlzLmpzZi5mb3JtVmFsdWVzKSAmJlxuICAgICAgICB0aGlzLmpzZi5mb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyAhPT0gdHJ1ZSAmJlxuICAgICAgICB0aGlzLmpzZi5mb3JtT3B0aW9ucy5zZXRMYXlvdXREZWZhdWx0cyAhPT0gdHJ1ZVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuc2V0Rm9ybVZhbHVlcyh0aGlzLmpzZi5mb3JtVmFsdWVzKTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogRmlndXJlIG91dCBob3cgdG8gZGlzcGxheSBjYWxjdWxhdGVkIHZhbHVlcyB3aXRob3V0IGNoYW5naW5nIG9iamVjdCBkYXRhXG4gICAgICAvLyBTZWUgaHR0cDovL3VsaW9uLmdpdGh1Yi5pby9qc29uZm9ybS9wbGF5Z3JvdW5kLz9leGFtcGxlPXRlbXBsYXRpbmctdmFsdWVzXG4gICAgICAvLyBDYWxjdWxhdGUgcmVmZXJlbmNlcyB0byBvdGhlciBmaWVsZHNcbiAgICAgIC8vIGlmICghaXNFbXB0eSh0aGlzLmpzZi5mb3JtR3JvdXAudmFsdWUpKSB7XG4gICAgICAvLyAgIGZvckVhY2godGhpcy5qc2YuZm9ybUdyb3VwLnZhbHVlLCAodmFsdWUsIGtleSwgb2JqZWN0LCByb290T2JqZWN0KSA9PiB7XG4gICAgICAvLyAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vICAgICAgIG9iamVjdFtrZXldID0gdGhpcy5qc2YucGFyc2VUZXh0KHZhbHVlLCB2YWx1ZSwgcm9vdE9iamVjdCwga2V5KTtcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIH0sICd0b3AtZG93bicpO1xuICAgICAgLy8gfVxuXG4gICAgICAvLyBTdWJzY3JpYmUgdG8gZm9ybSBjaGFuZ2VzIHRvIG91dHB1dCBsaXZlIGRhdGEsIHZhbGlkYXRpb24sIGFuZCBlcnJvcnNcbiAgICAgIHRoaXMuanNmLmRhdGFDaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMudW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQpKS5zdWJzY3JpYmUoZGF0YSA9PiB7XG4gICAgICAgIHRoaXMub25DaGFuZ2VzLmVtaXQodGhpcy5vYmplY3RXcmFwID8gZGF0YVsnMSddIDogZGF0YSk7XG4gICAgICAgIGlmICh0aGlzLmZvcm1WYWx1ZXNJbnB1dCAmJiB0aGlzLmZvcm1WYWx1ZXNJbnB1dC5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICAgICAgdGhpc1tgJHt0aGlzLmZvcm1WYWx1ZXNJbnB1dH1DaGFuZ2VgXS5lbWl0KHRoaXMub2JqZWN0V3JhcCA/IGRhdGFbJzEnXSA6IGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gVHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIG9uIHN0YXR1c0NoYW5nZXMgdG8gc2hvdyB1cGRhdGVkIGVycm9yc1xuICAgICAgdGhpcy5qc2YuZm9ybUdyb3VwLnN0YXR1c0NoYW5nZXMucGlwZSh0YWtlVW50aWwodGhpcy51bnN1YnNjcmliZU9uQWN0aXZhdGVGb3JtJCkpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmNoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpKTtcbiAgICAgIHRoaXMuanNmLmlzVmFsaWRDaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMudW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQpKS5zdWJzY3JpYmUoaXNWYWxpZCA9PiB0aGlzLmlzVmFsaWQuZW1pdChpc1ZhbGlkKSk7XG4gICAgICB0aGlzLmpzZi52YWxpZGF0aW9uRXJyb3JDaGFuZ2VzLnBpcGUodGFrZVVudGlsKHRoaXMudW5zdWJzY3JpYmVPbkFjdGl2YXRlRm9ybSQpKS5zdWJzY3JpYmUoZXJyID0+IHRoaXMudmFsaWRhdGlvbkVycm9ycy5lbWl0KGVycikpO1xuXG4gICAgICAvLyBPdXRwdXQgZmluYWwgc2NoZW1hLCBmaW5hbCBsYXlvdXQsIGFuZCBpbml0aWFsIGRhdGFcbiAgICAgIHRoaXMuZm9ybVNjaGVtYS5lbWl0KHRoaXMuanNmLnNjaGVtYSk7XG4gICAgICB0aGlzLmZvcm1MYXlvdXQuZW1pdCh0aGlzLmpzZi5sYXlvdXQpO1xuICAgICAgdGhpcy5vbkNoYW5nZXMuZW1pdCh0aGlzLm9iamVjdFdyYXAgPyB0aGlzLmpzZi5kYXRhWycxJ10gOiB0aGlzLmpzZi5kYXRhKTtcblxuICAgICAgLy8gSWYgdmFsaWRhdGVPblJlbmRlciwgb3V0cHV0IGluaXRpYWwgdmFsaWRhdGlvbiBhbmQgYW55IGVycm9yc1xuICAgICAgY29uc3QgdmFsaWRhdGVPblJlbmRlciA9XG4gICAgICAgIEpzb25Qb2ludGVyLmdldCh0aGlzLmpzZiwgJy9mb3JtT3B0aW9ucy92YWxpZGF0ZU9uUmVuZGVyJyk7XG4gICAgICBpZiAodmFsaWRhdGVPblJlbmRlcikgeyAvLyB2YWxpZGF0ZU9uUmVuZGVyID09PSAnYXV0bycgfHwgdHJ1ZVxuICAgICAgICBjb25zdCB0b3VjaEFsbCA9IChjb250cm9sKSA9PiB7XG4gICAgICAgICAgaWYgKHZhbGlkYXRlT25SZW5kZXIgPT09IHRydWUgfHwgaGFzVmFsdWUoY29udHJvbC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnRyb2wubWFya0FzVG91Y2hlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBPYmplY3Qua2V5cyhjb250cm9sLmNvbnRyb2xzIHx8IHt9KVxuICAgICAgICAgICAgLmZvckVhY2goa2V5ID0+IHRvdWNoQWxsKGNvbnRyb2wuY29udHJvbHNba2V5XSkpO1xuICAgICAgICB9O1xuICAgICAgICB0b3VjaEFsbCh0aGlzLmpzZi5mb3JtR3JvdXApO1xuICAgICAgICB0aGlzLmlzVmFsaWQuZW1pdCh0aGlzLmpzZi5pc1ZhbGlkKTtcbiAgICAgICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzLmVtaXQodGhpcy5qc2YuYWp2RXJyb3JzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIjxmb3JtIFthdXRvY29tcGxldGVdPVwianNmPy5mb3JtT3B0aW9ucz8uYXV0b2NvbXBsZXRlID8gJ29uJyA6ICdvZmYnXCIgY2xhc3M9XCJqc29uLXNjaGVtYS1mb3JtXCIgKG5nU3VibWl0KT1cInN1Ym1pdEZvcm0oKVwiPlxuICA8cm9vdC13aWRnZXQgW2xheW91dF09XCJqc2Y/LmxheW91dFwiPjwvcm9vdC13aWRnZXQ+XG48L2Zvcm0+XG48ZGl2ICpuZ0lmPVwiZGVidWcgfHwganNmPy5mb3JtT3B0aW9ucz8uZGVidWdcIj5cbiAgRGVidWcgb3V0cHV0OlxuICA8cHJlPnt7ZGVidWdPdXRwdXR9fTwvcHJlPlxuPC9kaXY+Il19