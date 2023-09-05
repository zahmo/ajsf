import cloneDeep from 'lodash/cloneDeep';
import { forEach, hasOwn, mergeFilteredObject } from './utility.functions';
import { getType, hasValue, inArray, isArray, isNumber, isObject, isString } from './validator.functions';
import { JsonPointer } from './jsonpointer.functions';
import { mergeSchemas } from './merge-schemas.function';
/**
 * JSON Schema function library:
 *
 * buildSchemaFromLayout:   TODO: Write this function
 *
 * buildSchemaFromData:
 *
 * getFromSchema:
 *
 * removeRecursiveReferences:
 *
 * getInputType:
 *
 * checkInlineType:
 *
 * isInputRequired:
 *
 * updateInputOptions:
 *
 * getTitleMapFromOneOf:
 *
 * getControlValidators:
 *
 * resolveSchemaReferences:
 *
 * getSubSchema:
 *
 * combineAllOf:
 *
 * fixRequiredArrayProperties:
 */
/**
 * 'buildSchemaFromLayout' function
 *
 * TODO: Build a JSON Schema from a JSON Form layout
 *
 * //   layout - The JSON Form layout
 * //  - The new JSON Schema
 */
export function buildSchemaFromLayout(layout) {
    return;
    // let newSchema: any = { };
    // const walkLayout = (layoutItems: any[], callback: Function): any[] => {
    //   let returnArray: any[] = [];
    //   for (let layoutItem of layoutItems) {
    //     const returnItem: any = callback(layoutItem);
    //     if (returnItem) { returnArray = returnArray.concat(callback(layoutItem)); }
    //     if (layoutItem.items) {
    //       returnArray = returnArray.concat(walkLayout(layoutItem.items, callback));
    //     }
    //   }
    //   return returnArray;
    // };
    // walkLayout(layout, layoutItem => {
    //   let itemKey: string;
    //   if (typeof layoutItem === 'string') {
    //     itemKey = layoutItem;
    //   } else if (layoutItem.key) {
    //     itemKey = layoutItem.key;
    //   }
    //   if (!itemKey) { return; }
    //   //
    // });
}
/**
 * 'buildSchemaFromData' function
 *
 * Build a JSON Schema from a data object
 *
 * //   data - The data object
 * //  { boolean = false } requireAllFields - Require all fields?
 * //  { boolean = true } isRoot - is root
 * //  - The new JSON Schema
 */
export function buildSchemaFromData(data, requireAllFields = false, isRoot = true) {
    const newSchema = {};
    const getFieldType = (value) => {
        const fieldType = getType(value, 'strict');
        return { integer: 'number', null: 'string' }[fieldType] || fieldType;
    };
    const buildSubSchema = (value) => buildSchemaFromData(value, requireAllFields, false);
    if (isRoot) {
        newSchema.$schema = 'http://json-schema.org/draft-06/schema#';
    }
    newSchema.type = getFieldType(data);
    if (newSchema.type === 'object') {
        newSchema.properties = {};
        if (requireAllFields) {
            newSchema.required = [];
        }
        for (const key of Object.keys(data)) {
            newSchema.properties[key] = buildSubSchema(data[key]);
            if (requireAllFields) {
                newSchema.required.push(key);
            }
        }
    }
    else if (newSchema.type === 'array') {
        newSchema.items = data.map(buildSubSchema);
        // If all items are the same type, use an object for items instead of an array
        if ((new Set(data.map(getFieldType))).size === 1) {
            newSchema.items = newSchema.items.reduce((a, b) => ({ ...a, ...b }), {});
        }
        if (requireAllFields) {
            newSchema.minItems = 1;
        }
    }
    return newSchema;
}
/**
 * 'getFromSchema' function
 *
 * Uses a JSON Pointer for a value within a data object to retrieve
 * the schema for that value within schema for the data object.
 *
 * The optional third parameter can also be set to return something else:
 * 'schema' (default): the schema for the value indicated by the data pointer
 * 'parentSchema': the schema for the value's parent object or array
 * 'schemaPointer': a pointer to the value's schema within the object's schema
 * 'parentSchemaPointer': a pointer to the schema for the value's parent object or array
 *
 * //   schema - The schema to get the sub-schema from
 * //  { Pointer } dataPointer - JSON Pointer (string or array)
 * //  { string = 'schema' } returnType - what to return?
 * //  - The located sub-schema
 */
export function getFromSchema(schema, dataPointer, returnType = 'schema') {
    const dataPointerArray = JsonPointer.parse(dataPointer);
    if (dataPointerArray === null) {
        console.error(`getFromSchema error: Invalid JSON Pointer: ${dataPointer}`);
        return null;
    }
    let subSchema = schema;
    const schemaPointer = [];
    const length = dataPointerArray.length;
    if (returnType.slice(0, 6) === 'parent') {
        dataPointerArray.length--;
    }
    for (let i = 0; i < length; ++i) {
        const parentSchema = subSchema;
        const key = dataPointerArray[i];
        let subSchemaFound = false;
        if (typeof subSchema !== 'object') {
            console.error(`getFromSchema error: Unable to find "${key}" key in schema.`);
            console.error(schema);
            console.error(dataPointer);
            return null;
        }
        if (subSchema.type === 'array' && (!isNaN(key) || key === '-')) {
            if (hasOwn(subSchema, 'items')) {
                if (isObject(subSchema.items)) {
                    subSchemaFound = true;
                    subSchema = subSchema.items;
                    schemaPointer.push('items');
                }
                else if (isArray(subSchema.items)) {
                    if (!isNaN(key) && subSchema.items.length >= +key) {
                        subSchemaFound = true;
                        subSchema = subSchema.items[+key];
                        schemaPointer.push('items', key);
                    }
                }
            }
            if (!subSchemaFound && isObject(subSchema.additionalItems)) {
                subSchemaFound = true;
                subSchema = subSchema.additionalItems;
                schemaPointer.push('additionalItems');
            }
            else if (subSchema.additionalItems !== false) {
                subSchemaFound = true;
                subSchema = {};
                schemaPointer.push('additionalItems');
            }
        }
        else if (subSchema.type === 'object') {
            if (isObject(subSchema.properties) && hasOwn(subSchema.properties, key)) {
                subSchemaFound = true;
                subSchema = subSchema.properties[key];
                schemaPointer.push('properties', key);
            }
            else if (isObject(subSchema.additionalProperties)) {
                subSchemaFound = true;
                subSchema = subSchema.additionalProperties;
                schemaPointer.push('additionalProperties');
            }
            else if (subSchema.additionalProperties !== false) {
                subSchemaFound = true;
                subSchema = {};
                schemaPointer.push('additionalProperties');
            }
        }
        if (!subSchemaFound) {
            console.error(`getFromSchema error: Unable to find "${key}" item in schema.`);
            console.error(schema);
            console.error(dataPointer);
            return;
        }
    }
    return returnType.slice(-7) === 'Pointer' ? schemaPointer : subSchema;
}
/**
 * 'removeRecursiveReferences' function
 *
 * Checks a JSON Pointer against a map of recursive references and returns
 * a JSON Pointer to the shallowest equivalent location in the same object.
 *
 * Using this functions enables an object to be constructed with unlimited
 * recursion, while maintaing a fixed set of metadata, such as field data types.
 * The object can grow as large as it wants, and deeply recursed nodes can
 * just refer to the metadata for their shallow equivalents, instead of having
 * to add additional redundant metadata for each recursively added node.
 *
 * Example:
 *
 * pointer:         '/stuff/and/more/and/more/and/more/and/more/stuff'
 * recursiveRefMap: [['/stuff/and/more/and/more', '/stuff/and/more/']]
 * returned:        '/stuff/and/more/stuff'
 *
 * //  { Pointer } pointer -
 * //  { Map<string, string> } recursiveRefMap -
 * //  { Map<string, number> = new Map() } arrayMap - optional
 * // { string } -
 */
export function removeRecursiveReferences(pointer, recursiveRefMap, arrayMap = new Map()) {
    if (!pointer) {
        return '';
    }
    let genericPointer = JsonPointer.toGenericPointer(JsonPointer.compile(pointer), arrayMap);
    if (genericPointer.indexOf('/') === -1) {
        return genericPointer;
    }
    let possibleReferences = true;
    while (possibleReferences) {
        possibleReferences = false;
        recursiveRefMap.forEach((toPointer, fromPointer) => {
            if (JsonPointer.isSubPointer(toPointer, fromPointer)) {
                while (JsonPointer.isSubPointer(fromPointer, genericPointer, true)) {
                    genericPointer = JsonPointer.toGenericPointer(toPointer + genericPointer.slice(fromPointer.length), arrayMap);
                    possibleReferences = true;
                }
            }
        });
    }
    return genericPointer;
}
/**
 * 'getInputType' function
 *
 * //   schema
 * //  { any = null } layoutNode
 * // { string }
 */
export function getInputType(schema, layoutNode = null) {
    // x-schema-form = Angular Schema Form compatibility
    // widget & component = React Jsonschema Form compatibility
    const controlType = JsonPointer.getFirst([
        [schema, '/x-schema-form/type'],
        [schema, '/x-schema-form/widget/component'],
        [schema, '/x-schema-form/widget'],
        [schema, '/widget/component'],
        [schema, '/widget']
    ]);
    if (isString(controlType)) {
        return checkInlineType(controlType, schema, layoutNode);
    }
    let schemaType = schema.type;
    if (schemaType) {
        if (isArray(schemaType)) { // If multiple types listed, use most inclusive type
            schemaType =
                inArray('object', schemaType) && hasOwn(schema, 'properties') ? 'object' :
                    inArray('array', schemaType) && hasOwn(schema, 'items') ? 'array' :
                        inArray('array', schemaType) && hasOwn(schema, 'additionalItems') ? 'array' :
                            inArray('string', schemaType) ? 'string' :
                                inArray('number', schemaType) ? 'number' :
                                    inArray('integer', schemaType) ? 'integer' :
                                        inArray('boolean', schemaType) ? 'boolean' : 'unknown';
        }
        if (schemaType === 'boolean') {
            return 'checkbox';
        }
        if (schemaType === 'object') {
            if (hasOwn(schema, 'properties') || hasOwn(schema, 'additionalProperties')) {
                return 'section';
            }
            // TODO: Figure out how to handle additionalProperties
            if (hasOwn(schema, '$ref')) {
                return '$ref';
            }
        }
        if (schemaType === 'array') {
            const itemsObject = JsonPointer.getFirst([
                [schema, '/items'],
                [schema, '/additionalItems']
            ]) || {};
            return hasOwn(itemsObject, 'enum') && schema.maxItems !== 1 ?
                checkInlineType('checkboxes', schema, layoutNode) : 'array';
        }
        if (schemaType === 'null') {
            return 'none';
        }
        if (JsonPointer.has(layoutNode, '/options/titleMap') ||
            hasOwn(schema, 'enum') || getTitleMapFromOneOf(schema, null, true)) {
            return 'select';
        }
        if (schemaType === 'number' || schemaType === 'integer') {
            return (schemaType === 'integer' || hasOwn(schema, 'multipleOf')) &&
                hasOwn(schema, 'maximum') && hasOwn(schema, 'minimum') ? 'range' : schemaType;
        }
        if (schemaType === 'string') {
            return {
                'color': 'color',
                'date': 'date',
                'date-time': 'datetime-local',
                'email': 'email',
                'uri': 'url',
            }[schema.format] || 'text';
        }
    }
    if (hasOwn(schema, '$ref')) {
        return '$ref';
    }
    if (isArray(schema.oneOf) || isArray(schema.anyOf)) {
        return 'one-of';
    }
    console.error(`getInputType error: Unable to determine input type for ${schemaType}`);
    console.error('schema', schema);
    if (layoutNode) {
        console.error('layoutNode', layoutNode);
    }
    return 'none';
}
/**
 * 'checkInlineType' function
 *
 * Checks layout and schema nodes for 'inline: true', and converts
 * 'radios' or 'checkboxes' to 'radios-inline' or 'checkboxes-inline'
 *
 * //  { string } controlType -
 * //   schema -
 * //  { any = null } layoutNode -
 * // { string }
 */
export function checkInlineType(controlType, schema, layoutNode = null) {
    if (!isString(controlType) || (controlType.slice(0, 8) !== 'checkbox' && controlType.slice(0, 5) !== 'radio')) {
        return controlType;
    }
    if (JsonPointer.getFirst([
        [layoutNode, '/inline'],
        [layoutNode, '/options/inline'],
        [schema, '/inline'],
        [schema, '/x-schema-form/inline'],
        [schema, '/x-schema-form/options/inline'],
        [schema, '/x-schema-form/widget/inline'],
        [schema, '/x-schema-form/widget/component/inline'],
        [schema, '/x-schema-form/widget/component/options/inline'],
        [schema, '/widget/inline'],
        [schema, '/widget/component/inline'],
        [schema, '/widget/component/options/inline'],
    ]) === true) {
        return controlType.slice(0, 5) === 'radio' ?
            'radios-inline' : 'checkboxes-inline';
    }
    else {
        return controlType;
    }
}
/**
 * 'isInputRequired' function
 *
 * Checks a JSON Schema to see if an item is required
 *
 * //   schema - the schema to check
 * //  { string } schemaPointer - the pointer to the item to check
 * // { boolean } - true if the item is required, false if not
 */
export function isInputRequired(schema, schemaPointer) {
    if (!isObject(schema)) {
        console.error('isInputRequired error: Input schema must be an object.');
        return false;
    }
    const listPointerArray = JsonPointer.parse(schemaPointer);
    if (isArray(listPointerArray)) {
        if (!listPointerArray.length) {
            return schema.required === true;
        }
        const keyName = listPointerArray.pop();
        const nextToLastKey = listPointerArray[listPointerArray.length - 1];
        if (['properties', 'additionalProperties', 'patternProperties', 'items', 'additionalItems']
            .includes(nextToLastKey)) {
            listPointerArray.pop();
        }
        const parentSchema = JsonPointer.get(schema, listPointerArray) || {};
        if (isArray(parentSchema.required)) {
            return parentSchema.required.includes(keyName);
        }
        if (parentSchema.type === 'array') {
            return hasOwn(parentSchema, 'minItems') &&
                isNumber(keyName) &&
                +parentSchema.minItems > +keyName;
        }
    }
    return false;
}
/**
 * 'updateInputOptions' function
 *
 * //   layoutNode
 * //   schema
 * //   jsf
 * // { void }
 */
