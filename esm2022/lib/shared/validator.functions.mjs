import { from, Observable } from 'rxjs';
/**
 * '_executeValidators' utility function
 *
 * Validates a control against an array of validators, and returns
 * an array of the same length containing a combination of error messages
 * (from invalid validators) and null values (from valid validators)
 *
 * //  { AbstractControl } control - control to validate
 * //  { IValidatorFn[] } validators - array of validators
 * //  { boolean } invert - invert?
 * // { PlainObject[] } - array of nulls and error message
 */
export function _executeValidators(control, validators, invert = false) {
    return validators.map(validator => validator(control, invert));
}
/**
 * '_executeAsyncValidators' utility function
 *
 * Validates a control against an array of async validators, and returns
 * an array of observabe results of the same length containing a combination of
 * error messages (from invalid validators) and null values (from valid ones)
 *
 * //  { AbstractControl } control - control to validate
 * //  { AsyncIValidatorFn[] } validators - array of async validators
 * //  { boolean } invert - invert?
 * //  - array of observable nulls and error message
 */
export function _executeAsyncValidators(control, validators, invert = false) {
    return validators.map(validator => validator(control, invert));
}
/**
 * '_mergeObjects' utility function
 *
 * Recursively Merges one or more objects into a single object with combined keys.
 * Automatically detects and ignores null and undefined inputs.
 * Also detects duplicated boolean 'not' keys and XORs their values.
 *
 * //  { PlainObject[] } objects - one or more objects to merge
 * // { PlainObject } - merged object
 */
export function _mergeObjects(...objects) {
    const mergedObject = {};
    for (const currentObject of objects) {
        if (isObject(currentObject)) {
            for (const key of Object.keys(currentObject)) {
                const currentValue = currentObject[key];
                const mergedValue = mergedObject[key];
                mergedObject[key] = !isDefined(mergedValue) ? currentValue :
                    key === 'not' && isBoolean(mergedValue, 'strict') &&
                        isBoolean(currentValue, 'strict') ? xor(mergedValue, currentValue) :
                        getType(mergedValue) === 'object' && getType(currentValue) === 'object' ?
                            _mergeObjects(mergedValue, currentValue) :
                            currentValue;
            }
        }
    }
    return mergedObject;
}
/**
 * '_mergeErrors' utility function
 *
 * Merges an array of objects.
 * Used for combining the validator errors returned from 'executeValidators'
 *
 * //  { PlainObject[] } arrayOfErrors - array of objects
 * // { PlainObject } - merged object, or null if no usable input objectcs
 */
export function _mergeErrors(arrayOfErrors) {
    const mergedErrors = _mergeObjects(...arrayOfErrors);
    return isEmpty(mergedErrors) ? null : mergedErrors;
}
/**
 * 'isDefined' utility function
 *
 * Checks if a variable contains a value of any type.
 * Returns true even for otherwise 'falsey' values of 0, '', and false.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined or null, otherwise true
 */
export function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * 'hasValue' utility function
 *
 * Checks if a variable contains a value.
 * Returs false for null, undefined, or a zero-length strng, '',
 * otherwise returns true.
 * (Stricter than 'isDefined' because it also returns false for '',
 * though it stil returns true for otherwise 'falsey' values 0 and false.)
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function hasValue(value) {
    return value !== undefined && value !== null && value !== '';
}
/**
 * 'isEmpty' utility function
 *
 * Similar to !hasValue, but also returns true for empty arrays and objects.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function isEmpty(value) {
    if (isArray(value)) {
        return !value.length;
    }
    if (isObject(value)) {
        return !Object.keys(value).length;
    }
    return value === undefined || value === null || value === '';
}
/**
 * 'isString' utility function
 *
 * Checks if a value is a string.
 *
 * //   value - the value to check
 * // { boolean } - true if string, false if not
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * 'isNumber' utility function
 *
 * Checks if a value is a regular number, numeric string, or JavaScript Date.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { boolean } - true if number, false if not
 */
export function isNumber(value, strict = false) {
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0;
}
/**
 * 'isInteger' utility function
 *
 * Checks if a value is an integer.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // {boolean } - true if number, false if not
 */
export function isInteger(value, strict = false) {
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0 && value % 1 === 0;
}
/**
 * 'isBoolean' utility function
 *
 * Checks if a value is a boolean.
 *
 * //   value - the value to check
 * //  { any = null } option - if 'strict', also checks JavaScript type
 *                              if TRUE or FALSE, checks only for that value
 * // { boolean } - true if boolean, false if not
 */
export function isBoolean(value, option = null) {
    if (option === 'strict') {
        return value === true || value === false;
    }
    if (option === true) {
        return value === true || value === 1 || value === 'true' || value === '1';
    }
    if (option === false) {
        return value === false || value === 0 || value === 'false' || value === '0';
    }
    return value === true || value === 1 || value === 'true' || value === '1' ||
        value === false || value === 0 || value === 'false' || value === '0';
}
export function isFunction(item) {
    return typeof item === 'function';
}
export function isObject(item) {
    return item !== null && typeof item === 'object';
}
export function isArray(item) {
    return Array.isArray(item);
}
export function isDate(item) {
    return !!item && Object.prototype.toString.call(item) === '[object Date]';
}
export function isMap(item) {
    return !!item && Object.prototype.toString.call(item) === '[object Map]';
}
export function isSet(item) {
    return !!item && Object.prototype.toString.call(item) === '[object Set]';
}
export function isSymbol(item) {
    return typeof item === 'symbol';
}
/**
 * 'getType' function
 *
 * Detects the JSON Schema Type of a value.
 * By default, detects numbers and integers even if formatted as strings.
 * (So all integers are also numbers, and any number may also be a string.)
 * However, it only detects true boolean values (to detect boolean values
 * in non-boolean formats, use isBoolean() instead).
 *
 * If passed a second optional parameter of 'strict', it will only detect
 * numbers and integers if they are formatted as JavaScript numbers.
 *
 * Examples:
 * getType('10.5') = 'number'
 * getType(10.5) = 'number'
 * getType('10') = 'integer'
 * getType(10) = 'integer'
 * getType('true') = 'string'
 * getType(true) = 'boolean'
 * getType(null) = 'null'
 * getType({ }) = 'object'
 * getType([]) = 'array'
 *
 * getType('10.5', 'strict') = 'string'
 * getType(10.5, 'strict') = 'number'
 * getType('10', 'strict') = 'string'
 * getType(10, 'strict') = 'integer'
 * getType('true', 'strict') = 'string'
 * getType(true, 'strict') = 'boolean'
 *
 * //   value - value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { SchemaType }
 */
export function getType(value, strict = false) {
    if (!isDefined(value)) {
        return 'null';
    }
    if (isArray(value)) {
        return 'array';
    }
    if (isObject(value)) {
        return 'object';
    }
    if (isBoolean(value, 'strict')) {
        return 'boolean';
    }
    if (isInteger(value, strict)) {
        return 'integer';
    }
    if (isNumber(value, strict)) {
        return 'number';
    }
    if (isString(value) || (!strict && isDate(value))) {
        return 'string';
    }
    return null;
}
/**
 * 'isType' function
 *
 * Checks wether an input (probably string) value contains data of
 * a specified JSON Schema type
 *
 * //  { PrimitiveValue } value - value to check
 * //  { SchemaPrimitiveType } type - type to check
 * // { boolean }
 */
export function isType(value, type) {
    switch (type) {
        case 'string':
            return isString(value) || isDate(value);
        case 'number':
            return isNumber(value);
        case 'integer':
            return isInteger(value);
        case 'boolean':
            return isBoolean(value);
        case 'null':
            return !hasValue(value);
        default:
            console.error(`isType error: "${type}" is not a recognized type.`);
            return null;
    }
}
/**
 * 'isPrimitive' function
 *
 * Checks wether an input value is a JavaScript primitive type:
 * string, number, boolean, or null.
 *
 * //   value - value to check
 * // { boolean }
 */
export function isPrimitive(value) {
    return (isString(value) || isNumber(value) ||
        isBoolean(value, 'strict') || value === null);
}
/**
 *
 * @param date
 * @returns {string}
 * exmaple:
 * toDateString('2018-01-01') = '2018-01-01'
 * toDateString('2018-01-30T00:00:00.000Z') = '2018-01-30'
 */
