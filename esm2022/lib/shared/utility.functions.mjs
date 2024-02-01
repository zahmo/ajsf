import { hasValue, inArray, isArray, isDefined, isEmpty, isMap, isObject, isSet, isString } from './validator.functions';
/**
 * Utility function library:
 *
 * addClasses, copy, forEach, forEachCopy, hasOwn, mergeFilteredObject,
 * uniqueItems, commonItems, fixTitle, toTitleCase
*/
/**
 * 'addClasses' function
 *
 * Merges two space-delimited lists of CSS classes and removes duplicates.
 *
 * // {string | string[] | Set<string>} oldClasses
 * // {string | string[] | Set<string>} newClasses
 * // {string | string[] | Set<string>} - Combined classes
 */
export function addClasses(oldClasses, newClasses) {
    const badType = i => !isSet(i) && !isArray(i) && !isString(i);
    if (badType(newClasses)) {
        return oldClasses;
    }
    if (badType(oldClasses)) {
        oldClasses = '';
    }
    const toSet = i => isSet(i) ? i : isArray(i) ? new Set(i) : new Set(i.split(' '));
    const combinedSet = toSet(oldClasses);
    const newSet = toSet(newClasses);
    newSet.forEach(c => combinedSet.add(c));
    if (isSet(oldClasses)) {
        return combinedSet;
    }
    if (isArray(oldClasses)) {
        return Array.from(combinedSet);
    }
    return Array.from(combinedSet).join(' ');
}
/**
 * 'copy' function
 *
 * Makes a shallow copy of a JavaScript object, array, Map, or Set.
 * If passed a JavaScript primitive value (string, number, boolean, or null),
 * it returns the value.
 *
 * // {Object|Array|string|number|boolean|null} object - The object to copy
 * // {boolean = false} errors - Show errors?
 * // {Object|Array|string|number|boolean|null} - The copied object
 */
export function copy(object, errors = false) {
    if (typeof object !== 'object' || object === null) {
        return object;
    }
    if (isMap(object)) {
        return new Map(object);
    }
    if (isSet(object)) {
        return new Set(object);
    }
    if (isArray(object)) {
        return [...object];
    }
    if (isObject(object)) {
        return { ...object };
    }
    if (errors) {
        console.error('copy error: Object to copy must be a JavaScript object or value.');
    }
    return object;
}
/**
 * 'forEach' function
 *
 * Iterates over all items in the first level of an object or array
 * and calls an iterator funciton on each item.
 *
 * The iterator function is called with four values:
 * 1. The current item's value
 * 2. The current item's key
 * 3. The parent object, which contains the current item
 * 4. The root object
 *
 * Setting the optional third parameter to 'top-down' or 'bottom-up' will cause
 * it to also recursively iterate over items in sub-objects or sub-arrays in the
 * specified direction.
 *
 * // {Object|Array} object - The object or array to iterate over
 * // {function} fn - the iterator funciton to call on each item
 * // {boolean = false} errors - Show errors?
 * // {void}
 */
export function forEach(object, fn, recurse = false, rootObject = object, errors = false) {
    if (isEmpty(object)) {
        return;
    }
    if ((isObject(object) || isArray(object)) && typeof fn === 'function') {
        for (const key of Object.keys(object)) {
            const value = object[key];
            if (recurse === 'bottom-up' && (isObject(value) || isArray(value))) {
                forEach(value, fn, recurse, rootObject);
            }
            fn(value, key, object, rootObject);
            if (recurse === 'top-down' && (isObject(value) || isArray(value))) {
                forEach(value, fn, recurse, rootObject);
            }
        }
    }
    if (errors) {
        if (typeof fn !== 'function') {
            console.error('forEach error: Iterator must be a function.');
            console.error('function', fn);
        }
        if (!isObject(object) && !isArray(object)) {
            console.error('forEach error: Input object must be an object or array.');
            console.error('object', object);
        }
    }
}
/**
 * 'forEachCopy' function
 *
 * Iterates over all items in the first level of an object or array
 * and calls an iterator function on each item. Returns a new object or array
 * with the same keys or indexes as the original, and values set to the results
 * of the iterator function.
 *
 * Does NOT recursively iterate over items in sub-objects or sub-arrays.
 *
 * // {Object | Array} object - The object or array to iterate over
 * // {function} fn - The iterator funciton to call on each item
 * // {boolean = false} errors - Show errors?
 * // {Object | Array} - The resulting object or array
 */
export function forEachCopy(object, fn, errors = false) {
    if (!hasValue(object)) {
        return;
    }
    if ((isObject(object) || isArray(object)) && typeof object !== 'function') {
        const newObject = isArray(object) ? [] : {};
        for (const key of Object.keys(object)) {
            newObject[key] = fn(object[key], key, object);
        }
        return newObject;
    }
    if (errors) {
        if (typeof fn !== 'function') {
            console.error('forEachCopy error: Iterator must be a function.');
            console.error('function', fn);
        }
        if (!isObject(object) && !isArray(object)) {
            console.error('forEachCopy error: Input object must be an object or array.');
            console.error('object', object);
        }
    }
}
/**
 * 'hasOwn' utility function
 *
 * Checks whether an object or array has a particular property.
 *
 * // {any} object - the object to check
 * // {string} property - the property to look for
 * // {boolean} - true if object has property, false if not
 */
export function hasOwn(object, property) {
    if (!object || !['number', 'string', 'symbol'].includes(typeof property) ||
        (!isObject(object) && !isArray(object) && !isMap(object) && !isSet(object))) {
        return false;
    }
    if (isMap(object) || isSet(object)) {
        return object.has(property);
    }
    if (typeof property === 'number') {
        if (isArray(object)) {
            return object[property];
        }
        property = property + '';
    }
    return object.hasOwnProperty(property);
}
/**
 * Types of possible expressions which the app is able to evaluate.
 */
