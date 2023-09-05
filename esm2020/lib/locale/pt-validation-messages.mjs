export const ptValidationMessages = {
    required: 'Este campo é obrigatório.',
    minLength: 'É preciso no mínimo {{minimumLength}} caracteres ou mais (tamanho atual: {{currentLength}})',
    maxLength: 'É preciso no máximo  {{maximumLength}} caracteres ou menos (tamanho atual: {{currentLength}})',
    pattern: 'Tem que ajustar ao formato: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Tem que ser uma data, por exemplo "2000-12-31"';
            case 'time':
                return 'Tem que ser horário, por exemplo "16:20" ou "03:14:15.9265"';
            case 'date-time':
                return 'Tem que ser data e hora, por exemplo "2000-03-14T01:59" ou "2000-03-14T01:59:26.535Z"';
            case 'email':
                return 'Tem que ser um email, por exemplo "fulano@exemplo.com.br"';
            case 'hostname':
                return 'Tem que ser uma nome de domínio, por exemplo "exemplo.com.br"';
            case 'ipv4':
                return 'Tem que ser um endereço IPv4, por exemplo "127.0.0.1"';
            case 'ipv6':
                return 'Tem que ser um endereço IPv6, por exemplo "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return 'Tem que ser uma URL, por exemplo "http://www.exemplo.com.br/pagina.html"';
            case 'uuid':
                return 'Tem que ser um uuid, por exemplo "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return 'Tem que ser uma cor, por exemplo "#FFFFFF" ou "rgb(255, 255, 255)"';
            case 'json-pointer':
                return 'Tem que ser um JSON Pointer, por exemplo "/referencia/para/algo"';
            case 'relative-json-pointer':
                return 'Tem que ser um JSON Pointer relativo, por exemplo "2/referencia/para/algo"';
            case 'regex':
                return 'Tem que ser uma expressão regular, por exemplo "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return 'Tem que ser no formato: ' + error.requiredFormat;
        }
    },
    minimum: 'Tem que ser {{minimumValue}} ou mais',
    exclusiveMinimum: 'Tem que ser mais que {{exclusiveMinimumValue}}',
    maximum: 'Tem que ser {{maximumValue}} ou menos',
    exclusiveMaximum: 'Tem que ser menor que {{exclusiveMaximumValue}}',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Tem que ter ${decimals} ou menos casas decimais.`;
        }
        else {
            return `Tem que ser um múltiplo de ${error.multipleOfValue}.`;
        }
    },
    minProperties: 'Deve ter {{minimumProperties}} ou mais itens (itens até o momento: {{currentProperties}})',
    maxProperties: 'Deve ter {{maximumProperties}} ou menos intens (itens até o momento: {{currentProperties}})',
    minItems: 'Deve ter {{minimumItems}} ou mais itens (itens até o momento: {{currentItems}})',
    maxItems: 'Deve ter {{maximumItems}} ou menos itens (itens até o momento: {{currentItems}})',
    uniqueItems: 'Todos os itens devem ser únicos',
    // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHQtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9sb2NhbGUvcHQtdmFsaWRhdGlvbi1tZXNzYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBUTtJQUN2QyxRQUFRLEVBQUUsMkJBQTJCO0lBQ3JDLFNBQVMsRUFBRSw2RkFBNkY7SUFDeEcsU0FBUyxFQUFFLCtGQUErRjtJQUMxRyxPQUFPLEVBQUUsaURBQWlEO0lBQzFELE1BQU0sRUFBRSxVQUFVLEtBQUs7UUFDckIsUUFBUSxLQUFLLENBQUMsY0FBYyxFQUFFO1lBQzVCLEtBQUssTUFBTTtnQkFDVCxPQUFPLGdEQUFnRCxDQUFDO1lBQzFELEtBQUssTUFBTTtnQkFDVCxPQUFPLDZEQUE2RCxDQUFDO1lBQ3ZFLEtBQUssV0FBVztnQkFDZCxPQUFPLHVGQUF1RixDQUFDO1lBQ2pHLEtBQUssT0FBTztnQkFDVixPQUFPLDJEQUEyRCxDQUFDO1lBQ3JFLEtBQUssVUFBVTtnQkFDYixPQUFPLCtEQUErRCxDQUFDO1lBQ3pFLEtBQUssTUFBTTtnQkFDVCxPQUFPLHVEQUF1RCxDQUFDO1lBQ2pFLEtBQUssTUFBTTtnQkFDVCxPQUFPLHFGQUFxRixDQUFDO1lBQy9GLG9FQUFvRTtZQUNwRSx5REFBeUQ7WUFDekQsS0FBSyxLQUFLO2dCQUNSLE9BQU8sMEVBQTBFLENBQUM7WUFDcEYsS0FBSyxNQUFNO2dCQUNULE9BQU8seUVBQXlFLENBQUM7WUFDbkYsS0FBSyxPQUFPO2dCQUNWLE9BQU8sb0VBQW9FLENBQUM7WUFDOUUsS0FBSyxjQUFjO2dCQUNqQixPQUFPLGtFQUFrRSxDQUFDO1lBQzVFLEtBQUssdUJBQXVCO2dCQUMxQixPQUFPLDRFQUE0RSxDQUFDO1lBQ3RGLEtBQUssT0FBTztnQkFDVixPQUFPLDRFQUE0RSxDQUFDO1lBQ3RGO2dCQUNFLE9BQU8sMEJBQTBCLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztTQUM1RDtJQUNILENBQUM7SUFDRCxPQUFPLEVBQUUsc0NBQXNDO0lBQy9DLGdCQUFnQixFQUFFLGdEQUFnRDtJQUNsRSxPQUFPLEVBQUUsdUNBQXVDO0lBQ2hELGdCQUFnQixFQUFFLGlEQUFpRDtJQUNuRSxVQUFVLEVBQUUsVUFBVSxLQUFLO1FBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sZUFBZSxRQUFRLDJCQUEyQixDQUFDO1NBQzNEO2FBQU07WUFDTCxPQUFPLDhCQUE4QixLQUFLLENBQUMsZUFBZSxHQUFHLENBQUM7U0FDL0Q7SUFDSCxDQUFDO0lBQ0QsYUFBYSxFQUFFLDJGQUEyRjtJQUMxRyxhQUFhLEVBQUUsNkZBQTZGO0lBQzVHLFFBQVEsRUFBRSxpRkFBaUY7SUFDM0YsUUFBUSxFQUFFLGtGQUFrRjtJQUM1RixXQUFXLEVBQUUsaUNBQWlDO0lBQzlDLGlGQUFpRjtDQUNsRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHB0VmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnkgPSB7IC8vIEJyYXppbGlhbiBQb3J0dWd1ZXNlIGVycm9yIG1lc3NhZ2VzXG4gIHJlcXVpcmVkOiAnRXN0ZSBjYW1wbyDDqSBvYnJpZ2F0w7NyaW8uJyxcbiAgbWluTGVuZ3RoOiAnw4kgcHJlY2lzbyBubyBtw61uaW1vIHt7bWluaW11bUxlbmd0aH19IGNhcmFjdGVyZXMgb3UgbWFpcyAodGFtYW5obyBhdHVhbDoge3tjdXJyZW50TGVuZ3RofX0pJyxcbiAgbWF4TGVuZ3RoOiAnw4kgcHJlY2lzbyBubyBtw6F4aW1vICB7e21heGltdW1MZW5ndGh9fSBjYXJhY3RlcmVzIG91IG1lbm9zICh0YW1hbmhvIGF0dWFsOiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBwYXR0ZXJuOiAnVGVtIHF1ZSBhanVzdGFyIGFvIGZvcm1hdG86IHt7cmVxdWlyZWRQYXR0ZXJufX0nLFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHN3aXRjaCAoZXJyb3IucmVxdWlyZWRGb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICByZXR1cm4gJ1RlbSBxdWUgc2VyIHVtYSBkYXRhLCBwb3IgZXhlbXBsbyBcIjIwMDAtMTItMzFcIic7XG4gICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgcmV0dXJuICdUZW0gcXVlIHNlciBob3LDoXJpbywgcG9yIGV4ZW1wbG8gXCIxNjoyMFwiIG91IFwiMDM6MTQ6MTUuOTI2NVwiJztcbiAgICAgIGNhc2UgJ2RhdGUtdGltZSc6XG4gICAgICAgIHJldHVybiAnVGVtIHF1ZSBzZXIgZGF0YSBlIGhvcmEsIHBvciBleGVtcGxvIFwiMjAwMC0wMy0xNFQwMTo1OVwiIG91IFwiMjAwMC0wMy0xNFQwMTo1OToyNi41MzVaXCInO1xuICAgICAgY2FzZSAnZW1haWwnOlxuICAgICAgICByZXR1cm4gJ1RlbSBxdWUgc2VyIHVtIGVtYWlsLCBwb3IgZXhlbXBsbyBcImZ1bGFub0BleGVtcGxvLmNvbS5iclwiJztcbiAgICAgIGNhc2UgJ2hvc3RuYW1lJzpcbiAgICAgICAgcmV0dXJuICdUZW0gcXVlIHNlciB1bWEgbm9tZSBkZSBkb23DrW5pbywgcG9yIGV4ZW1wbG8gXCJleGVtcGxvLmNvbS5iclwiJztcbiAgICAgIGNhc2UgJ2lwdjQnOlxuICAgICAgICByZXR1cm4gJ1RlbSBxdWUgc2VyIHVtIGVuZGVyZcOnbyBJUHY0LCBwb3IgZXhlbXBsbyBcIjEyNy4wLjAuMVwiJztcbiAgICAgIGNhc2UgJ2lwdjYnOlxuICAgICAgICByZXR1cm4gJ1RlbSBxdWUgc2VyIHVtIGVuZGVyZcOnbyBJUHY2LCBwb3IgZXhlbXBsbyBcIjEyMzQ6NTY3ODo5QUJDOkRFRjA6MTIzNDo1Njc4OjlBQkM6REVGMFwiJztcbiAgICAgIC8vIFRPRE86IGFkZCBleGFtcGxlcyBmb3IgJ3VyaScsICd1cmktcmVmZXJlbmNlJywgYW5kICd1cmktdGVtcGxhdGUnXG4gICAgICAvLyBjYXNlICd1cmknOiBjYXNlICd1cmktcmVmZXJlbmNlJzogY2FzZSAndXJpLXRlbXBsYXRlJzpcbiAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgIHJldHVybiAnVGVtIHF1ZSBzZXIgdW1hIFVSTCwgcG9yIGV4ZW1wbG8gXCJodHRwOi8vd3d3LmV4ZW1wbG8uY29tLmJyL3BhZ2luYS5odG1sXCInO1xuICAgICAgY2FzZSAndXVpZCc6XG4gICAgICAgIHJldHVybiAnVGVtIHF1ZSBzZXIgdW0gdXVpZCwgcG9yIGV4ZW1wbG8gXCIxMjM0NTY3OC05QUJDLURFRjAtMTIzNC01Njc4OUFCQ0RFRjBcIic7XG4gICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIHJldHVybiAnVGVtIHF1ZSBzZXIgdW1hIGNvciwgcG9yIGV4ZW1wbG8gXCIjRkZGRkZGXCIgb3UgXCJyZ2IoMjU1LCAyNTUsIDI1NSlcIic7XG4gICAgICBjYXNlICdqc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ1RlbSBxdWUgc2VyIHVtIEpTT04gUG9pbnRlciwgcG9yIGV4ZW1wbG8gXCIvcmVmZXJlbmNpYS9wYXJhL2FsZ29cIic7XG4gICAgICBjYXNlICdyZWxhdGl2ZS1qc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ1RlbSBxdWUgc2VyIHVtIEpTT04gUG9pbnRlciByZWxhdGl2bywgcG9yIGV4ZW1wbG8gXCIyL3JlZmVyZW5jaWEvcGFyYS9hbGdvXCInO1xuICAgICAgY2FzZSAncmVnZXgnOlxuICAgICAgICByZXR1cm4gJ1RlbSBxdWUgc2VyIHVtYSBleHByZXNzw6NvIHJlZ3VsYXIsIHBvciBleGVtcGxvIFwiKDEtKT9cXFxcZHszfS1cXFxcZHszfS1cXFxcZHs0fVwiJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnVGVtIHF1ZSBzZXIgbm8gZm9ybWF0bzogJyArIGVycm9yLnJlcXVpcmVkRm9ybWF0O1xuICAgIH1cbiAgfSxcbiAgbWluaW11bTogJ1RlbSBxdWUgc2VyIHt7bWluaW11bVZhbHVlfX0gb3UgbWFpcycsXG4gIGV4Y2x1c2l2ZU1pbmltdW06ICdUZW0gcXVlIHNlciBtYWlzIHF1ZSB7e2V4Y2x1c2l2ZU1pbmltdW1WYWx1ZX19JyxcbiAgbWF4aW11bTogJ1RlbSBxdWUgc2VyIHt7bWF4aW11bVZhbHVlfX0gb3UgbWVub3MnLFxuICBleGNsdXNpdmVNYXhpbXVtOiAnVGVtIHF1ZSBzZXIgbWVub3IgcXVlIHt7ZXhjbHVzaXZlTWF4aW11bVZhbHVlfX0nLFxuICBtdWx0aXBsZU9mOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBpZiAoKDEgLyBlcnJvci5tdWx0aXBsZU9mVmFsdWUpICUgMTAgPT09IDApIHtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gTWF0aC5sb2cxMCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKTtcbiAgICAgIHJldHVybiBgVGVtIHF1ZSB0ZXIgJHtkZWNpbWFsc30gb3UgbWVub3MgY2FzYXMgZGVjaW1haXMuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBUZW0gcXVlIHNlciB1bSBtw7psdGlwbG8gZGUgJHtlcnJvci5tdWx0aXBsZU9mVmFsdWV9LmA7XG4gICAgfVxuICB9LFxuICBtaW5Qcm9wZXJ0aWVzOiAnRGV2ZSB0ZXIge3ttaW5pbXVtUHJvcGVydGllc319IG91IG1haXMgaXRlbnMgKGl0ZW5zIGF0w6kgbyBtb21lbnRvOiB7e2N1cnJlbnRQcm9wZXJ0aWVzfX0pJyxcbiAgbWF4UHJvcGVydGllczogJ0RldmUgdGVyIHt7bWF4aW11bVByb3BlcnRpZXN9fSBvdSBtZW5vcyBpbnRlbnMgKGl0ZW5zIGF0w6kgbyBtb21lbnRvOiB7e2N1cnJlbnRQcm9wZXJ0aWVzfX0pJyxcbiAgbWluSXRlbXM6ICdEZXZlIHRlciB7e21pbmltdW1JdGVtc319IG91IG1haXMgaXRlbnMgKGl0ZW5zIGF0w6kgbyBtb21lbnRvOiB7e2N1cnJlbnRJdGVtc319KScsXG4gIG1heEl0ZW1zOiAnRGV2ZSB0ZXIge3ttYXhpbXVtSXRlbXN9fSBvdSBtZW5vcyBpdGVucyAoaXRlbnMgYXTDqSBvIG1vbWVudG86IHt7Y3VycmVudEl0ZW1zfX0pJyxcbiAgdW5pcXVlSXRlbXM6ICdUb2RvcyBvcyBpdGVucyBkZXZlbSBzZXIgw7puaWNvcycsXG4gIC8vIE5vdGU6IE5vIGRlZmF1bHQgZXJyb3IgbWVzc2FnZXMgZm9yICd0eXBlJywgJ2NvbnN0JywgJ2VudW0nLCBvciAnZGVwZW5kZW5jaWVzJ1xufTtcbiJdfQ==