export const toIsoString = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
};
/**
 * 'toJavaScriptType' function
 *
 * Converts an input (probably string) value to a JavaScript primitive type -
 * 'string', 'number', 'boolean', or 'null' - before storing in a JSON object.
 *
 * Does not coerce values (other than null), and only converts the types
 * of values that would otherwise be valid.
 *
 * If the optional third parameter 'strictIntegers' is TRUE, and the
 * JSON Schema type 'integer' is specified, it also verifies the input value
 * is an integer and, if it is, returns it as a JaveScript number.
 * If 'strictIntegers' is FALSE (or not set) the type 'integer' is treated
 * exactly the same as 'number', and allows decimals.
 *
 * Valid Examples:
 * toJavaScriptType('10',   'number' ) = 10   // '10'   is a number
 * toJavaScriptType('10',   'integer') = 10   // '10'   is also an integer
 * toJavaScriptType( 10,    'integer') = 10   //  10    is still an integer
 * toJavaScriptType( 10,    'string' ) = '10' //  10    can be made into a string
 * toJavaScriptType('10.5', 'number' ) = 10.5 // '10.5' is a number
 *
 * Invalid Examples:
 * toJavaScriptType('10.5', 'integer') = null // '10.5' is not an integer
 * toJavaScriptType( 10.5,  'integer') = null //  10.5  is still not an integer
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - types to convert to
 * //  { boolean = false } strictIntegers - if FALSE, treat integers as numbers
 * // { PrimitiveValue }
 */
export function toJavaScriptType(value, types, strictIntegers = true) {
    if (!isDefined(value)) {
        return null;
    }
    if (isString(types)) {
        types = [types];
    }
    if (strictIntegers && inArray('integer', types)) {
        if (isInteger(value, 'strict')) {
            return value;
        }
        if (isInteger(value)) {
            return parseInt(value, 10);
        }
    }
    if (inArray('number', types) || (!strictIntegers && inArray('integer', types))) {
        if (isNumber(value, 'strict')) {
            return value;
        }
        if (isNumber(value)) {
            return parseFloat(value);
        }
    }
    if (inArray('string', types)) {
        if (isString(value)) {
            return value;
        }
        // If value is a date, and types includes 'string',
        // convert the date to a string
        if (isDate(value)) {
            return toIsoString(value);
        }
        if (isNumber(value)) {
            return value.toString();
        }
    }
    // If value is a date, and types includes 'integer' or 'number',
    // but not 'string', convert the date to a number
    if (isDate(value) && (inArray('integer', types) || inArray('number', types))) {
        return value.getTime();
    }
    if (inArray('boolean', types)) {
        if (isBoolean(value, true)) {
            return true;
        }
        if (isBoolean(value, false)) {
            return false;
        }
    }
    return null;
}
/**
 * 'toSchemaType' function
 *
 * Converts an input (probably string) value to the "best" JavaScript
 * equivalent available from an allowed list of JSON Schema types, which may
 * contain 'string', 'number', 'integer', 'boolean', and/or 'null'.
 * If necssary, it does progressively agressive type coersion.
 * It will not return null unless null is in the list of allowed types.
 *
 * Number conversion examples:
 * toSchemaType('10', ['number','integer','string']) = 10 // integer
 * toSchemaType('10', ['number','string']) = 10 // number
 * toSchemaType('10', ['string']) = '10' // string
 * toSchemaType('10.5', ['number','integer','string']) = 10.5 // number
 * toSchemaType('10.5', ['integer','string']) = '10.5' // string
 * toSchemaType('10.5', ['integer']) = 10 // integer
 * toSchemaType(10.5, ['null','boolean','string']) = '10.5' // string
 * toSchemaType(10.5, ['null','boolean']) = true // boolean
 *
 * String conversion examples:
 * toSchemaType('1.5x', ['boolean','number','integer','string']) = '1.5x' // string
 * toSchemaType('1.5x', ['boolean','number','integer']) = '1.5' // number
 * toSchemaType('1.5x', ['boolean','integer']) = '1' // integer
 * toSchemaType('1.5x', ['boolean']) = true // boolean
 * toSchemaType('xyz', ['number','integer','boolean','null']) = true // boolean
 * toSchemaType('xyz', ['number','integer','null']) = null // null
 * toSchemaType('xyz', ['number','integer']) = 0 // number
 *
 * Boolean conversion examples:
 * toSchemaType('1', ['integer','number','string','boolean']) = 1 // integer
 * toSchemaType('1', ['number','string','boolean']) = 1 // number
 * toSchemaType('1', ['string','boolean']) = '1' // string
 * toSchemaType('1', ['boolean']) = true // boolean
 * toSchemaType('true', ['number','string','boolean']) = 'true' // string
 * toSchemaType('true', ['boolean']) = true // boolean
 * toSchemaType('true', ['number']) = 0 // number
 * toSchemaType(true, ['number','string','boolean']) = true // boolean
 * toSchemaType(true, ['number','string']) = 'true' // string
 * toSchemaType(true, ['number']) = 1 // number
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - allowed types to convert to
 * // { PrimitiveValue }
 */