export var ExpressionType;
(function (ExpressionType) {
    ExpressionType[ExpressionType["EQUALS"] = 0] = "EQUALS";
    ExpressionType[ExpressionType["NOT_EQUALS"] = 1] = "NOT_EQUALS";
    ExpressionType[ExpressionType["NOT_AN_EXPRESSION"] = 2] = "NOT_AN_EXPRESSION";
})(ExpressionType || (ExpressionType = {}));
/**
 * Detects the type of expression from the given candidate. `==` for equals,
 * `!=` for not equals. If none of these are contained in the candidate, the candidate
 * is not considered to be an expression at all and thus `NOT_AN_EXPRESSION` is returned.
 * // {expressionCandidate} expressionCandidate - potential expression
 */
export function getExpressionType(expressionCandidate) {
    if (expressionCandidate.indexOf('==') !== -1) {
        return ExpressionType.EQUALS;
    }
    if (expressionCandidate.toString().indexOf('!=') !== -1) {
        return ExpressionType.NOT_EQUALS;
    }
    return ExpressionType.NOT_AN_EXPRESSION;
}
export function isEqual(expressionType) {
    return expressionType === ExpressionType.EQUALS;
}
export function isNotEqual(expressionType) {
    return expressionType === ExpressionType.NOT_EQUALS;
}
export function isNotExpression(expressionType) {
    return expressionType === ExpressionType.NOT_AN_EXPRESSION;
}
/**
 * Splits the expression key by the expressionType on a pair of values
 * before and after the equals or nor equals sign.
 * // {expressionType} enum of an expression type
 * // {key} the given key from a for loop iver all conditions
 */
export function getKeyAndValueByExpressionType(expressionType, key) {
    if (isEqual(expressionType)) {
        return key.split('==', 2);
    }
    if (isNotEqual(expressionType)) {
        return key.split('!=', 2);
    }
    return null;
}
export function cleanValueOfQuotes(keyAndValue) {
    if (keyAndValue.charAt(0) === '\'' && keyAndValue.charAt(keyAndValue.length - 1) === '\'') {
        return keyAndValue.replace('\'', '').replace('\'', '');
    }
    return keyAndValue;
}
/**
 * 'mergeFilteredObject' utility function
 *
 * Shallowly merges two objects, setting key and values from source object
 * in target object, excluding specified keys.
 *
 * Optionally, it can also use functions to transform the key names and/or
 * the values of the merging object.
 *
 * // {PlainObject} targetObject - Target object to add keys and values to
 * // {PlainObject} sourceObject - Source object to copy keys and values from
 * // {string[]} excludeKeys - Array of keys to exclude
 * // {(string: string) => string = (k) => k} keyFn - Function to apply to keys
 * // {(any: any) => any = (v) => v} valueFn - Function to apply to values
 * // {PlainObject} - Returns targetObject
 */
export function mergeFilteredObject(targetObject, sourceObject, excludeKeys = [], keyFn = (key) => key, valFn = (val) => val) {
    if (!isObject(sourceObject)) {
        return targetObject;
    }
    if (!isObject(targetObject)) {
        targetObject = {};
    }
    for (const key of Object.keys(sourceObject)) {
        if (!inArray(key, excludeKeys) && isDefined(sourceObject[key])) {
            targetObject[keyFn(key)] = valFn(sourceObject[key]);
        }
    }
    return targetObject;
}
/**
 * 'uniqueItems' function
 *
 * Accepts any number of string value inputs,
 * and returns an array of all input vaues, excluding duplicates.
 *
 * // {...string} ...items -
 * // {string[]} -
 */
export function uniqueItems(...items) {
    const returnItems = [];
    for (const item of items) {
        if (!returnItems.includes(item)) {
            returnItems.push(item);
        }
    }
    return returnItems;
}
/**
 * 'commonItems' function
 *
 * Accepts any number of strings or arrays of string values,
 * and returns a single array containing only values present in all inputs.
 *
 * // {...string|string[]} ...arrays -
 * // {string[]} -
 */
export function commonItems(...arrays) {
    let returnItems = null;
    for (let array of arrays) {
        if (isString(array)) {
            array = [array];
        }
        returnItems = returnItems === null ? [...array] :
            returnItems.filter(item => array.includes(item));
        if (!returnItems.length) {
            return [];
        }
    }
    return returnItems;
}
/**
 * 'fixTitle' function
 *
 *
 * // {string} input -
 * // {string} -
 */
export function fixTitle(name) {
    return name && toTitleCase(name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' '));
}
/**
 * 'toTitleCase' function
 *
 * Intelligently converts an input string to Title Case.
 *
 * Accepts an optional second parameter with a list of additional
 * words and abbreviations to force into a particular case.
 *
 * This function is built on prior work by John Gruber and David Gouch:
 * http://daringfireball.net/2008/08/title_case_update
 * https://github.com/gouch/to-title-case
 *
 * // {string} input -
 * // {string|string[]} forceWords? -
 * // {string} -
 */