export function updateInputOptions(layoutNode, schema, jsf) {
    if (!isObject(layoutNode) || !isObject(layoutNode.options)) {
        return;
    }
    // Set all option values in layoutNode.options
    const newOptions = {};
    const fixUiKeys = key => key.slice(0, 3).toLowerCase() === 'ui:' ? key.slice(3) : key;
    mergeFilteredObject(newOptions, jsf.formOptions.defautWidgetOptions, [], fixUiKeys);
    [[JsonPointer.get(schema, '/ui:widget/options'), []],
        [JsonPointer.get(schema, '/ui:widget'), []],
        [schema, [
                'additionalProperties', 'additionalItems', 'properties', 'items',
                'required', 'type', 'x-schema-form', '$ref'
            ]],
        [JsonPointer.get(schema, '/x-schema-form/options'), []],
        [JsonPointer.get(schema, '/x-schema-form'), ['items', 'options']],
        [layoutNode, [
                '_id', '$ref', 'arrayItem', 'arrayItemType', 'dataPointer', 'dataType',
                'items', 'key', 'name', 'options', 'recursiveReference', 'type', 'widget'
            ]],
        [layoutNode.options, []],
    ].forEach(([object, excludeKeys]) => mergeFilteredObject(newOptions, object, excludeKeys, fixUiKeys));
    if (!hasOwn(newOptions, 'titleMap')) {
        let newTitleMap = null;
        newTitleMap = getTitleMapFromOneOf(schema, newOptions.flatList);
        if (newTitleMap) {
            newOptions.titleMap = newTitleMap;
        }
        if (!hasOwn(newOptions, 'titleMap') && !hasOwn(newOptions, 'enum') && hasOwn(schema, 'items')) {
            if (JsonPointer.has(schema, '/items/titleMap')) {
                newOptions.titleMap = schema.items.titleMap;
            }
            else if (JsonPointer.has(schema, '/items/enum')) {
                newOptions.enum = schema.items.enum;
                if (!hasOwn(newOptions, 'enumNames') && JsonPointer.has(schema, '/items/enumNames')) {
                    newOptions.enumNames = schema.items.enumNames;
                }
            }
            else if (JsonPointer.has(schema, '/items/oneOf')) {
                newTitleMap = getTitleMapFromOneOf(schema.items, newOptions.flatList);
                if (newTitleMap) {
                    newOptions.titleMap = newTitleMap;
                }
            }
        }
    }
    // If schema type is integer, enforce by setting multipleOf = 1
    if (schema.type === 'integer' && !hasValue(newOptions.multipleOf)) {
        newOptions.multipleOf = 1;
    }
    // Copy any typeahead word lists to options.typeahead.source
    if (JsonPointer.has(newOptions, '/autocomplete/source')) {
        newOptions.typeahead = newOptions.autocomplete;
    }
    else if (JsonPointer.has(newOptions, '/tagsinput/source')) {
        newOptions.typeahead = newOptions.tagsinput;
    }
    else if (JsonPointer.has(newOptions, '/tagsinput/typeahead/source')) {
        newOptions.typeahead = newOptions.tagsinput.typeahead;
    }
    layoutNode.options = newOptions;
}
/**
 * 'getTitleMapFromOneOf' function
 *
 * //  { schema } schema
 * //  { boolean = null } flatList
 * //  { boolean = false } validateOnly
 * // { validators }
 */
export function getTitleMapFromOneOf(schema = {}, flatList = null, validateOnly = false) {
    let titleMap = null;
    const oneOf = schema.oneOf || schema.anyOf || null;
    if (isArray(oneOf) && oneOf.every(item => item.title)) {
        if (oneOf.every(item => isArray(item.enum) && item.enum.length === 1)) {
            if (validateOnly) {
                return true;
            }
            titleMap = oneOf.map(item => ({ name: item.title, value: item.enum[0] }));
        }
        else if (oneOf.every(item => item.const)) {
            if (validateOnly) {
                return true;
            }
            titleMap = oneOf.map(item => ({ name: item.title, value: item.const }));
        }
        // if flatList !== false and some items have colons, make grouped map
        if (flatList !== false && (titleMap || [])
            .filter(title => ((title || {}).name || '').indexOf(': ')).length > 1) {
            // Split name on first colon to create grouped map (name -> group: name)
            const newTitleMap = titleMap.map(title => {
                const [group, name] = title.name.split(/: (.+)/);
                return group && name ? { ...title, group, name } : title;
            });
            // If flatList === true or at least one group has multiple items, use grouped map
            if (flatList === true || newTitleMap.some((title, index) => index &&
                hasOwn(title, 'group') && title.group === newTitleMap[index - 1].group)) {
                titleMap = newTitleMap;
            }
        }
    }
    return validateOnly ? false : titleMap;
}
/**
 * 'getControlValidators' function
 *
 * //  schema
 * // { validators }
 */
