export const deValidationMessages = {
    required: 'Darf nicht leer sein',
    minLength: 'Mindestens {{minimumLength}} Zeichen benötigt (aktuell: {{currentLength}})',
    maxLength: 'Maximal {{maximumLength}} Zeichen erlaubt (aktuell: {{currentLength}})',
    pattern: 'Entspricht nicht diesem regulären Ausdruck: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Muss ein Datum sein, z. B. "2000-12-31"';
            case 'time':
                return 'Muss eine Zeitangabe sein, z. B. "16:20" oder "03:14:15.9265"';
            case 'date-time':
                return 'Muss Datum mit Zeit beinhalten, z. B. "2000-03-14T01:59" oder "2000-03-14T01:59:26.535Z"';
            case 'email':
                return 'Keine gültige E-Mail-Adresse (z. B. "name@example.com")';
            case 'hostname':
                return 'Kein gültiger Hostname (z. B. "example.com")';
            case 'ipv4':
                return 'Keine gültige IPv4-Adresse (z. B. "127.0.0.1")';
            case 'ipv6':
                return 'Keine gültige IPv6-Adresse (z. B. "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0")';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return 'Keine gültige URL (z. B. "http://www.example.com/page.html")';
            case 'uuid':
                return 'Keine gültige UUID (z. B. "12345678-9ABC-DEF0-1234-56789ABCDEF0")';
            case 'color':
                return 'Kein gültiger Farbwert (z. B. "#FFFFFF" oder "rgb(255, 255, 255)")';
            case 'json-pointer':
                return 'Kein gültiger JSON-Pointer (z. B. "/pointer/to/something")';
            case 'relative-json-pointer':
                return 'Kein gültiger relativer JSON-Pointer (z. B. "2/pointer/to/something")';
            case 'regex':
                return 'Kein gültiger regulärer Ausdruck (z. B. "(1-)?\\d{3}-\\d{3}-\\d{4}")';
            default:
                return 'Muss diesem Format entsprechen: ' + error.requiredFormat;
        }
    },
    minimum: 'Muss mindestens {{minimumValue}} sein',
    exclusiveMinimum: 'Muss größer als {{exclusiveMinimumValue}} sein',
    maximum: 'Darf maximal {{maximumValue}} sein',
    exclusiveMaximum: 'Muss kleiner als {{exclusiveMaximumValue}} sein',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Maximal ${decimals} Dezimalstellen erlaubt`;
        }
        else {
            return `Muss ein Vielfaches von ${error.multipleOfValue} sein`;
        }
    },
    minProperties: 'Mindestens {{minimumProperties}} Attribute erforderlich (aktuell: {{currentProperties}})',
    maxProperties: 'Maximal {{maximumProperties}} Attribute erlaubt (aktuell: {{currentProperties}})',
    minItems: 'Mindestens {{minimumItems}} Werte erforderlich (aktuell: {{currentItems}})',
    maxItems: 'Maximal {{maximumItems}} Werte erlaubt (aktuell: {{currentItems}})',
    uniqueItems: 'Alle Werte müssen eindeutig sein',
    // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGUtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9sb2NhbGUvZGUtdmFsaWRhdGlvbi1tZXNzYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBUTtJQUN2QyxRQUFRLEVBQUUsc0JBQXNCO0lBQ2hDLFNBQVMsRUFBRSw0RUFBNEU7SUFDdkYsU0FBUyxFQUFFLHdFQUF3RTtJQUNuRixPQUFPLEVBQUUsaUVBQWlFO0lBQzFFLE1BQU0sRUFBRSxVQUFVLEtBQUs7UUFDckIsUUFBUSxLQUFLLENBQUMsY0FBYyxFQUFFO1lBQzVCLEtBQUssTUFBTTtnQkFDVCxPQUFPLHlDQUF5QyxDQUFDO1lBQ25ELEtBQUssTUFBTTtnQkFDVCxPQUFPLCtEQUErRCxDQUFDO1lBQ3pFLEtBQUssV0FBVztnQkFDZCxPQUFPLDBGQUEwRixDQUFDO1lBQ3BHLEtBQUssT0FBTztnQkFDVixPQUFPLHlEQUF5RCxDQUFDO1lBQ25FLEtBQUssVUFBVTtnQkFDYixPQUFPLDhDQUE4QyxDQUFDO1lBQ3hELEtBQUssTUFBTTtnQkFDVCxPQUFPLGdEQUFnRCxDQUFDO1lBQzFELEtBQUssTUFBTTtnQkFDVCxPQUFPLDhFQUE4RSxDQUFDO1lBQ3hGLG9FQUFvRTtZQUNwRSx5REFBeUQ7WUFDekQsS0FBSyxLQUFLO2dCQUNSLE9BQU8sOERBQThELENBQUM7WUFDeEUsS0FBSyxNQUFNO2dCQUNULE9BQU8sbUVBQW1FLENBQUM7WUFDN0UsS0FBSyxPQUFPO2dCQUNWLE9BQU8sb0VBQW9FLENBQUM7WUFDOUUsS0FBSyxjQUFjO2dCQUNqQixPQUFPLDREQUE0RCxDQUFDO1lBQ3RFLEtBQUssdUJBQXVCO2dCQUMxQixPQUFPLHVFQUF1RSxDQUFDO1lBQ2pGLEtBQUssT0FBTztnQkFDVixPQUFPLHNFQUFzRSxDQUFDO1lBQ2hGO2dCQUNFLE9BQU8sa0NBQWtDLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztTQUNwRTtJQUNILENBQUM7SUFDRCxPQUFPLEVBQUUsdUNBQXVDO0lBQ2hELGdCQUFnQixFQUFFLGdEQUFnRDtJQUNsRSxPQUFPLEVBQUUsb0NBQW9DO0lBQzdDLGdCQUFnQixFQUFFLGlEQUFpRDtJQUNuRSxVQUFVLEVBQUUsVUFBVSxLQUFLO1FBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sV0FBVyxRQUFRLHlCQUF5QixDQUFDO1NBQ3JEO2FBQU07WUFDTCxPQUFPLDJCQUEyQixLQUFLLENBQUMsZUFBZSxPQUFPLENBQUM7U0FDaEU7SUFDSCxDQUFDO0lBQ0QsYUFBYSxFQUFFLDBGQUEwRjtJQUN6RyxhQUFhLEVBQUUsa0ZBQWtGO0lBQ2pHLFFBQVEsRUFBRSw0RUFBNEU7SUFDdEYsUUFBUSxFQUFFLG9FQUFvRTtJQUM5RSxXQUFXLEVBQUUsa0NBQWtDO0lBQy9DLGlGQUFpRjtDQUNsRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGRlVmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnkgPSB7IC8vIERlZmF1bHQgR2VybWFuIGVycm9yIG1lc3NhZ2VzXG4gIHJlcXVpcmVkOiAnRGFyZiBuaWNodCBsZWVyIHNlaW4nLFxuICBtaW5MZW5ndGg6ICdNaW5kZXN0ZW5zIHt7bWluaW11bUxlbmd0aH19IFplaWNoZW4gYmVuw7Z0aWd0IChha3R1ZWxsOiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBtYXhMZW5ndGg6ICdNYXhpbWFsIHt7bWF4aW11bUxlbmd0aH19IFplaWNoZW4gZXJsYXVidCAoYWt0dWVsbDoge3tjdXJyZW50TGVuZ3RofX0pJyxcbiAgcGF0dGVybjogJ0VudHNwcmljaHQgbmljaHQgZGllc2VtIHJlZ3Vsw6RyZW4gQXVzZHJ1Y2s6IHt7cmVxdWlyZWRQYXR0ZXJufX0nLFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHN3aXRjaCAoZXJyb3IucmVxdWlyZWRGb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICByZXR1cm4gJ011c3MgZWluIERhdHVtIHNlaW4sIHouIEIuIFwiMjAwMC0xMi0zMVwiJztcbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICByZXR1cm4gJ011c3MgZWluZSBaZWl0YW5nYWJlIHNlaW4sIHouIEIuIFwiMTY6MjBcIiBvZGVyIFwiMDM6MTQ6MTUuOTI2NVwiJztcbiAgICAgIGNhc2UgJ2RhdGUtdGltZSc6XG4gICAgICAgIHJldHVybiAnTXVzcyBEYXR1bSBtaXQgWmVpdCBiZWluaGFsdGVuLCB6LiBCLiBcIjIwMDAtMDMtMTRUMDE6NTlcIiBvZGVyIFwiMjAwMC0wMy0xNFQwMTo1OToyNi41MzVaXCInO1xuICAgICAgY2FzZSAnZW1haWwnOlxuICAgICAgICByZXR1cm4gJ0tlaW5lIGfDvGx0aWdlIEUtTWFpbC1BZHJlc3NlICh6LiBCLiBcIm5hbWVAZXhhbXBsZS5jb21cIiknO1xuICAgICAgY2FzZSAnaG9zdG5hbWUnOlxuICAgICAgICByZXR1cm4gJ0tlaW4gZ8O8bHRpZ2VyIEhvc3RuYW1lICh6LiBCLiBcImV4YW1wbGUuY29tXCIpJztcbiAgICAgIGNhc2UgJ2lwdjQnOlxuICAgICAgICByZXR1cm4gJ0tlaW5lIGfDvGx0aWdlIElQdjQtQWRyZXNzZSAoei4gQi4gXCIxMjcuMC4wLjFcIiknO1xuICAgICAgY2FzZSAnaXB2Nic6XG4gICAgICAgIHJldHVybiAnS2VpbmUgZ8O8bHRpZ2UgSVB2Ni1BZHJlc3NlICh6LiBCLiBcIjEyMzQ6NTY3ODo5QUJDOkRFRjA6MTIzNDo1Njc4OjlBQkM6REVGMFwiKSc7XG4gICAgICAvLyBUT0RPOiBhZGQgZXhhbXBsZXMgZm9yICd1cmknLCAndXJpLXJlZmVyZW5jZScsIGFuZCAndXJpLXRlbXBsYXRlJ1xuICAgICAgLy8gY2FzZSAndXJpJzogY2FzZSAndXJpLXJlZmVyZW5jZSc6IGNhc2UgJ3VyaS10ZW1wbGF0ZSc6XG4gICAgICBjYXNlICd1cmwnOlxuICAgICAgICByZXR1cm4gJ0tlaW5lIGfDvGx0aWdlIFVSTCAoei4gQi4gXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3BhZ2UuaHRtbFwiKSc7XG4gICAgICBjYXNlICd1dWlkJzpcbiAgICAgICAgcmV0dXJuICdLZWluZSBnw7xsdGlnZSBVVUlEICh6LiBCLiBcIjEyMzQ1Njc4LTlBQkMtREVGMC0xMjM0LTU2Nzg5QUJDREVGMFwiKSc7XG4gICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIHJldHVybiAnS2VpbiBnw7xsdGlnZXIgRmFyYndlcnQgKHouIEIuIFwiI0ZGRkZGRlwiIG9kZXIgXCJyZ2IoMjU1LCAyNTUsIDI1NSlcIiknO1xuICAgICAgY2FzZSAnanNvbi1wb2ludGVyJzpcbiAgICAgICAgcmV0dXJuICdLZWluIGfDvGx0aWdlciBKU09OLVBvaW50ZXIgKHouIEIuIFwiL3BvaW50ZXIvdG8vc29tZXRoaW5nXCIpJztcbiAgICAgIGNhc2UgJ3JlbGF0aXZlLWpzb24tcG9pbnRlcic6XG4gICAgICAgIHJldHVybiAnS2VpbiBnw7xsdGlnZXIgcmVsYXRpdmVyIEpTT04tUG9pbnRlciAoei4gQi4gXCIyL3BvaW50ZXIvdG8vc29tZXRoaW5nXCIpJztcbiAgICAgIGNhc2UgJ3JlZ2V4JzpcbiAgICAgICAgcmV0dXJuICdLZWluIGfDvGx0aWdlciByZWd1bMOkcmVyIEF1c2RydWNrICh6LiBCLiBcIigxLSk/XFxcXGR7M30tXFxcXGR7M30tXFxcXGR7NH1cIiknO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdNdXNzIGRpZXNlbSBGb3JtYXQgZW50c3ByZWNoZW46ICcgKyBlcnJvci5yZXF1aXJlZEZvcm1hdDtcbiAgICB9XG4gIH0sXG4gIG1pbmltdW06ICdNdXNzIG1pbmRlc3RlbnMge3ttaW5pbXVtVmFsdWV9fSBzZWluJyxcbiAgZXhjbHVzaXZlTWluaW11bTogJ011c3MgZ3LDtsOfZXIgYWxzIHt7ZXhjbHVzaXZlTWluaW11bVZhbHVlfX0gc2VpbicsXG4gIG1heGltdW06ICdEYXJmIG1heGltYWwge3ttYXhpbXVtVmFsdWV9fSBzZWluJyxcbiAgZXhjbHVzaXZlTWF4aW11bTogJ011c3Mga2xlaW5lciBhbHMge3tleGNsdXNpdmVNYXhpbXVtVmFsdWV9fSBzZWluJyxcbiAgbXVsdGlwbGVPZjogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgaWYgKCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKSAlIDEwID09PSAwKSB7XG4gICAgICBjb25zdCBkZWNpbWFscyA9IE1hdGgubG9nMTAoMSAvIGVycm9yLm11bHRpcGxlT2ZWYWx1ZSk7XG4gICAgICByZXR1cm4gYE1heGltYWwgJHtkZWNpbWFsc30gRGV6aW1hbHN0ZWxsZW4gZXJsYXVidGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgTXVzcyBlaW4gVmllbGZhY2hlcyB2b24gJHtlcnJvci5tdWx0aXBsZU9mVmFsdWV9IHNlaW5gO1xuICAgIH1cbiAgfSxcbiAgbWluUHJvcGVydGllczogJ01pbmRlc3RlbnMge3ttaW5pbXVtUHJvcGVydGllc319IEF0dHJpYnV0ZSBlcmZvcmRlcmxpY2ggKGFrdHVlbGw6IHt7Y3VycmVudFByb3BlcnRpZXN9fSknLFxuICBtYXhQcm9wZXJ0aWVzOiAnTWF4aW1hbCB7e21heGltdW1Qcm9wZXJ0aWVzfX0gQXR0cmlidXRlIGVybGF1YnQgKGFrdHVlbGw6IHt7Y3VycmVudFByb3BlcnRpZXN9fSknLFxuICBtaW5JdGVtczogJ01pbmRlc3RlbnMge3ttaW5pbXVtSXRlbXN9fSBXZXJ0ZSBlcmZvcmRlcmxpY2ggKGFrdHVlbGw6IHt7Y3VycmVudEl0ZW1zfX0pJyxcbiAgbWF4SXRlbXM6ICdNYXhpbWFsIHt7bWF4aW11bUl0ZW1zfX0gV2VydGUgZXJsYXVidCAoYWt0dWVsbDoge3tjdXJyZW50SXRlbXN9fSknLFxuICB1bmlxdWVJdGVtczogJ0FsbGUgV2VydGUgbcO8c3NlbiBlaW5kZXV0aWcgc2VpbicsXG4gIC8vIE5vdGU6IE5vIGRlZmF1bHQgZXJyb3IgbWVzc2FnZXMgZm9yICd0eXBlJywgJ2NvbnN0JywgJ2VudW0nLCBvciAnZGVwZW5kZW5jaWVzJ1xufTtcbiJdfQ==