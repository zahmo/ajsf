import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import map from 'lodash/map';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { forEach, hasOwn } from './utility.functions';
import { getControlValidators, removeRecursiveReferences } from './json-schema.functions';
import { hasValue, inArray, isArray, isDate, isDefined, isEmpty, isObject, isPrimitive, toJavaScriptType, toSchemaType } from './validator.functions';
import { JsonPointer } from './jsonpointer.functions';
import { JsonValidators } from './json.validators';
/**
 * FormGroup function library:
 *
 * buildFormGroupTemplate:  Builds a FormGroupTemplate from schema
 *
 * buildFormGroup:          Builds an Angular FormGroup from a FormGroupTemplate
 *
 * mergeValues:
 *
 * setRequiredFields:
 *
 * formatFormData:
 *
 * getControl:
 *
 * ---- TODO: ----
 * TODO: add buildFormGroupTemplateFromLayout function
 * buildFormGroupTemplateFromLayout: Builds a FormGroupTemplate from a form layout
 */
/**
 * 'buildFormGroupTemplate' function
 *
 * Builds a template for an Angular FormGroup from a JSON Schema.
 *
 * TODO: add support for pattern properties
 * https://spacetelescope.github.io/understanding-json-schema/reference/object.html
 *
 * //  {any} jsf -
 * //  {any = null} nodeValue -
 * //  {boolean = true} mapArrays -
 * //  {string = ''} schemaPointer -
 * //  {string = ''} dataPointer -
 * //  {any = ''} templatePointer -
 * // {any} -
 */
