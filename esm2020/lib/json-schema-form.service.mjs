import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import Ajv from 'ajv';
import jsonDraft6 from 'ajv/lib/refs/json-schema-draft-06.json';
import { buildFormGroup, buildFormGroupTemplate, formatFormData, getControl, fixTitle, forEach, hasOwn, toTitleCase, buildLayout, getLayoutNode, buildSchemaFromData, buildSchemaFromLayout, removeRecursiveReferences, hasValue, isArray, isDefined, isEmpty, isObject, JsonPointer } from './shared';
import { deValidationMessages, enValidationMessages, esValidationMessages, frValidationMessages, itValidationMessages, ptValidationMessages, zhValidationMessages } from './locale';
import * as i0 from "@angular/core";
export class JsonSchemaFormService {
    constructor() {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.ajvOptions = {
            allErrors: true,
            jsonPointers: true,
            unknownFormats: 'ignore'
        };
        this.ajv = new Ajv(this.ajvOptions); // AJV: Another JSON Schema Validator
        this.validateFormData = null; // Compiled AJV function to validate active form's schema
        this.formValues = {}; // Internal form data (may not have correct types)
        this.data = {}; // Output form data (formValues, formatted with correct data types)
        this.schema = {}; // Internal JSON Schema
        this.layout = []; // Internal form layout
        this.formGroupTemplate = {}; // Template used to create formGroup
        this.formGroup = null; // Angular formGroup, which powers the reactive form
        this.framework = null; // Active framework component
        this.validData = null; // Valid form data (or null) (=== isValid ? data : null)
        this.isValid = null; // Is current form data valid?
        this.ajvErrors = null; // Ajv errors for current data
        this.validationErrors = null; // Any validation errors for current data
        this.dataErrors = new Map(); //
        this.formValueSubscription = null; // Subscription to formGroup.valueChanges observable (for un- and re-subscribing)
        this.dataChanges = new Subject(); // Form data observable
        this.isValidChanges = new Subject(); // isValid observable
        this.validationErrorChanges = new Subject(); // validationErrors observable
        this.arrayMap = new Map(); // Maps arrays in data object and number of tuple values
        this.dataMap = new Map(); // Maps paths in form data to schema and formGroup paths
        this.dataRecursiveRefMap = new Map(); // Maps recursive reference points in form data
        this.schemaRecursiveRefMap = new Map(); // Maps recursive reference points in schema
        this.schemaRefLibrary = {}; // Library of schemas for resolving schema $refs
        this.layoutRefLibrary = { '': null }; // Library of layout nodes for adding to form
        this.templateRefLibrary = {}; // Library of formGroup templates for adding to form
        this.hasRootReference = false; // Does the form include a recursive reference to itself?
        this.language = 'en-US'; // Does the form include a recursive reference to itself?
        // Default global form options
        this.defaultFormOptions = {
            autocomplete: true,
            addSubmit: 'auto',
            // for addSubmit: true = always, false = never,
            // 'auto' = only if layout is undefined (form is built from schema alone)
            debug: false,
            disableInvalidSubmit: true,
            formDisabled: false,
            formReadonly: false,
            fieldsRequired: false,
            framework: 'no-framework',
            loadExternalAssets: false,
            pristine: { errors: true, success: true },
            supressPropertyTitles: false,
            setSchemaDefaults: 'auto',
            // true = always set (unless overridden by layout default or formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            setLayoutDefaults: 'auto',
            // true = always set (unless overridden by formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            validateOnRender: 'auto',
            // true = validate all fields immediately
            // false = only validate fields after they are touched by user
            // 'auto' = validate fields with values immediately, empty fields after they are touched
            widgets: {},
            defautWidgetOptions: {
                // Default options for form control widgets
                listItems: 1,
                addable: true,
                orderable: true,
                removable: true,
                enableErrorState: true,
                // disableErrorState: false, // Don't apply 'has-error' class when field fails validation?
                enableSuccessState: true,
                // disableSuccessState: false, // Don't apply 'has-success' class when field validates?
                feedback: false,
                feedbackOnRender: false,
                notitle: false,
                disabled: false,
                readonly: false,
                returnEmptyFields: true,
                validationMessages: {} // set by setLanguage()
            }
        };
        this.setLanguage(this.language);
        this.ajv.addMetaSchema(jsonDraft6);
    }
    setLanguage(language = 'en-US') {
        this.language = language;
        const languageValidationMessages = {
            de: deValidationMessages,
            en: enValidationMessages,
            es: esValidationMessages,
            fr: frValidationMessages,
            it: itValidationMessages,
            pt: ptValidationMessages,
            zh: zhValidationMessages,
        };
        const languageCode = language.slice(0, 2);
        const validationMessages = languageValidationMessages[languageCode];
        this.defaultFormOptions.defautWidgetOptions.validationMessages = cloneDeep(validationMessages);
    }
    getData() {
        return this.data;
    }
    getSchema() {
        return this.schema;
    }
    getLayout() {
        return this.layout;
    }
    resetAllValues() {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.validateFormData = null;
        this.formValues = {};
        this.schema = {};
        this.layout = [];
        this.formGroupTemplate = {};
        this.formGroup = null;
        this.framework = null;
        this.data = {};
        this.validData = null;
        this.isValid = null;
        this.validationErrors = null;
        this.arrayMap = new Map();
        this.dataMap = new Map();
        this.dataRecursiveRefMap = new Map();
        this.schemaRecursiveRefMap = new Map();
        this.layoutRefLibrary = {};
        this.schemaRefLibrary = {};
        this.templateRefLibrary = {};
        this.formOptions = cloneDeep(this.defaultFormOptions);
    }
    /**
     * 'buildRemoteError' function
     *
     * Example errors:
     * {
     *   last_name: [ {
     *     message: 'Last name must by start with capital letter.',
     *     code: 'capital_letter'
     *   } ],
     *   email: [ {
     *     message: 'Email must be from example.com domain.',
     *     code: 'special_domain'
     *   }, {
     *     message: 'Email must contain an @ symbol.',
     *     code: 'at_symbol'
     *   } ]
     * }
     * //{ErrorMessages} errors
     */
    buildRemoteError(errors) {
        forEach(errors, (value, key) => {
            if (key in this.formGroup.controls) {
                for (const error of value) {
                    const err = {};
                    err[error['code']] = error['message'];
                    this.formGroup.get(key).setErrors(err, { emitEvent: true });
                }
            }
        });
    }
    validateData(newValue, updateSubscriptions = true) {
        // Format raw form data to correct data types
        this.data = formatFormData(newValue, this.dataMap, this.dataRecursiveRefMap, this.arrayMap, this.formOptions.returnEmptyFields);
        this.isValid = this.validateFormData(this.data);
        this.validData = this.isValid ? this.data : null;
        const compileErrors = errors => {
            const compiledErrors = {};
            (errors || []).forEach(error => {
                if (!compiledErrors[error.dataPath]) {
                    compiledErrors[error.dataPath] = [];
                }
                compiledErrors[error.dataPath].push(error.message);
            });
            return compiledErrors;
        };
        this.ajvErrors = this.validateFormData.errors;
        this.validationErrors = compileErrors(this.validateFormData.errors);
        if (updateSubscriptions) {
            this.dataChanges.next(this.data);
            this.isValidChanges.next(this.isValid);
            this.validationErrorChanges.next(this.ajvErrors);
        }
    }
    buildFormGroupTemplate(formValues = null, setValues = true) {
        this.formGroupTemplate = buildFormGroupTemplate(this, formValues, setValues);
    }
    buildFormGroup() {
        this.formGroup = buildFormGroup(this.formGroupTemplate);
        if (this.formGroup) {
            this.compileAjvSchema();
            this.validateData(this.formGroup.value);
            // Set up observables to emit data and validation info when form data changes
            if (this.formValueSubscription) {
                this.formValueSubscription.unsubscribe();
            }
            this.formValueSubscription = this.formGroup.valueChanges.subscribe(formValue => this.validateData(formValue));
        }
    }
    buildLayout(widgetLibrary) {
        this.layout = buildLayout(this, widgetLibrary);
    }
    setOptions(newOptions) {
        if (isObject(newOptions)) {
            const addOptions = cloneDeep(newOptions);
            // Backward compatibility for 'defaultOptions' (renamed 'defautWidgetOptions')
            if (isObject(addOptions.defaultOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defaultOptions);
                delete addOptions.defaultOptions;
            }
            if (isObject(addOptions.defautWidgetOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defautWidgetOptions);
                delete addOptions.defautWidgetOptions;
            }
            Object.assign(this.formOptions, addOptions);
            // convert disableErrorState / disableSuccessState to enable...
            const globalDefaults = this.formOptions.defautWidgetOptions;
            ['ErrorState', 'SuccessState']
                .filter(suffix => hasOwn(globalDefaults, 'disable' + suffix))
                .forEach(suffix => {
                globalDefaults['enable' + suffix] = !globalDefaults['disable' + suffix];
                delete globalDefaults['disable' + suffix];
            });
        }
    }
    compileAjvSchema() {
        if (!this.validateFormData) {
            // if 'ui:order' exists in properties, move it to root before compiling with ajv
            if (Array.isArray(this.schema.properties['ui:order'])) {
                this.schema['ui:order'] = this.schema.properties['ui:order'];
                delete this.schema.properties['ui:order'];
            }
            this.ajv.removeSchema(this.schema);
            this.validateFormData = this.ajv.compile(this.schema);
        }
    }
    buildSchemaFromData(data, requireAllFields = false) {
        if (data) {
            return buildSchemaFromData(data, requireAllFields);
        }
        this.schema = buildSchemaFromData(this.formValues, requireAllFields);
    }
    buildSchemaFromLayout(layout) {
        if (layout) {
            return buildSchemaFromLayout(layout);
        }
        this.schema = buildSchemaFromLayout(this.layout);
    }
    setTpldata(newTpldata = {}) {
        this.tpldata = newTpldata;
    }
    parseText(text = '', value = {}, values = {}, key = null) {
        if (!text || !/{{.+?}}/.test(text)) {
            return text;
        }
        return text.replace(/{{(.+?)}}/g, (...a) => this.parseExpression(a[1], value, values, key, this.tpldata));
    }
    parseExpression(expression = '', value = {}, values = {}, key = null, tpldata = null) {
        if (typeof expression !== 'string') {
            return '';
        }
        const index = typeof key === 'number' ? key + 1 + '' : key || '';
        expression = expression.trim();
        if ((expression[0] === "'" || expression[0] === '"') &&
            expression[0] === expression[expression.length - 1] &&
            expression.slice(1, expression.length - 1).indexOf(expression[0]) === -1) {
            return expression.slice(1, expression.length - 1);
        }
        if (expression === 'idx' || expression === '$index') {
            return index;
        }
        if (expression === 'value' && !hasOwn(values, 'value')) {
            return value;
        }
        if (['"', "'", ' ', '||', '&&', '+'].every(delim => expression.indexOf(delim) === -1)) {
            const pointer = JsonPointer.parseObjectPath(expression);
            return pointer[0] === 'value' && JsonPointer.has(value, pointer.slice(1))
                ? JsonPointer.get(value, pointer.slice(1))
                : pointer[0] === 'values' && JsonPointer.has(values, pointer.slice(1))
                    ? JsonPointer.get(values, pointer.slice(1))
                    : pointer[0] === 'tpldata' && JsonPointer.has(tpldata, pointer.slice(1))
                        ? JsonPointer.get(tpldata, pointer.slice(1))
                        : JsonPointer.has(values, pointer)
                            ? JsonPointer.get(values, pointer)
                            : '';
        }
        if (expression.indexOf('[idx]') > -1) {
            expression = expression.replace(/\[idx\]/g, index);
        }
        if (expression.indexOf('[$index]') > -1) {
            expression = expression.replace(/\[$index\]/g, index);
        }
        // TODO: Improve expression evaluation by parsing quoted strings first
        // let expressionArray = expression.match(/([^"']+|"[^"]+"|'[^']+')/g);
        if (expression.indexOf('||') > -1) {
            return expression
                .split('||')
                .reduce((all, term) => all || this.parseExpression(term, value, values, key, tpldata), '');
        }
        if (expression.indexOf('&&') > -1) {
            return expression
                .split('&&')
                .reduce((all, term) => all && this.parseExpression(term, value, values, key, tpldata), ' ')
                .trim();
        }
        if (expression.indexOf('+') > -1) {
            return expression
                .split('+')
                .map(term => this.parseExpression(term, value, values, key, tpldata))
                .join('');
        }
        return '';
    }
    setArrayItemTitle(parentCtx = {}, childNode = null, index = null) {
        const parentNode = parentCtx.layoutNode;
        const parentValues = this.getFormControlValue(parentCtx);
        const isArrayItem = (parentNode.type || '').slice(-5) === 'array' && isArray(parentValues);
        const text = JsonPointer.getFirst(isArrayItem && childNode.type !== '$ref'
            ? [
                [childNode, '/options/legend'],
                [childNode, '/options/title'],
                [parentNode, '/options/title'],
                [parentNode, '/options/legend']
            ]
            : [
                [childNode, '/options/title'],
                [childNode, '/options/legend'],
                [parentNode, '/options/title'],
                [parentNode, '/options/legend']
            ]);
        if (!text) {
            return text;
        }
        const childValue = isArray(parentValues) && index < parentValues.length
            ? parentValues[index]
            : parentValues;
        return this.parseText(text, childValue, parentValues, index);
    }
    setItemTitle(ctx) {
        return !ctx.options.title && /^(\d+|-)$/.test(ctx.layoutNode.name)
            ? null
            : this.parseText(ctx.options.title || toTitleCase(ctx.layoutNode.name), this.getFormControlValue(this), (this.getFormControlGroup(this) || {}).value, ctx.dataIndex[ctx.dataIndex.length - 1]);
    }
    evaluateCondition(layoutNode, dataIndex) {
        const arrayIndex = dataIndex && dataIndex[dataIndex.length - 1];
        let result = true;
        if (hasValue((layoutNode.options || {}).condition)) {
            if (typeof layoutNode.options.condition === 'string') {
                let pointer = layoutNode.options.condition;
                if (hasValue(arrayIndex)) {
                    pointer = pointer.replace('[arrayIndex]', `[${arrayIndex}]`);
                }
                pointer = JsonPointer.parseObjectPath(pointer);
                result = !!JsonPointer.get(this.data, pointer);
                if (!result && pointer[0] === 'model') {
                    result = !!JsonPointer.get({ model: this.data }, pointer);
                }
            }
            else if (typeof layoutNode.options.condition === 'function') {
                result = layoutNode.options.condition(this.data);
            }
            else if (typeof layoutNode.options.condition.functionBody === 'string') {
                try {
                    const dynFn = new Function('model', 'arrayIndices', layoutNode.options.condition.functionBody);
                    result = dynFn(this.data, dataIndex);
                }
                catch (e) {
                    result = true;
                    console.error('condition functionBody errored out on evaluation: ' +
                        layoutNode.options.condition.functionBody);
                }
            }
        }
        return result;
    }
    initializeControl(ctx, bind = true) {
        if (!isObject(ctx)) {
            return false;
        }
        if (isEmpty(ctx.options)) {
            ctx.options = !isEmpty((ctx.layoutNode || {}).options)
                ? ctx.layoutNode.options
                : cloneDeep(this.formOptions);
        }
        ctx.formControl = this.getFormControl(ctx);
        ctx.boundControl = bind && !!ctx.formControl;
        if (ctx.formControl) {
            ctx.controlName = this.getFormControlName(ctx);
            ctx.controlValue = ctx.formControl.value;
            ctx.controlDisabled = ctx.formControl.disabled;
            ctx.options.errorMessage =
                ctx.formControl.status === 'VALID'
                    ? null
                    : this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages);
            ctx.options.showErrors =
                this.formOptions.validateOnRender === true ||
                    (this.formOptions.validateOnRender === 'auto' &&
                        hasValue(ctx.controlValue));
            ctx.formControl.statusChanges.subscribe(status => (ctx.options.errorMessage =
                status === 'VALID'
                    ? null
                    : this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages)));
            ctx.formControl.valueChanges.subscribe(value => {
                if (!!value) {
                    ctx.controlValue = value;
                }
            });
        }
        else {
            ctx.controlName = ctx.layoutNode.name;
            ctx.controlValue = ctx.layoutNode.value || null;
            const dataPointer = this.getDataPointer(ctx);
            if (bind && dataPointer) {
                console.error(`warning: control "${dataPointer}" is not bound to the Angular FormGroup.`);
            }
        }
        return ctx.boundControl;
    }
    formatErrors(errors, validationMessages = {}) {
        if (isEmpty(errors)) {
            return null;
        }
        if (!isObject(validationMessages)) {
            validationMessages = {};
        }
        const addSpaces = string => string[0].toUpperCase() +
            (string.slice(1) || '')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/_/g, ' ');
        const formatError = error => typeof error === 'object'
            ? Object.keys(error)
                .map(key => error[key] === true
                ? addSpaces(key)
                : error[key] === false
                    ? 'Not ' + addSpaces(key)
                    : addSpaces(key) + ': ' + formatError(error[key]))
                .join(', ')
            : addSpaces(error.toString());
        const messages = [];
        return (Object.keys(errors)
            // Hide 'required' error, unless it is the only one
            .filter(errorKey => errorKey !== 'required' || Object.keys(errors).length === 1)
            .map(errorKey => 
        // If validationMessages is a string, return it
        typeof validationMessages === 'string'
            ? validationMessages
            : // If custom error message is a function, return function result
                typeof validationMessages[errorKey] === 'function'
                    ? validationMessages[errorKey](errors[errorKey])
                    : // If custom error message is a string, replace placeholders and return
                        typeof validationMessages[errorKey] === 'string'
                            ? // Does error message have any {{property}} placeholders?
                                !/{{.+?}}/.test(validationMessages[errorKey])
                                    ? validationMessages[errorKey]
                                    : // Replace {{property}} placeholders with values
                                        Object.keys(errors[errorKey]).reduce((errorMessage, errorProperty) => errorMessage.replace(new RegExp('{{' + errorProperty + '}}', 'g'), errors[errorKey][errorProperty]), validationMessages[errorKey])
                            : // If no custom error message, return formatted error data instead
                                addSpaces(errorKey) + ' Error: ' + formatError(errors[errorKey]))
            .join('<br>'));
    }
    updateValue(ctx, value) {
        // Set value of current control
        ctx.controlValue = value;
        if (ctx.boundControl) {
            ctx.formControl.setValue(value);
            ctx.formControl.markAsDirty();
        }
        ctx.layoutNode.value = value;
        // Set values of any related controls in copyValueTo array
        if (isArray(ctx.options.copyValueTo)) {
            for (const item of ctx.options.copyValueTo) {
                const targetControl = getControl(this.formGroup, item);
                if (isObject(targetControl) &&
                    typeof targetControl.setValue === 'function') {
                    targetControl.setValue(value);
                    targetControl.markAsDirty();
                }
            }
        }
    }
    updateArrayCheckboxList(ctx, checkboxList) {
        const formArray = this.getFormControl(ctx);
        // Remove all existing items
        while (formArray.value.length) {
            formArray.removeAt(0);
        }
        // Re-add an item for each checked box
        const refPointer = removeRecursiveReferences(ctx.layoutNode.dataPointer + '/-', this.dataRecursiveRefMap, this.arrayMap);
        for (const checkboxItem of checkboxList) {
            if (checkboxItem.checked) {
                const newFormControl = buildFormGroup(this.templateRefLibrary[refPointer]);
                newFormControl.setValue(checkboxItem.value);
                formArray.push(newFormControl);
            }
        }
        formArray.markAsDirty();
    }
    getFormControl(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx));
    }
    getFormControlValue(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        const control = getControl(this.formGroup, this.getDataPointer(ctx));
        return control ? control.value : null;
    }
    getFormControlGroup(ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer)) {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx), true);
    }
    getFormControlName(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toKey(this.getDataPointer(ctx));
    }
    getLayoutArray(ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -1);
    }
    getParentNode(ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -2);
    }
    getDataPointer(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toIndexedPointer(ctx.layoutNode.dataPointer, ctx.dataIndex, this.arrayMap);
    }
    getLayoutPointer(ctx) {
        if (!hasValue(ctx.layoutIndex)) {
            return null;
        }
        return '/' + ctx.layoutIndex.join('/items/');
    }
    isControlBound(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return false;
        }
        const controlGroup = this.getFormControlGroup(ctx);
        const name = this.getFormControlName(ctx);
        return controlGroup ? hasOwn(controlGroup.controls, name) : false;
    }
    addItem(ctx, name) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.$ref) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Create a new Angular form control from a template in templateRefLibrary
        const newFormGroup = buildFormGroup(this.templateRefLibrary[ctx.layoutNode.$ref]);
        // Add the new form control to the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            // Add new array item to formArray
            this.getFormControlGroup(ctx).push(newFormGroup);
        }
        else {
            // Add new $ref item to formGroup
            this.getFormControlGroup(ctx).addControl(name || this.getFormControlName(ctx), newFormGroup);
        }
        // Copy a new layoutNode from layoutRefLibrary
        const newLayoutNode = getLayoutNode(ctx.layoutNode, this);
        newLayoutNode.arrayItem = ctx.layoutNode.arrayItem;
        if (ctx.layoutNode.arrayItemType) {
            newLayoutNode.arrayItemType = ctx.layoutNode.arrayItemType;
        }
        else {
            delete newLayoutNode.arrayItemType;
        }
        if (name) {
            newLayoutNode.name = name;
            newLayoutNode.dataPointer += '/' + JsonPointer.escape(name);
            newLayoutNode.options.title = fixTitle(name);
        }
        // Add the new layoutNode to the form layout
        JsonPointer.insert(this.layout, this.getLayoutPointer(ctx), newLayoutNode);
        return true;
    }
    moveArrayItem(ctx, oldIndex, newIndex) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex) ||
            !isDefined(oldIndex) ||
            !isDefined(newIndex) ||
            oldIndex === newIndex) {
            return false;
        }
        // Move item in the formArray
        const formArray = this.getFormControlGroup(ctx);
        const arrayItem = formArray.at(oldIndex);
        formArray.removeAt(oldIndex);
        formArray.insert(newIndex, arrayItem);
        formArray.updateValueAndValidity();
        // Move layout item
        const layoutArray = this.getLayoutArray(ctx);
        layoutArray.splice(newIndex, 0, layoutArray.splice(oldIndex, 1)[0]);
        return true;
    }
    removeItem(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Remove the Angular form control from the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            // Remove array item from formArray
            this.getFormControlGroup(ctx).removeAt(ctx.dataIndex[ctx.dataIndex.length - 1]);
        }
        else {
            // Remove $ref item from formGroup
            this.getFormControlGroup(ctx).removeControl(this.getFormControlName(ctx));
        }
        // Remove layoutNode from layout
        JsonPointer.remove(this.layout, this.getLayoutPointer(ctx));
        return true;
    }
}
JsonSchemaFormService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
JsonSchemaFormService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtY29yZS9zcmMvbGliL2pzb24tc2NoZW1hLWZvcm0uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQ3RCLE9BQU8sVUFBVSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2hFLE9BQU8sRUFDTCxjQUFjLEVBQ2Qsc0JBQXNCLEVBQ3RCLGNBQWMsRUFDZCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLFdBQVcsRUFDWCxhQUFhLEVBQ2IsbUJBQW1CLEVBQ25CLHFCQUFxQixFQUNyQix5QkFBeUIsRUFDekIsUUFBUSxFQUNSLE9BQU8sRUFDUCxTQUFTLEVBQ1QsT0FBTyxFQUNQLFFBQVEsRUFDUixXQUFXLEVBQ1osTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNyQixNQUFNLFVBQVUsQ0FBQzs7QUFrQmxCLE1BQU0sT0FBTyxxQkFBcUI7SUE0RmhDO1FBM0ZBLDBCQUFxQixHQUFHLEtBQUssQ0FBQztRQUM5QixxQ0FBZ0MsR0FBRyxLQUFLLENBQUM7UUFDekMsbUNBQThCLEdBQUcsS0FBSyxDQUFDO1FBQ3ZDLFlBQU8sR0FBUSxFQUFFLENBQUM7UUFFbEIsZUFBVSxHQUFRO1lBQ2hCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsWUFBWSxFQUFF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LENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFFLENBQUMsYUFBYSxDQUM3RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQzdCLENBQUM7U0FDSDtRQUVELGdDQUFnQztRQUNoQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOztrSEE1ekJVLHFCQUFxQjtzSEFBckIscUJBQXFCOzJGQUFyQixxQkFBcUI7a0JBRGpDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wsIFVudHlwZWRGb3JtQXJyYXksIFVudHlwZWRGb3JtR3JvdXAgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnO1xuaW1wb3J0IEFqdiBmcm9tICdhanYnO1xuaW1wb3J0IGpzb25EcmFmdDYgZnJvbSAnYWp2L2xpYi9yZWZzL2pzb24tc2NoZW1hLWRyYWZ0LTA2Lmpzb24nO1xuaW1wb3J0IHtcbiAgYnVpbGRGb3JtR3JvdXAsXG4gIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUsXG4gIGZvcm1hdEZvcm1EYXRhLFxuICBnZXRDb250cm9sLFxuICBmaXhUaXRsZSxcbiAgZm9yRWFjaCxcbiAgaGFzT3duLFxuICB0b1RpdGxlQ2FzZSxcbiAgYnVpbGRMYXlvdXQsXG4gIGdldExheW91dE5vZGUsXG4gIGJ1aWxkU2NoZW1hRnJvbURhdGEsXG4gIGJ1aWxkU2NoZW1hRnJvbUxheW91dCxcbiAgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyxcbiAgaGFzVmFsdWUsXG4gIGlzQXJyYXksXG4gIGlzRGVmaW5lZCxcbiAgaXNFbXB0eSxcbiAgaXNPYmplY3QsXG4gIEpzb25Qb2ludGVyXG59IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7XG4gIGRlVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICBlblZhbGlkYXRpb25NZXNzYWdlcyxcbiAgZXNWYWxpZGF0aW9uTWVzc2FnZXMsXG4gIGZyVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICBpdFZhbGlkYXRpb25NZXNzYWdlcyxcbiAgcHRWYWxpZGF0aW9uTWVzc2FnZXMsXG4gIHpoVmFsaWRhdGlvbk1lc3NhZ2VzXG59IGZyb20gJy4vbG9jYWxlJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFRpdGxlTWFwSXRlbSB7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIHZhbHVlPzogYW55O1xuICBjaGVja2VkPzogYm9vbGVhbjtcbiAgZ3JvdXA/OiBzdHJpbmc7XG4gIGl0ZW1zPzogVGl0bGVNYXBJdGVtW107XG59XG5leHBvcnQgaW50ZXJmYWNlIEVycm9yTWVzc2FnZXMge1xuICBbY29udHJvbF9uYW1lOiBzdHJpbmddOiB7XG4gICAgbWVzc2FnZTogc3RyaW5nIHwgRnVuY3Rpb24gfCBPYmplY3Q7XG4gICAgY29kZTogc3RyaW5nO1xuICB9W107XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBKc29uU2NoZW1hRm9ybVNlcnZpY2Uge1xuICBKc29uRm9ybUNvbXBhdGliaWxpdHkgPSBmYWxzZTtcbiAgUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSBmYWxzZTtcbiAgQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gZmFsc2U7XG4gIHRwbGRhdGE6IGFueSA9IHt9O1xuXG4gIGFqdk9wdGlvbnM6IGFueSA9IHtcbiAgICBhbGxFcnJvcnM6IHRydWUsXG4gICAganNvblBvaW50ZXJzOiB0cnVlLFxuICAgIHVua25vd25Gb3JtYXRzOiAnaWdub3JlJ1xuICB9O1xuICBhanY6IGFueSA9IG5ldyBBanYodGhpcy5hanZPcHRpb25zKTsgLy8gQUpWOiBBbm90aGVyIEpTT04gU2NoZW1hIFZhbGlkYXRvclxuICB2YWxpZGF0ZUZvcm1EYXRhOiBhbnkgPSBudWxsOyAvLyBDb21waWxlZCBBSlYgZnVuY3Rpb24gdG8gdmFsaWRhdGUgYWN0aXZlIGZvcm0ncyBzY2hlbWFcblxuICBmb3JtVmFsdWVzOiBhbnkgPSB7fTsgLy8gSW50ZXJuYWwgZm9ybSBkYXRhIChtYXkgbm90IGhhdmUgY29ycmVjdCB0eXBlcylcbiAgZGF0YTogYW55ID0ge307IC8vIE91dHB1dCBmb3JtIGRhdGEgKGZvcm1WYWx1ZXMsIGZvcm1hdHRlZCB3aXRoIGNvcnJlY3QgZGF0YSB0eXBlcylcbiAgc2NoZW1hOiBhbnkgPSB7fTsgLy8gSW50ZXJuYWwgSlNPTiBTY2hlbWFcbiAgbGF5b3V0OiBhbnlbXSA9IFtdOyAvLyBJbnRlcm5hbCBmb3JtIGxheW91dFxuICBmb3JtR3JvdXBUZW1wbGF0ZTogYW55ID0ge307IC8vIFRlbXBsYXRlIHVzZWQgdG8gY3JlYXRlIGZvcm1Hcm91cFxuICBmb3JtR3JvdXA6IGFueSA9IG51bGw7IC8vIEFuZ3VsYXIgZm9ybUdyb3VwLCB3aGljaCBwb3dlcnMgdGhlIHJlYWN0aXZlIGZvcm1cbiAgZnJhbWV3b3JrOiBhbnkgPSBudWxsOyAvLyBBY3RpdmUgZnJhbWV3b3JrIGNvbXBvbmVudFxuICBmb3JtT3B0aW9uczogYW55OyAvLyBBY3RpdmUgb3B0aW9ucywgdXNlZCB0byBjb25maWd1cmUgdGhlIGZvcm1cblxuICB2YWxpZERhdGE6IGFueSA9IG51bGw7IC8vIFZhbGlkIGZvcm0gZGF0YSAob3IgbnVsbCkgKD09PSBpc1ZhbGlkID8gZGF0YSA6IG51bGwpXG4gIGlzVmFsaWQ6IGJvb2xlYW4gPSBudWxsOyAvLyBJcyBjdXJyZW50IGZvcm0gZGF0YSB2YWxpZD9cbiAgYWp2RXJyb3JzOiBhbnkgPSBudWxsOyAvLyBBanYgZXJyb3JzIGZvciBjdXJyZW50IGRhdGFcbiAgdmFsaWRhdGlvbkVycm9yczogYW55ID0gbnVsbDsgLy8gQW55IHZhbGlkYXRpb24gZXJyb3JzIGZvciBjdXJyZW50IGRhdGFcbiAgZGF0YUVycm9yczogYW55ID0gbmV3IE1hcCgpOyAvL1xuICBmb3JtVmFsdWVTdWJzY3JpcHRpb246IGFueSA9IG51bGw7IC8vIFN1YnNjcmlwdGlvbiB0byBmb3JtR3JvdXAudmFsdWVDaGFuZ2VzIG9ic2VydmFibGUgKGZvciB1bi0gYW5kIHJlLXN1YnNjcmliaW5nKVxuICBkYXRhQ2hhbmdlczogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTsgLy8gRm9ybSBkYXRhIG9ic2VydmFibGVcbiAgaXNWYWxpZENoYW5nZXM6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0KCk7IC8vIGlzVmFsaWQgb2JzZXJ2YWJsZVxuICB2YWxpZGF0aW9uRXJyb3JDaGFuZ2VzOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdCgpOyAvLyB2YWxpZGF0aW9uRXJyb3JzIG9ic2VydmFibGVcblxuICBhcnJheU1hcDogTWFwPHN0cmluZywgbnVtYmVyPiA9IG5ldyBNYXAoKTsgLy8gTWFwcyBhcnJheXMgaW4gZGF0YSBvYmplY3QgYW5kIG51bWJlciBvZiB0dXBsZSB2YWx1ZXNcbiAgZGF0YU1hcDogTWFwPHN0cmluZywgYW55PiA9IG5ldyBNYXAoKTsgLy8gTWFwcyBwYXRocyBpbiBmb3JtIGRhdGEgdG8gc2NoZW1hIGFuZCBmb3JtR3JvdXAgcGF0aHNcbiAgZGF0YVJlY3Vyc2l2ZVJlZk1hcDogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTsgLy8gTWFwcyByZWN1cnNpdmUgcmVmZXJlbmNlIHBvaW50cyBpbiBmb3JtIGRhdGFcbiAgc2NoZW1hUmVjdXJzaXZlUmVmTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpOyAvLyBNYXBzIHJlY3Vyc2l2ZSByZWZlcmVuY2UgcG9pbnRzIGluIHNjaGVtYVxuICBzY2hlbWFSZWZMaWJyYXJ5OiBhbnkgPSB7fTsgLy8gTGlicmFyeSBvZiBzY2hlbWFzIGZvciByZXNvbHZpbmcgc2NoZW1hICRyZWZzXG4gIGxheW91dFJlZkxpYnJhcnk6IGFueSA9IHsgJyc6IG51bGwgfTsgLy8gTGlicmFyeSBvZiBsYXlvdXQgbm9kZXMgZm9yIGFkZGluZyB0byBmb3JtXG4gIHRlbXBsYXRlUmVmTGlicmFyeTogYW55ID0ge307IC8vIExpYnJhcnkgb2YgZm9ybUdyb3VwIHRlbXBsYXRlcyBmb3IgYWRkaW5nIHRvIGZvcm1cbiAgaGFzUm9vdFJlZmVyZW5jZSA9IGZhbHNlOyAvLyBEb2VzIHRoZSBmb3JtIGluY2x1ZGUgYSByZWN1cnNpdmUgcmVmZXJlbmNlIHRvIGl0c2VsZj9cblxuICBsYW5ndWFnZSA9ICdlbi1VUyc7IC8vIERvZXMgdGhlIGZvcm0gaW5jbHVkZSBhIHJlY3Vyc2l2ZSByZWZlcmVuY2UgdG8gaXRzZWxmP1xuXG4gIC8vIERlZmF1bHQgZ2xvYmFsIGZvcm0gb3B0aW9uc1xuICBkZWZhdWx0Rm9ybU9wdGlvbnM6IGFueSA9IHtcbiAgICBhdXRvY29tcGxldGU6IHRydWUsIC8vIEFsbG93IHRoZSB3ZWIgYnJvd3NlciB0byByZW1lbWJlciBwcmV2aW91cyBmb3JtIHN1Ym1pc3Npb24gdmFsdWVzIGFzIGRlZmF1bHRzXG4gICAgYWRkU3VibWl0OiAnYXV0bycsIC8vIEFkZCBhIHN1Ym1pdCBidXR0b24gaWYgbGF5b3V0IGRvZXMgbm90IGhhdmUgb25lP1xuICAgIC8vIGZvciBhZGRTdWJtaXQ6IHRydWUgPSBhbHdheXMsIGZhbHNlID0gbmV2ZXIsXG4gICAgLy8gJ2F1dG8nID0gb25seSBpZiBsYXlvdXQgaXMgdW5kZWZpbmVkIChmb3JtIGlzIGJ1aWx0IGZyb20gc2NoZW1hIGFsb25lKVxuICAgIGRlYnVnOiBmYWxzZSwgLy8gU2hvdyBkZWJ1Z2dpbmcgb3V0cHV0P1xuICAgIGRpc2FibGVJbnZhbGlkU3VibWl0OiB0cnVlLCAvLyBEaXNhYmxlIHN1Ym1pdCBpZiBmb3JtIGludmFsaWQ/XG4gICAgZm9ybURpc2FibGVkOiBmYWxzZSwgLy8gU2V0IGVudGlyZSBmb3JtIGFzIGRpc2FibGVkPyAobm90IGVkaXRhYmxlLCBhbmQgZGlzYWJsZXMgb3V0cHV0cylcbiAgICBmb3JtUmVhZG9ubHk6IGZhbHNlLCAvLyBTZXQgZW50aXJlIGZvcm0gYXMgcmVhZCBvbmx5PyAobm90IGVkaXRhYmxlLCBidXQgb3V0cHV0cyBzdGlsbCBlbmFibGVkKVxuICAgIGZpZWxkc1JlcXVpcmVkOiBmYWxzZSwgLy8gKHNldCBhdXRvbWF0aWNhbGx5KSBBcmUgdGhlcmUgYW55IHJlcXVpcmVkIGZpZWxkcyBpbiB0aGUgZm9ybT9cbiAgICBmcmFtZXdvcms6ICduby1mcmFtZXdvcmsnLCAvLyBUaGUgZnJhbWV3b3JrIHRvIGxvYWRcbiAgICBsb2FkRXh0ZXJuYWxBc3NldHM6IGZhbHNlLCAvLyBMb2FkIGV4dGVybmFsIGNzcyBhbmQgSmF2YVNjcmlwdCBmb3IgZnJhbWV3b3JrP1xuICAgIHByaXN0aW5lOiB7IGVycm9yczogdHJ1ZSwgc3VjY2VzczogdHJ1ZSB9LFxuICAgIHN1cHJlc3NQcm9wZXJ0eVRpdGxlczogZmFsc2UsXG4gICAgc2V0U2NoZW1hRGVmYXVsdHM6ICdhdXRvJywgLy8gU2V0IGZlZmF1bHQgdmFsdWVzIGZyb20gc2NoZW1hP1xuICAgIC8vIHRydWUgPSBhbHdheXMgc2V0ICh1bmxlc3Mgb3ZlcnJpZGRlbiBieSBsYXlvdXQgZGVmYXVsdCBvciBmb3JtVmFsdWVzKVxuICAgIC8vIGZhbHNlID0gbmV2ZXIgc2V0XG4gICAgLy8gJ2F1dG8nID0gc2V0IGluIGFkZGFibGUgY29tcG9uZW50cywgYW5kIGV2ZXJ5d2hlcmUgaWYgZm9ybVZhbHVlcyBub3Qgc2V0XG4gICAgc2V0TGF5b3V0RGVmYXVsdHM6ICdhdXRvJywgLy8gU2V0IGZlZmF1bHQgdmFsdWVzIGZyb20gbGF5b3V0P1xuICAgIC8vIHRydWUgPSBhbHdheXMgc2V0ICh1bmxlc3Mgb3ZlcnJpZGRlbiBieSBmb3JtVmFsdWVzKVxuICAgIC8vIGZhbHNlID0gbmV2ZXIgc2V0XG4gICAgLy8gJ2F1dG8nID0gc2V0IGluIGFkZGFibGUgY29tcG9uZW50cywgYW5kIGV2ZXJ5d2hlcmUgaWYgZm9ybVZhbHVlcyBub3Qgc2V0XG4gICAgdmFsaWRhdGVPblJlbmRlcjogJ2F1dG8nLCAvLyBWYWxpZGF0ZSBmaWVsZHMgaW1tZWRpYXRlbHksIGJlZm9yZSB0aGV5IGFyZSB0b3VjaGVkP1xuICAgIC8vIHRydWUgPSB2YWxpZGF0ZSBhbGwgZmllbGRzIGltbWVkaWF0ZWx5XG4gICAgLy8gZmFsc2UgPSBvbmx5IHZhbGlkYXRlIGZpZWxkcyBhZnRlciB0aGV5IGFyZSB0b3VjaGVkIGJ5IHVzZXJcbiAgICAvLyAnYXV0bycgPSB2YWxpZGF0ZSBmaWVsZHMgd2l0aCB2YWx1ZXMgaW1tZWRpYXRlbHksIGVtcHR5IGZpZWxkcyBhZnRlciB0aGV5IGFyZSB0b3VjaGVkXG4gICAgd2lkZ2V0czoge30sIC8vIEFueSBjdXN0b20gd2lkZ2V0cyB0byBsb2FkXG4gICAgZGVmYXV0V2lkZ2V0T3B0aW9uczoge1xuICAgICAgLy8gRGVmYXVsdCBvcHRpb25zIGZvciBmb3JtIGNvbnRyb2wgd2lkZ2V0c1xuICAgICAgbGlzdEl0ZW1zOiAxLCAvLyBOdW1iZXIgb2YgbGlzdCBpdGVtcyB0byBpbml0aWFsbHkgYWRkIHRvIGFycmF5cyB3aXRoIG5vIGRlZmF1bHQgdmFsdWVcbiAgICAgIGFkZGFibGU6IHRydWUsIC8vIEFsbG93IGFkZGluZyBpdGVtcyB0byBhbiBhcnJheSBvciAkcmVmIHBvaW50P1xuICAgICAgb3JkZXJhYmxlOiB0cnVlLCAvLyBBbGxvdyByZW9yZGVyaW5nIGl0ZW1zIHdpdGhpbiBhbiBhcnJheT9cbiAgICAgIHJlbW92YWJsZTogdHJ1ZSwgLy8gQWxsb3cgcmVtb3ZpbmcgaXRlbXMgZnJvbSBhbiBhcnJheSBvciAkcmVmIHBvaW50P1xuICAgICAgZW5hYmxlRXJyb3JTdGF0ZTogdHJ1ZSwgLy8gQXBwbHkgJ2hhcy1lcnJvcicgY2xhc3Mgd2hlbiBmaWVsZCBmYWlscyB2YWxpZGF0aW9uP1xuICAgICAgLy8gZGlzYWJsZUVycm9yU3RhdGU6IGZhbHNlLCAvLyBEb24ndCBhcHBseSAnaGFzLWVycm9yJyBjbGFzcyB3aGVuIGZpZWxkIGZhaWxzIHZhbGlkYXRpb24/XG4gICAgICBlbmFibGVTdWNjZXNzU3RhdGU6IHRydWUsIC8vIEFwcGx5ICdoYXMtc3VjY2VzcycgY2xhc3Mgd2hlbiBmaWVsZCB2YWxpZGF0ZXM/XG4gICAgICAvLyBkaXNhYmxlU3VjY2Vzc1N0YXRlOiBmYWxzZSwgLy8gRG9uJ3QgYXBwbHkgJ2hhcy1zdWNjZXNzJyBjbGFzcyB3aGVuIGZpZWxkIHZhbGlkYXRlcz9cbiAgICAgIGZlZWRiYWNrOiBmYWxzZSwgLy8gU2hvdyBpbmxpbmUgZmVlZGJhY2sgaWNvbnM/XG4gICAgICBmZWVkYmFja09uUmVuZGVyOiBmYWxzZSwgLy8gU2hvdyBlcnJvck1lc3NhZ2Ugb24gUmVuZGVyP1xuICAgICAgbm90aXRsZTogZmFsc2UsIC8vIEhpZGUgdGl0bGU/XG4gICAgICBkaXNhYmxlZDogZmFsc2UsIC8vIFNldCBjb250cm9sIGFzIGRpc2FibGVkPyAobm90IGVkaXRhYmxlLCBhbmQgZXhjbHVkZWQgZnJvbSBvdXRwdXQpXG4gICAgICByZWFkb25seTogZmFsc2UsIC8vIFNldCBjb250cm9sIGFzIHJlYWQgb25seT8gKG5vdCBlZGl0YWJsZSwgYnV0IGluY2x1ZGVkIGluIG91dHB1dClcbiAgICAgIHJldHVybkVtcHR5RmllbGRzOiB0cnVlLCAvLyByZXR1cm4gdmFsdWVzIGZvciBmaWVsZHMgdGhhdCBjb250YWluIG5vIGRhdGE/XG4gICAgICB2YWxpZGF0aW9uTWVzc2FnZXM6IHt9IC8vIHNldCBieSBzZXRMYW5ndWFnZSgpXG4gICAgfVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2V0TGFuZ3VhZ2UodGhpcy5sYW5ndWFnZSk7XG4gICAgdGhpcy5hanYuYWRkTWV0YVNjaGVtYShqc29uRHJhZnQ2KTtcbiAgfVxuXG4gIHNldExhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcgPSAnZW4tVVMnKSB7XG4gICAgdGhpcy5sYW5ndWFnZSA9IGxhbmd1YWdlO1xuICAgIGNvbnN0IGxhbmd1YWdlVmFsaWRhdGlvbk1lc3NhZ2VzID0ge1xuICAgICAgZGU6IGRlVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgICAgZW46IGVuVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgICAgZXM6IGVzVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgICAgZnI6IGZyVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgICAgaXQ6IGl0VmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgICAgcHQ6IHB0VmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgICAgemg6IHpoVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgIH07XG4gICAgY29uc3QgbGFuZ3VhZ2VDb2RlID0gbGFuZ3VhZ2Uuc2xpY2UoMCwgMik7XG5cbiAgICBjb25zdCB2YWxpZGF0aW9uTWVzc2FnZXMgPSBsYW5ndWFnZVZhbGlkYXRpb25NZXNzYWdlc1tsYW5ndWFnZUNvZGVdO1xuXG4gICAgdGhpcy5kZWZhdWx0Rm9ybU9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXMgPSBjbG9uZURlZXAoXG4gICAgICB2YWxpZGF0aW9uTWVzc2FnZXNcbiAgICApO1xuICB9XG5cbiAgZ2V0RGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhO1xuICB9XG5cbiAgZ2V0U2NoZW1hKCkge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYTtcbiAgfVxuXG4gIGdldExheW91dCgpIHtcbiAgICByZXR1cm4gdGhpcy5sYXlvdXQ7XG4gIH1cblxuICByZXNldEFsbFZhbHVlcygpIHtcbiAgICB0aGlzLkpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICAgIHRoaXMuUmVhY3RKc29uU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSBmYWxzZTtcbiAgICB0aGlzLkFuZ3VsYXJTY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICAgIHRoaXMudHBsZGF0YSA9IHt9O1xuICAgIHRoaXMudmFsaWRhdGVGb3JtRGF0YSA9IG51bGw7XG4gICAgdGhpcy5mb3JtVmFsdWVzID0ge307XG4gICAgdGhpcy5zY2hlbWEgPSB7fTtcbiAgICB0aGlzLmxheW91dCA9IFtdO1xuICAgIHRoaXMuZm9ybUdyb3VwVGVtcGxhdGUgPSB7fTtcbiAgICB0aGlzLmZvcm1Hcm91cCA9IG51bGw7XG4gICAgdGhpcy5mcmFtZXdvcmsgPSBudWxsO1xuICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgIHRoaXMudmFsaWREYXRhID0gbnVsbDtcbiAgICB0aGlzLmlzVmFsaWQgPSBudWxsO1xuICAgIHRoaXMudmFsaWRhdGlvbkVycm9ycyA9IG51bGw7XG4gICAgdGhpcy5hcnJheU1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmRhdGFNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5kYXRhUmVjdXJzaXZlUmVmTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuc2NoZW1hUmVjdXJzaXZlUmVmTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMubGF5b3V0UmVmTGlicmFyeSA9IHt9O1xuICAgIHRoaXMuc2NoZW1hUmVmTGlicmFyeSA9IHt9O1xuICAgIHRoaXMudGVtcGxhdGVSZWZMaWJyYXJ5ID0ge307XG4gICAgdGhpcy5mb3JtT3B0aW9ucyA9IGNsb25lRGVlcCh0aGlzLmRlZmF1bHRGb3JtT3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogJ2J1aWxkUmVtb3RlRXJyb3InIGZ1bmN0aW9uXG4gICAqXG4gICAqIEV4YW1wbGUgZXJyb3JzOlxuICAgKiB7XG4gICAqICAgbGFzdF9uYW1lOiBbIHtcbiAgICogICAgIG1lc3NhZ2U6ICdMYXN0IG5hbWUgbXVzdCBieSBzdGFydCB3aXRoIGNhcGl0YWwgbGV0dGVyLicsXG4gICAqICAgICBjb2RlOiAnY2FwaXRhbF9sZXR0ZXInXG4gICAqICAgfSBdLFxuICAgKiAgIGVtYWlsOiBbIHtcbiAgICogICAgIG1lc3NhZ2U6ICdFbWFpbCBtdXN0IGJlIGZyb20gZXhhbXBsZS5jb20gZG9tYWluLicsXG4gICAqICAgICBjb2RlOiAnc3BlY2lhbF9kb21haW4nXG4gICAqICAgfSwge1xuICAgKiAgICAgbWVzc2FnZTogJ0VtYWlsIG11c3QgY29udGFpbiBhbiBAIHN5bWJvbC4nLFxuICAgKiAgICAgY29kZTogJ2F0X3N5bWJvbCdcbiAgICogICB9IF1cbiAgICogfVxuICAgKiAvL3tFcnJvck1lc3NhZ2VzfSBlcnJvcnNcbiAgICovXG4gIGJ1aWxkUmVtb3RlRXJyb3IoZXJyb3JzOiBFcnJvck1lc3NhZ2VzKSB7XG4gICAgZm9yRWFjaChlcnJvcnMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBpZiAoa2V5IGluIHRoaXMuZm9ybUdyb3VwLmNvbnRyb2xzKSB7XG4gICAgICAgIGZvciAoY29uc3QgZXJyb3Igb2YgdmFsdWUpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSB7fTtcbiAgICAgICAgICBlcnJbZXJyb3JbJ2NvZGUnXV0gPSBlcnJvclsnbWVzc2FnZSddO1xuICAgICAgICAgIHRoaXMuZm9ybUdyb3VwLmdldChrZXkpLnNldEVycm9ycyhlcnIsIHsgZW1pdEV2ZW50OiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB2YWxpZGF0ZURhdGEobmV3VmFsdWU6IGFueSwgdXBkYXRlU3Vic2NyaXB0aW9ucyA9IHRydWUpOiB2b2lkIHtcbiAgICAvLyBGb3JtYXQgcmF3IGZvcm0gZGF0YSB0byBjb3JyZWN0IGRhdGEgdHlwZXNcbiAgICB0aGlzLmRhdGEgPSBmb3JtYXRGb3JtRGF0YShcbiAgICAgIG5ld1ZhbHVlLFxuICAgICAgdGhpcy5kYXRhTWFwLFxuICAgICAgdGhpcy5kYXRhUmVjdXJzaXZlUmVmTWFwLFxuICAgICAgdGhpcy5hcnJheU1hcCxcbiAgICAgIHRoaXMuZm9ybU9wdGlvbnMucmV0dXJuRW1wdHlGaWVsZHNcbiAgICApO1xuICAgIHRoaXMuaXNWYWxpZCA9IHRoaXMudmFsaWRhdGVGb3JtRGF0YSh0aGlzLmRhdGEpO1xuICAgIHRoaXMudmFsaWREYXRhID0gdGhpcy5pc1ZhbGlkID8gdGhpcy5kYXRhIDogbnVsbDtcbiAgICBjb25zdCBjb21waWxlRXJyb3JzID0gZXJyb3JzID0+IHtcbiAgICAgIGNvbnN0IGNvbXBpbGVkRXJyb3JzID0ge307XG4gICAgICAoZXJyb3JzIHx8IFtdKS5mb3JFYWNoKGVycm9yID0+IHtcbiAgICAgICAgaWYgKCFjb21waWxlZEVycm9yc1tlcnJvci5kYXRhUGF0aF0pIHtcbiAgICAgICAgICBjb21waWxlZEVycm9yc1tlcnJvci5kYXRhUGF0aF0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb21waWxlZEVycm9yc1tlcnJvci5kYXRhUGF0aF0ucHVzaChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvbXBpbGVkRXJyb3JzO1xuICAgIH07XG4gICAgdGhpcy5hanZFcnJvcnMgPSB0aGlzLnZhbGlkYXRlRm9ybURhdGEuZXJyb3JzO1xuICAgIHRoaXMudmFsaWRhdGlvbkVycm9ycyA9IGNvbXBpbGVFcnJvcnModGhpcy52YWxpZGF0ZUZvcm1EYXRhLmVycm9ycyk7XG4gICAgaWYgKHVwZGF0ZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuZGF0YUNoYW5nZXMubmV4dCh0aGlzLmRhdGEpO1xuICAgICAgdGhpcy5pc1ZhbGlkQ2hhbmdlcy5uZXh0KHRoaXMuaXNWYWxpZCk7XG4gICAgICB0aGlzLnZhbGlkYXRpb25FcnJvckNoYW5nZXMubmV4dCh0aGlzLmFqdkVycm9ycyk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShmb3JtVmFsdWVzOiBhbnkgPSBudWxsLCBzZXRWYWx1ZXMgPSB0cnVlKSB7XG4gICAgdGhpcy5mb3JtR3JvdXBUZW1wbGF0ZSA9IGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICB0aGlzLFxuICAgICAgZm9ybVZhbHVlcyxcbiAgICAgIHNldFZhbHVlc1xuICAgICk7XG4gIH1cblxuICBidWlsZEZvcm1Hcm91cCgpIHtcbiAgICB0aGlzLmZvcm1Hcm91cCA9IDxVbnR5cGVkRm9ybUdyb3VwPmJ1aWxkRm9ybUdyb3VwKHRoaXMuZm9ybUdyb3VwVGVtcGxhdGUpO1xuICAgIGlmICh0aGlzLmZvcm1Hcm91cCkge1xuICAgICAgdGhpcy5jb21waWxlQWp2U2NoZW1hKCk7XG4gICAgICB0aGlzLnZhbGlkYXRlRGF0YSh0aGlzLmZvcm1Hcm91cC52YWx1ZSk7XG5cbiAgICAgIC8vIFNldCB1cCBvYnNlcnZhYmxlcyB0byBlbWl0IGRhdGEgYW5kIHZhbGlkYXRpb24gaW5mbyB3aGVuIGZvcm0gZGF0YSBjaGFuZ2VzXG4gICAgICBpZiAodGhpcy5mb3JtVmFsdWVTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5mb3JtVmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZm9ybVZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5mb3JtR3JvdXAudmFsdWVDaGFuZ2VzLnN1YnNjcmliZShcbiAgICAgICAgZm9ybVZhbHVlID0+IHRoaXMudmFsaWRhdGVEYXRhKGZvcm1WYWx1ZSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRMYXlvdXQod2lkZ2V0TGlicmFyeTogYW55KSB7XG4gICAgdGhpcy5sYXlvdXQgPSBidWlsZExheW91dCh0aGlzLCB3aWRnZXRMaWJyYXJ5KTtcbiAgfVxuXG4gIHNldE9wdGlvbnMobmV3T3B0aW9uczogYW55KSB7XG4gICAgaWYgKGlzT2JqZWN0KG5ld09wdGlvbnMpKSB7XG4gICAgICBjb25zdCBhZGRPcHRpb25zID0gY2xvbmVEZWVwKG5ld09wdGlvbnMpO1xuICAgICAgLy8gQmFja3dhcmQgY29tcGF0aWJpbGl0eSBmb3IgJ2RlZmF1bHRPcHRpb25zJyAocmVuYW1lZCAnZGVmYXV0V2lkZ2V0T3B0aW9ucycpXG4gICAgICBpZiAoaXNPYmplY3QoYWRkT3B0aW9ucy5kZWZhdWx0T3B0aW9ucykpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB0aGlzLmZvcm1PcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnMsXG4gICAgICAgICAgYWRkT3B0aW9ucy5kZWZhdWx0T3B0aW9uc1xuICAgICAgICApO1xuICAgICAgICBkZWxldGUgYWRkT3B0aW9ucy5kZWZhdWx0T3B0aW9ucztcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdChhZGRPcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnMpKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgdGhpcy5mb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zLFxuICAgICAgICAgIGFkZE9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9uc1xuICAgICAgICApO1xuICAgICAgICBkZWxldGUgYWRkT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmZvcm1PcHRpb25zLCBhZGRPcHRpb25zKTtcblxuICAgICAgLy8gY29udmVydCBkaXNhYmxlRXJyb3JTdGF0ZSAvIGRpc2FibGVTdWNjZXNzU3RhdGUgdG8gZW5hYmxlLi4uXG4gICAgICBjb25zdCBnbG9iYWxEZWZhdWx0cyA9IHRoaXMuZm9ybU9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucztcbiAgICAgIFsnRXJyb3JTdGF0ZScsICdTdWNjZXNzU3RhdGUnXVxuICAgICAgICAuZmlsdGVyKHN1ZmZpeCA9PiBoYXNPd24oZ2xvYmFsRGVmYXVsdHMsICdkaXNhYmxlJyArIHN1ZmZpeCkpXG4gICAgICAgIC5mb3JFYWNoKHN1ZmZpeCA9PiB7XG4gICAgICAgICAgZ2xvYmFsRGVmYXVsdHNbJ2VuYWJsZScgKyBzdWZmaXhdID0gIWdsb2JhbERlZmF1bHRzW1xuICAgICAgICAgICAgJ2Rpc2FibGUnICsgc3VmZml4XG4gICAgICAgICAgXTtcbiAgICAgICAgICBkZWxldGUgZ2xvYmFsRGVmYXVsdHNbJ2Rpc2FibGUnICsgc3VmZml4XTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29tcGlsZUFqdlNjaGVtYSgpIHtcbiAgICBpZiAoIXRoaXMudmFsaWRhdGVGb3JtRGF0YSkge1xuICAgICAgLy8gaWYgJ3VpOm9yZGVyJyBleGlzdHMgaW4gcHJvcGVydGllcywgbW92ZSBpdCB0byByb290IGJlZm9yZSBjb21waWxpbmcgd2l0aCBhanZcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuc2NoZW1hLnByb3BlcnRpZXNbJ3VpOm9yZGVyJ10pKSB7XG4gICAgICAgIHRoaXMuc2NoZW1hWyd1aTpvcmRlciddID0gdGhpcy5zY2hlbWEucHJvcGVydGllc1sndWk6b3JkZXInXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc2NoZW1hLnByb3BlcnRpZXNbJ3VpOm9yZGVyJ107XG4gICAgICB9XG4gICAgICB0aGlzLmFqdi5yZW1vdmVTY2hlbWEodGhpcy5zY2hlbWEpO1xuICAgICAgdGhpcy52YWxpZGF0ZUZvcm1EYXRhID0gdGhpcy5hanYuY29tcGlsZSh0aGlzLnNjaGVtYSk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRTY2hlbWFGcm9tRGF0YShkYXRhPzogYW55LCByZXF1aXJlQWxsRmllbGRzID0gZmFsc2UpOiBhbnkge1xuICAgIGlmIChkYXRhKSB7XG4gICAgICByZXR1cm4gYnVpbGRTY2hlbWFGcm9tRGF0YShkYXRhLCByZXF1aXJlQWxsRmllbGRzKTtcbiAgICB9XG4gICAgdGhpcy5zY2hlbWEgPSBidWlsZFNjaGVtYUZyb21EYXRhKHRoaXMuZm9ybVZhbHVlcywgcmVxdWlyZUFsbEZpZWxkcyk7XG4gIH1cblxuICBidWlsZFNjaGVtYUZyb21MYXlvdXQobGF5b3V0PzogYW55KTogYW55IHtcbiAgICBpZiAobGF5b3V0KSB7XG4gICAgICByZXR1cm4gYnVpbGRTY2hlbWFGcm9tTGF5b3V0KGxheW91dCk7XG4gICAgfVxuICAgIHRoaXMuc2NoZW1hID0gYnVpbGRTY2hlbWFGcm9tTGF5b3V0KHRoaXMubGF5b3V0KTtcbiAgfVxuXG4gIHNldFRwbGRhdGEobmV3VHBsZGF0YTogYW55ID0ge30pOiB2b2lkIHtcbiAgICB0aGlzLnRwbGRhdGEgPSBuZXdUcGxkYXRhO1xuICB9XG5cbiAgcGFyc2VUZXh0KFxuICAgIHRleHQgPSAnJyxcbiAgICB2YWx1ZTogYW55ID0ge30sXG4gICAgdmFsdWVzOiBhbnkgPSB7fSxcbiAgICBrZXk6IG51bWJlciB8IHN0cmluZyA9IG51bGxcbiAgKTogc3RyaW5nIHtcbiAgICBpZiAoIXRleHQgfHwgIS97ey4rP319Ly50ZXN0KHRleHQpKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgve3soLis/KX19L2csICguLi5hKSA9PlxuICAgICAgdGhpcy5wYXJzZUV4cHJlc3Npb24oYVsxXSwgdmFsdWUsIHZhbHVlcywga2V5LCB0aGlzLnRwbGRhdGEpXG4gICAgKTtcbiAgfVxuXG4gIHBhcnNlRXhwcmVzc2lvbihcbiAgICBleHByZXNzaW9uID0gJycsXG4gICAgdmFsdWU6IGFueSA9IHt9LFxuICAgIHZhbHVlczogYW55ID0ge30sXG4gICAga2V5OiBudW1iZXIgfCBzdHJpbmcgPSBudWxsLFxuICAgIHRwbGRhdGE6IGFueSA9IG51bGxcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBleHByZXNzaW9uICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb25zdCBpbmRleCA9IHR5cGVvZiBrZXkgPT09ICdudW1iZXInID8ga2V5ICsgMSArICcnIDoga2V5IHx8ICcnO1xuICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnRyaW0oKTtcbiAgICBpZiAoXG4gICAgICAoZXhwcmVzc2lvblswXSA9PT0gXCInXCIgfHwgZXhwcmVzc2lvblswXSA9PT0gJ1wiJykgJiZcbiAgICAgIGV4cHJlc3Npb25bMF0gPT09IGV4cHJlc3Npb25bZXhwcmVzc2lvbi5sZW5ndGggLSAxXSAmJlxuICAgICAgZXhwcmVzc2lvbi5zbGljZSgxLCBleHByZXNzaW9uLmxlbmd0aCAtIDEpLmluZGV4T2YoZXhwcmVzc2lvblswXSkgPT09IC0xXG4gICAgKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvbi5zbGljZSgxLCBleHByZXNzaW9uLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBpZiAoZXhwcmVzc2lvbiA9PT0gJ2lkeCcgfHwgZXhwcmVzc2lvbiA9PT0gJyRpbmRleCcpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG4gICAgaWYgKGV4cHJlc3Npb24gPT09ICd2YWx1ZScgJiYgIWhhc093bih2YWx1ZXMsICd2YWx1ZScpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGlmIChcbiAgICAgIFsnXCInLCBcIidcIiwgJyAnLCAnfHwnLCAnJiYnLCAnKyddLmV2ZXJ5KFxuICAgICAgICBkZWxpbSA9PiBleHByZXNzaW9uLmluZGV4T2YoZGVsaW0pID09PSAtMVxuICAgICAgKVxuICAgICkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IEpzb25Qb2ludGVyLnBhcnNlT2JqZWN0UGF0aChleHByZXNzaW9uKTtcbiAgICAgIHJldHVybiBwb2ludGVyWzBdID09PSAndmFsdWUnICYmIEpzb25Qb2ludGVyLmhhcyh2YWx1ZSwgcG9pbnRlci5zbGljZSgxKSlcbiAgICAgICAgPyBKc29uUG9pbnRlci5nZXQodmFsdWUsIHBvaW50ZXIuc2xpY2UoMSkpXG4gICAgICAgIDogcG9pbnRlclswXSA9PT0gJ3ZhbHVlcycgJiYgSnNvblBvaW50ZXIuaGFzKHZhbHVlcywgcG9pbnRlci5zbGljZSgxKSlcbiAgICAgICAgICA/IEpzb25Qb2ludGVyLmdldCh2YWx1ZXMsIHBvaW50ZXIuc2xpY2UoMSkpXG4gICAgICAgICAgOiBwb2ludGVyWzBdID09PSAndHBsZGF0YScgJiYgSnNvblBvaW50ZXIuaGFzKHRwbGRhdGEsIHBvaW50ZXIuc2xpY2UoMSkpXG4gICAgICAgICAgICA/IEpzb25Qb2ludGVyLmdldCh0cGxkYXRhLCBwb2ludGVyLnNsaWNlKDEpKVxuICAgICAgICAgICAgOiBKc29uUG9pbnRlci5oYXModmFsdWVzLCBwb2ludGVyKVxuICAgICAgICAgICAgICA/IEpzb25Qb2ludGVyLmdldCh2YWx1ZXMsIHBvaW50ZXIpXG4gICAgICAgICAgICAgIDogJyc7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJ1tpZHhdJykgPiAtMSkge1xuICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXFxbaWR4XFxdL2csIDxzdHJpbmc+aW5kZXgpO1xuICAgIH1cbiAgICBpZiAoZXhwcmVzc2lvbi5pbmRleE9mKCdbJGluZGV4XScpID4gLTEpIHtcbiAgICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnJlcGxhY2UoL1xcWyRpbmRleFxcXS9nLCA8c3RyaW5nPmluZGV4KTtcbiAgICB9XG4gICAgLy8gVE9ETzogSW1wcm92ZSBleHByZXNzaW9uIGV2YWx1YXRpb24gYnkgcGFyc2luZyBxdW90ZWQgc3RyaW5ncyBmaXJzdFxuICAgIC8vIGxldCBleHByZXNzaW9uQXJyYXkgPSBleHByZXNzaW9uLm1hdGNoKC8oW15cIiddK3xcIlteXCJdK1wifCdbXiddKycpL2cpO1xuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJ3x8JykgPiAtMSkge1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb25cbiAgICAgICAgLnNwbGl0KCd8fCcpXG4gICAgICAgIC5yZWR1Y2UoXG4gICAgICAgICAgKGFsbCwgdGVybSkgPT5cbiAgICAgICAgICAgIGFsbCB8fCB0aGlzLnBhcnNlRXhwcmVzc2lvbih0ZXJtLCB2YWx1ZSwgdmFsdWVzLCBrZXksIHRwbGRhdGEpLFxuICAgICAgICAgICcnXG4gICAgICAgICk7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJyYmJykgPiAtMSkge1xuICAgICAgcmV0dXJuIGV4cHJlc3Npb25cbiAgICAgICAgLnNwbGl0KCcmJicpXG4gICAgICAgIC5yZWR1Y2UoXG4gICAgICAgICAgKGFsbCwgdGVybSkgPT5cbiAgICAgICAgICAgIGFsbCAmJiB0aGlzLnBhcnNlRXhwcmVzc2lvbih0ZXJtLCB2YWx1ZSwgdmFsdWVzLCBrZXksIHRwbGRhdGEpLFxuICAgICAgICAgICcgJ1xuICAgICAgICApXG4gICAgICAgIC50cmltKCk7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJysnKSA+IC0xKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvblxuICAgICAgICAuc3BsaXQoJysnKVxuICAgICAgICAubWFwKHRlcm0gPT4gdGhpcy5wYXJzZUV4cHJlc3Npb24odGVybSwgdmFsdWUsIHZhbHVlcywga2V5LCB0cGxkYXRhKSlcbiAgICAgICAgLmpvaW4oJycpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBzZXRBcnJheUl0ZW1UaXRsZShcbiAgICBwYXJlbnRDdHg6IGFueSA9IHt9LFxuICAgIGNoaWxkTm9kZTogYW55ID0gbnVsbCxcbiAgICBpbmRleDogbnVtYmVyID0gbnVsbFxuICApOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhcmVudE5vZGUgPSBwYXJlbnRDdHgubGF5b3V0Tm9kZTtcbiAgICBjb25zdCBwYXJlbnRWYWx1ZXM6IGFueSA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2xWYWx1ZShwYXJlbnRDdHgpO1xuICAgIGNvbnN0IGlzQXJyYXlJdGVtID1cbiAgICAgIChwYXJlbnROb2RlLnR5cGUgfHwgJycpLnNsaWNlKC01KSA9PT0gJ2FycmF5JyAmJiBpc0FycmF5KHBhcmVudFZhbHVlcyk7XG4gICAgY29uc3QgdGV4dCA9IEpzb25Qb2ludGVyLmdldEZpcnN0KFxuICAgICAgaXNBcnJheUl0ZW0gJiYgY2hpbGROb2RlLnR5cGUgIT09ICckcmVmJ1xuICAgICAgICA/IFtcbiAgICAgICAgICBbY2hpbGROb2RlLCAnL29wdGlvbnMvbGVnZW5kJ10sXG4gICAgICAgICAgW2NoaWxkTm9kZSwgJy9vcHRpb25zL3RpdGxlJ10sXG4gICAgICAgICAgW3BhcmVudE5vZGUsICcvb3B0aW9ucy90aXRsZSddLFxuICAgICAgICAgIFtwYXJlbnROb2RlLCAnL29wdGlvbnMvbGVnZW5kJ11cbiAgICAgICAgXVxuICAgICAgICA6IFtcbiAgICAgICAgICBbY2hpbGROb2RlLCAnL29wdGlvbnMvdGl0bGUnXSxcbiAgICAgICAgICBbY2hpbGROb2RlLCAnL29wdGlvbnMvbGVnZW5kJ10sXG4gICAgICAgICAgW3BhcmVudE5vZGUsICcvb3B0aW9ucy90aXRsZSddLFxuICAgICAgICAgIFtwYXJlbnROb2RlLCAnL29wdGlvbnMvbGVnZW5kJ11cbiAgICAgICAgXVxuICAgICk7XG4gICAgaWYgKCF0ZXh0KSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgY29uc3QgY2hpbGRWYWx1ZSA9XG4gICAgICBpc0FycmF5KHBhcmVudFZhbHVlcykgJiYgaW5kZXggPCBwYXJlbnRWYWx1ZXMubGVuZ3RoXG4gICAgICAgID8gcGFyZW50VmFsdWVzW2luZGV4XVxuICAgICAgICA6IHBhcmVudFZhbHVlcztcbiAgICByZXR1cm4gdGhpcy5wYXJzZVRleHQodGV4dCwgY2hpbGRWYWx1ZSwgcGFyZW50VmFsdWVzLCBpbmRleCk7XG4gIH1cblxuICBzZXRJdGVtVGl0bGUoY3R4OiBhbnkpIHtcbiAgICByZXR1cm4gIWN0eC5vcHRpb25zLnRpdGxlICYmIC9eKFxcZCt8LSkkLy50ZXN0KGN0eC5sYXlvdXROb2RlLm5hbWUpXG4gICAgICA/IG51bGxcbiAgICAgIDogdGhpcy5wYXJzZVRleHQoXG4gICAgICAgIGN0eC5vcHRpb25zLnRpdGxlIHx8IHRvVGl0bGVDYXNlKGN0eC5sYXlvdXROb2RlLm5hbWUpLFxuICAgICAgICB0aGlzLmdldEZvcm1Db250cm9sVmFsdWUodGhpcyksXG4gICAgICAgICh0aGlzLmdldEZvcm1Db250cm9sR3JvdXAodGhpcykgfHwgPGFueT57fSkudmFsdWUsXG4gICAgICAgIGN0eC5kYXRhSW5kZXhbY3R4LmRhdGFJbmRleC5sZW5ndGggLSAxXVxuICAgICAgKTtcbiAgfVxuXG4gIGV2YWx1YXRlQ29uZGl0aW9uKGxheW91dE5vZGU6IGFueSwgZGF0YUluZGV4OiBudW1iZXJbXSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGFycmF5SW5kZXggPSBkYXRhSW5kZXggJiYgZGF0YUluZGV4W2RhdGFJbmRleC5sZW5ndGggLSAxXTtcbiAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcbiAgICBpZiAoaGFzVmFsdWUoKGxheW91dE5vZGUub3B0aW9ucyB8fCB7fSkuY29uZGl0aW9uKSkge1xuICAgICAgaWYgKHR5cGVvZiBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uID09PSAnc3RyaW5nJykge1xuICAgICAgICBsZXQgcG9pbnRlciA9IGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb247XG4gICAgICAgIGlmIChoYXNWYWx1ZShhcnJheUluZGV4KSkge1xuICAgICAgICAgIHBvaW50ZXIgPSBwb2ludGVyLnJlcGxhY2UoJ1thcnJheUluZGV4XScsIGBbJHthcnJheUluZGV4fV1gKTtcbiAgICAgICAgfVxuICAgICAgICBwb2ludGVyID0gSnNvblBvaW50ZXIucGFyc2VPYmplY3RQYXRoKHBvaW50ZXIpO1xuICAgICAgICByZXN1bHQgPSAhIUpzb25Qb2ludGVyLmdldCh0aGlzLmRhdGEsIHBvaW50ZXIpO1xuICAgICAgICBpZiAoIXJlc3VsdCAmJiBwb2ludGVyWzBdID09PSAnbW9kZWwnKSB7XG4gICAgICAgICAgcmVzdWx0ID0gISFKc29uUG9pbnRlci5nZXQoeyBtb2RlbDogdGhpcy5kYXRhIH0sIHBvaW50ZXIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc3VsdCA9IGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24odGhpcy5kYXRhKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHR5cGVvZiBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uLmZ1bmN0aW9uQm9keSA9PT0gJ3N0cmluZydcbiAgICAgICkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGR5bkZuID0gbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgJ21vZGVsJyxcbiAgICAgICAgICAgICdhcnJheUluZGljZXMnLFxuICAgICAgICAgICAgbGF5b3V0Tm9kZS5vcHRpb25zLmNvbmRpdGlvbi5mdW5jdGlvbkJvZHlcbiAgICAgICAgICApO1xuICAgICAgICAgIHJlc3VsdCA9IGR5bkZuKHRoaXMuZGF0YSwgZGF0YUluZGV4KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICdjb25kaXRpb24gZnVuY3Rpb25Cb2R5IGVycm9yZWQgb3V0IG9uIGV2YWx1YXRpb246ICcgK1xuICAgICAgICAgICAgbGF5b3V0Tm9kZS5vcHRpb25zLmNvbmRpdGlvbi5mdW5jdGlvbkJvZHlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpbml0aWFsaXplQ29udHJvbChjdHg6IGFueSwgYmluZCA9IHRydWUpOiBib29sZWFuIHtcbiAgICBpZiAoIWlzT2JqZWN0KGN0eCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGlzRW1wdHkoY3R4Lm9wdGlvbnMpKSB7XG4gICAgICBjdHgub3B0aW9ucyA9ICFpc0VtcHR5KChjdHgubGF5b3V0Tm9kZSB8fCB7fSkub3B0aW9ucylcbiAgICAgICAgPyBjdHgubGF5b3V0Tm9kZS5vcHRpb25zXG4gICAgICAgIDogY2xvbmVEZWVwKHRoaXMuZm9ybU9wdGlvbnMpO1xuICAgIH1cbiAgICBjdHguZm9ybUNvbnRyb2wgPSB0aGlzLmdldEZvcm1Db250cm9sKGN0eCk7XG4gICAgY3R4LmJvdW5kQ29udHJvbCA9IGJpbmQgJiYgISFjdHguZm9ybUNvbnRyb2w7XG4gICAgaWYgKGN0eC5mb3JtQ29udHJvbCkge1xuICAgICAgY3R4LmNvbnRyb2xOYW1lID0gdGhpcy5nZXRGb3JtQ29udHJvbE5hbWUoY3R4KTtcbiAgICAgIGN0eC5jb250cm9sVmFsdWUgPSBjdHguZm9ybUNvbnRyb2wudmFsdWU7XG4gICAgICBjdHguY29udHJvbERpc2FibGVkID0gY3R4LmZvcm1Db250cm9sLmRpc2FibGVkO1xuICAgICAgY3R4Lm9wdGlvbnMuZXJyb3JNZXNzYWdlID1cbiAgICAgICAgY3R4LmZvcm1Db250cm9sLnN0YXR1cyA9PT0gJ1ZBTElEJ1xuICAgICAgICAgID8gbnVsbFxuICAgICAgICAgIDogdGhpcy5mb3JtYXRFcnJvcnMoXG4gICAgICAgICAgICBjdHguZm9ybUNvbnRyb2wuZXJyb3JzLFxuICAgICAgICAgICAgY3R4Lm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2VzXG4gICAgICAgICAgKTtcbiAgICAgIGN0eC5vcHRpb25zLnNob3dFcnJvcnMgPVxuICAgICAgICB0aGlzLmZvcm1PcHRpb25zLnZhbGlkYXRlT25SZW5kZXIgPT09IHRydWUgfHxcbiAgICAgICAgKHRoaXMuZm9ybU9wdGlvbnMudmFsaWRhdGVPblJlbmRlciA9PT0gJ2F1dG8nICYmXG4gICAgICAgICAgaGFzVmFsdWUoY3R4LmNvbnRyb2xWYWx1ZSkpO1xuICAgICAgY3R4LmZvcm1Db250cm9sLnN0YXR1c0NoYW5nZXMuc3Vic2NyaWJlKFxuICAgICAgICBzdGF0dXMgPT5cbiAgICAgICAgICAoY3R4Lm9wdGlvbnMuZXJyb3JNZXNzYWdlID1cbiAgICAgICAgICAgIHN0YXR1cyA9PT0gJ1ZBTElEJ1xuICAgICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgICAgOiB0aGlzLmZvcm1hdEVycm9ycyhcbiAgICAgICAgICAgICAgICBjdHguZm9ybUNvbnRyb2wuZXJyb3JzLFxuICAgICAgICAgICAgICAgIGN0eC5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlc1xuICAgICAgICAgICAgICApKVxuICAgICAgKTtcbiAgICAgIGN0eC5mb3JtQ29udHJvbC52YWx1ZUNoYW5nZXMuc3Vic2NyaWJlKHZhbHVlID0+IHtcbiAgICAgICAgaWYgKCEhdmFsdWUpIHtcbiAgICAgICAgICBjdHguY29udHJvbFZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguY29udHJvbE5hbWUgPSBjdHgubGF5b3V0Tm9kZS5uYW1lO1xuICAgICAgY3R4LmNvbnRyb2xWYWx1ZSA9IGN0eC5sYXlvdXROb2RlLnZhbHVlIHx8IG51bGw7XG4gICAgICBjb25zdCBkYXRhUG9pbnRlciA9IHRoaXMuZ2V0RGF0YVBvaW50ZXIoY3R4KTtcbiAgICAgIGlmIChiaW5kICYmIGRhdGFQb2ludGVyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgYHdhcm5pbmc6IGNvbnRyb2wgXCIke2RhdGFQb2ludGVyfVwiIGlzIG5vdCBib3VuZCB0byB0aGUgQW5ndWxhciBGb3JtR3JvdXAuYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3R4LmJvdW5kQ29udHJvbDtcbiAgfVxuXG4gIGZvcm1hdEVycm9ycyhlcnJvcnM6IGFueSwgdmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnkgPSB7fSk6IHN0cmluZyB7XG4gICAgaWYgKGlzRW1wdHkoZXJyb3JzKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghaXNPYmplY3QodmFsaWRhdGlvbk1lc3NhZ2VzKSkge1xuICAgICAgdmFsaWRhdGlvbk1lc3NhZ2VzID0ge307XG4gICAgfVxuICAgIGNvbnN0IGFkZFNwYWNlcyA9IHN0cmluZyA9PlxuICAgICAgc3RyaW5nWzBdLnRvVXBwZXJDYXNlKCkgK1xuICAgICAgKHN0cmluZy5zbGljZSgxKSB8fCAnJylcbiAgICAgICAgLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMSAkMicpXG4gICAgICAgIC5yZXBsYWNlKC9fL2csICcgJyk7XG4gICAgY29uc3QgZm9ybWF0RXJyb3IgPSBlcnJvciA9PlxuICAgICAgdHlwZW9mIGVycm9yID09PSAnb2JqZWN0J1xuICAgICAgICA/IE9iamVjdC5rZXlzKGVycm9yKVxuICAgICAgICAgIC5tYXAoa2V5ID0+XG4gICAgICAgICAgICBlcnJvcltrZXldID09PSB0cnVlXG4gICAgICAgICAgICAgID8gYWRkU3BhY2VzKGtleSlcbiAgICAgICAgICAgICAgOiBlcnJvcltrZXldID09PSBmYWxzZVxuICAgICAgICAgICAgICAgID8gJ05vdCAnICsgYWRkU3BhY2VzKGtleSlcbiAgICAgICAgICAgICAgICA6IGFkZFNwYWNlcyhrZXkpICsgJzogJyArIGZvcm1hdEVycm9yKGVycm9yW2tleV0pXG4gICAgICAgICAgKVxuICAgICAgICAgIC5qb2luKCcsICcpXG4gICAgICAgIDogYWRkU3BhY2VzKGVycm9yLnRvU3RyaW5nKCkpO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG4gICAgcmV0dXJuIChcbiAgICAgIE9iamVjdC5rZXlzKGVycm9ycylcbiAgICAgICAgLy8gSGlkZSAncmVxdWlyZWQnIGVycm9yLCB1bmxlc3MgaXQgaXMgdGhlIG9ubHkgb25lXG4gICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgZXJyb3JLZXkgPT5cbiAgICAgICAgICAgIGVycm9yS2V5ICE9PSAncmVxdWlyZWQnIHx8IE9iamVjdC5rZXlzKGVycm9ycykubGVuZ3RoID09PSAxXG4gICAgICAgIClcbiAgICAgICAgLm1hcChlcnJvcktleSA9PlxuICAgICAgICAgIC8vIElmIHZhbGlkYXRpb25NZXNzYWdlcyBpcyBhIHN0cmluZywgcmV0dXJuIGl0XG4gICAgICAgICAgdHlwZW9mIHZhbGlkYXRpb25NZXNzYWdlcyA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gdmFsaWRhdGlvbk1lc3NhZ2VzXG4gICAgICAgICAgICA6IC8vIElmIGN1c3RvbSBlcnJvciBtZXNzYWdlIGlzIGEgZnVuY3Rpb24sIHJldHVybiBmdW5jdGlvbiByZXN1bHRcbiAgICAgICAgICAgIHR5cGVvZiB2YWxpZGF0aW9uTWVzc2FnZXNbZXJyb3JLZXldID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgID8gdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XShlcnJvcnNbZXJyb3JLZXldKVxuICAgICAgICAgICAgICA6IC8vIElmIGN1c3RvbSBlcnJvciBtZXNzYWdlIGlzIGEgc3RyaW5nLCByZXBsYWNlIHBsYWNlaG9sZGVycyBhbmQgcmV0dXJuXG4gICAgICAgICAgICAgIHR5cGVvZiB2YWxpZGF0aW9uTWVzc2FnZXNbZXJyb3JLZXldID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgID8gLy8gRG9lcyBlcnJvciBtZXNzYWdlIGhhdmUgYW55IHt7cHJvcGVydHl9fSBwbGFjZWhvbGRlcnM/XG4gICAgICAgICAgICAgICAgIS97ey4rP319Ly50ZXN0KHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV0pXG4gICAgICAgICAgICAgICAgICA/IHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV1cbiAgICAgICAgICAgICAgICAgIDogLy8gUmVwbGFjZSB7e3Byb3BlcnR5fX0gcGxhY2Vob2xkZXJzIHdpdGggdmFsdWVzXG4gICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhlcnJvcnNbZXJyb3JLZXldKS5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgIChlcnJvck1lc3NhZ2UsIGVycm9yUHJvcGVydHkpID0+XG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKCd7eycgKyBlcnJvclByb3BlcnR5ICsgJ319JywgJ2cnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yc1tlcnJvcktleV1bZXJyb3JQcm9wZXJ0eV1cbiAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uTWVzc2FnZXNbZXJyb3JLZXldXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgOiAvLyBJZiBubyBjdXN0b20gZXJyb3IgbWVzc2FnZSwgcmV0dXJuIGZvcm1hdHRlZCBlcnJvciBkYXRhIGluc3RlYWRcbiAgICAgICAgICAgICAgICBhZGRTcGFjZXMoZXJyb3JLZXkpICsgJyBFcnJvcjogJyArIGZvcm1hdEVycm9yKGVycm9yc1tlcnJvcktleV0pXG4gICAgICAgIClcbiAgICAgICAgLmpvaW4oJzxicj4nKVxuICAgICk7XG4gIH1cblxuICB1cGRhdGVWYWx1ZShjdHg6IGFueSwgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vIFNldCB2YWx1ZSBvZiBjdXJyZW50IGNvbnRyb2xcbiAgICBjdHguY29udHJvbFZhbHVlID0gdmFsdWU7XG4gICAgaWYgKGN0eC5ib3VuZENvbnRyb2wpIHtcbiAgICAgIGN0eC5mb3JtQ29udHJvbC5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICBjdHguZm9ybUNvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICB9XG4gICAgY3R4LmxheW91dE5vZGUudmFsdWUgPSB2YWx1ZTtcblxuICAgIC8vIFNldCB2YWx1ZXMgb2YgYW55IHJlbGF0ZWQgY29udHJvbHMgaW4gY29weVZhbHVlVG8gYXJyYXlcbiAgICBpZiAoaXNBcnJheShjdHgub3B0aW9ucy5jb3B5VmFsdWVUbykpIHtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBjdHgub3B0aW9ucy5jb3B5VmFsdWVUbykge1xuICAgICAgICBjb25zdCB0YXJnZXRDb250cm9sID0gZ2V0Q29udHJvbCh0aGlzLmZvcm1Hcm91cCwgaXRlbSk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBpc09iamVjdCh0YXJnZXRDb250cm9sKSAmJlxuICAgICAgICAgIHR5cGVvZiB0YXJnZXRDb250cm9sLnNldFZhbHVlID09PSAnZnVuY3Rpb24nXG4gICAgICAgICkge1xuICAgICAgICAgIHRhcmdldENvbnRyb2wuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICAgIHRhcmdldENvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUFycmF5Q2hlY2tib3hMaXN0KGN0eDogYW55LCBjaGVja2JveExpc3Q6IFRpdGxlTWFwSXRlbVtdKTogdm9pZCB7XG4gICAgY29uc3QgZm9ybUFycmF5ID0gPFVudHlwZWRGb3JtQXJyYXk+dGhpcy5nZXRGb3JtQ29udHJvbChjdHgpO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBleGlzdGluZyBpdGVtc1xuICAgIHdoaWxlIChmb3JtQXJyYXkudmFsdWUubGVuZ3RoKSB7XG4gICAgICBmb3JtQXJyYXkucmVtb3ZlQXQoMCk7XG4gICAgfVxuXG4gICAgLy8gUmUtYWRkIGFuIGl0ZW0gZm9yIGVhY2ggY2hlY2tlZCBib3hcbiAgICBjb25zdCByZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgIGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgIHRoaXMuZGF0YVJlY3Vyc2l2ZVJlZk1hcCxcbiAgICAgIHRoaXMuYXJyYXlNYXBcbiAgICApO1xuICAgIGZvciAoY29uc3QgY2hlY2tib3hJdGVtIG9mIGNoZWNrYm94TGlzdCkge1xuICAgICAgaWYgKGNoZWNrYm94SXRlbS5jaGVja2VkKSB7XG4gICAgICAgIGNvbnN0IG5ld0Zvcm1Db250cm9sID0gYnVpbGRGb3JtR3JvdXAoXG4gICAgICAgICAgdGhpcy50ZW1wbGF0ZVJlZkxpYnJhcnlbcmVmUG9pbnRlcl1cbiAgICAgICAgKTtcbiAgICAgICAgbmV3Rm9ybUNvbnRyb2wuc2V0VmFsdWUoY2hlY2tib3hJdGVtLnZhbHVlKTtcbiAgICAgICAgZm9ybUFycmF5LnB1c2gobmV3Rm9ybUNvbnRyb2wpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3JtQXJyYXkubWFya0FzRGlydHkoKTtcbiAgfVxuXG4gIGdldEZvcm1Db250cm9sKGN0eDogYW55KTogQWJzdHJhY3RDb250cm9sIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICBjdHgubGF5b3V0Tm9kZS50eXBlID09PSAnJHJlZidcbiAgICApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29udHJvbCh0aGlzLmZvcm1Hcm91cCwgdGhpcy5nZXREYXRhUG9pbnRlcihjdHgpKTtcbiAgfVxuXG4gIGdldEZvcm1Db250cm9sVmFsdWUoY3R4OiBhbnkpOiBBYnN0cmFjdENvbnRyb2wge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgIGN0eC5sYXlvdXROb2RlLnR5cGUgPT09ICckcmVmJ1xuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRyb2wgPSBnZXRDb250cm9sKHRoaXMuZm9ybUdyb3VwLCB0aGlzLmdldERhdGFQb2ludGVyKGN0eCkpO1xuICAgIHJldHVybiBjb250cm9sID8gY29udHJvbC52YWx1ZSA6IG51bGw7XG4gIH1cblxuICBnZXRGb3JtQ29udHJvbEdyb3VwKGN0eDogYW55KTogVW50eXBlZEZvcm1BcnJheSB8IFVudHlwZWRGb3JtR3JvdXAge1xuICAgIGlmICghY3R4LmxheW91dE5vZGUgfHwgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29udHJvbCh0aGlzLmZvcm1Hcm91cCwgdGhpcy5nZXREYXRhUG9pbnRlcihjdHgpLCB0cnVlKTtcbiAgfVxuXG4gIGdldEZvcm1Db250cm9sTmFtZShjdHg6IGFueSk6IHN0cmluZyB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8XG4gICAgICAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5kYXRhSW5kZXgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIEpzb25Qb2ludGVyLnRvS2V5KHRoaXMuZ2V0RGF0YVBvaW50ZXIoY3R4KSk7XG4gIH1cblxuICBnZXRMYXlvdXRBcnJheShjdHg6IGFueSk6IGFueVtdIHtcbiAgICByZXR1cm4gSnNvblBvaW50ZXIuZ2V0KHRoaXMubGF5b3V0LCB0aGlzLmdldExheW91dFBvaW50ZXIoY3R4KSwgMCwgLTEpO1xuICB9XG5cbiAgZ2V0UGFyZW50Tm9kZShjdHg6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIEpzb25Qb2ludGVyLmdldCh0aGlzLmxheW91dCwgdGhpcy5nZXRMYXlvdXRQb2ludGVyKGN0eCksIDAsIC0yKTtcbiAgfVxuXG4gIGdldERhdGFQb2ludGVyKGN0eDogYW55KTogc3RyaW5nIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleClcbiAgICApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gSnNvblBvaW50ZXIudG9JbmRleGVkUG9pbnRlcihcbiAgICAgIGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyLFxuICAgICAgY3R4LmRhdGFJbmRleCxcbiAgICAgIHRoaXMuYXJyYXlNYXBcbiAgICApO1xuICB9XG5cbiAgZ2V0TGF5b3V0UG9pbnRlcihjdHg6IGFueSk6IHN0cmluZyB7XG4gICAgaWYgKCFoYXNWYWx1ZShjdHgubGF5b3V0SW5kZXgpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuICcvJyArIGN0eC5sYXlvdXRJbmRleC5qb2luKCcvaXRlbXMvJyk7XG4gIH1cblxuICBpc0NvbnRyb2xCb3VuZChjdHg6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgICFoYXNWYWx1ZShjdHguZGF0YUluZGV4KVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBjb250cm9sR3JvdXAgPSB0aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KTtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5nZXRGb3JtQ29udHJvbE5hbWUoY3R4KTtcbiAgICByZXR1cm4gY29udHJvbEdyb3VwID8gaGFzT3duKGNvbnRyb2xHcm91cC5jb250cm9scywgbmFtZSkgOiBmYWxzZTtcbiAgfVxuXG4gIGFkZEl0ZW0oY3R4OiBhbnksIG5hbWU/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuJHJlZikgfHxcbiAgICAgICFoYXNWYWx1ZShjdHguZGF0YUluZGV4KSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleClcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgQW5ndWxhciBmb3JtIGNvbnRyb2wgZnJvbSBhIHRlbXBsYXRlIGluIHRlbXBsYXRlUmVmTGlicmFyeVxuICAgIGNvbnN0IG5ld0Zvcm1Hcm91cCA9IGJ1aWxkRm9ybUdyb3VwKFxuICAgICAgdGhpcy50ZW1wbGF0ZVJlZkxpYnJhcnlbY3R4LmxheW91dE5vZGUuJHJlZl1cbiAgICApO1xuXG4gICAgLy8gQWRkIHRoZSBuZXcgZm9ybSBjb250cm9sIHRvIHRoZSBwYXJlbnQgZm9ybUFycmF5IG9yIGZvcm1Hcm91cFxuICAgIGlmIChjdHgubGF5b3V0Tm9kZS5hcnJheUl0ZW0pIHtcbiAgICAgIC8vIEFkZCBuZXcgYXJyYXkgaXRlbSB0byBmb3JtQXJyYXlcbiAgICAgICg8VW50eXBlZEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KSkucHVzaChuZXdGb3JtR3JvdXApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBZGQgbmV3ICRyZWYgaXRlbSB0byBmb3JtR3JvdXBcbiAgICAgICg8VW50eXBlZEZvcm1Hcm91cD50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KSkuYWRkQ29udHJvbChcbiAgICAgICAgbmFtZSB8fCB0aGlzLmdldEZvcm1Db250cm9sTmFtZShjdHgpLFxuICAgICAgICBuZXdGb3JtR3JvdXBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ29weSBhIG5ldyBsYXlvdXROb2RlIGZyb20gbGF5b3V0UmVmTGlicmFyeVxuICAgIGNvbnN0IG5ld0xheW91dE5vZGUgPSBnZXRMYXlvdXROb2RlKGN0eC5sYXlvdXROb2RlLCB0aGlzKTtcbiAgICBuZXdMYXlvdXROb2RlLmFycmF5SXRlbSA9IGN0eC5sYXlvdXROb2RlLmFycmF5SXRlbTtcbiAgICBpZiAoY3R4LmxheW91dE5vZGUuYXJyYXlJdGVtVHlwZSkge1xuICAgICAgbmV3TGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlID0gY3R4LmxheW91dE5vZGUuYXJyYXlJdGVtVHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIG5ld0xheW91dE5vZGUuYXJyYXlJdGVtVHlwZTtcbiAgICB9XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIG5ld0xheW91dE5vZGUubmFtZSA9IG5hbWU7XG4gICAgICBuZXdMYXlvdXROb2RlLmRhdGFQb2ludGVyICs9ICcvJyArIEpzb25Qb2ludGVyLmVzY2FwZShuYW1lKTtcbiAgICAgIG5ld0xheW91dE5vZGUub3B0aW9ucy50aXRsZSA9IGZpeFRpdGxlKG5hbWUpO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgbmV3IGxheW91dE5vZGUgdG8gdGhlIGZvcm0gbGF5b3V0XG4gICAgSnNvblBvaW50ZXIuaW5zZXJ0KHRoaXMubGF5b3V0LCB0aGlzLmdldExheW91dFBvaW50ZXIoY3R4KSwgbmV3TGF5b3V0Tm9kZSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIG1vdmVBcnJheUl0ZW0oY3R4OiBhbnksIG9sZEluZGV4OiBudW1iZXIsIG5ld0luZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleCkgfHxcbiAgICAgICFoYXNWYWx1ZShjdHgubGF5b3V0SW5kZXgpIHx8XG4gICAgICAhaXNEZWZpbmVkKG9sZEluZGV4KSB8fFxuICAgICAgIWlzRGVmaW5lZChuZXdJbmRleCkgfHxcbiAgICAgIG9sZEluZGV4ID09PSBuZXdJbmRleFxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIE1vdmUgaXRlbSBpbiB0aGUgZm9ybUFycmF5XG4gICAgY29uc3QgZm9ybUFycmF5ID0gPFVudHlwZWRGb3JtQXJyYXk+dGhpcy5nZXRGb3JtQ29udHJvbEdyb3VwKGN0eCk7XG4gICAgY29uc3QgYXJyYXlJdGVtID0gZm9ybUFycmF5LmF0KG9sZEluZGV4KTtcbiAgICBmb3JtQXJyYXkucmVtb3ZlQXQob2xkSW5kZXgpO1xuICAgIGZvcm1BcnJheS5pbnNlcnQobmV3SW5kZXgsIGFycmF5SXRlbSk7XG4gICAgZm9ybUFycmF5LnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcblxuICAgIC8vIE1vdmUgbGF5b3V0IGl0ZW1cbiAgICBjb25zdCBsYXlvdXRBcnJheSA9IHRoaXMuZ2V0TGF5b3V0QXJyYXkoY3R4KTtcbiAgICBsYXlvdXRBcnJheS5zcGxpY2UobmV3SW5kZXgsIDAsIGxheW91dEFycmF5LnNwbGljZShvbGRJbmRleCwgMSlbMF0pO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVtb3ZlSXRlbShjdHg6IGFueSk6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgICFoYXNWYWx1ZShjdHguZGF0YUluZGV4KSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleClcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIEFuZ3VsYXIgZm9ybSBjb250cm9sIGZyb20gdGhlIHBhcmVudCBmb3JtQXJyYXkgb3IgZm9ybUdyb3VwXG4gICAgaWYgKGN0eC5sYXlvdXROb2RlLmFycmF5SXRlbSkge1xuICAgICAgLy8gUmVtb3ZlIGFycmF5IGl0ZW0gZnJvbSBmb3JtQXJyYXlcbiAgICAgICg8VW50eXBlZEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KSkucmVtb3ZlQXQoXG4gICAgICAgIGN0eC5kYXRhSW5kZXhbY3R4LmRhdGFJbmRleC5sZW5ndGggLSAxXVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVtb3ZlICRyZWYgaXRlbSBmcm9tIGZvcm1Hcm91cFxuICAgICAgKDxVbnR5cGVkRm9ybUdyb3VwPnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpKS5yZW1vdmVDb250cm9sKFxuICAgICAgICB0aGlzLmdldEZvcm1Db250cm9sTmFtZShjdHgpXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBsYXlvdXROb2RlIGZyb20gbGF5b3V0XG4gICAgSnNvblBvaW50ZXIucmVtb3ZlKHRoaXMubGF5b3V0LCB0aGlzLmdldExheW91dFBvaW50ZXIoY3R4KSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==