export function toSchemaType(value, types) {
    if (!isArray(types)) {
        types = [types];
    }
    if (types.includes('null') && !hasValue(value)) {
        return null;
    }
    if (types.includes('boolean') && !isBoolean(value, 'strict')) {
        return value;
    }
    if (types.includes('integer')) {
        const testValue = toJavaScriptType(value, 'integer');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if (types.includes('number')) {
        const testValue = toJavaScriptType(value, 'number');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if ((isString(value) || isNumber(value, 'strict')) &&
        types.includes('string')) { // Convert number to string
        return toJavaScriptType(value, 'string');
    }
    if (types.includes('boolean') && isBoolean(value)) {
        return toJavaScriptType(value, 'boolean');
    }
    if (types.includes('string')) { // Convert null & boolean to string
        if (value === null) {
            return '';
        }
        const testValue = toJavaScriptType(value, 'string');
        if (testValue !== null) {
            return testValue;
        }
    }
    if ((types.includes('number') ||
        types.includes('integer'))) {
        if (value === true) {
            return 1;
        } // Convert boolean & null to number
        if (value === false || value === null || value === '') {
            return 0;
        }
    }
    if (types.includes('number')) { // Convert mixed string to number
        const testValue = parseFloat(value);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('integer')) { // Convert string or number to integer
        const testValue = parseInt(value, 10);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('boolean')) { // Convert anything to boolean
        return !!value;
    }
    if ((types.includes('number') ||
        types.includes('integer')) && !types.includes('null')) {
        return 0; // If null not allowed, return 0 for non-convertable values
    }
}
/**
 * 'isPromise' function
 *
 * //   object
 * // { boolean }
 */
export function isPromise(object) {
    return !!object && typeof object.then === 'function';
}
/**
 * 'isObservable' function
 *
 * //   object
 * // { boolean }
 */
export function isObservable(object) {
    return !!object && typeof object.subscribe === 'function';
}
/**
 * '_toPromise' function
 *
 * //  { object } object
 * // { Promise<any> }
 */
export function _toPromise(object) {
    return isPromise(object) ? object : object.toPromise();
}
/**
 * 'toObservable' function
 *
 * //  { object } object
 * // { Observable<any> }
 */
export function toObservable(object) {
    const observable = isPromise(object) ? from(object) : object;
    if (isObservable(observable)) {
        return observable;
    }
    console.error('toObservable error: Expected validator to return Promise or Observable.');
    return new Observable();
}
/**
 * 'inArray' function
 *
 * Searches an array for an item, or one of a list of items, and returns true
 * as soon as a match is found, or false if no match.
 *
 * If the optional third parameter allIn is set to TRUE, and the item to find
 * is an array, then the function returns true only if all elements from item
 * are found in the array list, and false if any element is not found. If the
 * item to find is not an array, setting allIn to TRUE has no effect.
 *
 * //  { any|any[] } item - the item to search for
 * //   array - the array to search
 * //  { boolean = false } allIn - if TRUE, all items must be in array
 * // { boolean } - true if item(s) in array, false otherwise
 */
export function inArray(item, array, allIn = false) {
    if (!isDefined(item) || !isArray(array)) {
        return false;
    }
    return isArray(item) ?
        item[allIn ? 'every' : 'some'](subItem => array.includes(subItem)) :
        array.includes(item);
}
/**
 * 'xor' utility function - exclusive or
 *
 * Returns true if exactly one of two values is truthy.
 *
 * //   value1 - first value to check
 * //   value2 - second value to check
 * // { boolean } - true if exactly one input value is truthy, false if not
 */
export function xor(value1, value2) {
    return (!!value1 && !value2) || (!value1 && !!value2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9zaGFyZWQvdmFsaWRhdG9yLmZ1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQWdEeEM7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEdBQUcsS0FBSztJQUNwRSxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxHQUFHLEtBQUs7SUFDekUsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFDLEdBQUcsT0FBTztJQUN0QyxNQUFNLFlBQVksR0FBZ0IsRUFBRyxDQUFDO0lBQ3RDLEtBQUssTUFBTSxhQUFhLElBQUksT0FBTyxFQUFFO1FBQ25DLElBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzNCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDNUMsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFD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Ozs7R0FlRztBQUNILE1BQU0sVUFBVSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEdBQUcsS0FBSztJQUNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQUUsT0FBTyxLQUFLLENBQUM7S0FBRTtJQUMxRCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU07SUFDaEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWJzdHJhY3RDb250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgZnJvbSwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG4vKipcbiAqIFZhbGlkYXRvciB1dGlsaXR5IGZ1bmN0aW9uIGxpYnJhcnk6XG4gKlxuICogVmFsaWRhdG9yIGFuZCBlcnJvciB1dGlsaXRpZXM6XG4gKiAgIF9leGVjdXRlVmFsaWRhdG9ycywgX2V4ZWN1dGVBc3luY1ZhbGlkYXRvcnMsIF9tZXJnZU9iamVjdHMsIF9tZXJnZUVycm9yc1xuICpcbiAqIEluZGl2aWR1YWwgdmFsdWUgY2hlY2tpbmc6XG4gKiAgIGlzRGVmaW5lZCwgaGFzVmFsdWUsIGlzRW1wdHlcbiAqXG4gKiBJbmRpdmlkdWFsIHR5cGUgY2hlY2tpbmc6XG4gKiAgIGlzU3RyaW5nLCBpc051bWJlciwgaXNJbnRlZ2VyLCBpc0Jvb2xlYW4sIGlzRnVuY3Rpb24sIGlzT2JqZWN0LCBpc0FycmF5LFxuICogICBpc01hcCwgaXNTZXQsIGlzUHJvbWlzZSwgaXNPYnNlcnZhYmxlXG4gKlxuICogTXVsdGlwbGUgdHlwZSBjaGVja2luZyBhbmQgZml4aW5nOlxuICogICBnZXRUeXBlLCBpc1R5cGUsIGlzUHJpbWl0aXZlLCB0b0phdmFTY3JpcHRUeXBlLCB0b1NjaGVtYVR5cGUsXG4gKiAgIF90b1Byb21pc2UsIHRvT2JzZXJ2YWJsZVxuICpcbiAqIFV0aWxpdHkgZnVuY3Rpb25zOlxuICogICBpbkFycmF5LCB4b3JcbiAqXG4gKiBUeXBlc2NyaXB0IHR5cGVzIGFuZCBpbnRlcmZhY2VzOlxuICogICBTY2hlbWFQcmltaXRpdmVUeXBlLCBTY2hlbWFUeXBlLCBKYXZhU2NyaXB0UHJpbWl0aXZlVHlwZSwgSmF2YVNjcmlwdFR5cGUsXG4gKiAgIFByaW1pdGl2ZVZhbHVlLCBQbGFpbk9iamVjdCwgSVZhbGlkYXRvckZuLCBBc3luY0lWYWxpZGF0b3JGblxuICpcbiAqIE5vdGU6ICdJVmFsaWRhdG9yRm4nIGlzIHNob3J0IGZvciAnaW52ZXJ0YWJsZSB2YWxpZGF0b3IgZnVuY3Rpb24nLFxuICogICB3aGljaCBpcyBhIHZhbGlkYXRvciBmdW5jdGlvbnMgdGhhdCBhY2NlcHRzIGFuIG9wdGlvbmFsIHNlY29uZFxuICogICBhcmd1bWVudCB3aGljaCwgaWYgc2V0IHRvIFRSVUUsIGNhdXNlcyB0aGUgdmFsaWRhdG9yIHRvIHBlcmZvcm1cbiAqICAgdGhlIG9wcG9zaXRlIG9mIGl0cyBvcmlnaW5hbCBmdW5jdGlvbi5cbiAqL1xuXG5leHBvcnQgdHlwZSBTY2hlbWFQcmltaXRpdmVUeXBlID1cbiAgJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdpbnRlZ2VyJyB8ICdib29sZWFuJyB8ICdudWxsJztcbmV4cG9ydCB0eXBlIFNjaGVtYVR5cGUgPVxuICAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2ludGVnZXInIHwgJ2Jvb2xlYW4nIHwgJ251bGwnIHwgJ29iamVjdCcgfCAnYXJyYXknO1xuZXhwb3J0IHR5cGUgSmF2YVNjcmlwdFByaW1pdGl2ZVR5cGUgPVxuICAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2Jvb2xlYW4nIHwgJ251bGwnIHwgJ3VuZGVmaW5lZCc7XG5leHBvcnQgdHlwZSBKYXZhU2NyaXB0VHlwZSA9XG4gICdzdHJpbmcnIHwgJ251bWJlcicgfCAnYm9vbGVhbicgfCAnbnVsbCcgfCAndW5kZWZpbmVkJyB8ICdvYmplY3QnIHwgJ2FycmF5JyB8XG4gICdtYXAnIHwgJ3NldCcgfCAnYXJndW1lbnRzJyB8ICdkYXRlJyB8ICdlcnJvcicgfCAnZnVuY3Rpb24nIHwgJ2pzb24nIHxcbiAgJ21hdGgnIHwgJ3JlZ2V4cCc7IC8vIE5vdGU6IHRoaXMgbGlzdCBpcyBpbmNvbXBsZXRlXG5leHBvcnQgdHlwZSBQcmltaXRpdmVWYWx1ZSA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkO1xuZXhwb3J0IGludGVyZmFjZSBQbGFpbk9iamVjdCB7IFtrOiBzdHJpbmddOiBhbnk7IH1cblxuZXhwb3J0IHR5cGUgSVZhbGlkYXRvckZuID0gKGM6IEFic3RyYWN0Q29udHJvbCwgaT86IGJvb2xlYW4pID0+IFBsYWluT2JqZWN0O1xuZXhwb3J0IHR5cGUgQXN5bmNJVmFsaWRhdG9yRm4gPSAoYzogQWJzdHJhY3RDb250cm9sLCBpPzogYm9vbGVhbikgPT4gYW55O1xuXG4vKipcbiAqICdfZXhlY3V0ZVZhbGlkYXRvcnMnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBWYWxpZGF0ZXMgYSBjb250cm9sIGFnYWluc3QgYW4gYXJyYXkgb2YgdmFsaWRhdG9ycywgYW5kIHJldHVybnNcbiAqIGFuIGFycmF5IG9mIHRoZSBzYW1lIGxlbmd0aCBjb250YWluaW5nIGEgY29tYmluYXRpb24gb2YgZXJyb3IgbWVzc2FnZXNcbiAqIChmcm9tIGludmFsaWQgdmFsaWRhdG9ycykgYW5kIG51bGwgdmFsdWVzIChmcm9tIHZhbGlkIHZhbGlkYXRvcnMpXG4gKlxuICogLy8gIHsgQWJzdHJhY3RDb250cm9sIH0gY29udHJvbCAtIGNvbnRyb2wgdG8gdmFsaWRhdGVcbiAqIC8vICB7IElWYWxpZGF0b3JGbltdIH0gdmFsaWRhdG9ycyAtIGFycmF5IG9mIHZhbGlkYXRvcnNcbiAqIC8vICB7IGJvb2xlYW4gfSBpbnZlcnQgLSBpbnZlcnQ/XG4gKiAvLyB7IFBsYWluT2JqZWN0W10gfSAtIGFycmF5IG9mIG51bGxzIGFuZCBlcnJvciBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfZXhlY3V0ZVZhbGlkYXRvcnMoY29udHJvbCwgdmFsaWRhdG9ycywgaW52ZXJ0ID0gZmFsc2UpIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IoY29udHJvbCwgaW52ZXJ0KSk7XG59XG5cbi8qKlxuICogJ19leGVjdXRlQXN5bmNWYWxpZGF0b3JzJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogVmFsaWRhdGVzIGEgY29udHJvbCBhZ2FpbnN0IGFuIGFycmF5IG9mIGFzeW5jIHZhbGlkYXRvcnMsIGFuZCByZXR1cm5zXG4gKiBhbiBhcnJheSBvZiBvYnNlcnZhYmUgcmVzdWx0cyBvZiB0aGUgc2FtZSBsZW5ndGggY29udGFpbmluZyBhIGNvbWJpbmF0aW9uIG9mXG4gKiBlcnJvciBtZXNzYWdlcyAoZnJvbSBpbnZhbGlkIHZhbGlkYXRvcnMpIGFuZCBudWxsIHZhbHVlcyAoZnJvbSB2YWxpZCBvbmVzKVxuICpcbiAqIC8vICB7IEFic3RyYWN0Q29udHJvbCB9IGNvbnRyb2wgLSBjb250cm9sIHRvIHZhbGlkYXRlXG4gKiAvLyAgeyBBc3luY0lWYWxpZGF0b3JGbltdIH0gdmFsaWRhdG9ycyAtIGFycmF5IG9mIGFzeW5jIHZhbGlkYXRvcnNcbiAqIC8vICB7IGJvb2xlYW4gfSBpbnZlcnQgLSBpbnZlcnQ/XG4gKiAvLyAgLSBhcnJheSBvZiBvYnNlcnZhYmxlIG51bGxzIGFuZCBlcnJvciBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfZXhlY3V0ZUFzeW5jVmFsaWRhdG9ycyhjb250cm9sLCB2YWxpZGF0b3JzLCBpbnZlcnQgPSBmYWxzZSkge1xuICByZXR1cm4gdmFsaWRhdG9ycy5tYXAodmFsaWRhdG9yID0+IHZhbGlkYXRvcihjb250cm9sLCBpbnZlcnQpKTtcbn1cblxuLyoqXG4gKiAnX21lcmdlT2JqZWN0cycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIFJlY3Vyc2l2ZWx5IE1lcmdlcyBvbmUgb3IgbW9yZSBvYmplY3RzIGludG8gYSBzaW5nbGUgb2JqZWN0IHdpdGggY29tYmluZWQga2V5cy5cbiAqIEF1dG9tYXRpY2FsbHkgZGV0ZWN0cyBhbmQgaWdub3JlcyBudWxsIGFuZCB1bmRlZmluZWQgaW5wdXRzLlxuICogQWxzbyBkZXRlY3RzIGR1cGxpY2F0ZWQgYm9vbGVhbiAnbm90JyBrZXlzIGFuZCBYT1JzIHRoZWlyIHZhbHVlcy5cbiAqXG4gKiAvLyAgeyBQbGFpbk9iamVjdFtdIH0gb2JqZWN0cyAtIG9uZSBvciBtb3JlIG9iamVjdHMgdG8gbWVyZ2VcbiAqIC8vIHsgUGxhaW5PYmplY3QgfSAtIG1lcmdlZCBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9tZXJnZU9iamVjdHMoLi4ub2JqZWN0cykge1xuICBjb25zdCBtZXJnZWRPYmplY3Q6IFBsYWluT2JqZWN0ID0geyB9O1xuICBmb3IgKGNvbnN0IGN1cnJlbnRPYmplY3Qgb2Ygb2JqZWN0cykge1xuICAgIGlmIChpc09iamVjdChjdXJyZW50T2JqZWN0KSkge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoY3VycmVudE9iamVjdCkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gY3VycmVudE9iamVjdFtrZXldO1xuICAgICAgICBjb25zdCBtZXJnZWRWYWx1ZSA9IG1lcmdlZE9iamVjdFtrZXldO1xuICAgICAgICBtZXJnZWRPYmplY3Rba2V5XSA9ICFpc0RlZmluZWQobWVyZ2VkVmFsdWUpID8gY3VycmVudFZhbHVlIDpcbiAgICAgICAgICBrZXkgPT09ICdub3QnICYmIGlzQm9vbGVhbihtZXJnZWRWYWx1ZSwgJ3N0cmljdCcpICYmXG4gICAgICAgICAgICBpc0Jvb2xlYW4oY3VycmVudFZhbHVlLCAnc3RyaWN0JykgPyB4b3IobWVyZ2VkVmFsdWUsIGN1cnJlbnRWYWx1ZSkgOlxuICAgICAgICAgIGdldFR5cGUobWVyZ2VkVmFsdWUpID09PSAnb2JqZWN0JyAmJiBnZXRUeXBlKGN1cnJlbnRWYWx1ZSkgPT09ICdvYmplY3QnID9cbiAgICAgICAgICAgIF9tZXJnZU9iamVjdHMobWVyZ2VkVmFsdWUsIGN1cnJlbnRWYWx1ZSkgOlxuICAgICAgICAgICAgY3VycmVudFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbWVyZ2VkT2JqZWN0O1xufVxuXG4vKipcbiAqICdfbWVyZ2VFcnJvcnMnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBNZXJnZXMgYW4gYXJyYXkgb2Ygb2JqZWN0cy5cbiAqIFVzZWQgZm9yIGNvbWJpbmluZyB0aGUgdmFsaWRhdG9yIGVycm9ycyByZXR1cm5lZCBmcm9tICdleGVjdXRlVmFsaWRhdG9ycydcbiAqXG4gKiAvLyAgeyBQbGFpbk9iamVjdFtdIH0gYXJyYXlPZkVycm9ycyAtIGFycmF5IG9mIG9iamVjdHNcbiAqIC8vIHsgUGxhaW5PYmplY3QgfSAtIG1lcmdlZCBvYmplY3QsIG9yIG51bGwgaWYgbm8gdXNhYmxlIGlucHV0IG9iamVjdGNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfbWVyZ2VFcnJvcnMoYXJyYXlPZkVycm9ycykge1xuICBjb25zdCBtZXJnZWRFcnJvcnMgPSBfbWVyZ2VPYmplY3RzKC4uLmFycmF5T2ZFcnJvcnMpO1xuICByZXR1cm4gaXNFbXB0eShtZXJnZWRFcnJvcnMpID8gbnVsbCA6IG1lcmdlZEVycm9ycztcbn1cblxuLyoqXG4gKiAnaXNEZWZpbmVkJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFyaWFibGUgY29udGFpbnMgYSB2YWx1ZSBvZiBhbnkgdHlwZS5cbiAqIFJldHVybnMgdHJ1ZSBldmVuIGZvciBvdGhlcndpc2UgJ2ZhbHNleScgdmFsdWVzIG9mIDAsICcnLCBhbmQgZmFsc2UuXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSBmYWxzZSBpZiB1bmRlZmluZWQgb3IgbnVsbCwgb3RoZXJ3aXNlIHRydWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiAnaGFzVmFsdWUnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YXJpYWJsZSBjb250YWlucyBhIHZhbHVlLlxuICogUmV0dXJzIGZhbHNlIGZvciBudWxsLCB1bmRlZmluZWQsIG9yIGEgemVyby1sZW5ndGggc3RybmcsICcnLFxuICogb3RoZXJ3aXNlIHJldHVybnMgdHJ1ZS5cbiAqIChTdHJpY3RlciB0aGFuICdpc0RlZmluZWQnIGJlY2F1c2UgaXQgYWxzbyByZXR1cm5zIGZhbHNlIGZvciAnJyxcbiAqIHRob3VnaCBpdCBzdGlsIHJldHVybnMgdHJ1ZSBmb3Igb3RoZXJ3aXNlICdmYWxzZXknIHZhbHVlcyAwIGFuZCBmYWxzZS4pXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSBmYWxzZSBpZiB1bmRlZmluZWQsIG51bGwsIG9yICcnLCBvdGhlcndpc2UgdHJ1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzVmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnO1xufVxuXG4vKipcbiAqICdpc0VtcHR5JyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogU2ltaWxhciB0byAhaGFzVmFsdWUsIGJ1dCBhbHNvIHJldHVybnMgdHJ1ZSBmb3IgZW1wdHkgYXJyYXlzIGFuZCBvYmplY3RzLlxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gZmFsc2UgaWYgdW5kZWZpbmVkLCBudWxsLCBvciAnJywgb3RoZXJ3aXNlIHRydWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7IHJldHVybiAhdmFsdWUubGVuZ3RoOyB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHsgcmV0dXJuICFPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoOyB9XG4gIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJztcbn1cblxuLyoqXG4gKiAnaXNTdHJpbmcnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhIHN0cmluZy5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgc3RyaW5nLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqICdpc051bWJlcicgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGEgcmVndWxhciBudW1iZXIsIG51bWVyaWMgc3RyaW5nLCBvciBKYXZhU2NyaXB0IERhdGUuXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8gIHsgYW55ID0gZmFsc2UgfSBzdHJpY3QgLSBpZiB0cnV0aHksIGFsc28gY2hlY2tzIEphdmFTY3JpcHQgdHlvZVxuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIG51bWJlciwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcih2YWx1ZSwgc3RyaWN0OiBhbnkgPSBmYWxzZSkge1xuICBpZiAoc3RyaWN0ICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHJldHVybiAhaXNOYU4odmFsdWUpICYmIHZhbHVlICE9PSB2YWx1ZSAvIDA7XG59XG5cbi8qKlxuICogJ2lzSW50ZWdlcicgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGFuIGludGVnZXIuXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8gIHsgYW55ID0gZmFsc2UgfSBzdHJpY3QgLSBpZiB0cnV0aHksIGFsc28gY2hlY2tzIEphdmFTY3JpcHQgdHlvZVxuICogLy8ge2Jvb2xlYW4gfSAtIHRydWUgaWYgbnVtYmVyLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSW50ZWdlcih2YWx1ZSwgc3RyaWN0OiBhbnkgPSBmYWxzZSkge1xuICBpZiAoc3RyaWN0ICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHJldHVybiAhaXNOYU4odmFsdWUpICYmICB2YWx1ZSAhPT0gdmFsdWUgLyAwICYmIHZhbHVlICUgMSA9PT0gMDtcbn1cblxuLyoqXG4gKiAnaXNCb29sZWFuJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSBib29sZWFuLlxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vICB7IGFueSA9IG51bGwgfSBvcHRpb24gLSBpZiAnc3RyaWN0JywgYWxzbyBjaGVja3MgSmF2YVNjcmlwdCB0eXBlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIFRSVUUgb3IgRkFMU0UsIGNoZWNrcyBvbmx5IGZvciB0aGF0IHZhbHVlXG4gKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgYm9vbGVhbiwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Jvb2xlYW4odmFsdWUsIG9wdGlvbjogYW55ID0gbnVsbCkge1xuICBpZiAob3B0aW9uID09PSAnc3RyaWN0JykgeyByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlOyB9XG4gIGlmIChvcHRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IDEgfHwgdmFsdWUgPT09ICd0cnVlJyB8fCB2YWx1ZSA9PT0gJzEnO1xuICB9XG4gIGlmIChvcHRpb24gPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBmYWxzZSB8fCB2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJyB8fCB2YWx1ZSA9PT0gJzAnO1xuICB9XG4gIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAnMScgfHxcbiAgICB2YWx1ZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IDAgfHwgdmFsdWUgPT09ICdmYWxzZScgfHwgdmFsdWUgPT09ICcwJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24oaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgaXRlbSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXRlbSAhPT0gbnVsbCAmJiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5KGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShpdGVtKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZShpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhaXRlbSAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlbSkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTWFwKGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFpdGVtICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgTWFwXSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NldChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhaXRlbSAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlbSkgPT09ICdbb2JqZWN0IFNldF0nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTeW1ib2woaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgaXRlbSA9PT0gJ3N5bWJvbCc7XG59XG5cbi8qKlxuICogJ2dldFR5cGUnIGZ1bmN0aW9uXG4gKlxuICogRGV0ZWN0cyB0aGUgSlNPTiBTY2hlbWEgVHlwZSBvZiBhIHZhbHVlLlxuICogQnkgZGVmYXVsdCwgZGV0ZWN0cyBudW1iZXJzIGFuZCBpbnRlZ2VycyBldmVuIGlmIGZvcm1hdHRlZCBhcyBzdHJpbmdzLlxuICogKFNvIGFsbCBpbnRlZ2VycyBhcmUgYWxzbyBudW1iZXJzLCBhbmQgYW55IG51bWJlciBtYXkgYWxzbyBiZSBhIHN0cmluZy4pXG4gKiBIb3dldmVyLCBpdCBvbmx5IGRldGVjdHMgdHJ1ZSBib29sZWFuIHZhbHVlcyAodG8gZGV0ZWN0IGJvb2xlYW4gdmFsdWVzXG4gKiBpbiBub24tYm9vbGVhbiBmb3JtYXRzLCB1c2UgaXNCb29sZWFuKCkgaW5zdGVhZCkuXG4gKlxuICogSWYgcGFzc2VkIGEgc2Vjb25kIG9wdGlvbmFsIHBhcmFtZXRlciBvZiAnc3RyaWN0JywgaXQgd2lsbCBvbmx5IGRldGVjdFxuICogbnVtYmVycyBhbmQgaW50ZWdlcnMgaWYgdGhleSBhcmUgZm9ybWF0dGVkIGFzIEphdmFTY3JpcHQgbnVtYmVycy5cbiAqXG4gKiBFeGFtcGxlczpcbiAqIGdldFR5cGUoJzEwLjUnKSA9ICdudW1iZXInXG4gKiBnZXRUeXBlKDEwLjUpID0gJ251bWJlcidcbiAqIGdldFR5cGUoJzEwJykgPSAnaW50ZWdlcidcbiAqIGdldFR5cGUoMTApID0gJ2ludGVnZXInXG4gKiBnZXRUeXBlKCd0cnVlJykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSh0cnVlKSA9ICdib29sZWFuJ1xuICogZ2V0VHlwZShudWxsKSA9ICdudWxsJ1xuICogZ2V0VHlwZSh7IH0pID0gJ29iamVjdCdcbiAqIGdldFR5cGUoW10pID0gJ2FycmF5J1xuICpcbiAqIGdldFR5cGUoJzEwLjUnLCAnc3RyaWN0JykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSgxMC41LCAnc3RyaWN0JykgPSAnbnVtYmVyJ1xuICogZ2V0VHlwZSgnMTAnLCAnc3RyaWN0JykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSgxMCwgJ3N0cmljdCcpID0gJ2ludGVnZXInXG4gKiBnZXRUeXBlKCd0cnVlJywgJ3N0cmljdCcpID0gJ3N0cmluZydcbiAqIGdldFR5cGUodHJ1ZSwgJ3N0cmljdCcpID0gJ2Jvb2xlYW4nXG4gKlxuICogLy8gICB2YWx1ZSAtIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgeyBhbnkgPSBmYWxzZSB9IHN0cmljdCAtIGlmIHRydXRoeSwgYWxzbyBjaGVja3MgSmF2YVNjcmlwdCB0eW9lXG4gKiAvLyB7IFNjaGVtYVR5cGUgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZSh2YWx1ZSwgc3RyaWN0OiBhbnkgPSBmYWxzZSkge1xuICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHsgcmV0dXJuICdudWxsJzsgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHsgcmV0dXJuICdhcnJheSc7IH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkgeyByZXR1cm4gJ29iamVjdCc7IH1cbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSwgJ3N0cmljdCcpKSB7IHJldHVybiAnYm9vbGVhbic7IH1cbiAgaWYgKGlzSW50ZWdlcih2YWx1ZSwgc3RyaWN0KSkgeyByZXR1cm4gJ2ludGVnZXInOyB9XG4gIGlmIChpc051bWJlcih2YWx1ZSwgc3RyaWN0KSkgeyByZXR1cm4gJ251bWJlcic7IH1cbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSB8fCAoIXN0cmljdCAmJiBpc0RhdGUodmFsdWUpKSkgeyByZXR1cm4gJ3N0cmluZyc7IH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogJ2lzVHlwZScgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3Mgd2V0aGVyIGFuIGlucHV0IChwcm9iYWJseSBzdHJpbmcpIHZhbHVlIGNvbnRhaW5zIGRhdGEgb2ZcbiAqIGEgc3BlY2lmaWVkIEpTT04gU2NoZW1hIHR5cGVcbiAqXG4gKiAvLyAgeyBQcmltaXRpdmVWYWx1ZSB9IHZhbHVlIC0gdmFsdWUgdG8gY2hlY2tcbiAqIC8vICB7IFNjaGVtYVByaW1pdGl2ZVR5cGUgfSB0eXBlIC0gdHlwZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVHlwZSh2YWx1ZSwgdHlwZSkge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIGlzU3RyaW5nKHZhbHVlKSB8fCBpc0RhdGUodmFsdWUpO1xuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNOdW1iZXIodmFsdWUpO1xuICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgcmV0dXJuIGlzSW50ZWdlcih2YWx1ZSk7XG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gaXNCb29sZWFuKHZhbHVlKTtcbiAgICBjYXNlICdudWxsJzpcbiAgICAgIHJldHVybiAhaGFzVmFsdWUodmFsdWUpO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmVycm9yKGBpc1R5cGUgZXJyb3I6IFwiJHt0eXBlfVwiIGlzIG5vdCBhIHJlY29nbml6ZWQgdHlwZS5gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogJ2lzUHJpbWl0aXZlJyBmdW5jdGlvblxuICpcbiAqIENoZWNrcyB3ZXRoZXIgYW4gaW5wdXQgdmFsdWUgaXMgYSBKYXZhU2NyaXB0IHByaW1pdGl2ZSB0eXBlOlxuICogc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIG9yIG51bGwuXG4gKlxuICogLy8gICB2YWx1ZSAtIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmUodmFsdWUpIHtcbiAgcmV0dXJuIChpc1N0cmluZyh2YWx1ZSkgfHwgaXNOdW1iZXIodmFsdWUpIHx8XG4gICAgaXNCb29sZWFuKHZhbHVlLCAnc3RyaWN0JykgfHwgdmFsdWUgPT09IG51bGwpO1xufVxuXG4vKipcbiAqIFxuICogQHBhcmFtIGRhdGUgXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICogZXhtYXBsZTpcbiAqIHRvRGF0ZVN0cmluZygnMjAxOC0wMS0wMScpID0gJzIwMTgtMDEtMDEnXG4gKiB0b0RhdGVTdHJpbmcoJzIwMTgtMDEtMzBUMDA6MDA6MDAuMDAwWicpID0gJzIwMTgtMDEtMzAnXG4gKi9cbmV4cG9ydCBjb25zdCB0b0lzb1N0cmluZyA9IChkYXRlOiBEYXRlKSA9PiB7XG4gIGNvbnN0IGRheSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICBjb25zdCBtb250aCA9IGRhdGUuZ2V0TW9udGgoKSArIDE7XG4gIGNvbnN0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gIHJldHVybiBgJHt5ZWFyfS0ke21vbnRoIDwgMTAgPyAnMCcgKyBtb250aCA6IG1vbnRofS0ke2RheSA8IDEwID8gJzAnICsgZGF5IDogZGF5fWA7XG59XG5cbi8qKlxuICogJ3RvSmF2YVNjcmlwdFR5cGUnIGZ1bmN0aW9uXG4gKlxuICogQ29udmVydHMgYW4gaW5wdXQgKHByb2JhYmx5IHN0cmluZykgdmFsdWUgdG8gYSBKYXZhU2NyaXB0IHByaW1pdGl2ZSB0eXBlIC1cbiAqICdzdHJpbmcnLCAnbnVtYmVyJywgJ2Jvb2xlYW4nLCBvciAnbnVsbCcgLSBiZWZvcmUgc3RvcmluZyBpbiBhIEpTT04gb2JqZWN0LlxuICpcbiAqIERvZXMgbm90IGNvZXJjZSB2YWx1ZXMgKG90aGVyIHRoYW4gbnVsbCksIGFuZCBvbmx5IGNvbnZlcnRzIHRoZSB0eXBlc1xuICogb2YgdmFsdWVzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGJlIHZhbGlkLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCB0aGlyZCBwYXJhbWV0ZXIgJ3N0cmljdEludGVnZXJzJyBpcyBUUlVFLCBhbmQgdGhlXG4gKiBKU09OIFNjaGVtYSB0eXBlICdpbnRlZ2VyJyBpcyBzcGVjaWZpZWQsIGl0IGFsc28gdmVyaWZpZXMgdGhlIGlucHV0IHZhbHVlXG4gKiBpcyBhbiBpbnRlZ2VyIGFuZCwgaWYgaXQgaXMsIHJldHVybnMgaXQgYXMgYSBKYXZlU2NyaXB0IG51bWJlci5cbiAqIElmICdzdHJpY3RJbnRlZ2VycycgaXMgRkFMU0UgKG9yIG5vdCBzZXQpIHRoZSB0eXBlICdpbnRlZ2VyJyBpcyB0cmVhdGVkXG4gKiBleGFjdGx5IHRoZSBzYW1lIGFzICdudW1iZXInLCBhbmQgYWxsb3dzIGRlY2ltYWxzLlxuICpcbiAqIFZhbGlkIEV4YW1wbGVzOlxuICogdG9KYXZhU2NyaXB0VHlwZSgnMTAnLCAgICdudW1iZXInICkgPSAxMCAgIC8vICcxMCcgICBpcyBhIG51bWJlclxuICogdG9KYXZhU2NyaXB0VHlwZSgnMTAnLCAgICdpbnRlZ2VyJykgPSAxMCAgIC8vICcxMCcgICBpcyBhbHNvIGFuIGludGVnZXJcbiAqIHRvSmF2YVNjcmlwdFR5cGUoIDEwLCAgICAnaW50ZWdlcicpID0gMTAgICAvLyAgMTAgICAgaXMgc3RpbGwgYW4gaW50ZWdlclxuICogdG9KYXZhU2NyaXB0VHlwZSggMTAsICAgICdzdHJpbmcnICkgPSAnMTAnIC8vICAxMCAgICBjYW4gYmUgbWFkZSBpbnRvIGEgc3RyaW5nXG4gKiB0b0phdmFTY3JpcHRUeXBlKCcxMC41JywgJ251bWJlcicgKSA9IDEwLjUgLy8gJzEwLjUnIGlzIGEgbnVtYmVyXG4gKlxuICogSW52YWxpZCBFeGFtcGxlczpcbiAqIHRvSmF2YVNjcmlwdFR5cGUoJzEwLjUnLCAnaW50ZWdlcicpID0gbnVsbCAvLyAnMTAuNScgaXMgbm90IGFuIGludGVnZXJcbiAqIHRvSmF2YVNjcmlwdFR5cGUoIDEwLjUsICAnaW50ZWdlcicpID0gbnVsbCAvLyAgMTAuNSAgaXMgc3RpbGwgbm90IGFuIGludGVnZXJcbiAqXG4gKiAvLyAgeyBQcmltaXRpdmVWYWx1ZSB9IHZhbHVlIC0gdmFsdWUgdG8gY29udmVydFxuICogLy8gIHsgU2NoZW1hUHJpbWl0aXZlVHlwZSB8IFNjaGVtYVByaW1pdGl2ZVR5cGVbXSB9IHR5cGVzIC0gdHlwZXMgdG8gY29udmVydCB0b1xuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gc3RyaWN0SW50ZWdlcnMgLSBpZiBGQUxTRSwgdHJlYXQgaW50ZWdlcnMgYXMgbnVtYmVyc1xuICogLy8geyBQcmltaXRpdmVWYWx1ZSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCB0eXBlcywgc3RyaWN0SW50ZWdlcnMgPSB0cnVlKSAge1xuICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgaWYgKGlzU3RyaW5nKHR5cGVzKSkgeyB0eXBlcyA9IFt0eXBlc107IH1cbiAgaWYgKHN0cmljdEludGVnZXJzICYmIGluQXJyYXkoJ2ludGVnZXInLCB0eXBlcykpIHtcbiAgICBpZiAoaXNJbnRlZ2VyKHZhbHVlLCAnc3RyaWN0JykpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgaWYgKGlzSW50ZWdlcih2YWx1ZSkpIHsgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMCk7IH1cbiAgfVxuICBpZiAoaW5BcnJheSgnbnVtYmVyJywgdHlwZXMpIHx8ICghc3RyaWN0SW50ZWdlcnMgJiYgaW5BcnJheSgnaW50ZWdlcicsIHR5cGVzKSkpIHtcbiAgICBpZiAoaXNOdW1iZXIodmFsdWUsICdzdHJpY3QnKSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICBpZiAoaXNOdW1iZXIodmFsdWUpKSB7IHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTsgfVxuICB9XG4gIGlmIChpbkFycmF5KCdzdHJpbmcnLCB0eXBlcykpIHtcbiAgICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgIC8vIElmIHZhbHVlIGlzIGEgZGF0ZSwgYW5kIHR5cGVzIGluY2x1ZGVzICdzdHJpbmcnLFxuICAgIC8vIGNvbnZlcnQgdGhlIGRhdGUgdG8gYSBzdHJpbmdcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkgeyByZXR1cm4gdG9Jc29TdHJpbmcodmFsdWUpOyB9XG4gICAgaWYgKGlzTnVtYmVyKHZhbHVlKSkgeyByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTsgfVxuICB9XG4gIC8vIElmIHZhbHVlIGlzIGEgZGF0ZSwgYW5kIHR5cGVzIGluY2x1ZGVzICdpbnRlZ2VyJyBvciAnbnVtYmVyJyxcbiAgLy8gYnV0IG5vdCAnc3RyaW5nJywgY29udmVydCB0aGUgZGF0ZSB0byBhIG51bWJlclxuICBpZiAoaXNEYXRlKHZhbHVlKSAmJiAoaW5BcnJheSgnaW50ZWdlcicsIHR5cGVzKSB8fCBpbkFycmF5KCdudW1iZXInLCB0eXBlcykpKSB7XG4gICAgcmV0dXJuIHZhbHVlLmdldFRpbWUoKTtcbiAgfVxuICBpZiAoaW5BcnJheSgnYm9vbGVhbicsIHR5cGVzKSkge1xuICAgIGlmIChpc0Jvb2xlYW4odmFsdWUsIHRydWUpKSB7IHJldHVybiB0cnVlOyB9XG4gICAgaWYgKGlzQm9vbGVhbih2YWx1ZSwgZmFsc2UpKSB7IHJldHVybiBmYWxzZTsgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqICd0b1NjaGVtYVR5cGUnIGZ1bmN0aW9uXG4gKlxuICogQ29udmVydHMgYW4gaW5wdXQgKHByb2JhYmx5IHN0cmluZykgdmFsdWUgdG8gdGhlIFwiYmVzdFwiIEphdmFTY3JpcHRcbiAqIGVxdWl2YWxlbnQgYXZhaWxhYmxlIGZyb20gYW4gYWxsb3dlZCBsaXN0IG9mIEpTT04gU2NoZW1hIHR5cGVzLCB3aGljaCBtYXlcbiAqIGNvbnRhaW4gJ3N0cmluZycsICdudW1iZXInLCAnaW50ZWdlcicsICdib29sZWFuJywgYW5kL29yICdudWxsJy5cbiAqIElmIG5lY3NzYXJ5LCBpdCBkb2VzIHByb2dyZXNzaXZlbHkgYWdyZXNzaXZlIHR5cGUgY29lcnNpb24uXG4gKiBJdCB3aWxsIG5vdCByZXR1cm4gbnVsbCB1bmxlc3MgbnVsbCBpcyBpbiB0aGUgbGlzdCBvZiBhbGxvd2VkIHR5cGVzLlxuICpcbiAqIE51bWJlciBjb252ZXJzaW9uIGV4YW1wbGVzOlxuICogdG9TY2hlbWFUeXBlKCcxMCcsIFsnbnVtYmVyJywnaW50ZWdlcicsJ3N0cmluZyddKSA9IDEwIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgnMTAnLCBbJ251bWJlcicsJ3N0cmluZyddKSA9IDEwIC8vIG51bWJlclxuICogdG9TY2hlbWFUeXBlKCcxMCcsIFsnc3RyaW5nJ10pID0gJzEwJyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgnMTAuNScsIFsnbnVtYmVyJywnaW50ZWdlcicsJ3N0cmluZyddKSA9IDEwLjUgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEwLjUnLCBbJ2ludGVnZXInLCdzdHJpbmcnXSkgPSAnMTAuNScgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUoJzEwLjUnLCBbJ2ludGVnZXInXSkgPSAxMCAvLyBpbnRlZ2VyXG4gKiB0b1NjaGVtYVR5cGUoMTAuNSwgWydudWxsJywnYm9vbGVhbicsJ3N0cmluZyddKSA9ICcxMC41JyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgxMC41LCBbJ251bGwnLCdib29sZWFuJ10pID0gdHJ1ZSAvLyBib29sZWFuXG4gKlxuICogU3RyaW5nIGNvbnZlcnNpb24gZXhhbXBsZXM6XG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nLCdudW1iZXInLCdpbnRlZ2VyJywnc3RyaW5nJ10pID0gJzEuNXgnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKCcxLjV4JywgWydib29sZWFuJywnbnVtYmVyJywnaW50ZWdlciddKSA9ICcxLjUnIC8vIG51bWJlclxuICogdG9TY2hlbWFUeXBlKCcxLjV4JywgWydib29sZWFuJywnaW50ZWdlciddKSA9ICcxJyAvLyBpbnRlZ2VyXG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqIHRvU2NoZW1hVHlwZSgneHl6JywgWydudW1iZXInLCdpbnRlZ2VyJywnYm9vbGVhbicsJ251bGwnXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqIHRvU2NoZW1hVHlwZSgneHl6JywgWydudW1iZXInLCdpbnRlZ2VyJywnbnVsbCddKSA9IG51bGwgLy8gbnVsbFxuICogdG9TY2hlbWFUeXBlKCd4eXonLCBbJ251bWJlcicsJ2ludGVnZXInXSkgPSAwIC8vIG51bWJlclxuICpcbiAqIEJvb2xlYW4gY29udmVyc2lvbiBleGFtcGxlczpcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnaW50ZWdlcicsJ251bWJlcicsJ3N0cmluZycsJ2Jvb2xlYW4nXSkgPSAxIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9IDEgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEnLCBbJ3N0cmluZycsJ2Jvb2xlYW4nXSkgPSAnMScgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUoJzEnLCBbJ2Jvb2xlYW4nXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqIHRvU2NoZW1hVHlwZSgndHJ1ZScsIFsnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9ICd0cnVlJyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgndHJ1ZScsIFsnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd0cnVlJywgWydudW1iZXInXSkgPSAwIC8vIG51bWJlclxuICogdG9TY2hlbWFUeXBlKHRydWUsIFsnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKHRydWUsIFsnbnVtYmVyJywnc3RyaW5nJ10pID0gJ3RydWUnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKHRydWUsIFsnbnVtYmVyJ10pID0gMSAvLyBudW1iZXJcbiAqXG4gKiAvLyAgeyBQcmltaXRpdmVWYWx1ZSB9IHZhbHVlIC0gdmFsdWUgdG8gY29udmVydFxuICogLy8gIHsgU2NoZW1hUHJpbWl0aXZlVHlwZSB8IFNjaGVtYVByaW1pdGl2ZVR5cGVbXSB9IHR5cGVzIC0gYWxsb3dlZCB0eXBlcyB0byBjb252ZXJ0IHRvXG4gKiAvLyB7IFByaW1pdGl2ZVZhbHVlIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvU2NoZW1hVHlwZSh2YWx1ZSwgdHlwZXMpIHtcbiAgaWYgKCFpc0FycmF5KDxTY2hlbWFQcmltaXRpdmVUeXBlPnR5cGVzKSkge1xuICAgIHR5cGVzID0gPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT5bdHlwZXNdO1xuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bGwnKSAmJiAhaGFzVmFsdWUodmFsdWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnYm9vbGVhbicpICYmICFpc0Jvb2xlYW4odmFsdWUsICdzdHJpY3QnKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJykpIHtcbiAgICBjb25zdCB0ZXN0VmFsdWUgPSB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCAnaW50ZWdlcicpO1xuICAgIGlmICh0ZXN0VmFsdWUgIT09IG51bGwpIHsgcmV0dXJuICt0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudW1iZXInKSkge1xuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsICdudW1iZXInKTtcbiAgICBpZiAodGVzdFZhbHVlICE9PSBudWxsKSB7IHJldHVybiArdGVzdFZhbHVlOyB9XG4gIH1cbiAgaWYgKFxuICAgIChpc1N0cmluZyh2YWx1ZSkgfHwgaXNOdW1iZXIodmFsdWUsICdzdHJpY3QnKSkgJiZcbiAgICAoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ3N0cmluZycpXG4gICkgeyAvLyBDb252ZXJ0IG51bWJlciB0byBzdHJpbmdcbiAgICByZXR1cm4gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2Jvb2xlYW4nKSAmJiBpc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgcmV0dXJuIHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsICdib29sZWFuJyk7XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnc3RyaW5nJykpIHsgLy8gQ29udmVydCBudWxsICYgYm9vbGVhbiB0byBzdHJpbmdcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHsgcmV0dXJuICcnOyB9XG4gICAgY29uc3QgdGVzdFZhbHVlID0gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ3N0cmluZycpO1xuICAgIGlmICh0ZXN0VmFsdWUgIT09IG51bGwpIHsgcmV0dXJuIHRlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoXG4gICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudW1iZXInKSB8fFxuICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnaW50ZWdlcicpKVxuICApIHtcbiAgICBpZiAodmFsdWUgPT09IHRydWUpIHsgcmV0dXJuIDE7IH0gLy8gQ29udmVydCBib29sZWFuICYgbnVsbCB0byBudW1iZXJcbiAgICBpZiAodmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSAnJykgeyByZXR1cm4gMDsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bWJlcicpKSB7IC8vIENvbnZlcnQgbWl4ZWQgc3RyaW5nIHRvIG51bWJlclxuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHBhcnNlRmxvYXQoPHN0cmluZz52YWx1ZSk7XG4gICAgaWYgKCEhdGVzdFZhbHVlKSB7IHJldHVybiB0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJykpIHsgLy8gQ29udmVydCBzdHJpbmcgb3IgbnVtYmVyIHRvIGludGVnZXJcbiAgICBjb25zdCB0ZXN0VmFsdWUgPSBwYXJzZUludCg8c3RyaW5nPnZhbHVlLCAxMCk7XG4gICAgaWYgKCEhdGVzdFZhbHVlKSB7IHJldHVybiB0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdib29sZWFuJykpIHsgLy8gQ29udmVydCBhbnl0aGluZyB0byBib29sZWFuXG4gICAgcmV0dXJuICEhdmFsdWU7XG4gIH1cbiAgaWYgKChcbiAgICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnbnVtYmVyJykgfHxcbiAgICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnaW50ZWdlcicpXG4gICAgKSAmJiAhKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudWxsJylcbiAgKSB7XG4gICAgcmV0dXJuIDA7IC8vIElmIG51bGwgbm90IGFsbG93ZWQsIHJldHVybiAwIGZvciBub24tY29udmVydGFibGUgdmFsdWVzXG4gIH1cbn1cblxuLyoqXG4gKiAnaXNQcm9taXNlJyBmdW5jdGlvblxuICpcbiAqIC8vICAgb2JqZWN0XG4gKiAvLyB7IGJvb2xlYW4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCk6IG9iamVjdCBpcyBQcm9taXNlPGFueT4ge1xuICByZXR1cm4gISFvYmplY3QgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqICdpc09ic2VydmFibGUnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBvYmplY3RcbiAqIC8vIHsgYm9vbGVhbiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc09ic2VydmFibGUob2JqZWN0KTogb2JqZWN0IGlzIE9ic2VydmFibGU8YW55PiB7XG4gIHJldHVybiAhIW9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LnN1YnNjcmliZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiAnX3RvUHJvbWlzZScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgeyBvYmplY3QgfSBvYmplY3RcbiAqIC8vIHsgUHJvbWlzZTxhbnk+IH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF90b1Byb21pc2Uob2JqZWN0KTogUHJvbWlzZTxhbnk+IHtcbiAgcmV0dXJuIGlzUHJvbWlzZShvYmplY3QpID8gb2JqZWN0IDogb2JqZWN0LnRvUHJvbWlzZSgpO1xufVxuXG4vKipcbiAqICd0b09ic2VydmFibGUnIGZ1bmN0aW9uXG4gKlxuICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0XG4gKiAvLyB7IE9ic2VydmFibGU8YW55PiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b09ic2VydmFibGUob2JqZWN0KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgY29uc3Qgb2JzZXJ2YWJsZSA9IGlzUHJvbWlzZShvYmplY3QpID8gZnJvbShvYmplY3QpIDogb2JqZWN0O1xuICBpZiAoaXNPYnNlcnZhYmxlKG9ic2VydmFibGUpKSB7IHJldHVybiBvYnNlcnZhYmxlOyB9XG4gIGNvbnNvbGUuZXJyb3IoJ3RvT2JzZXJ2YWJsZSBlcnJvcjogRXhwZWN0ZWQgdmFsaWRhdG9yIHRvIHJldHVybiBQcm9taXNlIG9yIE9ic2VydmFibGUuJyk7XG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgpO1xufVxuXG4vKipcbiAqICdpbkFycmF5JyBmdW5jdGlvblxuICpcbiAqIFNlYXJjaGVzIGFuIGFycmF5IGZvciBhbiBpdGVtLCBvciBvbmUgb2YgYSBsaXN0IG9mIGl0ZW1zLCBhbmQgcmV0dXJucyB0cnVlXG4gKiBhcyBzb29uIGFzIGEgbWF0Y2ggaXMgZm91bmQsIG9yIGZhbHNlIGlmIG5vIG1hdGNoLlxuICpcbiAqIElmIHRoZSBvcHRpb25hbCB0aGlyZCBwYXJhbWV0ZXIgYWxsSW4gaXMgc2V0IHRvIFRSVUUsIGFuZCB0aGUgaXRlbSB0byBmaW5kXG4gKiBpcyBhbiBhcnJheSwgdGhlbiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlIG9ubHkgaWYgYWxsIGVsZW1lbnRzIGZyb20gaXRlbVxuICogYXJlIGZvdW5kIGluIHRoZSBhcnJheSBsaXN0LCBhbmQgZmFsc2UgaWYgYW55IGVsZW1lbnQgaXMgbm90IGZvdW5kLiBJZiB0aGVcbiAqIGl0ZW0gdG8gZmluZCBpcyBub3QgYW4gYXJyYXksIHNldHRpbmcgYWxsSW4gdG8gVFJVRSBoYXMgbm8gZWZmZWN0LlxuICpcbiAqIC8vICB7IGFueXxhbnlbXSB9IGl0ZW0gLSB0aGUgaXRlbSB0byBzZWFyY2ggZm9yXG4gKiAvLyAgIGFycmF5IC0gdGhlIGFycmF5IHRvIHNlYXJjaFxuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gYWxsSW4gLSBpZiBUUlVFLCBhbGwgaXRlbXMgbXVzdCBiZSBpbiBhcnJheVxuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIGl0ZW0ocykgaW4gYXJyYXksIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5BcnJheShpdGVtLCBhcnJheSwgYWxsSW4gPSBmYWxzZSkge1xuICBpZiAoIWlzRGVmaW5lZChpdGVtKSB8fCAhaXNBcnJheShhcnJheSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHJldHVybiBpc0FycmF5KGl0ZW0pID9cbiAgICBpdGVtW2FsbEluID8gJ2V2ZXJ5JyA6ICdzb21lJ10oc3ViSXRlbSA9PiBhcnJheS5pbmNsdWRlcyhzdWJJdGVtKSkgOlxuICAgIGFycmF5LmluY2x1ZGVzKGl0ZW0pO1xufVxuXG4vKipcbiAqICd4b3InIHV0aWxpdHkgZnVuY3Rpb24gLSBleGNsdXNpdmUgb3JcbiAqXG4gKiBSZXR1cm5zIHRydWUgaWYgZXhhY3RseSBvbmUgb2YgdHdvIHZhbHVlcyBpcyB0cnV0aHkuXG4gKlxuICogLy8gICB2YWx1ZTEgLSBmaXJzdCB2YWx1ZSB0byBjaGVja1xuICogLy8gICB2YWx1ZTIgLSBzZWNvbmQgdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBleGFjdGx5IG9uZSBpbnB1dCB2YWx1ZSBpcyB0cnV0aHksIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24geG9yKHZhbHVlMSwgdmFsdWUyKSB7XG4gIHJldHVybiAoISF2YWx1ZTEgJiYgIXZhbHVlMikgfHwgKCF2YWx1ZTEgJiYgISF2YWx1ZTIpO1xufVxuIl19