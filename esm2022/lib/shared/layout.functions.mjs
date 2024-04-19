import cloneDeep from 'lodash/cloneDeep';
import _isArray from 'lodash/isArray';
import _isPlainObject from 'lodash/isPlainObject';
import uniqueId from 'lodash/uniqueId';
import { checkInlineType, getFromSchema, getInputType, isInputRequired, removeRecursiveReferences, updateInputOptions } from './json-schema.functions';
import { JsonPointer } from './jsonpointer.functions';
import { copy, fixTitle, forEach, hasOwn } from './utility.functions';
import { inArray, isArray, isDefined, isEmpty, isNumber, isObject, isString } from './validator.functions';
/**
 * Layout function library:
 *
 * buildLayout:            Builds a complete layout from an input layout and schema
 *
 * buildLayoutFromSchema:  Builds a complete layout entirely from an input schema
 *
 * mapLayout:
 *
 * getLayoutNode:
 *
 * buildTitleMap:
 */
/**
 * 'buildLayout' function
 *
 * //   jsf
 * //   widgetLibrary
 * //
 */
export function buildLayout_original(jsf, widgetLibrary) {
    let hasSubmitButton = !JsonPointer.get(jsf, '/formOptions/addSubmit');
    const formLayout = mapLayout(jsf.layout, (layoutItem, index, layoutPointer) => {
        const newNode = {
            _id: uniqueId(),
            options: {},
        };
        if (isObject(layoutItem)) {
            Object.assign(newNode, layoutItem);
            Object.keys(newNode)
                .filter(option => !inArray(option, [
                '_id', '$ref', 'arrayItem', 'arrayItemType', 'dataPointer', 'dataType',
                'items', 'key', 'name', 'options', 'recursiveReference', 'type', 'widget'
            ]))
                .forEach(option => {
                newNode.options[option] = newNode[option];
                delete newNode[option];
            });
            if (!hasOwn(newNode, 'type') && isString(newNode.widget)) {
                newNode.type = newNode.widget;
                delete newNode.widget;
            }
            if (!hasOwn(newNode.options, 'title')) {
                if (hasOwn(newNode.options, 'legend')) {
                    newNode.options.title = newNode.options.legend;
                    delete newNode.options.legend;
                }
            }
            if (!hasOwn(newNode.options, 'validationMessages')) {
                if (hasOwn(newNode.options, 'errorMessages')) {
                    newNode.options.validationMessages = newNode.options.errorMessages;
                    delete newNode.options.errorMessages;
                    // Convert Angular Schema Form (AngularJS) 'validationMessage' to
                    // Angular JSON Schema Form 'validationMessages'
                    // TV4 codes from https://github.com/geraintluff/tv4/blob/master/source/api.js
                }
                else if (hasOwn(newNode.options, 'validationMessage')) {
                    if (typeof newNode.options.validationMessage === 'string') {
                        newNode.options.validationMessages = newNode.options.validationMessage;
                    }
                    else {
                        newNode.options.validationMessages = {};
                        Object.keys(newNode.options.validationMessage).forEach(key => {
                            const code = key + '';
                            const newKey = code === '0' ? 'type' :
                                code === '1' ? 'enum' :
                                    code === '100' ? 'multipleOf' :
                                        code === '101' ? 'minimum' :
                                            code === '102' ? 'exclusiveMinimum' :
                                                code === '103' ? 'maximum' :
                                                    code === '104' ? 'exclusiveMaximum' :
                                                        code === '200' ? 'minLength' :
                                                            code === '201' ? 'maxLength' :
                                                                code === '202' ? 'pattern' :
                                                                    code === '300' ? 'minProperties' :
                                                                        code === '301' ? 'maxProperties' :
                                                                            code === '302' ? 'required' :
                                                                                code === '304' ? 'dependencies' :
                                                                                    code === '400' ? 'minItems' :
                                                                                        code === '401' ? 'maxItems' :
                                                                                            code === '402' ? 'uniqueItems' :
                                                                                                code === '500' ? 'format' : code + '';
                            newNode.options.validationMessages[newKey] = newNode.options.validationMessage[key];
                        });
                    }
                    delete newNode.options.validationMessage;
                }
            }
        }
        else if (JsonPointer.isJsonPointer(layoutItem)) {
            newNode.dataPointer = layoutItem;
        }
        else if (isString(layoutItem)) {
            newNode.key = layoutItem;
        }
        else {
            console.error('buildLayout error: Form layout element not recognized:');
            console.error(layoutItem);
            return null;
        }
        let nodeSchema = null;
        // If newNode does not have a dataPointer, try to find an equivalent
        if (!hasOwn(newNode, 'dataPointer')) {
            // If newNode has a key, change it to a dataPointer
            if (hasOwn(newNode, 'key')) {
                newNode.dataPointer = newNode.key === '*' ? newNode.key :
                    JsonPointer.compile(JsonPointer.parseObjectPath(newNode.key), '-');
                delete newNode.key;
                // If newNode is an array, search for dataPointer in child nodes
            }
            else if (hasOwn(newNode, 'type') && newNode.type.slice(-5) === 'array') {
                const findDataPointer = (items) => {
                    if (items === null || typeof items !== 'object') {
                        return;
                    }
                    if (hasOwn(items, 'dataPointer')) {
                        return items.dataPointer;
                    }
                    if (isArray(items.items)) {
                        for (const item of items.items) {
                            if (hasOwn(item, 'dataPointer') && item.dataPointer.indexOf('/-') !== -1) {
                                return item.dataPointer;
                            }
                            if (hasOwn(item, 'items')) {
                                const searchItem = findDataPointer(item);
                                if (searchItem) {
                                    return searchItem;
                                }
                            }
                        }
                    }
                };
                const childDataPointer = findDataPointer(newNode);
                if (childDataPointer) {
                    newNode.dataPointer =
                        childDataPointer.slice(0, childDataPointer.lastIndexOf('/-'));
                }
            }
        }
        if (hasOwn(newNode, 'dataPointer')) {
            if (newNode.dataPointer === '*') {
                return buildLayoutFromSchema(jsf, widgetLibrary, jsf.formValues);
            }
            const nodeValue = JsonPointer.get(jsf.formValues, newNode.dataPointer.replace(/\/-/g, '/1'));
            // TODO: Create function getFormValues(jsf, dataPointer, forRefLibrary)
            // check formOptions.setSchemaDefaults and formOptions.setLayoutDefaults
            // then set apropriate values from initialVaues, schema, or layout
            newNode.dataPointer =
                JsonPointer.toGenericPointer(newNode.dataPointer, jsf.arrayMap);
            const LastKey = JsonPointer.toKey(newNode.dataPointer);
            if (!newNode.name && isString(LastKey) && LastKey !== '-') {
                newNode.name = LastKey;
            }
            const shortDataPointer = removeRecursiveReferences(newNode.dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
            const recursive = !shortDataPointer.length ||
                shortDataPointer !== newNode.dataPointer;
            let schemaPointer;
            if (!jsf.dataMap.has(shortDataPointer)) {
                jsf.dataMap.set(shortDataPointer, new Map());
            }
            const nodeDataMap = jsf.dataMap.get(shortDataPointer);
            if (nodeDataMap.has('schemaPointer')) {
                schemaPointer = nodeDataMap.get('schemaPointer');
            }
            else {
                schemaPointer = JsonPointer.toSchemaPointer(shortDataPointer, jsf.schema);
                nodeDataMap.set('schemaPointer', schemaPointer);
            }
            nodeDataMap.set('disabled', !!newNode.options.disabled);
            nodeSchema = JsonPointer.get(jsf.schema, schemaPointer);
            if (nodeSchema) {
                if (!hasOwn(newNode, 'type')) {
                    newNode.type = getInputType(nodeSchema, newNode);
                }
                else if (!widgetLibrary.hasWidget(newNode.type)) {
                    const oldWidgetType = newNode.type;
                    newNode.type = getInputType(nodeSchema, newNode);
                    console.error(`error: widget type "${oldWidgetType}" ` +
                        `not found in library. Replacing with "${newNode.type}".`);
                }
                else {
                    newNode.type = checkInlineType(newNode.type, nodeSchema, newNode);
                }
                if (nodeSchema.type === 'object' && isArray(nodeSchema.required)) {
                    nodeDataMap.set('required', nodeSchema.required);
                }
                newNode.dataType =
                    nodeSchema.type || (hasOwn(nodeSchema, '$ref') ? '$ref' : null);
                updateInputOptions(newNode, nodeSchema, jsf);
                // Present checkboxes as single control, rather than array
                if (newNode.type === 'checkboxes' && hasOwn(nodeSchema, 'items')) {
                    updateInputOptions(newNode, nodeSchema.items, jsf);
                }
                else if (newNode.dataType === 'array') {
                    newNode.options.maxItems = Math.min(nodeSchema.maxItems || 1000, newNode.options.maxItems || 1000);
                    newNode.options.minItems = Math.max(nodeSchema.minItems || 0, newNode.options.minItems || 0);
                    newNode.options.listItems = Math.max(newNode.options.listItems || 0, isArray(nodeValue) ? nodeValue.length : 0);
                    newNode.options.tupleItems =
                        isArray(nodeSchema.items) ? nodeSchema.items.length : 0;
                    if (newNode.options.maxItems < newNode.options.tupleItems) {
                        newNode.options.tupleItems = newNode.options.maxItems;
                        newNode.options.listItems = 0;
                    }
                    else if (newNode.options.maxItems <
                        newNode.options.tupleItems + newNode.options.listItems) {
                        newNode.options.listItems =
                            newNode.options.maxItems - newNode.options.tupleItems;
                    }
                    else if (newNode.options.minItems >
                        newNode.options.tupleItems + newNode.options.listItems) {
                        newNode.options.listItems =
                            newNode.options.minItems - newNode.options.tupleItems;
                    }
                    if (!nodeDataMap.has('maxItems')) {
                        nodeDataMap.set('maxItems', newNode.options.maxItems);
                        nodeDataMap.set('minItems', newNode.options.minItems);
                        nodeDataMap.set('tupleItems', newNode.options.tupleItems);
                        nodeDataMap.set('listItems', newNode.options.listItems);
                    }
                    if (!jsf.arrayMap.has(shortDataPointer)) {
                        jsf.arrayMap.set(shortDataPointer, newNode.options.tupleItems);
                    }
                }
                if (isInputRequired(jsf.schema, schemaPointer)) {
                    newNode.options.required = true;
                    jsf.fieldsRequired = true;
                }
            }
            else {
                // TODO: create item in FormGroup model from layout key (?)
                updateInputOptions(newNode, {}, jsf);
            }
            if (!newNode.options.title && !/^\d+$/.test(newNode.name)) {
                newNode.options.title = fixTitle(newNode.name);
            }
            if (hasOwn(newNode.options, 'copyValueTo')) {
                if (typeof newNode.options.copyValueTo === 'string') {
                    newNode.options.copyValueTo = [newNode.options.copyValueTo];
                }
                if (isArray(newNode.options.copyValueTo)) {
                    newNode.options.copyValueTo = newNode.options.copyValueTo.map(item => JsonPointer.compile(JsonPointer.parseObjectPath(item), '-'));
                }
            }
            newNode.widget = widgetLibrary.getWidget(newNode.type);
            nodeDataMap.set('inputType', newNode.type);
            nodeDataMap.set('widget', newNode.widget);
            if (newNode.dataType === 'array' &&
                (hasOwn(newNode, 'items') || hasOwn(newNode, 'additionalItems'))) {
                const itemRefPointer = removeRecursiveReferences(newNode.dataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
                if (!jsf.dataMap.has(itemRefPointer)) {
                    jsf.dataMap.set(itemRefPointer, new Map());
                }
                jsf.dataMap.get(itemRefPointer).set('inputType', 'section');
                // Fix insufficiently nested array item groups
                if (newNode.items.length > 1) {
                    const arrayItemGroup = [];
                    for (let i = newNode.items.length - 1; i >= 0; i--) {
                        const subItem = newNode.items[i];
                        if (hasOwn(subItem, 'dataPointer') &&
                            subItem.dataPointer.slice(0, itemRefPointer.length) === itemRefPointer) {
                            const arrayItem = newNode.items.splice(i, 1)[0];
                            arrayItem.dataPointer = newNode.dataPointer + '/-' +
                                arrayItem.dataPointer.slice(itemRefPointer.length);
                            arrayItemGroup.unshift(arrayItem);
                        }
                        else {
                            subItem.arrayItem = true;
                            // TODO: Check schema to get arrayItemType and removable
                            subItem.arrayItemType = 'list';
                            subItem.removable = newNode.options.removable !== false;
                        }
                    }
                    if (arrayItemGroup.length) {
                        newNode.items.push({
                            _id: uniqueId(),
                            arrayItem: true,
                            arrayItemType: newNode.options.tupleItems > newNode.items.length ?
                                'tuple' : 'list',
                            items: arrayItemGroup,
                            options: { removable: newNode.options.removable !== false, },
                            dataPointer: newNode.dataPointer + '/-',
                            type: 'section',
                            widget: widgetLibrary.getWidget('section'),
                        });
                    }
                }
                else {
                    // TODO: Fix to hndle multiple items
                    newNode.items[0].arrayItem = true;
                    if (!newNode.items[0].dataPointer) {
                        newNode.items[0].dataPointer =
                            JsonPointer.toGenericPointer(itemRefPointer, jsf.arrayMap);
                    }
                    if (!JsonPointer.has(newNode, '/items/0/options/removable')) {
                        newNode.items[0].options.removable = true;
                    }
                    if (newNode.options.orderable === false) {
                        newNode.items[0].options.orderable = false;
                    }
                    newNode.items[0].arrayItemType =
                        newNode.options.tupleItems ? 'tuple' : 'list';
                }
                if (isArray(newNode.items)) {
                    const arrayListItems = newNode.items.filter(item => item.type !== '$ref').length -
                        newNode.options.tupleItems;
                    if (arrayListItems > newNode.options.listItems) {
                        newNode.options.listItems = arrayListItems;
                        nodeDataMap.set('listItems', arrayListItems);
                    }
                }
                if (!hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                    jsf.layoutRefLibrary[itemRefPointer] =
                        cloneDeep(newNode.items[newNode.items.length - 1]);
                    if (recursive) {
                        jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                    }
                    forEach(jsf.layoutRefLibrary[itemRefPointer], (item, key) => {
                        if (hasOwn(item, '_id')) {
                            item._id = null;
                        }
                        if (recursive) {
                            if (hasOwn(item, 'dataPointer')) {
                                item.dataPointer = item.dataPointer.slice(itemRefPointer.length);
                            }
                        }
                    }, 'top-down');
                }
                // Add any additional default items
                if (!newNode.recursiveReference || newNode.options.required) {
                    const arrayLength = Math.min(Math.max(newNode.options.tupleItems + newNode.options.listItems, isArray(nodeValue) ? nodeValue.length : 0), newNode.options.maxItems);
                    for (let i = newNode.items.length; i < arrayLength; i++) {
                        newNode.items.push(getLayoutNode({
                            $ref: itemRefPointer,
                            dataPointer: newNode.dataPointer,
                            recursiveReference: newNode.recursiveReference,
                        }, jsf, widgetLibrary));
                    }
                }
                // If needed, add button to add items to array
                if (newNode.options.addable !== false &&
                    newNode.options.minItems < newNode.options.maxItems &&
                    (newNode.items[newNode.items.length - 1] || {}).type !== '$ref') {
                    let buttonText = 'Add';
                    if (newNode.options.title) {
                        if (/^add\b/i.test(newNode.options.title)) {
                            buttonText = newNode.options.title;
                        }
                        else {
                            buttonText += ' ' + newNode.options.title;
                        }
                    }
                    else if (newNode.name && !/^\d+$/.test(newNode.name)) {
                        if (/^add\b/i.test(newNode.name)) {
                            buttonText += ' ' + fixTitle(newNode.name);
                        }
                        else {
                            buttonText = fixTitle(newNode.name);
                        }
                        // If newNode doesn't have a title, look for title of parent array item
                    }
                    else {
                        const parentSchema = getFromSchema(jsf.schema, newNode.dataPointer, 'parentSchema');
                        if (hasOwn(parentSchema, 'title')) {
                            buttonText += ' to ' + parentSchema.title;
                        }
                        else {
                            const pointerArray = JsonPointer.parse(newNode.dataPointer);
                            buttonText += ' to ' + fixTitle(pointerArray[pointerArray.length - 2]);
                        }
                    }
                    newNode.items.push({
                        _id: uniqueId(),
                        arrayItem: true,
                        arrayItemType: 'list',
                        dataPointer: newNode.dataPointer + '/-',
                        options: {
                            listItems: newNode.options.listItems,
                            maxItems: newNode.options.maxItems,
                            minItems: newNode.options.minItems,
                            removable: false,
                            title: buttonText,
                            tupleItems: newNode.options.tupleItems,
                        },
                        recursiveReference: recursive,
                        type: '$ref',
                        widget: widgetLibrary.getWidget('$ref'),
                        $ref: itemRefPointer,
                    });
                    if (isString(JsonPointer.get(newNode, '/style/add'))) {
                        newNode.items[newNode.items.length - 1].options.fieldStyle =
                            newNode.style.add;
                        delete newNode.style.add;
                        if (isEmpty(newNode.style)) {
                            delete newNode.style;
                        }
                    }
                }
            }
            else {
                newNode.arrayItem = false;
            }
        }
        else if (hasOwn(newNode, 'type') || hasOwn(newNode, 'items')) {
            const parentType = JsonPointer.get(jsf.layout, layoutPointer, 0, -2).type;
            if (!hasOwn(newNode, 'type')) {
                newNode.type =
                    inArray(parentType, ['tabs', 'tabarray']) ? 'tab' : 'array';
            }
            newNode.arrayItem = parentType === 'array';
            newNode.widget = widgetLibrary.getWidget(newNode.type);
            updateInputOptions(newNode, {}, jsf);
        }
        if (newNode.type === 'submit') {
            hasSubmitButton = true;
        }
        return newNode;
    });
    if (jsf.hasRootReference) {
        const fullLayout = cloneDeep(formLayout);
        if (fullLayout[fullLayout.length - 1].type === 'submit') {
            fullLayout.pop();
        }
        jsf.layoutRefLibrary[''] = {
            _id: null,
            dataPointer: '',
            dataType: 'object',
            items: fullLayout,
            name: '',
            options: cloneDeep(jsf.formOptions.defaultWidgetOptions),
            recursiveReference: true,
            required: false,
            type: 'section',
            widget: widgetLibrary.getWidget('section'),
        };
    }
    if (!hasSubmitButton) {
        formLayout.push({
            _id: uniqueId(),
            options: { title: 'Submit' },
            type: 'submit',
            widget: widgetLibrary.getWidget('submit'),
        });
    }
    return formLayout;
}
//TODO-review:this implements a quick 'post' fix rather than an
//integrared ideal fix
export function buildLayout(jsf, widgetLibrary) {
    let layout = buildLayout_original(jsf, widgetLibrary);
    if (jsf.formValues) {
        let fixedLayout = fixNestedArrayLayout({
            builtLayout: layout,
            formData: jsf.formValues
        });
    }
    return layout;
}
function fixNestedArrayLayout(options) {
    let { builtLayout, formData } = options;
    let arrLengths = {};
    let traverseObj = function (obj, path, onValue) {
        if (_isArray(obj)) {
            onValue && onValue(obj, path);
            obj.forEach((item, ind) => {
                onValue && onValue(item, path + "/" + ind);
                traverseObj(item, path + "/" + ind, onValue);
            });
            return;
        }
        if (_isPlainObject(obj)) {
            onValue && onValue(obj, path);
            Object.keys(obj).forEach(key => {
                onValue && onValue(obj[key], path + "/" + key);
                traverseObj(obj[key], path + "/" + key, onValue);
            });
            return;
        }
    };
    traverseObj(formData, "", (value, path) => {
        if (_isArray(value)) {
            arrLengths[path] = arrLengths[path] || value.length;
        }
    });
    let getDataSize = (options) => {
        let { data, dataPointer, indexArray } = options;
        let dashCount = 0;
        let dpInstance = dataPointer.substring(1).split("/").map((part, pind) => {
            if (part == "-" && indexArray[dashCount] != undefined) {
                return indexArray[dashCount++];
            }
            return part;
        })
            .join("/");
        dpInstance = "/" + dpInstance;
        let arrSize = arrLengths[dpInstance];
        return arrSize;
    };
    //still too buggy
    let createNonRefItem = (nodeWithRef) => {
        let templateNode = {
            "type": "section",
            "recursiveReference": false,
            "items": []
        };
        let clone = cloneDeep(nodeWithRef);
        //commented out for now so that it behaves as ususal
        //_.merge(clone,templateNode);
        return clone;
    };
    let rebuildLayout = (options) => {
        let { builtLayout, indices, parentDataPointer, indexPos } = options;
        indices = indices || [];
        indexPos = indexPos == undefined ? indexPos = -1 : indexPos;
        if (_isArray(builtLayout)) {
            builtLayout.forEach((item, index) => {
                rebuildLayout({
                    builtLayout: item,
                    indices: indices,
                    indexPos: indexPos,
                    parentDataPointer: builtLayout.dataPointer || parentDataPointer
                });
            });
            return;
        }
        let dataTypes = ["array"]; //check only array for now
        //for now added condition to ignore recursive references
        if (builtLayout.items && dataTypes.indexOf(builtLayout.dataType) >= 0
            && builtLayout.dataPointer
            && !builtLayout.recursiveReference) {
            let numDataItems = getDataSize({
                data: formData,
                dataPointer: builtLayout.dataPointer,
                indexArray: indices
            });
            let numActualItems = builtLayout.items.length;
            //check if there's ref items, if so ignore it and therefore
            //decrement the item count
            builtLayout.items.forEach(item => {
                if (item.type && item.type == "$ref") {
                    numActualItems--;
                }
            });
            numActualItems = Math.max(numActualItems, 0); //avoid dealing with negatives
            if (numActualItems < numDataItems) {
                let numItemsNeeded = numDataItems - numActualItems;
                //added to ignore recursive references
                if (numActualItems == 0 && builtLayout.items[0].recursiveReference) {
                    numItemsNeeded = 0;
                }
                for (let i = 0; i < numItemsNeeded; i++) {
                    //node must not be of type "type": "$ref"
                    //if it is then manufacture our own
                    let isRefNode = builtLayout.items[0].type && builtLayout.items[0].type == "$ref";
                    let newItem = isRefNode
                        ? createNonRefItem(builtLayout.items[0])
                        : cloneDeep(builtLayout.items[0]); //copy first
                    newItem._id = uniqueId("new_");
                    builtLayout.items.unshift(newItem);
                }
                if (builtLayout.options.listItems) {
                    builtLayout.options.listItems = numDataItems;
                }
            }
            indices[builtLayout.dataPointer] = indices[builtLayout.dataPointer] || -1;
            indexPos++;
            builtLayout.items.forEach((item, index) => {
                indices[indexPos] = index;
                rebuildLayout({
                    builtLayout: item,
                    indices: indices,
                    parentDataPointer: builtLayout.dataPointer,
                    indexPos: indexPos
                });
            });
            indexPos--;
        }
        else {
            if (builtLayout.items) {
                builtLayout.items.forEach((item, index) => {
                    rebuildLayout({
                        builtLayout: item,
                        indices: indices,
                        parentDataPointer: parentDataPointer,
                        indexPos: indexPos
                    });
                });
            }
        }
    };
    rebuildLayout({
        builtLayout: builtLayout
    });
    //NB original is mutated
    let fixedLayout = builtLayout;
    return fixedLayout;
}
/**
 * 'buildLayoutFromSchema' function
 *
 * //   jsf -
 * //   widgetLibrary -
 * //   nodeValue -
 * //  { string = '' } schemaPointer -
 * //  { string = '' } dataPointer -
 * //  { boolean = false } arrayItem -
 * //  { string = null } arrayItemType -
 * //  { boolean = null } removable -
 * //  { boolean = false } forRefLibrary -
 * //  { string = '' } dataPointerPrefix -
 * //
 */
export function buildLayoutFromSchema(jsf, widgetLibrary, nodeValue = null, schemaPointer = '', dataPointer = '', arrayItem = false, arrayItemType = null, removable = null, forRefLibrary = false, dataPointerPrefix = '') {
    const schema = JsonPointer.get(jsf.schema, schemaPointer);
    if (!hasOwn(schema, 'type') && !hasOwn(schema, '$ref') &&
        !hasOwn(schema, 'x-schema-form')) {
        return null;
    }
    const newNodeType = getInputType(schema);
    if (!isDefined(nodeValue) && (jsf.formOptions.setSchemaDefaults === true ||
        (jsf.formOptions.setSchemaDefaults === 'auto' && isEmpty(jsf.formValues)))) {
        nodeValue = JsonPointer.get(jsf.schema, schemaPointer + '/default');
    }
    let newNode = {
        _id: forRefLibrary ? null : uniqueId(),
        arrayItem: arrayItem,
        dataPointer: JsonPointer.toGenericPointer(dataPointer, jsf.arrayMap),
        dataType: schema.type || (hasOwn(schema, '$ref') ? '$ref' : null),
        options: {},
        required: isInputRequired(jsf.schema, schemaPointer),
        type: newNodeType,
        widget: widgetLibrary.getWidget(newNodeType),
    };
    const lastDataKey = JsonPointer.toKey(newNode.dataPointer);
    if (lastDataKey !== '-') {
        newNode.name = lastDataKey;
    }
    if (newNode.arrayItem) {
        newNode.arrayItemType = arrayItemType;
        newNode.options.removable = removable !== false;
    }
    const shortDataPointer = removeRecursiveReferences(dataPointerPrefix + dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
    const recursive = !shortDataPointer.length ||
        shortDataPointer !== dataPointerPrefix + dataPointer;
    if (!jsf.dataMap.has(shortDataPointer)) {
        jsf.dataMap.set(shortDataPointer, new Map());
    }
    const nodeDataMap = jsf.dataMap.get(shortDataPointer);
    if (!nodeDataMap.has('inputType')) {
        nodeDataMap.set('schemaPointer', schemaPointer);
        nodeDataMap.set('inputType', newNode.type);
        nodeDataMap.set('widget', newNode.widget);
        nodeDataMap.set('disabled', !!newNode.options.disabled);
    }
    updateInputOptions(newNode, schema, jsf);
    if (!newNode.options.title && newNode.name && !/^\d+$/.test(newNode.name)) {
        newNode.options.title = fixTitle(newNode.name);
    }
    if (newNode.dataType === 'object') {
        if (isArray(schema.required) && !nodeDataMap.has('required')) {
            nodeDataMap.set('required', schema.required);
        }
        if (isObject(schema.properties)) {
            const newSection = [];
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
                .forEach(key => {
                const keySchemaPointer = hasOwn(schema.properties, key) ?
                    '/properties/' + key : '/additionalProperties';
                const innerItem = buildLayoutFromSchema(jsf, widgetLibrary, isObject(nodeValue) ? nodeValue[key] : null, schemaPointer + keySchemaPointer, dataPointer + '/' + key, false, null, null, forRefLibrary, dataPointerPrefix);
                if (innerItem) {
                    if (isInputRequired(schema, '/' + key)) {
                        innerItem.options.required = true;
                        jsf.fieldsRequired = true;
                    }
                    newSection.push(innerItem);
                }
            });
            if (dataPointer === '' && !forRefLibrary) {
                newNode = newSection;
            }
            else {
                newNode.items = newSection;
            }
        }
        // TODO: Add patternProperties and additionalProperties inputs?
        // ... possibly provide a way to enter both key names and values?
        // if (isObject(schema.patternProperties)) { }
        // if (isObject(schema.additionalProperties)) { }
    }
    else if (newNode.dataType === 'array') {
        newNode.items = [];
        newNode.options.maxItems = Math.min(schema.maxItems || 1000, newNode.options.maxItems || 1000);
        newNode.options.minItems = Math.max(schema.minItems || 0, newNode.options.minItems || 0);
        if (!newNode.options.minItems && isInputRequired(jsf.schema, schemaPointer)) {
            newNode.options.minItems = 1;
        }
        if (!hasOwn(newNode.options, 'listItems')) {
            newNode.options.listItems = 1;
        }
        newNode.options.tupleItems = isArray(schema.items) ? schema.items.length : 0;
        if (newNode.options.maxItems <= newNode.options.tupleItems) {
            newNode.options.tupleItems = newNode.options.maxItems;
            newNode.options.listItems = 0;
        }
        else if (newNode.options.maxItems <
            newNode.options.tupleItems + newNode.options.listItems) {
            newNode.options.listItems = newNode.options.maxItems - newNode.options.tupleItems;
        }
        else if (newNode.options.minItems >
            newNode.options.tupleItems + newNode.options.listItems) {
            newNode.options.listItems = newNode.options.minItems - newNode.options.tupleItems;
        }
        if (!nodeDataMap.has('maxItems')) {
            nodeDataMap.set('maxItems', newNode.options.maxItems);
            nodeDataMap.set('minItems', newNode.options.minItems);
            nodeDataMap.set('tupleItems', newNode.options.tupleItems);
            nodeDataMap.set('listItems', newNode.options.listItems);
        }
        if (!jsf.arrayMap.has(shortDataPointer)) {
            jsf.arrayMap.set(shortDataPointer, newNode.options.tupleItems);
        }
        removable = newNode.options.removable !== false;
        let additionalItemsSchemaPointer = null;
        // If 'items' is an array = tuple items
        if (isArray(schema.items)) {
            newNode.items = [];
            for (let i = 0; i < newNode.options.tupleItems; i++) {
                let newItem;
                const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/' + i, jsf.dataRecursiveRefMap, jsf.arrayMap);
                const itemRecursive = !itemRefPointer.length ||
                    itemRefPointer !== shortDataPointer + '/' + i;
                // If removable, add tuple item layout to layoutRefLibrary
                if (removable && i >= newNode.options.minItems) {
                    if (!hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                        // Set to null first to prevent recursive reference from causing endless loop
                        jsf.layoutRefLibrary[itemRefPointer] = null;
                        jsf.layoutRefLibrary[itemRefPointer] = buildLayoutFromSchema(jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null, schemaPointer + '/items/' + i, itemRecursive ? '' : dataPointer + '/' + i, true, 'tuple', true, true, itemRecursive ? dataPointer + '/' + i : '');
                        if (itemRecursive) {
                            jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                        }
                    }
                    newItem = getLayoutNode({
                        $ref: itemRefPointer,
                        dataPointer: dataPointer + '/' + i,
                        recursiveReference: itemRecursive,
                    }, jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null);
                }
                else {
                    newItem = buildLayoutFromSchema(jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null, schemaPointer + '/items/' + i, dataPointer + '/' + i, true, 'tuple', false, forRefLibrary, dataPointerPrefix);
                }
                if (newItem) {
                    newNode.items.push(newItem);
                }
            }
            // If 'additionalItems' is an object = additional list items, after tuple items
            if (isObject(schema.additionalItems)) {
                additionalItemsSchemaPointer = schemaPointer + '/additionalItems';
            }
            // If 'items' is an object = list items only (no tuple items)
        }
        else if (isObject(schema.items)) {
            additionalItemsSchemaPointer = schemaPointer + '/items';
        }
        if (additionalItemsSchemaPointer) {
            const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
            const itemRecursive = !itemRefPointer.length ||
                itemRefPointer !== shortDataPointer + '/-';
            const itemSchemaPointer = removeRecursiveReferences(additionalItemsSchemaPointer, jsf.schemaRecursiveRefMap, jsf.arrayMap);
            // Add list item layout to layoutRefLibrary
            if (itemRefPointer.length && !hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.layoutRefLibrary[itemRefPointer] = null;
                jsf.layoutRefLibrary[itemRefPointer] = buildLayoutFromSchema(jsf, widgetLibrary, null, itemSchemaPointer, itemRecursive ? '' : dataPointer + '/-', true, 'list', removable, true, itemRecursive ? dataPointer + '/-' : '');
                if (itemRecursive) {
                    jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                }
            }
            // Add any additional default items
            if (!itemRecursive || newNode.options.required) {
                const arrayLength = Math.min(Math.max(itemRecursive ? 0 :
                    newNode.options.tupleItems + newNode.options.listItems, isArray(nodeValue) ? nodeValue.length : 0), newNode.options.maxItems);
                if (newNode.items.length < arrayLength) {
                    for (let i = newNode.items.length; i < arrayLength; i++) {
                        newNode.items.push(getLayoutNode({
                            $ref: itemRefPointer,
                            dataPointer: dataPointer + '/-',
                            recursiveReference: itemRecursive,
                        }, jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null));
                    }
                }
            }
            // If needed, add button to add items to array
            if (newNode.options.addable !== false &&
                newNode.options.minItems < newNode.options.maxItems &&
                (newNode.items[newNode.items.length - 1] || {}).type !== '$ref') {
                let buttonText = ((jsf.layoutRefLibrary[itemRefPointer] || {}).options || {}).title;
                const prefix = buttonText ? 'Add ' : 'Add to ';
                if (!buttonText) {
                    buttonText = schema.title || fixTitle(JsonPointer.toKey(dataPointer));
                }
                if (!/^add\b/i.test(buttonText)) {
                    buttonText = prefix + buttonText;
                }
                newNode.items.push({
                    _id: uniqueId(),
                    arrayItem: true,
                    arrayItemType: 'list',
                    dataPointer: newNode.dataPointer + '/-',
                    options: {
                        listItems: newNode.options.listItems,
                        maxItems: newNode.options.maxItems,
                        minItems: newNode.options.minItems,
                        removable: false,
                        title: buttonText,
                        tupleItems: newNode.options.tupleItems,
                    },
                    recursiveReference: itemRecursive,
                    type: '$ref',
                    widget: widgetLibrary.getWidget('$ref'),
                    $ref: itemRefPointer,
                });
            }
        }
    }
    else if (newNode.dataType === '$ref') {
        const schemaRef = JsonPointer.compile(schema.$ref);
        const dataRef = JsonPointer.toDataPointer(schemaRef, jsf.schema);
        let buttonText = '';
        // Get newNode title
        if (newNode.options.add) {
            buttonText = newNode.options.add;
        }
        else if (newNode.name && !/^\d+$/.test(newNode.name)) {
            buttonText =
                (/^add\b/i.test(newNode.name) ? '' : 'Add ') + fixTitle(newNode.name);
            // If newNode doesn't have a title, look for title of parent array item
        }
        else {
            const parentSchema = JsonPointer.get(jsf.schema, schemaPointer, 0, -1);
            if (hasOwn(parentSchema, 'title')) {
                buttonText = 'Add to ' + parentSchema.title;
            }
            else {
                const pointerArray = JsonPointer.parse(newNode.dataPointer);
                buttonText = 'Add to ' + fixTitle(pointerArray[pointerArray.length - 2]);
            }
        }
        Object.assign(newNode, {
            recursiveReference: true,
            widget: widgetLibrary.getWidget('$ref'),
            $ref: dataRef,
        });
        Object.assign(newNode.options, {
            removable: false,
            title: buttonText,
        });
        if (isNumber(JsonPointer.get(jsf.schema, schemaPointer, 0, -1).maxItems)) {
            newNode.options.maxItems =
                JsonPointer.get(jsf.schema, schemaPointer, 0, -1).maxItems;
        }
        // Add layout template to layoutRefLibrary
        if (dataRef.length) {
            if (!hasOwn(jsf.layoutRefLibrary, dataRef)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.layoutRefLibrary[dataRef] = null;
                const newLayout = buildLayoutFromSchema(jsf, widgetLibrary, null, schemaRef, '', newNode.arrayItem, newNode.arrayItemType, true, true, dataPointer);
                if (newLayout) {
                    newLayout.recursiveReference = true;
                    jsf.layoutRefLibrary[dataRef] = newLayout;
                }
                else {
                    delete jsf.layoutRefLibrary[dataRef];
                }
            }
            else if (!jsf.layoutRefLibrary[dataRef].recursiveReference) {
                jsf.layoutRefLibrary[dataRef].recursiveReference = true;
            }
        }
    }
    return newNode;
}
/**
 * 'mapLayout' function
 *
 * Creates a new layout by running each element in an existing layout through
 * an iteratee. Recursively maps within array elements 'items' and 'tabs'.
 * The iteratee is invoked with four arguments: (value, index, layout, path)
 *
 * The returned layout may be longer (or shorter) then the source layout.
 *
 * If an item from the source layout returns multiple items (as '*' usually will),
 * this function will keep all returned items in-line with the surrounding items.
 *
 * If an item from the source layout causes an error and returns null, it is
 * skipped without error, and the function will still return all non-null items.
 *
 * //   layout - the layout to map
 * //  { (v: any, i?: number, l?: any, p?: string) => any }
 *   function - the funciton to invoke on each element
 * //  { string|string[] = '' } layoutPointer - the layoutPointer to layout, inside rootLayout
 * //  { any[] = layout } rootLayout - the root layout, which conatins layout
 * //
 */
export function mapLayout(layout, fn, layoutPointer = '', rootLayout = layout) {
    let indexPad = 0;
    let newLayout = [];
    forEach(layout, (item, index) => {
        const realIndex = +index + indexPad;
        const newLayoutPointer = layoutPointer + '/' + realIndex;
        let newNode = copy(item);
        let itemsArray = [];
        if (isObject(item)) {
            if (hasOwn(item, 'tabs')) {
                item.items = item.tabs;
                delete item.tabs;
            }
            if (hasOwn(item, 'items')) {
                itemsArray = isArray(item.items) ? item.items : [item.items];
            }
        }
        if (itemsArray.length) {
            newNode.items = mapLayout(itemsArray, fn, newLayoutPointer + '/items', rootLayout);
        }
        newNode = fn(newNode, realIndex, newLayoutPointer, rootLayout);
        if (!isDefined(newNode)) {
            indexPad--;
        }
        else {
            if (isArray(newNode)) {
                indexPad += newNode.length - 1;
            }
            newLayout = newLayout.concat(newNode);
        }
    });
    return newLayout;
}
/**
 * 'getLayoutNode' function
 * Copy a new layoutNode from layoutRefLibrary
 *
 * //   refNode -
 * //   layoutRefLibrary -
 * //  { any = null } widgetLibrary -
 * //  { any = null } nodeValue -
 * //  copied layoutNode
 */
export function getLayoutNode(refNode, jsf, widgetLibrary = null, nodeValue = null) {
    // If recursive reference and building initial layout, return Add button
    if (refNode.recursiveReference && widgetLibrary) {
        const newLayoutNode = cloneDeep(refNode);
        if (!newLayoutNode.options) {
            newLayoutNode.options = {};
        }
        Object.assign(newLayoutNode, {
            recursiveReference: true,
            widget: widgetLibrary.getWidget('$ref'),
        });
        Object.assign(newLayoutNode.options, {
            removable: false,
            title: 'Add ' + newLayoutNode.$ref,
        });
        return newLayoutNode;
        // Otherwise, return referenced layout
    }
    else {
        let newLayoutNode = jsf.layoutRefLibrary[refNode.$ref];
        // If value defined, build new node from schema (to set array lengths)
        if (isDefined(nodeValue)) {
            newLayoutNode = buildLayoutFromSchema(jsf, widgetLibrary, nodeValue, JsonPointer.toSchemaPointer(refNode.$ref, jsf.schema), refNode.$ref, newLayoutNode.arrayItem, newLayoutNode.arrayItemType, newLayoutNode.options.removable, false);
        }
        else {
            // If value not defined, copy node from layoutRefLibrary
            newLayoutNode = cloneDeep(newLayoutNode);
            JsonPointer.forEachDeep(newLayoutNode, (subNode, pointer) => {
                // Reset all _id's in newLayoutNode to unique values
                if (hasOwn(subNode, '_id')) {
                    subNode._id = uniqueId();
                }
                // If adding a recursive item, prefix current dataPointer
                // to all dataPointers in new layoutNode
                if (refNode.recursiveReference && hasOwn(subNode, 'dataPointer')) {
                    subNode.dataPointer = refNode.dataPointer + subNode.dataPointer;
                }
            });
        }
        return newLayoutNode;
    }
}
/**
 * 'buildTitleMap' function
 *
 * //   titleMap -
 * //   enumList -
 * //  { boolean = true } fieldRequired -
 * //  { boolean = true } flatList -
 * // { TitleMapItem[] }
 */
export function buildTitleMap(titleMap, enumList, fieldRequired = true, flatList = true) {
    let newTitleMap = [];
    let hasEmptyValue = false;
    if (titleMap) {
        if (isArray(titleMap)) {
            if (enumList) {
                for (const i of Object.keys(titleMap)) {
                    if (isObject(titleMap[i])) { // JSON Form style
                        const value = titleMap[i].value;
                        if (enumList.includes(value)) {
                            const name = titleMap[i].name;
                            newTitleMap.push({ name, value });
                            if (value === undefined || value === null) {
                                hasEmptyValue = true;
                            }
                        }
                    }
                    else if (isString(titleMap[i])) { // React Jsonschema Form style
                        if (i < enumList.length) {
                            const name = titleMap[i];
                            const value = enumList[i];
                            newTitleMap.push({ name, value });
                            if (value === undefined || value === null) {
                                hasEmptyValue = true;
                            }
                        }
                    }
                }
            }
            else { // If array titleMap and no enum list, just return the titleMap - Angular Schema Form style
                newTitleMap = titleMap;
                if (!fieldRequired) {
                    hasEmptyValue = !!newTitleMap
                        .filter(i => i.value === undefined || i.value === null)
                        .length;
                }
            }
        }
        else if (enumList) { // Alternate JSON Form style, with enum list
            for (const i of Object.keys(enumList)) {
                const value = enumList[i];
                if (hasOwn(titleMap, value)) {
                    const name = titleMap[value];
                    newTitleMap.push({ name, value });
                    if (value === undefined || value === null) {
                        hasEmptyValue = true;
                    }
                }
            }
        }
        else { // Alternate JSON Form style, without enum list
            for (const value of Object.keys(titleMap)) {
                const name = titleMap[value];
                newTitleMap.push({ name, value });
                if (value === undefined || value === null) {
                    hasEmptyValue = true;
                }
            }
        }
    }
    else if (enumList) { // Build map from enum list alone
        for (const i of Object.keys(enumList)) {
            const name = enumList[i];
            const value = enumList[i];
            newTitleMap.push({ name, value });
            if (value === undefined || value === null) {
                hasEmptyValue = true;
            }
        }
    }
    else { // If no titleMap and no enum list, return default map of boolean values
        newTitleMap = [{ name: 'True', value: true }, { name: 'False', value: false }];
    }
    // Does titleMap have groups?
    if (newTitleMap.some(title => hasOwn(title, 'group'))) {
        hasEmptyValue = false;
        // If flatList = true, flatten items & update name to group: name
        if (flatList) {
            newTitleMap = newTitleMap.reduce((groupTitleMap, title) => {
                if (hasOwn(title, 'group')) {
                    if (isArray(title.items)) {
                        groupTitleMap = [
                            ...groupTitleMap,
                            ...title.items.map(item => ({ ...item, ...{ name: `${title.group}: ${item.name}` } }))
                        ];
                        if (title.items.some(item => item.value === undefined || item.value === null)) {
                            hasEmptyValue = true;
                        }
                    }
                    if (hasOwn(title, 'name') && hasOwn(title, 'value')) {
                        title.name = `${title.group}: ${title.name}`;
                        delete title.group;
                        groupTitleMap.push(title);
                        if (title.value === undefined || title.value === null) {
                            hasEmptyValue = true;
                        }
                    }
                }
                else {
                    groupTitleMap.push(title);
                    if (title.value === undefined || title.value === null) {
                        hasEmptyValue = true;
                    }
                }
                return groupTitleMap;
            }, []);
            // If flatList = false, combine items from matching groups
        }
        else {
            newTitleMap = newTitleMap.reduce((groupTitleMap, title) => {
                if (hasOwn(title, 'group')) {
                    if (title.group !== (groupTitleMap[groupTitleMap.length - 1] || {}).group) {
                        groupTitleMap.push({ group: title.group, items: title.items || [] });
                    }
                    if (hasOwn(title, 'name') && hasOwn(title, 'value')) {
                        groupTitleMap[groupTitleMap.length - 1].items
                            .push({ name: title.name, value: title.value });
                        if (title.value === undefined || title.value === null) {
                            hasEmptyValue = true;
                        }
                    }
                }
                else {
                    groupTitleMap.push(title);
                    if (title.value === undefined || title.value === null) {
                        hasEmptyValue = true;
                    }
                }
                return groupTitleMap;
            }, []);
        }
    }
    if (!fieldRequired && !hasEmptyValue) {
        newTitleMap.unshift({ name: '<em>None</em>', value: null });
    }
    return newTitleMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9zaGFyZWQvbGF5b3V0LmZ1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLFFBQVEsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0QyxPQUFPLGNBQWMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRCxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUV2QyxPQUFPLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixZQUFZLEVBQ1osZUFBZSxFQUNmLHlCQUF5QixFQUN6QixrQkFBa0IsRUFDbkIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxFQUNMLElBQUksRUFDSixRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDUCxNQUFNLHFCQUFxQixDQUFDO0FBQzdCLE9BQU8sRUFDTCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFNBQVMsRUFDVCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1QsTUFBTSx1QkFBdUIsQ0FBQztBQUsvQjs7Ozs7Ozs7Ozs7O0dBWUc7QUFFSDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsR0FBRyxFQUFFLGFBQWE7SUFDckQsSUFBSSxlQUFlLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3RFLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsRUFBRTtRQUM1RSxNQUFNLE9BQU8sR0FBUTtZQUNuQixHQUFHLEVBQUUsUUFB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RSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQ3RFO29CQUNELElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNuRCxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLOzZCQUMxQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7d0JBQ2xELElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7NEJBQ3JELGFBQWEsR0FBRyxJQUFJLENBQUM7eUJBQ3RCO3FCQUNGO2lCQUNGO3FCQUFNO29CQUNMLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFCLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7d0JBQ3JELGFBQWEsR0FBRyxJQUFJLENBQUM7cUJBQ3RCO2lCQUNGO2dCQUNELE9BQU8sYUFBYSxDQUFDO1lBQ3ZCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNSO0tBQ0Y7SUFDRCxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsYUFBYSxFQUFFO1FBQ3BDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzdEO0lBQ0QsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5pbXBvcnQgX2lzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXknO1xuaW1wb3J0IF9pc1BsYWluT2JqZWN0IGZyb20gJ2xvZGFzaC9pc1BsYWluT2JqZWN0JztcbmltcG9ydCB1bmlxdWVJZCBmcm9tICdsb2Rhc2gvdW5pcXVlSWQnO1xuaW1wb3J0IHsgVGl0bGVNYXBJdGVtIH0gZnJvbSAnLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIGNoZWNrSW5saW5lVHlwZSxcbiAgZ2V0RnJvbVNjaGVtYSxcbiAgZ2V0SW5wdXRUeXBlLFxuICBpc0lucHV0UmVxdWlyZWQsXG4gIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMsXG4gIHVwZGF0ZUlucHV0T3B0aW9uc1xufSBmcm9tICcuL2pzb24tc2NoZW1hLmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBKc29uUG9pbnRlciB9IGZyb20gJy4vanNvbnBvaW50ZXIuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGNvcHksXG4gIGZpeFRpdGxlLFxuICBmb3JFYWNoLFxuICBoYXNPd25cbn0gZnJvbSAnLi91dGlsaXR5LmZ1bmN0aW9ucyc7XG5pbXBvcnQge1xuICBpbkFycmF5LFxuICBpc0FycmF5LFxuICBpc0RlZmluZWQsXG4gIGlzRW1wdHksXG4gIGlzTnVtYmVyLFxuICBpc09iamVjdCxcbiAgaXNTdHJpbmdcbn0gZnJvbSAnLi92YWxpZGF0b3IuZnVuY3Rpb25zJztcblxuXG5cblxuLyoqXG4gKiBMYXlvdXQgZnVuY3Rpb24gbGlicmFyeTpcbiAqXG4gKiBidWlsZExheW91dDogICAgICAgICAgICBCdWlsZHMgYSBjb21wbGV0ZSBsYXlvdXQgZnJvbSBhbiBpbnB1dCBsYXlvdXQgYW5kIHNjaGVtYVxuICpcbiAqIGJ1aWxkTGF5b3V0RnJvbVNjaGVtYTogIEJ1aWxkcyBhIGNvbXBsZXRlIGxheW91dCBlbnRpcmVseSBmcm9tIGFuIGlucHV0IHNjaGVtYVxuICpcbiAqIG1hcExheW91dDpcbiAqXG4gKiBnZXRMYXlvdXROb2RlOlxuICpcbiAqIGJ1aWxkVGl0bGVNYXA6XG4gKi9cblxuLyoqXG4gKiAnYnVpbGRMYXlvdXQnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBqc2ZcbiAqIC8vICAgd2lkZ2V0TGlicmFyeVxuICogLy9cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTGF5b3V0X29yaWdpbmFsKGpzZiwgd2lkZ2V0TGlicmFyeSkge1xuICBsZXQgaGFzU3VibWl0QnV0dG9uID0gIUpzb25Qb2ludGVyLmdldChqc2YsICcvZm9ybU9wdGlvbnMvYWRkU3VibWl0Jyk7XG4gIGNvbnN0IGZvcm1MYXlvdXQgPSBtYXBMYXlvdXQoanNmLmxheW91dCwgKGxheW91dEl0ZW0sIGluZGV4LCBsYXlvdXRQb2ludGVyKSA9PiB7XG4gICAgY29uc3QgbmV3Tm9kZTogYW55ID0ge1xuICAgICAgX2lkOiB1bmlxdWVJZCgpLFxuICAgICAgb3B0aW9uczoge30sXG4gICAgfTtcbiAgICBpZiAoaXNPYmplY3QobGF5b3V0SXRlbSkpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24obmV3Tm9kZSwgbGF5b3V0SXRlbSk7XG4gICAgICBPYmplY3Qua2V5cyhuZXdOb2RlKVxuICAgICAgICAuZmlsdGVyKG9wdGlvbiA9PiAhaW5BcnJheShvcHRpb24sIFtcbiAgICAgICAgICAnX2lkJywgJyRyZWYnLCAnYXJyYXlJdGVtJywgJ2FycmF5SXRlbVR5cGUnLCAnZGF0YVBvaW50ZXInLCAnZGF0YVR5cGUnLFxuICAgICAgICAgICdpdGVtcycsICdrZXknLCAnbmFtZScsICdvcHRpb25zJywgJ3JlY3Vyc2l2ZVJlZmVyZW5jZScsICd0eXBlJywgJ3dpZGdldCdcbiAgICAgICAgXSkpXG4gICAgICAgIC5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zW29wdGlvbl0gPSBuZXdOb2RlW29wdGlvbl07XG4gICAgICAgICAgZGVsZXRlIG5ld05vZGVbb3B0aW9uXTtcbiAgICAgICAgfSk7XG4gICAgICBpZiAoIWhhc093bihuZXdOb2RlLCAndHlwZScpICYmIGlzU3RyaW5nKG5ld05vZGUud2lkZ2V0KSkge1xuICAgICAgICBuZXdOb2RlLnR5cGUgPSBuZXdOb2RlLndpZGdldDtcbiAgICAgICAgZGVsZXRlIG5ld05vZGUud2lkZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKCFoYXNPd24obmV3Tm9kZS5vcHRpb25zLCAndGl0bGUnKSkge1xuICAgICAgICBpZiAoaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ2xlZ2VuZCcpKSB7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnRpdGxlID0gbmV3Tm9kZS5vcHRpb25zLmxlZ2VuZDtcbiAgICAgICAgICBkZWxldGUgbmV3Tm9kZS5vcHRpb25zLmxlZ2VuZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFoYXNPd24obmV3Tm9kZS5vcHRpb25zLCAndmFsaWRhdGlvbk1lc3NhZ2VzJykpIHtcbiAgICAgICAgaWYgKGhhc093bihuZXdOb2RlLm9wdGlvbnMsICdlcnJvck1lc3NhZ2VzJykpIHtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2VzID0gbmV3Tm9kZS5vcHRpb25zLmVycm9yTWVzc2FnZXM7XG4gICAgICAgICAgZGVsZXRlIG5ld05vZGUub3B0aW9ucy5lcnJvck1lc3NhZ2VzO1xuXG4gICAgICAgICAgLy8gQ29udmVydCBBbmd1bGFyIFNjaGVtYSBGb3JtIChBbmd1bGFySlMpICd2YWxpZGF0aW9uTWVzc2FnZScgdG9cbiAgICAgICAgICAvLyBBbmd1bGFyIEpTT04gU2NoZW1hIEZvcm0gJ3ZhbGlkYXRpb25NZXNzYWdlcydcbiAgICAgICAgICAvLyBUVjQgY29kZXMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZ2VyYWludGx1ZmYvdHY0L2Jsb2IvbWFzdGVyL3NvdXJjZS9hcGkuanNcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPd24obmV3Tm9kZS5vcHRpb25zLCAndmFsaWRhdGlvbk1lc3NhZ2UnKSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlcyA9IG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlcyA9IHt9O1xuICAgICAgICAgICAgT2JqZWN0LmtleXMobmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBrZXkgKyAnJztcbiAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID1cbiAgICAgICAgICAgICAgICBjb2RlID09PSAnMCcgPyAndHlwZScgOlxuICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzEnID8gJ2VudW0nIDpcbiAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzEwMCcgPyAnbXVsdGlwbGVPZicgOlxuICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcxMDEnID8gJ21pbmltdW0nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcxMDInID8gJ2V4Y2x1c2l2ZU1pbmltdW0nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzEwMycgPyAnbWF4aW11bScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcxMDQnID8gJ2V4Y2x1c2l2ZU1heGltdW0nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcyMDAnID8gJ21pbkxlbmd0aCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMjAxJyA/ICdtYXhMZW5ndGgnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMjAyJyA/ICdwYXR0ZXJuJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMzAwJyA/ICdtaW5Qcm9wZXJ0aWVzJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICczMDEnID8gJ21heFByb3BlcnRpZXMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMzAyJyA/ICdyZXF1aXJlZCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzMwNCcgPyAnZGVwZW5kZW5jaWVzJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICc0MDAnID8gJ21pbkl0ZW1zJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzQwMScgPyAnbWF4SXRlbXMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICc0MDInID8gJ3VuaXF1ZUl0ZW1zJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICc1MDAnID8gJ2Zvcm1hdCcgOiBjb2RlICsgJyc7XG4gICAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXNbbmV3S2V5XSA9IG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZVtrZXldO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKEpzb25Qb2ludGVyLmlzSnNvblBvaW50ZXIobGF5b3V0SXRlbSkpIHtcbiAgICAgIG5ld05vZGUuZGF0YVBvaW50ZXIgPSBsYXlvdXRJdGVtO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcobGF5b3V0SXRlbSkpIHtcbiAgICAgIG5ld05vZGUua2V5ID0gbGF5b3V0SXRlbTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignYnVpbGRMYXlvdXQgZXJyb3I6IEZvcm0gbGF5b3V0IGVsZW1lbnQgbm90IHJlY29nbml6ZWQ6Jyk7XG4gICAgICBjb25zb2xlLmVycm9yKGxheW91dEl0ZW0pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBub2RlU2NoZW1hOiBhbnkgPSBudWxsO1xuXG4gICAgLy8gSWYgbmV3Tm9kZSBkb2VzIG5vdCBoYXZlIGEgZGF0YVBvaW50ZXIsIHRyeSB0byBmaW5kIGFuIGVxdWl2YWxlbnRcbiAgICBpZiAoIWhhc093bihuZXdOb2RlLCAnZGF0YVBvaW50ZXInKSkge1xuXG4gICAgICAvLyBJZiBuZXdOb2RlIGhhcyBhIGtleSwgY2hhbmdlIGl0IHRvIGEgZGF0YVBvaW50ZXJcbiAgICAgIGlmIChoYXNPd24obmV3Tm9kZSwgJ2tleScpKSB7XG4gICAgICAgIG5ld05vZGUuZGF0YVBvaW50ZXIgPSBuZXdOb2RlLmtleSA9PT0gJyonID8gbmV3Tm9kZS5rZXkgOlxuICAgICAgICAgIEpzb25Qb2ludGVyLmNvbXBpbGUoSnNvblBvaW50ZXIucGFyc2VPYmplY3RQYXRoKG5ld05vZGUua2V5KSwgJy0nKTtcbiAgICAgICAgZGVsZXRlIG5ld05vZGUua2V5O1xuXG4gICAgICAgIC8vIElmIG5ld05vZGUgaXMgYW4gYXJyYXksIHNlYXJjaCBmb3IgZGF0YVBvaW50ZXIgaW4gY2hpbGQgbm9kZXNcbiAgICAgIH0gZWxzZSBpZiAoaGFzT3duKG5ld05vZGUsICd0eXBlJykgJiYgbmV3Tm9kZS50eXBlLnNsaWNlKC01KSA9PT0gJ2FycmF5Jykge1xuICAgICAgICBjb25zdCBmaW5kRGF0YVBvaW50ZXIgPSAoaXRlbXMpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbXMgPT09IG51bGwgfHwgdHlwZW9mIGl0ZW1zICE9PSAnb2JqZWN0JykgeyByZXR1cm47IH1cbiAgICAgICAgICBpZiAoaGFzT3duKGl0ZW1zLCAnZGF0YVBvaW50ZXInKSkgeyByZXR1cm4gaXRlbXMuZGF0YVBvaW50ZXI7IH1cbiAgICAgICAgICBpZiAoaXNBcnJheShpdGVtcy5pdGVtcykpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcy5pdGVtcykge1xuICAgICAgICAgICAgICBpZiAoaGFzT3duKGl0ZW0sICdkYXRhUG9pbnRlcicpICYmIGl0ZW0uZGF0YVBvaW50ZXIuaW5kZXhPZignLy0nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5kYXRhUG9pbnRlcjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaGFzT3duKGl0ZW0sICdpdGVtcycpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoSXRlbSA9IGZpbmREYXRhUG9pbnRlcihpdGVtKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoSXRlbSkgeyByZXR1cm4gc2VhcmNoSXRlbTsgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjaGlsZERhdGFQb2ludGVyID0gZmluZERhdGFQb2ludGVyKG5ld05vZGUpO1xuICAgICAgICBpZiAoY2hpbGREYXRhUG9pbnRlcikge1xuICAgICAgICAgIG5ld05vZGUuZGF0YVBvaW50ZXIgPVxuICAgICAgICAgICAgY2hpbGREYXRhUG9pbnRlci5zbGljZSgwLCBjaGlsZERhdGFQb2ludGVyLmxhc3RJbmRleE9mKCcvLScpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNPd24obmV3Tm9kZSwgJ2RhdGFQb2ludGVyJykpIHtcbiAgICAgIGlmIChuZXdOb2RlLmRhdGFQb2ludGVyID09PSAnKicpIHtcbiAgICAgICAgcmV0dXJuIGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShqc2YsIHdpZGdldExpYnJhcnksIGpzZi5mb3JtVmFsdWVzKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5vZGVWYWx1ZSA9XG4gICAgICAgIEpzb25Qb2ludGVyLmdldChqc2YuZm9ybVZhbHVlcywgbmV3Tm9kZS5kYXRhUG9pbnRlci5yZXBsYWNlKC9cXC8tL2csICcvMScpKTtcblxuICAgICAgLy8gVE9ETzogQ3JlYXRlIGZ1bmN0aW9uIGdldEZvcm1WYWx1ZXMoanNmLCBkYXRhUG9pbnRlciwgZm9yUmVmTGlicmFyeSlcbiAgICAgIC8vIGNoZWNrIGZvcm1PcHRpb25zLnNldFNjaGVtYURlZmF1bHRzIGFuZCBmb3JtT3B0aW9ucy5zZXRMYXlvdXREZWZhdWx0c1xuICAgICAgLy8gdGhlbiBzZXQgYXByb3ByaWF0ZSB2YWx1ZXMgZnJvbSBpbml0aWFsVmF1ZXMsIHNjaGVtYSwgb3IgbGF5b3V0XG5cbiAgICAgIG5ld05vZGUuZGF0YVBvaW50ZXIgPVxuICAgICAgICBKc29uUG9pbnRlci50b0dlbmVyaWNQb2ludGVyKG5ld05vZGUuZGF0YVBvaW50ZXIsIGpzZi5hcnJheU1hcCk7XG4gICAgICBjb25zdCBMYXN0S2V5ID0gSnNvblBvaW50ZXIudG9LZXkobmV3Tm9kZS5kYXRhUG9pbnRlcik7XG4gICAgICBpZiAoIW5ld05vZGUubmFtZSAmJiBpc1N0cmluZyhMYXN0S2V5KSAmJiBMYXN0S2V5ICE9PSAnLScpIHtcbiAgICAgICAgbmV3Tm9kZS5uYW1lID0gTGFzdEtleTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNob3J0RGF0YVBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICBuZXdOb2RlLmRhdGFQb2ludGVyLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICApO1xuICAgICAgY29uc3QgcmVjdXJzaXZlID0gIXNob3J0RGF0YVBvaW50ZXIubGVuZ3RoIHx8XG4gICAgICAgIHNob3J0RGF0YVBvaW50ZXIgIT09IG5ld05vZGUuZGF0YVBvaW50ZXI7XG4gICAgICBsZXQgc2NoZW1hUG9pbnRlcjogc3RyaW5nO1xuICAgICAgaWYgKCFqc2YuZGF0YU1hcC5oYXMoc2hvcnREYXRhUG9pbnRlcikpIHtcbiAgICAgICAganNmLmRhdGFNYXAuc2V0KHNob3J0RGF0YVBvaW50ZXIsIG5ldyBNYXAoKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBub2RlRGF0YU1hcCA9IGpzZi5kYXRhTWFwLmdldChzaG9ydERhdGFQb2ludGVyKTtcbiAgICAgIGlmIChub2RlRGF0YU1hcC5oYXMoJ3NjaGVtYVBvaW50ZXInKSkge1xuICAgICAgICBzY2hlbWFQb2ludGVyID0gbm9kZURhdGFNYXAuZ2V0KCdzY2hlbWFQb2ludGVyJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY2hlbWFQb2ludGVyID0gSnNvblBvaW50ZXIudG9TY2hlbWFQb2ludGVyKHNob3J0RGF0YVBvaW50ZXIsIGpzZi5zY2hlbWEpO1xuICAgICAgICBub2RlRGF0YU1hcC5zZXQoJ3NjaGVtYVBvaW50ZXInLCBzY2hlbWFQb2ludGVyKTtcbiAgICAgIH1cbiAgICAgIG5vZGVEYXRhTWFwLnNldCgnZGlzYWJsZWQnLCAhIW5ld05vZGUub3B0aW9ucy5kaXNhYmxlZCk7XG4gICAgICBub2RlU2NoZW1hID0gSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIpO1xuICAgICAgaWYgKG5vZGVTY2hlbWEpIHtcbiAgICAgICAgaWYgKCFoYXNPd24obmV3Tm9kZSwgJ3R5cGUnKSkge1xuICAgICAgICAgIG5ld05vZGUudHlwZSA9IGdldElucHV0VHlwZShub2RlU2NoZW1hLCBuZXdOb2RlKTtcbiAgICAgICAgfSBlbHNlIGlmICghd2lkZ2V0TGlicmFyeS5oYXNXaWRnZXQobmV3Tm9kZS50eXBlKSkge1xuICAgICAgICAgIGNvbnN0IG9sZFdpZGdldFR5cGUgPSBuZXdOb2RlLnR5cGU7XG4gICAgICAgICAgbmV3Tm9kZS50eXBlID0gZ2V0SW5wdXRUeXBlKG5vZGVTY2hlbWEsIG5ld05vZGUpO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVycm9yOiB3aWRnZXQgdHlwZSBcIiR7b2xkV2lkZ2V0VHlwZX1cIiBgICtcbiAgICAgICAgICAgIGBub3QgZm91bmQgaW4gbGlicmFyeS4gUmVwbGFjaW5nIHdpdGggXCIke25ld05vZGUudHlwZX1cIi5gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdOb2RlLnR5cGUgPSBjaGVja0lubGluZVR5cGUobmV3Tm9kZS50eXBlLCBub2RlU2NoZW1hLCBuZXdOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZVNjaGVtYS50eXBlID09PSAnb2JqZWN0JyAmJiBpc0FycmF5KG5vZGVTY2hlbWEucmVxdWlyZWQpKSB7XG4gICAgICAgICAgbm9kZURhdGFNYXAuc2V0KCdyZXF1aXJlZCcsIG5vZGVTY2hlbWEucmVxdWlyZWQpO1xuICAgICAgICB9XG4gICAgICAgIG5ld05vZGUuZGF0YVR5cGUgPVxuICAgICAgICAgIG5vZGVTY2hlbWEudHlwZSB8fCAoaGFzT3duKG5vZGVTY2hlbWEsICckcmVmJykgPyAnJHJlZicgOiBudWxsKTtcbiAgICAgICAgdXBkYXRlSW5wdXRPcHRpb25zKG5ld05vZGUsIG5vZGVTY2hlbWEsIGpzZik7XG5cbiAgICAgICAgLy8gUHJlc2VudCBjaGVja2JveGVzIGFzIHNpbmdsZSBjb250cm9sLCByYXRoZXIgdGhhbiBhcnJheVxuICAgICAgICBpZiAobmV3Tm9kZS50eXBlID09PSAnY2hlY2tib3hlcycgJiYgaGFzT3duKG5vZGVTY2hlbWEsICdpdGVtcycpKSB7XG4gICAgICAgICAgdXBkYXRlSW5wdXRPcHRpb25zKG5ld05vZGUsIG5vZGVTY2hlbWEuaXRlbXMsIGpzZik7XG4gICAgICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5kYXRhVHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyA9IE1hdGgubWluKFxuICAgICAgICAgICAgbm9kZVNjaGVtYS5tYXhJdGVtcyB8fCAxMDAwLCBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgfHwgMTAwMFxuICAgICAgICAgICk7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zID0gTWF0aC5tYXgoXG4gICAgICAgICAgICBub2RlU2NoZW1hLm1pbkl0ZW1zIHx8IDAsIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyB8fCAwXG4gICAgICAgICAgKTtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zID0gTWF0aC5tYXgoXG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zIHx8IDAsIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZS5sZW5ndGggOiAwXG4gICAgICAgICAgKTtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyA9XG4gICAgICAgICAgICBpc0FycmF5KG5vZGVTY2hlbWEuaXRlbXMpID8gbm9kZVNjaGVtYS5pdGVtcy5sZW5ndGggOiAwO1xuICAgICAgICAgIGlmIChuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgPCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcykge1xuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgPSBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXM7XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zID0gMDtcbiAgICAgICAgICB9IGVsc2UgaWYgKG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyA8XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyArIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXNcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPVxuICAgICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgLSBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcztcbiAgICAgICAgICB9IGVsc2UgaWYgKG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA+XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyArIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXNcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPVxuICAgICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgLSBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFub2RlRGF0YU1hcC5oYXMoJ21heEl0ZW1zJykpIHtcbiAgICAgICAgICAgIG5vZGVEYXRhTWFwLnNldCgnbWF4SXRlbXMnLCBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMpO1xuICAgICAgICAgICAgbm9kZURhdGFNYXAuc2V0KCdtaW5JdGVtcycsIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyk7XG4gICAgICAgICAgICBub2RlRGF0YU1hcC5zZXQoJ3R1cGxlSXRlbXMnLCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyk7XG4gICAgICAgICAgICBub2RlRGF0YU1hcC5zZXQoJ2xpc3RJdGVtcycsIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWpzZi5hcnJheU1hcC5oYXMoc2hvcnREYXRhUG9pbnRlcikpIHtcbiAgICAgICAgICAgIGpzZi5hcnJheU1hcC5zZXQoc2hvcnREYXRhUG9pbnRlciwgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNJbnB1dFJlcXVpcmVkKGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIpKSB7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICBqc2YuZmllbGRzUmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUT0RPOiBjcmVhdGUgaXRlbSBpbiBGb3JtR3JvdXAgbW9kZWwgZnJvbSBsYXlvdXQga2V5ICg/KVxuICAgICAgICB1cGRhdGVJbnB1dE9wdGlvbnMobmV3Tm9kZSwge30sIGpzZik7XG4gICAgICB9XG5cbiAgICAgIGlmICghbmV3Tm9kZS5vcHRpb25zLnRpdGxlICYmICEvXlxcZCskLy50ZXN0KG5ld05vZGUubmFtZSkpIHtcbiAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnRpdGxlID0gZml4VGl0bGUobmV3Tm9kZS5uYW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGhhc093bihuZXdOb2RlLm9wdGlvbnMsICdjb3B5VmFsdWVUbycpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmV3Tm9kZS5vcHRpb25zLmNvcHlWYWx1ZVRvID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5jb3B5VmFsdWVUbyA9IFtuZXdOb2RlLm9wdGlvbnMuY29weVZhbHVlVG9dO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0FycmF5KG5ld05vZGUub3B0aW9ucy5jb3B5VmFsdWVUbykpIHtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMuY29weVZhbHVlVG8gPSBuZXdOb2RlLm9wdGlvbnMuY29weVZhbHVlVG8ubWFwKGl0ZW0gPT5cbiAgICAgICAgICAgIEpzb25Qb2ludGVyLmNvbXBpbGUoSnNvblBvaW50ZXIucGFyc2VPYmplY3RQYXRoKGl0ZW0pLCAnLScpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXdOb2RlLndpZGdldCA9IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KG5ld05vZGUudHlwZSk7XG4gICAgICBub2RlRGF0YU1hcC5zZXQoJ2lucHV0VHlwZScsIG5ld05vZGUudHlwZSk7XG4gICAgICBub2RlRGF0YU1hcC5zZXQoJ3dpZGdldCcsIG5ld05vZGUud2lkZ2V0KTtcblxuICAgICAgaWYgKG5ld05vZGUuZGF0YVR5cGUgPT09ICdhcnJheScgJiZcbiAgICAgICAgKGhhc093bihuZXdOb2RlLCAnaXRlbXMnKSB8fCBoYXNPd24obmV3Tm9kZSwgJ2FkZGl0aW9uYWxJdGVtcycpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1SZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICBuZXdOb2RlLmRhdGFQb2ludGVyICsgJy8tJywganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgICApO1xuICAgICAgICBpZiAoIWpzZi5kYXRhTWFwLmhhcyhpdGVtUmVmUG9pbnRlcikpIHtcbiAgICAgICAgICBqc2YuZGF0YU1hcC5zZXQoaXRlbVJlZlBvaW50ZXIsIG5ldyBNYXAoKSk7XG4gICAgICAgIH1cbiAgICAgICAganNmLmRhdGFNYXAuZ2V0KGl0ZW1SZWZQb2ludGVyKS5zZXQoJ2lucHV0VHlwZScsICdzZWN0aW9uJyk7XG5cbiAgICAgICAgLy8gRml4IGluc3VmZmljaWVudGx5IG5lc3RlZCBhcnJheSBpdGVtIGdyb3Vwc1xuICAgICAgICBpZiAobmV3Tm9kZS5pdGVtcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc3QgYXJyYXlJdGVtR3JvdXAgPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gbmV3Tm9kZS5pdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3Qgc3ViSXRlbSA9IG5ld05vZGUuaXRlbXNbaV07XG4gICAgICAgICAgICBpZiAoaGFzT3duKHN1Ykl0ZW0sICdkYXRhUG9pbnRlcicpICYmXG4gICAgICAgICAgICAgIHN1Ykl0ZW0uZGF0YVBvaW50ZXIuc2xpY2UoMCwgaXRlbVJlZlBvaW50ZXIubGVuZ3RoKSA9PT0gaXRlbVJlZlBvaW50ZXJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBjb25zdCBhcnJheUl0ZW0gPSBuZXdOb2RlLml0ZW1zLnNwbGljZShpLCAxKVswXTtcbiAgICAgICAgICAgICAgYXJyYXlJdGVtLmRhdGFQb2ludGVyID0gbmV3Tm9kZS5kYXRhUG9pbnRlciArICcvLScgK1xuICAgICAgICAgICAgICAgIGFycmF5SXRlbS5kYXRhUG9pbnRlci5zbGljZShpdGVtUmVmUG9pbnRlci5sZW5ndGgpO1xuICAgICAgICAgICAgICBhcnJheUl0ZW1Hcm91cC51bnNoaWZ0KGFycmF5SXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdWJJdGVtLmFycmF5SXRlbSA9IHRydWU7XG4gICAgICAgICAgICAgIC8vIFRPRE86IENoZWNrIHNjaGVtYSB0byBnZXQgYXJyYXlJdGVtVHlwZSBhbmQgcmVtb3ZhYmxlXG4gICAgICAgICAgICAgIHN1Ykl0ZW0uYXJyYXlJdGVtVHlwZSA9ICdsaXN0JztcbiAgICAgICAgICAgICAgc3ViSXRlbS5yZW1vdmFibGUgPSBuZXdOb2RlLm9wdGlvbnMucmVtb3ZhYmxlICE9PSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFycmF5SXRlbUdyb3VwLmxlbmd0aCkge1xuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgX2lkOiB1bmlxdWVJZCgpLFxuICAgICAgICAgICAgICBhcnJheUl0ZW06IHRydWUsXG4gICAgICAgICAgICAgIGFycmF5SXRlbVR5cGU6IG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zID4gbmV3Tm9kZS5pdGVtcy5sZW5ndGggP1xuICAgICAgICAgICAgICAgICd0dXBsZScgOiAnbGlzdCcsXG4gICAgICAgICAgICAgIGl0ZW1zOiBhcnJheUl0ZW1Hcm91cCxcbiAgICAgICAgICAgICAgb3B0aW9uczogeyByZW1vdmFibGU6IG5ld05vZGUub3B0aW9ucy5yZW1vdmFibGUgIT09IGZhbHNlLCB9LFxuICAgICAgICAgICAgICBkYXRhUG9pbnRlcjogbmV3Tm9kZS5kYXRhUG9pbnRlciArICcvLScsXG4gICAgICAgICAgICAgIHR5cGU6ICdzZWN0aW9uJyxcbiAgICAgICAgICAgICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldCgnc2VjdGlvbicpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRPRE86IEZpeCB0byBobmRsZSBtdWx0aXBsZSBpdGVtc1xuICAgICAgICAgIG5ld05vZGUuaXRlbXNbMF0uYXJyYXlJdGVtID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoIW5ld05vZGUuaXRlbXNbMF0uZGF0YVBvaW50ZXIpIHtcbiAgICAgICAgICAgIG5ld05vZGUuaXRlbXNbMF0uZGF0YVBvaW50ZXIgPVxuICAgICAgICAgICAgICBKc29uUG9pbnRlci50b0dlbmVyaWNQb2ludGVyKGl0ZW1SZWZQb2ludGVyLCBqc2YuYXJyYXlNYXApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIUpzb25Qb2ludGVyLmhhcyhuZXdOb2RlLCAnL2l0ZW1zLzAvb3B0aW9ucy9yZW1vdmFibGUnKSkge1xuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtc1swXS5vcHRpb25zLnJlbW92YWJsZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuZXdOb2RlLm9wdGlvbnMub3JkZXJhYmxlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtc1swXS5vcHRpb25zLm9yZGVyYWJsZSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuZXdOb2RlLml0ZW1zWzBdLmFycmF5SXRlbVR5cGUgPVxuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgPyAndHVwbGUnIDogJ2xpc3QnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQXJyYXkobmV3Tm9kZS5pdGVtcykpIHtcbiAgICAgICAgICBjb25zdCBhcnJheUxpc3RJdGVtcyA9XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSAhPT0gJyRyZWYnKS5sZW5ndGggLVxuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXM7XG4gICAgICAgICAgaWYgKGFycmF5TGlzdEl0ZW1zID4gbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcykge1xuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9IGFycmF5TGlzdEl0ZW1zO1xuICAgICAgICAgICAgbm9kZURhdGFNYXAuc2V0KCdsaXN0SXRlbXMnLCBhcnJheUxpc3RJdGVtcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNPd24oanNmLmxheW91dFJlZkxpYnJhcnksIGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9XG4gICAgICAgICAgICBjbG9uZURlZXAobmV3Tm9kZS5pdGVtc1tuZXdOb2RlLml0ZW1zLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0ucmVjdXJzaXZlUmVmZXJlbmNlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yRWFjaChqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0sIChpdGVtLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChoYXNPd24oaXRlbSwgJ19pZCcpKSB7IGl0ZW0uX2lkID0gbnVsbDsgfVxuICAgICAgICAgICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICBpZiAoaGFzT3duKGl0ZW0sICdkYXRhUG9pbnRlcicpKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5kYXRhUG9pbnRlciA9IGl0ZW0uZGF0YVBvaW50ZXIuc2xpY2UoaXRlbVJlZlBvaW50ZXIubGVuZ3RoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sICd0b3AtZG93bicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGFueSBhZGRpdGlvbmFsIGRlZmF1bHQgaXRlbXNcbiAgICAgICAgaWYgKCFuZXdOb2RlLnJlY3Vyc2l2ZVJlZmVyZW5jZSB8fCBuZXdOb2RlLm9wdGlvbnMucmVxdWlyZWQpIHtcbiAgICAgICAgICBjb25zdCBhcnJheUxlbmd0aCA9IE1hdGgubWluKE1hdGgubWF4KFxuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgKyBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zLFxuICAgICAgICAgICAgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlLmxlbmd0aCA6IDBcbiAgICAgICAgICApLCBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSBuZXdOb2RlLml0ZW1zLmxlbmd0aDsgaSA8IGFycmF5TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5ld05vZGUuaXRlbXMucHVzaChnZXRMYXlvdXROb2RlKHtcbiAgICAgICAgICAgICAgJHJlZjogaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgICAgICAgIGRhdGFQb2ludGVyOiBuZXdOb2RlLmRhdGFQb2ludGVyLFxuICAgICAgICAgICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IG5ld05vZGUucmVjdXJzaXZlUmVmZXJlbmNlLFxuICAgICAgICAgICAgfSwganNmLCB3aWRnZXRMaWJyYXJ5KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgbmVlZGVkLCBhZGQgYnV0dG9uIHRvIGFkZCBpdGVtcyB0byBhcnJheVxuICAgICAgICBpZiAobmV3Tm9kZS5vcHRpb25zLmFkZGFibGUgIT09IGZhbHNlICYmXG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zIDwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zICYmXG4gICAgICAgICAgKG5ld05vZGUuaXRlbXNbbmV3Tm9kZS5pdGVtcy5sZW5ndGggLSAxXSB8fCB7fSkudHlwZSAhPT0gJyRyZWYnXG4gICAgICAgICkge1xuICAgICAgICAgIGxldCBidXR0b25UZXh0ID0gJ0FkZCc7XG4gICAgICAgICAgaWYgKG5ld05vZGUub3B0aW9ucy50aXRsZSkge1xuICAgICAgICAgICAgaWYgKC9eYWRkXFxiL2kudGVzdChuZXdOb2RlLm9wdGlvbnMudGl0bGUpKSB7XG4gICAgICAgICAgICAgIGJ1dHRvblRleHQgPSBuZXdOb2RlLm9wdGlvbnMudGl0bGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBidXR0b25UZXh0ICs9ICcgJyArIG5ld05vZGUub3B0aW9ucy50aXRsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG5ld05vZGUubmFtZSAmJiAhL15cXGQrJC8udGVzdChuZXdOb2RlLm5hbWUpKSB7XG4gICAgICAgICAgICBpZiAoL15hZGRcXGIvaS50ZXN0KG5ld05vZGUubmFtZSkpIHtcbiAgICAgICAgICAgICAgYnV0dG9uVGV4dCArPSAnICcgKyBmaXhUaXRsZShuZXdOb2RlLm5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYnV0dG9uVGV4dCA9IGZpeFRpdGxlKG5ld05vZGUubmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIG5ld05vZGUgZG9lc24ndCBoYXZlIGEgdGl0bGUsIGxvb2sgZm9yIHRpdGxlIG9mIHBhcmVudCBhcnJheSBpdGVtXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudFNjaGVtYSA9XG4gICAgICAgICAgICAgIGdldEZyb21TY2hlbWEoanNmLnNjaGVtYSwgbmV3Tm9kZS5kYXRhUG9pbnRlciwgJ3BhcmVudFNjaGVtYScpO1xuICAgICAgICAgICAgaWYgKGhhc093bihwYXJlbnRTY2hlbWEsICd0aXRsZScpKSB7XG4gICAgICAgICAgICAgIGJ1dHRvblRleHQgKz0gJyB0byAnICsgcGFyZW50U2NoZW1hLnRpdGxlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgcG9pbnRlckFycmF5ID0gSnNvblBvaW50ZXIucGFyc2UobmV3Tm9kZS5kYXRhUG9pbnRlcik7XG4gICAgICAgICAgICAgIGJ1dHRvblRleHQgKz0gJyB0byAnICsgZml4VGl0bGUocG9pbnRlckFycmF5W3BvaW50ZXJBcnJheS5sZW5ndGggLSAyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld05vZGUuaXRlbXMucHVzaCh7XG4gICAgICAgICAgICBfaWQ6IHVuaXF1ZUlkKCksXG4gICAgICAgICAgICBhcnJheUl0ZW06IHRydWUsXG4gICAgICAgICAgICBhcnJheUl0ZW1UeXBlOiAnbGlzdCcsXG4gICAgICAgICAgICBkYXRhUG9pbnRlcjogbmV3Tm9kZS5kYXRhUG9pbnRlciArICcvLScsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGxpc3RJdGVtczogbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyxcbiAgICAgICAgICAgICAgbWF4SXRlbXM6IG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyxcbiAgICAgICAgICAgICAgbWluSXRlbXM6IG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyxcbiAgICAgICAgICAgICAgcmVtb3ZhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgdGl0bGU6IGJ1dHRvblRleHQsXG4gICAgICAgICAgICAgIHR1cGxlSXRlbXM6IG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlY3Vyc2l2ZVJlZmVyZW5jZTogcmVjdXJzaXZlLFxuICAgICAgICAgICAgdHlwZTogJyRyZWYnLFxuICAgICAgICAgICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldCgnJHJlZicpLFxuICAgICAgICAgICAgJHJlZjogaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGlzU3RyaW5nKEpzb25Qb2ludGVyLmdldChuZXdOb2RlLCAnL3N0eWxlL2FkZCcpKSkge1xuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtc1tuZXdOb2RlLml0ZW1zLmxlbmd0aCAtIDFdLm9wdGlvbnMuZmllbGRTdHlsZSA9XG4gICAgICAgICAgICAgIG5ld05vZGUuc3R5bGUuYWRkO1xuICAgICAgICAgICAgZGVsZXRlIG5ld05vZGUuc3R5bGUuYWRkO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHkobmV3Tm9kZS5zdHlsZSkpIHsgZGVsZXRlIG5ld05vZGUuc3R5bGU7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld05vZGUuYXJyYXlJdGVtID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChoYXNPd24obmV3Tm9kZSwgJ3R5cGUnKSB8fCBoYXNPd24obmV3Tm9kZSwgJ2l0ZW1zJykpIHtcbiAgICAgIGNvbnN0IHBhcmVudFR5cGU6IHN0cmluZyA9XG4gICAgICAgIEpzb25Qb2ludGVyLmdldChqc2YubGF5b3V0LCBsYXlvdXRQb2ludGVyLCAwLCAtMikudHlwZTtcbiAgICAgIGlmICghaGFzT3duKG5ld05vZGUsICd0eXBlJykpIHtcbiAgICAgICAgbmV3Tm9kZS50eXBlID1cbiAgICAgICAgICBpbkFycmF5KHBhcmVudFR5cGUsIFsndGFicycsICd0YWJhcnJheSddKSA/ICd0YWInIDogJ2FycmF5JztcbiAgICAgIH1cbiAgICAgIG5ld05vZGUuYXJyYXlJdGVtID0gcGFyZW50VHlwZSA9PT0gJ2FycmF5JztcbiAgICAgIG5ld05vZGUud2lkZ2V0ID0gd2lkZ2V0TGlicmFyeS5nZXRXaWRnZXQobmV3Tm9kZS50eXBlKTtcbiAgICAgIHVwZGF0ZUlucHV0T3B0aW9ucyhuZXdOb2RlLCB7fSwganNmKTtcbiAgICB9XG4gICAgaWYgKG5ld05vZGUudHlwZSA9PT0gJ3N1Ym1pdCcpIHsgaGFzU3VibWl0QnV0dG9uID0gdHJ1ZTsgfVxuICAgIHJldHVybiBuZXdOb2RlO1xuICB9KTtcbiAgaWYgKGpzZi5oYXNSb290UmVmZXJlbmNlKSB7XG4gICAgY29uc3QgZnVsbExheW91dCA9IGNsb25lRGVlcChmb3JtTGF5b3V0KTtcbiAgICBpZiAoZnVsbExheW91dFtmdWxsTGF5b3V0Lmxlbmd0aCAtIDFdLnR5cGUgPT09ICdzdWJtaXQnKSB7IGZ1bGxMYXlvdXQucG9wKCk7IH1cbiAgICBqc2YubGF5b3V0UmVmTGlicmFyeVsnJ10gPSB7XG4gICAgICBfaWQ6IG51bGwsXG4gICAgICBkYXRhUG9pbnRlcjogJycsXG4gICAgICBkYXRhVHlwZTogJ29iamVjdCcsXG4gICAgICBpdGVtczogZnVsbExheW91dCxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgb3B0aW9uczogY2xvbmVEZWVwKGpzZi5mb3JtT3B0aW9ucy5kZWZhdWx0V2lkZ2V0T3B0aW9ucyksXG4gICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IHRydWUsXG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICB0eXBlOiAnc2VjdGlvbicsXG4gICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCdzZWN0aW9uJyksXG4gICAgfTtcbiAgfVxuICBpZiAoIWhhc1N1Ym1pdEJ1dHRvbikge1xuICAgIGZvcm1MYXlvdXQucHVzaCh7XG4gICAgICBfaWQ6IHVuaXF1ZUlkKCksXG4gICAgICBvcHRpb25zOiB7IHRpdGxlOiAnU3VibWl0JyB9LFxuICAgICAgdHlwZTogJ3N1Ym1pdCcsXG4gICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCdzdWJtaXQnKSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZm9ybUxheW91dDtcbn1cblxuLy9UT0RPLXJldmlldzp0aGlzIGltcGxlbWVudHMgYSBxdWljayAncG9zdCcgZml4IHJhdGhlciB0aGFuIGFuXG4vL2ludGVncmFyZWQgaWRlYWwgZml4XG5leHBvcnQgZnVuY3Rpb24gYnVpbGRMYXlvdXQoanNmLCB3aWRnZXRMaWJyYXJ5KSB7XG4gIGxldCBsYXlvdXQ9YnVpbGRMYXlvdXRfb3JpZ2luYWwoanNmLCB3aWRnZXRMaWJyYXJ5KTtcbiAgaWYgKGpzZi5mb3JtVmFsdWVzKSB7XG4gICAgbGV0IGZpeGVkTGF5b3V0ID0gZml4TmVzdGVkQXJyYXlMYXlvdXQoe1xuICAgICAgYnVpbHRMYXlvdXQ6IGxheW91dCxcbiAgICAgIGZvcm1EYXRhOiBqc2YuZm9ybVZhbHVlc1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBsYXlvdXQ7XG59XG5cblxuXG5mdW5jdGlvbiBmaXhOZXN0ZWRBcnJheUxheW91dChvcHRpb25zOiBhbnkpIHtcbiAgbGV0IHsgYnVpbHRMYXlvdXQsIGZvcm1EYXRhIH0gPSBvcHRpb25zO1xuICBsZXQgYXJyTGVuZ3RocyA9IHt9O1xuICBsZXQgdHJhdmVyc2VPYmogPSBmdW5jdGlvbiAob2JqLCBwYXRoLCBvblZhbHVlPykge1xuICAgIGlmIChfaXNBcnJheShvYmopKSB7XG4gICAgICBvblZhbHVlICYmIG9uVmFsdWUob2JqLCBwYXRoKTtcbiAgICAgIG9iai5mb3JFYWNoKChpdGVtLCBpbmQpID0+IHtcbiAgICAgICAgb25WYWx1ZSAmJiBvblZhbHVlKGl0ZW0sIHBhdGggKyBcIi9cIiArIGluZCk7XG4gICAgICAgIHRyYXZlcnNlT2JqKGl0ZW0sIHBhdGggKyBcIi9cIiArIGluZCwgb25WYWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKF9pc1BsYWluT2JqZWN0KG9iaikpIHtcbiAgICAgIG9uVmFsdWUgJiYgb25WYWx1ZShvYmosIHBhdGgpO1xuICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIG9uVmFsdWUgJiYgb25WYWx1ZShvYmpba2V5XSwgcGF0aCArIFwiL1wiICsga2V5KTtcbiAgICAgICAgdHJhdmVyc2VPYmoob2JqW2tleV0sIHBhdGggKyBcIi9cIiArIGtleSwgb25WYWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuICB0cmF2ZXJzZU9iaihmb3JtRGF0YSwgXCJcIiwgKHZhbHVlLCBwYXRoKSA9PiB7XG4gICAgaWYgKF9pc0FycmF5KHZhbHVlKSkge1xuICAgICAgYXJyTGVuZ3Roc1twYXRoXSA9IGFyckxlbmd0aHNbcGF0aF0gfHwgdmFsdWUubGVuZ3RoO1xuICAgIH1cbiAgfSk7XG5cbiAgbGV0IGdldERhdGFTaXplID0gKG9wdGlvbnM6IGFueSkgPT4ge1xuICAgIGxldCB7IGRhdGEsIGRhdGFQb2ludGVyLCBpbmRleEFycmF5IH0gPSBvcHRpb25zO1xuICAgIGxldCBkYXNoQ291bnQgPSAwO1xuICAgIGxldCBkcEluc3RhbmNlID0gZGF0YVBvaW50ZXIuc3Vic3RyaW5nKDEpLnNwbGl0KFwiL1wiKS5tYXAoKHBhcnQsIHBpbmQpID0+IHtcbiAgICAgIGlmIChwYXJ0ID09IFwiLVwiICYmIGluZGV4QXJyYXlbZGFzaENvdW50XSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGluZGV4QXJyYXlbZGFzaENvdW50KytdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnQ7XG4gICAgfSlcbiAgICAgIC5qb2luKFwiL1wiKTtcbiAgICBkcEluc3RhbmNlID0gXCIvXCIgKyBkcEluc3RhbmNlO1xuICAgIGxldCBhcnJTaXplID0gYXJyTGVuZ3Roc1tkcEluc3RhbmNlXTtcbiAgICByZXR1cm4gYXJyU2l6ZTtcbiAgfVxuICAvL3N0aWxsIHRvbyBidWdneVxuICBsZXQgY3JlYXRlTm9uUmVmSXRlbSA9IChub2RlV2l0aFJlZjogYW55KSA9PiB7XG4gICAgbGV0IHRlbXBsYXRlTm9kZSA9IHtcbiAgICAgIFwidHlwZVwiOiBcInNlY3Rpb25cIiwgLy9jaGVjayB0aGlzIGNvdWxkIGFsc28gYmUgYXJyYXk/XG4gICAgICBcInJlY3Vyc2l2ZVJlZmVyZW5jZVwiOiBmYWxzZSwvL2NoZWNrIHRoaXMgXG4gICAgICBcIml0ZW1zXCI6IFtdXG4gICAgfVxuICAgIGxldCBjbG9uZSA9IGNsb25lRGVlcChub2RlV2l0aFJlZik7XG4gICAgLy9jb21tZW50ZWQgb3V0IGZvciBub3cgc28gdGhhdCBpdCBiZWhhdmVzIGFzIHVzdXNhbFxuICAgIC8vXy5tZXJnZShjbG9uZSx0ZW1wbGF0ZU5vZGUpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIGxldCByZWJ1aWxkTGF5b3V0ID0gKG9wdGlvbnM6IGFueSkgPT4ge1xuICAgIGxldCB7IGJ1aWx0TGF5b3V0LCBpbmRpY2VzLCBwYXJlbnREYXRhUG9pbnRlciwgaW5kZXhQb3MgfSA9IG9wdGlvbnM7XG4gICAgaW5kaWNlcyA9IGluZGljZXMgfHwgW107XG4gICAgaW5kZXhQb3MgPSBpbmRleFBvcyA9PSB1bmRlZmluZWQgPyBpbmRleFBvcyA9IC0xIDogaW5kZXhQb3M7XG4gICAgaWYgKF9pc0FycmF5KGJ1aWx0TGF5b3V0KSkge1xuICAgICAgYnVpbHRMYXlvdXQuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgcmVidWlsZExheW91dCh7XG4gICAgICAgICAgYnVpbHRMYXlvdXQ6IGl0ZW0sXG4gICAgICAgICAgaW5kaWNlczogaW5kaWNlcyxcbiAgICAgICAgICBpbmRleFBvczogaW5kZXhQb3MsXG4gICAgICAgICAgcGFyZW50RGF0YVBvaW50ZXI6IGJ1aWx0TGF5b3V0LmRhdGFQb2ludGVyIHx8IHBhcmVudERhdGFQb2ludGVyXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgXG4gICAgbGV0IGRhdGFUeXBlcz1bXCJhcnJheVwiXTsvL2NoZWNrIG9ubHkgYXJyYXkgZm9yIG5vd1xuICAgICAvL2ZvciBub3cgYWRkZWQgY29uZGl0aW9uIHRvIGlnbm9yZSByZWN1cnNpdmUgcmVmZXJlbmNlc1xuICAgIGlmIChidWlsdExheW91dC5pdGVtcyAmJiBkYXRhVHlwZXMuaW5kZXhPZihidWlsdExheW91dC5kYXRhVHlwZSk+PTBcbiAgICAgICYmIGJ1aWx0TGF5b3V0LmRhdGFQb2ludGVyXG4gICAgICAmJiAhYnVpbHRMYXlvdXQucmVjdXJzaXZlUmVmZXJlbmNlXG4gICAgKSB7XG4gICAgICBsZXQgbnVtRGF0YUl0ZW1zOiBhbnkgPSBnZXREYXRhU2l6ZSh7XG4gICAgICAgIGRhdGE6IGZvcm1EYXRhLFxuICAgICAgICBkYXRhUG9pbnRlcjogYnVpbHRMYXlvdXQuZGF0YVBvaW50ZXIsXG4gICAgICAgIGluZGV4QXJyYXk6IGluZGljZXNcbiAgICAgIH0pO1xuICAgICAgbGV0IG51bUFjdHVhbEl0ZW1zID0gYnVpbHRMYXlvdXQuaXRlbXMubGVuZ3RoO1xuICAgICAgLy9jaGVjayBpZiB0aGVyZSdzIHJlZiBpdGVtcywgaWYgc28gaWdub3JlIGl0IGFuZCB0aGVyZWZvcmVcbiAgICAgIC8vZGVjcmVtZW50IHRoZSBpdGVtIGNvdW50XG4gICAgICBidWlsdExheW91dC5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoaXRlbS50eXBlICYmIGl0ZW0udHlwZSA9PSBcIiRyZWZcIikge1xuICAgICAgICAgIG51bUFjdHVhbEl0ZW1zLS07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbnVtQWN0dWFsSXRlbXMgPSBNYXRoLm1heChudW1BY3R1YWxJdGVtcywgMCk7Ly9hdm9pZCBkZWFsaW5nIHdpdGggbmVnYXRpdmVzXG4gICAgICBpZiAobnVtQWN0dWFsSXRlbXMgPCBudW1EYXRhSXRlbXMpIHtcblxuICAgICAgICBsZXQgbnVtSXRlbXNOZWVkZWQgPSBudW1EYXRhSXRlbXMgLSBudW1BY3R1YWxJdGVtcztcbiAgICAgICAgLy9hZGRlZCB0byBpZ25vcmUgcmVjdXJzaXZlIHJlZmVyZW5jZXNcbiAgICAgICAgaWYgKG51bUFjdHVhbEl0ZW1zID09IDAgJiYgYnVpbHRMYXlvdXQuaXRlbXNbMF0ucmVjdXJzaXZlUmVmZXJlbmNlKSB7XG4gICAgICAgICAgbnVtSXRlbXNOZWVkZWQgPSAwXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1JdGVtc05lZWRlZDsgaSsrKSB7XG4gICAgICAgICAgLy9ub2RlIG11c3Qgbm90IGJlIG9mIHR5cGUgXCJ0eXBlXCI6IFwiJHJlZlwiXG4gICAgICAgICAgLy9pZiBpdCBpcyB0aGVuIG1hbnVmYWN0dXJlIG91ciBvd25cbiAgICAgICAgICBsZXQgaXNSZWZOb2RlID0gYnVpbHRMYXlvdXQuaXRlbXNbMF0udHlwZSAmJiBidWlsdExheW91dC5pdGVtc1swXS50eXBlID09IFwiJHJlZlwiO1xuICAgICAgICAgIGxldCBuZXdJdGVtID0gaXNSZWZOb2RlXG4gICAgICAgICAgICA/IGNyZWF0ZU5vblJlZkl0ZW0oYnVpbHRMYXlvdXQuaXRlbXNbMF0pXG4gICAgICAgICAgICA6IGNsb25lRGVlcChidWlsdExheW91dC5pdGVtc1swXSk7Ly9jb3B5IGZpcnN0XG4gICAgICAgICAgbmV3SXRlbS5faWQgPSB1bmlxdWVJZChcIm5ld19cIik7XG4gICAgICAgICAgYnVpbHRMYXlvdXQuaXRlbXMudW5zaGlmdChuZXdJdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYnVpbHRMYXlvdXQub3B0aW9ucy5saXN0SXRlbXMpIHtcbiAgICAgICAgICBidWlsdExheW91dC5vcHRpb25zLmxpc3RJdGVtcyA9IG51bURhdGFJdGVtcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaW5kaWNlc1tidWlsdExheW91dC5kYXRhUG9pbnRlcl0gPSBpbmRpY2VzW2J1aWx0TGF5b3V0LmRhdGFQb2ludGVyXSB8fCAtMTtcbiAgICAgIGluZGV4UG9zKys7XG4gICAgICBidWlsdExheW91dC5pdGVtcy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBpbmRpY2VzW2luZGV4UG9zXSA9IGluZGV4XG4gICAgICAgIHJlYnVpbGRMYXlvdXQoe1xuICAgICAgICAgIGJ1aWx0TGF5b3V0OiBpdGVtLFxuICAgICAgICAgIGluZGljZXM6IGluZGljZXMsXG4gICAgICAgICAgcGFyZW50RGF0YVBvaW50ZXI6IGJ1aWx0TGF5b3V0LmRhdGFQb2ludGVyLFxuICAgICAgICAgIGluZGV4UG9zOiBpbmRleFBvc1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIGluZGV4UG9zLS07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChidWlsdExheW91dC5pdGVtcykge1xuICAgICAgICBidWlsdExheW91dC5pdGVtcy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgIHJlYnVpbGRMYXlvdXQoe1xuICAgICAgICAgICAgYnVpbHRMYXlvdXQ6IGl0ZW0sXG4gICAgICAgICAgICBpbmRpY2VzOiBpbmRpY2VzLFxuICAgICAgICAgICAgcGFyZW50RGF0YVBvaW50ZXI6IHBhcmVudERhdGFQb2ludGVyLFxuICAgICAgICAgICAgaW5kZXhQb3M6IGluZGV4UG9zXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgfVxuICAgIH1cblxuXG4gIH1cbiAgcmVidWlsZExheW91dCh7XG4gICAgYnVpbHRMYXlvdXQ6IGJ1aWx0TGF5b3V0XG4gIH0pO1xuICAvL05CIG9yaWdpbmFsIGlzIG11dGF0ZWRcbiAgbGV0IGZpeGVkTGF5b3V0ID0gYnVpbHRMYXlvdXQ7XG4gIHJldHVybiBmaXhlZExheW91dDtcbn1cblxuLyoqXG4gKiAnYnVpbGRMYXlvdXRGcm9tU2NoZW1hJyBmdW5jdGlvblxuICpcbiAqIC8vICAganNmIC1cbiAqIC8vICAgd2lkZ2V0TGlicmFyeSAtXG4gKiAvLyAgIG5vZGVWYWx1ZSAtXG4gKiAvLyAgeyBzdHJpbmcgPSAnJyB9IHNjaGVtYVBvaW50ZXIgLVxuICogLy8gIHsgc3RyaW5nID0gJycgfSBkYXRhUG9pbnRlciAtXG4gKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBhcnJheUl0ZW0gLVxuICogLy8gIHsgc3RyaW5nID0gbnVsbCB9IGFycmF5SXRlbVR5cGUgLVxuICogLy8gIHsgYm9vbGVhbiA9IG51bGwgfSByZW1vdmFibGUgLVxuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZm9yUmVmTGlicmFyeSAtXG4gKiAvLyAgeyBzdHJpbmcgPSAnJyB9IGRhdGFQb2ludGVyUHJlZml4IC1cbiAqIC8vXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZExheW91dEZyb21TY2hlbWEoXG4gIGpzZiwgd2lkZ2V0TGlicmFyeSwgbm9kZVZhbHVlID0gbnVsbCwgc2NoZW1hUG9pbnRlciA9ICcnLFxuICBkYXRhUG9pbnRlciA9ICcnLCBhcnJheUl0ZW0gPSBmYWxzZSwgYXJyYXlJdGVtVHlwZTogc3RyaW5nID0gbnVsbCxcbiAgcmVtb3ZhYmxlOiBib29sZWFuID0gbnVsbCwgZm9yUmVmTGlicmFyeSA9IGZhbHNlLCBkYXRhUG9pbnRlclByZWZpeCA9ICcnXG4pIHtcbiAgY29uc3Qgc2NoZW1hID0gSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIpO1xuICBpZiAoIWhhc093bihzY2hlbWEsICd0eXBlJykgJiYgIWhhc093bihzY2hlbWEsICckcmVmJykgJiZcbiAgICAhaGFzT3duKHNjaGVtYSwgJ3gtc2NoZW1hLWZvcm0nKVxuICApIHsgcmV0dXJuIG51bGw7IH1cbiAgY29uc3QgbmV3Tm9kZVR5cGU6IHN0cmluZyA9IGdldElucHV0VHlwZShzY2hlbWEpO1xuICBpZiAoIWlzRGVmaW5lZChub2RlVmFsdWUpICYmIChcbiAgICBqc2YuZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgPT09IHRydWUgfHxcbiAgICAoanNmLmZvcm1PcHRpb25zLnNldFNjaGVtYURlZmF1bHRzID09PSAnYXV0bycgJiYgaXNFbXB0eShqc2YuZm9ybVZhbHVlcykpXG4gICkpIHtcbiAgICBub2RlVmFsdWUgPSBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciArICcvZGVmYXVsdCcpO1xuICB9XG4gIGxldCBuZXdOb2RlOiBhbnkgPSB7XG4gICAgX2lkOiBmb3JSZWZMaWJyYXJ5ID8gbnVsbCA6IHVuaXF1ZUlkKCksXG4gICAgYXJyYXlJdGVtOiBhcnJheUl0ZW0sXG4gICAgZGF0YVBvaW50ZXI6IEpzb25Qb2ludGVyLnRvR2VuZXJpY1BvaW50ZXIoZGF0YVBvaW50ZXIsIGpzZi5hcnJheU1hcCksXG4gICAgZGF0YVR5cGU6IHNjaGVtYS50eXBlIHx8IChoYXNPd24oc2NoZW1hLCAnJHJlZicpID8gJyRyZWYnIDogbnVsbCksXG4gICAgb3B0aW9uczoge30sXG4gICAgcmVxdWlyZWQ6IGlzSW5wdXRSZXF1aXJlZChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyKSxcbiAgICB0eXBlOiBuZXdOb2RlVHlwZSxcbiAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KG5ld05vZGVUeXBlKSxcbiAgfTtcbiAgY29uc3QgbGFzdERhdGFLZXkgPSBKc29uUG9pbnRlci50b0tleShuZXdOb2RlLmRhdGFQb2ludGVyKTtcbiAgaWYgKGxhc3REYXRhS2V5ICE9PSAnLScpIHsgbmV3Tm9kZS5uYW1lID0gbGFzdERhdGFLZXk7IH1cbiAgaWYgKG5ld05vZGUuYXJyYXlJdGVtKSB7XG4gICAgbmV3Tm9kZS5hcnJheUl0ZW1UeXBlID0gYXJyYXlJdGVtVHlwZTtcbiAgICBuZXdOb2RlLm9wdGlvbnMucmVtb3ZhYmxlID0gcmVtb3ZhYmxlICE9PSBmYWxzZTtcbiAgfVxuICBjb25zdCBzaG9ydERhdGFQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICBkYXRhUG9pbnRlclByZWZpeCArIGRhdGFQb2ludGVyLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICk7XG4gIGNvbnN0IHJlY3Vyc2l2ZSA9ICFzaG9ydERhdGFQb2ludGVyLmxlbmd0aCB8fFxuICAgIHNob3J0RGF0YVBvaW50ZXIgIT09IGRhdGFQb2ludGVyUHJlZml4ICsgZGF0YVBvaW50ZXI7XG4gIGlmICghanNmLmRhdGFNYXAuaGFzKHNob3J0RGF0YVBvaW50ZXIpKSB7XG4gICAganNmLmRhdGFNYXAuc2V0KHNob3J0RGF0YVBvaW50ZXIsIG5ldyBNYXAoKSk7XG4gIH1cbiAgY29uc3Qgbm9kZURhdGFNYXAgPSBqc2YuZGF0YU1hcC5nZXQoc2hvcnREYXRhUG9pbnRlcik7XG4gIGlmICghbm9kZURhdGFNYXAuaGFzKCdpbnB1dFR5cGUnKSkge1xuICAgIG5vZGVEYXRhTWFwLnNldCgnc2NoZW1hUG9pbnRlcicsIHNjaGVtYVBvaW50ZXIpO1xuICAgIG5vZGVEYXRhTWFwLnNldCgnaW5wdXRUeXBlJywgbmV3Tm9kZS50eXBlKTtcbiAgICBub2RlRGF0YU1hcC5zZXQoJ3dpZGdldCcsIG5ld05vZGUud2lkZ2V0KTtcbiAgICBub2RlRGF0YU1hcC5zZXQoJ2Rpc2FibGVkJywgISFuZXdOb2RlLm9wdGlvbnMuZGlzYWJsZWQpO1xuICB9XG4gIHVwZGF0ZUlucHV0T3B0aW9ucyhuZXdOb2RlLCBzY2hlbWEsIGpzZik7XG4gIGlmICghbmV3Tm9kZS5vcHRpb25zLnRpdGxlICYmIG5ld05vZGUubmFtZSAmJiAhL15cXGQrJC8udGVzdChuZXdOb2RlLm5hbWUpKSB7XG4gICAgbmV3Tm9kZS5vcHRpb25zLnRpdGxlID0gZml4VGl0bGUobmV3Tm9kZS5uYW1lKTtcbiAgfVxuXG4gIGlmIChuZXdOb2RlLmRhdGFUeXBlID09PSAnb2JqZWN0Jykge1xuICAgIGlmIChpc0FycmF5KHNjaGVtYS5yZXF1aXJlZCkgJiYgIW5vZGVEYXRhTWFwLmhhcygncmVxdWlyZWQnKSkge1xuICAgICAgbm9kZURhdGFNYXAuc2V0KCdyZXF1aXJlZCcsIHNjaGVtYS5yZXF1aXJlZCk7XG4gICAgfVxuICAgIGlmIChpc09iamVjdChzY2hlbWEucHJvcGVydGllcykpIHtcbiAgICAgIGNvbnN0IG5ld1NlY3Rpb246IGFueVtdID0gW107XG4gICAgICBjb25zdCBwcm9wZXJ0eUtleXMgPSBzY2hlbWFbJ3VpOm9yZGVyJ10gfHwgT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpO1xuICAgICAgaWYgKHByb3BlcnR5S2V5cy5pbmNsdWRlcygnKicpICYmICFoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsICcqJykpIHtcbiAgICAgICAgY29uc3QgdW5uYW1lZEtleXMgPSBPYmplY3Qua2V5cyhzY2hlbWEucHJvcGVydGllcylcbiAgICAgICAgICAuZmlsdGVyKGtleSA9PiAhcHJvcGVydHlLZXlzLmluY2x1ZGVzKGtleSkpO1xuICAgICAgICBmb3IgKGxldCBpID0gcHJvcGVydHlLZXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKHByb3BlcnR5S2V5c1tpXSA9PT0gJyonKSB7XG4gICAgICAgICAgICBwcm9wZXJ0eUtleXMuc3BsaWNlKGksIDEsIC4uLnVubmFtZWRLZXlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByb3BlcnR5S2V5c1xuICAgICAgICAuZmlsdGVyKGtleSA9PiBoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsIGtleSkgfHxcbiAgICAgICAgICBoYXNPd24oc2NoZW1hLCAnYWRkaXRpb25hbFByb3BlcnRpZXMnKVxuICAgICAgICApXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgY29uc3Qga2V5U2NoZW1hUG9pbnRlciA9IGhhc093bihzY2hlbWEucHJvcGVydGllcywga2V5KSA/XG4gICAgICAgICAgICAnL3Byb3BlcnRpZXMvJyArIGtleSA6ICcvYWRkaXRpb25hbFByb3BlcnRpZXMnO1xuICAgICAgICAgIGNvbnN0IGlubmVySXRlbSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICAgIGpzZiwgd2lkZ2V0TGlicmFyeSwgaXNPYmplY3Qobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtrZXldIDogbnVsbCxcbiAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyBrZXlTY2hlbWFQb2ludGVyLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBrZXksXG4gICAgICAgICAgICBmYWxzZSwgbnVsbCwgbnVsbCwgZm9yUmVmTGlicmFyeSwgZGF0YVBvaW50ZXJQcmVmaXhcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChpbm5lckl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChpc0lucHV0UmVxdWlyZWQoc2NoZW1hLCAnLycgKyBrZXkpKSB7XG4gICAgICAgICAgICAgIGlubmVySXRlbS5vcHRpb25zLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAganNmLmZpZWxkc1JlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1NlY3Rpb24ucHVzaChpbm5lckl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICBpZiAoZGF0YVBvaW50ZXIgPT09ICcnICYmICFmb3JSZWZMaWJyYXJ5KSB7XG4gICAgICAgIG5ld05vZGUgPSBuZXdTZWN0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Tm9kZS5pdGVtcyA9IG5ld1NlY3Rpb247XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFRPRE86IEFkZCBwYXR0ZXJuUHJvcGVydGllcyBhbmQgYWRkaXRpb25hbFByb3BlcnRpZXMgaW5wdXRzP1xuICAgIC8vIC4uLiBwb3NzaWJseSBwcm92aWRlIGEgd2F5IHRvIGVudGVyIGJvdGgga2V5IG5hbWVzIGFuZCB2YWx1ZXM/XG4gICAgLy8gaWYgKGlzT2JqZWN0KHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcykpIHsgfVxuICAgIC8vIGlmIChpc09iamVjdChzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpKSB7IH1cblxuICB9IGVsc2UgaWYgKG5ld05vZGUuZGF0YVR5cGUgPT09ICdhcnJheScpIHtcbiAgICBuZXdOb2RlLml0ZW1zID0gW107XG4gICAgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zID0gTWF0aC5taW4oXG4gICAgICBzY2hlbWEubWF4SXRlbXMgfHwgMTAwMCwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIHx8IDEwMDBcbiAgICApO1xuICAgIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA9IE1hdGgubWF4KFxuICAgICAgc2NoZW1hLm1pbkl0ZW1zIHx8IDAsIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyB8fCAwXG4gICAgKTtcbiAgICBpZiAoIW5ld05vZGUub3B0aW9ucy5taW5JdGVtcyAmJiBpc0lucHV0UmVxdWlyZWQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlcikpIHtcbiAgICAgIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA9IDE7XG4gICAgfVxuICAgIGlmICghaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ2xpc3RJdGVtcycpKSB7IG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSAxOyB9XG4gICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgPSBpc0FycmF5KHNjaGVtYS5pdGVtcykgPyBzY2hlbWEuaXRlbXMubGVuZ3RoIDogMDtcbiAgICBpZiAobmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIDw9IG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zKSB7XG4gICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyA9IG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcztcbiAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSAwO1xuICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIDxcbiAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zICsgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtc1xuICAgICkge1xuICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9IG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyAtIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zO1xuICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zID5cbiAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zICsgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtc1xuICAgICkge1xuICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9IG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyAtIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zO1xuICAgIH1cbiAgICBpZiAoIW5vZGVEYXRhTWFwLmhhcygnbWF4SXRlbXMnKSkge1xuICAgICAgbm9kZURhdGFNYXAuc2V0KCdtYXhJdGVtcycsIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyk7XG4gICAgICBub2RlRGF0YU1hcC5zZXQoJ21pbkl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zKTtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgndHVwbGVJdGVtcycsIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zKTtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgnbGlzdEl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyk7XG4gICAgfVxuICAgIGlmICghanNmLmFycmF5TWFwLmhhcyhzaG9ydERhdGFQb2ludGVyKSkge1xuICAgICAganNmLmFycmF5TWFwLnNldChzaG9ydERhdGFQb2ludGVyLCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyk7XG4gICAgfVxuICAgIHJlbW92YWJsZSA9IG5ld05vZGUub3B0aW9ucy5yZW1vdmFibGUgIT09IGZhbHNlO1xuICAgIGxldCBhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLy8gSWYgJ2l0ZW1zJyBpcyBhbiBhcnJheSA9IHR1cGxlIGl0ZW1zXG4gICAgaWYgKGlzQXJyYXkoc2NoZW1hLml0ZW1zKSkge1xuICAgICAgbmV3Tm9kZS5pdGVtcyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtczsgaSsrKSB7XG4gICAgICAgIGxldCBuZXdJdGVtOiBhbnk7XG4gICAgICAgIGNvbnN0IGl0ZW1SZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICBzaG9ydERhdGFQb2ludGVyICsgJy8nICsgaSwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpdGVtUmVjdXJzaXZlID0gIWl0ZW1SZWZQb2ludGVyLmxlbmd0aCB8fFxuICAgICAgICAgIGl0ZW1SZWZQb2ludGVyICE9PSBzaG9ydERhdGFQb2ludGVyICsgJy8nICsgaTtcblxuICAgICAgICAvLyBJZiByZW1vdmFibGUsIGFkZCB0dXBsZSBpdGVtIGxheW91dCB0byBsYXlvdXRSZWZMaWJyYXJ5XG4gICAgICAgIGlmIChyZW1vdmFibGUgJiYgaSA+PSBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMpIHtcbiAgICAgICAgICBpZiAoIWhhc093bihqc2YubGF5b3V0UmVmTGlicmFyeSwgaXRlbVJlZlBvaW50ZXIpKSB7XG4gICAgICAgICAgICAvLyBTZXQgdG8gbnVsbCBmaXJzdCB0byBwcmV2ZW50IHJlY3Vyc2l2ZSByZWZlcmVuY2UgZnJvbSBjYXVzaW5nIGVuZGxlc3MgbG9vcFxuICAgICAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gbnVsbDtcbiAgICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICAgICAganNmLCB3aWRnZXRMaWJyYXJ5LCBpc0FycmF5KG5vZGVWYWx1ZSkgPyBub2RlVmFsdWVbaV0gOiBudWxsLFxuICAgICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgJy9pdGVtcy8nICsgaSxcbiAgICAgICAgICAgICAgaXRlbVJlY3Vyc2l2ZSA/ICcnIDogZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgICB0cnVlLCAndHVwbGUnLCB0cnVlLCB0cnVlLCBpdGVtUmVjdXJzaXZlID8gZGF0YVBvaW50ZXIgKyAnLycgKyBpIDogJydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoaXRlbVJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0ucmVjdXJzaXZlUmVmZXJlbmNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3SXRlbSA9IGdldExheW91dE5vZGUoe1xuICAgICAgICAgICAgJHJlZjogaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgICAgICBkYXRhUG9pbnRlcjogZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiBpdGVtUmVjdXJzaXZlLFxuICAgICAgICAgIH0sIGpzZiwgd2lkZ2V0TGlicmFyeSwgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlW2ldIDogbnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3SXRlbSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICAgIGpzZiwgd2lkZ2V0TGlicmFyeSwgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlW2ldIDogbnVsbCxcbiAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyAnL2l0ZW1zLycgKyBpLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgdHJ1ZSwgJ3R1cGxlJywgZmFsc2UsIGZvclJlZkxpYnJhcnksIGRhdGFQb2ludGVyUHJlZml4XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3SXRlbSkgeyBuZXdOb2RlLml0ZW1zLnB1c2gobmV3SXRlbSk7IH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgJ2FkZGl0aW9uYWxJdGVtcycgaXMgYW4gb2JqZWN0ID0gYWRkaXRpb25hbCBsaXN0IGl0ZW1zLCBhZnRlciB0dXBsZSBpdGVtc1xuICAgICAgaWYgKGlzT2JqZWN0KHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpKSB7XG4gICAgICAgIGFkZGl0aW9uYWxJdGVtc1NjaGVtYVBvaW50ZXIgPSBzY2hlbWFQb2ludGVyICsgJy9hZGRpdGlvbmFsSXRlbXMnO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiAnaXRlbXMnIGlzIGFuIG9iamVjdCA9IGxpc3QgaXRlbXMgb25seSAobm8gdHVwbGUgaXRlbXMpXG4gICAgfSBlbHNlIGlmIChpc09iamVjdChzY2hlbWEuaXRlbXMpKSB7XG4gICAgICBhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyID0gc2NoZW1hUG9pbnRlciArICcvaXRlbXMnO1xuICAgIH1cblxuICAgIGlmIChhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyKSB7XG4gICAgICBjb25zdCBpdGVtUmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgIHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICApO1xuICAgICAgY29uc3QgaXRlbVJlY3Vyc2l2ZSA9ICFpdGVtUmVmUG9pbnRlci5sZW5ndGggfHxcbiAgICAgICAgaXRlbVJlZlBvaW50ZXIgIT09IHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nO1xuICAgICAgY29uc3QgaXRlbVNjaGVtYVBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICBhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyLCBqc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXBcbiAgICAgICk7XG4gICAgICAvLyBBZGQgbGlzdCBpdGVtIGxheW91dCB0byBsYXlvdXRSZWZMaWJyYXJ5XG4gICAgICBpZiAoaXRlbVJlZlBvaW50ZXIubGVuZ3RoICYmICFoYXNPd24oanNmLmxheW91dFJlZkxpYnJhcnksIGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAvLyBTZXQgdG8gbnVsbCBmaXJzdCB0byBwcmV2ZW50IHJlY3Vyc2l2ZSByZWZlcmVuY2UgZnJvbSBjYXVzaW5nIGVuZGxlc3MgbG9vcFxuICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBudWxsO1xuICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBidWlsZExheW91dEZyb21TY2hlbWEoXG4gICAgICAgICAganNmLCB3aWRnZXRMaWJyYXJ5LCBudWxsLFxuICAgICAgICAgIGl0ZW1TY2hlbWFQb2ludGVyLFxuICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgPyAnJyA6IGRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICB0cnVlLCAnbGlzdCcsIHJlbW92YWJsZSwgdHJ1ZSwgaXRlbVJlY3Vyc2l2ZSA/IGRhdGFQb2ludGVyICsgJy8tJyA6ICcnXG4gICAgICAgICk7XG4gICAgICAgIGlmIChpdGVtUmVjdXJzaXZlKSB7XG4gICAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdLnJlY3Vyc2l2ZVJlZmVyZW5jZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFueSBhZGRpdGlvbmFsIGRlZmF1bHQgaXRlbXNcbiAgICAgIGlmICghaXRlbVJlY3Vyc2l2ZSB8fCBuZXdOb2RlLm9wdGlvbnMucmVxdWlyZWQpIHtcbiAgICAgICAgY29uc3QgYXJyYXlMZW5ndGggPSBNYXRoLm1pbihNYXRoLm1heChcbiAgICAgICAgICBpdGVtUmVjdXJzaXZlID8gMCA6XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyArIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMsXG4gICAgICAgICAgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlLmxlbmd0aCA6IDBcbiAgICAgICAgKSwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zKTtcbiAgICAgICAgaWYgKG5ld05vZGUuaXRlbXMubGVuZ3RoIDwgYXJyYXlMZW5ndGgpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gbmV3Tm9kZS5pdGVtcy5sZW5ndGg7IGkgPCBhcnJheUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zLnB1c2goZ2V0TGF5b3V0Tm9kZSh7XG4gICAgICAgICAgICAgICRyZWY6IGl0ZW1SZWZQb2ludGVyLFxuICAgICAgICAgICAgICBkYXRhUG9pbnRlcjogZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IGl0ZW1SZWN1cnNpdmUsXG4gICAgICAgICAgICB9LCBqc2YsIHdpZGdldExpYnJhcnksIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtpXSA6IG51bGwpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbmVlZGVkLCBhZGQgYnV0dG9uIHRvIGFkZCBpdGVtcyB0byBhcnJheVxuICAgICAgaWYgKG5ld05vZGUub3B0aW9ucy5hZGRhYmxlICE9PSBmYWxzZSAmJlxuICAgICAgICBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgPCBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgJiZcbiAgICAgICAgKG5ld05vZGUuaXRlbXNbbmV3Tm9kZS5pdGVtcy5sZW5ndGggLSAxXSB8fCB7fSkudHlwZSAhPT0gJyRyZWYnXG4gICAgICApIHtcbiAgICAgICAgbGV0IGJ1dHRvblRleHQgPVxuICAgICAgICAgICgoanNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdIHx8IHt9KS5vcHRpb25zIHx8IHt9KS50aXRsZTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gYnV0dG9uVGV4dCA/ICdBZGQgJyA6ICdBZGQgdG8gJztcbiAgICAgICAgaWYgKCFidXR0b25UZXh0KSB7XG4gICAgICAgICAgYnV0dG9uVGV4dCA9IHNjaGVtYS50aXRsZSB8fCBmaXhUaXRsZShKc29uUG9pbnRlci50b0tleShkYXRhUG9pbnRlcikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghL15hZGRcXGIvaS50ZXN0KGJ1dHRvblRleHQpKSB7IGJ1dHRvblRleHQgPSBwcmVmaXggKyBidXR0b25UZXh0OyB9XG4gICAgICAgIG5ld05vZGUuaXRlbXMucHVzaCh7XG4gICAgICAgICAgX2lkOiB1bmlxdWVJZCgpLFxuICAgICAgICAgIGFycmF5SXRlbTogdHJ1ZSxcbiAgICAgICAgICBhcnJheUl0ZW1UeXBlOiAnbGlzdCcsXG4gICAgICAgICAgZGF0YVBvaW50ZXI6IG5ld05vZGUuZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGxpc3RJdGVtczogbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyxcbiAgICAgICAgICAgIG1heEl0ZW1zOiBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMsXG4gICAgICAgICAgICBtaW5JdGVtczogbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zLFxuICAgICAgICAgICAgcmVtb3ZhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHRpdGxlOiBidXR0b25UZXh0LFxuICAgICAgICAgICAgdHVwbGVJdGVtczogbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IGl0ZW1SZWN1cnNpdmUsXG4gICAgICAgICAgdHlwZTogJyRyZWYnLFxuICAgICAgICAgIHdpZGdldDogd2lkZ2V0TGlicmFyeS5nZXRXaWRnZXQoJyRyZWYnKSxcbiAgICAgICAgICAkcmVmOiBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gZWxzZSBpZiAobmV3Tm9kZS5kYXRhVHlwZSA9PT0gJyRyZWYnKSB7XG4gICAgY29uc3Qgc2NoZW1hUmVmID0gSnNvblBvaW50ZXIuY29tcGlsZShzY2hlbWEuJHJlZik7XG4gICAgY29uc3QgZGF0YVJlZiA9IEpzb25Qb2ludGVyLnRvRGF0YVBvaW50ZXIoc2NoZW1hUmVmLCBqc2Yuc2NoZW1hKTtcbiAgICBsZXQgYnV0dG9uVGV4dCA9ICcnO1xuXG4gICAgLy8gR2V0IG5ld05vZGUgdGl0bGVcbiAgICBpZiAobmV3Tm9kZS5vcHRpb25zLmFkZCkge1xuICAgICAgYnV0dG9uVGV4dCA9IG5ld05vZGUub3B0aW9ucy5hZGQ7XG4gICAgfSBlbHNlIGlmIChuZXdOb2RlLm5hbWUgJiYgIS9eXFxkKyQvLnRlc3QobmV3Tm9kZS5uYW1lKSkge1xuICAgICAgYnV0dG9uVGV4dCA9XG4gICAgICAgICgvXmFkZFxcYi9pLnRlc3QobmV3Tm9kZS5uYW1lKSA/ICcnIDogJ0FkZCAnKSArIGZpeFRpdGxlKG5ld05vZGUubmFtZSk7XG5cbiAgICAgIC8vIElmIG5ld05vZGUgZG9lc24ndCBoYXZlIGEgdGl0bGUsIGxvb2sgZm9yIHRpdGxlIG9mIHBhcmVudCBhcnJheSBpdGVtXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhcmVudFNjaGVtYSA9XG4gICAgICAgIEpzb25Qb2ludGVyLmdldChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyLCAwLCAtMSk7XG4gICAgICBpZiAoaGFzT3duKHBhcmVudFNjaGVtYSwgJ3RpdGxlJykpIHtcbiAgICAgICAgYnV0dG9uVGV4dCA9ICdBZGQgdG8gJyArIHBhcmVudFNjaGVtYS50aXRsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBvaW50ZXJBcnJheSA9IEpzb25Qb2ludGVyLnBhcnNlKG5ld05vZGUuZGF0YVBvaW50ZXIpO1xuICAgICAgICBidXR0b25UZXh0ID0gJ0FkZCB0byAnICsgZml4VGl0bGUocG9pbnRlckFycmF5W3BvaW50ZXJBcnJheS5sZW5ndGggLSAyXSk7XG4gICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5hc3NpZ24obmV3Tm9kZSwge1xuICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiB0cnVlLFxuICAgICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldCgnJHJlZicpLFxuICAgICAgJHJlZjogZGF0YVJlZixcbiAgICB9KTtcbiAgICBPYmplY3QuYXNzaWduKG5ld05vZGUub3B0aW9ucywge1xuICAgICAgcmVtb3ZhYmxlOiBmYWxzZSxcbiAgICAgIHRpdGxlOiBidXR0b25UZXh0LFxuICAgIH0pO1xuICAgIGlmIChpc051bWJlcihKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciwgMCwgLTEpLm1heEl0ZW1zKSkge1xuICAgICAgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zID1cbiAgICAgICAgSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIsIDAsIC0xKS5tYXhJdGVtcztcbiAgICB9XG5cbiAgICAvLyBBZGQgbGF5b3V0IHRlbXBsYXRlIHRvIGxheW91dFJlZkxpYnJhcnlcbiAgICBpZiAoZGF0YVJlZi5sZW5ndGgpIHtcbiAgICAgIGlmICghaGFzT3duKGpzZi5sYXlvdXRSZWZMaWJyYXJ5LCBkYXRhUmVmKSkge1xuICAgICAgICAvLyBTZXQgdG8gbnVsbCBmaXJzdCB0byBwcmV2ZW50IHJlY3Vyc2l2ZSByZWZlcmVuY2UgZnJvbSBjYXVzaW5nIGVuZGxlc3MgbG9vcFxuICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtkYXRhUmVmXSA9IG51bGw7XG4gICAgICAgIGNvbnN0IG5ld0xheW91dCA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICBqc2YsIHdpZGdldExpYnJhcnksIG51bGwsIHNjaGVtYVJlZiwgJycsXG4gICAgICAgICAgbmV3Tm9kZS5hcnJheUl0ZW0sIG5ld05vZGUuYXJyYXlJdGVtVHlwZSwgdHJ1ZSwgdHJ1ZSwgZGF0YVBvaW50ZXJcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG5ld0xheW91dCkge1xuICAgICAgICAgIG5ld0xheW91dC5yZWN1cnNpdmVSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2RhdGFSZWZdID0gbmV3TGF5b3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBqc2YubGF5b3V0UmVmTGlicmFyeVtkYXRhUmVmXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghanNmLmxheW91dFJlZkxpYnJhcnlbZGF0YVJlZl0ucmVjdXJzaXZlUmVmZXJlbmNlKSB7XG4gICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2RhdGFSZWZdLnJlY3Vyc2l2ZVJlZmVyZW5jZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXdOb2RlO1xufVxuXG4vKipcbiAqICdtYXBMYXlvdXQnIGZ1bmN0aW9uXG4gKlxuICogQ3JlYXRlcyBhIG5ldyBsYXlvdXQgYnkgcnVubmluZyBlYWNoIGVsZW1lbnQgaW4gYW4gZXhpc3RpbmcgbGF5b3V0IHRocm91Z2hcbiAqIGFuIGl0ZXJhdGVlLiBSZWN1cnNpdmVseSBtYXBzIHdpdGhpbiBhcnJheSBlbGVtZW50cyAnaXRlbXMnIGFuZCAndGFicycuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIGZvdXIgYXJndW1lbnRzOiAodmFsdWUsIGluZGV4LCBsYXlvdXQsIHBhdGgpXG4gKlxuICogVGhlIHJldHVybmVkIGxheW91dCBtYXkgYmUgbG9uZ2VyIChvciBzaG9ydGVyKSB0aGVuIHRoZSBzb3VyY2UgbGF5b3V0LlxuICpcbiAqIElmIGFuIGl0ZW0gZnJvbSB0aGUgc291cmNlIGxheW91dCByZXR1cm5zIG11bHRpcGxlIGl0ZW1zIChhcyAnKicgdXN1YWxseSB3aWxsKSxcbiAqIHRoaXMgZnVuY3Rpb24gd2lsbCBrZWVwIGFsbCByZXR1cm5lZCBpdGVtcyBpbi1saW5lIHdpdGggdGhlIHN1cnJvdW5kaW5nIGl0ZW1zLlxuICpcbiAqIElmIGFuIGl0ZW0gZnJvbSB0aGUgc291cmNlIGxheW91dCBjYXVzZXMgYW4gZXJyb3IgYW5kIHJldHVybnMgbnVsbCwgaXQgaXNcbiAqIHNraXBwZWQgd2l0aG91dCBlcnJvciwgYW5kIHRoZSBmdW5jdGlvbiB3aWxsIHN0aWxsIHJldHVybiBhbGwgbm9uLW51bGwgaXRlbXMuXG4gKlxuICogLy8gICBsYXlvdXQgLSB0aGUgbGF5b3V0IHRvIG1hcFxuICogLy8gIHsgKHY6IGFueSwgaT86IG51bWJlciwgbD86IGFueSwgcD86IHN0cmluZykgPT4gYW55IH1cbiAqICAgZnVuY3Rpb24gLSB0aGUgZnVuY2l0b24gdG8gaW52b2tlIG9uIGVhY2ggZWxlbWVudFxuICogLy8gIHsgc3RyaW5nfHN0cmluZ1tdID0gJycgfSBsYXlvdXRQb2ludGVyIC0gdGhlIGxheW91dFBvaW50ZXIgdG8gbGF5b3V0LCBpbnNpZGUgcm9vdExheW91dFxuICogLy8gIHsgYW55W10gPSBsYXlvdXQgfSByb290TGF5b3V0IC0gdGhlIHJvb3QgbGF5b3V0LCB3aGljaCBjb25hdGlucyBsYXlvdXRcbiAqIC8vXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBMYXlvdXQobGF5b3V0LCBmbiwgbGF5b3V0UG9pbnRlciA9ICcnLCByb290TGF5b3V0ID0gbGF5b3V0KSB7XG4gIGxldCBpbmRleFBhZCA9IDA7XG4gIGxldCBuZXdMYXlvdXQ6IGFueVtdID0gW107XG4gIGZvckVhY2gobGF5b3V0LCAoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCByZWFsSW5kZXggPSAraW5kZXggKyBpbmRleFBhZDtcbiAgICBjb25zdCBuZXdMYXlvdXRQb2ludGVyID0gbGF5b3V0UG9pbnRlciArICcvJyArIHJlYWxJbmRleDtcbiAgICBsZXQgbmV3Tm9kZTogYW55ID0gY29weShpdGVtKTtcbiAgICBsZXQgaXRlbXNBcnJheTogYW55W10gPSBbXTtcbiAgICBpZiAoaXNPYmplY3QoaXRlbSkpIHtcbiAgICAgIGlmIChoYXNPd24oaXRlbSwgJ3RhYnMnKSkge1xuICAgICAgICBpdGVtLml0ZW1zID0gaXRlbS50YWJzO1xuICAgICAgICBkZWxldGUgaXRlbS50YWJzO1xuICAgICAgfVxuICAgICAgaWYgKGhhc093bihpdGVtLCAnaXRlbXMnKSkge1xuICAgICAgICBpdGVtc0FycmF5ID0gaXNBcnJheShpdGVtLml0ZW1zKSA/IGl0ZW0uaXRlbXMgOiBbaXRlbS5pdGVtc107XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpdGVtc0FycmF5Lmxlbmd0aCkge1xuICAgICAgbmV3Tm9kZS5pdGVtcyA9IG1hcExheW91dChpdGVtc0FycmF5LCBmbiwgbmV3TGF5b3V0UG9pbnRlciArICcvaXRlbXMnLCByb290TGF5b3V0KTtcbiAgICB9XG4gICAgbmV3Tm9kZSA9IGZuKG5ld05vZGUsIHJlYWxJbmRleCwgbmV3TGF5b3V0UG9pbnRlciwgcm9vdExheW91dCk7XG4gICAgaWYgKCFpc0RlZmluZWQobmV3Tm9kZSkpIHtcbiAgICAgIGluZGV4UGFkLS07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0FycmF5KG5ld05vZGUpKSB7IGluZGV4UGFkICs9IG5ld05vZGUubGVuZ3RoIC0gMTsgfVxuICAgICAgbmV3TGF5b3V0ID0gbmV3TGF5b3V0LmNvbmNhdChuZXdOb2RlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbmV3TGF5b3V0O1xufVxuXG4vKipcbiAqICdnZXRMYXlvdXROb2RlJyBmdW5jdGlvblxuICogQ29weSBhIG5ldyBsYXlvdXROb2RlIGZyb20gbGF5b3V0UmVmTGlicmFyeVxuICpcbiAqIC8vICAgcmVmTm9kZSAtXG4gKiAvLyAgIGxheW91dFJlZkxpYnJhcnkgLVxuICogLy8gIHsgYW55ID0gbnVsbCB9IHdpZGdldExpYnJhcnkgLVxuICogLy8gIHsgYW55ID0gbnVsbCB9IG5vZGVWYWx1ZSAtXG4gKiAvLyAgY29waWVkIGxheW91dE5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExheW91dE5vZGUoXG4gIHJlZk5vZGUsIGpzZiwgd2lkZ2V0TGlicmFyeTogYW55ID0gbnVsbCwgbm9kZVZhbHVlOiBhbnkgPSBudWxsXG4pIHtcblxuICAvLyBJZiByZWN1cnNpdmUgcmVmZXJlbmNlIGFuZCBidWlsZGluZyBpbml0aWFsIGxheW91dCwgcmV0dXJuIEFkZCBidXR0b25cbiAgaWYgKHJlZk5vZGUucmVjdXJzaXZlUmVmZXJlbmNlICYmIHdpZGdldExpYnJhcnkpIHtcbiAgICBjb25zdCBuZXdMYXlvdXROb2RlID0gY2xvbmVEZWVwKHJlZk5vZGUpO1xuICAgIGlmICghbmV3TGF5b3V0Tm9kZS5vcHRpb25zKSB7IG5ld0xheW91dE5vZGUub3B0aW9ucyA9IHt9OyB9XG4gICAgT2JqZWN0LmFzc2lnbihuZXdMYXlvdXROb2RlLCB7XG4gICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IHRydWUsXG4gICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCckcmVmJyksXG4gICAgfSk7XG4gICAgT2JqZWN0LmFzc2lnbihuZXdMYXlvdXROb2RlLm9wdGlvbnMsIHtcbiAgICAgIHJlbW92YWJsZTogZmFsc2UsXG4gICAgICB0aXRsZTogJ0FkZCAnICsgbmV3TGF5b3V0Tm9kZS4kcmVmLFxuICAgIH0pO1xuICAgIHJldHVybiBuZXdMYXlvdXROb2RlO1xuXG4gICAgLy8gT3RoZXJ3aXNlLCByZXR1cm4gcmVmZXJlbmNlZCBsYXlvdXRcbiAgfSBlbHNlIHtcbiAgICBsZXQgbmV3TGF5b3V0Tm9kZSA9IGpzZi5sYXlvdXRSZWZMaWJyYXJ5W3JlZk5vZGUuJHJlZl07XG4gICAgLy8gSWYgdmFsdWUgZGVmaW5lZCwgYnVpbGQgbmV3IG5vZGUgZnJvbSBzY2hlbWEgKHRvIHNldCBhcnJheSBsZW5ndGhzKVxuICAgIGlmIChpc0RlZmluZWQobm9kZVZhbHVlKSkge1xuICAgICAgbmV3TGF5b3V0Tm9kZSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAganNmLCB3aWRnZXRMaWJyYXJ5LCBub2RlVmFsdWUsXG4gICAgICAgIEpzb25Qb2ludGVyLnRvU2NoZW1hUG9pbnRlcihyZWZOb2RlLiRyZWYsIGpzZi5zY2hlbWEpLFxuICAgICAgICByZWZOb2RlLiRyZWYsIG5ld0xheW91dE5vZGUuYXJyYXlJdGVtLFxuICAgICAgICBuZXdMYXlvdXROb2RlLmFycmF5SXRlbVR5cGUsIG5ld0xheW91dE5vZGUub3B0aW9ucy5yZW1vdmFibGUsIGZhbHNlXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB2YWx1ZSBub3QgZGVmaW5lZCwgY29weSBub2RlIGZyb20gbGF5b3V0UmVmTGlicmFyeVxuICAgICAgbmV3TGF5b3V0Tm9kZSA9IGNsb25lRGVlcChuZXdMYXlvdXROb2RlKTtcbiAgICAgIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKG5ld0xheW91dE5vZGUsIChzdWJOb2RlLCBwb2ludGVyKSA9PiB7XG5cbiAgICAgICAgLy8gUmVzZXQgYWxsIF9pZCdzIGluIG5ld0xheW91dE5vZGUgdG8gdW5pcXVlIHZhbHVlc1xuICAgICAgICBpZiAoaGFzT3duKHN1Yk5vZGUsICdfaWQnKSkgeyBzdWJOb2RlLl9pZCA9IHVuaXF1ZUlkKCk7IH1cblxuICAgICAgICAvLyBJZiBhZGRpbmcgYSByZWN1cnNpdmUgaXRlbSwgcHJlZml4IGN1cnJlbnQgZGF0YVBvaW50ZXJcbiAgICAgICAgLy8gdG8gYWxsIGRhdGFQb2ludGVycyBpbiBuZXcgbGF5b3V0Tm9kZVxuICAgICAgICBpZiAocmVmTm9kZS5yZWN1cnNpdmVSZWZlcmVuY2UgJiYgaGFzT3duKHN1Yk5vZGUsICdkYXRhUG9pbnRlcicpKSB7XG4gICAgICAgICAgc3ViTm9kZS5kYXRhUG9pbnRlciA9IHJlZk5vZGUuZGF0YVBvaW50ZXIgKyBzdWJOb2RlLmRhdGFQb2ludGVyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0xheW91dE5vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiAnYnVpbGRUaXRsZU1hcCcgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIHRpdGxlTWFwIC1cbiAqIC8vICAgZW51bUxpc3QgLVxuICogLy8gIHsgYm9vbGVhbiA9IHRydWUgfSBmaWVsZFJlcXVpcmVkIC1cbiAqIC8vICB7IGJvb2xlYW4gPSB0cnVlIH0gZmxhdExpc3QgLVxuICogLy8geyBUaXRsZU1hcEl0ZW1bXSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFRpdGxlTWFwKFxuICB0aXRsZU1hcCwgZW51bUxpc3QsIGZpZWxkUmVxdWlyZWQgPSB0cnVlLCBmbGF0TGlzdCA9IHRydWVcbikge1xuICBsZXQgbmV3VGl0bGVNYXA6IFRpdGxlTWFwSXRlbVtdID0gW107XG4gIGxldCBoYXNFbXB0eVZhbHVlID0gZmFsc2U7XG4gIGlmICh0aXRsZU1hcCkge1xuICAgIGlmIChpc0FycmF5KHRpdGxlTWFwKSkge1xuICAgICAgaWYgKGVudW1MaXN0KSB7XG4gICAgICAgIGZvciAoY29uc3QgaSBvZiBPYmplY3Qua2V5cyh0aXRsZU1hcCkpIHtcbiAgICAgICAgICBpZiAoaXNPYmplY3QodGl0bGVNYXBbaV0pKSB7IC8vIEpTT04gRm9ybSBzdHlsZVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aXRsZU1hcFtpXS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChlbnVtTGlzdC5pbmNsdWRlcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlTWFwW2ldLm5hbWU7XG4gICAgICAgICAgICAgIG5ld1RpdGxlTWFwLnB1c2goeyBuYW1lLCB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHsgaGFzRW1wdHlWYWx1ZSA9IHRydWU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKHRpdGxlTWFwW2ldKSkgeyAvLyBSZWFjdCBKc29uc2NoZW1hIEZvcm0gc3R5bGVcbiAgICAgICAgICAgIGlmIChpIDwgZW51bUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB0aXRsZU1hcFtpXTtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlbnVtTGlzdFtpXTtcbiAgICAgICAgICAgICAgbmV3VGl0bGVNYXAucHVzaCh7IG5hbWUsIHZhbHVlIH0pO1xuICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkgeyBoYXNFbXB0eVZhbHVlID0gdHJ1ZTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gSWYgYXJyYXkgdGl0bGVNYXAgYW5kIG5vIGVudW0gbGlzdCwganVzdCByZXR1cm4gdGhlIHRpdGxlTWFwIC0gQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZVxuICAgICAgICBuZXdUaXRsZU1hcCA9IHRpdGxlTWFwO1xuICAgICAgICBpZiAoIWZpZWxkUmVxdWlyZWQpIHtcbiAgICAgICAgICBoYXNFbXB0eVZhbHVlID0gISFuZXdUaXRsZU1hcFxuICAgICAgICAgICAgLmZpbHRlcihpID0+IGkudmFsdWUgPT09IHVuZGVmaW5lZCB8fCBpLnZhbHVlID09PSBudWxsKVxuICAgICAgICAgICAgLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZW51bUxpc3QpIHsgLy8gQWx0ZXJuYXRlIEpTT04gRm9ybSBzdHlsZSwgd2l0aCBlbnVtIGxpc3RcbiAgICAgIGZvciAoY29uc3QgaSBvZiBPYmplY3Qua2V5cyhlbnVtTGlzdCkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBlbnVtTGlzdFtpXTtcbiAgICAgICAgaWYgKGhhc093bih0aXRsZU1hcCwgdmFsdWUpKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlTWFwW3ZhbHVlXTtcbiAgICAgICAgICBuZXdUaXRsZU1hcC5wdXNoKHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHsgaGFzRW1wdHlWYWx1ZSA9IHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7IC8vIEFsdGVybmF0ZSBKU09OIEZvcm0gc3R5bGUsIHdpdGhvdXQgZW51bSBsaXN0XG4gICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC5rZXlzKHRpdGxlTWFwKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gdGl0bGVNYXBbdmFsdWVdO1xuICAgICAgICBuZXdUaXRsZU1hcC5wdXNoKHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7IGhhc0VtcHR5VmFsdWUgPSB0cnVlOyB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGVudW1MaXN0KSB7IC8vIEJ1aWxkIG1hcCBmcm9tIGVudW0gbGlzdCBhbG9uZVxuICAgIGZvciAoY29uc3QgaSBvZiBPYmplY3Qua2V5cyhlbnVtTGlzdCkpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBlbnVtTGlzdFtpXTtcbiAgICAgIGNvbnN0IHZhbHVlID0gZW51bUxpc3RbaV07XG4gICAgICBuZXdUaXRsZU1hcC5wdXNoKHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkgeyBoYXNFbXB0eVZhbHVlID0gdHJ1ZTsgfVxuICAgIH1cbiAgfSBlbHNlIHsgLy8gSWYgbm8gdGl0bGVNYXAgYW5kIG5vIGVudW0gbGlzdCwgcmV0dXJuIGRlZmF1bHQgbWFwIG9mIGJvb2xlYW4gdmFsdWVzXG4gICAgbmV3VGl0bGVNYXAgPSBbeyBuYW1lOiAnVHJ1ZScsIHZhbHVlOiB0cnVlIH0sIHsgbmFtZTogJ0ZhbHNlJywgdmFsdWU6IGZhbHNlIH1dO1xuICB9XG5cbiAgLy8gRG9lcyB0aXRsZU1hcCBoYXZlIGdyb3Vwcz9cbiAgaWYgKG5ld1RpdGxlTWFwLnNvbWUodGl0bGUgPT4gaGFzT3duKHRpdGxlLCAnZ3JvdXAnKSkpIHtcbiAgICBoYXNFbXB0eVZhbHVlID0gZmFsc2U7XG5cbiAgICAvLyBJZiBmbGF0TGlzdCA9IHRydWUsIGZsYXR0ZW4gaXRlbXMgJiB1cGRhdGUgbmFtZSB0byBncm91cDogbmFtZVxuICAgIGlmIChmbGF0TGlzdCkge1xuICAgICAgbmV3VGl0bGVNYXAgPSBuZXdUaXRsZU1hcC5yZWR1Y2UoKGdyb3VwVGl0bGVNYXAsIHRpdGxlKSA9PiB7XG4gICAgICAgIGlmIChoYXNPd24odGl0bGUsICdncm91cCcpKSB7XG4gICAgICAgICAgaWYgKGlzQXJyYXkodGl0bGUuaXRlbXMpKSB7XG4gICAgICAgICAgICBncm91cFRpdGxlTWFwID0gW1xuICAgICAgICAgICAgICAuLi5ncm91cFRpdGxlTWFwLFxuICAgICAgICAgICAgICAuLi50aXRsZS5pdGVtcy5tYXAoaXRlbSA9PlxuICAgICAgICAgICAgICAgICh7IC4uLml0ZW0sIC4uLnsgbmFtZTogYCR7dGl0bGUuZ3JvdXB9OiAke2l0ZW0ubmFtZX1gIH0gfSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICh0aXRsZS5pdGVtcy5zb21lKGl0ZW0gPT4gaXRlbS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGl0ZW0udmFsdWUgPT09IG51bGwpKSB7XG4gICAgICAgICAgICAgIGhhc0VtcHR5VmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFzT3duKHRpdGxlLCAnbmFtZScpICYmIGhhc093bih0aXRsZSwgJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIHRpdGxlLm5hbWUgPSBgJHt0aXRsZS5ncm91cH06ICR7dGl0bGUubmFtZX1gO1xuICAgICAgICAgICAgZGVsZXRlIHRpdGxlLmdyb3VwO1xuICAgICAgICAgICAgZ3JvdXBUaXRsZU1hcC5wdXNoKHRpdGxlKTtcbiAgICAgICAgICAgIGlmICh0aXRsZS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRpdGxlLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIGhhc0VtcHR5VmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBncm91cFRpdGxlTWFwLnB1c2godGl0bGUpO1xuICAgICAgICAgIGlmICh0aXRsZS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRpdGxlLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBoYXNFbXB0eVZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdyb3VwVGl0bGVNYXA7XG4gICAgICB9LCBbXSk7XG5cbiAgICAgIC8vIElmIGZsYXRMaXN0ID0gZmFsc2UsIGNvbWJpbmUgaXRlbXMgZnJvbSBtYXRjaGluZyBncm91cHNcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3VGl0bGVNYXAgPSBuZXdUaXRsZU1hcC5yZWR1Y2UoKGdyb3VwVGl0bGVNYXAsIHRpdGxlKSA9PiB7XG4gICAgICAgIGlmIChoYXNPd24odGl0bGUsICdncm91cCcpKSB7XG4gICAgICAgICAgaWYgKHRpdGxlLmdyb3VwICE9PSAoZ3JvdXBUaXRsZU1hcFtncm91cFRpdGxlTWFwLmxlbmd0aCAtIDFdIHx8IHt9KS5ncm91cCkge1xuICAgICAgICAgICAgZ3JvdXBUaXRsZU1hcC5wdXNoKHsgZ3JvdXA6IHRpdGxlLmdyb3VwLCBpdGVtczogdGl0bGUuaXRlbXMgfHwgW10gfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYXNPd24odGl0bGUsICduYW1lJykgJiYgaGFzT3duKHRpdGxlLCAndmFsdWUnKSkge1xuICAgICAgICAgICAgZ3JvdXBUaXRsZU1hcFtncm91cFRpdGxlTWFwLmxlbmd0aCAtIDFdLml0ZW1zXG4gICAgICAgICAgICAgIC5wdXNoKHsgbmFtZTogdGl0bGUubmFtZSwgdmFsdWU6IHRpdGxlLnZhbHVlIH0pO1xuICAgICAgICAgICAgaWYgKHRpdGxlLnZhbHVlID09PSB1bmRlZmluZWQgfHwgdGl0bGUudmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaGFzRW1wdHlWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdyb3VwVGl0bGVNYXAucHVzaCh0aXRsZSk7XG4gICAgICAgICAgaWYgKHRpdGxlLnZhbHVlID09PSB1bmRlZmluZWQgfHwgdGl0bGUudmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGhhc0VtcHR5VmFsdWUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JvdXBUaXRsZU1hcDtcbiAgICAgIH0sIFtdKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFmaWVsZFJlcXVpcmVkICYmICFoYXNFbXB0eVZhbHVlKSB7XG4gICAgbmV3VGl0bGVNYXAudW5zaGlmdCh7IG5hbWU6ICc8ZW0+Tm9uZTwvZW0+JywgdmFsdWU6IG51bGwgfSk7XG4gIH1cbiAgcmV0dXJuIG5ld1RpdGxlTWFwO1xufVxuIl19