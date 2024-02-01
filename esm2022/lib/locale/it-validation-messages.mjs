export const itValidationMessages = {
    required: 'Il campo è obbligatorio',
    minLength: 'Deve inserire almeno {{minimumLength}} caratteri (lunghezza corrente: {{currentLength}})',
    maxLength: 'Il numero massimo di caratteri consentito è {{maximumLength}} (lunghezza corrente: {{currentLength}})',
    pattern: 'Devi rispettare il pattern : {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Deve essere una data, come "31-12-2000"';
            case 'time':
                return 'Deve essere un orario, come "16:20" o "03:14:15.9265"';
            case 'date-time':
                return 'Deve essere data-orario, come "14-03-2000T01:59" or "14-03-2000T01:59:26.535Z"';
            case 'email':
                return 'Deve essere un indirzzo email, come "name@example.com"';
            case 'hostname':
                return 'Deve essere un hostname, come "example.com"';
            case 'ipv4':
                return 'Deve essere un indirizzo IPv4, come "127.0.0.1"';
            case 'ipv6':
                return 'Deve essere un indirizzo IPv6, come "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return 'Deve essere un url, come "http://www.example.com/page.html"';
            case 'uuid':
                return 'Deve essere un uuid, come "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return 'Deve essere un colore, come "#FFFFFF" o "rgb(255, 255, 255)"';
            case 'json-pointer':
                return 'Deve essere un JSON Pointer, come "/pointer/to/something"';
            case 'relative-json-pointer':
                return 'Deve essere un JSON Pointer relativo, come "2/pointer/to/something"';
            case 'regex':
                return 'Deve essere una regular expression, come "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return 'Deve essere formattato correttamente ' + error.requiredFormat;
        }
    },
    minimum: 'Deve essere {{minimumValue}} o più',
    exclusiveMinimum: 'Deve essere più di {{exclusiveMinimumValue}}',
    maximum: 'Deve essere {{maximumValue}} o meno',
    exclusiveMaximum: 'Deve essere minore di {{exclusiveMaximumValue}}',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Deve avere ${decimals} o meno decimali.`;
        }
        else {
            return `Deve essere multiplo di ${error.multipleOfValue}.`;
        }
    },
    minProperties: 'Deve avere {{minimumProperties}} o più elementi (elementi correnti: {{currentProperties}})',
    maxProperties: 'Deve avere {{maximumProperties}} o meno elementi (elementi correnti: {{currentProperties}})',
    minItems: 'Deve avere {{minimumItems}} o più elementi (elementi correnti: {{currentItems}})',
    maxItems: 'Deve avere {{maximumItems}} o meno elementi (elementi correnti: {{currentItems}})',
    uniqueItems: 'Tutti gli elementi devono essere unici',
    // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXQtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9sb2NhbGUvaXQtdmFsaWRhdGlvbi1tZXNzYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBUTtJQUN2QyxRQUFRLEVBQUUseUJBQXlCO0lBQ25DLFNBQVMsRUFBRSwwRkFBMEY7SUFDckcsU0FBUyxFQUFFLHVHQUF1RztJQUNsSCxPQUFPLEVBQUUsa0RBQWtEO0lBQzNELE1BQU0sRUFBRSxVQUFVLEtBQUs7UUFDckIsUUFBUSxLQUFLLENBQUMsY0FBYyxFQUFFO1lBQzVCLEtBQUssTUFBTTtnQkFDVCxPQUFPLHlDQUF5QyxDQUFDO1lBQ25ELEtBQUssTUFBTTtnQkFDVCxPQUFPLHVEQUF1RCxDQUFDO1lBQ2pFLEtBQUssV0FBVztnQkFDZCxPQUFPLGdGQUFnRixDQUFDO1lBQzFGLEtBQUssT0FBTztnQkFDVixPQUFPLHdEQUF3RCxDQUFDO1lBQ2xFLEtBQUssVUFBVTtnQkFDYixPQUFPLDZDQUE2QyxDQUFDO1lBQ3ZELEtBQUssTUFBTTtnQkFDVCxPQUFPLGlEQUFpRCxDQUFDO1lBQzNELEtBQUssTUFBTTtnQkFDVCxPQUFPLCtFQUErRSxDQUFDO1lBQ3pGLG9FQUFvRTtZQUNwRSx5REFBeUQ7WUFDekQsS0FBSyxLQUFLO2dCQUNSLE9BQU8sNkRBQTZELENBQUM7WUFDdkUsS0FBSyxNQUFNO2dCQUNULE9BQU8sa0VBQWtFLENBQUM7WUFDNUUsS0FBSyxPQUFPO2dCQUNWLE9BQU8sOERBQThELENBQUM7WUFDeEUsS0FBSyxjQUFjO2dCQUNqQixPQUFPLDJEQUEyRCxDQUFDO1lBQ3JFLEtBQUssdUJBQXVCO2dCQUMxQixPQUFPLHFFQUFxRSxDQUFDO1lBQy9FLEtBQUssT0FBTztnQkFDVixPQUFPLHNFQUFzRSxDQUFDO1lBQ2hGO2dCQUNFLE9BQU8sdUNBQXVDLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztTQUN6RTtJQUNILENBQUM7SUFDRCxPQUFPLEVBQUUsb0NBQW9DO0lBQzdDLGdCQUFnQixFQUFFLDhDQUE4QztJQUNoRSxPQUFPLEVBQUUscUNBQXFDO0lBQzlDLGdCQUFnQixFQUFFLGlEQUFpRDtJQUNuRSxVQUFVLEVBQUUsVUFBVSxLQUFLO1FBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sY0FBYyxRQUFRLG1CQUFtQixDQUFDO1NBQ2xEO2FBQU07WUFDTCxPQUFPLDJCQUEyQixLQUFLLENBQUMsZUFBZSxHQUFHLENBQUM7U0FDNUQ7SUFDSCxDQUFDO0lBQ0QsYUFBYSxFQUFFLDRGQUE0RjtJQUMzRyxhQUFhLEVBQUUsNkZBQTZGO0lBQzVHLFFBQVEsRUFBRSxrRkFBa0Y7SUFDNUYsUUFBUSxFQUFFLG1GQUFtRjtJQUM3RixXQUFXLEVBQUUsd0NBQXdDO0lBQ3JELGlGQUFpRjtDQUNsRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGl0VmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnkgPSB7IC8vIERlZmF1bHQgSXRhbGlhbiBlcnJvciBtZXNzYWdlc1xuICByZXF1aXJlZDogJ0lsIGNhbXBvIMOoIG9iYmxpZ2F0b3JpbycsXG4gIG1pbkxlbmd0aDogJ0RldmUgaW5zZXJpcmUgYWxtZW5vIHt7bWluaW11bUxlbmd0aH19IGNhcmF0dGVyaSAobHVuZ2hlenphIGNvcnJlbnRlOiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBtYXhMZW5ndGg6ICdJbCBudW1lcm8gbWFzc2ltbyBkaSBjYXJhdHRlcmkgY29uc2VudGl0byDDqCB7e21heGltdW1MZW5ndGh9fSAobHVuZ2hlenphIGNvcnJlbnRlOiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBwYXR0ZXJuOiAnRGV2aSByaXNwZXR0YXJlIGlsIHBhdHRlcm4gOiB7e3JlcXVpcmVkUGF0dGVybn19JyxcbiAgZm9ybWF0OiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBzd2l0Y2ggKGVycm9yLnJlcXVpcmVkRm9ybWF0KSB7XG4gICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1bmEgZGF0YSwgY29tZSBcIjMxLTEyLTIwMDBcIic7XG4gICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biBvcmFyaW8sIGNvbWUgXCIxNjoyMFwiIG8gXCIwMzoxNDoxNS45MjY1XCInO1xuICAgICAgY2FzZSAnZGF0ZS10aW1lJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSBkYXRhLW9yYXJpbywgY29tZSBcIjE0LTAzLTIwMDBUMDE6NTlcIiBvciBcIjE0LTAzLTIwMDBUMDE6NTk6MjYuNTM1WlwiJztcbiAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biBpbmRpcnp6byBlbWFpbCwgY29tZSBcIm5hbWVAZXhhbXBsZS5jb21cIic7XG4gICAgICBjYXNlICdob3N0bmFtZSc6XG4gICAgICAgIHJldHVybiAnRGV2ZSBlc3NlcmUgdW4gaG9zdG5hbWUsIGNvbWUgXCJleGFtcGxlLmNvbVwiJztcbiAgICAgIGNhc2UgJ2lwdjQnOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuIGluZGlyaXp6byBJUHY0LCBjb21lIFwiMTI3LjAuMC4xXCInO1xuICAgICAgY2FzZSAnaXB2Nic6XG4gICAgICAgIHJldHVybiAnRGV2ZSBlc3NlcmUgdW4gaW5kaXJpenpvIElQdjYsIGNvbWUgXCIxMjM0OjU2Nzg6OUFCQzpERUYwOjEyMzQ6NTY3ODo5QUJDOkRFRjBcIic7XG4gICAgICAvLyBUT0RPOiBhZGQgZXhhbXBsZXMgZm9yICd1cmknLCAndXJpLXJlZmVyZW5jZScsIGFuZCAndXJpLXRlbXBsYXRlJ1xuICAgICAgLy8gY2FzZSAndXJpJzogY2FzZSAndXJpLXJlZmVyZW5jZSc6IGNhc2UgJ3VyaS10ZW1wbGF0ZSc6XG4gICAgICBjYXNlICd1cmwnOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuIHVybCwgY29tZSBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vcGFnZS5odG1sXCInO1xuICAgICAgY2FzZSAndXVpZCc6XG4gICAgICAgIHJldHVybiAnRGV2ZSBlc3NlcmUgdW4gdXVpZCwgY29tZSBcIjEyMzQ1Njc4LTlBQkMtREVGMC0xMjM0LTU2Nzg5QUJDREVGMFwiJztcbiAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biBjb2xvcmUsIGNvbWUgXCIjRkZGRkZGXCIgbyBcInJnYigyNTUsIDI1NSwgMjU1KVwiJztcbiAgICAgIGNhc2UgJ2pzb24tcG9pbnRlcic6XG4gICAgICAgIHJldHVybiAnRGV2ZSBlc3NlcmUgdW4gSlNPTiBQb2ludGVyLCBjb21lIFwiL3BvaW50ZXIvdG8vc29tZXRoaW5nXCInO1xuICAgICAgY2FzZSAncmVsYXRpdmUtanNvbi1wb2ludGVyJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biBKU09OIFBvaW50ZXIgcmVsYXRpdm8sIGNvbWUgXCIyL3BvaW50ZXIvdG8vc29tZXRoaW5nXCInO1xuICAgICAgY2FzZSAncmVnZXgnOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuYSByZWd1bGFyIGV4cHJlc3Npb24sIGNvbWUgXCIoMS0pP1xcXFxkezN9LVxcXFxkezN9LVxcXFxkezR9XCInO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSBmb3JtYXR0YXRvIGNvcnJldHRhbWVudGUgJyArIGVycm9yLnJlcXVpcmVkRm9ybWF0O1xuICAgIH1cbiAgfSxcbiAgbWluaW11bTogJ0RldmUgZXNzZXJlIHt7bWluaW11bVZhbHVlfX0gbyBwacO5JyxcbiAgZXhjbHVzaXZlTWluaW11bTogJ0RldmUgZXNzZXJlIHBpw7kgZGkge3tleGNsdXNpdmVNaW5pbXVtVmFsdWV9fScsXG4gIG1heGltdW06ICdEZXZlIGVzc2VyZSB7e21heGltdW1WYWx1ZX19IG8gbWVubycsXG4gIGV4Y2x1c2l2ZU1heGltdW06ICdEZXZlIGVzc2VyZSBtaW5vcmUgZGkge3tleGNsdXNpdmVNYXhpbXVtVmFsdWV9fScsXG4gIG11bHRpcGxlT2Y6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIGlmICgoMSAvIGVycm9yLm11bHRpcGxlT2ZWYWx1ZSkgJSAxMCA9PT0gMCkge1xuICAgICAgY29uc3QgZGVjaW1hbHMgPSBNYXRoLmxvZzEwKDEgLyBlcnJvci5tdWx0aXBsZU9mVmFsdWUpO1xuICAgICAgcmV0dXJuIGBEZXZlIGF2ZXJlICR7ZGVjaW1hbHN9IG8gbWVubyBkZWNpbWFsaS5gO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYERldmUgZXNzZXJlIG11bHRpcGxvIGRpICR7ZXJyb3IubXVsdGlwbGVPZlZhbHVlfS5gO1xuICAgIH1cbiAgfSxcbiAgbWluUHJvcGVydGllczogJ0RldmUgYXZlcmUge3ttaW5pbXVtUHJvcGVydGllc319IG8gcGnDuSBlbGVtZW50aSAoZWxlbWVudGkgY29ycmVudGk6IHt7Y3VycmVudFByb3BlcnRpZXN9fSknLFxuICBtYXhQcm9wZXJ0aWVzOiAnRGV2ZSBhdmVyZSB7e21heGltdW1Qcm9wZXJ0aWVzfX0gbyBtZW5vIGVsZW1lbnRpIChlbGVtZW50aSBjb3JyZW50aToge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1pbkl0ZW1zOiAnRGV2ZSBhdmVyZSB7e21pbmltdW1JdGVtc319IG8gcGnDuSBlbGVtZW50aSAoZWxlbWVudGkgY29ycmVudGk6IHt7Y3VycmVudEl0ZW1zfX0pJyxcbiAgbWF4SXRlbXM6ICdEZXZlIGF2ZXJlIHt7bWF4aW11bUl0ZW1zfX0gbyBtZW5vIGVsZW1lbnRpIChlbGVtZW50aSBjb3JyZW50aToge3tjdXJyZW50SXRlbXN9fSknLFxuICB1bmlxdWVJdGVtczogJ1R1dHRpIGdsaSBlbGVtZW50aSBkZXZvbm8gZXNzZXJlIHVuaWNpJyxcbiAgLy8gTm90ZTogTm8gZGVmYXVsdCBlcnJvciBtZXNzYWdlcyBmb3IgJ3R5cGUnLCAnY29uc3QnLCAnZW51bScsIG9yICdkZXBlbmRlbmNpZXMnXG59O1xuIl19