export function toTitleCase(input, forceWords) {
    if (!isString(input)) {
        return input;
    }
    let forceArray = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'en',
        'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'v', 'v.',
        'vs', 'vs.', 'via'];
    if (isString(forceWords)) {
        forceWords = forceWords.split('|');
    }
    if (isArray(forceWords)) {
        forceArray = forceArray.concat(forceWords);
    }
    const forceArrayLower = forceArray.map(w => w.toLowerCase());
    const noInitialCase = input === input.toUpperCase() || input === input.toLowerCase();
    let prevLastChar = '';
    input = input.trim();
    return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (word, idx) => {
        if (!noInitialCase && word.slice(1).search(/[A-Z]|\../) !== -1) {
            return word;
        }
        else {
            let newWord;
            const forceWord = forceArray[forceArrayLower.indexOf(word.toLowerCase())];
            if (!forceWord) {
                if (noInitialCase) {
                    if (word.slice(1).search(/\../) !== -1) {
                        newWord = word.toLowerCase();
                    }
                    else {
                        newWord = word[0].toUpperCase() + word.slice(1).toLowerCase();
                    }
                }
                else {
                    newWord = word[0].toUpperCase() + word.slice(1);
                }
            }
            else if (forceWord === forceWord.toLowerCase() && (idx === 0 || idx + word.length === input.length ||
                prevLastChar === ':' || input[idx - 1].search(/[^\s-]/) !== -1 ||
                (input[idx - 1] !== '-' && input[idx + word.length] === '-'))) {
                newWord = forceWord[0].toUpperCase() + forceWord.slice(1);
            }
            else {
                newWord = forceWord;
            }
            prevLastChar = word.slice(-1);
            return newWord;
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eS5mdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96YWpzZi1jb3JlL3NyYy9saWIvc2hhcmVkL3V0aWxpdHkuZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBYyxNQUFNLHVCQUF1QixDQUFDO0FBRXBJOzs7OztFQUtFO0FBRUY7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLFVBQVUsVUFBVSxDQUN4QixVQUEyQyxFQUMzQyxVQUEyQztJQUUzQyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQUUsT0FBTyxVQUFVLENBQUM7S0FBRTtJQUMvQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUFFLFVBQVUsR0FBRyxFQUFFLENBQUM7S0FBRTtJQUM3QyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEYsTUFBTSxXQUFXLEdBQWEsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lB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QU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUM3RCxFQUNEO2dCQUNBLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzRDtpQkFBTTtnQkFDTCxPQUFPLEdBQUcsU0FBUyxDQUFDO2FBQ3JCO1lBQ0QsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixPQUFPLE9BQU8sQ0FBQztTQUNoQjtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aGFzVmFsdWUsIGluQXJyYXksIGlzQXJyYXksIGlzRGVmaW5lZCwgaXNFbXB0eSwgaXNNYXAsIGlzT2JqZWN0LCBpc1NldCwgaXNTdHJpbmcsIFBsYWluT2JqZWN0fSBmcm9tICcuL3ZhbGlkYXRvci5mdW5jdGlvbnMnO1xuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gbGlicmFyeTpcbiAqXG4gKiBhZGRDbGFzc2VzLCBjb3B5LCBmb3JFYWNoLCBmb3JFYWNoQ29weSwgaGFzT3duLCBtZXJnZUZpbHRlcmVkT2JqZWN0LFxuICogdW5pcXVlSXRlbXMsIGNvbW1vbkl0ZW1zLCBmaXhUaXRsZSwgdG9UaXRsZUNhc2VcbiovXG5cbi8qKlxuICogJ2FkZENsYXNzZXMnIGZ1bmN0aW9uXG4gKlxuICogTWVyZ2VzIHR3byBzcGFjZS1kZWxpbWl0ZWQgbGlzdHMgb2YgQ1NTIGNsYXNzZXMgYW5kIHJlbW92ZXMgZHVwbGljYXRlcy5cbiAqXG4gKiAvLyB7c3RyaW5nIHwgc3RyaW5nW10gfCBTZXQ8c3RyaW5nPn0gb2xkQ2xhc3Nlc1xuICogLy8ge3N0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz59IG5ld0NsYXNzZXNcbiAqIC8vIHtzdHJpbmcgfCBzdHJpbmdbXSB8IFNldDxzdHJpbmc+fSAtIENvbWJpbmVkIGNsYXNzZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZENsYXNzZXMoXG4gIG9sZENsYXNzZXM6IHN0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz4sXG4gIG5ld0NsYXNzZXM6IHN0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz5cbik6IHN0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz4ge1xuICBjb25zdCBiYWRUeXBlID0gaSA9PiAhaXNTZXQoaSkgJiYgIWlzQXJyYXkoaSkgJiYgIWlzU3RyaW5nKGkpO1xuICBpZiAoYmFkVHlwZShuZXdDbGFzc2VzKSkgeyByZXR1cm4gb2xkQ2xhc3NlczsgfVxuICBpZiAoYmFkVHlwZShvbGRDbGFzc2VzKSkgeyBvbGRDbGFzc2VzID0gJyc7IH1cbiAgY29uc3QgdG9TZXQgPSBpID0+IGlzU2V0KGkpID8gaSA6IGlzQXJyYXkoaSkgPyBuZXcgU2V0KGkpIDogbmV3IFNldChpLnNwbGl0KCcgJykpO1xuICBjb25zdCBjb21iaW5lZFNldDogU2V0PGFueT4gPSB0b1NldChvbGRDbGFzc2VzKTtcbiAgY29uc3QgbmV3U2V0OiBTZXQ8YW55PiA9IHRvU2V0KG5ld0NsYXNzZXMpO1xuICBuZXdTZXQuZm9yRWFjaChjID0+IGNvbWJpbmVkU2V0LmFkZChjKSk7XG4gIGlmIChpc1NldChvbGRDbGFzc2VzKSkgeyByZXR1cm4gY29tYmluZWRTZXQ7IH1cbiAgaWYgKGlzQXJyYXkob2xkQ2xhc3NlcykpIHsgcmV0dXJuIEFycmF5LmZyb20oY29tYmluZWRTZXQpOyB9XG4gIHJldHVybiBBcnJheS5mcm9tKGNvbWJpbmVkU2V0KS5qb2luKCcgJyk7XG59XG5cbi8qKlxuICogJ2NvcHknIGZ1bmN0aW9uXG4gKlxuICogTWFrZXMgYSBzaGFsbG93IGNvcHkgb2YgYSBKYXZhU2NyaXB0IG9iamVjdCwgYXJyYXksIE1hcCwgb3IgU2V0LlxuICogSWYgcGFzc2VkIGEgSmF2YVNjcmlwdCBwcmltaXRpdmUgdmFsdWUgKHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBvciBudWxsKSxcbiAqIGl0IHJldHVybnMgdGhlIHZhbHVlLlxuICpcbiAqIC8vIHtPYmplY3R8QXJyYXl8c3RyaW5nfG51bWJlcnxib29sZWFufG51bGx9IG9iamVjdCAtIFRoZSBvYmplY3QgdG8gY29weVxuICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gZXJyb3JzIC0gU2hvdyBlcnJvcnM/XG4gKiAvLyB7T2JqZWN0fEFycmF5fHN0cmluZ3xudW1iZXJ8Ym9vbGVhbnxudWxsfSAtIFRoZSBjb3BpZWQgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG9iamVjdDogYW55LCBlcnJvcnMgPSBmYWxzZSk6IGFueSB7XG4gIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBvYmplY3QgPT09IG51bGwpIHsgcmV0dXJuIG9iamVjdDsgfVxuICBpZiAoaXNNYXAob2JqZWN0KSkgICAgeyByZXR1cm4gbmV3IE1hcChvYmplY3QpOyB9XG4gIGlmIChpc1NldChvYmplY3QpKSAgICB7IHJldHVybiBuZXcgU2V0KG9iamVjdCk7IH1cbiAgaWYgKGlzQXJyYXkob2JqZWN0KSkgIHsgcmV0dXJuIFsgLi4ub2JqZWN0IF07ICAgfVxuICBpZiAoaXNPYmplY3Qob2JqZWN0KSkgeyByZXR1cm4geyAuLi5vYmplY3QgfTsgICB9XG4gIGlmIChlcnJvcnMpIHtcbiAgICBjb25zb2xlLmVycm9yKCdjb3B5IGVycm9yOiBPYmplY3QgdG8gY29weSBtdXN0IGJlIGEgSmF2YVNjcmlwdCBvYmplY3Qgb3IgdmFsdWUuJyk7XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLyoqXG4gKiAnZm9yRWFjaCcgZnVuY3Rpb25cbiAqXG4gKiBJdGVyYXRlcyBvdmVyIGFsbCBpdGVtcyBpbiB0aGUgZmlyc3QgbGV2ZWwgb2YgYW4gb2JqZWN0IG9yIGFycmF5XG4gKiBhbmQgY2FsbHMgYW4gaXRlcmF0b3IgZnVuY2l0b24gb24gZWFjaCBpdGVtLlxuICpcbiAqIFRoZSBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBmb3VyIHZhbHVlczpcbiAqIDEuIFRoZSBjdXJyZW50IGl0ZW0ncyB2YWx1ZVxuICogMi4gVGhlIGN1cnJlbnQgaXRlbSdzIGtleVxuICogMy4gVGhlIHBhcmVudCBvYmplY3QsIHdoaWNoIGNvbnRhaW5zIHRoZSBjdXJyZW50IGl0ZW1cbiAqIDQuIFRoZSByb290IG9iamVjdFxuICpcbiAqIFNldHRpbmcgdGhlIG9wdGlvbmFsIHRoaXJkIHBhcmFtZXRlciB0byAndG9wLWRvd24nIG9yICdib3R0b20tdXAnIHdpbGwgY2F1c2VcbiAqIGl0IHRvIGFsc28gcmVjdXJzaXZlbHkgaXRlcmF0ZSBvdmVyIGl0ZW1zIGluIHN1Yi1vYmplY3RzIG9yIHN1Yi1hcnJheXMgaW4gdGhlXG4gKiBzcGVjaWZpZWQgZGlyZWN0aW9uLlxuICpcbiAqIC8vIHtPYmplY3R8QXJyYXl9IG9iamVjdCAtIFRoZSBvYmplY3Qgb3IgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyXG4gKiAvLyB7ZnVuY3Rpb259IGZuIC0gdGhlIGl0ZXJhdG9yIGZ1bmNpdG9uIHRvIGNhbGwgb24gZWFjaCBpdGVtXG4gKiAvLyB7Ym9vbGVhbiA9IGZhbHNlfSBlcnJvcnMgLSBTaG93IGVycm9ycz9cbiAqIC8vIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaChcbiAgb2JqZWN0OiBhbnksIGZuOiAodjogYW55LCBrPzogc3RyaW5nIHwgbnVtYmVyLCBjPzogYW55LCByYz86IGFueSkgPT4gYW55LFxuICByZWN1cnNlOiBib29sZWFuIHwgc3RyaW5nID0gZmFsc2UsIHJvb3RPYmplY3Q6IGFueSA9IG9iamVjdCwgZXJyb3JzID0gZmFsc2Vcbik6IHZvaWQge1xuICBpZiAoaXNFbXB0eShvYmplY3QpKSB7IHJldHVybjsgfVxuICBpZiAoKGlzT2JqZWN0KG9iamVjdCkgfHwgaXNBcnJheShvYmplY3QpKSAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmplY3QpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG9iamVjdFtrZXldO1xuICAgICAgaWYgKHJlY3Vyc2UgPT09ICdib3R0b20tdXAnICYmIChpc09iamVjdCh2YWx1ZSkgfHwgaXNBcnJheSh2YWx1ZSkpKSB7XG4gICAgICAgIGZvckVhY2godmFsdWUsIGZuLCByZWN1cnNlLCByb290T2JqZWN0KTtcbiAgICAgIH1cbiAgICAgIGZuKHZhbHVlLCBrZXksIG9iamVjdCwgcm9vdE9iamVjdCk7XG4gICAgICBpZiAocmVjdXJzZSA9PT0gJ3RvcC1kb3duJyAmJiAoaXNPYmplY3QodmFsdWUpIHx8IGlzQXJyYXkodmFsdWUpKSkge1xuICAgICAgICBmb3JFYWNoKHZhbHVlLCBmbiwgcmVjdXJzZSwgcm9vdE9iamVjdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChlcnJvcnMpIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdmb3JFYWNoIGVycm9yOiBJdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdmdW5jdGlvbicsIGZuKTtcbiAgICB9XG4gICAgaWYgKCFpc09iamVjdChvYmplY3QpICYmICFpc0FycmF5KG9iamVjdCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2ZvckVhY2ggZXJyb3I6IElucHV0IG9iamVjdCBtdXN0IGJlIGFuIG9iamVjdCBvciBhcnJheS4nKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ29iamVjdCcsIG9iamVjdCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogJ2ZvckVhY2hDb3B5JyBmdW5jdGlvblxuICpcbiAqIEl0ZXJhdGVzIG92ZXIgYWxsIGl0ZW1zIGluIHRoZSBmaXJzdCBsZXZlbCBvZiBhbiBvYmplY3Qgb3IgYXJyYXlcbiAqIGFuZCBjYWxscyBhbiBpdGVyYXRvciBmdW5jdGlvbiBvbiBlYWNoIGl0ZW0uIFJldHVybnMgYSBuZXcgb2JqZWN0IG9yIGFycmF5XG4gKiB3aXRoIHRoZSBzYW1lIGtleXMgb3IgaW5kZXhlcyBhcyB0aGUgb3JpZ2luYWwsIGFuZCB2YWx1ZXMgc2V0IHRvIHRoZSByZXN1bHRzXG4gKiBvZiB0aGUgaXRlcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogRG9lcyBOT1QgcmVjdXJzaXZlbHkgaXRlcmF0ZSBvdmVyIGl0ZW1zIGluIHN1Yi1vYmplY3RzIG9yIHN1Yi1hcnJheXMuXG4gKlxuICogLy8ge09iamVjdCB8IEFycmF5fSBvYmplY3QgLSBUaGUgb2JqZWN0IG9yIGFycmF5IHRvIGl0ZXJhdGUgb3ZlclxuICogLy8ge2Z1bmN0aW9ufSBmbiAtIFRoZSBpdGVyYXRvciBmdW5jaXRvbiB0byBjYWxsIG9uIGVhY2ggaXRlbVxuICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gZXJyb3JzIC0gU2hvdyBlcnJvcnM/XG4gKiAvLyB7T2JqZWN0IHwgQXJyYXl9IC0gVGhlIHJlc3VsdGluZyBvYmplY3Qgb3IgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvckVhY2hDb3B5KFxuICBvYmplY3Q6IGFueSwgZm46ICh2OiBhbnksIGs/OiBzdHJpbmcgfCBudW1iZXIsIG8/OiBhbnksIHA/OiBzdHJpbmcpID0+IGFueSxcbiAgZXJyb3JzID0gZmFsc2Vcbik6IGFueSB7XG4gIGlmICghaGFzVmFsdWUob2JqZWN0KSkgeyByZXR1cm47IH1cbiAgaWYgKChpc09iamVjdChvYmplY3QpIHx8IGlzQXJyYXkob2JqZWN0KSkgJiYgdHlwZW9mIG9iamVjdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnN0IG5ld09iamVjdDogYW55ID0gaXNBcnJheShvYmplY3QpID8gW10gOiB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmplY3QpKSB7XG4gICAgICBuZXdPYmplY3Rba2V5XSA9IGZuKG9iamVjdFtrZXldLCBrZXksIG9iamVjdCk7XG4gICAgfVxuICAgIHJldHVybiBuZXdPYmplY3Q7XG4gIH1cbiAgaWYgKGVycm9ycykge1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2ZvckVhY2hDb3B5IGVycm9yOiBJdGVyYXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdmdW5jdGlvbicsIGZuKTtcbiAgICB9XG4gICAgaWYgKCFpc09iamVjdChvYmplY3QpICYmICFpc0FycmF5KG9iamVjdCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2ZvckVhY2hDb3B5IGVycm9yOiBJbnB1dCBvYmplY3QgbXVzdCBiZSBhbiBvYmplY3Qgb3IgYXJyYXkuJyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdvYmplY3QnLCBvYmplY3QpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqICdoYXNPd24nIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3Mgd2hldGhlciBhbiBvYmplY3Qgb3IgYXJyYXkgaGFzIGEgcGFydGljdWxhciBwcm9wZXJ0eS5cbiAqXG4gKiAvLyB7YW55fSBvYmplY3QgLSB0aGUgb2JqZWN0IHRvIGNoZWNrXG4gKiAvLyB7c3RyaW5nfSBwcm9wZXJ0eSAtIHRoZSBwcm9wZXJ0eSB0byBsb29rIGZvclxuICogLy8ge2Jvb2xlYW59IC0gdHJ1ZSBpZiBvYmplY3QgaGFzIHByb3BlcnR5LCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc093bihvYmplY3Q6IGFueSwgcHJvcGVydHk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIW9iamVjdCB8fCAhWydudW1iZXInLCAnc3RyaW5nJywgJ3N5bWJvbCddLmluY2x1ZGVzKHR5cGVvZiBwcm9wZXJ0eSkgfHxcbiAgICAoIWlzT2JqZWN0KG9iamVjdCkgJiYgIWlzQXJyYXkob2JqZWN0KSAmJiAhaXNNYXAob2JqZWN0KSAmJiAhaXNTZXQob2JqZWN0KSlcbiAgKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAoaXNNYXAob2JqZWN0KSB8fCBpc1NldChvYmplY3QpKSB7IHJldHVybiBvYmplY3QuaGFzKHByb3BlcnR5KTsgfVxuICBpZiAodHlwZW9mIHByb3BlcnR5ID09PSAnbnVtYmVyJykge1xuICAgIGlmIChpc0FycmF5KG9iamVjdCkpIHsgcmV0dXJuIG9iamVjdFs8bnVtYmVyPnByb3BlcnR5XTsgfVxuICAgIHByb3BlcnR5ID0gcHJvcGVydHkgKyAnJztcbiAgfVxuICByZXR1cm4gb2JqZWN0Lmhhc093blByb3BlcnR5KHByb3BlcnR5KTtcbn1cblxuLyoqXG4gKiBUeXBlcyBvZiBwb3NzaWJsZSBleHByZXNzaW9ucyB3aGljaCB0aGUgYXBwIGlzIGFibGUgdG8gZXZhbHVhdGUuXG4gKi9cbmV4cG9ydCBlbnVtIEV4cHJlc3Npb25UeXBlIHtcbiAgRVFVQUxTLFxuICBOT1RfRVFVQUxTLFxuICBOT1RfQU5fRVhQUkVTU0lPTlxufVxuXG4vKipcbiAqIERldGVjdHMgdGhlIHR5cGUgb2YgZXhwcmVzc2lvbiBmcm9tIHRoZSBnaXZlbiBjYW5kaWRhdGUuIGA9PWAgZm9yIGVxdWFscyxcbiAqIGAhPWAgZm9yIG5vdCBlcXVhbHMuIElmIG5vbmUgb2YgdGhlc2UgYXJlIGNvbnRhaW5lZCBpbiB0aGUgY2FuZGlkYXRlLCB0aGUgY2FuZGlkYXRlXG4gKiBpcyBub3QgY29uc2lkZXJlZCB0byBiZSBhbiBleHByZXNzaW9uIGF0IGFsbCBhbmQgdGh1cyBgTk9UX0FOX0VYUFJFU1NJT05gIGlzIHJldHVybmVkLlxuICogLy8ge2V4cHJlc3Npb25DYW5kaWRhdGV9IGV4cHJlc3Npb25DYW5kaWRhdGUgLSBwb3RlbnRpYWwgZXhwcmVzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvblR5cGUoZXhwcmVzc2lvbkNhbmRpZGF0ZTogc3RyaW5nKTogRXhwcmVzc2lvblR5cGUge1xuICBpZiAoZXhwcmVzc2lvbkNhbmRpZGF0ZS5pbmRleE9mKCc9PScpICE9PSAtMSkge1xuICAgIHJldHVybiBFeHByZXNzaW9uVHlwZS5FUVVBTFM7XG4gIH1cblxuICBpZiAoZXhwcmVzc2lvbkNhbmRpZGF0ZS50b1N0cmluZygpLmluZGV4T2YoJyE9JykgIT09IC0xKSB7XG4gICAgcmV0dXJuIEV4cHJlc3Npb25UeXBlLk5PVF9FUVVBTFM7XG4gIH1cblxuICByZXR1cm4gRXhwcmVzc2lvblR5cGUuTk9UX0FOX0VYUFJFU1NJT047XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VxdWFsKGV4cHJlc3Npb25UeXBlKSB7XG4gIHJldHVybiBleHByZXNzaW9uVHlwZSBhcyBFeHByZXNzaW9uVHlwZSA9PT0gRXhwcmVzc2lvblR5cGUuRVFVQUxTO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb3RFcXVhbChleHByZXNzaW9uVHlwZSkge1xuICByZXR1cm4gZXhwcmVzc2lvblR5cGUgYXMgRXhwcmVzc2lvblR5cGUgPT09IEV4cHJlc3Npb25UeXBlLk5PVF9FUVVBTFM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05vdEV4cHJlc3Npb24oZXhwcmVzc2lvblR5cGUpIHtcbiAgcmV0dXJuIGV4cHJlc3Npb25UeXBlIGFzIEV4cHJlc3Npb25UeXBlID09PSBFeHByZXNzaW9uVHlwZS5OT1RfQU5fRVhQUkVTU0lPTjtcbn1cblxuLyoqXG4gKiBTcGxpdHMgdGhlIGV4cHJlc3Npb24ga2V5IGJ5IHRoZSBleHByZXNzaW9uVHlwZSBvbiBhIHBhaXIgb2YgdmFsdWVzXG4gKiBiZWZvcmUgYW5kIGFmdGVyIHRoZSBlcXVhbHMgb3Igbm9yIGVxdWFscyBzaWduLlxuICogLy8ge2V4cHJlc3Npb25UeXBlfSBlbnVtIG9mIGFuIGV4cHJlc3Npb24gdHlwZVxuICogLy8ge2tleX0gdGhlIGdpdmVuIGtleSBmcm9tIGEgZm9yIGxvb3AgaXZlciBhbGwgY29uZGl0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0S2V5QW5kVmFsdWVCeUV4cHJlc3Npb25UeXBlKGV4cHJlc3Npb25UeXBlOiBFeHByZXNzaW9uVHlwZSwga2V5OiBzdHJpbmcpIHtcbiAgaWYgKGlzRXF1YWwoZXhwcmVzc2lvblR5cGUpKSB7XG4gICAgcmV0dXJuIGtleS5zcGxpdCgnPT0nLCAyKTtcbiAgfVxuXG4gIGlmIChpc05vdEVxdWFsKGV4cHJlc3Npb25UeXBlKSkge1xuICAgIHJldHVybiBrZXkuc3BsaXQoJyE9JywgMik7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVmFsdWVPZlF1b3RlcyhrZXlBbmRWYWx1ZSk6IFN0cmluZyB7XG4gIGlmIChrZXlBbmRWYWx1ZS5jaGFyQXQoMCkgPT09ICdcXCcnICYmIGtleUFuZFZhbHVlLmNoYXJBdChrZXlBbmRWYWx1ZS5sZW5ndGggLSAxKSA9PT0gJ1xcJycpIHtcbiAgICByZXR1cm4ga2V5QW5kVmFsdWUucmVwbGFjZSgnXFwnJywgJycpLnJlcGxhY2UoJ1xcJycsICcnKTtcbiAgfVxuICByZXR1cm4ga2V5QW5kVmFsdWU7XG59XG5cbi8qKlxuICogJ21lcmdlRmlsdGVyZWRPYmplY3QnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBTaGFsbG93bHkgbWVyZ2VzIHR3byBvYmplY3RzLCBzZXR0aW5nIGtleSBhbmQgdmFsdWVzIGZyb20gc291cmNlIG9iamVjdFxuICogaW4gdGFyZ2V0IG9iamVjdCwgZXhjbHVkaW5nIHNwZWNpZmllZCBrZXlzLlxuICpcbiAqIE9wdGlvbmFsbHksIGl0IGNhbiBhbHNvIHVzZSBmdW5jdGlvbnMgdG8gdHJhbnNmb3JtIHRoZSBrZXkgbmFtZXMgYW5kL29yXG4gKiB0aGUgdmFsdWVzIG9mIHRoZSBtZXJnaW5nIG9iamVjdC5cbiAqXG4gKiAvLyB7UGxhaW5PYmplY3R9IHRhcmdldE9iamVjdCAtIFRhcmdldCBvYmplY3QgdG8gYWRkIGtleXMgYW5kIHZhbHVlcyB0b1xuICogLy8ge1BsYWluT2JqZWN0fSBzb3VyY2VPYmplY3QgLSBTb3VyY2Ugb2JqZWN0IHRvIGNvcHkga2V5cyBhbmQgdmFsdWVzIGZyb21cbiAqIC8vIHtzdHJpbmdbXX0gZXhjbHVkZUtleXMgLSBBcnJheSBvZiBrZXlzIHRvIGV4Y2x1ZGVcbiAqIC8vIHsoc3RyaW5nOiBzdHJpbmcpID0+IHN0cmluZyA9IChrKSA9PiBrfSBrZXlGbiAtIEZ1bmN0aW9uIHRvIGFwcGx5IHRvIGtleXNcbiAqIC8vIHsoYW55OiBhbnkpID0+IGFueSA9ICh2KSA9PiB2fSB2YWx1ZUZuIC0gRnVuY3Rpb24gdG8gYXBwbHkgdG8gdmFsdWVzXG4gKiAvLyB7UGxhaW5PYmplY3R9IC0gUmV0dXJucyB0YXJnZXRPYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRmlsdGVyZWRPYmplY3QoXG4gIHRhcmdldE9iamVjdDogUGxhaW5PYmplY3QsXG4gIHNvdXJjZU9iamVjdDogUGxhaW5PYmplY3QsXG4gIGV4Y2x1ZGVLZXlzID0gPHN0cmluZ1tdPltdLFxuICBrZXlGbiA9IChrZXk6IHN0cmluZyk6IHN0cmluZyA9PiBrZXksXG4gIHZhbEZuID0gKHZhbDogYW55KTogYW55ID0+IHZhbFxuKTogUGxhaW5PYmplY3Qge1xuICBpZiAoIWlzT2JqZWN0KHNvdXJjZU9iamVjdCkpIHsgcmV0dXJuIHRhcmdldE9iamVjdDsgfVxuICBpZiAoIWlzT2JqZWN0KHRhcmdldE9iamVjdCkpIHsgdGFyZ2V0T2JqZWN0ID0ge307IH1cbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc291cmNlT2JqZWN0KSkge1xuICAgIGlmICghaW5BcnJheShrZXksIGV4Y2x1ZGVLZXlzKSAmJiBpc0RlZmluZWQoc291cmNlT2JqZWN0W2tleV0pKSB7XG4gICAgICB0YXJnZXRPYmplY3Rba2V5Rm4oa2V5KV0gPSB2YWxGbihzb3VyY2VPYmplY3Rba2V5XSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0YXJnZXRPYmplY3Q7XG59XG5cbi8qKlxuICogJ3VuaXF1ZUl0ZW1zJyBmdW5jdGlvblxuICpcbiAqIEFjY2VwdHMgYW55IG51bWJlciBvZiBzdHJpbmcgdmFsdWUgaW5wdXRzLFxuICogYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgYWxsIGlucHV0IHZhdWVzLCBleGNsdWRpbmcgZHVwbGljYXRlcy5cbiAqXG4gKiAvLyB7Li4uc3RyaW5nfSAuLi5pdGVtcyAtXG4gKiAvLyB7c3RyaW5nW119IC1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZUl0ZW1zKC4uLml0ZW1zKTogc3RyaW5nW10ge1xuICBjb25zdCByZXR1cm5JdGVtcyA9IFtdO1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBpZiAoIXJldHVybkl0ZW1zLmluY2x1ZGVzKGl0ZW0pKSB7IHJldHVybkl0ZW1zLnB1c2goaXRlbSk7IH1cbiAgfVxuICByZXR1cm4gcmV0dXJuSXRlbXM7XG59XG5cbi8qKlxuICogJ2NvbW1vbkl0ZW1zJyBmdW5jdGlvblxuICpcbiAqIEFjY2VwdHMgYW55IG51bWJlciBvZiBzdHJpbmdzIG9yIGFycmF5cyBvZiBzdHJpbmcgdmFsdWVzLFxuICogYW5kIHJldHVybnMgYSBzaW5nbGUgYXJyYXkgY29udGFpbmluZyBvbmx5IHZhbHVlcyBwcmVzZW50IGluIGFsbCBpbnB1dHMuXG4gKlxuICogLy8gey4uLnN0cmluZ3xzdHJpbmdbXX0gLi4uYXJyYXlzIC1cbiAqIC8vIHtzdHJpbmdbXX0gLVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tbW9uSXRlbXMoLi4uYXJyYXlzKTogc3RyaW5nW10ge1xuICBsZXQgcmV0dXJuSXRlbXMgPSBudWxsO1xuICBmb3IgKGxldCBhcnJheSBvZiBhcnJheXMpIHtcbiAgICBpZiAoaXNTdHJpbmcoYXJyYXkpKSB7IGFycmF5ID0gW2FycmF5XTsgfVxuICAgIHJldHVybkl0ZW1zID0gcmV0dXJuSXRlbXMgPT09IG51bGwgPyBbIC4uLmFycmF5IF0gOlxuICAgICAgcmV0dXJuSXRlbXMuZmlsdGVyKGl0ZW0gPT4gYXJyYXkuaW5jbHVkZXMoaXRlbSkpO1xuICAgIGlmICghcmV0dXJuSXRlbXMubGVuZ3RoKSB7IHJldHVybiBbXTsgfVxuICB9XG4gIHJldHVybiByZXR1cm5JdGVtcztcbn1cblxuLyoqXG4gKiAnZml4VGl0bGUnIGZ1bmN0aW9uXG4gKlxuICpcbiAqIC8vIHtzdHJpbmd9IGlucHV0IC1cbiAqIC8vIHtzdHJpbmd9IC1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpeFRpdGxlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lICYmIHRvVGl0bGVDYXNlKG5hbWUucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxICQyJykucmVwbGFjZSgvXy9nLCAnICcpKTtcbn1cblxuLyoqXG4gKiAndG9UaXRsZUNhc2UnIGZ1bmN0aW9uXG4gKlxuICogSW50ZWxsaWdlbnRseSBjb252ZXJ0cyBhbiBpbnB1dCBzdHJpbmcgdG8gVGl0bGUgQ2FzZS5cbiAqXG4gKiBBY2NlcHRzIGFuIG9wdGlvbmFsIHNlY29uZCBwYXJhbWV0ZXIgd2l0aCBhIGxpc3Qgb2YgYWRkaXRpb25hbFxuICogd29yZHMgYW5kIGFiYnJldmlhdGlvbnMgdG8gZm9yY2UgaW50byBhIHBhcnRpY3VsYXIgY2FzZS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGJ1aWx0IG9uIHByaW9yIHdvcmsgYnkgSm9obiBHcnViZXIgYW5kIERhdmlkIEdvdWNoOlxuICogaHR0cDovL2RhcmluZ2ZpcmViYWxsLm5ldC8yMDA4LzA4L3RpdGxlX2Nhc2VfdXBkYXRlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ291Y2gvdG8tdGl0bGUtY2FzZVxuICpcbiAqIC8vIHtzdHJpbmd9IGlucHV0IC1cbiAqIC8vIHtzdHJpbmd8c3RyaW5nW119IGZvcmNlV29yZHM/IC1cbiAqIC8vIHtzdHJpbmd9IC1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvVGl0bGVDYXNlKGlucHV0OiBzdHJpbmcsIGZvcmNlV29yZHM/OiBzdHJpbmd8c3RyaW5nW10pOiBzdHJpbmcge1xuICBpZiAoIWlzU3RyaW5nKGlucHV0KSkgeyByZXR1cm4gaW5wdXQ7IH1cbiAgbGV0IGZvcmNlQXJyYXk6IHN0cmluZ1tdID0gWydhJywgJ2FuJywgJ2FuZCcsICdhcycsICdhdCcsICdidXQnLCAnYnknLCAnZW4nLFxuICAgJ2ZvcicsICdpZicsICdpbicsICdub3InLCAnb2YnLCAnb24nLCAnb3InLCAncGVyJywgJ3RoZScsICd0bycsICd2JywgJ3YuJyxcbiAgICd2cycsICd2cy4nLCAndmlhJ107XG4gIGlmIChpc1N0cmluZyhmb3JjZVdvcmRzKSkgeyBmb3JjZVdvcmRzID0gKDxzdHJpbmc+Zm9yY2VXb3Jkcykuc3BsaXQoJ3wnKTsgfVxuICBpZiAoaXNBcnJheShmb3JjZVdvcmRzKSkgeyBmb3JjZUFycmF5ID0gZm9yY2VBcnJheS5jb25jYXQoZm9yY2VXb3Jkcyk7IH1cbiAgY29uc3QgZm9yY2VBcnJheUxvd2VyOiBzdHJpbmdbXSA9IGZvcmNlQXJyYXkubWFwKHcgPT4gdy50b0xvd2VyQ2FzZSgpKTtcbiAgY29uc3Qgbm9Jbml0aWFsQ2FzZTogYm9vbGVhbiA9XG4gICAgaW5wdXQgPT09IGlucHV0LnRvVXBwZXJDYXNlKCkgfHwgaW5wdXQgPT09IGlucHV0LnRvTG93ZXJDYXNlKCk7XG4gIGxldCBwcmV2TGFzdENoYXIgPSAnJztcbiAgaW5wdXQgPSBpbnB1dC50cmltKCk7XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKC9bQS1aYS16MC05XFx1MDBDMC1cXHUwMEZGXStbXlxccy1dKi9nLCAod29yZCwgaWR4KSA9PiB7XG4gICAgaWYgKCFub0luaXRpYWxDYXNlICYmIHdvcmQuc2xpY2UoMSkuc2VhcmNoKC9bQS1aXXxcXC4uLykgIT09IC0xKSB7XG4gICAgICByZXR1cm4gd29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG5ld1dvcmQ6IHN0cmluZztcbiAgICAgIGNvbnN0IGZvcmNlV29yZDogc3RyaW5nID1cbiAgICAgICAgZm9yY2VBcnJheVtmb3JjZUFycmF5TG93ZXIuaW5kZXhPZih3b3JkLnRvTG93ZXJDYXNlKCkpXTtcbiAgICAgIGlmICghZm9yY2VXb3JkKSB7XG4gICAgICAgIGlmIChub0luaXRpYWxDYXNlKSB7XG4gICAgICAgICAgaWYgKHdvcmQuc2xpY2UoMSkuc2VhcmNoKC9cXC4uLykgIT09IC0xKSB7XG4gICAgICAgICAgICBuZXdXb3JkID0gd29yZC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdXb3JkID0gd29yZFswXS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdXb3JkID0gd29yZFswXS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgZm9yY2VXb3JkID09PSBmb3JjZVdvcmQudG9Mb3dlckNhc2UoKSAmJiAoXG4gICAgICAgICAgaWR4ID09PSAwIHx8IGlkeCArIHdvcmQubGVuZ3RoID09PSBpbnB1dC5sZW5ndGggfHxcbiAgICAgICAgICBwcmV2TGFzdENoYXIgPT09ICc6JyB8fCBpbnB1dFtpZHggLSAxXS5zZWFyY2goL1teXFxzLV0vKSAhPT0gLTEgfHxcbiAgICAgICAgICAoaW5wdXRbaWR4IC0gMV0gIT09ICctJyAmJiBpbnB1dFtpZHggKyB3b3JkLmxlbmd0aF0gPT09ICctJylcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIG5ld1dvcmQgPSBmb3JjZVdvcmRbMF0udG9VcHBlckNhc2UoKSArIGZvcmNlV29yZC5zbGljZSgxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1dvcmQgPSBmb3JjZVdvcmQ7XG4gICAgICB9XG4gICAgICBwcmV2TGFzdENoYXIgPSB3b3JkLnNsaWNlKC0xKTtcbiAgICAgIHJldHVybiBuZXdXb3JkO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=