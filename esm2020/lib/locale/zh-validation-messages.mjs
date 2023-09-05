export const zhValidationMessages = {
    required: '必填字段.',
    minLength: '字符长度必须大于或者等于 {{minimumLength}} (当前长度: {{currentLength}})',
    maxLength: '字符长度必须小于或者等于 {{maximumLength}} (当前长度: {{currentLength}})',
    pattern: '必须匹配正则表达式: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return '必须为日期格式, 比如 "2000-12-31"';
            case 'time':
                return '必须为时间格式, 比如 "16:20" 或者 "03:14:15.9265"';
            case 'date-time':
                return '必须为日期时间格式, 比如 "2000-03-14T01:59" 或者 "2000-03-14T01:59:26.535Z"';
            case 'email':
                return '必须为邮箱地址, 比如 "name@example.com"';
            case 'hostname':
                return '必须为主机名, 比如 "example.com"';
            case 'ipv4':
                return '必须为 IPv4 地址, 比如 "127.0.0.1"';
            case 'ipv6':
                return '必须为 IPv6 地址, 比如 "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return '必须为 url, 比如 "http://www.example.com/page.html"';
            case 'uuid':
                return '必须为 uuid, 比如 "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return '必须为颜色值, 比如 "#FFFFFF" 或者 "rgb(255, 255, 255)"';
            case 'json-pointer':
                return '必须为 JSON Pointer, 比如 "/pointer/to/something"';
            case 'relative-json-pointer':
                return '必须为相对的 JSON Pointer, 比如 "2/pointer/to/something"';
            case 'regex':
                return '必须为正则表达式, 比如 "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return '必须为格式正确的 ' + error.requiredFormat;
        }
    },
    minimum: '必须大于或者等于最小值: {{minimumValue}}',
    exclusiveMinimum: '必须大于最小值: {{exclusiveMinimumValue}}',
    maximum: '必须小于或者等于最大值: {{maximumValue}}',
    exclusiveMaximum: '必须小于最大值: {{exclusiveMaximumValue}}',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `必须有 ${decimals} 位或更少的小数位`;
        }
        else {
            return `必须为 ${error.multipleOfValue} 的倍数`;
        }
    },
    minProperties: '项目数必须大于或者等于 {{minimumProperties}} (当前项目数: {{currentProperties}})',
    maxProperties: '项目数必须小于或者等于 {{maximumProperties}} (当前项目数: {{currentProperties}})',
    minItems: '项目数必须大于或者等于 {{minimumItems}} (当前项目数: {{currentItems}})',
    maxItems: '项目数必须小于或者等于 {{maximumItems}} (当前项目数: {{currentItems}})',
    uniqueItems: '所有项目必须是唯一的',
    // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemgtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3phanNmLWNvcmUvc3JjL2xpYi9sb2NhbGUvemgtdmFsaWRhdGlvbi1tZXNzYWdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBUTtJQUN2QyxRQUFRLEVBQUUsT0FBTztJQUNqQixTQUFTLEVBQUUsMERBQTBEO0lBQ3JFLFNBQVMsRUFBRSwwREFBMEQ7SUFDckUsT0FBTyxFQUFFLGdDQUFnQztJQUN6QyxNQUFNLEVBQUUsVUFBVSxLQUFLO1FBQ3JCLFFBQVEsS0FBSyxDQUFDLGNBQWMsRUFBRTtZQUM1QixLQUFLLE1BQU07Z0JBQ1QsT0FBTywwQkFBMEIsQ0FBQztZQUNwQyxLQUFLLE1BQU07Z0JBQ1QsT0FBTyx3Q0FBd0MsQ0FBQztZQUNsRCxLQUFLLFdBQVc7Z0JBQ2QsT0FBTyxnRUFBZ0UsQ0FBQztZQUMxRSxLQUFLLE9BQU87Z0JBQ1YsT0FBTyxnQ0FBZ0MsQ0FBQztZQUMxQyxLQUFLLFVBQVU7Z0JBQ2IsT0FBTywwQkFBMEIsQ0FBQztZQUNwQyxLQUFLLE1BQU07Z0JBQ1QsT0FBTyw2QkFBNkIsQ0FBQztZQUN2QyxLQUFLLE1BQU07Z0JBQ1QsT0FBTywyREFBMkQsQ0FBQztZQUNyRSxvRUFBb0U7WUFDcEUseURBQXlEO1lBQ3pELEtBQUssS0FBSztnQkFDUixPQUFPLGdEQUFnRCxDQUFDO1lBQzFELEtBQUssTUFBTTtnQkFDVCxPQUFPLHFEQUFxRCxDQUFDO1lBQy9ELEtBQUssT0FBTztnQkFDVixPQUFPLDhDQUE4QyxDQUFDO1lBQ3hELEtBQUssY0FBYztnQkFDakIsT0FBTyw4Q0FBOEMsQ0FBQztZQUN4RCxLQUFLLHVCQUF1QjtnQkFDMUIsT0FBTyxrREFBa0QsQ0FBQztZQUM1RCxLQUFLLE9BQU87Z0JBQ1YsT0FBTywwQ0FBMEMsQ0FBQztZQUNwRDtnQkFDRSxPQUFPLFdBQVcsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1NBQzdDO0lBQ0gsQ0FBQztJQUNELE9BQU8sRUFBRSwrQkFBK0I7SUFDeEMsZ0JBQWdCLEVBQUUsb0NBQW9DO0lBQ3RELE9BQU8sRUFBRSwrQkFBK0I7SUFDeEMsZ0JBQWdCLEVBQUUsb0NBQW9DO0lBQ3RELFVBQVUsRUFBRSxVQUFVLEtBQUs7UUFDekIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsT0FBTyxPQUFPLFFBQVEsV0FBVyxDQUFDO1NBQ25DO2FBQU07WUFDTCxPQUFPLE9BQU8sS0FBSyxDQUFDLGVBQWUsTUFBTSxDQUFDO1NBQzNDO0lBQ0gsQ0FBQztJQUNELGFBQWEsRUFBRSxrRUFBa0U7SUFDakYsYUFBYSxFQUFFLGtFQUFrRTtJQUNqRixRQUFRLEVBQUUsd0RBQXdEO0lBQ2xFLFFBQVEsRUFBRSx3REFBd0Q7SUFDbEUsV0FBVyxFQUFFLFlBQVk7SUFDekIsaUZBQWlGO0NBQ2xGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgemhWYWxpZGF0aW9uTWVzc2FnZXM6IGFueSA9IHsgLy8gQ2hpbmVzZSBlcnJvciBtZXNzYWdlc1xuICByZXF1aXJlZDogJ+W/heWhq+Wtl+autS4nLFxuICBtaW5MZW5ndGg6ICflrZfnrKbplb/luqblv4XpobvlpKfkuo7miJbogIXnrYnkuo4ge3ttaW5pbXVtTGVuZ3RofX0gKOW9k+WJjemVv+W6pjoge3tjdXJyZW50TGVuZ3RofX0pJyxcbiAgbWF4TGVuZ3RoOiAn5a2X56ym6ZW/5bqm5b+F6aG75bCP5LqO5oiW6ICF562J5LqOIHt7bWF4aW11bUxlbmd0aH19ICjlvZPliY3plb/luqY6IHt7Y3VycmVudExlbmd0aH19KScsXG4gIHBhdHRlcm46ICflv4XpobvljLnphY3mraPliJnooajovr7lvI86IHt7cmVxdWlyZWRQYXR0ZXJufX0nLFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHN3aXRjaCAoZXJyb3IucmVxdWlyZWRGb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuaXpeacn+agvOW8jywg5q+U5aaCIFwiMjAwMC0xMi0zMVwiJztcbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuaXtumXtOagvOW8jywg5q+U5aaCIFwiMTY6MjBcIiDmiJbogIUgXCIwMzoxNDoxNS45MjY1XCInO1xuICAgICAgY2FzZSAnZGF0ZS10aW1lJzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLrml6XmnJ/ml7bpl7TmoLzlvI8sIOavlOWmgiBcIjIwMDAtMDMtMTRUMDE6NTlcIiDmiJbogIUgXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVpcIic7XG4gICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgIHJldHVybiAn5b+F6aG75Li66YKu566x5Zyw5Z2ALCDmr5TlpoIgXCJuYW1lQGV4YW1wbGUuY29tXCInO1xuICAgICAgY2FzZSAnaG9zdG5hbWUnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuS4u+acuuWQjSwg5q+U5aaCIFwiZXhhbXBsZS5jb21cIic7XG4gICAgICBjYXNlICdpcHY0JzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLogSVB2NCDlnLDlnYAsIOavlOWmgiBcIjEyNy4wLjAuMVwiJztcbiAgICAgIGNhc2UgJ2lwdjYnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uiBJUHY2IOWcsOWdgCwg5q+U5aaCIFwiMTIzNDo1Njc4OjlBQkM6REVGMDoxMjM0OjU2Nzg6OUFCQzpERUYwXCInO1xuICAgICAgLy8gVE9ETzogYWRkIGV4YW1wbGVzIGZvciAndXJpJywgJ3VyaS1yZWZlcmVuY2UnLCBhbmQgJ3VyaS10ZW1wbGF0ZSdcbiAgICAgIC8vIGNhc2UgJ3VyaSc6IGNhc2UgJ3VyaS1yZWZlcmVuY2UnOiBjYXNlICd1cmktdGVtcGxhdGUnOlxuICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLogdXJsLCDmr5TlpoIgXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3BhZ2UuaHRtbFwiJztcbiAgICAgIGNhc2UgJ3V1aWQnOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uiB1dWlkLCDmr5TlpoIgXCIxMjM0NTY3OC05QUJDLURFRjAtMTIzNC01Njc4OUFCQ0RFRjBcIic7XG4gICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIHJldHVybiAn5b+F6aG75Li66aKc6Imy5YC8LCDmr5TlpoIgXCIjRkZGRkZGXCIg5oiW6ICFIFwicmdiKDI1NSwgMjU1LCAyNTUpXCInO1xuICAgICAgY2FzZSAnanNvbi1wb2ludGVyJzpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLogSlNPTiBQb2ludGVyLCDmr5TlpoIgXCIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWxhdGl2ZS1qc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ+W/hemhu+S4uuebuOWvueeahCBKU09OIFBvaW50ZXIsIOavlOWmgiBcIjIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWdleCc6XG4gICAgICAgIHJldHVybiAn5b+F6aG75Li65q2j5YiZ6KGo6L6+5byPLCDmr5TlpoIgXCIoMS0pP1xcXFxkezN9LVxcXFxkezN9LVxcXFxkezR9XCInO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICflv4XpobvkuLrmoLzlvI/mraPnoa7nmoQgJyArIGVycm9yLnJlcXVpcmVkRm9ybWF0O1xuICAgIH1cbiAgfSxcbiAgbWluaW11bTogJ+W/hemhu+Wkp+S6juaIluiAheetieS6juacgOWwj+WAvDoge3ttaW5pbXVtVmFsdWV9fScsXG4gIGV4Y2x1c2l2ZU1pbmltdW06ICflv4XpobvlpKfkuo7mnIDlsI/lgLw6IHt7ZXhjbHVzaXZlTWluaW11bVZhbHVlfX0nLFxuICBtYXhpbXVtOiAn5b+F6aG75bCP5LqO5oiW6ICF562J5LqO5pyA5aSn5YC8OiB7e21heGltdW1WYWx1ZX19JyxcbiAgZXhjbHVzaXZlTWF4aW11bTogJ+W/hemhu+Wwj+S6juacgOWkp+WAvDoge3tleGNsdXNpdmVNYXhpbXVtVmFsdWV9fScsXG4gIG11bHRpcGxlT2Y6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIGlmICgoMSAvIGVycm9yLm11bHRpcGxlT2ZWYWx1ZSkgJSAxMCA9PT0gMCkge1xuICAgICAgY29uc3QgZGVjaW1hbHMgPSBNYXRoLmxvZzEwKDEgLyBlcnJvci5tdWx0aXBsZU9mVmFsdWUpO1xuICAgICAgcmV0dXJuIGDlv4XpobvmnIkgJHtkZWNpbWFsc30g5L2N5oiW5pu05bCR55qE5bCP5pWw5L2NYDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGDlv4XpobvkuLogJHtlcnJvci5tdWx0aXBsZU9mVmFsdWV9IOeahOWAjeaVsGA7XG4gICAgfVxuICB9LFxuICBtaW5Qcm9wZXJ0aWVzOiAn6aG555uu5pWw5b+F6aG75aSn5LqO5oiW6ICF562J5LqOIHt7bWluaW11bVByb3BlcnRpZXN9fSAo5b2T5YmN6aG555uu5pWwOiB7e2N1cnJlbnRQcm9wZXJ0aWVzfX0pJyxcbiAgbWF4UHJvcGVydGllczogJ+mhueebruaVsOW/hemhu+Wwj+S6juaIluiAheetieS6jiB7e21heGltdW1Qcm9wZXJ0aWVzfX0gKOW9k+WJjemhueebruaVsDoge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1pbkl0ZW1zOiAn6aG555uu5pWw5b+F6aG75aSn5LqO5oiW6ICF562J5LqOIHt7bWluaW11bUl0ZW1zfX0gKOW9k+WJjemhueebruaVsDoge3tjdXJyZW50SXRlbXN9fSknLFxuICBtYXhJdGVtczogJ+mhueebruaVsOW/hemhu+Wwj+S6juaIluiAheetieS6jiB7e21heGltdW1JdGVtc319ICjlvZPliY3pobnnm67mlbA6IHt7Y3VycmVudEl0ZW1zfX0pJyxcbiAgdW5pcXVlSXRlbXM6ICfmiYDmnInpobnnm67lv4XpobvmmK/llK/kuIDnmoQnLFxuICAvLyBOb3RlOiBObyBkZWZhdWx0IGVycm9yIG1lc3NhZ2VzIGZvciAndHlwZScsICdjb25zdCcsICdlbnVtJywgb3IgJ2RlcGVuZGVuY2llcydcbn07XG4iXX0=