export function getControlValidators(schema) {
    if (!isObject(schema)) {
        return null;
    }
    const validators = {};
    if (hasOwn(schema, 'type')) {
        switch (schema.type) {
            case 'string':
                forEach(['pattern', 'format', 'minLength', 'maxLength'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'number':
            case 'integer':
                forEach(['Minimum', 'Maximum'], (ucLimit) => {
                    const eLimit = 'exclusive' + ucLimit;
                    const limit = ucLimit.toLowerCase();
                    if (hasOwn(schema, limit)) {
                        const exclusive = hasOwn(schema, eLimit) && schema[eLimit] === true;
                        validators[limit] = [schema[limit], exclusive];
                    }
                });
                forEach(['multipleOf', 'type'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'object':
                forEach(['minProperties', 'maxProperties', 'dependencies'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'array':
                forEach(['minItems', 'maxItems', 'uniqueItems'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
        }
    }
    if (hasOwn(schema, 'enum')) {
        validators.enum = [schema.enum];
    }
    return validators;
}
/**
 * 'resolveSchemaReferences' function
 *
 * Find all $ref links in schema and save links and referenced schemas in
 * schemaRefLibrary, schemaRecursiveRefMap, and dataRecursiveRefMap
 *
 * //  schema
 * //  schemaRefLibrary
 * // { Map<string, string> } schemaRecursiveRefMap
 * // { Map<string, string> } dataRecursiveRefMap
 * // { Map<string, number> } arrayMap
 * //
 */
export function resolveSchemaReferences(schema, schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, arrayMap) {
    if (!isObject(schema)) {
        console.error('resolveSchemaReferences error: schema must be an object.');
        return;
    }
    const refLinks = new Set();
    const refMapSet = new Set();
    const refMap = new Map();
    const recursiveRefMap = new Map();
    const refLibrary = {};
    // Search schema for all $ref links, and build full refLibrary
    JsonPointer.forEachDeep(schema, (subSchema, subSchemaPointer) => {
        if (hasOwn(subSchema, '$ref') && isString(subSchema['$ref'])) {
            const refPointer = JsonPointer.compile(subSchema['$ref']);
            refLinks.add(refPointer);
            refMapSet.add(subSchemaPointer + '~~' + refPointer);
            refMap.set(subSchemaPointer, refPointer);
        }
    });
    refLinks.forEach(ref => refLibrary[ref] = getSubSchema(schema, ref));
    // Follow all ref links and save in refMapSet,
    // to find any multi-link recursive refernces
    let checkRefLinks = true;
    while (checkRefLinks) {
        checkRefLinks = false;
        Array.from(refMap).forEach(([fromRef1, toRef1]) => Array.from(refMap)
            .filter(([fromRef2, toRef2]) => JsonPointer.isSubPointer(toRef1, fromRef2, true) &&
            !JsonPointer.isSubPointer(toRef2, toRef1, true) &&
            !refMapSet.has(fromRef1 + fromRef2.slice(toRef1.length) + '~~' + toRef2))
            .forEach(([fromRef2, toRef2]) => {
            refMapSet.add(fromRef1 + fromRef2.slice(toRef1.length) + '~~' + toRef2);
            checkRefLinks = true;
        }));
    }
    // Build full recursiveRefMap
    // First pass - save all internally recursive refs from refMapSet
    Array.from(refMapSet)
        .map(refLink => refLink.split('~~'))
        .filter(([fromRef, toRef]) => JsonPointer.isSubPointer(toRef, fromRef))
        .forEach(([fromRef, toRef]) => recursiveRefMap.set(fromRef, toRef));
    // Second pass - create recursive versions of any other refs that link to recursive refs
    Array.from(refMap)
        .filter(([fromRef1, toRef1]) => Array.from(recursiveRefMap.keys())
        .every(fromRef2 => !JsonPointer.isSubPointer(fromRef1, fromRef2, true)))
        .forEach(([fromRef1, toRef1]) => Array.from(recursiveRefMap)
        .filter(([fromRef2, toRef2]) => !recursiveRefMap.has(fromRef1 + fromRef2.slice(toRef1.length)) &&
        JsonPointer.isSubPointer(toRef1, fromRef2, true) &&
        !JsonPointer.isSubPointer(toRef1, fromRef1, true))
        .forEach(([fromRef2, toRef2]) => recursiveRefMap.set(fromRef1 + fromRef2.slice(toRef1.length), fromRef1 + toRef2.slice(toRef1.length))));
    // Create compiled schema by replacing all non-recursive $ref links with
    // thieir linked schemas and, where possible, combining schemas in allOf arrays.
    let compiledSchema = { ...schema };
    delete compiledSchema.definitions;
    compiledSchema =
        getSubSchema(compiledSchema, '', refLibrary, recursiveRefMap);
    // Make sure all remaining schema $refs are recursive, and build final
    // schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, & arrayMap
    JsonPointer.forEachDeep(compiledSchema, (subSchema, subSchemaPointer) => {
        if (isString(subSchema['$ref'])) {
            let refPointer = JsonPointer.compile(subSchema['$ref']);
            if (!JsonPointer.isSubPointer(refPointer, subSchemaPointer, true)) {
                refPointer = removeRecursiveReferences(subSchemaPointer, recursiveRefMap);
                JsonPointer.set(compiledSchema, subSchemaPointer, { $ref: `#${refPointer}` });
            }
            if (!hasOwn(schemaRefLibrary, 'refPointer')) {
                schemaRefLibrary[refPointer] = !refPointer.length ? compiledSchema :
                    getSubSchema(compiledSchema, refPointer, schemaRefLibrary, recursiveRefMap);
            }
            if (!schemaRecursiveRefMap.has(subSchemaPointer)) {
                schemaRecursiveRefMap.set(subSchemaPointer, refPointer);
            }
            const fromDataRef = JsonPointer.toDataPointer(subSchemaPointer, compiledSchema);
            if (!dataRecursiveRefMap.has(fromDataRef)) {
                const toDataRef = JsonPointer.toDataPointer(refPointer, compiledSchema);
                dataRecursiveRefMap.set(fromDataRef, toDataRef);
            }
        }
        if (subSchema.type === 'array' &&
            (hasOwn(subSchema, 'items') || hasOwn(subSchema, 'additionalItems'))) {
            const dataPointer = JsonPointer.toDataPointer(subSchemaPointer, compiledSchema);
            if (!arrayMap.has(dataPointer)) {
                const tupleItems = isArray(subSchema.items) ? subSchema.items.length : 0;
                arrayMap.set(dataPointer, tupleItems);
            }
        }
    }, true);
    return compiledSchema;
}
/**
 * 'getSubSchema' function
 *
 * //   schema
 * //  { Pointer } pointer
 * //  { object } schemaRefLibrary
 * //  { Map<string, string> } schemaRecursiveRefMap
 * //  { string[] = [] } usedPointers
 * //
 */
export function getSubSchema(schema, pointer, schemaRefLibrary = null, schemaRecursiveRefMap = null, usedPointers = []) {
    if (!schemaRefLibrary || !schemaRecursiveRefMap) {
        return JsonPointer.getCopy(schema, pointer);
    }
    if (typeof pointer !== 'string') {
        pointer = JsonPointer.compile(pointer);
    }
    usedPointers = [...usedPointers, pointer];
    let newSchema = null;
    if (pointer === '') {
        newSchema = cloneDeep(schema);
    }
    else {
        const shortPointer = removeRecursiveReferences(pointer, schemaRecursiveRefMap);
        if (shortPointer !== pointer) {
            usedPointers = [...usedPointers, shortPointer];
        }
        newSchema = JsonPointer.getFirstCopy([
            [schemaRefLibrary, [shortPointer]],
            [schema, pointer],
            [schema, shortPointer]
        ]);
    }
    return JsonPointer.forEachDeepCopy(newSchema, (subSchema, subPointer) => {
        if (isObject(subSchema)) {
            // Replace non-recursive $ref links with referenced schemas
            if (isString(subSchema.$ref)) {
                const refPointer = JsonPointer.compile(subSchema.$ref);
                if (refPointer.length && usedPointers.every(ptr => !JsonPointer.isSubPointer(refPointer, ptr, true))) {
                    const refSchema = getSubSchema(schema, refPointer, schemaRefLibrary, schemaRecursiveRefMap, usedPointers);
                    if (Object.keys(subSchema).length === 1) {
                        return refSchema;
                    }
                    else {
                        const extraKeys = { ...subSchema };
                        delete extraKeys.$ref;
                        return mergeSchemas(refSchema, extraKeys);
                    }
                }
            }
            // TODO: Convert schemas with 'type' arrays to 'oneOf'
            // Combine allOf subSchemas
            if (isArray(subSchema.allOf)) {
                return combineAllOf(subSchema);
            }
            // Fix incorrectly placed array object required lists
            if (subSchema.type === 'array' && isArray(subSchema.required)) {
                return fixRequiredArrayProperties(subSchema);
            }
        }
        return subSchema;
    }, true, pointer);
}
/**
 * 'combineAllOf' function
 *
 * Attempt to convert an allOf schema object into
 * a non-allOf schema object with equivalent rules.
 *
 * //   schema - allOf schema object
 * //  - converted schema object
 */
export function combineAllOf(schema) {
    if (!isObject(schema) || !isArray(schema.allOf)) {
        return schema;
    }
    let mergedSchema = mergeSchemas(...schema.allOf);
    if (Object.keys(schema).length > 1) {
        const extraKeys = { ...schema };
        delete extraKeys.allOf;
        mergedSchema = mergeSchemas(mergedSchema, extraKeys);
    }
    return mergedSchema;
}
/**
 * 'fixRequiredArrayProperties' function
 *
 * Fixes an incorrectly placed required list inside an array schema, by moving
 * it into items.properties or additionalItems.properties, where it belongs.
 *
 * //   schema - allOf schema object
 * //  - converted schema object
 */
export function fixRequiredArrayProperties(schema) {
    if (schema.type === 'array' && isArray(schema.required)) {
        const itemsObject = hasOwn(schema.items, 'properties') ? 'items' :
            hasOwn(schema.additionalItems, 'properties') ? 'additionalItems' : null;
        if (itemsObject && !hasOwn(schema[itemsObject], 'required') && (hasOwn(schema[itemsObject], 'additionalProperties') ||
            schema.required.every(key => hasOwn(schema[itemsObject].properties, key)))) {
            schema = cloneDeep(schema);
            schema[itemsObject].required = schema.required;
            delete schema.required;
        }
    }
    return schema;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEuZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtY29yZS9zcmMvbGliL3NoYXJlZC9qc29uLXNjaGVtYS5mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzRSxPQUFPLEVBQ0wsT0FBTyxFQUNQLFFBQVEsRUFDUixPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNQLE1BQU0sdUJBQXVCLENBQUM7QUFDakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd4RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBRUg7Ozs7Ozs7R0FPRztBQUNILE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxNQUFNO0lBQzFDLE9BQU87SUFDUCw0QkFBNEI7SUFDNUIsMEVBQTBFO0lBQzFFLGlDQUFpQztJQUNqQywwQ0FBMEM7SUFDMUMsb0RBQW9EO0lBQ3BELGtGQUFrRjtJQUNsRiw4QkFBOEI7SUFDOUIsa0ZBQWtGO0lBQ2xGLFFBQVE7SUFDUixNQUFNO0lBQ04sd0JBQXdCO0lBQ3hCLEtBQUs7SUFDTCxxQ0FBcUM7SUFDckMseUJBQXlCO0lBQ3pCLDBDQUEwQztJQUMxQyw0QkFBNEI7SUFDNUIsaUNBQWlDO0lBQ2pDLGdDQUFnQztJQUNoQyxNQUFNO0lBQ04sOEJBQThCO0lBQzlCLE9BQU87SUFDUCxNQUFNO0FBQ1IsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FDakMsSUFBSSxFQUFFLGdCQUFnQixHQUFHLEtBQUssRUFBRSxNQUFNLEdBQUcsSUFBSTtJQUU3QyxNQUFNLFNBQVMsR0FBUSxFQUFFLENBQUM7SUFDMUIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxLQUFVLEVBQVUsRUFBRTtRQUMxQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUM7SUFDdkUsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUMvQixtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEQsSUFBSSxNQUFNLEVBQUU7UUFBRSxTQUFTLENBQUMsT0FBTyxHQUFHLHlDQUF5QyxDQUFDO0tBQUU7SUFDOUUsU0FBUyxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUMvQixTQUFTLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLGdCQUFnQixFQUFFO1lBQUUsU0FBUyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7U0FBRTtRQUNsRCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdEQsSUFBSSxnQkFBZ0IsRUFBRTtnQkFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUFFO1NBQ3hEO0tBQ0Y7U0FBTSxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO1FBQ3JDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMzQyw4RUFBOEU7UUFDOUUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7WUFDaEQsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDMUU7UUFDRCxJQUFJLGdCQUFnQixFQUFFO1lBQUUsU0FBUyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FBRTtLQUNsRDtJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEdBQUcsUUFBUTtJQUN0RSxNQUFNLGdCQUFnQixHQUFVLFdBQVcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0QsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7UUFDN0IsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUMzRSxPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUN6QixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7SUFDdkMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7UUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUFFO0lBQ3ZFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDL0IsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDO1FBQy9CLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztRQUMzQixJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTtZQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxHQUFHLGtCQUFrQixDQUFDLENBQUM7WUFDN0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQzlELElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDOUIsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM3QixjQUFjLEdBQUcsSUFBSSxDQUFDO29CQUN0QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztvQkFDNUIsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDN0I7cUJBQU0sSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNqRCxjQUFjLEdBQUcsSUFBSSxDQUFDO3dCQUN0QixTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNsQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDbEM7aUJBQ0Y7YUFDRjtZQUNELElBQUksQ0FBQyxjQUFjLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDMUQsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDdEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUM7Z0JBQ3RDLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN2QztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxlQUFlLEtBQUssS0FBSyxFQUFFO2dCQUM5QyxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixTQUFTLEdBQUcsRUFBRyxDQUFDO2dCQUNoQixhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDdkM7U0FDRjthQUFNLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDdEMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUN2RSxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixTQUFTLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDdkM7aUJBQU0sSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEVBQUU7Z0JBQ25ELGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLFNBQVMsR0FBRyxTQUFTLENBQUMsb0JBQW9CLENBQUM7Z0JBQzNDLGFBQWEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUM1QztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsS0FBSyxLQUFLLEVBQUU7Z0JBQ25ELGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLFNBQVMsR0FBRyxFQUFHLENBQUM7Z0JBQ2hCLGFBQWEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzthQUM1QztTQUNGO1FBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxHQUFHLG1CQUFtQixDQUFDLENBQUM7WUFDOUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNCLE9BQU87U0FDUjtLQUNGO0lBQ0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUN4RSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQ3ZDLE9BQU8sRUFBRSxlQUFlLEVBQUUsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFO0lBRTlDLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFBRSxPQUFPLEVBQUUsQ0FBQztLQUFFO0lBQzVCLElBQUksY0FBYyxHQUNoQixXQUFXLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RSxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFBRSxPQUFPLGNBQWMsQ0FBQztLQUFFO0lBQ2xFLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBQzlCLE9BQU8sa0JBQWtCLEVBQUU7UUFDekIsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1FBQzNCLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLEVBQUU7WUFDakQsSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFBRTtnQkFDcEQsT0FBTyxXQUFXLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ2xFLGNBQWMsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQzNDLFNBQVMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLENBQy9ELENBQUM7b0JBQ0Ysa0JBQWtCLEdBQUcsSUFBSSxDQUFDO2lCQUMzQjthQUNGO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELE9BQU8sY0FBYyxDQUFDO0FBQ3hCLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLE1BQU0sRUFBRSxhQUFrQixJQUFJO0lBQ3pELG9EQUFvRDtJQUNwRCwyREFBMkQ7SUFDM0QsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUN2QyxDQUFDLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQztRQUMvQixDQUFDLE1BQU0sRUFBRSxpQ0FBaUMsQ0FBQztRQUMzQyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQztRQUNqQyxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQztRQUM3QixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUM7S0FDcEIsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFBRSxPQUFPLGVBQWUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQUU7SUFDdkYsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztJQUM3QixJQUFJLFVBQVUsRUFBRTtRQUNkLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsb0RBQW9EO1lBQzdFLFVBQVU7Z0JBQ1IsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDMUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDbkUsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUM3RSxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDMUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7b0NBQzFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dDQUM1QyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztTQUMxRDtRQUNELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUFFLE9BQU8sVUFBVSxDQUFDO1NBQUU7UUFDcEQsSUFBSSxVQUFVLEtBQUssUUFBUSxFQUFFO1lBQzNCLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLHNCQUFzQixDQUFDLEVBQUU7Z0JBQzFFLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0Qsc0RBQXNEO1lBQ3RELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFBRSxPQUFPLE1BQU0sQ0FBQzthQUFFO1NBQy9DO1FBQ0QsSUFBSSxVQUFVLEtBQUssT0FBTyxFQUFFO1lBQzFCLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7Z0JBQ3ZDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztnQkFDbEIsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUM7YUFDN0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNULE9BQU8sTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxlQUFlLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1NBQy9EO1FBQ0QsSUFBSSxVQUFVLEtBQUssTUFBTSxFQUFFO1lBQUUsT0FBTyxNQUFNLENBQUM7U0FBRTtRQUM3QyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLG1CQUFtQixDQUFDO1lBQ2xELE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksb0JBQW9CLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDbEU7WUFBRSxPQUFPLFFBQVEsQ0FBQztTQUFFO1FBQ3RCLElBQUksVUFBVSxLQUFLLFFBQVEsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO1lBQ3ZELE9BQU8sQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQy9ELE1BQU0sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7U0FDakY7UUFDRCxJQUFJLFVBQVUsS0FBSyxRQUFRLEVBQUU7WUFDM0IsT0FBTztnQkFDTCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsV0FBVyxFQUFFLGdCQUFnQjtnQkFDN0IsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLEtBQUssRUFBRSxLQUFLO2FBQ2IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDO1NBQzVCO0tBQ0Y7SUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFBRSxPQUFPLE1BQU0sQ0FBQztLQUFFO0lBQzlDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQUUsT0FBTyxRQUFRLENBQUM7S0FBRTtJQUN4RSxPQUFPLENBQUMsS0FBSyxDQUFDLDBEQUEwRCxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3RGLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLElBQUksVUFBVSxFQUFFO1FBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FBRTtJQUM1RCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxhQUFrQixJQUFJO0lBQ3pFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FDNUIsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssVUFBVSxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FDOUUsRUFBRTtRQUNELE9BQU8sV0FBVyxDQUFDO0tBQ3BCO0lBQ0QsSUFDRSxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ25CLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQztRQUN2QixDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQztRQUMvQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUM7UUFDbkIsQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLENBQUM7UUFDakMsQ0FBQyxNQUFNLEVBQUUsK0JBQStCLENBQUM7UUFDekMsQ0FBQyxNQUFNLEVBQUUsOEJBQThCLENBQUM7UUFDeEMsQ0FBQyxNQUFNLEVBQUUsd0NBQXdDLENBQUM7UUFDbEQsQ0FBQyxNQUFNLEVBQUUsZ0RBQWdELENBQUM7UUFDMUQsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUM7UUFDMUIsQ0FBQyxNQUFNLEVBQUUsMEJBQTBCLENBQUM7UUFDcEMsQ0FBQyxNQUFNLEVBQUUsa0NBQWtDLENBQUM7S0FDN0MsQ0FBQyxLQUFLLElBQUksRUFDWDtRQUNBLE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUM7WUFDMUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztLQUN6QztTQUFNO1FBQ0wsT0FBTyxXQUFXLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFDLE1BQU0sRUFBRSxhQUFhO0lBQ25ELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDckIsT0FBTyxDQUFDLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxNQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUQsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUM3QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQztTQUFFO1FBQ2xFLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsWUFBWSxFQUFFLHNCQUFzQixFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQzthQUN4RixRQUFRLENBQUMsYUFBYSxDQUFDLEVBQ3hCO1lBQ0EsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDeEI7UUFDRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyRSxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbEMsT0FBTyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNoRDtRQUNELElBQUksWUFBWSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDakMsT0FBTyxNQUFNLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQztnQkFDckMsUUFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDakIsQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDO1NBQ3JDO0tBQ0Y7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRztJQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUFFLE9BQU87S0FBRTtJQUV2RSw4Q0FBOEM7SUFDOUMsTUFBTSxVQUFVLEdBQVEsRUFBRyxDQUFDO0lBQzVCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDdEYsbUJBQW1CLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BGLENBQUUsQ0FBRSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsQ0FBRTtRQUNyRCxDQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBRTtRQUM3QyxDQUFFLE1BQU0sRUFBRTtnQkFDUixzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsT0FBTztnQkFDaEUsVUFBVSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsTUFBTTthQUM1QyxDQUFFO1FBQ0gsQ0FBRSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsQ0FBRTtRQUN6RCxDQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUU7UUFDbkUsQ0FBRSxVQUFVLEVBQUU7Z0JBQ1osS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxVQUFVO2dCQUN0RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLFFBQVE7YUFDMUUsQ0FBRTtRQUNILENBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUU7S0FDM0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLE1BQU0sRUFBRSxXQUFXLENBQUUsRUFBRSxFQUFFLENBQ3BDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUNoRSxDQUFDO0lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUU7UUFDbkMsSUFBSSxXQUFXLEdBQVEsSUFBSSxDQUFDO1FBQzVCLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLElBQUksV0FBVyxFQUFFO1lBQUUsVUFBVSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUM7U0FBRTtRQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRTtZQUM3RixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLEVBQUU7Z0JBQzlDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7YUFDN0M7aUJBQU0sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsRUFBRTtnQkFDakQsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsRUFBRTtvQkFDbkYsVUFBVSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztpQkFDL0M7YUFDRjtpQkFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxFQUFFO2dCQUNsRCxXQUFXLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RFLElBQUksV0FBVyxFQUFFO29CQUFFLFVBQVUsQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO2lCQUFFO2FBQ3hEO1NBQ0Y7S0FDRjtJQUVELCtEQUErRDtJQUMvRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUNqRSxVQUFVLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztLQUMzQjtJQUVELDREQUE0RDtJQUM1RCxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDLEVBQUU7UUFDdkQsVUFBVSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO0tBQ2hEO1NBQU0sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFO1FBQzNELFVBQVUsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztLQUM3QztTQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsNkJBQTZCLENBQUMsRUFBRTtRQUNyRSxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0tBQ3ZEO0lBRUQsVUFBVSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFDbEMsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQ2xDLFNBQWMsRUFBRSxFQUFFLFdBQW9CLElBQUksRUFBRSxZQUFZLEdBQUcsS0FBSztJQUVoRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDcEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQztJQUNuRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3JELElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDckUsSUFBSSxZQUFZLEVBQUU7Z0JBQUUsT0FBTyxJQUFJLENBQUM7YUFBRTtZQUNsQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMzRTthQUFNLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMxQyxJQUFJLFlBQVksRUFBRTtnQkFBRSxPQUFPLElBQUksQ0FBQzthQUFFO1lBQ2xDLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3pFO1FBRUQscUVBQXFFO1FBQ3JFLElBQUksUUFBUSxLQUFLLEtBQUssSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7YUFDdkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDckU7WUFFQSx3RUFBd0U7WUFDeEUsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDakQsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQzNELENBQUMsQ0FBQyxDQUFDO1lBRUgsaUZBQWlGO1lBQ2pGLElBQUksUUFBUSxLQUFLLElBQUksSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSztnQkFDL0QsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUN2RSxFQUFFO2dCQUNELFFBQVEsR0FBRyxXQUFXLENBQUM7YUFDeEI7U0FDRjtLQUNGO0lBQ0QsT0FBTyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3pDLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxNQUFNO0lBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFBRSxPQUFPLElBQUksQ0FBQztLQUFFO0lBQ3ZDLE1BQU0sVUFBVSxHQUFRLEVBQUcsQ0FBQztJQUM1QixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDMUIsUUFBUSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ25CLEtBQUssUUFBUTtnQkFDWCxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO29CQUNoRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQUU7Z0JBQ2xFLENBQUMsQ0FBQyxDQUFDO2dCQUNMLE1BQU07WUFDTixLQUFLLFFBQVEsQ0FBQztZQUFDLEtBQUssU0FBUztnQkFDM0IsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzFDLE1BQU0sTUFBTSxHQUFHLFdBQVcsR0FBRyxPQUFPLENBQUM7b0JBQ3JDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDcEMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFO3dCQUN6QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUM7d0JBQ3BFLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDaEQ7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxDQUFDLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ3ZDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFBRTtnQkFDbEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsTUFBTTtZQUNOLEtBQUssUUFBUTtnQkFDWCxPQUFPLENBQUMsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ25FLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFBRTtnQkFDbEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsTUFBTTtZQUNOLEtBQUssT0FBTztnQkFDVixPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7b0JBQ3hELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFBRTtnQkFDbEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsTUFBTTtTQUNQO0tBQ0Y7SUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFBRSxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQUU7SUFDaEUsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sVUFBVSx1QkFBdUIsQ0FDckMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLG1CQUFtQixFQUFFLFFBQVE7SUFFOUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7UUFDMUUsT0FBTztLQUNSO0lBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ3pDLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ2xELE1BQU0sVUFBVSxHQUFRLEVBQUUsQ0FBQztJQUUzQiw4REFBOEQ7SUFDOUQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRTtRQUM5RCxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO1lBQzVELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDMUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QixTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVyRSw4Q0FBOEM7SUFDOUMsNkNBQTZDO0lBQzdDLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQztJQUN6QixPQUFPLGFBQWEsRUFBRTtRQUNwQixhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ2xFLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FDN0IsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztZQUNoRCxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7WUFDL0MsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQ3pFO2FBQ0EsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRTtZQUM5QixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDeEUsYUFBYSxHQUFHLElBQUksQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FDSCxDQUFDO0tBQ0g7SUFFRCw2QkFBNkI7SUFDN0IsaUVBQWlFO0lBQ2pFLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQ2xCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3RFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLHdGQUF3RjtJQUN4RixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUNmLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUN4RTtTQUNBLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUN6RCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQzdCLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUQsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztRQUNoRCxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FDbEQ7U0FDQSxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FDbEQsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUN4QyxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ3ZDLENBQUMsQ0FDSCxDQUFDO0lBRUosd0VBQXdFO0lBQ3hFLGdGQUFnRjtJQUNoRixJQUFJLGNBQWMsR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDbkMsT0FBTyxjQUFjLENBQUMsV0FBVyxDQUFDO0lBQ2xDLGNBQWM7UUFDWixZQUFZLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFaEUsc0VBQXNFO0lBQ3RFLDJFQUEyRTtJQUMzRSxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFO1FBQ3RFLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO1lBQy9CLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNqRSxVQUFVLEdBQUcseUJBQXlCLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQzFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQy9FO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLENBQUMsRUFBRTtnQkFDM0MsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDbEUsWUFBWSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDL0U7WUFDRCxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ2hELHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN6RDtZQUNELE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDekMsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3hFLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDakQ7U0FDRjtRQUNELElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPO1lBQzVCLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUMsRUFDcEU7WUFDQSxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUM5QixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RSxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN2QztTQUNGO0lBQ0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ1QsT0FBTyxjQUFjLENBQUM7QUFDeEIsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQzFCLE1BQU0sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEdBQUcsSUFBSSxFQUN4Qyx3QkFBNkMsSUFBSSxFQUFFLGVBQXlCLEVBQUU7SUFFOUUsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMscUJBQXFCLEVBQUU7UUFDL0MsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM3QztJQUNELElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1FBQUUsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FBRTtJQUM1RSxZQUFZLEdBQUcsQ0FBRSxHQUFHLFlBQVksRUFBRSxPQUFPLENBQUUsQ0FBQztJQUM1QyxJQUFJLFNBQVMsR0FBUSxJQUFJLENBQUM7SUFDMUIsSUFBSSxPQUFPLEtBQUssRUFBRSxFQUFFO1FBQ2xCLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDL0I7U0FBTTtRQUNMLE1BQU0sWUFBWSxHQUFHLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQy9FLElBQUksWUFBWSxLQUFLLE9BQU8sRUFBRTtZQUFFLFlBQVksR0FBRyxDQUFFLEdBQUcsWUFBWSxFQUFFLFlBQVksQ0FBRSxDQUFDO1NBQUU7UUFDbkYsU0FBUyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUM7WUFDbkMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztZQUNqQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUM7U0FDdkIsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxPQUFPLFdBQVcsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFO1FBQ3RFLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBRXZCLDJEQUEyRDtZQUMzRCxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVCLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUNoRCxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FDakQsRUFBRTtvQkFDRCxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQzVCLE1BQU0sRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUUsWUFBWSxDQUMxRSxDQUFDO29CQUNGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUN2QyxPQUFPLFNBQVMsQ0FBQztxQkFDbEI7eUJBQU07d0JBQ0wsTUFBTSxTQUFTLEdBQUcsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDO3dCQUNuQyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUM7d0JBQ3RCLE9BQU8sWUFBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDM0M7aUJBQ0Y7YUFDRjtZQUVELHNEQUFzRDtZQUV0RCwyQkFBMkI7WUFDM0IsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUFFLE9BQU8sWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQUU7WUFFakUscURBQXFEO1lBQ3JELElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDN0QsT0FBTywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM5QztTQUNGO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQyxFQUFFLElBQUksRUFBVSxPQUFPLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLE1BQU07SUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFBRSxPQUFPLE1BQU0sQ0FBQztLQUFFO0lBQ25FLElBQUksWUFBWSxHQUFHLFlBQVksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNsQyxNQUFNLFNBQVMsR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDaEMsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLFlBQVksR0FBRyxZQUFZLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3REO0lBQ0QsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLDBCQUEwQixDQUFDLE1BQU07SUFDL0MsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRSxJQUFJLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FDN0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxzQkFBc0IsQ0FBQztZQUNuRCxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQzFFLEVBQUU7WUFDRCxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUMvQyxPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDeEI7S0FDRjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnO1xuaW1wb3J0IHsgZm9yRWFjaCwgaGFzT3duLCBtZXJnZUZpbHRlcmVkT2JqZWN0IH0gZnJvbSAnLi91dGlsaXR5LmZ1bmN0aW9ucyc7XG5pbXBvcnQge1xuICBnZXRUeXBlLFxuICBoYXNWYWx1ZSxcbiAgaW5BcnJheSxcbiAgaXNBcnJheSxcbiAgaXNOdW1iZXIsXG4gIGlzT2JqZWN0LFxuICBpc1N0cmluZ1xuICB9IGZyb20gJy4vdmFsaWRhdG9yLmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBKc29uUG9pbnRlciB9IGZyb20gJy4vanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7IG1lcmdlU2NoZW1hcyB9IGZyb20gJy4vbWVyZ2Utc2NoZW1hcy5mdW5jdGlvbic7XG5cblxuLyoqXG4gKiBKU09OIFNjaGVtYSBmdW5jdGlvbiBsaWJyYXJ5OlxuICpcbiAqIGJ1aWxkU2NoZW1hRnJvbUxheW91dDogICBUT0RPOiBXcml0ZSB0aGlzIGZ1bmN0aW9uXG4gKlxuICogYnVpbGRTY2hlbWFGcm9tRGF0YTpcbiAqXG4gKiBnZXRGcm9tU2NoZW1hOlxuICpcbiAqIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXM6XG4gKlxuICogZ2V0SW5wdXRUeXBlOlxuICpcbiAqIGNoZWNrSW5saW5lVHlwZTpcbiAqXG4gKiBpc0lucHV0UmVxdWlyZWQ6XG4gKlxuICogdXBkYXRlSW5wdXRPcHRpb25zOlxuICpcbiAqIGdldFRpdGxlTWFwRnJvbU9uZU9mOlxuICpcbiAqIGdldENvbnRyb2xWYWxpZGF0b3JzOlxuICpcbiAqIHJlc29sdmVTY2hlbWFSZWZlcmVuY2VzOlxuICpcbiAqIGdldFN1YlNjaGVtYTpcbiAqXG4gKiBjb21iaW5lQWxsT2Y6XG4gKlxuICogZml4UmVxdWlyZWRBcnJheVByb3BlcnRpZXM6XG4gKi9cblxuLyoqXG4gKiAnYnVpbGRTY2hlbWFGcm9tTGF5b3V0JyBmdW5jdGlvblxuICpcbiAqIFRPRE86IEJ1aWxkIGEgSlNPTiBTY2hlbWEgZnJvbSBhIEpTT04gRm9ybSBsYXlvdXRcbiAqXG4gKiAvLyAgIGxheW91dCAtIFRoZSBKU09OIEZvcm0gbGF5b3V0XG4gKiAvLyAgLSBUaGUgbmV3IEpTT04gU2NoZW1hXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFNjaGVtYUZyb21MYXlvdXQobGF5b3V0KSB7XG4gIHJldHVybjtcbiAgLy8gbGV0IG5ld1NjaGVtYTogYW55ID0geyB9O1xuICAvLyBjb25zdCB3YWxrTGF5b3V0ID0gKGxheW91dEl0ZW1zOiBhbnlbXSwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogYW55W10gPT4ge1xuICAvLyAgIGxldCByZXR1cm5BcnJheTogYW55W10gPSBbXTtcbiAgLy8gICBmb3IgKGxldCBsYXlvdXRJdGVtIG9mIGxheW91dEl0ZW1zKSB7XG4gIC8vICAgICBjb25zdCByZXR1cm5JdGVtOiBhbnkgPSBjYWxsYmFjayhsYXlvdXRJdGVtKTtcbiAgLy8gICAgIGlmIChyZXR1cm5JdGVtKSB7IHJldHVybkFycmF5ID0gcmV0dXJuQXJyYXkuY29uY2F0KGNhbGxiYWNrKGxheW91dEl0ZW0pKTsgfVxuICAvLyAgICAgaWYgKGxheW91dEl0ZW0uaXRlbXMpIHtcbiAgLy8gICAgICAgcmV0dXJuQXJyYXkgPSByZXR1cm5BcnJheS5jb25jYXQod2Fsa0xheW91dChsYXlvdXRJdGVtLml0ZW1zLCBjYWxsYmFjaykpO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gcmV0dXJuQXJyYXk7XG4gIC8vIH07XG4gIC8vIHdhbGtMYXlvdXQobGF5b3V0LCBsYXlvdXRJdGVtID0+IHtcbiAgLy8gICBsZXQgaXRlbUtleTogc3RyaW5nO1xuICAvLyAgIGlmICh0eXBlb2YgbGF5b3V0SXRlbSA9PT0gJ3N0cmluZycpIHtcbiAgLy8gICAgIGl0ZW1LZXkgPSBsYXlvdXRJdGVtO1xuICAvLyAgIH0gZWxzZSBpZiAobGF5b3V0SXRlbS5rZXkpIHtcbiAgLy8gICAgIGl0ZW1LZXkgPSBsYXlvdXRJdGVtLmtleTtcbiAgLy8gICB9XG4gIC8vICAgaWYgKCFpdGVtS2V5KSB7IHJldHVybjsgfVxuICAvLyAgIC8vXG4gIC8vIH0pO1xufVxuXG4vKipcbiAqICdidWlsZFNjaGVtYUZyb21EYXRhJyBmdW5jdGlvblxuICpcbiAqIEJ1aWxkIGEgSlNPTiBTY2hlbWEgZnJvbSBhIGRhdGEgb2JqZWN0XG4gKlxuICogLy8gICBkYXRhIC0gVGhlIGRhdGEgb2JqZWN0XG4gKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSByZXF1aXJlQWxsRmllbGRzIC0gUmVxdWlyZSBhbGwgZmllbGRzP1xuICogLy8gIHsgYm9vbGVhbiA9IHRydWUgfSBpc1Jvb3QgLSBpcyByb290XG4gKiAvLyAgLSBUaGUgbmV3IEpTT04gU2NoZW1hXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFNjaGVtYUZyb21EYXRhKFxuICBkYXRhLCByZXF1aXJlQWxsRmllbGRzID0gZmFsc2UsIGlzUm9vdCA9IHRydWVcbikge1xuICBjb25zdCBuZXdTY2hlbWE6IGFueSA9IHt9O1xuICBjb25zdCBnZXRGaWVsZFR5cGUgPSAodmFsdWU6IGFueSk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgZmllbGRUeXBlID0gZ2V0VHlwZSh2YWx1ZSwgJ3N0cmljdCcpO1xuICAgIHJldHVybiB7IGludGVnZXI6ICdudW1iZXInLCBudWxsOiAnc3RyaW5nJyB9W2ZpZWxkVHlwZV0gfHwgZmllbGRUeXBlO1xuICB9O1xuICBjb25zdCBidWlsZFN1YlNjaGVtYSA9ICh2YWx1ZSkgPT5cbiAgICBidWlsZFNjaGVtYUZyb21EYXRhKHZhbHVlLCByZXF1aXJlQWxsRmllbGRzLCBmYWxzZSk7XG4gIGlmIChpc1Jvb3QpIHsgbmV3U2NoZW1hLiRzY2hlbWEgPSAnaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNi9zY2hlbWEjJzsgfVxuICBuZXdTY2hlbWEudHlwZSA9IGdldEZpZWxkVHlwZShkYXRhKTtcbiAgaWYgKG5ld1NjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgIG5ld1NjaGVtYS5wcm9wZXJ0aWVzID0ge307XG4gICAgaWYgKHJlcXVpcmVBbGxGaWVsZHMpIHsgbmV3U2NoZW1hLnJlcXVpcmVkID0gW107IH1cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhkYXRhKSkge1xuICAgICAgbmV3U2NoZW1hLnByb3BlcnRpZXNba2V5XSA9IGJ1aWxkU3ViU2NoZW1hKGRhdGFba2V5XSk7XG4gICAgICBpZiAocmVxdWlyZUFsbEZpZWxkcykgeyBuZXdTY2hlbWEucmVxdWlyZWQucHVzaChrZXkpOyB9XG4gICAgfVxuICB9IGVsc2UgaWYgKG5ld1NjaGVtYS50eXBlID09PSAnYXJyYXknKSB7XG4gICAgbmV3U2NoZW1hLml0ZW1zID0gZGF0YS5tYXAoYnVpbGRTdWJTY2hlbWEpO1xuICAgIC8vIElmIGFsbCBpdGVtcyBhcmUgdGhlIHNhbWUgdHlwZSwgdXNlIGFuIG9iamVjdCBmb3IgaXRlbXMgaW5zdGVhZCBvZiBhbiBhcnJheVxuICAgIGlmICgobmV3IFNldChkYXRhLm1hcChnZXRGaWVsZFR5cGUpKSkuc2l6ZSA9PT0gMSkge1xuICAgICAgbmV3U2NoZW1hLml0ZW1zID0gbmV3U2NoZW1hLml0ZW1zLnJlZHVjZSgoYSwgYikgPT4gKHsgLi4uYSwgLi4uYiB9KSwge30pO1xuICAgIH1cbiAgICBpZiAocmVxdWlyZUFsbEZpZWxkcykgeyBuZXdTY2hlbWEubWluSXRlbXMgPSAxOyB9XG4gIH1cbiAgcmV0dXJuIG5ld1NjaGVtYTtcbn1cblxuLyoqXG4gKiAnZ2V0RnJvbVNjaGVtYScgZnVuY3Rpb25cbiAqXG4gKiBVc2VzIGEgSlNPTiBQb2ludGVyIGZvciBhIHZhbHVlIHdpdGhpbiBhIGRhdGEgb2JqZWN0IHRvIHJldHJpZXZlXG4gKiB0aGUgc2NoZW1hIGZvciB0aGF0IHZhbHVlIHdpdGhpbiBzY2hlbWEgZm9yIHRoZSBkYXRhIG9iamVjdC5cbiAqXG4gKiBUaGUgb3B0aW9uYWwgdGhpcmQgcGFyYW1ldGVyIGNhbiBhbHNvIGJlIHNldCB0byByZXR1cm4gc29tZXRoaW5nIGVsc2U6XG4gKiAnc2NoZW1hJyAoZGVmYXVsdCk6IHRoZSBzY2hlbWEgZm9yIHRoZSB2YWx1ZSBpbmRpY2F0ZWQgYnkgdGhlIGRhdGEgcG9pbnRlclxuICogJ3BhcmVudFNjaGVtYSc6IHRoZSBzY2hlbWEgZm9yIHRoZSB2YWx1ZSdzIHBhcmVudCBvYmplY3Qgb3IgYXJyYXlcbiAqICdzY2hlbWFQb2ludGVyJzogYSBwb2ludGVyIHRvIHRoZSB2YWx1ZSdzIHNjaGVtYSB3aXRoaW4gdGhlIG9iamVjdCdzIHNjaGVtYVxuICogJ3BhcmVudFNjaGVtYVBvaW50ZXInOiBhIHBvaW50ZXIgdG8gdGhlIHNjaGVtYSBmb3IgdGhlIHZhbHVlJ3MgcGFyZW50IG9iamVjdCBvciBhcnJheVxuICpcbiAqIC8vICAgc2NoZW1hIC0gVGhlIHNjaGVtYSB0byBnZXQgdGhlIHN1Yi1zY2hlbWEgZnJvbVxuICogLy8gIHsgUG9pbnRlciB9IGRhdGFQb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gKiAvLyAgeyBzdHJpbmcgPSAnc2NoZW1hJyB9IHJldHVyblR5cGUgLSB3aGF0IHRvIHJldHVybj9cbiAqIC8vICAtIFRoZSBsb2NhdGVkIHN1Yi1zY2hlbWFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZyb21TY2hlbWEoc2NoZW1hLCBkYXRhUG9pbnRlciwgcmV0dXJuVHlwZSA9ICdzY2hlbWEnKSB7XG4gIGNvbnN0IGRhdGFQb2ludGVyQXJyYXk6IGFueVtdID0gSnNvblBvaW50ZXIucGFyc2UoZGF0YVBvaW50ZXIpO1xuICBpZiAoZGF0YVBvaW50ZXJBcnJheSA9PT0gbnVsbCkge1xuICAgIGNvbnNvbGUuZXJyb3IoYGdldEZyb21TY2hlbWEgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke2RhdGFQb2ludGVyfWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxldCBzdWJTY2hlbWEgPSBzY2hlbWE7XG4gIGNvbnN0IHNjaGVtYVBvaW50ZXIgPSBbXTtcbiAgY29uc3QgbGVuZ3RoID0gZGF0YVBvaW50ZXJBcnJheS5sZW5ndGg7XG4gIGlmIChyZXR1cm5UeXBlLnNsaWNlKDAsIDYpID09PSAncGFyZW50JykgeyBkYXRhUG9pbnRlckFycmF5Lmxlbmd0aC0tOyB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBwYXJlbnRTY2hlbWEgPSBzdWJTY2hlbWE7XG4gICAgY29uc3Qga2V5ID0gZGF0YVBvaW50ZXJBcnJheVtpXTtcbiAgICBsZXQgc3ViU2NoZW1hRm91bmQgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIHN1YlNjaGVtYSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldEZyb21TY2hlbWEgZXJyb3I6IFVuYWJsZSB0byBmaW5kIFwiJHtrZXl9XCIga2V5IGluIHNjaGVtYS5gKTtcbiAgICAgIGNvbnNvbGUuZXJyb3Ioc2NoZW1hKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZGF0YVBvaW50ZXIpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChzdWJTY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiAoIWlzTmFOKGtleSkgfHwga2V5ID09PSAnLScpKSB7XG4gICAgICBpZiAoaGFzT3duKHN1YlNjaGVtYSwgJ2l0ZW1zJykpIHtcbiAgICAgICAgaWYgKGlzT2JqZWN0KHN1YlNjaGVtYS5pdGVtcykpIHtcbiAgICAgICAgICBzdWJTY2hlbWFGb3VuZCA9IHRydWU7XG4gICAgICAgICAgc3ViU2NoZW1hID0gc3ViU2NoZW1hLml0ZW1zO1xuICAgICAgICAgIHNjaGVtYVBvaW50ZXIucHVzaCgnaXRlbXMnKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHN1YlNjaGVtYS5pdGVtcykpIHtcbiAgICAgICAgICBpZiAoIWlzTmFOKGtleSkgJiYgc3ViU2NoZW1hLml0ZW1zLmxlbmd0aCA+PSAra2V5KSB7XG4gICAgICAgICAgICBzdWJTY2hlbWFGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBzdWJTY2hlbWEgPSBzdWJTY2hlbWEuaXRlbXNbK2tleV07XG4gICAgICAgICAgICBzY2hlbWFQb2ludGVyLnB1c2goJ2l0ZW1zJywga2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghc3ViU2NoZW1hRm91bmQgJiYgaXNPYmplY3Qoc3ViU2NoZW1hLmFkZGl0aW9uYWxJdGVtcykpIHtcbiAgICAgICAgc3ViU2NoZW1hRm91bmQgPSB0cnVlO1xuICAgICAgICBzdWJTY2hlbWEgPSBzdWJTY2hlbWEuYWRkaXRpb25hbEl0ZW1zO1xuICAgICAgICBzY2hlbWFQb2ludGVyLnB1c2goJ2FkZGl0aW9uYWxJdGVtcycpO1xuICAgICAgfSBlbHNlIGlmIChzdWJTY2hlbWEuYWRkaXRpb25hbEl0ZW1zICE9PSBmYWxzZSkge1xuICAgICAgICBzdWJTY2hlbWFGb3VuZCA9IHRydWU7XG4gICAgICAgIHN1YlNjaGVtYSA9IHsgfTtcbiAgICAgICAgc2NoZW1hUG9pbnRlci5wdXNoKCdhZGRpdGlvbmFsSXRlbXMnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHN1YlNjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzT2JqZWN0KHN1YlNjaGVtYS5wcm9wZXJ0aWVzKSAmJiBoYXNPd24oc3ViU2NoZW1hLnByb3BlcnRpZXMsIGtleSkpIHtcbiAgICAgICAgc3ViU2NoZW1hRm91bmQgPSB0cnVlO1xuICAgICAgICBzdWJTY2hlbWEgPSBzdWJTY2hlbWEucHJvcGVydGllc1trZXldO1xuICAgICAgICBzY2hlbWFQb2ludGVyLnB1c2goJ3Byb3BlcnRpZXMnLCBrZXkpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChzdWJTY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpKSB7XG4gICAgICAgIHN1YlNjaGVtYUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgc3ViU2NoZW1hID0gc3ViU2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzO1xuICAgICAgICBzY2hlbWFQb2ludGVyLnB1c2goJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJyk7XG4gICAgICB9IGVsc2UgaWYgKHN1YlNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcyAhPT0gZmFsc2UpIHtcbiAgICAgICAgc3ViU2NoZW1hRm91bmQgPSB0cnVlO1xuICAgICAgICBzdWJTY2hlbWEgPSB7IH07XG4gICAgICAgIHNjaGVtYVBvaW50ZXIucHVzaCgnYWRkaXRpb25hbFByb3BlcnRpZXMnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFzdWJTY2hlbWFGb3VuZCkge1xuICAgICAgY29uc29sZS5lcnJvcihgZ2V0RnJvbVNjaGVtYSBlcnJvcjogVW5hYmxlIHRvIGZpbmQgXCIke2tleX1cIiBpdGVtIGluIHNjaGVtYS5gKTtcbiAgICAgIGNvbnNvbGUuZXJyb3Ioc2NoZW1hKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZGF0YVBvaW50ZXIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmV0dXJuVHlwZS5zbGljZSgtNykgPT09ICdQb2ludGVyJyA/IHNjaGVtYVBvaW50ZXIgOiBzdWJTY2hlbWE7XG59XG5cbi8qKlxuICogJ3JlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMnIGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGEgSlNPTiBQb2ludGVyIGFnYWluc3QgYSBtYXAgb2YgcmVjdXJzaXZlIHJlZmVyZW5jZXMgYW5kIHJldHVybnNcbiAqIGEgSlNPTiBQb2ludGVyIHRvIHRoZSBzaGFsbG93ZXN0IGVxdWl2YWxlbnQgbG9jYXRpb24gaW4gdGhlIHNhbWUgb2JqZWN0LlxuICpcbiAqIFVzaW5nIHRoaXMgZnVuY3Rpb25zIGVuYWJsZXMgYW4gb2JqZWN0IHRvIGJlIGNvbnN0cnVjdGVkIHdpdGggdW5saW1pdGVkXG4gKiByZWN1cnNpb24sIHdoaWxlIG1haW50YWluZyBhIGZpeGVkIHNldCBvZiBtZXRhZGF0YSwgc3VjaCBhcyBmaWVsZCBkYXRhIHR5cGVzLlxuICogVGhlIG9iamVjdCBjYW4gZ3JvdyBhcyBsYXJnZSBhcyBpdCB3YW50cywgYW5kIGRlZXBseSByZWN1cnNlZCBub2RlcyBjYW5cbiAqIGp1c3QgcmVmZXIgdG8gdGhlIG1ldGFkYXRhIGZvciB0aGVpciBzaGFsbG93IGVxdWl2YWxlbnRzLCBpbnN0ZWFkIG9mIGhhdmluZ1xuICogdG8gYWRkIGFkZGl0aW9uYWwgcmVkdW5kYW50IG1ldGFkYXRhIGZvciBlYWNoIHJlY3Vyc2l2ZWx5IGFkZGVkIG5vZGUuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBwb2ludGVyOiAgICAgICAgICcvc3R1ZmYvYW5kL21vcmUvYW5kL21vcmUvYW5kL21vcmUvYW5kL21vcmUvc3R1ZmYnXG4gKiByZWN1cnNpdmVSZWZNYXA6IFtbJy9zdHVmZi9hbmQvbW9yZS9hbmQvbW9yZScsICcvc3R1ZmYvYW5kL21vcmUvJ11dXG4gKiByZXR1cm5lZDogICAgICAgICcvc3R1ZmYvYW5kL21vcmUvc3R1ZmYnXG4gKlxuICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLVxuICogLy8gIHsgTWFwPHN0cmluZywgc3RyaW5nPiB9IHJlY3Vyc2l2ZVJlZk1hcCAtXG4gKiAvLyAgeyBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbmV3IE1hcCgpIH0gYXJyYXlNYXAgLSBvcHRpb25hbFxuICogLy8geyBzdHJpbmcgfSAtXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICBwb2ludGVyLCByZWN1cnNpdmVSZWZNYXAsIGFycmF5TWFwID0gbmV3IE1hcCgpXG4pIHtcbiAgaWYgKCFwb2ludGVyKSB7IHJldHVybiAnJzsgfVxuICBsZXQgZ2VuZXJpY1BvaW50ZXIgPVxuICAgIEpzb25Qb2ludGVyLnRvR2VuZXJpY1BvaW50ZXIoSnNvblBvaW50ZXIuY29tcGlsZShwb2ludGVyKSwgYXJyYXlNYXApO1xuICBpZiAoZ2VuZXJpY1BvaW50ZXIuaW5kZXhPZignLycpID09PSAtMSkgeyByZXR1cm4gZ2VuZXJpY1BvaW50ZXI7IH1cbiAgbGV0IHBvc3NpYmxlUmVmZXJlbmNlcyA9IHRydWU7XG4gIHdoaWxlIChwb3NzaWJsZVJlZmVyZW5jZXMpIHtcbiAgICBwb3NzaWJsZVJlZmVyZW5jZXMgPSBmYWxzZTtcbiAgICByZWN1cnNpdmVSZWZNYXAuZm9yRWFjaCgodG9Qb2ludGVyLCBmcm9tUG9pbnRlcikgPT4ge1xuICAgICAgaWYgKEpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcih0b1BvaW50ZXIsIGZyb21Qb2ludGVyKSkge1xuICAgICAgICB3aGlsZSAoSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKGZyb21Qb2ludGVyLCBnZW5lcmljUG9pbnRlciwgdHJ1ZSkpIHtcbiAgICAgICAgICBnZW5lcmljUG9pbnRlciA9IEpzb25Qb2ludGVyLnRvR2VuZXJpY1BvaW50ZXIoXG4gICAgICAgICAgICB0b1BvaW50ZXIgKyBnZW5lcmljUG9pbnRlci5zbGljZShmcm9tUG9pbnRlci5sZW5ndGgpLCBhcnJheU1hcFxuICAgICAgICAgICk7XG4gICAgICAgICAgcG9zc2libGVSZWZlcmVuY2VzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBnZW5lcmljUG9pbnRlcjtcbn1cblxuLyoqXG4gKiAnZ2V0SW5wdXRUeXBlJyBmdW5jdGlvblxuICpcbiAqIC8vICAgc2NoZW1hXG4gKiAvLyAgeyBhbnkgPSBudWxsIH0gbGF5b3V0Tm9kZVxuICogLy8geyBzdHJpbmcgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5wdXRUeXBlKHNjaGVtYSwgbGF5b3V0Tm9kZTogYW55ID0gbnVsbCkge1xuICAvLyB4LXNjaGVtYS1mb3JtID0gQW5ndWxhciBTY2hlbWEgRm9ybSBjb21wYXRpYmlsaXR5XG4gIC8vIHdpZGdldCAmIGNvbXBvbmVudCA9IFJlYWN0IEpzb25zY2hlbWEgRm9ybSBjb21wYXRpYmlsaXR5XG4gIGNvbnN0IGNvbnRyb2xUeXBlID0gSnNvblBvaW50ZXIuZ2V0Rmlyc3QoW1xuICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS90eXBlJ10sXG4gICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL3dpZGdldC9jb21wb25lbnQnXSxcbiAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vd2lkZ2V0J10sXG4gICAgW3NjaGVtYSwgJy93aWRnZXQvY29tcG9uZW50J10sXG4gICAgW3NjaGVtYSwgJy93aWRnZXQnXVxuICBdKTtcbiAgaWYgKGlzU3RyaW5nKGNvbnRyb2xUeXBlKSkgeyByZXR1cm4gY2hlY2tJbmxpbmVUeXBlKGNvbnRyb2xUeXBlLCBzY2hlbWEsIGxheW91dE5vZGUpOyB9XG4gIGxldCBzY2hlbWFUeXBlID0gc2NoZW1hLnR5cGU7XG4gIGlmIChzY2hlbWFUeXBlKSB7XG4gICAgaWYgKGlzQXJyYXkoc2NoZW1hVHlwZSkpIHsgLy8gSWYgbXVsdGlwbGUgdHlwZXMgbGlzdGVkLCB1c2UgbW9zdCBpbmNsdXNpdmUgdHlwZVxuICAgICAgc2NoZW1hVHlwZSA9XG4gICAgICAgIGluQXJyYXkoJ29iamVjdCcsIHNjaGVtYVR5cGUpICYmIGhhc093bihzY2hlbWEsICdwcm9wZXJ0aWVzJykgPyAnb2JqZWN0JyA6XG4gICAgICAgIGluQXJyYXkoJ2FycmF5Jywgc2NoZW1hVHlwZSkgJiYgaGFzT3duKHNjaGVtYSwgJ2l0ZW1zJykgPyAnYXJyYXknIDpcbiAgICAgICAgaW5BcnJheSgnYXJyYXknLCBzY2hlbWFUeXBlKSAmJiBoYXNPd24oc2NoZW1hLCAnYWRkaXRpb25hbEl0ZW1zJykgPyAnYXJyYXknIDpcbiAgICAgICAgaW5BcnJheSgnc3RyaW5nJywgc2NoZW1hVHlwZSkgPyAnc3RyaW5nJyA6XG4gICAgICAgIGluQXJyYXkoJ251bWJlcicsIHNjaGVtYVR5cGUpID8gJ251bWJlcicgOlxuICAgICAgICBpbkFycmF5KCdpbnRlZ2VyJywgc2NoZW1hVHlwZSkgPyAnaW50ZWdlcicgOlxuICAgICAgICBpbkFycmF5KCdib29sZWFuJywgc2NoZW1hVHlwZSkgPyAnYm9vbGVhbicgOiAndW5rbm93bic7XG4gICAgfVxuICAgIGlmIChzY2hlbWFUeXBlID09PSAnYm9vbGVhbicpIHsgcmV0dXJuICdjaGVja2JveCc7IH1cbiAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChoYXNPd24oc2NoZW1hLCAncHJvcGVydGllcycpIHx8IGhhc093bihzY2hlbWEsICdhZGRpdGlvbmFsUHJvcGVydGllcycpKSB7XG4gICAgICAgIHJldHVybiAnc2VjdGlvbic7XG4gICAgICB9XG4gICAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IGhvdyB0byBoYW5kbGUgYWRkaXRpb25hbFByb3BlcnRpZXNcbiAgICAgIGlmIChoYXNPd24oc2NoZW1hLCAnJHJlZicpKSB7IHJldHVybiAnJHJlZic7IH1cbiAgICB9XG4gICAgaWYgKHNjaGVtYVR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgIGNvbnN0IGl0ZW1zT2JqZWN0ID0gSnNvblBvaW50ZXIuZ2V0Rmlyc3QoW1xuICAgICAgICBbc2NoZW1hLCAnL2l0ZW1zJ10sXG4gICAgICAgIFtzY2hlbWEsICcvYWRkaXRpb25hbEl0ZW1zJ11cbiAgICAgIF0pIHx8IHt9O1xuICAgICAgcmV0dXJuIGhhc093bihpdGVtc09iamVjdCwgJ2VudW0nKSAmJiBzY2hlbWEubWF4SXRlbXMgIT09IDEgP1xuICAgICAgICBjaGVja0lubGluZVR5cGUoJ2NoZWNrYm94ZXMnLCBzY2hlbWEsIGxheW91dE5vZGUpIDogJ2FycmF5JztcbiAgICB9XG4gICAgaWYgKHNjaGVtYVR5cGUgPT09ICdudWxsJykgeyByZXR1cm4gJ25vbmUnOyB9XG4gICAgaWYgKEpzb25Qb2ludGVyLmhhcyhsYXlvdXROb2RlLCAnL29wdGlvbnMvdGl0bGVNYXAnKSB8fFxuICAgICAgaGFzT3duKHNjaGVtYSwgJ2VudW0nKSB8fCBnZXRUaXRsZU1hcEZyb21PbmVPZihzY2hlbWEsIG51bGwsIHRydWUpXG4gICAgKSB7IHJldHVybiAnc2VsZWN0JzsgfVxuICAgIGlmIChzY2hlbWFUeXBlID09PSAnbnVtYmVyJyB8fCBzY2hlbWFUeXBlID09PSAnaW50ZWdlcicpIHtcbiAgICAgIHJldHVybiAoc2NoZW1hVHlwZSA9PT0gJ2ludGVnZXInIHx8IGhhc093bihzY2hlbWEsICdtdWx0aXBsZU9mJykpICYmXG4gICAgICAgIGhhc093bihzY2hlbWEsICdtYXhpbXVtJykgJiYgaGFzT3duKHNjaGVtYSwgJ21pbmltdW0nKSA/ICdyYW5nZScgOiBzY2hlbWFUeXBlO1xuICAgIH1cbiAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICdjb2xvcic6ICdjb2xvcicsXG4gICAgICAgICdkYXRlJzogJ2RhdGUnLFxuICAgICAgICAnZGF0ZS10aW1lJzogJ2RhdGV0aW1lLWxvY2FsJyxcbiAgICAgICAgJ2VtYWlsJzogJ2VtYWlsJyxcbiAgICAgICAgJ3VyaSc6ICd1cmwnLFxuICAgICAgfVtzY2hlbWEuZm9ybWF0XSB8fCAndGV4dCc7XG4gICAgfVxuICB9XG4gIGlmIChoYXNPd24oc2NoZW1hLCAnJHJlZicpKSB7IHJldHVybiAnJHJlZic7IH1cbiAgaWYgKGlzQXJyYXkoc2NoZW1hLm9uZU9mKSB8fCBpc0FycmF5KHNjaGVtYS5hbnlPZikpIHsgcmV0dXJuICdvbmUtb2YnOyB9XG4gIGNvbnNvbGUuZXJyb3IoYGdldElucHV0VHlwZSBlcnJvcjogVW5hYmxlIHRvIGRldGVybWluZSBpbnB1dCB0eXBlIGZvciAke3NjaGVtYVR5cGV9YCk7XG4gIGNvbnNvbGUuZXJyb3IoJ3NjaGVtYScsIHNjaGVtYSk7XG4gIGlmIChsYXlvdXROb2RlKSB7IGNvbnNvbGUuZXJyb3IoJ2xheW91dE5vZGUnLCBsYXlvdXROb2RlKTsgfVxuICByZXR1cm4gJ25vbmUnO1xufVxuXG4vKipcbiAqICdjaGVja0lubGluZVR5cGUnIGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGxheW91dCBhbmQgc2NoZW1hIG5vZGVzIGZvciAnaW5saW5lOiB0cnVlJywgYW5kIGNvbnZlcnRzXG4gKiAncmFkaW9zJyBvciAnY2hlY2tib3hlcycgdG8gJ3JhZGlvcy1pbmxpbmUnIG9yICdjaGVja2JveGVzLWlubGluZSdcbiAqXG4gKiAvLyAgeyBzdHJpbmcgfSBjb250cm9sVHlwZSAtXG4gKiAvLyAgIHNjaGVtYSAtXG4gKiAvLyAgeyBhbnkgPSBudWxsIH0gbGF5b3V0Tm9kZSAtXG4gKiAvLyB7IHN0cmluZyB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lubGluZVR5cGUoY29udHJvbFR5cGUsIHNjaGVtYSwgbGF5b3V0Tm9kZTogYW55ID0gbnVsbCkge1xuICBpZiAoIWlzU3RyaW5nKGNvbnRyb2xUeXBlKSB8fCAoXG4gICAgY29udHJvbFR5cGUuc2xpY2UoMCwgOCkgIT09ICdjaGVja2JveCcgJiYgY29udHJvbFR5cGUuc2xpY2UoMCwgNSkgIT09ICdyYWRpbydcbiAgKSkge1xuICAgIHJldHVybiBjb250cm9sVHlwZTtcbiAgfVxuICBpZiAoXG4gICAgSnNvblBvaW50ZXIuZ2V0Rmlyc3QoW1xuICAgICAgW2xheW91dE5vZGUsICcvaW5saW5lJ10sXG4gICAgICBbbGF5b3V0Tm9kZSwgJy9vcHRpb25zL2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS9vcHRpb25zL2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL3dpZGdldC9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS93aWRnZXQvY29tcG9uZW50L2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL3dpZGdldC9jb21wb25lbnQvb3B0aW9ucy9pbmxpbmUnXSxcbiAgICAgIFtzY2hlbWEsICcvd2lkZ2V0L2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy93aWRnZXQvY29tcG9uZW50L2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy93aWRnZXQvY29tcG9uZW50L29wdGlvbnMvaW5saW5lJ10sXG4gICAgXSkgPT09IHRydWVcbiAgKSB7XG4gICAgcmV0dXJuIGNvbnRyb2xUeXBlLnNsaWNlKDAsIDUpID09PSAncmFkaW8nID9cbiAgICAgICdyYWRpb3MtaW5saW5lJyA6ICdjaGVja2JveGVzLWlubGluZSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNvbnRyb2xUeXBlO1xuICB9XG59XG5cbi8qKlxuICogJ2lzSW5wdXRSZXF1aXJlZCcgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgYSBKU09OIFNjaGVtYSB0byBzZWUgaWYgYW4gaXRlbSBpcyByZXF1aXJlZFxuICpcbiAqIC8vICAgc2NoZW1hIC0gdGhlIHNjaGVtYSB0byBjaGVja1xuICogLy8gIHsgc3RyaW5nIH0gc2NoZW1hUG9pbnRlciAtIHRoZSBwb2ludGVyIHRvIHRoZSBpdGVtIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgdGhlIGl0ZW0gaXMgcmVxdWlyZWQsIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJbnB1dFJlcXVpcmVkKHNjaGVtYSwgc2NoZW1hUG9pbnRlcikge1xuICBpZiAoIWlzT2JqZWN0KHNjaGVtYSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdpc0lucHV0UmVxdWlyZWQgZXJyb3I6IElucHV0IHNjaGVtYSBtdXN0IGJlIGFuIG9iamVjdC4nKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgbGlzdFBvaW50ZXJBcnJheSA9IEpzb25Qb2ludGVyLnBhcnNlKHNjaGVtYVBvaW50ZXIpO1xuICBpZiAoaXNBcnJheShsaXN0UG9pbnRlckFycmF5KSkge1xuICAgIGlmICghbGlzdFBvaW50ZXJBcnJheS5sZW5ndGgpIHsgcmV0dXJuIHNjaGVtYS5yZXF1aXJlZCA9PT0gdHJ1ZTsgfVxuICAgIGNvbnN0IGtleU5hbWUgPSBsaXN0UG9pbnRlckFycmF5LnBvcCgpO1xuICAgIGNvbnN0IG5leHRUb0xhc3RLZXkgPSBsaXN0UG9pbnRlckFycmF5W2xpc3RQb2ludGVyQXJyYXkubGVuZ3RoIC0gMV07XG4gICAgaWYgKFsncHJvcGVydGllcycsICdhZGRpdGlvbmFsUHJvcGVydGllcycsICdwYXR0ZXJuUHJvcGVydGllcycsICdpdGVtcycsICdhZGRpdGlvbmFsSXRlbXMnXVxuICAgICAgLmluY2x1ZGVzKG5leHRUb0xhc3RLZXkpXG4gICAgKSB7XG4gICAgICBsaXN0UG9pbnRlckFycmF5LnBvcCgpO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnRTY2hlbWEgPSBKc29uUG9pbnRlci5nZXQoc2NoZW1hLCBsaXN0UG9pbnRlckFycmF5KSB8fCB7fTtcbiAgICBpZiAoaXNBcnJheShwYXJlbnRTY2hlbWEucmVxdWlyZWQpKSB7XG4gICAgICByZXR1cm4gcGFyZW50U2NoZW1hLnJlcXVpcmVkLmluY2x1ZGVzKGtleU5hbWUpO1xuICAgIH1cbiAgICBpZiAocGFyZW50U2NoZW1hLnR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgIHJldHVybiBoYXNPd24ocGFyZW50U2NoZW1hLCAnbWluSXRlbXMnKSAmJlxuICAgICAgICBpc051bWJlcihrZXlOYW1lKSAmJlxuICAgICAgICArcGFyZW50U2NoZW1hLm1pbkl0ZW1zID4gK2tleU5hbWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiAndXBkYXRlSW5wdXRPcHRpb25zJyBmdW5jdGlvblxuICpcbiAqIC8vICAgbGF5b3V0Tm9kZVxuICogLy8gICBzY2hlbWFcbiAqIC8vICAganNmXG4gKiAvLyB7IHZvaWQgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlSW5wdXRPcHRpb25zKGxheW91dE5vZGUsIHNjaGVtYSwganNmKSB7XG4gIGlmICghaXNPYmplY3QobGF5b3V0Tm9kZSkgfHwgIWlzT2JqZWN0KGxheW91dE5vZGUub3B0aW9ucykpIHsgcmV0dXJuOyB9XG5cbiAgLy8gU2V0IGFsbCBvcHRpb24gdmFsdWVzIGluIGxheW91dE5vZGUub3B0aW9uc1xuICBjb25zdCBuZXdPcHRpb25zOiBhbnkgPSB7IH07XG4gIGNvbnN0IGZpeFVpS2V5cyA9IGtleSA9PiBrZXkuc2xpY2UoMCwgMykudG9Mb3dlckNhc2UoKSA9PT0gJ3VpOicgPyBrZXkuc2xpY2UoMykgOiBrZXk7XG4gIG1lcmdlRmlsdGVyZWRPYmplY3QobmV3T3B0aW9ucywganNmLmZvcm1PcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnMsIFtdLCBmaXhVaUtleXMpO1xuICBbIFsgSnNvblBvaW50ZXIuZ2V0KHNjaGVtYSwgJy91aTp3aWRnZXQvb3B0aW9ucycpLCBbXSBdLFxuICAgIFsgSnNvblBvaW50ZXIuZ2V0KHNjaGVtYSwgJy91aTp3aWRnZXQnKSwgW10gXSxcbiAgICBbIHNjaGVtYSwgW1xuICAgICAgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJywgJ2FkZGl0aW9uYWxJdGVtcycsICdwcm9wZXJ0aWVzJywgJ2l0ZW1zJyxcbiAgICAgICdyZXF1aXJlZCcsICd0eXBlJywgJ3gtc2NoZW1hLWZvcm0nLCAnJHJlZidcbiAgICBdIF0sXG4gICAgWyBKc29uUG9pbnRlci5nZXQoc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vb3B0aW9ucycpLCBbXSBdLFxuICAgIFsgSnNvblBvaW50ZXIuZ2V0KHNjaGVtYSwgJy94LXNjaGVtYS1mb3JtJyksIFsnaXRlbXMnLCAnb3B0aW9ucyddIF0sXG4gICAgWyBsYXlvdXROb2RlLCBbXG4gICAgICAnX2lkJywgJyRyZWYnLCAnYXJyYXlJdGVtJywgJ2FycmF5SXRlbVR5cGUnLCAnZGF0YVBvaW50ZXInLCAnZGF0YVR5cGUnLFxuICAgICAgJ2l0ZW1zJywgJ2tleScsICduYW1lJywgJ29wdGlvbnMnLCAncmVjdXJzaXZlUmVmZXJlbmNlJywgJ3R5cGUnLCAnd2lkZ2V0J1xuICAgIF0gXSxcbiAgICBbIGxheW91dE5vZGUub3B0aW9ucywgW10gXSxcbiAgXS5mb3JFYWNoKChbIG9iamVjdCwgZXhjbHVkZUtleXMgXSkgPT5cbiAgICBtZXJnZUZpbHRlcmVkT2JqZWN0KG5ld09wdGlvbnMsIG9iamVjdCwgZXhjbHVkZUtleXMsIGZpeFVpS2V5cylcbiAgKTtcbiAgaWYgKCFoYXNPd24obmV3T3B0aW9ucywgJ3RpdGxlTWFwJykpIHtcbiAgICBsZXQgbmV3VGl0bGVNYXA6IGFueSA9IG51bGw7XG4gICAgbmV3VGl0bGVNYXAgPSBnZXRUaXRsZU1hcEZyb21PbmVPZihzY2hlbWEsIG5ld09wdGlvbnMuZmxhdExpc3QpO1xuICAgIGlmIChuZXdUaXRsZU1hcCkgeyBuZXdPcHRpb25zLnRpdGxlTWFwID0gbmV3VGl0bGVNYXA7IH1cbiAgICBpZiAoIWhhc093bihuZXdPcHRpb25zLCAndGl0bGVNYXAnKSAmJiAhaGFzT3duKG5ld09wdGlvbnMsICdlbnVtJykgJiYgaGFzT3duKHNjaGVtYSwgJ2l0ZW1zJykpIHtcbiAgICAgIGlmIChKc29uUG9pbnRlci5oYXMoc2NoZW1hLCAnL2l0ZW1zL3RpdGxlTWFwJykpIHtcbiAgICAgICAgbmV3T3B0aW9ucy50aXRsZU1hcCA9IHNjaGVtYS5pdGVtcy50aXRsZU1hcDtcbiAgICAgIH0gZWxzZSBpZiAoSnNvblBvaW50ZXIuaGFzKHNjaGVtYSwgJy9pdGVtcy9lbnVtJykpIHtcbiAgICAgICAgbmV3T3B0aW9ucy5lbnVtID0gc2NoZW1hLml0ZW1zLmVudW07XG4gICAgICAgIGlmICghaGFzT3duKG5ld09wdGlvbnMsICdlbnVtTmFtZXMnKSAmJiBKc29uUG9pbnRlci5oYXMoc2NoZW1hLCAnL2l0ZW1zL2VudW1OYW1lcycpKSB7XG4gICAgICAgICAgbmV3T3B0aW9ucy5lbnVtTmFtZXMgPSBzY2hlbWEuaXRlbXMuZW51bU5hbWVzO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKEpzb25Qb2ludGVyLmhhcyhzY2hlbWEsICcvaXRlbXMvb25lT2YnKSkge1xuICAgICAgICBuZXdUaXRsZU1hcCA9IGdldFRpdGxlTWFwRnJvbU9uZU9mKHNjaGVtYS5pdGVtcywgbmV3T3B0aW9ucy5mbGF0TGlzdCk7XG4gICAgICAgIGlmIChuZXdUaXRsZU1hcCkgeyBuZXdPcHRpb25zLnRpdGxlTWFwID0gbmV3VGl0bGVNYXA7IH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBJZiBzY2hlbWEgdHlwZSBpcyBpbnRlZ2VyLCBlbmZvcmNlIGJ5IHNldHRpbmcgbXVsdGlwbGVPZiA9IDFcbiAgaWYgKHNjaGVtYS50eXBlID09PSAnaW50ZWdlcicgJiYgIWhhc1ZhbHVlKG5ld09wdGlvbnMubXVsdGlwbGVPZikpIHtcbiAgICBuZXdPcHRpb25zLm11bHRpcGxlT2YgPSAxO1xuICB9XG5cbiAgLy8gQ29weSBhbnkgdHlwZWFoZWFkIHdvcmQgbGlzdHMgdG8gb3B0aW9ucy50eXBlYWhlYWQuc291cmNlXG4gIGlmIChKc29uUG9pbnRlci5oYXMobmV3T3B0aW9ucywgJy9hdXRvY29tcGxldGUvc291cmNlJykpIHtcbiAgICBuZXdPcHRpb25zLnR5cGVhaGVhZCA9IG5ld09wdGlvbnMuYXV0b2NvbXBsZXRlO1xuICB9IGVsc2UgaWYgKEpzb25Qb2ludGVyLmhhcyhuZXdPcHRpb25zLCAnL3RhZ3NpbnB1dC9zb3VyY2UnKSkge1xuICAgIG5ld09wdGlvbnMudHlwZWFoZWFkID0gbmV3T3B0aW9ucy50YWdzaW5wdXQ7XG4gIH0gZWxzZSBpZiAoSnNvblBvaW50ZXIuaGFzKG5ld09wdGlvbnMsICcvdGFnc2lucHV0L3R5cGVhaGVhZC9zb3VyY2UnKSkge1xuICAgIG5ld09wdGlvbnMudHlwZWFoZWFkID0gbmV3T3B0aW9ucy50YWdzaW5wdXQudHlwZWFoZWFkO1xuICB9XG5cbiAgbGF5b3V0Tm9kZS5vcHRpb25zID0gbmV3T3B0aW9ucztcbn1cblxuLyoqXG4gKiAnZ2V0VGl0bGVNYXBGcm9tT25lT2YnIGZ1bmN0aW9uXG4gKlxuICogLy8gIHsgc2NoZW1hIH0gc2NoZW1hXG4gKiAvLyAgeyBib29sZWFuID0gbnVsbCB9IGZsYXRMaXN0XG4gKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSB2YWxpZGF0ZU9ubHlcbiAqIC8vIHsgdmFsaWRhdG9ycyB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUaXRsZU1hcEZyb21PbmVPZihcbiAgc2NoZW1hOiBhbnkgPSB7fSwgZmxhdExpc3Q6IGJvb2xlYW4gPSBudWxsLCB2YWxpZGF0ZU9ubHkgPSBmYWxzZVxuKSB7XG4gIGxldCB0aXRsZU1hcCA9IG51bGw7XG4gIGNvbnN0IG9uZU9mID0gc2NoZW1hLm9uZU9mIHx8IHNjaGVtYS5hbnlPZiB8fCBudWxsO1xuICBpZiAoaXNBcnJheShvbmVPZikgJiYgb25lT2YuZXZlcnkoaXRlbSA9PiBpdGVtLnRpdGxlKSkge1xuICAgIGlmIChvbmVPZi5ldmVyeShpdGVtID0+IGlzQXJyYXkoaXRlbS5lbnVtKSAmJiBpdGVtLmVudW0ubGVuZ3RoID09PSAxKSkge1xuICAgICAgaWYgKHZhbGlkYXRlT25seSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgdGl0bGVNYXAgPSBvbmVPZi5tYXAoaXRlbSA9PiAoeyBuYW1lOiBpdGVtLnRpdGxlLCB2YWx1ZTogaXRlbS5lbnVtWzBdIH0pKTtcbiAgICB9IGVsc2UgaWYgKG9uZU9mLmV2ZXJ5KGl0ZW0gPT4gaXRlbS5jb25zdCkpIHtcbiAgICAgIGlmICh2YWxpZGF0ZU9ubHkpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIHRpdGxlTWFwID0gb25lT2YubWFwKGl0ZW0gPT4gKHsgbmFtZTogaXRlbS50aXRsZSwgdmFsdWU6IGl0ZW0uY29uc3QgfSkpO1xuICAgIH1cblxuICAgIC8vIGlmIGZsYXRMaXN0ICE9PSBmYWxzZSBhbmQgc29tZSBpdGVtcyBoYXZlIGNvbG9ucywgbWFrZSBncm91cGVkIG1hcFxuICAgIGlmIChmbGF0TGlzdCAhPT0gZmFsc2UgJiYgKHRpdGxlTWFwIHx8IFtdKVxuICAgICAgLmZpbHRlcih0aXRsZSA9PiAoKHRpdGxlIHx8IHt9KS5uYW1lIHx8ICcnKS5pbmRleE9mKCc6ICcpKS5sZW5ndGggPiAxXG4gICAgKSB7XG5cbiAgICAgIC8vIFNwbGl0IG5hbWUgb24gZmlyc3QgY29sb24gdG8gY3JlYXRlIGdyb3VwZWQgbWFwIChuYW1lIC0+IGdyb3VwOiBuYW1lKVxuICAgICAgY29uc3QgbmV3VGl0bGVNYXAgPSB0aXRsZU1hcC5tYXAodGl0bGUgPT4ge1xuICAgICAgICBjb25zdCBbZ3JvdXAsIG5hbWVdID0gdGl0bGUubmFtZS5zcGxpdCgvOiAoLispLyk7XG4gICAgICAgIHJldHVybiBncm91cCAmJiBuYW1lID8geyAuLi50aXRsZSwgZ3JvdXAsIG5hbWUgfSA6IHRpdGxlO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIElmIGZsYXRMaXN0ID09PSB0cnVlIG9yIGF0IGxlYXN0IG9uZSBncm91cCBoYXMgbXVsdGlwbGUgaXRlbXMsIHVzZSBncm91cGVkIG1hcFxuICAgICAgaWYgKGZsYXRMaXN0ID09PSB0cnVlIHx8IG5ld1RpdGxlTWFwLnNvbWUoKHRpdGxlLCBpbmRleCkgPT4gaW5kZXggJiZcbiAgICAgICAgaGFzT3duKHRpdGxlLCAnZ3JvdXAnKSAmJiB0aXRsZS5ncm91cCA9PT0gbmV3VGl0bGVNYXBbaW5kZXggLSAxXS5ncm91cFxuICAgICAgKSkge1xuICAgICAgICB0aXRsZU1hcCA9IG5ld1RpdGxlTWFwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsaWRhdGVPbmx5ID8gZmFsc2UgOiB0aXRsZU1hcDtcbn1cblxuLyoqXG4gKiAnZ2V0Q29udHJvbFZhbGlkYXRvcnMnIGZ1bmN0aW9uXG4gKlxuICogLy8gIHNjaGVtYVxuICogLy8geyB2YWxpZGF0b3JzIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRyb2xWYWxpZGF0b3JzKHNjaGVtYSkge1xuICBpZiAoIWlzT2JqZWN0KHNjaGVtYSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgY29uc3QgdmFsaWRhdG9yczogYW55ID0geyB9O1xuICBpZiAoaGFzT3duKHNjaGVtYSwgJ3R5cGUnKSkge1xuICAgIHN3aXRjaCAoc2NoZW1hLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIGZvckVhY2goWydwYXR0ZXJuJywgJ2Zvcm1hdCcsICdtaW5MZW5ndGgnLCAnbWF4TGVuZ3RoJ10sIChwcm9wKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bihzY2hlbWEsIHByb3ApKSB7IHZhbGlkYXRvcnNbcHJvcF0gPSBbc2NoZW1hW3Byb3BdXTsgfVxuICAgICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbnVtYmVyJzogY2FzZSAnaW50ZWdlcic6XG4gICAgICAgIGZvckVhY2goWydNaW5pbXVtJywgJ01heGltdW0nXSwgKHVjTGltaXQpID0+IHtcbiAgICAgICAgICBjb25zdCBlTGltaXQgPSAnZXhjbHVzaXZlJyArIHVjTGltaXQ7XG4gICAgICAgICAgY29uc3QgbGltaXQgPSB1Y0xpbWl0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgaWYgKGhhc093bihzY2hlbWEsIGxpbWl0KSkge1xuICAgICAgICAgICAgY29uc3QgZXhjbHVzaXZlID0gaGFzT3duKHNjaGVtYSwgZUxpbWl0KSAmJiBzY2hlbWFbZUxpbWl0XSA9PT0gdHJ1ZTtcbiAgICAgICAgICAgIHZhbGlkYXRvcnNbbGltaXRdID0gW3NjaGVtYVtsaW1pdF0sIGV4Y2x1c2l2ZV07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZm9yRWFjaChbJ211bHRpcGxlT2YnLCAndHlwZSddLCAocHJvcCkgPT4ge1xuICAgICAgICAgIGlmIChoYXNPd24oc2NoZW1hLCBwcm9wKSkgeyB2YWxpZGF0b3JzW3Byb3BdID0gW3NjaGVtYVtwcm9wXV07IH1cbiAgICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIGZvckVhY2goWydtaW5Qcm9wZXJ0aWVzJywgJ21heFByb3BlcnRpZXMnLCAnZGVwZW5kZW5jaWVzJ10sIChwcm9wKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bihzY2hlbWEsIHByb3ApKSB7IHZhbGlkYXRvcnNbcHJvcF0gPSBbc2NoZW1hW3Byb3BdXTsgfVxuICAgICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICBmb3JFYWNoKFsnbWluSXRlbXMnLCAnbWF4SXRlbXMnLCAndW5pcXVlSXRlbXMnXSwgKHByb3ApID0+IHtcbiAgICAgICAgICBpZiAoaGFzT3duKHNjaGVtYSwgcHJvcCkpIHsgdmFsaWRhdG9yc1twcm9wXSA9IFtzY2hlbWFbcHJvcF1dOyB9XG4gICAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChoYXNPd24oc2NoZW1hLCAnZW51bScpKSB7IHZhbGlkYXRvcnMuZW51bSA9IFtzY2hlbWEuZW51bV07IH1cbiAgcmV0dXJuIHZhbGlkYXRvcnM7XG59XG5cbi8qKlxuICogJ3Jlc29sdmVTY2hlbWFSZWZlcmVuY2VzJyBmdW5jdGlvblxuICpcbiAqIEZpbmQgYWxsICRyZWYgbGlua3MgaW4gc2NoZW1hIGFuZCBzYXZlIGxpbmtzIGFuZCByZWZlcmVuY2VkIHNjaGVtYXMgaW5cbiAqIHNjaGVtYVJlZkxpYnJhcnksIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgYW5kIGRhdGFSZWN1cnNpdmVSZWZNYXBcbiAqXG4gKiAvLyAgc2NoZW1hXG4gKiAvLyAgc2NoZW1hUmVmTGlicmFyeVxuICogLy8geyBNYXA8c3RyaW5nLCBzdHJpbmc+IH0gc2NoZW1hUmVjdXJzaXZlUmVmTWFwXG4gKiAvLyB7IE1hcDxzdHJpbmcsIHN0cmluZz4gfSBkYXRhUmVjdXJzaXZlUmVmTWFwXG4gKiAvLyB7IE1hcDxzdHJpbmcsIG51bWJlcj4gfSBhcnJheU1hcFxuICogLy9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVTY2hlbWFSZWZlcmVuY2VzKFxuICBzY2hlbWEsIHNjaGVtYVJlZkxpYnJhcnksIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgZGF0YVJlY3Vyc2l2ZVJlZk1hcCwgYXJyYXlNYXBcbikge1xuICBpZiAoIWlzT2JqZWN0KHNjaGVtYSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdyZXNvbHZlU2NoZW1hUmVmZXJlbmNlcyBlcnJvcjogc2NoZW1hIG11c3QgYmUgYW4gb2JqZWN0LicpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCByZWZMaW5rcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCByZWZNYXBTZXQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgcmVmTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgY29uc3QgcmVjdXJzaXZlUmVmTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgY29uc3QgcmVmTGlicmFyeTogYW55ID0ge307XG5cbiAgLy8gU2VhcmNoIHNjaGVtYSBmb3IgYWxsICRyZWYgbGlua3MsIGFuZCBidWlsZCBmdWxsIHJlZkxpYnJhcnlcbiAgSnNvblBvaW50ZXIuZm9yRWFjaERlZXAoc2NoZW1hLCAoc3ViU2NoZW1hLCBzdWJTY2hlbWFQb2ludGVyKSA9PiB7XG4gICAgaWYgKGhhc093bihzdWJTY2hlbWEsICckcmVmJykgJiYgaXNTdHJpbmcoc3ViU2NoZW1hWyckcmVmJ10pKSB7XG4gICAgICBjb25zdCByZWZQb2ludGVyID0gSnNvblBvaW50ZXIuY29tcGlsZShzdWJTY2hlbWFbJyRyZWYnXSk7XG4gICAgICByZWZMaW5rcy5hZGQocmVmUG9pbnRlcik7XG4gICAgICByZWZNYXBTZXQuYWRkKHN1YlNjaGVtYVBvaW50ZXIgKyAnfn4nICsgcmVmUG9pbnRlcik7XG4gICAgICByZWZNYXAuc2V0KHN1YlNjaGVtYVBvaW50ZXIsIHJlZlBvaW50ZXIpO1xuICAgIH1cbiAgfSk7XG4gIHJlZkxpbmtzLmZvckVhY2gocmVmID0+IHJlZkxpYnJhcnlbcmVmXSA9IGdldFN1YlNjaGVtYShzY2hlbWEsIHJlZikpO1xuXG4gIC8vIEZvbGxvdyBhbGwgcmVmIGxpbmtzIGFuZCBzYXZlIGluIHJlZk1hcFNldCxcbiAgLy8gdG8gZmluZCBhbnkgbXVsdGktbGluayByZWN1cnNpdmUgcmVmZXJuY2VzXG4gIGxldCBjaGVja1JlZkxpbmtzID0gdHJ1ZTtcbiAgd2hpbGUgKGNoZWNrUmVmTGlua3MpIHtcbiAgICBjaGVja1JlZkxpbmtzID0gZmFsc2U7XG4gICAgQXJyYXkuZnJvbShyZWZNYXApLmZvckVhY2goKFtmcm9tUmVmMSwgdG9SZWYxXSkgPT4gQXJyYXkuZnJvbShyZWZNYXApXG4gICAgICAuZmlsdGVyKChbZnJvbVJlZjIsIHRvUmVmMl0pID0+XG4gICAgICAgIEpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcih0b1JlZjEsIGZyb21SZWYyLCB0cnVlKSAmJlxuICAgICAgICAhSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKHRvUmVmMiwgdG9SZWYxLCB0cnVlKSAmJlxuICAgICAgICAhcmVmTWFwU2V0Lmhhcyhmcm9tUmVmMSArIGZyb21SZWYyLnNsaWNlKHRvUmVmMS5sZW5ndGgpICsgJ35+JyArIHRvUmVmMilcbiAgICAgIClcbiAgICAgIC5mb3JFYWNoKChbZnJvbVJlZjIsIHRvUmVmMl0pID0+IHtcbiAgICAgICAgcmVmTWFwU2V0LmFkZChmcm9tUmVmMSArIGZyb21SZWYyLnNsaWNlKHRvUmVmMS5sZW5ndGgpICsgJ35+JyArIHRvUmVmMik7XG4gICAgICAgIGNoZWNrUmVmTGlua3MgPSB0cnVlO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgLy8gQnVpbGQgZnVsbCByZWN1cnNpdmVSZWZNYXBcbiAgLy8gRmlyc3QgcGFzcyAtIHNhdmUgYWxsIGludGVybmFsbHkgcmVjdXJzaXZlIHJlZnMgZnJvbSByZWZNYXBTZXRcbiAgQXJyYXkuZnJvbShyZWZNYXBTZXQpXG4gICAgLm1hcChyZWZMaW5rID0+IHJlZkxpbmsuc3BsaXQoJ35+JykpXG4gICAgLmZpbHRlcigoW2Zyb21SZWYsIHRvUmVmXSkgPT4gSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKHRvUmVmLCBmcm9tUmVmKSlcbiAgICAuZm9yRWFjaCgoW2Zyb21SZWYsIHRvUmVmXSkgPT4gcmVjdXJzaXZlUmVmTWFwLnNldChmcm9tUmVmLCB0b1JlZikpO1xuICAvLyBTZWNvbmQgcGFzcyAtIGNyZWF0ZSByZWN1cnNpdmUgdmVyc2lvbnMgb2YgYW55IG90aGVyIHJlZnMgdGhhdCBsaW5rIHRvIHJlY3Vyc2l2ZSByZWZzXG4gIEFycmF5LmZyb20ocmVmTWFwKVxuICAgIC5maWx0ZXIoKFtmcm9tUmVmMSwgdG9SZWYxXSkgPT4gQXJyYXkuZnJvbShyZWN1cnNpdmVSZWZNYXAua2V5cygpKVxuICAgICAgLmV2ZXJ5KGZyb21SZWYyID0+ICFKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIoZnJvbVJlZjEsIGZyb21SZWYyLCB0cnVlKSlcbiAgICApXG4gICAgLmZvckVhY2goKFtmcm9tUmVmMSwgdG9SZWYxXSkgPT4gQXJyYXkuZnJvbShyZWN1cnNpdmVSZWZNYXApXG4gICAgICAuZmlsdGVyKChbZnJvbVJlZjIsIHRvUmVmMl0pID0+XG4gICAgICAgICFyZWN1cnNpdmVSZWZNYXAuaGFzKGZyb21SZWYxICsgZnJvbVJlZjIuc2xpY2UodG9SZWYxLmxlbmd0aCkpICYmXG4gICAgICAgIEpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcih0b1JlZjEsIGZyb21SZWYyLCB0cnVlKSAmJlxuICAgICAgICAhSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKHRvUmVmMSwgZnJvbVJlZjEsIHRydWUpXG4gICAgICApXG4gICAgICAuZm9yRWFjaCgoW2Zyb21SZWYyLCB0b1JlZjJdKSA9PiByZWN1cnNpdmVSZWZNYXAuc2V0KFxuICAgICAgICBmcm9tUmVmMSArIGZyb21SZWYyLnNsaWNlKHRvUmVmMS5sZW5ndGgpLFxuICAgICAgICBmcm9tUmVmMSArIHRvUmVmMi5zbGljZSh0b1JlZjEubGVuZ3RoKVxuICAgICAgKSlcbiAgICApO1xuXG4gIC8vIENyZWF0ZSBjb21waWxlZCBzY2hlbWEgYnkgcmVwbGFjaW5nIGFsbCBub24tcmVjdXJzaXZlICRyZWYgbGlua3Mgd2l0aFxuICAvLyB0aGllaXIgbGlua2VkIHNjaGVtYXMgYW5kLCB3aGVyZSBwb3NzaWJsZSwgY29tYmluaW5nIHNjaGVtYXMgaW4gYWxsT2YgYXJyYXlzLlxuICBsZXQgY29tcGlsZWRTY2hlbWEgPSB7IC4uLnNjaGVtYSB9O1xuICBkZWxldGUgY29tcGlsZWRTY2hlbWEuZGVmaW5pdGlvbnM7XG4gIGNvbXBpbGVkU2NoZW1hID1cbiAgICBnZXRTdWJTY2hlbWEoY29tcGlsZWRTY2hlbWEsICcnLCByZWZMaWJyYXJ5LCByZWN1cnNpdmVSZWZNYXApO1xuXG4gIC8vIE1ha2Ugc3VyZSBhbGwgcmVtYWluaW5nIHNjaGVtYSAkcmVmcyBhcmUgcmVjdXJzaXZlLCBhbmQgYnVpbGQgZmluYWxcbiAgLy8gc2NoZW1hUmVmTGlicmFyeSwgc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCBkYXRhUmVjdXJzaXZlUmVmTWFwLCAmIGFycmF5TWFwXG4gIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKGNvbXBpbGVkU2NoZW1hLCAoc3ViU2NoZW1hLCBzdWJTY2hlbWFQb2ludGVyKSA9PiB7XG4gICAgaWYgKGlzU3RyaW5nKHN1YlNjaGVtYVsnJHJlZiddKSkge1xuICAgICAgbGV0IHJlZlBvaW50ZXIgPSBKc29uUG9pbnRlci5jb21waWxlKHN1YlNjaGVtYVsnJHJlZiddKTtcbiAgICAgIGlmICghSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKHJlZlBvaW50ZXIsIHN1YlNjaGVtYVBvaW50ZXIsIHRydWUpKSB7XG4gICAgICAgIHJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKHN1YlNjaGVtYVBvaW50ZXIsIHJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgICAgIEpzb25Qb2ludGVyLnNldChjb21waWxlZFNjaGVtYSwgc3ViU2NoZW1hUG9pbnRlciwgeyAkcmVmOiBgIyR7cmVmUG9pbnRlcn1gIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCFoYXNPd24oc2NoZW1hUmVmTGlicmFyeSwgJ3JlZlBvaW50ZXInKSkge1xuICAgICAgICBzY2hlbWFSZWZMaWJyYXJ5W3JlZlBvaW50ZXJdID0gIXJlZlBvaW50ZXIubGVuZ3RoID8gY29tcGlsZWRTY2hlbWEgOlxuICAgICAgICAgIGdldFN1YlNjaGVtYShjb21waWxlZFNjaGVtYSwgcmVmUG9pbnRlciwgc2NoZW1hUmVmTGlicmFyeSwgcmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgIH1cbiAgICAgIGlmICghc2NoZW1hUmVjdXJzaXZlUmVmTWFwLmhhcyhzdWJTY2hlbWFQb2ludGVyKSkge1xuICAgICAgICBzY2hlbWFSZWN1cnNpdmVSZWZNYXAuc2V0KHN1YlNjaGVtYVBvaW50ZXIsIHJlZlBvaW50ZXIpO1xuICAgICAgfVxuICAgICAgY29uc3QgZnJvbURhdGFSZWYgPSBKc29uUG9pbnRlci50b0RhdGFQb2ludGVyKHN1YlNjaGVtYVBvaW50ZXIsIGNvbXBpbGVkU2NoZW1hKTtcbiAgICAgIGlmICghZGF0YVJlY3Vyc2l2ZVJlZk1hcC5oYXMoZnJvbURhdGFSZWYpKSB7XG4gICAgICAgIGNvbnN0IHRvRGF0YVJlZiA9IEpzb25Qb2ludGVyLnRvRGF0YVBvaW50ZXIocmVmUG9pbnRlciwgY29tcGlsZWRTY2hlbWEpO1xuICAgICAgICBkYXRhUmVjdXJzaXZlUmVmTWFwLnNldChmcm9tRGF0YVJlZiwgdG9EYXRhUmVmKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHN1YlNjaGVtYS50eXBlID09PSAnYXJyYXknICYmXG4gICAgICAoaGFzT3duKHN1YlNjaGVtYSwgJ2l0ZW1zJykgfHwgaGFzT3duKHN1YlNjaGVtYSwgJ2FkZGl0aW9uYWxJdGVtcycpKVxuICAgICkge1xuICAgICAgY29uc3QgZGF0YVBvaW50ZXIgPSBKc29uUG9pbnRlci50b0RhdGFQb2ludGVyKHN1YlNjaGVtYVBvaW50ZXIsIGNvbXBpbGVkU2NoZW1hKTtcbiAgICAgIGlmICghYXJyYXlNYXAuaGFzKGRhdGFQb2ludGVyKSkge1xuICAgICAgICBjb25zdCB0dXBsZUl0ZW1zID0gaXNBcnJheShzdWJTY2hlbWEuaXRlbXMpID8gc3ViU2NoZW1hLml0ZW1zLmxlbmd0aCA6IDA7XG4gICAgICAgIGFycmF5TWFwLnNldChkYXRhUG9pbnRlciwgdHVwbGVJdGVtcyk7XG4gICAgICB9XG4gICAgfVxuICB9LCB0cnVlKTtcbiAgcmV0dXJuIGNvbXBpbGVkU2NoZW1hO1xufVxuXG4vKipcbiAqICdnZXRTdWJTY2hlbWEnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBzY2hlbWFcbiAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyXG4gKiAvLyAgeyBvYmplY3QgfSBzY2hlbWFSZWZMaWJyYXJ5XG4gKiAvLyAgeyBNYXA8c3RyaW5nLCBzdHJpbmc+IH0gc2NoZW1hUmVjdXJzaXZlUmVmTWFwXG4gKiAvLyAgeyBzdHJpbmdbXSA9IFtdIH0gdXNlZFBvaW50ZXJzXG4gKiAvL1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ViU2NoZW1hKFxuICBzY2hlbWEsIHBvaW50ZXIsIHNjaGVtYVJlZkxpYnJhcnkgPSBudWxsLFxuICBzY2hlbWFSZWN1cnNpdmVSZWZNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBudWxsLCB1c2VkUG9pbnRlcnM6IHN0cmluZ1tdID0gW11cbikge1xuICBpZiAoIXNjaGVtYVJlZkxpYnJhcnkgfHwgIXNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCkge1xuICAgIHJldHVybiBKc29uUG9pbnRlci5nZXRDb3B5KHNjaGVtYSwgcG9pbnRlcik7XG4gIH1cbiAgaWYgKHR5cGVvZiBwb2ludGVyICE9PSAnc3RyaW5nJykgeyBwb2ludGVyID0gSnNvblBvaW50ZXIuY29tcGlsZShwb2ludGVyKTsgfVxuICB1c2VkUG9pbnRlcnMgPSBbIC4uLnVzZWRQb2ludGVycywgcG9pbnRlciBdO1xuICBsZXQgbmV3U2NoZW1hOiBhbnkgPSBudWxsO1xuICBpZiAocG9pbnRlciA9PT0gJycpIHtcbiAgICBuZXdTY2hlbWEgPSBjbG9uZURlZXAoc2NoZW1hKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzaG9ydFBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKHBvaW50ZXIsIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCk7XG4gICAgaWYgKHNob3J0UG9pbnRlciAhPT0gcG9pbnRlcikgeyB1c2VkUG9pbnRlcnMgPSBbIC4uLnVzZWRQb2ludGVycywgc2hvcnRQb2ludGVyIF07IH1cbiAgICBuZXdTY2hlbWEgPSBKc29uUG9pbnRlci5nZXRGaXJzdENvcHkoW1xuICAgICAgW3NjaGVtYVJlZkxpYnJhcnksIFtzaG9ydFBvaW50ZXJdXSxcbiAgICAgIFtzY2hlbWEsIHBvaW50ZXJdLFxuICAgICAgW3NjaGVtYSwgc2hvcnRQb2ludGVyXVxuICAgIF0pO1xuICB9XG4gIHJldHVybiBKc29uUG9pbnRlci5mb3JFYWNoRGVlcENvcHkobmV3U2NoZW1hLCAoc3ViU2NoZW1hLCBzdWJQb2ludGVyKSA9PiB7XG4gICAgaWYgKGlzT2JqZWN0KHN1YlNjaGVtYSkpIHtcblxuICAgICAgLy8gUmVwbGFjZSBub24tcmVjdXJzaXZlICRyZWYgbGlua3Mgd2l0aCByZWZlcmVuY2VkIHNjaGVtYXNcbiAgICAgIGlmIChpc1N0cmluZyhzdWJTY2hlbWEuJHJlZikpIHtcbiAgICAgICAgY29uc3QgcmVmUG9pbnRlciA9IEpzb25Qb2ludGVyLmNvbXBpbGUoc3ViU2NoZW1hLiRyZWYpO1xuICAgICAgICBpZiAocmVmUG9pbnRlci5sZW5ndGggJiYgdXNlZFBvaW50ZXJzLmV2ZXJ5KHB0ciA9PlxuICAgICAgICAgICFKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIocmVmUG9pbnRlciwgcHRyLCB0cnVlKVxuICAgICAgICApKSB7XG4gICAgICAgICAgY29uc3QgcmVmU2NoZW1hID0gZ2V0U3ViU2NoZW1hKFxuICAgICAgICAgICAgc2NoZW1hLCByZWZQb2ludGVyLCBzY2hlbWFSZWZMaWJyYXJ5LCBzY2hlbWFSZWN1cnNpdmVSZWZNYXAsIHVzZWRQb2ludGVyc1xuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHN1YlNjaGVtYSkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVmU2NoZW1hO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYUtleXMgPSB7IC4uLnN1YlNjaGVtYSB9O1xuICAgICAgICAgICAgZGVsZXRlIGV4dHJhS2V5cy4kcmVmO1xuICAgICAgICAgICAgcmV0dXJuIG1lcmdlU2NoZW1hcyhyZWZTY2hlbWEsIGV4dHJhS2V5cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IENvbnZlcnQgc2NoZW1hcyB3aXRoICd0eXBlJyBhcnJheXMgdG8gJ29uZU9mJ1xuXG4gICAgICAvLyBDb21iaW5lIGFsbE9mIHN1YlNjaGVtYXNcbiAgICAgIGlmIChpc0FycmF5KHN1YlNjaGVtYS5hbGxPZikpIHsgcmV0dXJuIGNvbWJpbmVBbGxPZihzdWJTY2hlbWEpOyB9XG5cbiAgICAgIC8vIEZpeCBpbmNvcnJlY3RseSBwbGFjZWQgYXJyYXkgb2JqZWN0IHJlcXVpcmVkIGxpc3RzXG4gICAgICBpZiAoc3ViU2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgaXNBcnJheShzdWJTY2hlbWEucmVxdWlyZWQpKSB7XG4gICAgICAgIHJldHVybiBmaXhSZXF1aXJlZEFycmF5UHJvcGVydGllcyhzdWJTY2hlbWEpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3ViU2NoZW1hO1xuICB9LCB0cnVlLCA8c3RyaW5nPnBvaW50ZXIpO1xufVxuXG4vKipcbiAqICdjb21iaW5lQWxsT2YnIGZ1bmN0aW9uXG4gKlxuICogQXR0ZW1wdCB0byBjb252ZXJ0IGFuIGFsbE9mIHNjaGVtYSBvYmplY3QgaW50b1xuICogYSBub24tYWxsT2Ygc2NoZW1hIG9iamVjdCB3aXRoIGVxdWl2YWxlbnQgcnVsZXMuXG4gKlxuICogLy8gICBzY2hlbWEgLSBhbGxPZiBzY2hlbWEgb2JqZWN0XG4gKiAvLyAgLSBjb252ZXJ0ZWQgc2NoZW1hIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZUFsbE9mKHNjaGVtYSkge1xuICBpZiAoIWlzT2JqZWN0KHNjaGVtYSkgfHwgIWlzQXJyYXkoc2NoZW1hLmFsbE9mKSkgeyByZXR1cm4gc2NoZW1hOyB9XG4gIGxldCBtZXJnZWRTY2hlbWEgPSBtZXJnZVNjaGVtYXMoLi4uc2NoZW1hLmFsbE9mKTtcbiAgaWYgKE9iamVjdC5rZXlzKHNjaGVtYSkubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGV4dHJhS2V5cyA9IHsgLi4uc2NoZW1hIH07XG4gICAgZGVsZXRlIGV4dHJhS2V5cy5hbGxPZjtcbiAgICBtZXJnZWRTY2hlbWEgPSBtZXJnZVNjaGVtYXMobWVyZ2VkU2NoZW1hLCBleHRyYUtleXMpO1xuICB9XG4gIHJldHVybiBtZXJnZWRTY2hlbWE7XG59XG5cbi8qKlxuICogJ2ZpeFJlcXVpcmVkQXJyYXlQcm9wZXJ0aWVzJyBmdW5jdGlvblxuICpcbiAqIEZpeGVzIGFuIGluY29ycmVjdGx5IHBsYWNlZCByZXF1aXJlZCBsaXN0IGluc2lkZSBhbiBhcnJheSBzY2hlbWEsIGJ5IG1vdmluZ1xuICogaXQgaW50byBpdGVtcy5wcm9wZXJ0aWVzIG9yIGFkZGl0aW9uYWxJdGVtcy5wcm9wZXJ0aWVzLCB3aGVyZSBpdCBiZWxvbmdzLlxuICpcbiAqIC8vICAgc2NoZW1hIC0gYWxsT2Ygc2NoZW1hIG9iamVjdFxuICogLy8gIC0gY29udmVydGVkIHNjaGVtYSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpeFJlcXVpcmVkQXJyYXlQcm9wZXJ0aWVzKHNjaGVtYSkge1xuICBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgaXNBcnJheShzY2hlbWEucmVxdWlyZWQpKSB7XG4gICAgY29uc3QgaXRlbXNPYmplY3QgPSBoYXNPd24oc2NoZW1hLml0ZW1zLCAncHJvcGVydGllcycpID8gJ2l0ZW1zJyA6XG4gICAgICBoYXNPd24oc2NoZW1hLmFkZGl0aW9uYWxJdGVtcywgJ3Byb3BlcnRpZXMnKSA/ICdhZGRpdGlvbmFsSXRlbXMnIDogbnVsbDtcbiAgICBpZiAoaXRlbXNPYmplY3QgJiYgIWhhc093bihzY2hlbWFbaXRlbXNPYmplY3RdLCAncmVxdWlyZWQnKSAmJiAoXG4gICAgICBoYXNPd24oc2NoZW1hW2l0ZW1zT2JqZWN0XSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJykgfHxcbiAgICAgIHNjaGVtYS5yZXF1aXJlZC5ldmVyeShrZXkgPT4gaGFzT3duKHNjaGVtYVtpdGVtc09iamVjdF0ucHJvcGVydGllcywga2V5KSlcbiAgICApKSB7XG4gICAgICBzY2hlbWEgPSBjbG9uZURlZXAoc2NoZW1hKTtcbiAgICAgIHNjaGVtYVtpdGVtc09iamVjdF0ucmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQ7XG4gICAgICBkZWxldGUgc2NoZW1hLnJlcXVpcmVkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2NoZW1hO1xufVxuIl19