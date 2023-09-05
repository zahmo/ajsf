import { cleanValueOfQuotes, copy, getExpressionType, getKeyAndValueByExpressionType, hasOwn, isEqual, isNotEqual, isNotExpression } from './utility.functions';
import { Injectable } from '@angular/core';
import { isArray, isDefined, isEmpty, isMap, isNumber, isObject, isString } from './validator.functions';
import * as i0 from "@angular/core";
export class JsonPointer {
    /**
     * 'get' function
     *
     * Uses a JSON Pointer to retrieve a value from an object.
     *
     * //  { object } object - Object to get value from
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { number = 0 } startSlice - Zero-based index of first Pointer key to use
     * //  { number } endSlice - Zero-based index of last Pointer key to use
     * //  { boolean = false } getBoolean - Return only true or false?
     * //  { boolean = false } errors - Show error if not found?
     * // { object } - Located value (or true or false if getBoolean = true)
     */
    static get(object, pointer, startSlice = 0, endSlice = null, getBoolean = false, errors = false) {
        if (object === null) {
            return getBoolean ? false : undefined;
        }
        let keyArray = this.parse(pointer, errors);
        if (typeof object === 'object' && keyArray !== null) {
            let subObject = object;
            if (startSlice >= keyArray.length || endSlice <= -keyArray.length) {
                return object;
            }
            if (startSlice <= -keyArray.length) {
                startSlice = 0;
            }
            if (!isDefined(endSlice) || endSlice >= keyArray.length) {
                endSlice = keyArray.length;
            }
            keyArray = keyArray.slice(startSlice, endSlice);
            for (let key of keyArray) {
                if (key === '-' && isArray(subObject) && subObject.length) {
                    key = subObject.length - 1;
                }
                if (isMap(subObject) && subObject.has(key)) {
                    subObject = subObject.get(key);
                }
                else if (typeof subObject === 'object' && subObject !== null &&
                    hasOwn(subObject, key)) {
                    subObject = subObject[key];
                }
                else {
                    const evaluatedExpression = JsonPointer.evaluateExpression(subObject, key);
                    if (evaluatedExpression.passed) {
                        subObject = evaluatedExpression.key ? subObject[evaluatedExpression.key] : subObject;
                    }
                    else {
                        this.logErrors(errors, key, pointer, object);
                        return getBoolean ? false : undefined;
                    }
                }
            }
            return getBoolean ? true : subObject;
        }
        if (errors && keyArray === null) {
            console.error(`get error: Invalid JSON Pointer: ${pointer}`);
        }
        if (errors && typeof object !== 'object') {
            console.error('get error: Invalid object:');
            console.error(object);
        }
        return getBoolean ? false : undefined;
    }
    static logErrors(errors, key, pointer, object) {
        if (errors) {
            console.error(`get error: "${key}" key not found in object.`);
            console.error(pointer);
            console.error(object);
        }
    }
    /**
     * Evaluates conditional expression in form of `model.<property>==<value>` or
     * `model.<property>!=<value>` where the first one means that the value must match to be
     * shown in a form, while the former shows the property only when the property value is not
     * set, or does not equal the given value.
     *
     * // { subObject } subObject -  an object containing the data values of properties
     * // { key } key - the key from the for loop in a form of `<property>==<value>`
     *
     * Returns the object with two properties. The property passed informs whether
     * the expression evaluated successfully and the property key returns either the same
     * key if it is not contained inside the subObject or the key of the property if it is contained.
     */
    static evaluateExpression(subObject, key) {
        const defaultResult = { passed: false, key: key };
        const keysAndExpression = this.parseKeysAndExpression(key, subObject);
        if (!keysAndExpression) {
            return defaultResult;
        }
        const ownCheckResult = this.doOwnCheckResult(subObject, keysAndExpression);
        if (ownCheckResult) {
            return ownCheckResult;
        }
        const cleanedValue = cleanValueOfQuotes(keysAndExpression.keyAndValue[1]);
        const evaluatedResult = this.performExpressionOnValue(keysAndExpression, cleanedValue, subObject);
        if (evaluatedResult) {
            return evaluatedResult;
        }
        return defaultResult;
    }
    /**
     * Performs the actual evaluation on the given expression with given values and keys.
     * // { cleanedValue } cleanedValue - the given valued cleaned of quotes if it had any
     * // { subObject } subObject - the object with properties values
     * // { keysAndExpression } keysAndExpression - an object holding the expressions with
     */
    static performExpressionOnValue(keysAndExpression, cleanedValue, subObject) {
        const propertyByKey = subObject[keysAndExpression.keyAndValue[0]];
        if (this.doComparisonByExpressionType(keysAndExpression.expressionType, propertyByKey, cleanedValue)) {
            return { passed: true, key: keysAndExpression.keyAndValue[0] };
        }
        return null;
    }
    static doComparisonByExpressionType(expressionType, propertyByKey, cleanedValue) {
        if (isEqual(expressionType)) {
            return propertyByKey === cleanedValue;
        }
        if (isNotEqual(expressionType)) {
            return propertyByKey !== cleanedValue;
        }
        return false;
    }
    /**
     * Does the checks when the parsed key is actually no a property inside subObject.
     * That would mean that the equal comparison makes no sense and thus the negative result
     * is returned, and the not equal comparison is not necessary because it doesn't equal
     * obviously. Returns null when the given key is a real property inside the subObject.
     * // { subObject } subObject - the object with properties values
     * // { keysAndExpression } keysAndExpression - an object holding the expressions with
     * the associated keys.
     */
    static doOwnCheckResult(subObject, keysAndExpression) {
        let ownCheckResult = null;
        if (!hasOwn(subObject, keysAndExpression.keyAndValue[0])) {
            if (isEqual(keysAndExpression.expressionType)) {
                ownCheckResult = { passed: false, key: null };
            }
            if (isNotEqual(keysAndExpression.expressionType)) {
                ownCheckResult = { passed: true, key: null };
            }
        }
        return ownCheckResult;
    }
    /**
     * Does the basic checks and tries to parse an expression and a pair
     * of key and value.
     * // { key } key - the original for loop created value containing key and value in one string
     * // { subObject } subObject - the object with properties values
     */
    static parseKeysAndExpression(key, subObject) {
        if (this.keyOrSubObjEmpty(key, subObject)) {
            return null;
        }
        const expressionType = getExpressionType(key.toString());
        if (isNotExpression(expressionType)) {
            return null;
        }
        const keyAndValue = getKeyAndValueByExpressionType(expressionType, key);
        if (!keyAndValue || !keyAndValue[0] || !keyAndValue[1]) {
            return null;
        }
        return { expressionType: expressionType, keyAndValue: keyAndValue };
    }
    static keyOrSubObjEmpty(key, subObject) {
        return !key || !subObject;
    }
    /**
     * 'getCopy' function
     *
     * Uses a JSON Pointer to deeply clone a value from an object.
     *
     * //  { object } object - Object to get value from
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { number = 0 } startSlice - Zero-based index of first Pointer key to use
     * //  { number } endSlice - Zero-based index of last Pointer key to use
     * //  { boolean = false } getBoolean - Return only true or false?
     * //  { boolean = false } errors - Show error if not found?
     * // { object } - Located value (or true or false if getBoolean = true)
     */
    static getCopy(object, pointer, startSlice = 0, endSlice = null, getBoolean = false, errors = false) {
        const objectToCopy = this.get(object, pointer, startSlice, endSlice, getBoolean, errors);
        return this.forEachDeepCopy(objectToCopy);
    }
    /**
     * 'getFirst' function
     *
     * Takes an array of JSON Pointers and objects,
     * checks each object for a value specified by the pointer,
     * and returns the first value found.
     *
     * //  { [object, pointer][] } items - Array of objects and pointers to check
     * //  { any = null } defaultValue - Value to return if nothing found
     * //  { boolean = false } getCopy - Return a copy instead?
     * //  - First value found
     */
    static getFirst(items, defaultValue = null, getCopy = false) {
        if (isEmpty(items)) {
            return;
        }
        if (isArray(items)) {
            for (const item of items) {
                if (isEmpty(item)) {
                    continue;
                }
                if (isArray(item) && item.length >= 2) {
                    if (isEmpty(item[0]) || isEmpty(item[1])) {
                        continue;
                    }
                    const value = getCopy ?
                        this.getCopy(item[0], item[1]) :
                        this.get(item[0], item[1]);
                    if (value) {
                        return value;
                    }
                    continue;
                }
                console.error('getFirst error: Input not in correct format.\n' +
                    'Should be: [ [ object1, pointer1 ], [ object 2, pointer2 ], etc... ]');
                return;
            }
            return defaultValue;
        }
        if (isMap(items)) {
            for (const [object, pointer] of items) {
                if (object === null || !this.isJsonPointer(pointer)) {
                    continue;
                }
                const value = getCopy ?
                    this.getCopy(object, pointer) :
                    this.get(object, pointer);
                if (value) {
                    return value;
                }
            }
            return defaultValue;
        }
        console.error('getFirst error: Input not in correct format.\n' +
            'Should be: [ [ object1, pointer1 ], [ object 2, pointer2 ], etc... ]');
        return defaultValue;
    }
    /**
     * 'getFirstCopy' function
     *
     * Similar to getFirst, but always returns a copy.
     *
     * //  { [object, pointer][] } items - Array of objects and pointers to check
     * //  { any = null } defaultValue - Value to return if nothing found
     * //  - Copy of first value found
     */
    static getFirstCopy(items, defaultValue = null) {
        const firstCopy = this.getFirst(items, defaultValue, true);
        return firstCopy;
    }
    /**
     * 'set' function
     *
     * Uses a JSON Pointer to set a value on an object.
     * Also creates any missing sub objects or arrays to contain that value.
     *
     * If the optional fourth parameter is TRUE and the inner-most container
     * is an array, the function will insert the value as a new item at the
     * specified location in the array, rather than overwriting the existing
     * value (if any) at that location.
     *
     * So set([1, 2, 3], '/1', 4) => [1, 4, 3]
     * and
     * So set([1, 2, 3], '/1', 4, true) => [1, 4, 2, 3]
     *
     * //  { object } object - The object to set value in
     * //  { Pointer } pointer - The JSON Pointer (string or array)
     * //   value - The new value to set
     * //  { boolean } insert - insert value?
     * // { object } - The original object, modified with the set value
     */
    static set(object, pointer, value, insert = false) {
        const keyArray = this.parse(pointer);
        if (keyArray !== null && keyArray.length) {
            let subObject = object;
            for (let i = 0; i < keyArray.length - 1; ++i) {
                let key = keyArray[i];
                if (key === '-' && isArray(subObject)) {
                    key = subObject.length;
                }
                if (isMap(subObject) && subObject.has(key)) {
                    subObject = subObject.get(key);
                }
                else {
                    if (!hasOwn(subObject, key)) {
                        subObject[key] = (keyArray[i + 1].match(/^(\d+|-)$/)) ? [] : {};
                    }
                    subObject = subObject[key];
                }
            }
            const lastKey = keyArray[keyArray.length - 1];
            if (isArray(subObject) && lastKey === '-') {
                subObject.push(value);
            }
            else if (insert && isArray(subObject) && !isNaN(+lastKey)) {
                subObject.splice(lastKey, 0, value);
            }
            else if (isMap(subObject)) {
                subObject.set(lastKey, value);
            }
            else {
                subObject[lastKey] = value;
            }
            return object;
        }
        console.error(`set error: Invalid JSON Pointer: ${pointer}`);
        return object;
    }
    /**
     * 'setCopy' function
     *
     * Copies an object and uses a JSON Pointer to set a value on the copy.
     * Also creates any missing sub objects or arrays to contain that value.
     *
     * If the optional fourth parameter is TRUE and the inner-most container
     * is an array, the function will insert the value as a new item at the
     * specified location in the array, rather than overwriting the existing value.
     *
     * //  { object } object - The object to copy and set value in
     * //  { Pointer } pointer - The JSON Pointer (string or array)
     * //   value - The value to set
     * //  { boolean } insert - insert value?
     * // { object } - The new object with the set value
     */
    static setCopy(object, pointer, value, insert = false) {
        const keyArray = this.parse(pointer);
        if (keyArray !== null) {
            const newObject = copy(object);
            let subObject = newObject;
            for (let i = 0; i < keyArray.length - 1; ++i) {
                let key = keyArray[i];
                if (key === '-' && isArray(subObject)) {
                    key = subObject.length;
                }
                if (isMap(subObject) && subObject.has(key)) {
                    subObject.set(key, copy(subObject.get(key)));
                    subObject = subObject.get(key);
                }
                else {
                    if (!hasOwn(subObject, key)) {
                        subObject[key] = (keyArray[i + 1].match(/^(\d+|-)$/)) ? [] : {};
                    }
                    subObject[key] = copy(subObject[key]);
                    subObject = subObject[key];
                }
            }
            const lastKey = keyArray[keyArray.length - 1];
            if (isArray(subObject) && lastKey === '-') {
                subObject.push(value);
            }
            else if (insert && isArray(subObject) && !isNaN(+lastKey)) {
                subObject.splice(lastKey, 0, value);
            }
            else if (isMap(subObject)) {
                subObject.set(lastKey, value);
            }
            else {
                subObject[lastKey] = value;
            }
            return newObject;
        }
        console.error(`setCopy error: Invalid JSON Pointer: ${pointer}`);
        return object;
    }
    /**
     * 'insert' function
     *
     * Calls 'set' with insert = TRUE
     *
     * //  { object } object - object to insert value in
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //   value - value to insert
     * // { object }
     */
    static insert(object, pointer, value) {
        const updatedObject = this.set(object, pointer, value, true);
        return updatedObject;
    }
    /**
     * 'insertCopy' function
     *
     * Calls 'setCopy' with insert = TRUE
     *
     * //  { object } object - object to insert value in
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //   value - value to insert
     * // { object }
     */
    static insertCopy(object, pointer, value) {
        const updatedObject = this.setCopy(object, pointer, value, true);
        return updatedObject;
    }
    /**
     * 'remove' function
     *
     * Uses a JSON Pointer to remove a key and its attribute from an object
     *
     * //  { object } object - object to delete attribute from
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * // { object }
     */
    static remove(object, pointer) {
        const keyArray = this.parse(pointer);
        if (keyArray !== null && keyArray.length) {
            let lastKey = keyArray.pop();
            const parentObject = this.get(object, keyArray);
            if (isArray(parentObject)) {
                if (lastKey === '-') {
                    lastKey = parentObject.length - 1;
                }
                parentObject.splice(lastKey, 1);
            }
            else if (isObject(parentObject)) {
                delete parentObject[lastKey];
            }
            return object;
        }
        console.error(`remove error: Invalid JSON Pointer: ${pointer}`);
        return object;
    }
    /**
     * 'has' function
     *
     * Tests if an object has a value at the location specified by a JSON Pointer
     *
     * //  { object } object - object to chek for value
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * // { boolean }
     */
    static has(object, pointer) {
        const hasValue = this.get(object, pointer, 0, null, true);
        return hasValue;
    }
    /**
     * 'dict' function
     *
     * Returns a (pointer -> value) dictionary for an object
     *
     * //  { object } object - The object to create a dictionary from
     * // { object } - The resulting dictionary object
     */
    static dict(object) {
        const results = {};
        this.forEachDeep(object, (value, pointer) => {
            if (typeof value !== 'object') {
                results[pointer] = value;
            }
        });
        return results;
    }
    /**
     * 'forEachDeep' function
     *
     * Iterates over own enumerable properties of an object or items in an array
     * and invokes an iteratee function for each key/value or index/value pair.
     * By default, iterates over items within objects and arrays after calling
     * the iteratee function on the containing object or array itself.
     *
     * The iteratee is invoked with three arguments: (value, pointer, rootObject),
     * where pointer is a JSON pointer indicating the location of the current
     * value within the root object, and rootObject is the root object initially
     * submitted to th function.
     *
     * If a third optional parameter 'bottomUp' is set to TRUE, the iterator
     * function will be called on sub-objects and arrays after being
     * called on their contents, rather than before, which is the default.
     *
     * This function can also optionally be called directly on a sub-object by
     * including optional 4th and 5th parameterss to specify the initial
     * root object and pointer.
     *
     * //  { object } object - the initial object or array
     * //  { (v: any, p?: string, o?: any) => any } function - iteratee function
     * //  { boolean = false } bottomUp - optional, set to TRUE to reverse direction
     * //  { object = object } rootObject - optional, root object or array
     * //  { string = '' } pointer - optional, JSON Pointer to object within rootObject
     * // { object } - The modified object
     */
    static forEachDeep(object, fn = (v) => v, bottomUp = false, pointer = '', rootObject = object) {
        if (typeof fn !== 'function') {
            console.error(`forEachDeep error: Iterator is not a function:`, fn);
            return;
        }
        if (!bottomUp) {
            fn(object, pointer, rootObject);
        }
        if (isObject(object) || isArray(object)) {
            for (const key of Object.keys(object)) {
                const newPointer = pointer + '/' + this.escape(key);
                this.forEachDeep(object[key], fn, bottomUp, newPointer, rootObject);
            }
        }
        if (bottomUp) {
            fn(object, pointer, rootObject);
        }
    }
    /**
     * 'forEachDeepCopy' function
     *
     * Similar to forEachDeep, but returns a copy of the original object, with
     * the same keys and indexes, but with values replaced with the result of
     * the iteratee function.
     *
     * //  { object } object - the initial object or array
     * //  { (v: any, k?: string, o?: any, p?: any) => any } function - iteratee function
     * //  { boolean = false } bottomUp - optional, set to TRUE to reverse direction
     * //  { object = object } rootObject - optional, root object or array
     * //  { string = '' } pointer - optional, JSON Pointer to object within rootObject
     * // { object } - The copied object
     */
    static forEachDeepCopy(object, fn = (v) => v, bottomUp = false, pointer = '', rootObject = object) {
        if (typeof fn !== 'function') {
            console.error(`forEachDeepCopy error: Iterator is not a function:`, fn);
            return null;
        }
        if (isObject(object) || isArray(object)) {
            let newObject = isArray(object) ? [...object] : { ...object };
            if (!bottomUp) {
                newObject = fn(newObject, pointer, rootObject);
            }
            for (const key of Object.keys(newObject)) {
                const newPointer = pointer + '/' + this.escape(key);
                newObject[key] = this.forEachDeepCopy(newObject[key], fn, bottomUp, newPointer, rootObject);
            }
            if (bottomUp) {
                newObject = fn(newObject, pointer, rootObject);
            }
            return newObject;
        }
        else {
            return fn(object, pointer, rootObject);
        }
    }
    /**
     * 'escape' function
     *
     * Escapes a string reference key
     *
     * //  { string } key - string key to escape
     * // { string } - escaped key
     */
    static escape(key) {
        const escaped = key.toString().replace(/~/g, '~0').replace(/\//g, '~1');
        return escaped;
    }
    /**
     * 'unescape' function
     *
     * Unescapes a string reference key
     *
     * //  { string } key - string key to unescape
     * // { string } - unescaped key
     */
    static unescape(key) {
        const unescaped = key.toString().replace(/~1/g, '/').replace(/~0/g, '~');
        return unescaped;
    }
    /**
     * 'parse' function
     *
     * Converts a string JSON Pointer into a array of keys
     * (if input is already an an array of keys, it is returned unchanged)
     *
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { string[] } - JSON Pointer array of keys
     */
    static parse(pointer, errors = false) {
        if (!this.isJsonPointer(pointer)) {
            if (errors) {
                console.error(`parse error: Invalid JSON Pointer: ${pointer}`);
            }
            return null;
        }
        if (isArray(pointer)) {
            return pointer;
        }
        if (typeof pointer === 'string') {
            if (pointer[0] === '#') {
                pointer = pointer.slice(1);
            }
            if (pointer === '' || pointer === '/') {
                return [];
            }
            return pointer.slice(1).split('/').map(this.unescape);
        }
    }
    /**
     * 'compile' function
     *
     * Converts an array of keys into a JSON Pointer string
     * (if input is already a string, it is normalized and returned)
     *
     * The optional second parameter is a default which will replace any empty keys.
     *
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { string | number = '' } defaultValue - Default value
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { string } - JSON Pointer string
     */
    static compile(pointer, defaultValue = '', errors = false) {
        if (pointer === '#') {
            return '';
        }
        if (!this.isJsonPointer(pointer)) {
            if (errors) {
                console.error(`compile error: Invalid JSON Pointer: ${pointer}`);
            }
            return null;
        }
        if (isArray(pointer)) {
            if (pointer.length === 0) {
                return '';
            }
            return '/' + pointer.map(key => key === '' ? defaultValue : this.escape(key)).join('/');
        }
        if (typeof pointer === 'string') {
            if (pointer[0] === '#') {
                pointer = pointer.slice(1);
            }
            return pointer;
        }
    }
    /**
     * 'toKey' function
     *
     * Extracts name of the final key from a JSON Pointer.
     *
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { string } - the extracted key
     */
    static toKey(pointer, errors = false) {
        const keyArray = this.parse(pointer, errors);
        if (keyArray === null) {
            return null;
        }
        if (!keyArray.length) {
            return '';
        }
        return keyArray[keyArray.length - 1];
    }
    /**
     * 'isJsonPointer' function
     *
     * Checks a string or array value to determine if it is a valid JSON Pointer.
     * Returns true if a string is empty, or starts with '/' or '#/'.
     * Returns true if an array contains only string values.
     *
     * //   value - value to check
     * // { boolean } - true if value is a valid JSON Pointer, otherwise false
     */
    static isJsonPointer(value) {
        if (isArray(value)) {
            return value.every(key => typeof key === 'string');
        }
        else if (isString(value)) {
            if (value === '' || value === '#') {
                return true;
            }
            if (value[0] === '/' || value.slice(0, 2) === '#/') {
                return !/(~[^01]|~$)/g.test(value);
            }
        }
        return false;
    }
    /**
     * 'isSubPointer' function
     *
     * Checks whether one JSON Pointer is a subset of another.
     *
     * //  { Pointer } shortPointer - potential subset JSON Pointer
     * //  { Pointer } longPointer - potential superset JSON Pointer
     * //  { boolean = false } trueIfMatching - return true if pointers match?
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { boolean } - true if shortPointer is a subset of longPointer, false if not
     */
    static isSubPointer(shortPointer, longPointer, trueIfMatching = false, errors = false) {
        if (!this.isJsonPointer(shortPointer) || !this.isJsonPointer(longPointer)) {
            if (errors) {
                let invalid = '';
                if (!this.isJsonPointer(shortPointer)) {
                    invalid += ` 1: ${shortPointer}`;
                }
                if (!this.isJsonPointer(longPointer)) {
                    invalid += ` 2: ${longPointer}`;
                }
                console.error(`isSubPointer error: Invalid JSON Pointer ${invalid}`);
            }
            return;
        }
        shortPointer = this.compile(shortPointer, '', errors);
        longPointer = this.compile(longPointer, '', errors);
        return shortPointer === longPointer ? trueIfMatching :
            `${shortPointer}/` === longPointer.slice(0, shortPointer.length + 1);
    }
    /**
     * 'toIndexedPointer' function
     *
     * Merges an array of numeric indexes and a generic pointer to create an
     * indexed pointer for a specific item.
     *
     * For example, merging the generic pointer '/foo/-/bar/-/baz' and
     * the array [4, 2] would result in the indexed pointer '/foo/4/bar/2/baz'
     *
     *
     * //  { Pointer } genericPointer - The generic pointer
     * //  { number[] } indexArray - The array of numeric indexes
     * //  { Map<string, number> } arrayMap - An optional array map
     * // { string } - The merged pointer with indexes
     */
    static toIndexedPointer(genericPointer, indexArray, arrayMap = null) {
        if (this.isJsonPointer(genericPointer) && isArray(indexArray)) {
            let indexedPointer = this.compile(genericPointer);
            if (isMap(arrayMap)) {
                let arrayIndex = 0;
                return indexedPointer.replace(/\/\-(?=\/|$)/g, (key, stringIndex) => arrayMap.has(indexedPointer.slice(0, stringIndex)) ?
                    '/' + indexArray[arrayIndex++] : key);
            }
            else {
                for (const pointerIndex of indexArray) {
                    indexedPointer = indexedPointer.replace('/-', '/' + pointerIndex);
                }
                return indexedPointer;
            }
        }
        if (!this.isJsonPointer(genericPointer)) {
            console.error(`toIndexedPointer error: Invalid JSON Pointer: ${genericPointer}`);
        }
        if (!isArray(indexArray)) {
            console.error(`toIndexedPointer error: Invalid indexArray: ${indexArray}`);
        }
    }
    /**
     * 'toGenericPointer' function
     *
     * Compares an indexed pointer to an array map and removes list array
     * indexes (but leaves tuple arrray indexes and all object keys, including
     * numeric keys) to create a generic pointer.
     *
     * For example, using the indexed pointer '/foo/1/bar/2/baz/3' and
     * the arrayMap [['/foo', 0], ['/foo/-/bar', 3], ['/foo/-/bar/-/baz', 0]]
     * would result in the generic pointer '/foo/-/bar/2/baz/-'
     * Using the indexed pointer '/foo/1/bar/4/baz/3' and the same arrayMap
     * would result in the generic pointer '/foo/-/bar/-/baz/-'
     * (the bar array has 3 tuple items, so index 2 is retained, but 4 is removed)
     *
     * The structure of the arrayMap is: [['path to array', number of tuple items]...]
     *
     *
     * //  { Pointer } indexedPointer - The indexed pointer (array or string)
     * //  { Map<string, number> } arrayMap - The optional array map (for preserving tuple indexes)
     * // { string } - The generic pointer with indexes removed
     */
    static toGenericPointer(indexedPointer, arrayMap = new Map()) {
        if (this.isJsonPointer(indexedPointer) && isMap(arrayMap)) {
            const pointerArray = this.parse(indexedPointer);
            for (let i = 1; i < pointerArray.length; i++) {
                const subPointer = this.compile(pointerArray.slice(0, i));
                if (arrayMap.has(subPointer) &&
                    arrayMap.get(subPointer) <= +pointerArray[i]) {
                    pointerArray[i] = '-';
                }
            }
            return this.compile(pointerArray);
        }
        if (!this.isJsonPointer(indexedPointer)) {
            console.error(`toGenericPointer error: invalid JSON Pointer: ${indexedPointer}`);
        }
        if (!isMap(arrayMap)) {
            console.error(`toGenericPointer error: invalid arrayMap: ${arrayMap}`);
        }
    }
    /**
     * 'toControlPointer' function
     *
     * Accepts a JSON Pointer for a data object and returns a JSON Pointer for the
     * matching control in an Angular FormGroup.
     *
     * //  { Pointer } dataPointer - JSON Pointer (string or array) to a data object
     * //  { FormGroup } formGroup - Angular FormGroup to get value from
     * //  { boolean = false } controlMustExist - Only return if control exists?
     * // { Pointer } - JSON Pointer (string) to the formGroup object
     */
    static toControlPointer(dataPointer, formGroup, controlMustExist = false) {
        const dataPointerArray = this.parse(dataPointer);
        const controlPointerArray = [];
        let subGroup = formGroup;
        if (dataPointerArray !== null) {
            for (const key of dataPointerArray) {
                if (hasOwn(subGroup, 'controls')) {
                    controlPointerArray.push('controls');
                    subGroup = subGroup.controls;
                }
                if (isArray(subGroup) && (key === '-')) {
                    controlPointerArray.push((subGroup.length - 1).toString());
                    subGroup = subGroup[subGroup.length - 1];
                }
                else if (hasOwn(subGroup, key)) {
                    controlPointerArray.push(key);
                    subGroup = subGroup[key];
                }
                else if (controlMustExist) {
                    console.error(`toControlPointer error: Unable to find "${key}" item in FormGroup.`);
                    console.error(dataPointer);
                    console.error(formGroup);
                    return;
                }
                else {
                    controlPointerArray.push(key);
                    subGroup = { controls: {} };
                }
            }
            return this.compile(controlPointerArray);
        }
        console.error(`toControlPointer error: Invalid JSON Pointer: ${dataPointer}`);
    }
    /**
     * 'toSchemaPointer' function
     *
     * Accepts a JSON Pointer to a value inside a data object and a JSON schema
     * for that object.
     *
     * Returns a Pointer to the sub-schema for the value inside the object's schema.
     *
     * //  { Pointer } dataPointer - JSON Pointer (string or array) to an object
     * //   schema - JSON schema for the object
     * // { Pointer } - JSON Pointer (string) to the object's schema
     */
    static toSchemaPointer(dataPointer, schema) {
        if (this.isJsonPointer(dataPointer) && typeof schema === 'object') {
            const pointerArray = this.parse(dataPointer);
            if (!pointerArray.length) {
                return '';
            }
            const firstKey = pointerArray.shift();
            if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
                if ((schema.properties || {})[firstKey]) {
                    return `/properties/${this.escape(firstKey)}` +
                        this.toSchemaPointer(pointerArray, schema.properties[firstKey]);
                }
                else if (schema.additionalProperties) {
                    return '/additionalProperties' +
                        this.toSchemaPointer(pointerArray, schema.additionalProperties);
                }
            }
            if ((schema.type === 'array' || schema.items) &&
                (isNumber(firstKey) || firstKey === '-' || firstKey === '')) {
                const arrayItem = firstKey === '-' || firstKey === '' ? 0 : +firstKey;
                if (isArray(schema.items)) {
                    if (arrayItem < schema.items.length) {
                        return '/items/' + arrayItem +
                            this.toSchemaPointer(pointerArray, schema.items[arrayItem]);
                    }
                    else if (schema.additionalItems) {
                        return '/additionalItems' +
                            this.toSchemaPointer(pointerArray, schema.additionalItems);
                    }
                }
                else if (isObject(schema.items)) {
                    return '/items' + this.toSchemaPointer(pointerArray, schema.items);
                }
                else if (isObject(schema.additionalItems)) {
                    return '/additionalItems' +
                        this.toSchemaPointer(pointerArray, schema.additionalItems);
                }
            }
            console.error(`toSchemaPointer error: Data pointer ${dataPointer} ` +
                `not compatible with schema ${schema}`);
            return null;
        }
        if (!this.isJsonPointer(dataPointer)) {
            console.error(`toSchemaPointer error: Invalid JSON Pointer: ${dataPointer}`);
        }
        if (typeof schema !== 'object') {
            console.error(`toSchemaPointer error: Invalid JSON Schema: ${schema}`);
        }
        return null;
    }
    /**
     * 'toDataPointer' function
     *
     * Accepts a JSON Pointer to a sub-schema inside a JSON schema and the schema.
     *
     * If possible, returns a generic Pointer to the corresponding value inside
     * the data object described by the JSON schema.
     *
     * Returns null if the sub-schema is in an ambiguous location (such as
     * definitions or additionalProperties) where the corresponding value
     * location cannot be determined.
     *
     * //  { Pointer } schemaPointer - JSON Pointer (string or array) to a JSON schema
     * //   schema - the JSON schema
     * //  { boolean = false } errors - Show errors?
     * // { Pointer } - JSON Pointer (string) to the value in the data object
     */
    static toDataPointer(schemaPointer, schema, errors = false) {
        if (this.isJsonPointer(schemaPointer) && typeof schema === 'object' &&
            this.has(schema, schemaPointer)) {
            const pointerArray = this.parse(schemaPointer);
            if (!pointerArray.length) {
                return '';
            }
            const firstKey = pointerArray.shift();
            if (firstKey === 'properties' ||
                (firstKey === 'items' && isArray(schema.items))) {
                const secondKey = pointerArray.shift();
                const pointerSuffix = this.toDataPointer(pointerArray, schema[firstKey][secondKey]);
                return pointerSuffix === null ? null : '/' + secondKey + pointerSuffix;
            }
            else if (firstKey === 'additionalItems' ||
                (firstKey === 'items' && isObject(schema.items))) {
                const pointerSuffix = this.toDataPointer(pointerArray, schema[firstKey]);
                return pointerSuffix === null ? null : '/-' + pointerSuffix;
            }
            else if (['allOf', 'anyOf', 'oneOf'].includes(firstKey)) {
                const secondKey = pointerArray.shift();
                return this.toDataPointer(pointerArray, schema[firstKey][secondKey]);
            }
            else if (firstKey === 'not') {
                return this.toDataPointer(pointerArray, schema[firstKey]);
            }
            else if (['contains', 'definitions', 'dependencies', 'additionalItems',
                'additionalProperties', 'patternProperties', 'propertyNames'].includes(firstKey)) {
                if (errors) {
                    console.error(`toDataPointer error: Ambiguous location`);
                }
            }
            return '';
        }
        if (errors) {
            if (!this.isJsonPointer(schemaPointer)) {
                console.error(`toDataPointer error: Invalid JSON Pointer: ${schemaPointer}`);
            }
            if (typeof schema !== 'object') {
                console.error(`toDataPointer error: Invalid JSON Schema: ${schema}`);
            }
            if (typeof schema !== 'object') {
                console.error(`toDataPointer error: Pointer ${schemaPointer} invalid for Schema: ${schema}`);
            }
        }
        return null;
    }
    /**
     * 'parseObjectPath' function
     *
     * Parses a JavaScript object path into an array of keys, which
     * can then be passed to compile() to convert into a string JSON Pointer.
     *
     * Based on mike-marcacci's excellent objectpath parse function:
     * https://github.com/mike-marcacci/objectpath
     *
     * //  { Pointer } path - The object path to parse
     * // { string[] } - The resulting array of keys
     */
    static parseObjectPath(path) {
        if (isArray(path)) {
            return path;
        }
        if (this.isJsonPointer(path)) {
            return this.parse(path);
        }
        if (typeof path === 'string') {
            let index = 0;
            const parts = [];
            while (index < path.length) {
                const nextDot = path.indexOf('.', index);
                const nextOB = path.indexOf('[', index); // next open bracket
                if (nextDot === -1 && nextOB === -1) { // last item
                    parts.push(path.slice(index));
                    index = path.length;
                }
                else if (nextDot !== -1 && (nextDot < nextOB || nextOB === -1)) { // dot notation
                    parts.push(path.slice(index, nextDot));
                    index = nextDot + 1;
                }
                else { // bracket notation
                    if (nextOB > index) {
                        parts.push(path.slice(index, nextOB));
                        index = nextOB;
                    }
                    const quote = path.charAt(nextOB + 1);
                    if (quote === '"' || quote === '\'') { // enclosing quotes
                        let nextCB = path.indexOf(quote + ']', nextOB); // next close bracket
                        while (nextCB !== -1 && path.charAt(nextCB - 1) === '\\') {
                            nextCB = path.indexOf(quote + ']', nextCB + 2);
                        }
                        if (nextCB === -1) {
                            nextCB = path.length;
                        }
                        parts.push(path.slice(index + 2, nextCB)
                            .replace(new RegExp('\\' + quote, 'g'), quote));
                        index = nextCB + 2;
                    }
                    else { // no enclosing quotes
                        let nextCB = path.indexOf(']', nextOB); // next close bracket
                        if (nextCB === -1) {
                            nextCB = path.length;
                        }
                        parts.push(path.slice(index + 1, nextCB));
                        index = nextCB + 1;
                    }
                    if (path.charAt(index) === '.') {
                        index++;
                    }
                }
            }
            return parts;
        }
        console.error('parseObjectPath error: Input object path must be a string.');
    }
}
JsonPointer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonPointer, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
JsonPointer.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonPointer });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonPointer, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnBvaW50ZXIuZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemFqc2YtY29yZS9zcmMvbGliL3NoYXJlZC9qc29ucG9pbnRlci5mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixJQUFJLEVBRUosaUJBQWlCLEVBQ2pCLDhCQUE4QixFQUM5QixNQUFNLEVBQ04sT0FBTyxFQUNQLFVBQVUsRUFDVixlQUFlLEVBQ2hCLE1BQU0scUJBQXFCLENBQUM7QUFDN0IsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0FBbUJ2RyxNQUFNLE9BQU8sV0FBVztJQUV0Qjs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxNQUFNLENBQUMsR0FBRyxDQUNSLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxHQUFHLENBQUMsRUFBRSxXQUFtQixJQUFJLEVBQ3hELFVBQVUsR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUs7UUFFbEMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQUUsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1NBQUU7UUFDL0QsSUFBSSxRQUFRLEdBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEQsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNuRCxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFDdkIsSUFBSSxVQUFVLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxRQUFR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R0FuOUJVLFdBQVc7NEdBQVgsV0FBVzsyRkFBWCxXQUFXO2tCQUR2QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgY2xlYW5WYWx1ZU9mUXVvdGVzLFxuICBjb3B5LFxuICBFeHByZXNzaW9uVHlwZSxcbiAgZ2V0RXhwcmVzc2lvblR5cGUsXG4gIGdldEtleUFuZFZhbHVlQnlFeHByZXNzaW9uVHlwZSxcbiAgaGFzT3duLFxuICBpc0VxdWFsLFxuICBpc05vdEVxdWFsLFxuICBpc05vdEV4cHJlc3Npb25cbn0gZnJvbSAnLi91dGlsaXR5LmZ1bmN0aW9ucyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtpc0FycmF5LCBpc0RlZmluZWQsIGlzRW1wdHksIGlzTWFwLCBpc051bWJlciwgaXNPYmplY3QsIGlzU3RyaW5nfSBmcm9tICcuL3ZhbGlkYXRvci5mdW5jdGlvbnMnO1xuXG4vKipcbiAqICdKc29uUG9pbnRlcicgY2xhc3NcbiAqXG4gKiBTb21lIHV0aWxpdGllcyBmb3IgdXNpbmcgSlNPTiBQb2ludGVycyB3aXRoIEpTT04gb2JqZWN0c1xuICogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzY5MDFcbiAqXG4gKiBnZXQsIGdldENvcHksIGdldEZpcnN0LCBzZXQsIHNldENvcHksIGluc2VydCwgaW5zZXJ0Q29weSwgcmVtb3ZlLCBoYXMsIGRpY3QsXG4gKiBmb3JFYWNoRGVlcCwgZm9yRWFjaERlZXBDb3B5LCBlc2NhcGUsIHVuZXNjYXBlLCBwYXJzZSwgY29tcGlsZSwgdG9LZXksXG4gKiBpc0pzb25Qb2ludGVyLCBpc1N1YlBvaW50ZXIsIHRvSW5kZXhlZFBvaW50ZXIsIHRvR2VuZXJpY1BvaW50ZXIsXG4gKiB0b0NvbnRyb2xQb2ludGVyLCB0b1NjaGVtYVBvaW50ZXIsIHRvRGF0YVBvaW50ZXIsIHBhcnNlT2JqZWN0UGF0aFxuICpcbiAqIFNvbWUgZnVuY3Rpb25zIGJhc2VkIG9uIG1hbnVlbHN0b2ZlcidzIGpzb24tcG9pbnRlciB1dGlsaXRpZXNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tYW51ZWxzdG9mZXIvanNvbi1wb2ludGVyXG4gKi9cbmV4cG9ydCB0eXBlIFBvaW50ZXIgPSBzdHJpbmcgfCBzdHJpbmdbXTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25Qb2ludGVyIHtcblxuICAvKipcbiAgICogJ2dldCcgZnVuY3Rpb25cbiAgICpcbiAgICogVXNlcyBhIEpTT04gUG9pbnRlciB0byByZXRyaWV2ZSBhIHZhbHVlIGZyb20gYW4gb2JqZWN0LlxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSBPYmplY3QgdG8gZ2V0IHZhbHVlIGZyb21cbiAgICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8gIHsgbnVtYmVyID0gMCB9IHN0YXJ0U2xpY2UgLSBaZXJvLWJhc2VkIGluZGV4IG9mIGZpcnN0IFBvaW50ZXIga2V5IHRvIHVzZVxuICAgKiAvLyAgeyBudW1iZXIgfSBlbmRTbGljZSAtIFplcm8tYmFzZWQgaW5kZXggb2YgbGFzdCBQb2ludGVyIGtleSB0byB1c2VcbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZ2V0Qm9vbGVhbiAtIFJldHVybiBvbmx5IHRydWUgb3IgZmFsc2U/XG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGVycm9ycyAtIFNob3cgZXJyb3IgaWYgbm90IGZvdW5kP1xuICAgKiAvLyB7IG9iamVjdCB9IC0gTG9jYXRlZCB2YWx1ZSAob3IgdHJ1ZSBvciBmYWxzZSBpZiBnZXRCb29sZWFuID0gdHJ1ZSlcbiAgICovXG4gIHN0YXRpYyBnZXQoXG4gICAgb2JqZWN0LCBwb2ludGVyLCBzdGFydFNsaWNlID0gMCwgZW5kU2xpY2U6IG51bWJlciA9IG51bGwsXG4gICAgZ2V0Qm9vbGVhbiA9IGZhbHNlLCBlcnJvcnMgPSBmYWxzZVxuICApIHtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSB7IHJldHVybiBnZXRCb29sZWFuID8gZmFsc2UgOiB1bmRlZmluZWQ7IH1cbiAgICBsZXQga2V5QXJyYXk6IGFueVtdID0gdGhpcy5wYXJzZShwb2ludGVyLCBlcnJvcnMpO1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBrZXlBcnJheSAhPT0gbnVsbCkge1xuICAgICAgbGV0IHN1Yk9iamVjdCA9IG9iamVjdDtcbiAgICAgIGlmIChzdGFydFNsaWNlID49IGtleUFycmF5Lmxlbmd0aCB8fCBlbmRTbGljZSA8PSAta2V5QXJyYXkubGVuZ3RoKSB7IHJldHVybiBvYmplY3Q7IH1cbiAgICAgIGlmIChzdGFydFNsaWNlIDw9IC1rZXlBcnJheS5sZW5ndGgpIHsgc3RhcnRTbGljZSA9IDA7IH1cbiAgICAgIGlmICghaXNEZWZpbmVkKGVuZFNsaWNlKSB8fCBlbmRTbGljZSA+PSBrZXlBcnJheS5sZW5ndGgpIHsgZW5kU2xpY2UgPSBrZXlBcnJheS5sZW5ndGg7IH1cbiAgICAgIGtleUFycmF5ID0ga2V5QXJyYXkuc2xpY2Uoc3RhcnRTbGljZSwgZW5kU2xpY2UpO1xuICAgICAgZm9yIChsZXQga2V5IG9mIGtleUFycmF5KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICctJyAmJiBpc0FycmF5KHN1Yk9iamVjdCkgJiYgc3ViT2JqZWN0Lmxlbmd0aCkge1xuICAgICAgICAgIGtleSA9IHN1Yk9iamVjdC5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc01hcChzdWJPYmplY3QpICYmIHN1Yk9iamVjdC5oYXMoa2V5KSkge1xuICAgICAgICAgIHN1Yk9iamVjdCA9IHN1Yk9iamVjdC5nZXQoa2V5KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3ViT2JqZWN0ID09PSAnb2JqZWN0JyAmJiBzdWJPYmplY3QgIT09IG51bGwgJiZcbiAgICAgICAgICBoYXNPd24oc3ViT2JqZWN0LCBrZXkpXG4gICAgICAgICkge1xuICAgICAgICAgIHN1Yk9iamVjdCA9IHN1Yk9iamVjdFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGV2YWx1YXRlZEV4cHJlc3Npb24gPSBKc29uUG9pbnRlci5ldmFsdWF0ZUV4cHJlc3Npb24oc3ViT2JqZWN0LCBrZXkpO1xuICAgICAgICAgIGlmIChldmFsdWF0ZWRFeHByZXNzaW9uLnBhc3NlZCkge1xuICAgICAgICAgICAgc3ViT2JqZWN0ID0gZXZhbHVhdGVkRXhwcmVzc2lvbi5rZXkgPyBzdWJPYmplY3RbZXZhbHVhdGVkRXhwcmVzc2lvbi5rZXldIDogc3ViT2JqZWN0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZ0Vycm9ycyhlcnJvcnMsIGtleSwgcG9pbnRlciwgb2JqZWN0KTtcbiAgICAgICAgICAgIHJldHVybiBnZXRCb29sZWFuID8gZmFsc2UgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZ2V0Qm9vbGVhbiA/IHRydWUgOiBzdWJPYmplY3Q7XG4gICAgfVxuICAgIGlmIChlcnJvcnMgJiYga2V5QXJyYXkgPT09IG51bGwpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldCBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXI6ICR7cG9pbnRlcn1gKTtcbiAgICB9XG4gICAgaWYgKGVycm9ycyAmJiB0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29uc29sZS5lcnJvcignZ2V0IGVycm9yOiBJbnZhbGlkIG9iamVjdDonKTtcbiAgICAgIGNvbnNvbGUuZXJyb3Iob2JqZWN0KTtcbiAgICB9XG4gICAgcmV0dXJuIGdldEJvb2xlYW4gPyBmYWxzZSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIGxvZ0Vycm9ycyhlcnJvcnMsIGtleSwgcG9pbnRlciwgb2JqZWN0KSB7XG4gICAgaWYgKGVycm9ycykge1xuICAgICAgY29uc29sZS5lcnJvcihgZ2V0IGVycm9yOiBcIiR7a2V5fVwiIGtleSBub3QgZm91bmQgaW4gb2JqZWN0LmApO1xuICAgICAgY29uc29sZS5lcnJvcihwb2ludGVyKTtcbiAgICAgIGNvbnNvbGUuZXJyb3Iob2JqZWN0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGVzIGNvbmRpdGlvbmFsIGV4cHJlc3Npb24gaW4gZm9ybSBvZiBgbW9kZWwuPHByb3BlcnR5Pj09PHZhbHVlPmAgb3JcbiAgICogYG1vZGVsLjxwcm9wZXJ0eT4hPTx2YWx1ZT5gIHdoZXJlIHRoZSBmaXJzdCBvbmUgbWVhbnMgdGhhdCB0aGUgdmFsdWUgbXVzdCBtYXRjaCB0byBiZVxuICAgKiBzaG93biBpbiBhIGZvcm0sIHdoaWxlIHRoZSBmb3JtZXIgc2hvd3MgdGhlIHByb3BlcnR5IG9ubHkgd2hlbiB0aGUgcHJvcGVydHkgdmFsdWUgaXMgbm90XG4gICAqIHNldCwgb3IgZG9lcyBub3QgZXF1YWwgdGhlIGdpdmVuIHZhbHVlLlxuICAgKlxuICAgKiAvLyB7IHN1Yk9iamVjdCB9IHN1Yk9iamVjdCAtICBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgZGF0YSB2YWx1ZXMgb2YgcHJvcGVydGllc1xuICAgKiAvLyB7IGtleSB9IGtleSAtIHRoZSBrZXkgZnJvbSB0aGUgZm9yIGxvb3AgaW4gYSBmb3JtIG9mIGA8cHJvcGVydHk+PT08dmFsdWU+YFxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSBvYmplY3Qgd2l0aCB0d28gcHJvcGVydGllcy4gVGhlIHByb3BlcnR5IHBhc3NlZCBpbmZvcm1zIHdoZXRoZXJcbiAgICogdGhlIGV4cHJlc3Npb24gZXZhbHVhdGVkIHN1Y2Nlc3NmdWxseSBhbmQgdGhlIHByb3BlcnR5IGtleSByZXR1cm5zIGVpdGhlciB0aGUgc2FtZVxuICAgKiBrZXkgaWYgaXQgaXMgbm90IGNvbnRhaW5lZCBpbnNpZGUgdGhlIHN1Yk9iamVjdCBvciB0aGUga2V5IG9mIHRoZSBwcm9wZXJ0eSBpZiBpdCBpcyBjb250YWluZWQuXG4gICAqL1xuICBzdGF0aWMgZXZhbHVhdGVFeHByZXNzaW9uKHN1Yk9iamVjdDogT2JqZWN0LCBrZXk6IGFueSkge1xuICAgIGNvbnN0IGRlZmF1bHRSZXN1bHQgPSB7cGFzc2VkOiBmYWxzZSwga2V5OiBrZXl9O1xuICAgIGNvbnN0IGtleXNBbmRFeHByZXNzaW9uID0gdGhpcy5wYXJzZUtleXNBbmRFeHByZXNzaW9uKGtleSwgc3ViT2JqZWN0KTtcbiAgICBpZiAoIWtleXNBbmRFeHByZXNzaW9uKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdFJlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zdCBvd25DaGVja1Jlc3VsdCA9IHRoaXMuZG9Pd25DaGVja1Jlc3VsdChzdWJPYmplY3QsIGtleXNBbmRFeHByZXNzaW9uKTtcbiAgICBpZiAob3duQ2hlY2tSZXN1bHQpIHtcbiAgICAgIHJldHVybiBvd25DaGVja1Jlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zdCBjbGVhbmVkVmFsdWUgPSBjbGVhblZhbHVlT2ZRdW90ZXMoa2V5c0FuZEV4cHJlc3Npb24ua2V5QW5kVmFsdWVbMV0pO1xuXG4gICAgY29uc3QgZXZhbHVhdGVkUmVzdWx0ID0gdGhpcy5wZXJmb3JtRXhwcmVzc2lvbk9uVmFsdWUoa2V5c0FuZEV4cHJlc3Npb24sIGNsZWFuZWRWYWx1ZSwgc3ViT2JqZWN0KTtcbiAgICBpZiAoZXZhbHVhdGVkUmVzdWx0KSB7XG4gICAgICByZXR1cm4gZXZhbHVhdGVkUmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiBkZWZhdWx0UmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgZXZhbHVhdGlvbiBvbiB0aGUgZ2l2ZW4gZXhwcmVzc2lvbiB3aXRoIGdpdmVuIHZhbHVlcyBhbmQga2V5cy5cbiAgICogLy8geyBjbGVhbmVkVmFsdWUgfSBjbGVhbmVkVmFsdWUgLSB0aGUgZ2l2ZW4gdmFsdWVkIGNsZWFuZWQgb2YgcXVvdGVzIGlmIGl0IGhhZCBhbnlcbiAgICogLy8geyBzdWJPYmplY3QgfSBzdWJPYmplY3QgLSB0aGUgb2JqZWN0IHdpdGggcHJvcGVydGllcyB2YWx1ZXNcbiAgICogLy8geyBrZXlzQW5kRXhwcmVzc2lvbiB9IGtleXNBbmRFeHByZXNzaW9uIC0gYW4gb2JqZWN0IGhvbGRpbmcgdGhlIGV4cHJlc3Npb25zIHdpdGhcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHBlcmZvcm1FeHByZXNzaW9uT25WYWx1ZShrZXlzQW5kRXhwcmVzc2lvbjogYW55LCBjbGVhbmVkVmFsdWU6IFN0cmluZywgc3ViT2JqZWN0OiBPYmplY3QpIHtcbiAgICBjb25zdCBwcm9wZXJ0eUJ5S2V5ID0gc3ViT2JqZWN0W2tleXNBbmRFeHByZXNzaW9uLmtleUFuZFZhbHVlWzBdXTtcbiAgICBpZiAodGhpcy5kb0NvbXBhcmlzb25CeUV4cHJlc3Npb25UeXBlKGtleXNBbmRFeHByZXNzaW9uLmV4cHJlc3Npb25UeXBlLCBwcm9wZXJ0eUJ5S2V5LCBjbGVhbmVkVmFsdWUpKSB7XG4gICAgICByZXR1cm4ge3Bhc3NlZDogdHJ1ZSwga2V5OiBrZXlzQW5kRXhwcmVzc2lvbi5rZXlBbmRWYWx1ZVswXX07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBkb0NvbXBhcmlzb25CeUV4cHJlc3Npb25UeXBlKGV4cHJlc3Npb25UeXBlOiBFeHByZXNzaW9uVHlwZSwgcHJvcGVydHlCeUtleSwgY2xlYW5lZFZhbHVlOiBTdHJpbmcpOiBCb29sZWFuIHtcbiAgICBpZiAoaXNFcXVhbChleHByZXNzaW9uVHlwZSkpIHtcbiAgICAgIHJldHVybiBwcm9wZXJ0eUJ5S2V5ID09PSBjbGVhbmVkVmFsdWU7XG4gICAgfVxuICAgIGlmIChpc05vdEVxdWFsKGV4cHJlc3Npb25UeXBlKSkge1xuICAgICAgcmV0dXJuIHByb3BlcnR5QnlLZXkgIT09IGNsZWFuZWRWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIERvZXMgdGhlIGNoZWNrcyB3aGVuIHRoZSBwYXJzZWQga2V5IGlzIGFjdHVhbGx5IG5vIGEgcHJvcGVydHkgaW5zaWRlIHN1Yk9iamVjdC5cbiAgICogVGhhdCB3b3VsZCBtZWFuIHRoYXQgdGhlIGVxdWFsIGNvbXBhcmlzb24gbWFrZXMgbm8gc2Vuc2UgYW5kIHRodXMgdGhlIG5lZ2F0aXZlIHJlc3VsdFxuICAgKiBpcyByZXR1cm5lZCwgYW5kIHRoZSBub3QgZXF1YWwgY29tcGFyaXNvbiBpcyBub3QgbmVjZXNzYXJ5IGJlY2F1c2UgaXQgZG9lc24ndCBlcXVhbFxuICAgKiBvYnZpb3VzbHkuIFJldHVybnMgbnVsbCB3aGVuIHRoZSBnaXZlbiBrZXkgaXMgYSByZWFsIHByb3BlcnR5IGluc2lkZSB0aGUgc3ViT2JqZWN0LlxuICAgKiAvLyB7IHN1Yk9iamVjdCB9IHN1Yk9iamVjdCAtIHRoZSBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIHZhbHVlc1xuICAgKiAvLyB7IGtleXNBbmRFeHByZXNzaW9uIH0ga2V5c0FuZEV4cHJlc3Npb24gLSBhbiBvYmplY3QgaG9sZGluZyB0aGUgZXhwcmVzc2lvbnMgd2l0aFxuICAgKiB0aGUgYXNzb2NpYXRlZCBrZXlzLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZG9Pd25DaGVja1Jlc3VsdChzdWJPYmplY3Q6IE9iamVjdCwga2V5c0FuZEV4cHJlc3Npb24pIHtcbiAgICBsZXQgb3duQ2hlY2tSZXN1bHQgPSBudWxsO1xuICAgIGlmICghaGFzT3duKHN1Yk9iamVjdCwga2V5c0FuZEV4cHJlc3Npb24ua2V5QW5kVmFsdWVbMF0pKSB7XG4gICAgICBpZiAoaXNFcXVhbChrZXlzQW5kRXhwcmVzc2lvbi5leHByZXNzaW9uVHlwZSkpIHtcbiAgICAgICAgb3duQ2hlY2tSZXN1bHQgPSB7cGFzc2VkOiBmYWxzZSwga2V5OiBudWxsfTtcbiAgICAgIH1cbiAgICAgIGlmIChpc05vdEVxdWFsKGtleXNBbmRFeHByZXNzaW9uLmV4cHJlc3Npb25UeXBlKSkge1xuICAgICAgICBvd25DaGVja1Jlc3VsdCA9IHtwYXNzZWQ6IHRydWUsIGtleTogbnVsbH07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvd25DaGVja1Jlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb2VzIHRoZSBiYXNpYyBjaGVja3MgYW5kIHRyaWVzIHRvIHBhcnNlIGFuIGV4cHJlc3Npb24gYW5kIGEgcGFpclxuICAgKiBvZiBrZXkgYW5kIHZhbHVlLlxuICAgKiAvLyB7IGtleSB9IGtleSAtIHRoZSBvcmlnaW5hbCBmb3IgbG9vcCBjcmVhdGVkIHZhbHVlIGNvbnRhaW5pbmcga2V5IGFuZCB2YWx1ZSBpbiBvbmUgc3RyaW5nXG4gICAqIC8vIHsgc3ViT2JqZWN0IH0gc3ViT2JqZWN0IC0gdGhlIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdmFsdWVzXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBwYXJzZUtleXNBbmRFeHByZXNzaW9uKGtleTogc3RyaW5nLCBzdWJPYmplY3QpIHtcbiAgICBpZiAodGhpcy5rZXlPclN1Yk9iakVtcHR5KGtleSwgc3ViT2JqZWN0KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGV4cHJlc3Npb25UeXBlID0gZ2V0RXhwcmVzc2lvblR5cGUoa2V5LnRvU3RyaW5nKCkpO1xuICAgIGlmIChpc05vdEV4cHJlc3Npb24oZXhwcmVzc2lvblR5cGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qga2V5QW5kVmFsdWUgPSBnZXRLZXlBbmRWYWx1ZUJ5RXhwcmVzc2lvblR5cGUoZXhwcmVzc2lvblR5cGUsIGtleSk7XG4gICAgaWYgKCFrZXlBbmRWYWx1ZSB8fCAha2V5QW5kVmFsdWVbMF0gfHwgIWtleUFuZFZhbHVlWzFdKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtleHByZXNzaW9uVHlwZTogZXhwcmVzc2lvblR5cGUsIGtleUFuZFZhbHVlOiBrZXlBbmRWYWx1ZX07XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBrZXlPclN1Yk9iakVtcHR5KGtleTogYW55LCBzdWJPYmplY3Q6IE9iamVjdCkge1xuICAgIHJldHVybiAha2V5IHx8ICFzdWJPYmplY3Q7XG4gIH1cblxuICAvKipcbiAgICogJ2dldENvcHknIGZ1bmN0aW9uXG4gICAqXG4gICAqIFVzZXMgYSBKU09OIFBvaW50ZXIgdG8gZGVlcGx5IGNsb25lIGEgdmFsdWUgZnJvbSBhbiBvYmplY3QuXG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIE9iamVjdCB0byBnZXQgdmFsdWUgZnJvbVxuICAgKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICAgKiAvLyAgeyBudW1iZXIgPSAwIH0gc3RhcnRTbGljZSAtIFplcm8tYmFzZWQgaW5kZXggb2YgZmlyc3QgUG9pbnRlciBrZXkgdG8gdXNlXG4gICAqIC8vICB7IG51bWJlciB9IGVuZFNsaWNlIC0gWmVyby1iYXNlZCBpbmRleCBvZiBsYXN0IFBvaW50ZXIga2V5IHRvIHVzZVxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBnZXRCb29sZWFuIC0gUmV0dXJuIG9ubHkgdHJ1ZSBvciBmYWxzZT9cbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZXJyb3JzIC0gU2hvdyBlcnJvciBpZiBub3QgZm91bmQ/XG4gICAqIC8vIHsgb2JqZWN0IH0gLSBMb2NhdGVkIHZhbHVlIChvciB0cnVlIG9yIGZhbHNlIGlmIGdldEJvb2xlYW4gPSB0cnVlKVxuICAgKi9cbiAgc3RhdGljIGdldENvcHkoXG4gICAgb2JqZWN0LCBwb2ludGVyLCBzdGFydFNsaWNlID0gMCwgZW5kU2xpY2U6IG51bWJlciA9IG51bGwsXG4gICAgZ2V0Qm9vbGVhbiA9IGZhbHNlLCBlcnJvcnMgPSBmYWxzZVxuICApIHtcbiAgICBjb25zdCBvYmplY3RUb0NvcHkgPVxuICAgICAgdGhpcy5nZXQob2JqZWN0LCBwb2ludGVyLCBzdGFydFNsaWNlLCBlbmRTbGljZSwgZ2V0Qm9vbGVhbiwgZXJyb3JzKTtcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoRGVlcENvcHkob2JqZWN0VG9Db3B5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnZ2V0Rmlyc3QnIGZ1bmN0aW9uXG4gICAqXG4gICAqIFRha2VzIGFuIGFycmF5IG9mIEpTT04gUG9pbnRlcnMgYW5kIG9iamVjdHMsXG4gICAqIGNoZWNrcyBlYWNoIG9iamVjdCBmb3IgYSB2YWx1ZSBzcGVjaWZpZWQgYnkgdGhlIHBvaW50ZXIsXG4gICAqIGFuZCByZXR1cm5zIHRoZSBmaXJzdCB2YWx1ZSBmb3VuZC5cbiAgICpcbiAgICogLy8gIHsgW29iamVjdCwgcG9pbnRlcl1bXSB9IGl0ZW1zIC0gQXJyYXkgb2Ygb2JqZWN0cyBhbmQgcG9pbnRlcnMgdG8gY2hlY2tcbiAgICogLy8gIHsgYW55ID0gbnVsbCB9IGRlZmF1bHRWYWx1ZSAtIFZhbHVlIHRvIHJldHVybiBpZiBub3RoaW5nIGZvdW5kXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGdldENvcHkgLSBSZXR1cm4gYSBjb3B5IGluc3RlYWQ/XG4gICAqIC8vICAtIEZpcnN0IHZhbHVlIGZvdW5kXG4gICAqL1xuICBzdGF0aWMgZ2V0Rmlyc3QoaXRlbXMsIGRlZmF1bHRWYWx1ZTogYW55ID0gbnVsbCwgZ2V0Q29weSA9IGZhbHNlKSB7XG4gICAgaWYgKGlzRW1wdHkoaXRlbXMpKSB7IHJldHVybjsgfVxuICAgIGlmIChpc0FycmF5KGl0ZW1zKSkge1xuICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChpc0VtcHR5KGl0ZW0pKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgIGlmIChpc0FycmF5KGl0ZW0pICYmIGl0ZW0ubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICBpZiAoaXNFbXB0eShpdGVtWzBdKSB8fCBpc0VtcHR5KGl0ZW1bMV0pKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRDb3B5ID9cbiAgICAgICAgICAgIHRoaXMuZ2V0Q29weShpdGVtWzBdLCBpdGVtWzFdKSA6XG4gICAgICAgICAgICB0aGlzLmdldChpdGVtWzBdLCBpdGVtWzFdKTtcbiAgICAgICAgICBpZiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5lcnJvcignZ2V0Rmlyc3QgZXJyb3I6IElucHV0IG5vdCBpbiBjb3JyZWN0IGZvcm1hdC5cXG4nICtcbiAgICAgICAgICAnU2hvdWxkIGJlOiBbIFsgb2JqZWN0MSwgcG9pbnRlcjEgXSwgWyBvYmplY3QgMiwgcG9pbnRlcjIgXSwgZXRjLi4uIF0nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzTWFwKGl0ZW1zKSkge1xuICAgICAgZm9yIChjb25zdCBbb2JqZWN0LCBwb2ludGVyXSBvZiBpdGVtcykge1xuICAgICAgICBpZiAob2JqZWN0ID09PSBudWxsIHx8ICF0aGlzLmlzSnNvblBvaW50ZXIocG9pbnRlcikpIHsgY29udGludWU7IH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRDb3B5ID9cbiAgICAgICAgICB0aGlzLmdldENvcHkob2JqZWN0LCBwb2ludGVyKSA6XG4gICAgICAgICAgdGhpcy5nZXQob2JqZWN0LCBwb2ludGVyKTtcbiAgICAgICAgaWYgKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgY29uc29sZS5lcnJvcignZ2V0Rmlyc3QgZXJyb3I6IElucHV0IG5vdCBpbiBjb3JyZWN0IGZvcm1hdC5cXG4nICtcbiAgICAgICdTaG91bGQgYmU6IFsgWyBvYmplY3QxLCBwb2ludGVyMSBdLCBbIG9iamVjdCAyLCBwb2ludGVyMiBdLCBldGMuLi4gXScpO1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogJ2dldEZpcnN0Q29weScgZnVuY3Rpb25cbiAgICpcbiAgICogU2ltaWxhciB0byBnZXRGaXJzdCwgYnV0IGFsd2F5cyByZXR1cm5zIGEgY29weS5cbiAgICpcbiAgICogLy8gIHsgW29iamVjdCwgcG9pbnRlcl1bXSB9IGl0ZW1zIC0gQXJyYXkgb2Ygb2JqZWN0cyBhbmQgcG9pbnRlcnMgdG8gY2hlY2tcbiAgICogLy8gIHsgYW55ID0gbnVsbCB9IGRlZmF1bHRWYWx1ZSAtIFZhbHVlIHRvIHJldHVybiBpZiBub3RoaW5nIGZvdW5kXG4gICAqIC8vICAtIENvcHkgb2YgZmlyc3QgdmFsdWUgZm91bmRcbiAgICovXG4gIHN0YXRpYyBnZXRGaXJzdENvcHkoaXRlbXMsIGRlZmF1bHRWYWx1ZTogYW55ID0gbnVsbCkge1xuICAgIGNvbnN0IGZpcnN0Q29weSA9IHRoaXMuZ2V0Rmlyc3QoaXRlbXMsIGRlZmF1bHRWYWx1ZSwgdHJ1ZSk7XG4gICAgcmV0dXJuIGZpcnN0Q29weTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnc2V0JyBmdW5jdGlvblxuICAgKlxuICAgKiBVc2VzIGEgSlNPTiBQb2ludGVyIHRvIHNldCBhIHZhbHVlIG9uIGFuIG9iamVjdC5cbiAgICogQWxzbyBjcmVhdGVzIGFueSBtaXNzaW5nIHN1YiBvYmplY3RzIG9yIGFycmF5cyB0byBjb250YWluIHRoYXQgdmFsdWUuXG4gICAqXG4gICAqIElmIHRoZSBvcHRpb25hbCBmb3VydGggcGFyYW1ldGVyIGlzIFRSVUUgYW5kIHRoZSBpbm5lci1tb3N0IGNvbnRhaW5lclxuICAgKiBpcyBhbiBhcnJheSwgdGhlIGZ1bmN0aW9uIHdpbGwgaW5zZXJ0IHRoZSB2YWx1ZSBhcyBhIG5ldyBpdGVtIGF0IHRoZVxuICAgKiBzcGVjaWZpZWQgbG9jYXRpb24gaW4gdGhlIGFycmF5LCByYXRoZXIgdGhhbiBvdmVyd3JpdGluZyB0aGUgZXhpc3RpbmdcbiAgICogdmFsdWUgKGlmIGFueSkgYXQgdGhhdCBsb2NhdGlvbi5cbiAgICpcbiAgICogU28gc2V0KFsxLCAyLCAzXSwgJy8xJywgNCkgPT4gWzEsIDQsIDNdXG4gICAqIGFuZFxuICAgKiBTbyBzZXQoWzEsIDIsIDNdLCAnLzEnLCA0LCB0cnVlKSA9PiBbMSwgNCwgMiwgM11cbiAgICpcbiAgICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBzZXQgdmFsdWUgaW5cbiAgICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLSBUaGUgSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vICAgdmFsdWUgLSBUaGUgbmV3IHZhbHVlIHRvIHNldFxuICAgKiAvLyAgeyBib29sZWFuIH0gaW5zZXJ0IC0gaW5zZXJ0IHZhbHVlP1xuICAgKiAvLyB7IG9iamVjdCB9IC0gVGhlIG9yaWdpbmFsIG9iamVjdCwgbW9kaWZpZWQgd2l0aCB0aGUgc2V0IHZhbHVlXG4gICAqL1xuICBzdGF0aWMgc2V0KG9iamVjdCwgcG9pbnRlciwgdmFsdWUsIGluc2VydCA9IGZhbHNlKSB7XG4gICAgY29uc3Qga2V5QXJyYXkgPSB0aGlzLnBhcnNlKHBvaW50ZXIpO1xuICAgIGlmIChrZXlBcnJheSAhPT0gbnVsbCAmJiBrZXlBcnJheS5sZW5ndGgpIHtcbiAgICAgIGxldCBzdWJPYmplY3QgPSBvYmplY3Q7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUFycmF5Lmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgICBsZXQga2V5ID0ga2V5QXJyYXlbaV07XG4gICAgICAgIGlmIChrZXkgPT09ICctJyAmJiBpc0FycmF5KHN1Yk9iamVjdCkpIHtcbiAgICAgICAgICBrZXkgPSBzdWJPYmplY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc01hcChzdWJPYmplY3QpICYmIHN1Yk9iamVjdC5oYXMoa2V5KSkge1xuICAgICAgICAgIHN1Yk9iamVjdCA9IHN1Yk9iamVjdC5nZXQoa2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIWhhc093bihzdWJPYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgIHN1Yk9iamVjdFtrZXldID0gKGtleUFycmF5W2kgKyAxXS5tYXRjaCgvXihcXGQrfC0pJC8pKSA/IFtdIDoge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1Yk9iamVjdCA9IHN1Yk9iamVjdFtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBsYXN0S2V5ID0ga2V5QXJyYXlba2V5QXJyYXkubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoaXNBcnJheShzdWJPYmplY3QpICYmIGxhc3RLZXkgPT09ICctJykge1xuICAgICAgICBzdWJPYmplY3QucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGluc2VydCAmJiBpc0FycmF5KHN1Yk9iamVjdCkgJiYgIWlzTmFOKCtsYXN0S2V5KSkge1xuICAgICAgICBzdWJPYmplY3Quc3BsaWNlKGxhc3RLZXksIDAsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNNYXAoc3ViT2JqZWN0KSkge1xuICAgICAgICBzdWJPYmplY3Quc2V0KGxhc3RLZXksIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1Yk9iamVjdFtsYXN0S2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG4gICAgY29uc29sZS5lcnJvcihgc2V0IGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtwb2ludGVyfWApO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICAvKipcbiAgICogJ3NldENvcHknIGZ1bmN0aW9uXG4gICAqXG4gICAqIENvcGllcyBhbiBvYmplY3QgYW5kIHVzZXMgYSBKU09OIFBvaW50ZXIgdG8gc2V0IGEgdmFsdWUgb24gdGhlIGNvcHkuXG4gICAqIEFsc28gY3JlYXRlcyBhbnkgbWlzc2luZyBzdWIgb2JqZWN0cyBvciBhcnJheXMgdG8gY29udGFpbiB0aGF0IHZhbHVlLlxuICAgKlxuICAgKiBJZiB0aGUgb3B0aW9uYWwgZm91cnRoIHBhcmFtZXRlciBpcyBUUlVFIGFuZCB0aGUgaW5uZXItbW9zdCBjb250YWluZXJcbiAgICogaXMgYW4gYXJyYXksIHRoZSBmdW5jdGlvbiB3aWxsIGluc2VydCB0aGUgdmFsdWUgYXMgYSBuZXcgaXRlbSBhdCB0aGVcbiAgICogc3BlY2lmaWVkIGxvY2F0aW9uIGluIHRoZSBhcnJheSwgcmF0aGVyIHRoYW4gb3ZlcndyaXRpbmcgdGhlIGV4aXN0aW5nIHZhbHVlLlxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGNvcHkgYW5kIHNldCB2YWx1ZSBpblxuICAgKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtIFRoZSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8gICB2YWx1ZSAtIFRoZSB2YWx1ZSB0byBzZXRcbiAgICogLy8gIHsgYm9vbGVhbiB9IGluc2VydCAtIGluc2VydCB2YWx1ZT9cbiAgICogLy8geyBvYmplY3QgfSAtIFRoZSBuZXcgb2JqZWN0IHdpdGggdGhlIHNldCB2YWx1ZVxuICAgKi9cbiAgc3RhdGljIHNldENvcHkob2JqZWN0LCBwb2ludGVyLCB2YWx1ZSwgaW5zZXJ0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBrZXlBcnJheSA9IHRoaXMucGFyc2UocG9pbnRlcik7XG4gICAgaWYgKGtleUFycmF5ICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBuZXdPYmplY3QgPSBjb3B5KG9iamVjdCk7XG4gICAgICBsZXQgc3ViT2JqZWN0ID0gbmV3T2JqZWN0O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlBcnJheS5sZW5ndGggLSAxOyArK2kpIHtcbiAgICAgICAgbGV0IGtleSA9IGtleUFycmF5W2ldO1xuICAgICAgICBpZiAoa2V5ID09PSAnLScgJiYgaXNBcnJheShzdWJPYmplY3QpKSB7XG4gICAgICAgICAga2V5ID0gc3ViT2JqZWN0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNNYXAoc3ViT2JqZWN0KSAmJiBzdWJPYmplY3QuaGFzKGtleSkpIHtcbiAgICAgICAgICBzdWJPYmplY3Quc2V0KGtleSwgY29weShzdWJPYmplY3QuZ2V0KGtleSkpKTtcbiAgICAgICAgICBzdWJPYmplY3QgPSBzdWJPYmplY3QuZ2V0KGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFoYXNPd24oc3ViT2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICBzdWJPYmplY3Rba2V5XSA9IChrZXlBcnJheVtpICsgMV0ubWF0Y2goL14oXFxkK3wtKSQvKSkgPyBbXSA6IHt9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdWJPYmplY3Rba2V5XSA9IGNvcHkoc3ViT2JqZWN0W2tleV0pO1xuICAgICAgICAgIHN1Yk9iamVjdCA9IHN1Yk9iamVjdFtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBsYXN0S2V5ID0ga2V5QXJyYXlba2V5QXJyYXkubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoaXNBcnJheShzdWJPYmplY3QpICYmIGxhc3RLZXkgPT09ICctJykge1xuICAgICAgICBzdWJPYmplY3QucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGluc2VydCAmJiBpc0FycmF5KHN1Yk9iamVjdCkgJiYgIWlzTmFOKCtsYXN0S2V5KSkge1xuICAgICAgICBzdWJPYmplY3Quc3BsaWNlKGxhc3RLZXksIDAsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNNYXAoc3ViT2JqZWN0KSkge1xuICAgICAgICBzdWJPYmplY3Quc2V0KGxhc3RLZXksIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1Yk9iamVjdFtsYXN0S2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld09iamVjdDtcbiAgICB9XG4gICAgY29uc29sZS5lcnJvcihgc2V0Q29weSBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXI6ICR7cG9pbnRlcn1gKTtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgLyoqXG4gICAqICdpbnNlcnQnIGZ1bmN0aW9uXG4gICAqXG4gICAqIENhbGxzICdzZXQnIHdpdGggaW5zZXJ0ID0gVFJVRVxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSBvYmplY3QgdG8gaW5zZXJ0IHZhbHVlIGluXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vICAgdmFsdWUgLSB2YWx1ZSB0byBpbnNlcnRcbiAgICogLy8geyBvYmplY3QgfVxuICAgKi9cbiAgc3RhdGljIGluc2VydChvYmplY3QsIHBvaW50ZXIsIHZhbHVlKSB7XG4gICAgY29uc3QgdXBkYXRlZE9iamVjdCA9IHRoaXMuc2V0KG9iamVjdCwgcG9pbnRlciwgdmFsdWUsIHRydWUpO1xuICAgIHJldHVybiB1cGRhdGVkT2JqZWN0O1xuICB9XG5cbiAgLyoqXG4gICAqICdpbnNlcnRDb3B5JyBmdW5jdGlvblxuICAgKlxuICAgKiBDYWxscyAnc2V0Q29weScgd2l0aCBpbnNlcnQgPSBUUlVFXG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIG9iamVjdCB0byBpbnNlcnQgdmFsdWUgaW5cbiAgICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8gICB2YWx1ZSAtIHZhbHVlIHRvIGluc2VydFxuICAgKiAvLyB7IG9iamVjdCB9XG4gICAqL1xuICBzdGF0aWMgaW5zZXJ0Q29weShvYmplY3QsIHBvaW50ZXIsIHZhbHVlKSB7XG4gICAgY29uc3QgdXBkYXRlZE9iamVjdCA9IHRoaXMuc2V0Q29weShvYmplY3QsIHBvaW50ZXIsIHZhbHVlLCB0cnVlKTtcbiAgICByZXR1cm4gdXBkYXRlZE9iamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiAncmVtb3ZlJyBmdW5jdGlvblxuICAgKlxuICAgKiBVc2VzIGEgSlNPTiBQb2ludGVyIHRvIHJlbW92ZSBhIGtleSBhbmQgaXRzIGF0dHJpYnV0ZSBmcm9tIGFuIG9iamVjdFxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSBvYmplY3QgdG8gZGVsZXRlIGF0dHJpYnV0ZSBmcm9tXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vIHsgb2JqZWN0IH1cbiAgICovXG4gIHN0YXRpYyByZW1vdmUob2JqZWN0LCBwb2ludGVyKSB7XG4gICAgY29uc3Qga2V5QXJyYXkgPSB0aGlzLnBhcnNlKHBvaW50ZXIpO1xuICAgIGlmIChrZXlBcnJheSAhPT0gbnVsbCAmJiBrZXlBcnJheS5sZW5ndGgpIHtcbiAgICAgIGxldCBsYXN0S2V5ID0ga2V5QXJyYXkucG9wKCk7XG4gICAgICBjb25zdCBwYXJlbnRPYmplY3QgPSB0aGlzLmdldChvYmplY3QsIGtleUFycmF5KTtcbiAgICAgIGlmIChpc0FycmF5KHBhcmVudE9iamVjdCkpIHtcbiAgICAgICAgaWYgKGxhc3RLZXkgPT09ICctJykgeyBsYXN0S2V5ID0gcGFyZW50T2JqZWN0Lmxlbmd0aCAtIDE7IH1cbiAgICAgICAgcGFyZW50T2JqZWN0LnNwbGljZShsYXN0S2V5LCAxKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QocGFyZW50T2JqZWN0KSkge1xuICAgICAgICBkZWxldGUgcGFyZW50T2JqZWN0W2xhc3RLZXldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG4gICAgY29uc29sZS5lcnJvcihgcmVtb3ZlIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtwb2ludGVyfWApO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICAvKipcbiAgICogJ2hhcycgZnVuY3Rpb25cbiAgICpcbiAgICogVGVzdHMgaWYgYW4gb2JqZWN0IGhhcyBhIHZhbHVlIGF0IHRoZSBsb2NhdGlvbiBzcGVjaWZpZWQgYnkgYSBKU09OIFBvaW50ZXJcbiAgICpcbiAgICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0IC0gb2JqZWN0IHRvIGNoZWsgZm9yIHZhbHVlXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vIHsgYm9vbGVhbiB9XG4gICAqL1xuICBzdGF0aWMgaGFzKG9iamVjdCwgcG9pbnRlcikge1xuICAgIGNvbnN0IGhhc1ZhbHVlID0gdGhpcy5nZXQob2JqZWN0LCBwb2ludGVyLCAwLCBudWxsLCB0cnVlKTtcbiAgICByZXR1cm4gaGFzVmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogJ2RpY3QnIGZ1bmN0aW9uXG4gICAqXG4gICAqIFJldHVybnMgYSAocG9pbnRlciAtPiB2YWx1ZSkgZGljdGlvbmFyeSBmb3IgYW4gb2JqZWN0XG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIFRoZSBvYmplY3QgdG8gY3JlYXRlIGEgZGljdGlvbmFyeSBmcm9tXG4gICAqIC8vIHsgb2JqZWN0IH0gLSBUaGUgcmVzdWx0aW5nIGRpY3Rpb25hcnkgb2JqZWN0XG4gICAqL1xuICBzdGF0aWMgZGljdChvYmplY3QpIHtcbiAgICBjb25zdCByZXN1bHRzOiBhbnkgPSB7fTtcbiAgICB0aGlzLmZvckVhY2hEZWVwKG9iamVjdCwgKHZhbHVlLCBwb2ludGVyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgeyByZXN1bHRzW3BvaW50ZXJdID0gdmFsdWU7IH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKlxuICAgKiAnZm9yRWFjaERlZXAnIGZ1bmN0aW9uXG4gICAqXG4gICAqIEl0ZXJhdGVzIG92ZXIgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3Qgb3IgaXRlbXMgaW4gYW4gYXJyYXlcbiAgICogYW5kIGludm9rZXMgYW4gaXRlcmF0ZWUgZnVuY3Rpb24gZm9yIGVhY2gga2V5L3ZhbHVlIG9yIGluZGV4L3ZhbHVlIHBhaXIuXG4gICAqIEJ5IGRlZmF1bHQsIGl0ZXJhdGVzIG92ZXIgaXRlbXMgd2l0aGluIG9iamVjdHMgYW5kIGFycmF5cyBhZnRlciBjYWxsaW5nXG4gICAqIHRoZSBpdGVyYXRlZSBmdW5jdGlvbiBvbiB0aGUgY29udGFpbmluZyBvYmplY3Qgb3IgYXJyYXkgaXRzZWxmLlxuICAgKlxuICAgKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czogKHZhbHVlLCBwb2ludGVyLCByb290T2JqZWN0KSxcbiAgICogd2hlcmUgcG9pbnRlciBpcyBhIEpTT04gcG9pbnRlciBpbmRpY2F0aW5nIHRoZSBsb2NhdGlvbiBvZiB0aGUgY3VycmVudFxuICAgKiB2YWx1ZSB3aXRoaW4gdGhlIHJvb3Qgb2JqZWN0LCBhbmQgcm9vdE9iamVjdCBpcyB0aGUgcm9vdCBvYmplY3QgaW5pdGlhbGx5XG4gICAqIHN1Ym1pdHRlZCB0byB0aCBmdW5jdGlvbi5cbiAgICpcbiAgICogSWYgYSB0aGlyZCBvcHRpb25hbCBwYXJhbWV0ZXIgJ2JvdHRvbVVwJyBpcyBzZXQgdG8gVFJVRSwgdGhlIGl0ZXJhdG9yXG4gICAqIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIG9uIHN1Yi1vYmplY3RzIGFuZCBhcnJheXMgYWZ0ZXIgYmVpbmdcbiAgICogY2FsbGVkIG9uIHRoZWlyIGNvbnRlbnRzLCByYXRoZXIgdGhhbiBiZWZvcmUsIHdoaWNoIGlzIHRoZSBkZWZhdWx0LlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBhbHNvIG9wdGlvbmFsbHkgYmUgY2FsbGVkIGRpcmVjdGx5IG9uIGEgc3ViLW9iamVjdCBieVxuICAgKiBpbmNsdWRpbmcgb3B0aW9uYWwgNHRoIGFuZCA1dGggcGFyYW1ldGVyc3MgdG8gc3BlY2lmeSB0aGUgaW5pdGlhbFxuICAgKiByb290IG9iamVjdCBhbmQgcG9pbnRlci5cbiAgICpcbiAgICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0IC0gdGhlIGluaXRpYWwgb2JqZWN0IG9yIGFycmF5XG4gICAqIC8vICB7ICh2OiBhbnksIHA/OiBzdHJpbmcsIG8/OiBhbnkpID0+IGFueSB9IGZ1bmN0aW9uIC0gaXRlcmF0ZWUgZnVuY3Rpb25cbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gYm90dG9tVXAgLSBvcHRpb25hbCwgc2V0IHRvIFRSVUUgdG8gcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICogLy8gIHsgb2JqZWN0ID0gb2JqZWN0IH0gcm9vdE9iamVjdCAtIG9wdGlvbmFsLCByb290IG9iamVjdCBvciBhcnJheVxuICAgKiAvLyAgeyBzdHJpbmcgPSAnJyB9IHBvaW50ZXIgLSBvcHRpb25hbCwgSlNPTiBQb2ludGVyIHRvIG9iamVjdCB3aXRoaW4gcm9vdE9iamVjdFxuICAgKiAvLyB7IG9iamVjdCB9IC0gVGhlIG1vZGlmaWVkIG9iamVjdFxuICAgKi9cbiAgc3RhdGljIGZvckVhY2hEZWVwKFxuICAgIG9iamVjdCwgZm46ICh2OiBhbnksIHA/OiBzdHJpbmcsIG8/OiBhbnkpID0+IGFueSA9ICh2KSA9PiB2LFxuICAgIGJvdHRvbVVwID0gZmFsc2UsIHBvaW50ZXIgPSAnJywgcm9vdE9iamVjdCA9IG9iamVjdFxuICApIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBmb3JFYWNoRGVlcCBlcnJvcjogSXRlcmF0b3IgaXMgbm90IGEgZnVuY3Rpb246YCwgZm4pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWJvdHRvbVVwKSB7IGZuKG9iamVjdCwgcG9pbnRlciwgcm9vdE9iamVjdCk7IH1cbiAgICBpZiAoaXNPYmplY3Qob2JqZWN0KSB8fCBpc0FycmF5KG9iamVjdCkpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iamVjdCkpIHtcbiAgICAgICAgY29uc3QgbmV3UG9pbnRlciA9IHBvaW50ZXIgKyAnLycgKyB0aGlzLmVzY2FwZShrZXkpO1xuICAgICAgICB0aGlzLmZvckVhY2hEZWVwKG9iamVjdFtrZXldLCBmbiwgYm90dG9tVXAsIG5ld1BvaW50ZXIsIHJvb3RPYmplY3QpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYm90dG9tVXApIHsgZm4ob2JqZWN0LCBwb2ludGVyLCByb290T2JqZWN0KTsgfVxuICB9XG5cbiAgLyoqXG4gICAqICdmb3JFYWNoRGVlcENvcHknIGZ1bmN0aW9uXG4gICAqXG4gICAqIFNpbWlsYXIgdG8gZm9yRWFjaERlZXAsIGJ1dCByZXR1cm5zIGEgY29weSBvZiB0aGUgb3JpZ2luYWwgb2JqZWN0LCB3aXRoXG4gICAqIHRoZSBzYW1lIGtleXMgYW5kIGluZGV4ZXMsIGJ1dCB3aXRoIHZhbHVlcyByZXBsYWNlZCB3aXRoIHRoZSByZXN1bHQgb2ZcbiAgICogdGhlIGl0ZXJhdGVlIGZ1bmN0aW9uLlxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSB0aGUgaW5pdGlhbCBvYmplY3Qgb3IgYXJyYXlcbiAgICogLy8gIHsgKHY6IGFueSwgaz86IHN0cmluZywgbz86IGFueSwgcD86IGFueSkgPT4gYW55IH0gZnVuY3Rpb24gLSBpdGVyYXRlZSBmdW5jdGlvblxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBib3R0b21VcCAtIG9wdGlvbmFsLCBzZXQgdG8gVFJVRSB0byByZXZlcnNlIGRpcmVjdGlvblxuICAgKiAvLyAgeyBvYmplY3QgPSBvYmplY3QgfSByb290T2JqZWN0IC0gb3B0aW9uYWwsIHJvb3Qgb2JqZWN0IG9yIGFycmF5XG4gICAqIC8vICB7IHN0cmluZyA9ICcnIH0gcG9pbnRlciAtIG9wdGlvbmFsLCBKU09OIFBvaW50ZXIgdG8gb2JqZWN0IHdpdGhpbiByb290T2JqZWN0XG4gICAqIC8vIHsgb2JqZWN0IH0gLSBUaGUgY29waWVkIG9iamVjdFxuICAgKi9cbiAgc3RhdGljIGZvckVhY2hEZWVwQ29weShcbiAgICBvYmplY3QsIGZuOiAodjogYW55LCBwPzogc3RyaW5nLCBvPzogYW55KSA9PiBhbnkgPSAodikgPT4gdixcbiAgICBib3R0b21VcCA9IGZhbHNlLCBwb2ludGVyID0gJycsIHJvb3RPYmplY3QgPSBvYmplY3RcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS5lcnJvcihgZm9yRWFjaERlZXBDb3B5IGVycm9yOiBJdGVyYXRvciBpcyBub3QgYSBmdW5jdGlvbjpgLCBmbik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KG9iamVjdCkgfHwgaXNBcnJheShvYmplY3QpKSB7XG4gICAgICBsZXQgbmV3T2JqZWN0ID0gaXNBcnJheShvYmplY3QpID8gWyAuLi5vYmplY3QgXSA6IHsgLi4ub2JqZWN0IH07XG4gICAgICBpZiAoIWJvdHRvbVVwKSB7IG5ld09iamVjdCA9IGZuKG5ld09iamVjdCwgcG9pbnRlciwgcm9vdE9iamVjdCk7IH1cbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG5ld09iamVjdCkpIHtcbiAgICAgICAgY29uc3QgbmV3UG9pbnRlciA9IHBvaW50ZXIgKyAnLycgKyB0aGlzLmVzY2FwZShrZXkpO1xuICAgICAgICBuZXdPYmplY3Rba2V5XSA9IHRoaXMuZm9yRWFjaERlZXBDb3B5KFxuICAgICAgICAgIG5ld09iamVjdFtrZXldLCBmbiwgYm90dG9tVXAsIG5ld1BvaW50ZXIsIHJvb3RPYmplY3RcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChib3R0b21VcCkgeyBuZXdPYmplY3QgPSBmbihuZXdPYmplY3QsIHBvaW50ZXIsIHJvb3RPYmplY3QpOyB9XG4gICAgICByZXR1cm4gbmV3T2JqZWN0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4ob2JqZWN0LCBwb2ludGVyLCByb290T2JqZWN0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ2VzY2FwZScgZnVuY3Rpb25cbiAgICpcbiAgICogRXNjYXBlcyBhIHN0cmluZyByZWZlcmVuY2Uga2V5XG4gICAqXG4gICAqIC8vICB7IHN0cmluZyB9IGtleSAtIHN0cmluZyBrZXkgdG8gZXNjYXBlXG4gICAqIC8vIHsgc3RyaW5nIH0gLSBlc2NhcGVkIGtleVxuICAgKi9cbiAgc3RhdGljIGVzY2FwZShrZXkpIHtcbiAgICBjb25zdCBlc2NhcGVkID0ga2V5LnRvU3RyaW5nKCkucmVwbGFjZSgvfi9nLCAnfjAnKS5yZXBsYWNlKC9cXC8vZywgJ34xJyk7XG4gICAgcmV0dXJuIGVzY2FwZWQ7XG4gIH1cblxuICAvKipcbiAgICogJ3VuZXNjYXBlJyBmdW5jdGlvblxuICAgKlxuICAgKiBVbmVzY2FwZXMgYSBzdHJpbmcgcmVmZXJlbmNlIGtleVxuICAgKlxuICAgKiAvLyAgeyBzdHJpbmcgfSBrZXkgLSBzdHJpbmcga2V5IHRvIHVuZXNjYXBlXG4gICAqIC8vIHsgc3RyaW5nIH0gLSB1bmVzY2FwZWQga2V5XG4gICAqL1xuICBzdGF0aWMgdW5lc2NhcGUoa2V5KSB7XG4gICAgY29uc3QgdW5lc2NhcGVkID0ga2V5LnRvU3RyaW5nKCkucmVwbGFjZSgvfjEvZywgJy8nKS5yZXBsYWNlKC9+MC9nLCAnficpO1xuICAgIHJldHVybiB1bmVzY2FwZWQ7XG4gIH1cblxuICAvKipcbiAgICogJ3BhcnNlJyBmdW5jdGlvblxuICAgKlxuICAgKiBDb252ZXJ0cyBhIHN0cmluZyBKU09OIFBvaW50ZXIgaW50byBhIGFycmF5IG9mIGtleXNcbiAgICogKGlmIGlucHV0IGlzIGFscmVhZHkgYW4gYW4gYXJyYXkgb2Yga2V5cywgaXQgaXMgcmV0dXJuZWQgdW5jaGFuZ2VkKVxuICAgKlxuICAgKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBlcnJvcnMgLSBTaG93IGVycm9yIGlmIGludmFsaWQgcG9pbnRlcj9cbiAgICogLy8geyBzdHJpbmdbXSB9IC0gSlNPTiBQb2ludGVyIGFycmF5IG9mIGtleXNcbiAgICovXG4gIHN0YXRpYyBwYXJzZShwb2ludGVyLCBlcnJvcnMgPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5pc0pzb25Qb2ludGVyKHBvaW50ZXIpKSB7XG4gICAgICBpZiAoZXJyb3JzKSB7IGNvbnNvbGUuZXJyb3IoYHBhcnNlIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtwb2ludGVyfWApOyB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkocG9pbnRlcikpIHsgcmV0dXJuIDxzdHJpbmdbXT5wb2ludGVyOyB9XG4gICAgaWYgKHR5cGVvZiBwb2ludGVyID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCg8c3RyaW5nPnBvaW50ZXIpWzBdID09PSAnIycpIHsgcG9pbnRlciA9IHBvaW50ZXIuc2xpY2UoMSk7IH1cbiAgICAgIGlmICg8c3RyaW5nPnBvaW50ZXIgPT09ICcnIHx8IDxzdHJpbmc+cG9pbnRlciA9PT0gJy8nKSB7IHJldHVybiBbXTsgfVxuICAgICAgcmV0dXJuICg8c3RyaW5nPnBvaW50ZXIpLnNsaWNlKDEpLnNwbGl0KCcvJykubWFwKHRoaXMudW5lc2NhcGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnY29tcGlsZScgZnVuY3Rpb25cbiAgICpcbiAgICogQ29udmVydHMgYW4gYXJyYXkgb2Yga2V5cyBpbnRvIGEgSlNPTiBQb2ludGVyIHN0cmluZ1xuICAgKiAoaWYgaW5wdXQgaXMgYWxyZWFkeSBhIHN0cmluZywgaXQgaXMgbm9ybWFsaXplZCBhbmQgcmV0dXJuZWQpXG4gICAqXG4gICAqIFRoZSBvcHRpb25hbCBzZWNvbmQgcGFyYW1ldGVyIGlzIGEgZGVmYXVsdCB3aGljaCB3aWxsIHJlcGxhY2UgYW55IGVtcHR5IGtleXMuXG4gICAqXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vICB7IHN0cmluZyB8IG51bWJlciA9ICcnIH0gZGVmYXVsdFZhbHVlIC0gRGVmYXVsdCB2YWx1ZVxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBlcnJvcnMgLSBTaG93IGVycm9yIGlmIGludmFsaWQgcG9pbnRlcj9cbiAgICogLy8geyBzdHJpbmcgfSAtIEpTT04gUG9pbnRlciBzdHJpbmdcbiAgICovXG4gIHN0YXRpYyBjb21waWxlKHBvaW50ZXIsIGRlZmF1bHRWYWx1ZSA9ICcnLCBlcnJvcnMgPSBmYWxzZSkge1xuICAgIGlmIChwb2ludGVyID09PSAnIycpIHsgcmV0dXJuICcnOyB9XG4gICAgaWYgKCF0aGlzLmlzSnNvblBvaW50ZXIocG9pbnRlcikpIHtcbiAgICAgIGlmIChlcnJvcnMpIHsgY29uc29sZS5lcnJvcihgY29tcGlsZSBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXI6ICR7cG9pbnRlcn1gKTsgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChpc0FycmF5KHBvaW50ZXIpKSB7XG4gICAgICBpZiAoKDxzdHJpbmdbXT5wb2ludGVyKS5sZW5ndGggPT09IDApIHsgcmV0dXJuICcnOyB9XG4gICAgICByZXR1cm4gJy8nICsgKDxzdHJpbmdbXT5wb2ludGVyKS5tYXAoXG4gICAgICAgIGtleSA9PiBrZXkgPT09ICcnID8gZGVmYXVsdFZhbHVlIDogdGhpcy5lc2NhcGUoa2V5KVxuICAgICAgKS5qb2luKCcvJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcG9pbnRlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChwb2ludGVyWzBdID09PSAnIycpIHsgcG9pbnRlciA9IHBvaW50ZXIuc2xpY2UoMSk7IH1cbiAgICAgIHJldHVybiBwb2ludGVyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAndG9LZXknIGZ1bmN0aW9uXG4gICAqXG4gICAqIEV4dHJhY3RzIG5hbWUgb2YgdGhlIGZpbmFsIGtleSBmcm9tIGEgSlNPTiBQb2ludGVyLlxuICAgKlxuICAgKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBlcnJvcnMgLSBTaG93IGVycm9yIGlmIGludmFsaWQgcG9pbnRlcj9cbiAgICogLy8geyBzdHJpbmcgfSAtIHRoZSBleHRyYWN0ZWQga2V5XG4gICAqL1xuICBzdGF0aWMgdG9LZXkocG9pbnRlciwgZXJyb3JzID0gZmFsc2UpIHtcbiAgICBjb25zdCBrZXlBcnJheSA9IHRoaXMucGFyc2UocG9pbnRlciwgZXJyb3JzKTtcbiAgICBpZiAoa2V5QXJyYXkgPT09IG51bGwpIHsgcmV0dXJuIG51bGw7IH1cbiAgICBpZiAoIWtleUFycmF5Lmxlbmd0aCkgeyByZXR1cm4gJyc7IH1cbiAgICByZXR1cm4ga2V5QXJyYXlba2V5QXJyYXkubGVuZ3RoIC0gMV07XG4gIH1cblxuICAvKipcbiAgICogJ2lzSnNvblBvaW50ZXInIGZ1bmN0aW9uXG4gICAqXG4gICAqIENoZWNrcyBhIHN0cmluZyBvciBhcnJheSB2YWx1ZSB0byBkZXRlcm1pbmUgaWYgaXQgaXMgYSB2YWxpZCBKU09OIFBvaW50ZXIuXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhIHN0cmluZyBpcyBlbXB0eSwgb3Igc3RhcnRzIHdpdGggJy8nIG9yICcjLycuXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbiBhcnJheSBjb250YWlucyBvbmx5IHN0cmluZyB2YWx1ZXMuXG4gICAqXG4gICAqIC8vICAgdmFsdWUgLSB2YWx1ZSB0byBjaGVja1xuICAgKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgdmFsdWUgaXMgYSB2YWxpZCBKU09OIFBvaW50ZXIsIG90aGVyd2lzZSBmYWxzZVxuICAgKi9cbiAgc3RhdGljIGlzSnNvblBvaW50ZXIodmFsdWUpIHtcbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5ldmVyeShrZXkgPT4gdHlwZW9mIGtleSA9PT0gJ3N0cmluZycpO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICBpZiAodmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSAnIycpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIGlmICh2YWx1ZVswXSA9PT0gJy8nIHx8IHZhbHVlLnNsaWNlKDAsIDIpID09PSAnIy8nKSB7XG4gICAgICAgIHJldHVybiAhLyh+W14wMV18fiQpL2cudGVzdCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnaXNTdWJQb2ludGVyJyBmdW5jdGlvblxuICAgKlxuICAgKiBDaGVja3Mgd2hldGhlciBvbmUgSlNPTiBQb2ludGVyIGlzIGEgc3Vic2V0IG9mIGFub3RoZXIuXG4gICAqXG4gICAqIC8vICB7IFBvaW50ZXIgfSBzaG9ydFBvaW50ZXIgLSBwb3RlbnRpYWwgc3Vic2V0IEpTT04gUG9pbnRlclxuICAgKiAvLyAgeyBQb2ludGVyIH0gbG9uZ1BvaW50ZXIgLSBwb3RlbnRpYWwgc3VwZXJzZXQgSlNPTiBQb2ludGVyXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IHRydWVJZk1hdGNoaW5nIC0gcmV0dXJuIHRydWUgaWYgcG9pbnRlcnMgbWF0Y2g/XG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGVycm9ycyAtIFNob3cgZXJyb3IgaWYgaW52YWxpZCBwb2ludGVyP1xuICAgKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgc2hvcnRQb2ludGVyIGlzIGEgc3Vic2V0IG9mIGxvbmdQb2ludGVyLCBmYWxzZSBpZiBub3RcbiAgICovXG4gIHN0YXRpYyBpc1N1YlBvaW50ZXIoXG4gICAgc2hvcnRQb2ludGVyLCBsb25nUG9pbnRlciwgdHJ1ZUlmTWF0Y2hpbmcgPSBmYWxzZSwgZXJyb3JzID0gZmFsc2VcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmlzSnNvblBvaW50ZXIoc2hvcnRQb2ludGVyKSB8fCAhdGhpcy5pc0pzb25Qb2ludGVyKGxvbmdQb2ludGVyKSkge1xuICAgICAgaWYgKGVycm9ycykge1xuICAgICAgICBsZXQgaW52YWxpZCA9ICcnO1xuICAgICAgICBpZiAoIXRoaXMuaXNKc29uUG9pbnRlcihzaG9ydFBvaW50ZXIpKSB7IGludmFsaWQgKz0gYCAxOiAke3Nob3J0UG9pbnRlcn1gOyB9XG4gICAgICAgIGlmICghdGhpcy5pc0pzb25Qb2ludGVyKGxvbmdQb2ludGVyKSkgeyBpbnZhbGlkICs9IGAgMjogJHtsb25nUG9pbnRlcn1gOyB9XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYGlzU3ViUG9pbnRlciBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXIgJHtpbnZhbGlkfWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzaG9ydFBvaW50ZXIgPSB0aGlzLmNvbXBpbGUoc2hvcnRQb2ludGVyLCAnJywgZXJyb3JzKTtcbiAgICBsb25nUG9pbnRlciA9IHRoaXMuY29tcGlsZShsb25nUG9pbnRlciwgJycsIGVycm9ycyk7XG4gICAgcmV0dXJuIHNob3J0UG9pbnRlciA9PT0gbG9uZ1BvaW50ZXIgPyB0cnVlSWZNYXRjaGluZyA6XG4gICAgICBgJHtzaG9ydFBvaW50ZXJ9L2AgPT09IGxvbmdQb2ludGVyLnNsaWNlKDAsIHNob3J0UG9pbnRlci5sZW5ndGggKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAndG9JbmRleGVkUG9pbnRlcicgZnVuY3Rpb25cbiAgICpcbiAgICogTWVyZ2VzIGFuIGFycmF5IG9mIG51bWVyaWMgaW5kZXhlcyBhbmQgYSBnZW5lcmljIHBvaW50ZXIgdG8gY3JlYXRlIGFuXG4gICAqIGluZGV4ZWQgcG9pbnRlciBmb3IgYSBzcGVjaWZpYyBpdGVtLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgbWVyZ2luZyB0aGUgZ2VuZXJpYyBwb2ludGVyICcvZm9vLy0vYmFyLy0vYmF6JyBhbmRcbiAgICogdGhlIGFycmF5IFs0LCAyXSB3b3VsZCByZXN1bHQgaW4gdGhlIGluZGV4ZWQgcG9pbnRlciAnL2Zvby80L2Jhci8yL2JheidcbiAgICpcbiAgICpcbiAgICogLy8gIHsgUG9pbnRlciB9IGdlbmVyaWNQb2ludGVyIC0gVGhlIGdlbmVyaWMgcG9pbnRlclxuICAgKiAvLyAgeyBudW1iZXJbXSB9IGluZGV4QXJyYXkgLSBUaGUgYXJyYXkgb2YgbnVtZXJpYyBpbmRleGVzXG4gICAqIC8vICB7IE1hcDxzdHJpbmcsIG51bWJlcj4gfSBhcnJheU1hcCAtIEFuIG9wdGlvbmFsIGFycmF5IG1hcFxuICAgKiAvLyB7IHN0cmluZyB9IC0gVGhlIG1lcmdlZCBwb2ludGVyIHdpdGggaW5kZXhlc1xuICAgKi9cbiAgc3RhdGljIHRvSW5kZXhlZFBvaW50ZXIoXG4gICAgZ2VuZXJpY1BvaW50ZXIsIGluZGV4QXJyYXksIGFycmF5TWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbnVsbFxuICApIHtcbiAgICBpZiAodGhpcy5pc0pzb25Qb2ludGVyKGdlbmVyaWNQb2ludGVyKSAmJiBpc0FycmF5KGluZGV4QXJyYXkpKSB7XG4gICAgICBsZXQgaW5kZXhlZFBvaW50ZXIgPSB0aGlzLmNvbXBpbGUoZ2VuZXJpY1BvaW50ZXIpO1xuICAgICAgaWYgKGlzTWFwKGFycmF5TWFwKSkge1xuICAgICAgICBsZXQgYXJyYXlJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiBpbmRleGVkUG9pbnRlci5yZXBsYWNlKC9cXC9cXC0oPz1cXC98JCkvZywgKGtleSwgc3RyaW5nSW5kZXgpID0+XG4gICAgICAgICAgYXJyYXlNYXAuaGFzKCg8c3RyaW5nPmluZGV4ZWRQb2ludGVyKS5zbGljZSgwLCBzdHJpbmdJbmRleCkpID9cbiAgICAgICAgICAgICcvJyArIGluZGV4QXJyYXlbYXJyYXlJbmRleCsrXSA6IGtleVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChjb25zdCBwb2ludGVySW5kZXggb2YgaW5kZXhBcnJheSkge1xuICAgICAgICAgIGluZGV4ZWRQb2ludGVyID0gaW5kZXhlZFBvaW50ZXIucmVwbGFjZSgnLy0nLCAnLycgKyBwb2ludGVySW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleGVkUG9pbnRlcjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzSnNvblBvaW50ZXIoZ2VuZXJpY1BvaW50ZXIpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGB0b0luZGV4ZWRQb2ludGVyIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtnZW5lcmljUG9pbnRlcn1gKTtcbiAgICB9XG4gICAgaWYgKCFpc0FycmF5KGluZGV4QXJyYXkpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGB0b0luZGV4ZWRQb2ludGVyIGVycm9yOiBJbnZhbGlkIGluZGV4QXJyYXk6ICR7aW5kZXhBcnJheX1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ3RvR2VuZXJpY1BvaW50ZXInIGZ1bmN0aW9uXG4gICAqXG4gICAqIENvbXBhcmVzIGFuIGluZGV4ZWQgcG9pbnRlciB0byBhbiBhcnJheSBtYXAgYW5kIHJlbW92ZXMgbGlzdCBhcnJheVxuICAgKiBpbmRleGVzIChidXQgbGVhdmVzIHR1cGxlIGFycnJheSBpbmRleGVzIGFuZCBhbGwgb2JqZWN0IGtleXMsIGluY2x1ZGluZ1xuICAgKiBudW1lcmljIGtleXMpIHRvIGNyZWF0ZSBhIGdlbmVyaWMgcG9pbnRlci5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIHVzaW5nIHRoZSBpbmRleGVkIHBvaW50ZXIgJy9mb28vMS9iYXIvMi9iYXovMycgYW5kXG4gICAqIHRoZSBhcnJheU1hcCBbWycvZm9vJywgMF0sIFsnL2Zvby8tL2JhcicsIDNdLCBbJy9mb28vLS9iYXIvLS9iYXonLCAwXV1cbiAgICogd291bGQgcmVzdWx0IGluIHRoZSBnZW5lcmljIHBvaW50ZXIgJy9mb28vLS9iYXIvMi9iYXovLSdcbiAgICogVXNpbmcgdGhlIGluZGV4ZWQgcG9pbnRlciAnL2Zvby8xL2Jhci80L2Jhei8zJyBhbmQgdGhlIHNhbWUgYXJyYXlNYXBcbiAgICogd291bGQgcmVzdWx0IGluIHRoZSBnZW5lcmljIHBvaW50ZXIgJy9mb28vLS9iYXIvLS9iYXovLSdcbiAgICogKHRoZSBiYXIgYXJyYXkgaGFzIDMgdHVwbGUgaXRlbXMsIHNvIGluZGV4IDIgaXMgcmV0YWluZWQsIGJ1dCA0IGlzIHJlbW92ZWQpXG4gICAqXG4gICAqIFRoZSBzdHJ1Y3R1cmUgb2YgdGhlIGFycmF5TWFwIGlzOiBbWydwYXRoIHRvIGFycmF5JywgbnVtYmVyIG9mIHR1cGxlIGl0ZW1zXS4uLl1cbiAgICpcbiAgICpcbiAgICogLy8gIHsgUG9pbnRlciB9IGluZGV4ZWRQb2ludGVyIC0gVGhlIGluZGV4ZWQgcG9pbnRlciAoYXJyYXkgb3Igc3RyaW5nKVxuICAgKiAvLyAgeyBNYXA8c3RyaW5nLCBudW1iZXI+IH0gYXJyYXlNYXAgLSBUaGUgb3B0aW9uYWwgYXJyYXkgbWFwIChmb3IgcHJlc2VydmluZyB0dXBsZSBpbmRleGVzKVxuICAgKiAvLyB7IHN0cmluZyB9IC0gVGhlIGdlbmVyaWMgcG9pbnRlciB3aXRoIGluZGV4ZXMgcmVtb3ZlZFxuICAgKi9cbiAgc3RhdGljIHRvR2VuZXJpY1BvaW50ZXIoaW5kZXhlZFBvaW50ZXIsIGFycmF5TWFwID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKSkge1xuICAgIGlmICh0aGlzLmlzSnNvblBvaW50ZXIoaW5kZXhlZFBvaW50ZXIpICYmIGlzTWFwKGFycmF5TWFwKSkge1xuICAgICAgY29uc3QgcG9pbnRlckFycmF5ID0gdGhpcy5wYXJzZShpbmRleGVkUG9pbnRlcik7XG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHBvaW50ZXJBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBzdWJQb2ludGVyID0gdGhpcy5jb21waWxlKHBvaW50ZXJBcnJheS5zbGljZSgwLCBpKSk7XG4gICAgICAgIGlmIChhcnJheU1hcC5oYXMoc3ViUG9pbnRlcikgJiZcbiAgICAgICAgICBhcnJheU1hcC5nZXQoc3ViUG9pbnRlcikgPD0gK3BvaW50ZXJBcnJheVtpXVxuICAgICAgICApIHtcbiAgICAgICAgICBwb2ludGVyQXJyYXlbaV0gPSAnLSc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNvbXBpbGUocG9pbnRlckFycmF5KTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzSnNvblBvaW50ZXIoaW5kZXhlZFBvaW50ZXIpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGB0b0dlbmVyaWNQb2ludGVyIGVycm9yOiBpbnZhbGlkIEpTT04gUG9pbnRlcjogJHtpbmRleGVkUG9pbnRlcn1gKTtcbiAgICB9XG4gICAgaWYgKCFpc01hcChhcnJheU1hcCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYHRvR2VuZXJpY1BvaW50ZXIgZXJyb3I6IGludmFsaWQgYXJyYXlNYXA6ICR7YXJyYXlNYXB9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICd0b0NvbnRyb2xQb2ludGVyJyBmdW5jdGlvblxuICAgKlxuICAgKiBBY2NlcHRzIGEgSlNPTiBQb2ludGVyIGZvciBhIGRhdGEgb2JqZWN0IGFuZCByZXR1cm5zIGEgSlNPTiBQb2ludGVyIGZvciB0aGVcbiAgICogbWF0Y2hpbmcgY29udHJvbCBpbiBhbiBBbmd1bGFyIEZvcm1Hcm91cC5cbiAgICpcbiAgICogLy8gIHsgUG9pbnRlciB9IGRhdGFQb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpIHRvIGEgZGF0YSBvYmplY3RcbiAgICogLy8gIHsgRm9ybUdyb3VwIH0gZm9ybUdyb3VwIC0gQW5ndWxhciBGb3JtR3JvdXAgdG8gZ2V0IHZhbHVlIGZyb21cbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gY29udHJvbE11c3RFeGlzdCAtIE9ubHkgcmV0dXJuIGlmIGNvbnRyb2wgZXhpc3RzP1xuICAgKiAvLyB7IFBvaW50ZXIgfSAtIEpTT04gUG9pbnRlciAoc3RyaW5nKSB0byB0aGUgZm9ybUdyb3VwIG9iamVjdFxuICAgKi9cbiAgc3RhdGljIHRvQ29udHJvbFBvaW50ZXIoZGF0YVBvaW50ZXIsIGZvcm1Hcm91cCwgY29udHJvbE11c3RFeGlzdCA9IGZhbHNlKSB7XG4gICAgY29uc3QgZGF0YVBvaW50ZXJBcnJheSA9IHRoaXMucGFyc2UoZGF0YVBvaW50ZXIpO1xuICAgIGNvbnN0IGNvbnRyb2xQb2ludGVyQXJyYXk6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IHN1Ykdyb3VwID0gZm9ybUdyb3VwO1xuICAgIGlmIChkYXRhUG9pbnRlckFycmF5ICE9PSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhUG9pbnRlckFycmF5KSB7XG4gICAgICAgIGlmIChoYXNPd24oc3ViR3JvdXAsICdjb250cm9scycpKSB7XG4gICAgICAgICAgY29udHJvbFBvaW50ZXJBcnJheS5wdXNoKCdjb250cm9scycpO1xuICAgICAgICAgIHN1Ykdyb3VwID0gc3ViR3JvdXAuY29udHJvbHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkoc3ViR3JvdXApICYmIChrZXkgPT09ICctJykpIHtcbiAgICAgICAgICBjb250cm9sUG9pbnRlckFycmF5LnB1c2goKHN1Ykdyb3VwLmxlbmd0aCAtIDEpLnRvU3RyaW5nKCkpO1xuICAgICAgICAgIHN1Ykdyb3VwID0gc3ViR3JvdXBbc3ViR3JvdXAubGVuZ3RoIC0gMV07XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT3duKHN1Ykdyb3VwLCBrZXkpKSB7XG4gICAgICAgICAgY29udHJvbFBvaW50ZXJBcnJheS5wdXNoKGtleSk7XG4gICAgICAgICAgc3ViR3JvdXAgPSBzdWJHcm91cFtrZXldO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRyb2xNdXN0RXhpc3QpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGB0b0NvbnRyb2xQb2ludGVyIGVycm9yOiBVbmFibGUgdG8gZmluZCBcIiR7a2V5fVwiIGl0ZW0gaW4gRm9ybUdyb3VwLmApO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZGF0YVBvaW50ZXIpO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZm9ybUdyb3VwKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29udHJvbFBvaW50ZXJBcnJheS5wdXNoKGtleSk7XG4gICAgICAgICAgc3ViR3JvdXAgPSB7IGNvbnRyb2xzOiB7fSB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jb21waWxlKGNvbnRyb2xQb2ludGVyQXJyYXkpO1xuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKGB0b0NvbnRyb2xQb2ludGVyIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtkYXRhUG9pbnRlcn1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAndG9TY2hlbWFQb2ludGVyJyBmdW5jdGlvblxuICAgKlxuICAgKiBBY2NlcHRzIGEgSlNPTiBQb2ludGVyIHRvIGEgdmFsdWUgaW5zaWRlIGEgZGF0YSBvYmplY3QgYW5kIGEgSlNPTiBzY2hlbWFcbiAgICogZm9yIHRoYXQgb2JqZWN0LlxuICAgKlxuICAgKiBSZXR1cm5zIGEgUG9pbnRlciB0byB0aGUgc3ViLXNjaGVtYSBmb3IgdGhlIHZhbHVlIGluc2lkZSB0aGUgb2JqZWN0J3Mgc2NoZW1hLlxuICAgKlxuICAgKiAvLyAgeyBQb2ludGVyIH0gZGF0YVBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSkgdG8gYW4gb2JqZWN0XG4gICAqIC8vICAgc2NoZW1hIC0gSlNPTiBzY2hlbWEgZm9yIHRoZSBvYmplY3RcbiAgICogLy8geyBQb2ludGVyIH0gLSBKU09OIFBvaW50ZXIgKHN0cmluZykgdG8gdGhlIG9iamVjdCdzIHNjaGVtYVxuICAgKi9cbiAgc3RhdGljIHRvU2NoZW1hUG9pbnRlcihkYXRhUG9pbnRlciwgc2NoZW1hKSB7XG4gICAgaWYgKHRoaXMuaXNKc29uUG9pbnRlcihkYXRhUG9pbnRlcikgJiYgdHlwZW9mIHNjaGVtYSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IHBvaW50ZXJBcnJheSA9IHRoaXMucGFyc2UoZGF0YVBvaW50ZXIpO1xuICAgICAgaWYgKCFwb2ludGVyQXJyYXkubGVuZ3RoKSB7IHJldHVybiAnJzsgfVxuICAgICAgY29uc3QgZmlyc3RLZXkgPSBwb2ludGVyQXJyYXkuc2hpZnQoKTtcbiAgICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcgfHwgc2NoZW1hLnByb3BlcnRpZXMgfHwgc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmICgoc2NoZW1hLnByb3BlcnRpZXMgfHwge30pW2ZpcnN0S2V5XSkge1xuICAgICAgICAgIHJldHVybiBgL3Byb3BlcnRpZXMvJHt0aGlzLmVzY2FwZShmaXJzdEtleSl9YCArXG4gICAgICAgICAgICB0aGlzLnRvU2NoZW1hUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYS5wcm9wZXJ0aWVzW2ZpcnN0S2V5XSk7XG4gICAgICAgIH0gZWxzZSAgaWYgKHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcykge1xuICAgICAgICAgIHJldHVybiAnL2FkZGl0aW9uYWxQcm9wZXJ0aWVzJyArXG4gICAgICAgICAgICB0aGlzLnRvU2NoZW1hUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICgoc2NoZW1hLnR5cGUgPT09ICdhcnJheScgfHwgc2NoZW1hLml0ZW1zKSAmJlxuICAgICAgICAoaXNOdW1iZXIoZmlyc3RLZXkpIHx8IGZpcnN0S2V5ID09PSAnLScgfHwgZmlyc3RLZXkgPT09ICcnKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGFycmF5SXRlbSA9IGZpcnN0S2V5ID09PSAnLScgfHwgZmlyc3RLZXkgPT09ICcnID8gMCA6ICtmaXJzdEtleTtcbiAgICAgICAgaWYgKGlzQXJyYXkoc2NoZW1hLml0ZW1zKSkge1xuICAgICAgICAgIGlmIChhcnJheUl0ZW0gPCBzY2hlbWEuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gJy9pdGVtcy8nICsgYXJyYXlJdGVtICtcbiAgICAgICAgICAgICAgdGhpcy50b1NjaGVtYVBvaW50ZXIocG9pbnRlckFycmF5LCBzY2hlbWEuaXRlbXNbYXJyYXlJdGVtXSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSB7XG4gICAgICAgICAgICByZXR1cm4gJy9hZGRpdGlvbmFsSXRlbXMnICtcbiAgICAgICAgICAgICAgdGhpcy50b1NjaGVtYVBvaW50ZXIocG9pbnRlckFycmF5LCBzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qoc2NoZW1hLml0ZW1zKSkge1xuICAgICAgICAgIHJldHVybiAnL2l0ZW1zJyArIHRoaXMudG9TY2hlbWFQb2ludGVyKHBvaW50ZXJBcnJheSwgc2NoZW1hLml0ZW1zKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSkge1xuICAgICAgICAgIHJldHVybiAnL2FkZGl0aW9uYWxJdGVtcycgK1xuICAgICAgICAgICAgdGhpcy50b1NjaGVtYVBvaW50ZXIocG9pbnRlckFycmF5LCBzY2hlbWEuYWRkaXRpb25hbEl0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc29sZS5lcnJvcihgdG9TY2hlbWFQb2ludGVyIGVycm9yOiBEYXRhIHBvaW50ZXIgJHtkYXRhUG9pbnRlcn0gYCArXG4gICAgICAgIGBub3QgY29tcGF0aWJsZSB3aXRoIHNjaGVtYSAke3NjaGVtYX1gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNKc29uUG9pbnRlcihkYXRhUG9pbnRlcikpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYHRvU2NoZW1hUG9pbnRlciBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXI6ICR7ZGF0YVBvaW50ZXJ9YCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc2NoZW1hICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29uc29sZS5lcnJvcihgdG9TY2hlbWFQb2ludGVyIGVycm9yOiBJbnZhbGlkIEpTT04gU2NoZW1hOiAke3NjaGVtYX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogJ3RvRGF0YVBvaW50ZXInIGZ1bmN0aW9uXG4gICAqXG4gICAqIEFjY2VwdHMgYSBKU09OIFBvaW50ZXIgdG8gYSBzdWItc2NoZW1hIGluc2lkZSBhIEpTT04gc2NoZW1hIGFuZCB0aGUgc2NoZW1hLlxuICAgKlxuICAgKiBJZiBwb3NzaWJsZSwgcmV0dXJucyBhIGdlbmVyaWMgUG9pbnRlciB0byB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZSBpbnNpZGVcbiAgICogdGhlIGRhdGEgb2JqZWN0IGRlc2NyaWJlZCBieSB0aGUgSlNPTiBzY2hlbWEuXG4gICAqXG4gICAqIFJldHVybnMgbnVsbCBpZiB0aGUgc3ViLXNjaGVtYSBpcyBpbiBhbiBhbWJpZ3VvdXMgbG9jYXRpb24gKHN1Y2ggYXNcbiAgICogZGVmaW5pdGlvbnMgb3IgYWRkaXRpb25hbFByb3BlcnRpZXMpIHdoZXJlIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlXG4gICAqIGxvY2F0aW9uIGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICAgKlxuICAgKiAvLyAgeyBQb2ludGVyIH0gc2NoZW1hUG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KSB0byBhIEpTT04gc2NoZW1hXG4gICAqIC8vICAgc2NoZW1hIC0gdGhlIEpTT04gc2NoZW1hXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGVycm9ycyAtIFNob3cgZXJyb3JzP1xuICAgKiAvLyB7IFBvaW50ZXIgfSAtIEpTT04gUG9pbnRlciAoc3RyaW5nKSB0byB0aGUgdmFsdWUgaW4gdGhlIGRhdGEgb2JqZWN0XG4gICAqL1xuICBzdGF0aWMgdG9EYXRhUG9pbnRlcihzY2hlbWFQb2ludGVyLCBzY2hlbWEsIGVycm9ycyA9IGZhbHNlKSB7XG4gICAgaWYgKHRoaXMuaXNKc29uUG9pbnRlcihzY2hlbWFQb2ludGVyKSAmJiB0eXBlb2Ygc2NoZW1hID09PSAnb2JqZWN0JyAmJlxuICAgICAgdGhpcy5oYXMoc2NoZW1hLCBzY2hlbWFQb2ludGVyKVxuICAgICkge1xuICAgICAgY29uc3QgcG9pbnRlckFycmF5ID0gdGhpcy5wYXJzZShzY2hlbWFQb2ludGVyKTtcbiAgICAgIGlmICghcG9pbnRlckFycmF5Lmxlbmd0aCkgeyByZXR1cm4gJyc7IH1cbiAgICAgIGNvbnN0IGZpcnN0S2V5ID0gcG9pbnRlckFycmF5LnNoaWZ0KCk7XG4gICAgICBpZiAoZmlyc3RLZXkgPT09ICdwcm9wZXJ0aWVzJyB8fFxuICAgICAgICAoZmlyc3RLZXkgPT09ICdpdGVtcycgJiYgaXNBcnJheShzY2hlbWEuaXRlbXMpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHNlY29uZEtleSA9IHBvaW50ZXJBcnJheS5zaGlmdCgpO1xuICAgICAgICBjb25zdCBwb2ludGVyU3VmZml4ID0gdGhpcy50b0RhdGFQb2ludGVyKHBvaW50ZXJBcnJheSwgc2NoZW1hW2ZpcnN0S2V5XVtzZWNvbmRLZXldKTtcbiAgICAgICAgcmV0dXJuIHBvaW50ZXJTdWZmaXggPT09IG51bGwgPyBudWxsIDogJy8nICsgc2Vjb25kS2V5ICsgcG9pbnRlclN1ZmZpeDtcbiAgICAgIH0gZWxzZSBpZiAoZmlyc3RLZXkgPT09ICdhZGRpdGlvbmFsSXRlbXMnIHx8XG4gICAgICAgIChmaXJzdEtleSA9PT0gJ2l0ZW1zJyAmJiBpc09iamVjdChzY2hlbWEuaXRlbXMpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ZXJTdWZmaXggPSB0aGlzLnRvRGF0YVBvaW50ZXIocG9pbnRlckFycmF5LCBzY2hlbWFbZmlyc3RLZXldKTtcbiAgICAgICAgcmV0dXJuIHBvaW50ZXJTdWZmaXggPT09IG51bGwgPyBudWxsIDogJy8tJyArIHBvaW50ZXJTdWZmaXg7XG4gICAgICB9IGVsc2UgaWYgKFsnYWxsT2YnLCAnYW55T2YnLCAnb25lT2YnXS5pbmNsdWRlcyhmaXJzdEtleSkpIHtcbiAgICAgICAgY29uc3Qgc2Vjb25kS2V5ID0gcG9pbnRlckFycmF5LnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiB0aGlzLnRvRGF0YVBvaW50ZXIocG9pbnRlckFycmF5LCBzY2hlbWFbZmlyc3RLZXldW3NlY29uZEtleV0pO1xuICAgICAgfSBlbHNlIGlmIChmaXJzdEtleSA9PT0gJ25vdCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9EYXRhUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYVtmaXJzdEtleV0pO1xuICAgICAgfSBlbHNlIGlmIChbJ2NvbnRhaW5zJywgJ2RlZmluaXRpb25zJywgJ2RlcGVuZGVuY2llcycsICdhZGRpdGlvbmFsSXRlbXMnLFxuICAgICAgICAnYWRkaXRpb25hbFByb3BlcnRpZXMnLCAncGF0dGVyblByb3BlcnRpZXMnLCAncHJvcGVydHlOYW1lcyddLmluY2x1ZGVzKGZpcnN0S2V5KVxuICAgICAgKSB7XG4gICAgICAgIGlmIChlcnJvcnMpIHsgY29uc29sZS5lcnJvcihgdG9EYXRhUG9pbnRlciBlcnJvcjogQW1iaWd1b3VzIGxvY2F0aW9uYCk7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKGVycm9ycykge1xuICAgICAgaWYgKCF0aGlzLmlzSnNvblBvaW50ZXIoc2NoZW1hUG9pbnRlcikpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgdG9EYXRhUG9pbnRlciBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXI6ICR7c2NoZW1hUG9pbnRlcn1gKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygc2NoZW1hICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGB0b0RhdGFQb2ludGVyIGVycm9yOiBJbnZhbGlkIEpTT04gU2NoZW1hOiAke3NjaGVtYX1gKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygc2NoZW1hICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGB0b0RhdGFQb2ludGVyIGVycm9yOiBQb2ludGVyICR7c2NoZW1hUG9pbnRlcn0gaW52YWxpZCBmb3IgU2NoZW1hOiAke3NjaGVtYX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogJ3BhcnNlT2JqZWN0UGF0aCcgZnVuY3Rpb25cbiAgICpcbiAgICogUGFyc2VzIGEgSmF2YVNjcmlwdCBvYmplY3QgcGF0aCBpbnRvIGFuIGFycmF5IG9mIGtleXMsIHdoaWNoXG4gICAqIGNhbiB0aGVuIGJlIHBhc3NlZCB0byBjb21waWxlKCkgdG8gY29udmVydCBpbnRvIGEgc3RyaW5nIEpTT04gUG9pbnRlci5cbiAgICpcbiAgICogQmFzZWQgb24gbWlrZS1tYXJjYWNjaSdzIGV4Y2VsbGVudCBvYmplY3RwYXRoIHBhcnNlIGZ1bmN0aW9uOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWlrZS1tYXJjYWNjaS9vYmplY3RwYXRoXG4gICAqXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwYXRoIC0gVGhlIG9iamVjdCBwYXRoIHRvIHBhcnNlXG4gICAqIC8vIHsgc3RyaW5nW10gfSAtIFRoZSByZXN1bHRpbmcgYXJyYXkgb2Yga2V5c1xuICAgKi9cbiAgc3RhdGljIHBhcnNlT2JqZWN0UGF0aChwYXRoKSB7XG4gICAgaWYgKGlzQXJyYXkocGF0aCkpIHsgcmV0dXJuIDxzdHJpbmdbXT5wYXRoOyB9XG4gICAgaWYgKHRoaXMuaXNKc29uUG9pbnRlcihwYXRoKSkgeyByZXR1cm4gdGhpcy5wYXJzZShwYXRoKTsgfVxuICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgICAgIHdoaWxlIChpbmRleCA8IHBhdGgubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IG5leHREb3QgPSBwYXRoLmluZGV4T2YoJy4nLCBpbmRleCk7XG4gICAgICAgIGNvbnN0IG5leHRPQiA9IHBhdGguaW5kZXhPZignWycsIGluZGV4KTsgLy8gbmV4dCBvcGVuIGJyYWNrZXRcbiAgICAgICAgaWYgKG5leHREb3QgPT09IC0xICYmIG5leHRPQiA9PT0gLTEpIHsgLy8gbGFzdCBpdGVtXG4gICAgICAgICAgcGFydHMucHVzaChwYXRoLnNsaWNlKGluZGV4KSk7XG4gICAgICAgICAgaW5kZXggPSBwYXRoLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChuZXh0RG90ICE9PSAtMSAmJiAobmV4dERvdCA8IG5leHRPQiB8fCBuZXh0T0IgPT09IC0xKSkgeyAvLyBkb3Qgbm90YXRpb25cbiAgICAgICAgICBwYXJ0cy5wdXNoKHBhdGguc2xpY2UoaW5kZXgsIG5leHREb3QpKTtcbiAgICAgICAgICBpbmRleCA9IG5leHREb3QgKyAxO1xuICAgICAgICB9IGVsc2UgeyAvLyBicmFja2V0IG5vdGF0aW9uXG4gICAgICAgICAgaWYgKG5leHRPQiA+IGluZGV4KSB7XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHBhdGguc2xpY2UoaW5kZXgsIG5leHRPQikpO1xuICAgICAgICAgICAgaW5kZXggPSBuZXh0T0I7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHF1b3RlID0gcGF0aC5jaGFyQXQobmV4dE9CICsgMSk7XG4gICAgICAgICAgaWYgKHF1b3RlID09PSAnXCInIHx8IHF1b3RlID09PSAnXFwnJykgeyAvLyBlbmNsb3NpbmcgcXVvdGVzXG4gICAgICAgICAgICBsZXQgbmV4dENCID0gcGF0aC5pbmRleE9mKHF1b3RlICsgJ10nLCBuZXh0T0IpOyAvLyBuZXh0IGNsb3NlIGJyYWNrZXRcbiAgICAgICAgICAgIHdoaWxlIChuZXh0Q0IgIT09IC0xICYmIHBhdGguY2hhckF0KG5leHRDQiAtIDEpID09PSAnXFxcXCcpIHtcbiAgICAgICAgICAgICAgbmV4dENCID0gcGF0aC5pbmRleE9mKHF1b3RlICsgJ10nLCBuZXh0Q0IgKyAyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXh0Q0IgPT09IC0xKSB7IG5leHRDQiA9IHBhdGgubGVuZ3RoOyB9XG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHBhdGguc2xpY2UoaW5kZXggKyAyLCBuZXh0Q0IpXG4gICAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoJ1xcXFwnICsgcXVvdGUsICdnJyksIHF1b3RlKSk7XG4gICAgICAgICAgICBpbmRleCA9IG5leHRDQiArIDI7XG4gICAgICAgICAgfSBlbHNlIHsgLy8gbm8gZW5jbG9zaW5nIHF1b3Rlc1xuICAgICAgICAgICAgbGV0IG5leHRDQiA9IHBhdGguaW5kZXhPZignXScsIG5leHRPQik7IC8vIG5leHQgY2xvc2UgYnJhY2tldFxuICAgICAgICAgICAgaWYgKG5leHRDQiA9PT0gLTEpIHsgbmV4dENCID0gcGF0aC5sZW5ndGg7IH1cbiAgICAgICAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShpbmRleCArIDEsIG5leHRDQikpO1xuICAgICAgICAgICAgaW5kZXggPSBuZXh0Q0IgKyAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGF0aC5jaGFyQXQoaW5kZXgpID09PSAnLicpIHsgaW5kZXgrKzsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFydHM7XG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoJ3BhcnNlT2JqZWN0UGF0aCBlcnJvcjogSW5wdXQgb2JqZWN0IHBhdGggbXVzdCBiZSBhIHN0cmluZy4nKTtcbiAgfVxufVxuIl19