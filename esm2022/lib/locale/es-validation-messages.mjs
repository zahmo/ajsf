export const esValidationMessages = {
    required: 'Este campo está requerido.',
    minLength: 'Debe tener {{minimumLength}} caracteres o más longitud (longitud actual: {{currentLength}})',
    maxLength: 'Debe tener {{maximumLength}} caracteres o menos longitud (longitud actual: {{currentLength}})',
    pattern: 'Must match pattern: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Debe tener una fecha, ej "2000-12-31"';
            case 'time':
                return 'Debe tener una hora, ej "16:20" o "03:14:15.9265"';
            case 'date-time':
                return 'Debe tener fecha y hora, ej "2000-03-14T01:59" o "2000-03-14T01:59:26.535Z"';
            case 'email':
                return 'No hay dirección de correo electrónico válida, ej "name@example.com"';
            case 'hostname':
                return 'Debe ser un nombre de host válido, ej "example.com"';
            case 'ipv4':
                return 'Debe ser una dirección de IPv4, ej "127.0.0.1"';
            case 'ipv6':
                return 'Debe ser una dirección de IPv6, ej "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            case 'url':
                return 'Debe ser una URL, ej "http://www.example.com/page.html"';
            case 'uuid':
                return 'Debe ser un UUID, ej "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return 'Debe ser un color, ej "#FFFFFF" or "rgb(255, 255, 255)"';
            case 'json-pointer':
                return 'Debe ser un JSON Pointer, ej "/pointer/to/something"';
            case 'relative-json-pointer':
                return 'Debe ser un JSON Pointer relativo, ej "2/pointer/to/something"';
            case 'regex':
                return 'Debe ser una expresión regular, ej "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return 'Debe tener el formato correcto ' + error.requiredFormat;
        }
    },
    minimum: 'Debe ser {{minimumValue}} o más',
    exclusiveMinimum: 'Debe ser superior a {{exclusiveMinimumValue}}',
    maximum: 'Debe ser {{maximumValue}} o menos',
    exclusiveMaximum: 'Debe ser menor que {{exclusiveMaximumValue}}',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Se permite un máximo de ${decimals} decimales`;
        }
        else {
            return `Debe ser múltiplo de ${error.multipleOfValue}.`;
        }
    },
    minProperties: 'Debe tener {{minimumProperties}} o más elementos (elementos actuales: {{currentProperties}})',
    maxProperties: 'Debe tener {{maximumProperties}} o menos elementos (elementos actuales: {{currentProperties}})',
    minItems: 'Debe tener {{minimumItems}} o más elementos (elementos actuales: {{currentItems}})',
    maxItems: 'Debe tener {{maximumItems}} o menos elementos (elementos actuales: {{currentItems}})',
    uniqueItems: 'Todos los elementos deben ser únicos',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXMtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9sb2NhbGUvZXMtdmFsaWRhdGlvbi1tZXNzYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBUTtJQUN2QyxRQUFRLEVBQUUsNEJBQTRCO0lBQ3RDLFNBQVMsRUFBRSw2RkFBNkY7SUFDeEcsU0FBUyxFQUFFLCtGQUErRjtJQUMxRyxPQUFPLEVBQUUseUNBQXlDO0lBQ2xELE1BQU0sRUFBRSxVQUFVLEtBQUs7UUFDckIsUUFBUSxLQUFLLENBQUMsY0FBYyxFQUFFO1lBQzVCLEtBQUssTUFBTTtnQkFDVCxPQUFPLHVDQUF1QyxDQUFDO1lBQ2pELEtBQUssTUFBTTtnQkFDVCxPQUFPLG1EQUFtRCxDQUFDO1lBQzdELEtBQUssV0FBVztnQkFDZCxPQUFPLDZFQUE2RSxDQUFDO1lBQ3ZGLEtBQUssT0FBTztnQkFDVixPQUFPLHNFQUFzRSxDQUFDO1lBQ2hGLEtBQUssVUFBVTtnQkFDYixPQUFPLHFEQUFxRCxDQUFDO1lBQy9ELEtBQUssTUFBTTtnQkFDVCxPQUFPLGdEQUFnRCxDQUFDO1lBQzFELEtBQUssTUFBTTtnQkFDVCxPQUFPLDhFQUE4RSxDQUFDO1lBQ3hGLEtBQUssS0FBSztnQkFDUixPQUFPLHlEQUF5RCxDQUFDO1lBQ25FLEtBQUssTUFBTTtnQkFDVCxPQUFPLDZEQUE2RCxDQUFDO1lBQ3ZFLEtBQUssT0FBTztnQkFDVixPQUFPLHlEQUF5RCxDQUFDO1lBQ25FLEtBQUssY0FBYztnQkFDakIsT0FBTyxzREFBc0QsQ0FBQztZQUNoRSxLQUFLLHVCQUF1QjtnQkFDMUIsT0FBTyxnRUFBZ0UsQ0FBQztZQUMxRSxLQUFLLE9BQU87Z0JBQ1YsT0FBTyxnRUFBZ0UsQ0FBQztZQUMxRTtnQkFDRSxPQUFPLGlDQUFpQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUM7U0FDbkU7SUFDSCxDQUFDO0lBQ0QsT0FBTyxFQUFFLGlDQUFpQztJQUMxQyxnQkFBZ0IsRUFBRSwrQ0FBK0M7SUFDakUsT0FBTyxFQUFFLG1DQUFtQztJQUM1QyxnQkFBZ0IsRUFBRSw4Q0FBOEM7SUFDaEUsVUFBVSxFQUFFLFVBQVUsS0FBSztRQUN6QixJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN2RCxPQUFPLDJCQUEyQixRQUFRLFlBQVksQ0FBQztTQUN4RDthQUFNO1lBQ0wsT0FBTyx3QkFBd0IsS0FBSyxDQUFDLGVBQWUsR0FBRyxDQUFDO1NBQ3pEO0lBQ0gsQ0FBQztJQUNELGFBQWEsRUFBRSw4RkFBOEY7SUFDN0csYUFBYSxFQUFFLGdHQUFnRztJQUMvRyxRQUFRLEVBQUUsb0ZBQW9GO0lBQzlGLFFBQVEsRUFBRSxzRkFBc0Y7SUFDaEcsV0FBVyxFQUFFLHNDQUFzQztDQUNwRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGVzVmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnkgPSB7IC8vIERlZmF1bHQgU3BhbmlzaCBlcnJvciBtZXNzYWdlc1xuICByZXF1aXJlZDogJ0VzdGUgY2FtcG8gZXN0w6EgcmVxdWVyaWRvLicsXG4gIG1pbkxlbmd0aDogJ0RlYmUgdGVuZXIge3ttaW5pbXVtTGVuZ3RofX0gY2FyYWN0ZXJlcyBvIG3DoXMgbG9uZ2l0dWQgKGxvbmdpdHVkIGFjdHVhbDoge3tjdXJyZW50TGVuZ3RofX0pJyxcbiAgbWF4TGVuZ3RoOiAnRGViZSB0ZW5lciB7e21heGltdW1MZW5ndGh9fSBjYXJhY3RlcmVzIG8gbWVub3MgbG9uZ2l0dWQgKGxvbmdpdHVkIGFjdHVhbDoge3tjdXJyZW50TGVuZ3RofX0pJyxcbiAgcGF0dGVybjogJ011c3QgbWF0Y2ggcGF0dGVybjoge3tyZXF1aXJlZFBhdHRlcm59fScsXG4gIGZvcm1hdDogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgc3dpdGNoIChlcnJvci5yZXF1aXJlZEZvcm1hdCkge1xuICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgIHJldHVybiAnRGViZSB0ZW5lciB1bmEgZmVjaGEsIGVqIFwiMjAwMC0xMi0zMVwiJztcbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICByZXR1cm4gJ0RlYmUgdGVuZXIgdW5hIGhvcmEsIGVqIFwiMTY6MjBcIiBvIFwiMDM6MTQ6MTUuOTI2NVwiJztcbiAgICAgIGNhc2UgJ2RhdGUtdGltZSc6XG4gICAgICAgIHJldHVybiAnRGViZSB0ZW5lciBmZWNoYSB5IGhvcmEsIGVqIFwiMjAwMC0wMy0xNFQwMTo1OVwiIG8gXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVpcIic7XG4gICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgIHJldHVybiAnTm8gaGF5IGRpcmVjY2nDs24gZGUgY29ycmVvIGVsZWN0csOzbmljbyB2w6FsaWRhLCBlaiBcIm5hbWVAZXhhbXBsZS5jb21cIic7XG4gICAgICBjYXNlICdob3N0bmFtZSc6XG4gICAgICAgIHJldHVybiAnRGViZSBzZXIgdW4gbm9tYnJlIGRlIGhvc3QgdsOhbGlkbywgZWogXCJleGFtcGxlLmNvbVwiJztcbiAgICAgIGNhc2UgJ2lwdjQnOlxuICAgICAgICByZXR1cm4gJ0RlYmUgc2VyIHVuYSBkaXJlY2Npw7NuIGRlIElQdjQsIGVqIFwiMTI3LjAuMC4xXCInO1xuICAgICAgY2FzZSAnaXB2Nic6XG4gICAgICAgIHJldHVybiAnRGViZSBzZXIgdW5hIGRpcmVjY2nDs24gZGUgSVB2NiwgZWogXCIxMjM0OjU2Nzg6OUFCQzpERUYwOjEyMzQ6NTY3ODo5QUJDOkRFRjBcIic7XG4gICAgICBjYXNlICd1cmwnOlxuICAgICAgICByZXR1cm4gJ0RlYmUgc2VyIHVuYSBVUkwsIGVqIFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9wYWdlLmh0bWxcIic7XG4gICAgICBjYXNlICd1dWlkJzpcbiAgICAgICAgcmV0dXJuICdEZWJlIHNlciB1biBVVUlELCBlaiBcIjEyMzQ1Njc4LTlBQkMtREVGMC0xMjM0LTU2Nzg5QUJDREVGMFwiJztcbiAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgcmV0dXJuICdEZWJlIHNlciB1biBjb2xvciwgZWogXCIjRkZGRkZGXCIgb3IgXCJyZ2IoMjU1LCAyNTUsIDI1NSlcIic7XG4gICAgICBjYXNlICdqc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ0RlYmUgc2VyIHVuIEpTT04gUG9pbnRlciwgZWogXCIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWxhdGl2ZS1qc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ0RlYmUgc2VyIHVuIEpTT04gUG9pbnRlciByZWxhdGl2bywgZWogXCIyL3BvaW50ZXIvdG8vc29tZXRoaW5nXCInO1xuICAgICAgY2FzZSAncmVnZXgnOlxuICAgICAgICByZXR1cm4gJ0RlYmUgc2VyIHVuYSBleHByZXNpw7NuIHJlZ3VsYXIsIGVqIFwiKDEtKT9cXFxcZHszfS1cXFxcZHszfS1cXFxcZHs0fVwiJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnRGViZSB0ZW5lciBlbCBmb3JtYXRvIGNvcnJlY3RvICcgKyBlcnJvci5yZXF1aXJlZEZvcm1hdDtcbiAgICB9XG4gIH0sXG4gIG1pbmltdW06ICdEZWJlIHNlciB7e21pbmltdW1WYWx1ZX19IG8gbcOhcycsXG4gIGV4Y2x1c2l2ZU1pbmltdW06ICdEZWJlIHNlciBzdXBlcmlvciBhIHt7ZXhjbHVzaXZlTWluaW11bVZhbHVlfX0nLFxuICBtYXhpbXVtOiAnRGViZSBzZXIge3ttYXhpbXVtVmFsdWV9fSBvIG1lbm9zJyxcbiAgZXhjbHVzaXZlTWF4aW11bTogJ0RlYmUgc2VyIG1lbm9yIHF1ZSB7e2V4Y2x1c2l2ZU1heGltdW1WYWx1ZX19JyxcbiAgbXVsdGlwbGVPZjogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgaWYgKCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKSAlIDEwID09PSAwKSB7XG4gICAgICBjb25zdCBkZWNpbWFscyA9IE1hdGgubG9nMTAoMSAvIGVycm9yLm11bHRpcGxlT2ZWYWx1ZSk7XG4gICAgICByZXR1cm4gYFNlIHBlcm1pdGUgdW4gbcOheGltbyBkZSAke2RlY2ltYWxzfSBkZWNpbWFsZXNgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYERlYmUgc2VyIG3Dumx0aXBsbyBkZSAke2Vycm9yLm11bHRpcGxlT2ZWYWx1ZX0uYDtcbiAgICB9XG4gIH0sXG4gIG1pblByb3BlcnRpZXM6ICdEZWJlIHRlbmVyIHt7bWluaW11bVByb3BlcnRpZXN9fSBvIG3DoXMgZWxlbWVudG9zIChlbGVtZW50b3MgYWN0dWFsZXM6IHt7Y3VycmVudFByb3BlcnRpZXN9fSknLFxuICBtYXhQcm9wZXJ0aWVzOiAnRGViZSB0ZW5lciB7e21heGltdW1Qcm9wZXJ0aWVzfX0gbyBtZW5vcyBlbGVtZW50b3MgKGVsZW1lbnRvcyBhY3R1YWxlczoge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1pbkl0ZW1zOiAnRGViZSB0ZW5lciB7e21pbmltdW1JdGVtc319IG8gbcOhcyBlbGVtZW50b3MgKGVsZW1lbnRvcyBhY3R1YWxlczoge3tjdXJyZW50SXRlbXN9fSknLFxuICBtYXhJdGVtczogJ0RlYmUgdGVuZXIge3ttYXhpbXVtSXRlbXN9fSBvIG1lbm9zIGVsZW1lbnRvcyAoZWxlbWVudG9zIGFjdHVhbGVzOiB7e2N1cnJlbnRJdGVtc319KScsXG4gIHVuaXF1ZUl0ZW1zOiAnVG9kb3MgbG9zIGVsZW1lbnRvcyBkZWJlbiBzZXIgw7puaWNvcycsXG59O1xuIl19