export function buildFormGroupTemplate(jsf, nodeValue = null, setValues = true, schemaPointer = '', dataPointer = '', templatePointer = '') {
    const schema = JsonPointer.get(jsf.schema, schemaPointer);
    if (setValues) {
        if (!isDefined(nodeValue) && (jsf.formOptions.setSchemaDefaults === true ||
            (jsf.formOptions.setSchemaDefaults === 'auto' && isEmpty(jsf.formValues)))) {
            nodeValue = JsonPointer.get(jsf.schema, schemaPointer + '/default');
        }
    }
    else {
        nodeValue = null;
    }
    // TODO: If nodeValue still not set, check layout for default value
    const schemaType = JsonPointer.get(schema, '/type');
    const controlType = (hasOwn(schema, 'properties') || hasOwn(schema, 'additionalProperties')) &&
        schemaType === 'object' ? 'FormGroup' :
        (hasOwn(schema, 'items') || hasOwn(schema, 'additionalItems')) &&
            schemaType === 'array' ? 'FormArray' :
            !schemaType && hasOwn(schema, '$ref') ? '$ref' : 'FormControl';
    const shortDataPointer = removeRecursiveReferences(dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
    if (!jsf.dataMap.has(shortDataPointer)) {
        jsf.dataMap.set(shortDataPointer, new Map());
    }
    const nodeOptions = jsf.dataMap.get(shortDataPointer);
    if (!nodeOptions.has('schemaType')) {
        nodeOptions.set('schemaPointer', schemaPointer);
        nodeOptions.set('schemaType', schema.type);
        if (schema.format) {
            nodeOptions.set('schemaFormat', schema.format);
            if (!schema.type) {
                nodeOptions.set('schemaType', 'string');
            }
        }
        if (controlType) {
            nodeOptions.set('templatePointer', templatePointer);
            nodeOptions.set('templateType', controlType);
        }
    }
    let controls;
    const validators = getControlValidators(schema);
    switch (controlType) {
        case 'FormGroup':
            controls = {};
            if (hasOwn(schema, 'ui:order') || hasOwn(schema, 'properties')) {
                const propertyKeys = schema['ui:order'] || Object.keys(schema.properties);
                if (propertyKeys.includes('*') && !hasOwn(schema.properties, '*')) {
                    const unnamedKeys = Object.keys(schema.properties)
                        .filter(key => !propertyKeys.includes(key));
                    for (let i = propertyKeys.length - 1; i >= 0; i--) {
                        if (propertyKeys[i] === '*') {
                            propertyKeys.splice(i, 1, ...unnamedKeys);
                        }
                    }
                }
                propertyKeys
                    .filter(key => hasOwn(schema.properties, key) ||
                    hasOwn(schema, 'additionalProperties'))
                    .forEach(key => controls[key] = buildFormGroupTemplate(jsf, JsonPointer.get(nodeValue, [key]), setValues, schemaPointer + (hasOwn(schema.properties, key) ?
                    '/properties/' + key : '/additionalProperties'), dataPointer + '/' + key, templatePointer + '/controls/' + key));
                jsf.formOptions.fieldsRequired = setRequiredFields(schema, controls);
            }
            return { controlType, controls, validators };
        case 'FormArray':
            controls = [];
            const minItems = Math.max(schema.minItems || 0, nodeOptions.get('minItems') || 0);
            const maxItems = Math.min(schema.maxItems || 1000, nodeOptions.get('maxItems') || 1000);
            let additionalItemsPointer = null;
            if (isArray(schema.items)) { // 'items' is an array = tuple items
                const tupleItems = nodeOptions.get('tupleItems') ||
                    (isArray(schema.items) ? Math.min(schema.items.length, maxItems) : 0);
                for (let i = 0; i < tupleItems; i++) {
                    if (i < minItems) {
                        controls.push(buildFormGroupTemplate(jsf, isArray(nodeValue) ? nodeValue[i] : nodeValue, setValues, schemaPointer + '/items/' + i, dataPointer + '/' + i, templatePointer + '/controls/' + i));
                    }
                    else {
                        const schemaRefPointer = removeRecursiveReferences(schemaPointer + '/items/' + i, jsf.schemaRecursiveRefMap);
                        const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/' + i, jsf.dataRecursiveRefMap, jsf.arrayMap);
                        const itemRecursive = itemRefPointer !== shortDataPointer + '/' + i;
                        if (!hasOwn(jsf.templateRefLibrary, itemRefPointer)) {
                            jsf.templateRefLibrary[itemRefPointer] = null;
                            jsf.templateRefLibrary[itemRefPointer] = buildFormGroupTemplate(jsf, null, setValues, schemaRefPointer, itemRefPointer, templatePointer + '/controls/' + i);
                        }
                        controls.push(isArray(nodeValue) ?
                            buildFormGroupTemplate(jsf, nodeValue[i], setValues, schemaPointer + '/items/' + i, dataPointer + '/' + i, templatePointer + '/controls/' + i) :
                            itemRecursive ?
                                null : cloneDeep(jsf.templateRefLibrary[itemRefPointer]));
                    }
                }
                // If 'additionalItems' is an object = additional list items (after tuple items)
                if (schema.items.length < maxItems && isObject(schema.additionalItems)) {
                    additionalItemsPointer = schemaPointer + '/additionalItems';
                }
                // If 'items' is an object = list items only (no tuple items)
            }
            else {
                additionalItemsPointer = schemaPointer + '/items';
            }
            if (additionalItemsPointer) {
                const schemaRefPointer = removeRecursiveReferences(additionalItemsPointer, jsf.schemaRecursiveRefMap);
                const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
                const itemRecursive = itemRefPointer !== shortDataPointer + '/-';
                if (!hasOwn(jsf.templateRefLibrary, itemRefPointer)) {
                    jsf.templateRefLibrary[itemRefPointer] = null;
                    jsf.templateRefLibrary[itemRefPointer] = buildFormGroupTemplate(jsf, null, setValues, schemaRefPointer, itemRefPointer, templatePointer + '/controls/-');
                }
                // const itemOptions = jsf.dataMap.get(itemRefPointer) || new Map();
                const itemOptions = nodeOptions;
                if (!itemRecursive || hasOwn(validators, 'required')) {
                    const arrayLength = Math.min(Math.max(itemRecursive ? 0 :
                        (itemOptions.get('tupleItems') + itemOptions.get('listItems')) || 0, isArray(nodeValue) ? nodeValue.length : 0), maxItems);
                    for (let i = controls.length; i < arrayLength; i++) {
                        controls.push(isArray(nodeValue) ?
                            buildFormGroupTemplate(jsf, nodeValue[i], setValues, schemaRefPointer, dataPointer + '/-', templatePointer + '/controls/-') :
                            itemRecursive ?
                                null : cloneDeep(jsf.templateRefLibrary[itemRefPointer]));
                    }
                }
            }
            return { controlType, controls, validators };
        case '$ref':
            const schemaRef = JsonPointer.compile(schema.$ref);
            const dataRef = JsonPointer.toDataPointer(schemaRef, schema);
            const refPointer = removeRecursiveReferences(dataRef, jsf.dataRecursiveRefMap, jsf.arrayMap);
            if (refPointer && !hasOwn(jsf.templateRefLibrary, refPointer)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.templateRefLibrary[refPointer] = null;
                const newTemplate = buildFormGroupTemplate(jsf, setValues, setValues, schemaRef);
                if (newTemplate) {
                    jsf.templateRefLibrary[refPointer] = newTemplate;
                }
                else {
                    delete jsf.templateRefLibrary[refPointer];
                }
            }
            return null;
        case 'FormControl':
            const value = {
                value: setValues && isPrimitive(nodeValue) ? nodeValue : null,
                disabled: nodeOptions.get('disabled') || false
            };
            return { controlType, value, validators };
        default:
            return null;
    }
}
/**
 * 'buildFormGroup' function
 *
 * // {any} template -
 * // {AbstractControl}
*/
export function buildFormGroup(template) {
    const validatorFns = [];
    let validatorFn = null;
    if (hasOwn(template, 'validators')) {
        forEach(template.validators, (parameters, validator) => {
            if (typeof JsonValidators[validator] === 'function') {
                validatorFns.push(JsonValidators[validator].apply(null, parameters));
            }
        });
        if (validatorFns.length &&
            inArray(template.controlType, ['FormGroup', 'FormArray'])) {
            validatorFn = validatorFns.length > 1 ?
                JsonValidators.compose(validatorFns) : validatorFns[0];
        }
    }
    if (hasOwn(template, 'controlType')) {
        switch (template.controlType) {
            case 'FormGroup':
                const groupControls = {};
                forEach(template.controls, (controls, key) => {
                    const newControl = buildFormGroup(controls);
                    if (newControl) {
                        groupControls[key] = newControl;
                    }
                });
                return new UntypedFormGroup(groupControls, validatorFn);
            case 'FormArray':
                return new UntypedFormArray(filter(map(template.controls, controls => buildFormGroup(controls))), validatorFn);
            case 'FormControl':
                return new UntypedFormControl(template.value, validatorFns);
        }
    }
    return null;
}
/**
 * 'mergeValues' function
 *
 * //  {any[]} ...valuesToMerge - Multiple values to merge
 * // {any} - Merged values
 */
export function mergeValues(...valuesToMerge) {
    let mergedValues = null;
    for (const currentValue of valuesToMerge) {
        if (!isEmpty(currentValue)) {
            if (typeof currentValue === 'object' &&
                (isEmpty(mergedValues) || typeof mergedValues !== 'object')) {
                if (isArray(currentValue)) {
                    mergedValues = [...currentValue];
                }
                else if (isObject(currentValue)) {
                    mergedValues = { ...currentValue };
                }
            }
            else if (typeof currentValue !== 'object') {
                mergedValues = currentValue;
            }
            else if (isObject(mergedValues) && isObject(currentValue)) {
                Object.assign(mergedValues, currentValue);
            }
            else if (isObject(mergedValues) && isArray(currentValue)) {
                const newValues = [];
                for (const value of currentValue) {
                    newValues.push(mergeValues(mergedValues, value));
                }
                mergedValues = newValues;
            }
            else if (isArray(mergedValues) && isObject(currentValue)) {
                const newValues = [];
                for (const value of mergedValues) {
                    newValues.push(mergeValues(value, currentValue));
                }
                mergedValues = newValues;
            }
            else if (isArray(mergedValues) && isArray(currentValue)) {
                const newValues = [];
                for (let i = 0; i < Math.max(mergedValues.length, currentValue.length); i++) {
                    if (i < mergedValues.length && i < currentValue.length) {
                        newValues.push(mergeValues(mergedValues[i], currentValue[i]));
                    }
                    else if (i < mergedValues.length) {
                        newValues.push(mergedValues[i]);
                    }
                    else if (i < currentValue.length) {
                        newValues.push(currentValue[i]);
                    }
                }
                mergedValues = newValues;
            }
        }
    }
    return mergedValues;
}
/**
 * 'setRequiredFields' function
 *
 * // {schema} schema - JSON Schema
 * // {object} formControlTemplate - Form Control Template object
 * // {boolean} - true if any fields have been set to required, false if not
 */
export function setRequiredFields(schema, formControlTemplate) {
    let fieldsRequired = false;
    if (hasOwn(schema, 'required') && !isEmpty(schema.required)) {
        fieldsRequired = true;
        let requiredArray = isArray(schema.required) ? schema.required : [schema.required];
        requiredArray = forEach(requiredArray, key => JsonPointer.set(formControlTemplate, '/' + key + '/validators/required', []));
    }
    return fieldsRequired;
    // TODO: Add support for patternProperties
    // https://spacetelescope.github.io/understanding-json-schema/reference/object.html#pattern-properties
}
/**
 * 'formatFormData' function
 *
 * // {any} formData - Angular FormGroup data object
 * // {Map<string, any>} dataMap -
 * // {Map<string, string>} recursiveRefMap -
 * // {Map<string, number>} arrayMap -
 * // {boolean = false} fixErrors - if TRUE, tries to fix data
 * // {any} - formatted data object
 */
export function formatFormData(formData, dataMap, recursiveRefMap, arrayMap, returnEmptyFields = false, fixErrors = false) {
    if (formData === null || typeof formData !== 'object') {
        return formData;
    }
    const formattedData = isArray(formData) ? [] : {};
    JsonPointer.forEachDeep(formData, (value, dataPointer) => {
        // If returnEmptyFields === true,
        // add empty arrays and objects to all allowed keys
        if (returnEmptyFields && isArray(value)) {
            JsonPointer.set(formattedData, dataPointer, []);
        }
        else if (returnEmptyFields && isObject(value) && !isDate(value)) {
            JsonPointer.set(formattedData, dataPointer, {});
        }
        else {
            const genericPointer = JsonPointer.has(dataMap, [dataPointer, 'schemaType']) ? dataPointer :
                removeRecursiveReferences(dataPointer, recursiveRefMap, arrayMap);
            if (JsonPointer.has(dataMap, [genericPointer, 'schemaType'])) {
                const schemaType = dataMap.get(genericPointer).get('schemaType');
                if (schemaType === 'null') {
                    JsonPointer.set(formattedData, dataPointer, null);
                }
                else if ((hasValue(value) || returnEmptyFields) &&
                    inArray(schemaType, ['string', 'integer', 'number', 'boolean'])) {
                    const newValue = (fixErrors || (value === null && returnEmptyFields)) ?
                        toSchemaType(value, schemaType) : toJavaScriptType(value, schemaType);
                    if (isDefined(newValue) || returnEmptyFields) {
                        JsonPointer.set(formattedData, dataPointer, newValue);
                    }
                }
                // Finish incomplete 'date-time' entries
                if (dataMap.get(genericPointer).get('schemaFormat') === 'date-time') {
                    // "2000-03-14T01:59:26.535" -> "2000-03-14T01:59:26.535Z" (add "Z")
                    if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}Z`);
                        // "2000-03-14T01:59" -> "2000-03-14T01:59:00Z" (add ":00Z")
                    }
                    else if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}:00Z`);
                        // "2000-03-14" -> "2000-03-14T00:00:00Z" (add "T00:00:00Z")
                    }
                    else if (fixErrors && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}:00:00:00Z`);
                    }
                }
            }
            else if (typeof value !== 'object' || isDate(value) ||
                (value === null && returnEmptyFields)) {
                console.error('formatFormData error: ' +
                    `Schema type not found for form value at ${genericPointer}`);
                console.error('dataMap', dataMap);
                console.error('recursiveRefMap', recursiveRefMap);
                console.error('genericPointer', genericPointer);
            }
        }
    });
    return formattedData;
}
/**
 * 'getControl' function
 *
 * Uses a JSON Pointer for a data object to retrieve a control from
 * an Angular formGroup or formGroup template. (Note: though a formGroup
 * template is much simpler, its basic structure is idential to a formGroup).
 *
 * If the optional third parameter 'returnGroup' is set to TRUE, the group
 * containing the control is returned, rather than the control itself.
 *
 * // {FormGroup} formGroup - Angular FormGroup to get value from
 * // {Pointer} dataPointer - JSON Pointer (string or array)
 * // {boolean = false} returnGroup - If true, return group containing control
 * // {group} - Located value (or null, if no control found)
 */
export function getControl(formGroup, dataPointer, returnGroup = false) {
    if (!isObject(formGroup) || !JsonPointer.isJsonPointer(dataPointer)) {
        if (!JsonPointer.isJsonPointer(dataPointer)) {
            // If dataPointer input is not a valid JSON pointer, check to
            // see if it is instead a valid object path, using dot notaion
            if (typeof dataPointer === 'string') {
                const formControl = formGroup.get(dataPointer);
                if (formControl) {
                    return formControl;
                }
            }
            console.error(`getControl error: Invalid JSON Pointer: ${dataPointer}`);
        }
        if (!isObject(formGroup)) {
            console.error(`getControl error: Invalid formGroup: ${formGroup}`);
        }
        return null;
    }
    let dataPointerArray = JsonPointer.parse(dataPointer);
    if (returnGroup) {
        dataPointerArray = dataPointerArray.slice(0, -1);
    }
    // If formGroup input is a real formGroup (not a formGroup template)
    // try using formGroup.get() to return the control
    if (typeof formGroup.get === 'function' &&
        dataPointerArray.every(key => key.indexOf('.') === -1)) {
        const formControl = formGroup.get(dataPointerArray.join('.'));
        if (formControl) {
            return formControl;
        }
    }
    // If formGroup input is a formGroup template,
    // or formGroup.get() failed to return the control,
    // search the formGroup object for dataPointer's control
    let subGroup = formGroup;
    for (const key of dataPointerArray) {
        if (hasOwn(subGroup, 'controls')) {
            subGroup = subGroup.controls;
        }
        if (isArray(subGroup) && (key === '-')) {
            subGroup = subGroup[subGroup.length - 1];
        }
        else if (hasOwn(subGroup, key)) {
            subGroup = subGroup[key];
        }
        else {
            console.error(`getControl error: Unable to find "${key}" item in FormGroup.`);
            console.error(dataPointer);
            console.error(formGroup);
            return;
        }
    }
    return subGroup;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1ncm91cC5mdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1jb3JlL3NyYy9saWIvc2hhcmVkL2Zvcm0tZ3JvdXAuZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sU0FBUyxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sTUFBTSxNQUFNLGVBQWUsQ0FBQztBQUNuQyxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUM7QUFDN0IsT0FBTyxFQUVMLGdCQUFnQixFQUNoQixrQkFBa0IsRUFDbEIsZ0JBQWdCLEVBRWpCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUMxRixPQUFPLEVBQ0wsUUFBUSxFQUNSLE9BQU8sRUFDUCxPQUFPLEVBQ1AsTUFBTSxFQUNOLFNBQVMsRUFDVCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFdBQVcsRUFFWCxnQkFBZ0IsRUFDaEIsWUFBWSxFQUNiLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFFLFdBQVcsRUFBVyxNQUFNLHlCQUF5QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUluRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBRUg7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBQ0gsTUFBTSxVQUFVLHNCQUFzQixDQUNwQyxHQUFRLEVBQUUsWUFBaUIsSUFBSSxFQUFFLFNBQVMsR0FBRyxJQUFJLEVBQ2pELGFBQWEsR0FBRyxFQUFFLEVBQUUsV0FBVyxHQUFHLEVBQUUsRUFBRSxlQUFlLEdBQUcsRUFBRTtJQUUxRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLEdB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QUFHLFNBQVMsQ0FBQztJQUN6QixLQUFLLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixFQUFFO1FBQ2xDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUFFLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO1NBQUU7UUFDbkUsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDdEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzFDO2FBQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ2hDLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUI7YUFBTTtZQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztZQUM5RSxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekIsT0FBTztTQUNSO0tBQ0Y7SUFDRCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNsb25lRGVlcCBmcm9tICdsb2Rhc2gvY2xvbmVEZWVwJztcbmltcG9ydCBmaWx0ZXIgZnJvbSAnbG9kYXNoL2ZpbHRlcic7XG5pbXBvcnQgbWFwIGZyb20gJ2xvZGFzaC9tYXAnO1xuaW1wb3J0IHtcbiAgQWJzdHJhY3RDb250cm9sLFxuICBVbnR5cGVkRm9ybUFycmF5LFxuICBVbnR5cGVkRm9ybUNvbnRyb2wsXG4gIFVudHlwZWRGb3JtR3JvdXAsXG4gIFZhbGlkYXRvckZuXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IGZvckVhY2gsIGhhc093biB9IGZyb20gJy4vdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgZ2V0Q29udHJvbFZhbGlkYXRvcnMsIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMgfSBmcm9tICcuL2pzb24tc2NoZW1hLmZ1bmN0aW9ucyc7XG5pbXBvcnQge1xuICBoYXNWYWx1ZSxcbiAgaW5BcnJheSxcbiAgaXNBcnJheSxcbiAgaXNEYXRlLFxuICBpc0RlZmluZWQsXG4gIGlzRW1wdHksXG4gIGlzT2JqZWN0LFxuICBpc1ByaW1pdGl2ZSxcbiAgU2NoZW1hUHJpbWl0aXZlVHlwZSxcbiAgdG9KYXZhU2NyaXB0VHlwZSxcbiAgdG9TY2hlbWFUeXBlXG59IGZyb20gJy4vdmFsaWRhdG9yLmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBKc29uUG9pbnRlciwgUG9pbnRlciB9IGZyb20gJy4vanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25WYWxpZGF0b3JzIH0gZnJvbSAnLi9qc29uLnZhbGlkYXRvcnMnO1xuXG5cblxuLyoqXG4gKiBGb3JtR3JvdXAgZnVuY3Rpb24gbGlicmFyeTpcbiAqXG4gKiBidWlsZEZvcm1Hcm91cFRlbXBsYXRlOiAgQnVpbGRzIGEgRm9ybUdyb3VwVGVtcGxhdGUgZnJvbSBzY2hlbWFcbiAqXG4gKiBidWlsZEZvcm1Hcm91cDogICAgICAgICAgQnVpbGRzIGFuIEFuZ3VsYXIgRm9ybUdyb3VwIGZyb20gYSBGb3JtR3JvdXBUZW1wbGF0ZVxuICpcbiAqIG1lcmdlVmFsdWVzOlxuICpcbiAqIHNldFJlcXVpcmVkRmllbGRzOlxuICpcbiAqIGZvcm1hdEZvcm1EYXRhOlxuICpcbiAqIGdldENvbnRyb2w6XG4gKlxuICogLS0tLSBUT0RPOiAtLS0tXG4gKiBUT0RPOiBhZGQgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZUZyb21MYXlvdXQgZnVuY3Rpb25cbiAqIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGVGcm9tTGF5b3V0OiBCdWlsZHMgYSBGb3JtR3JvdXBUZW1wbGF0ZSBmcm9tIGEgZm9ybSBsYXlvdXRcbiAqL1xuXG4vKipcbiAqICdidWlsZEZvcm1Hcm91cFRlbXBsYXRlJyBmdW5jdGlvblxuICpcbiAqIEJ1aWxkcyBhIHRlbXBsYXRlIGZvciBhbiBBbmd1bGFyIEZvcm1Hcm91cCBmcm9tIGEgSlNPTiBTY2hlbWEuXG4gKlxuICogVE9ETzogYWRkIHN1cHBvcnQgZm9yIHBhdHRlcm4gcHJvcGVydGllc1xuICogaHR0cHM6Ly9zcGFjZXRlbGVzY29wZS5naXRodWIuaW8vdW5kZXJzdGFuZGluZy1qc29uLXNjaGVtYS9yZWZlcmVuY2Uvb2JqZWN0Lmh0bWxcbiAqXG4gKiAvLyAge2FueX0ganNmIC1cbiAqIC8vICB7YW55ID0gbnVsbH0gbm9kZVZhbHVlIC1cbiAqIC8vICB7Ym9vbGVhbiA9IHRydWV9IG1hcEFycmF5cyAtXG4gKiAvLyAge3N0cmluZyA9ICcnfSBzY2hlbWFQb2ludGVyIC1cbiAqIC8vICB7c3RyaW5nID0gJyd9IGRhdGFQb2ludGVyIC1cbiAqIC8vICB7YW55ID0gJyd9IHRlbXBsYXRlUG9pbnRlciAtXG4gKiAvLyB7YW55fSAtXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICBqc2Y6IGFueSwgbm9kZVZhbHVlOiBhbnkgPSBudWxsLCBzZXRWYWx1ZXMgPSB0cnVlLFxuICBzY2hlbWFQb2ludGVyID0gJycsIGRhdGFQb2ludGVyID0gJycsIHRlbXBsYXRlUG9pbnRlciA9ICcnXG4pIHtcbiAgY29uc3Qgc2NoZW1hID0gSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIpO1xuICBpZiAoc2V0VmFsdWVzKSB7XG4gICAgaWYgKCFpc0RlZmluZWQobm9kZVZhbHVlKSAmJiAoXG4gICAgICBqc2YuZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgPT09IHRydWUgfHxcbiAgICAgIChqc2YuZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgPT09ICdhdXRvJyAmJiBpc0VtcHR5KGpzZi5mb3JtVmFsdWVzKSlcbiAgICApKSB7XG4gICAgICBub2RlVmFsdWUgPSBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciArICcvZGVmYXVsdCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBub2RlVmFsdWUgPSBudWxsO1xuICB9XG4gIC8vIFRPRE86IElmIG5vZGVWYWx1ZSBzdGlsbCBub3Qgc2V0LCBjaGVjayBsYXlvdXQgZm9yIGRlZmF1bHQgdmFsdWVcbiAgY29uc3Qgc2NoZW1hVHlwZTogc3RyaW5nIHwgc3RyaW5nW10gPSBKc29uUG9pbnRlci5nZXQoc2NoZW1hLCAnL3R5cGUnKTtcbiAgY29uc3QgY29udHJvbFR5cGUgPVxuICAgIChoYXNPd24oc2NoZW1hLCAncHJvcGVydGllcycpIHx8IGhhc093bihzY2hlbWEsICdhZGRpdGlvbmFsUHJvcGVydGllcycpKSAmJlxuICAgICAgc2NoZW1hVHlwZSA9PT0gJ29iamVjdCcgPyAnRm9ybUdyb3VwJyA6XG4gICAgICAoaGFzT3duKHNjaGVtYSwgJ2l0ZW1zJykgfHwgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxJdGVtcycpKSAmJlxuICAgICAgICBzY2hlbWFUeXBlID09PSAnYXJyYXknID8gJ0Zvcm1BcnJheScgOlxuICAgICAgICAhc2NoZW1hVHlwZSAmJiBoYXNPd24oc2NoZW1hLCAnJHJlZicpID8gJyRyZWYnIDogJ0Zvcm1Db250cm9sJztcbiAgY29uc3Qgc2hvcnREYXRhUG9pbnRlciA9XG4gICAgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhkYXRhUG9pbnRlciwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcCk7XG4gIGlmICghanNmLmRhdGFNYXAuaGFzKHNob3J0RGF0YVBvaW50ZXIpKSB7XG4gICAganNmLmRhdGFNYXAuc2V0KHNob3J0RGF0YVBvaW50ZXIsIG5ldyBNYXAoKSk7XG4gIH1cbiAgY29uc3Qgbm9kZU9wdGlvbnMgPSBqc2YuZGF0YU1hcC5nZXQoc2hvcnREYXRhUG9pbnRlcik7XG4gIGlmICghbm9kZU9wdGlvbnMuaGFzKCdzY2hlbWFUeXBlJykpIHtcbiAgICBub2RlT3B0aW9ucy5zZXQoJ3NjaGVtYVBvaW50ZXInLCBzY2hlbWFQb2ludGVyKTtcbiAgICBub2RlT3B0aW9ucy5zZXQoJ3NjaGVtYVR5cGUnLCBzY2hlbWEudHlwZSk7XG4gICAgaWYgKHNjaGVtYS5mb3JtYXQpIHtcbiAgICAgIG5vZGVPcHRpb25zLnNldCgnc2NoZW1hRm9ybWF0Jywgc2NoZW1hLmZvcm1hdCk7XG4gICAgICBpZiAoIXNjaGVtYS50eXBlKSB7IG5vZGVPcHRpb25zLnNldCgnc2NoZW1hVHlwZScsICdzdHJpbmcnKTsgfVxuICAgIH1cbiAgICBpZiAoY29udHJvbFR5cGUpIHtcbiAgICAgIG5vZGVPcHRpb25zLnNldCgndGVtcGxhdGVQb2ludGVyJywgdGVtcGxhdGVQb2ludGVyKTtcbiAgICAgIG5vZGVPcHRpb25zLnNldCgndGVtcGxhdGVUeXBlJywgY29udHJvbFR5cGUpO1xuICAgIH1cbiAgfVxuICBsZXQgY29udHJvbHM6IGFueTtcbiAgY29uc3QgdmFsaWRhdG9ycyA9IGdldENvbnRyb2xWYWxpZGF0b3JzKHNjaGVtYSk7XG4gIHN3aXRjaCAoY29udHJvbFR5cGUpIHtcblxuICAgIGNhc2UgJ0Zvcm1Hcm91cCc6XG4gICAgICBjb250cm9scyA9IHt9O1xuICAgICAgaWYgKGhhc093bihzY2hlbWEsICd1aTpvcmRlcicpIHx8IGhhc093bihzY2hlbWEsICdwcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHlLZXlzID0gc2NoZW1hWyd1aTpvcmRlciddIHx8IE9iamVjdC5rZXlzKHNjaGVtYS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgaWYgKHByb3BlcnR5S2V5cy5pbmNsdWRlcygnKicpICYmICFoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsICcqJykpIHtcbiAgICAgICAgICBjb25zdCB1bm5hbWVkS2V5cyA9IE9iamVjdC5rZXlzKHNjaGVtYS5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4gIXByb3BlcnR5S2V5cy5pbmNsdWRlcyhrZXkpKTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gcHJvcGVydHlLZXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAocHJvcGVydHlLZXlzW2ldID09PSAnKicpIHtcbiAgICAgICAgICAgICAgcHJvcGVydHlLZXlzLnNwbGljZShpLCAxLCAuLi51bm5hbWVkS2V5cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHByb3BlcnR5S2V5c1xuICAgICAgICAgIC5maWx0ZXIoa2V5ID0+IGhhc093bihzY2hlbWEucHJvcGVydGllcywga2V5KSB8fFxuICAgICAgICAgICAgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJylcbiAgICAgICAgICApXG4gICAgICAgICAgLmZvckVhY2goa2V5ID0+IGNvbnRyb2xzW2tleV0gPSBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAganNmLCBKc29uUG9pbnRlci5nZXQobm9kZVZhbHVlLCBbPHN0cmluZz5rZXldKSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgc2NoZW1hUG9pbnRlciArIChoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsIGtleSkgP1xuICAgICAgICAgICAgICAnL3Byb3BlcnRpZXMvJyArIGtleSA6ICcvYWRkaXRpb25hbFByb3BlcnRpZXMnXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBrZXksXG4gICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBrZXlcbiAgICAgICAgICApKTtcbiAgICAgICAganNmLmZvcm1PcHRpb25zLmZpZWxkc1JlcXVpcmVkID0gc2V0UmVxdWlyZWRGaWVsZHMoc2NoZW1hLCBjb250cm9scyk7XG4gICAgICB9XG4gICAgICByZXR1cm4geyBjb250cm9sVHlwZSwgY29udHJvbHMsIHZhbGlkYXRvcnMgfTtcblxuICAgIGNhc2UgJ0Zvcm1BcnJheSc6XG4gICAgICBjb250cm9scyA9IFtdO1xuICAgICAgY29uc3QgbWluSXRlbXMgPVxuICAgICAgICBNYXRoLm1heChzY2hlbWEubWluSXRlbXMgfHwgMCwgbm9kZU9wdGlvbnMuZ2V0KCdtaW5JdGVtcycpIHx8IDApO1xuICAgICAgY29uc3QgbWF4SXRlbXMgPVxuICAgICAgICBNYXRoLm1pbihzY2hlbWEubWF4SXRlbXMgfHwgMTAwMCwgbm9kZU9wdGlvbnMuZ2V0KCdtYXhJdGVtcycpIHx8IDEwMDApO1xuICAgICAgbGV0IGFkZGl0aW9uYWxJdGVtc1BvaW50ZXI6IHN0cmluZyA9IG51bGw7XG4gICAgICBpZiAoaXNBcnJheShzY2hlbWEuaXRlbXMpKSB7IC8vICdpdGVtcycgaXMgYW4gYXJyYXkgPSB0dXBsZSBpdGVtc1xuICAgICAgICBjb25zdCB0dXBsZUl0ZW1zID0gbm9kZU9wdGlvbnMuZ2V0KCd0dXBsZUl0ZW1zJykgfHxcbiAgICAgICAgICAoaXNBcnJheShzY2hlbWEuaXRlbXMpID8gTWF0aC5taW4oc2NoZW1hLml0ZW1zLmxlbmd0aCwgbWF4SXRlbXMpIDogMCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHVwbGVJdGVtczsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgPCBtaW5JdGVtcykge1xuICAgICAgICAgICAgY29udHJvbHMucHVzaChidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAgICBqc2YsIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtpXSA6IG5vZGVWYWx1ZSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgJy9pdGVtcy8nICsgaSxcbiAgICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBpXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hUmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyAnL2l0ZW1zLycgKyBpLCBqc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgaXRlbVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgICAgICBzaG9ydERhdGFQb2ludGVyICsgJy8nICsgaSwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1SZWN1cnNpdmUgPSBpdGVtUmVmUG9pbnRlciAhPT0gc2hvcnREYXRhUG9pbnRlciArICcvJyArIGk7XG4gICAgICAgICAgICBpZiAoIWhhc093bihqc2YudGVtcGxhdGVSZWZMaWJyYXJ5LCBpdGVtUmVmUG9pbnRlcikpIHtcbiAgICAgICAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBudWxsO1xuICAgICAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAganNmLCBudWxsLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgc2NoZW1hUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgICBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBpXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICBpc0FycmF5KG5vZGVWYWx1ZSkgP1xuICAgICAgICAgICAgICAgIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICBqc2YsIG5vZGVWYWx1ZVtpXSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgICAgICAgc2NoZW1hUG9pbnRlciArICcvaXRlbXMvJyArIGksXG4gICAgICAgICAgICAgICAgICBkYXRhUG9pbnRlciArICcvJyArIGksXG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLycgKyBpXG4gICAgICAgICAgICAgICAgKSA6XG4gICAgICAgICAgICAgICAgaXRlbVJlY3Vyc2l2ZSA/XG4gICAgICAgICAgICAgICAgICBudWxsIDogY2xvbmVEZWVwKGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiAnYWRkaXRpb25hbEl0ZW1zJyBpcyBhbiBvYmplY3QgPSBhZGRpdGlvbmFsIGxpc3QgaXRlbXMgKGFmdGVyIHR1cGxlIGl0ZW1zKVxuICAgICAgICBpZiAoc2NoZW1hLml0ZW1zLmxlbmd0aCA8IG1heEl0ZW1zICYmIGlzT2JqZWN0KHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpKSB7XG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zUG9pbnRlciA9IHNjaGVtYVBvaW50ZXIgKyAnL2FkZGl0aW9uYWxJdGVtcyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiAnaXRlbXMnIGlzIGFuIG9iamVjdCA9IGxpc3QgaXRlbXMgb25seSAobm8gdHVwbGUgaXRlbXMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRpdGlvbmFsSXRlbXNQb2ludGVyID0gc2NoZW1hUG9pbnRlciArICcvaXRlbXMnO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWRkaXRpb25hbEl0ZW1zUG9pbnRlcikge1xuICAgICAgICBjb25zdCBzY2hlbWFSZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXNQb2ludGVyLCBqc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGl0ZW1SZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICBzaG9ydERhdGFQb2ludGVyICsgJy8tJywganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpdGVtUmVjdXJzaXZlID0gaXRlbVJlZlBvaW50ZXIgIT09IHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nO1xuICAgICAgICBpZiAoIWhhc093bihqc2YudGVtcGxhdGVSZWZMaWJyYXJ5LCBpdGVtUmVmUG9pbnRlcikpIHtcbiAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IG51bGw7XG4gICAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKFxuICAgICAgICAgICAganNmLCBudWxsLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICBzY2hlbWFSZWZQb2ludGVyLFxuICAgICAgICAgICAgaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBvaW50ZXIgKyAnL2NvbnRyb2xzLy0nXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zdCBpdGVtT3B0aW9ucyA9IGpzZi5kYXRhTWFwLmdldChpdGVtUmVmUG9pbnRlcikgfHwgbmV3IE1hcCgpO1xuICAgICAgICBjb25zdCBpdGVtT3B0aW9ucyA9IG5vZGVPcHRpb25zO1xuICAgICAgICBpZiAoIWl0ZW1SZWN1cnNpdmUgfHwgaGFzT3duKHZhbGlkYXRvcnMsICdyZXF1aXJlZCcpKSB7XG4gICAgICAgICAgY29uc3QgYXJyYXlMZW5ndGggPSBNYXRoLm1pbihNYXRoLm1heChcbiAgICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgPyAwIDpcbiAgICAgICAgICAgICAgKGl0ZW1PcHRpb25zLmdldCgndHVwbGVJdGVtcycpICsgaXRlbU9wdGlvbnMuZ2V0KCdsaXN0SXRlbXMnKSkgfHwgMCxcbiAgICAgICAgICAgIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZS5sZW5ndGggOiAwXG4gICAgICAgICAgKSwgbWF4SXRlbXMpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSBjb250cm9scy5sZW5ndGg7IGkgPCBhcnJheUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgICBpc0FycmF5KG5vZGVWYWx1ZSkgP1xuICAgICAgICAgICAgICAgIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICBqc2YsIG5vZGVWYWx1ZVtpXSwgc2V0VmFsdWVzLFxuICAgICAgICAgICAgICAgICAgc2NoZW1hUmVmUG9pbnRlcixcbiAgICAgICAgICAgICAgICAgIGRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvLSdcbiAgICAgICAgICAgICAgICApIDpcbiAgICAgICAgICAgICAgICBpdGVtUmVjdXJzaXZlID9cbiAgICAgICAgICAgICAgICAgIG51bGwgOiBjbG9uZURlZXAoanNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgY29udHJvbFR5cGUsIGNvbnRyb2xzLCB2YWxpZGF0b3JzIH07XG5cbiAgICBjYXNlICckcmVmJzpcbiAgICAgIGNvbnN0IHNjaGVtYVJlZiA9IEpzb25Qb2ludGVyLmNvbXBpbGUoc2NoZW1hLiRyZWYpO1xuICAgICAgY29uc3QgZGF0YVJlZiA9IEpzb25Qb2ludGVyLnRvRGF0YVBvaW50ZXIoc2NoZW1hUmVmLCBzY2hlbWEpO1xuICAgICAgY29uc3QgcmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgIGRhdGFSZWYsIGpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXBcbiAgICAgICk7XG4gICAgICBpZiAocmVmUG9pbnRlciAmJiAhaGFzT3duKGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnksIHJlZlBvaW50ZXIpKSB7XG4gICAgICAgIC8vIFNldCB0byBudWxsIGZpcnN0IHRvIHByZXZlbnQgcmVjdXJzaXZlIHJlZmVyZW5jZSBmcm9tIGNhdXNpbmcgZW5kbGVzcyBsb29wXG4gICAgICAgIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbcmVmUG9pbnRlcl0gPSBudWxsO1xuICAgICAgICBjb25zdCBuZXdUZW1wbGF0ZSA9IGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoanNmLCBzZXRWYWx1ZXMsIHNldFZhbHVlcywgc2NoZW1hUmVmKTtcbiAgICAgICAgaWYgKG5ld1RlbXBsYXRlKSB7XG4gICAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtyZWZQb2ludGVyXSA9IG5ld1RlbXBsYXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W3JlZlBvaW50ZXJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIGNhc2UgJ0Zvcm1Db250cm9sJzpcbiAgICAgIGNvbnN0IHZhbHVlID0ge1xuICAgICAgICB2YWx1ZTogc2V0VmFsdWVzICYmIGlzUHJpbWl0aXZlKG5vZGVWYWx1ZSkgPyBub2RlVmFsdWUgOiBudWxsLFxuICAgICAgICBkaXNhYmxlZDogbm9kZU9wdGlvbnMuZ2V0KCdkaXNhYmxlZCcpIHx8IGZhbHNlXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHsgY29udHJvbFR5cGUsIHZhbHVlLCB2YWxpZGF0b3JzIH07XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiAnYnVpbGRGb3JtR3JvdXAnIGZ1bmN0aW9uXG4gKlxuICogLy8ge2FueX0gdGVtcGxhdGUgLVxuICogLy8ge0Fic3RyYWN0Q29udHJvbH1cbiovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRGb3JtR3JvdXAodGVtcGxhdGU6IGFueSk6IEFic3RyYWN0Q29udHJvbCB7XG4gIGNvbnN0IHZhbGlkYXRvckZuczogVmFsaWRhdG9yRm5bXSA9IFtdO1xuICBsZXQgdmFsaWRhdG9yRm46IFZhbGlkYXRvckZuID0gbnVsbDtcbiAgaWYgKGhhc093bih0ZW1wbGF0ZSwgJ3ZhbGlkYXRvcnMnKSkge1xuICAgIGZvckVhY2godGVtcGxhdGUudmFsaWRhdG9ycywgKHBhcmFtZXRlcnMsIHZhbGlkYXRvcikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBKc29uVmFsaWRhdG9yc1t2YWxpZGF0b3JdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhbGlkYXRvckZucy5wdXNoKEpzb25WYWxpZGF0b3JzW3ZhbGlkYXRvcl0uYXBwbHkobnVsbCwgcGFyYW1ldGVycykpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh2YWxpZGF0b3JGbnMubGVuZ3RoICYmXG4gICAgICBpbkFycmF5KHRlbXBsYXRlLmNvbnRyb2xUeXBlLCBbJ0Zvcm1Hcm91cCcsICdGb3JtQXJyYXknXSlcbiAgICApIHtcbiAgICAgIHZhbGlkYXRvckZuID0gdmFsaWRhdG9yRm5zLmxlbmd0aCA+IDEgP1xuICAgICAgICBKc29uVmFsaWRhdG9ycy5jb21wb3NlKHZhbGlkYXRvckZucykgOiB2YWxpZGF0b3JGbnNbMF07XG4gICAgfVxuICB9XG4gIGlmIChoYXNPd24odGVtcGxhdGUsICdjb250cm9sVHlwZScpKSB7XG4gICAgc3dpdGNoICh0ZW1wbGF0ZS5jb250cm9sVHlwZSkge1xuICAgICAgY2FzZSAnRm9ybUdyb3VwJzpcbiAgICAgICAgY29uc3QgZ3JvdXBDb250cm9sczogeyBba2V5OiBzdHJpbmddOiBBYnN0cmFjdENvbnRyb2wgfSA9IHt9O1xuICAgICAgICBmb3JFYWNoKHRlbXBsYXRlLmNvbnRyb2xzLCAoY29udHJvbHMsIGtleSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5ld0NvbnRyb2w6IEFic3RyYWN0Q29udHJvbCA9IGJ1aWxkRm9ybUdyb3VwKGNvbnRyb2xzKTtcbiAgICAgICAgICBpZiAobmV3Q29udHJvbCkgeyBncm91cENvbnRyb2xzW2tleV0gPSBuZXdDb250cm9sOyB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbmV3IFVudHlwZWRGb3JtR3JvdXAoZ3JvdXBDb250cm9scywgdmFsaWRhdG9yRm4pO1xuICAgICAgY2FzZSAnRm9ybUFycmF5JzpcbiAgICAgICAgcmV0dXJuIG5ldyBVbnR5cGVkRm9ybUFycmF5KGZpbHRlcihtYXAodGVtcGxhdGUuY29udHJvbHMsXG4gICAgICAgICAgY29udHJvbHMgPT4gYnVpbGRGb3JtR3JvdXAoY29udHJvbHMpXG4gICAgICAgICkpLCB2YWxpZGF0b3JGbik7XG4gICAgICBjYXNlICdGb3JtQ29udHJvbCc6XG4gICAgICAgIHJldHVybiBuZXcgVW50eXBlZEZvcm1Db250cm9sKHRlbXBsYXRlLnZhbHVlLCB2YWxpZGF0b3JGbnMpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiAnbWVyZ2VWYWx1ZXMnIGZ1bmN0aW9uXG4gKlxuICogLy8gIHthbnlbXX0gLi4udmFsdWVzVG9NZXJnZSAtIE11bHRpcGxlIHZhbHVlcyB0byBtZXJnZVxuICogLy8ge2FueX0gLSBNZXJnZWQgdmFsdWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVZhbHVlcyguLi52YWx1ZXNUb01lcmdlKSB7XG4gIGxldCBtZXJnZWRWYWx1ZXM6IGFueSA9IG51bGw7XG4gIGZvciAoY29uc3QgY3VycmVudFZhbHVlIG9mIHZhbHVlc1RvTWVyZ2UpIHtcbiAgICBpZiAoIWlzRW1wdHkoY3VycmVudFZhbHVlKSkge1xuICAgICAgaWYgKHR5cGVvZiBjdXJyZW50VmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgIChpc0VtcHR5KG1lcmdlZFZhbHVlcykgfHwgdHlwZW9mIG1lcmdlZFZhbHVlcyAhPT0gJ29iamVjdCcpXG4gICAgICApIHtcbiAgICAgICAgaWYgKGlzQXJyYXkoY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgIG1lcmdlZFZhbHVlcyA9IFsuLi5jdXJyZW50VmFsdWVdO1xuICAgICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICBtZXJnZWRWYWx1ZXMgPSB7IC4uLmN1cnJlbnRWYWx1ZSB9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjdXJyZW50VmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1lcmdlZFZhbHVlcyA9IGN1cnJlbnRWYWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QobWVyZ2VkVmFsdWVzKSAmJiBpc09iamVjdChjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obWVyZ2VkVmFsdWVzLCBjdXJyZW50VmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChtZXJnZWRWYWx1ZXMpICYmIGlzQXJyYXkoY3VycmVudFZhbHVlKSkge1xuICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICBuZXdWYWx1ZXMucHVzaChtZXJnZVZhbHVlcyhtZXJnZWRWYWx1ZXMsIHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkVmFsdWVzID0gbmV3VmFsdWVzO1xuICAgICAgfSBlbHNlIGlmIChpc0FycmF5KG1lcmdlZFZhbHVlcykgJiYgaXNPYmplY3QoY3VycmVudFZhbHVlKSkge1xuICAgICAgICBjb25zdCBuZXdWYWx1ZXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBtZXJnZWRWYWx1ZXMpIHtcbiAgICAgICAgICBuZXdWYWx1ZXMucHVzaChtZXJnZVZhbHVlcyh2YWx1ZSwgY3VycmVudFZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkVmFsdWVzID0gbmV3VmFsdWVzO1xuICAgICAgfSBlbHNlIGlmIChpc0FycmF5KG1lcmdlZFZhbHVlcykgJiYgaXNBcnJheShjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWF4KG1lcmdlZFZhbHVlcy5sZW5ndGgsIGN1cnJlbnRWYWx1ZS5sZW5ndGgpOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSA8IG1lcmdlZFZhbHVlcy5sZW5ndGggJiYgaSA8IGN1cnJlbnRWYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKG1lcmdlVmFsdWVzKG1lcmdlZFZhbHVlc1tpXSwgY3VycmVudFZhbHVlW2ldKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpIDwgbWVyZ2VkVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgbmV3VmFsdWVzLnB1c2gobWVyZ2VkVmFsdWVzW2ldKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPCBjdXJyZW50VmFsdWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZXMucHVzaChjdXJyZW50VmFsdWVbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRWYWx1ZXMgPSBuZXdWYWx1ZXM7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtZXJnZWRWYWx1ZXM7XG59XG5cbi8qKlxuICogJ3NldFJlcXVpcmVkRmllbGRzJyBmdW5jdGlvblxuICpcbiAqIC8vIHtzY2hlbWF9IHNjaGVtYSAtIEpTT04gU2NoZW1hXG4gKiAvLyB7b2JqZWN0fSBmb3JtQ29udHJvbFRlbXBsYXRlIC0gRm9ybSBDb250cm9sIFRlbXBsYXRlIG9iamVjdFxuICogLy8ge2Jvb2xlYW59IC0gdHJ1ZSBpZiBhbnkgZmllbGRzIGhhdmUgYmVlbiBzZXQgdG8gcmVxdWlyZWQsIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0UmVxdWlyZWRGaWVsZHMoc2NoZW1hOiBhbnksIGZvcm1Db250cm9sVGVtcGxhdGU6IGFueSk6IGJvb2xlYW4ge1xuICBsZXQgZmllbGRzUmVxdWlyZWQgPSBmYWxzZTtcbiAgaWYgKGhhc093bihzY2hlbWEsICdyZXF1aXJlZCcpICYmICFpc0VtcHR5KHNjaGVtYS5yZXF1aXJlZCkpIHtcbiAgICBmaWVsZHNSZXF1aXJlZCA9IHRydWU7XG4gICAgbGV0IHJlcXVpcmVkQXJyYXkgPSBpc0FycmF5KHNjaGVtYS5yZXF1aXJlZCkgPyBzY2hlbWEucmVxdWlyZWQgOiBbc2NoZW1hLnJlcXVpcmVkXTtcbiAgICByZXF1aXJlZEFycmF5ID0gZm9yRWFjaChyZXF1aXJlZEFycmF5LFxuICAgICAga2V5ID0+IEpzb25Qb2ludGVyLnNldChmb3JtQ29udHJvbFRlbXBsYXRlLCAnLycgKyBrZXkgKyAnL3ZhbGlkYXRvcnMvcmVxdWlyZWQnLCBbXSlcbiAgICApO1xuICB9XG4gIHJldHVybiBmaWVsZHNSZXF1aXJlZDtcblxuICAvLyBUT0RPOiBBZGQgc3VwcG9ydCBmb3IgcGF0dGVyblByb3BlcnRpZXNcbiAgLy8gaHR0cHM6Ly9zcGFjZXRlbGVzY29wZS5naXRodWIuaW8vdW5kZXJzdGFuZGluZy1qc29uLXNjaGVtYS9yZWZlcmVuY2Uvb2JqZWN0Lmh0bWwjcGF0dGVybi1wcm9wZXJ0aWVzXG59XG5cbi8qKlxuICogJ2Zvcm1hdEZvcm1EYXRhJyBmdW5jdGlvblxuICpcbiAqIC8vIHthbnl9IGZvcm1EYXRhIC0gQW5ndWxhciBGb3JtR3JvdXAgZGF0YSBvYmplY3RcbiAqIC8vIHtNYXA8c3RyaW5nLCBhbnk+fSBkYXRhTWFwIC1cbiAqIC8vIHtNYXA8c3RyaW5nLCBzdHJpbmc+fSByZWN1cnNpdmVSZWZNYXAgLVxuICogLy8ge01hcDxzdHJpbmcsIG51bWJlcj59IGFycmF5TWFwIC1cbiAqIC8vIHtib29sZWFuID0gZmFsc2V9IGZpeEVycm9ycyAtIGlmIFRSVUUsIHRyaWVzIHRvIGZpeCBkYXRhXG4gKiAvLyB7YW55fSAtIGZvcm1hdHRlZCBkYXRhIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0Rm9ybURhdGEoXG4gIGZvcm1EYXRhOiBhbnksIGRhdGFNYXA6IE1hcDxzdHJpbmcsIGFueT4sXG4gIHJlY3Vyc2l2ZVJlZk1hcDogTWFwPHN0cmluZywgc3RyaW5nPiwgYXJyYXlNYXA6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gIHJldHVybkVtcHR5RmllbGRzID0gZmFsc2UsIGZpeEVycm9ycyA9IGZhbHNlXG4pOiBhbnkge1xuICBpZiAoZm9ybURhdGEgPT09IG51bGwgfHwgdHlwZW9mIGZvcm1EYXRhICE9PSAnb2JqZWN0JykgeyByZXR1cm4gZm9ybURhdGE7IH1cbiAgY29uc3QgZm9ybWF0dGVkRGF0YSA9IGlzQXJyYXkoZm9ybURhdGEpID8gW10gOiB7fTtcbiAgSnNvblBvaW50ZXIuZm9yRWFjaERlZXAoZm9ybURhdGEsICh2YWx1ZSwgZGF0YVBvaW50ZXIpID0+IHtcblxuICAgIC8vIElmIHJldHVybkVtcHR5RmllbGRzID09PSB0cnVlLFxuICAgIC8vIGFkZCBlbXB0eSBhcnJheXMgYW5kIG9iamVjdHMgdG8gYWxsIGFsbG93ZWQga2V5c1xuICAgIGlmIChyZXR1cm5FbXB0eUZpZWxkcyAmJiBpc0FycmF5KHZhbHVlKSkge1xuICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBbXSk7XG4gICAgfSBlbHNlIGlmIChyZXR1cm5FbXB0eUZpZWxkcyAmJiBpc09iamVjdCh2YWx1ZSkgJiYgIWlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBkYXRhUG9pbnRlciwge30pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBnZW5lcmljUG9pbnRlciA9XG4gICAgICAgIEpzb25Qb2ludGVyLmhhcyhkYXRhTWFwLCBbZGF0YVBvaW50ZXIsICdzY2hlbWFUeXBlJ10pID8gZGF0YVBvaW50ZXIgOlxuICAgICAgICAgIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoZGF0YVBvaW50ZXIsIHJlY3Vyc2l2ZVJlZk1hcCwgYXJyYXlNYXApO1xuICAgICAgaWYgKEpzb25Qb2ludGVyLmhhcyhkYXRhTWFwLCBbZ2VuZXJpY1BvaW50ZXIsICdzY2hlbWFUeXBlJ10pKSB7XG4gICAgICAgIGNvbnN0IHNjaGVtYVR5cGU6IFNjaGVtYVByaW1pdGl2ZVR5cGUgfCBTY2hlbWFQcmltaXRpdmVUeXBlW10gPVxuICAgICAgICAgIGRhdGFNYXAuZ2V0KGdlbmVyaWNQb2ludGVyKS5nZXQoJ3NjaGVtYVR5cGUnKTtcbiAgICAgICAgaWYgKHNjaGVtYVR5cGUgPT09ICdudWxsJykge1xuICAgICAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBkYXRhUG9pbnRlciwgbnVsbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoKGhhc1ZhbHVlKHZhbHVlKSB8fCByZXR1cm5FbXB0eUZpZWxkcykgJiZcbiAgICAgICAgICBpbkFycmF5KHNjaGVtYVR5cGUsIFsnc3RyaW5nJywgJ2ludGVnZXInLCAnbnVtYmVyJywgJ2Jvb2xlYW4nXSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSAoZml4RXJyb3JzIHx8ICh2YWx1ZSA9PT0gbnVsbCAmJiByZXR1cm5FbXB0eUZpZWxkcykpID9cbiAgICAgICAgICAgIHRvU2NoZW1hVHlwZSh2YWx1ZSwgc2NoZW1hVHlwZSkgOiB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCBzY2hlbWFUeXBlKTtcbiAgICAgICAgICBpZiAoaXNEZWZpbmVkKG5ld1ZhbHVlKSB8fCByZXR1cm5FbXB0eUZpZWxkcykge1xuICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluaXNoIGluY29tcGxldGUgJ2RhdGUtdGltZScgZW50cmllc1xuICAgICAgICBpZiAoZGF0YU1hcC5nZXQoZ2VuZXJpY1BvaW50ZXIpLmdldCgnc2NoZW1hRm9ybWF0JykgPT09ICdkYXRlLXRpbWUnKSB7XG4gICAgICAgICAgLy8gXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVwiIC0+IFwiMjAwMC0wMy0xNFQwMTo1OToyNi41MzVaXCIgKGFkZCBcIlpcIilcbiAgICAgICAgICBpZiAoL15cXGRcXGRcXGRcXGQtWzAtMV1cXGQtWzAtM11cXGRbdFxcc11bMC0yXVxcZDpbMC01XVxcZDpbMC01XVxcZCg/OlxcLlxcZCspPyQvaS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBgJHt2YWx1ZX1aYCk7XG4gICAgICAgICAgICAvLyBcIjIwMDAtMDMtMTRUMDE6NTlcIiAtPiBcIjIwMDAtMDMtMTRUMDE6NTk6MDBaXCIgKGFkZCBcIjowMFpcIilcbiAgICAgICAgICB9IGVsc2UgaWYgKC9eXFxkXFxkXFxkXFxkLVswLTFdXFxkLVswLTNdXFxkW3RcXHNdWzAtMl1cXGQ6WzAtNV1cXGQkL2kudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBkYXRhUG9pbnRlciwgYCR7dmFsdWV9OjAwWmApO1xuICAgICAgICAgICAgLy8gXCIyMDAwLTAzLTE0XCIgLT4gXCIyMDAwLTAzLTE0VDAwOjAwOjAwWlwiIChhZGQgXCJUMDA6MDA6MDBaXCIpXG4gICAgICAgICAgfSBlbHNlIGlmIChmaXhFcnJvcnMgJiYgL15cXGRcXGRcXGRcXGQtWzAtMV1cXGQtWzAtM11cXGQkL2kudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIEpzb25Qb2ludGVyLnNldChmb3JtYXR0ZWREYXRhLCBkYXRhUG9pbnRlciwgYCR7dmFsdWV9OjAwOjAwOjAwWmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnIHx8IGlzRGF0ZSh2YWx1ZSkgfHxcbiAgICAgICAgKHZhbHVlID09PSBudWxsICYmIHJldHVybkVtcHR5RmllbGRzKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2Zvcm1hdEZvcm1EYXRhIGVycm9yOiAnICtcbiAgICAgICAgICBgU2NoZW1hIHR5cGUgbm90IGZvdW5kIGZvciBmb3JtIHZhbHVlIGF0ICR7Z2VuZXJpY1BvaW50ZXJ9YCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2RhdGFNYXAnLCBkYXRhTWFwKTtcbiAgICAgICAgY29uc29sZS5lcnJvcigncmVjdXJzaXZlUmVmTWFwJywgcmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignZ2VuZXJpY1BvaW50ZXInLCBnZW5lcmljUG9pbnRlcik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGZvcm1hdHRlZERhdGE7XG59XG5cbi8qKlxuICogJ2dldENvbnRyb2wnIGZ1bmN0aW9uXG4gKlxuICogVXNlcyBhIEpTT04gUG9pbnRlciBmb3IgYSBkYXRhIG9iamVjdCB0byByZXRyaWV2ZSBhIGNvbnRyb2wgZnJvbVxuICogYW4gQW5ndWxhciBmb3JtR3JvdXAgb3IgZm9ybUdyb3VwIHRlbXBsYXRlLiAoTm90ZTogdGhvdWdoIGEgZm9ybUdyb3VwXG4gKiB0ZW1wbGF0ZSBpcyBtdWNoIHNpbXBsZXIsIGl0cyBiYXNpYyBzdHJ1Y3R1cmUgaXMgaWRlbnRpYWwgdG8gYSBmb3JtR3JvdXApLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCB0aGlyZCBwYXJhbWV0ZXIgJ3JldHVybkdyb3VwJyBpcyBzZXQgdG8gVFJVRSwgdGhlIGdyb3VwXG4gKiBjb250YWluaW5nIHRoZSBjb250cm9sIGlzIHJldHVybmVkLCByYXRoZXIgdGhhbiB0aGUgY29udHJvbCBpdHNlbGYuXG4gKlxuICogLy8ge0Zvcm1Hcm91cH0gZm9ybUdyb3VwIC0gQW5ndWxhciBGb3JtR3JvdXAgdG8gZ2V0IHZhbHVlIGZyb21cbiAqIC8vIHtQb2ludGVyfSBkYXRhUG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gcmV0dXJuR3JvdXAgLSBJZiB0cnVlLCByZXR1cm4gZ3JvdXAgY29udGFpbmluZyBjb250cm9sXG4gKiAvLyB7Z3JvdXB9IC0gTG9jYXRlZCB2YWx1ZSAob3IgbnVsbCwgaWYgbm8gY29udHJvbCBmb3VuZClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRyb2woXG4gIGZvcm1Hcm91cDogYW55LCBkYXRhUG9pbnRlcjogUG9pbnRlciwgcmV0dXJuR3JvdXAgPSBmYWxzZVxuKTogYW55IHtcbiAgaWYgKCFpc09iamVjdChmb3JtR3JvdXApIHx8ICFKc29uUG9pbnRlci5pc0pzb25Qb2ludGVyKGRhdGFQb2ludGVyKSkge1xuICAgIGlmICghSnNvblBvaW50ZXIuaXNKc29uUG9pbnRlcihkYXRhUG9pbnRlcikpIHtcbiAgICAgIC8vIElmIGRhdGFQb2ludGVyIGlucHV0IGlzIG5vdCBhIHZhbGlkIEpTT04gcG9pbnRlciwgY2hlY2sgdG9cbiAgICAgIC8vIHNlZSBpZiBpdCBpcyBpbnN0ZWFkIGEgdmFsaWQgb2JqZWN0IHBhdGgsIHVzaW5nIGRvdCBub3RhaW9uXG4gICAgICBpZiAodHlwZW9mIGRhdGFQb2ludGVyID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCBmb3JtQ29udHJvbCA9IGZvcm1Hcm91cC5nZXQoZGF0YVBvaW50ZXIpO1xuICAgICAgICBpZiAoZm9ybUNvbnRyb2wpIHsgcmV0dXJuIGZvcm1Db250cm9sOyB9XG4gICAgICB9XG4gICAgICBjb25zb2xlLmVycm9yKGBnZXRDb250cm9sIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtkYXRhUG9pbnRlcn1gKTtcbiAgICB9XG4gICAgaWYgKCFpc09iamVjdChmb3JtR3JvdXApKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBnZXRDb250cm9sIGVycm9yOiBJbnZhbGlkIGZvcm1Hcm91cDogJHtmb3JtR3JvdXB9YCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxldCBkYXRhUG9pbnRlckFycmF5ID0gSnNvblBvaW50ZXIucGFyc2UoZGF0YVBvaW50ZXIpO1xuICBpZiAocmV0dXJuR3JvdXApIHsgZGF0YVBvaW50ZXJBcnJheSA9IGRhdGFQb2ludGVyQXJyYXkuc2xpY2UoMCwgLTEpOyB9XG5cbiAgLy8gSWYgZm9ybUdyb3VwIGlucHV0IGlzIGEgcmVhbCBmb3JtR3JvdXAgKG5vdCBhIGZvcm1Hcm91cCB0ZW1wbGF0ZSlcbiAgLy8gdHJ5IHVzaW5nIGZvcm1Hcm91cC5nZXQoKSB0byByZXR1cm4gdGhlIGNvbnRyb2xcbiAgaWYgKHR5cGVvZiBmb3JtR3JvdXAuZ2V0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgZGF0YVBvaW50ZXJBcnJheS5ldmVyeShrZXkgPT4ga2V5LmluZGV4T2YoJy4nKSA9PT0gLTEpXG4gICkge1xuICAgIGNvbnN0IGZvcm1Db250cm9sID0gZm9ybUdyb3VwLmdldChkYXRhUG9pbnRlckFycmF5LmpvaW4oJy4nKSk7XG4gICAgaWYgKGZvcm1Db250cm9sKSB7IHJldHVybiBmb3JtQ29udHJvbDsgfVxuICB9XG5cbiAgLy8gSWYgZm9ybUdyb3VwIGlucHV0IGlzIGEgZm9ybUdyb3VwIHRlbXBsYXRlLFxuICAvLyBvciBmb3JtR3JvdXAuZ2V0KCkgZmFpbGVkIHRvIHJldHVybiB0aGUgY29udHJvbCxcbiAgLy8gc2VhcmNoIHRoZSBmb3JtR3JvdXAgb2JqZWN0IGZvciBkYXRhUG9pbnRlcidzIGNvbnRyb2xcbiAgbGV0IHN1Ykdyb3VwID0gZm9ybUdyb3VwO1xuICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhUG9pbnRlckFycmF5KSB7XG4gICAgaWYgKGhhc093bihzdWJHcm91cCwgJ2NvbnRyb2xzJykpIHsgc3ViR3JvdXAgPSBzdWJHcm91cC5jb250cm9sczsgfVxuICAgIGlmIChpc0FycmF5KHN1Ykdyb3VwKSAmJiAoa2V5ID09PSAnLScpKSB7XG4gICAgICBzdWJHcm91cCA9IHN1Ykdyb3VwW3N1Ykdyb3VwLmxlbmd0aCAtIDFdO1xuICAgIH0gZWxzZSBpZiAoaGFzT3duKHN1Ykdyb3VwLCBrZXkpKSB7XG4gICAgICBzdWJHcm91cCA9IHN1Ykdyb3VwW2tleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldENvbnRyb2wgZXJyb3I6IFVuYWJsZSB0byBmaW5kIFwiJHtrZXl9XCIgaXRlbSBpbiBGb3JtR3JvdXAuYCk7XG4gICAgICBjb25zb2xlLmVycm9yKGRhdGFQb2ludGVyKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZm9ybUdyb3VwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1Ykdyb3VwO1xufVxuIl19