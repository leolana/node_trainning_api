module.exports = di => {
    di.provide('$validator', () => {
        let _checks = {
            string: (options, value) => {
                if (!value)
                    return !options.required;

                if (typeof(value) !== 'string')
                    return false;

                if (!value.trim())
                    return !options.required;

                if (options.min && value.length < options.min)
                    return false;

                if (options.max && value.length > options.max)
                    return false;

                return true;
            },
            decimal: (options, value) => {
                if (typeof(value) === 'undefined' || value == null)
                    return !options.required;

                if (typeof(value) !== 'number')
                    return false;

                if (options.min && value < options.min)
                    return false;

                if (options.max && value > options.max)
                    return false;

                return true;
            },
            integer: (options, value) => {
                if (typeof(value) === 'undefined' || value == null)
                    return !options.required;

                if (typeof(value) !== 'number')
                    return false;

                if (!Number.isInteger(value))
                    return false;

                if (options.min && value < options.min)
                    return false;

                if (options.max && value > options.max)
                    return false;

                if (options.enum && options.enum.indexOf(value) < 0)
                    return false;

                return true;
            },
            boolean: (options, value) => {
                if (typeof(value) === 'undefined' || value == null)
                    return !options.required;

                if (typeof(value) !== 'boolean')
                    return false;

                return true;
            },
            json: (options, value, strict) => {
                if (typeof(value) === 'undefined' || value == null)
                    return !options.required;

                if (options.attributes) {
                    let checkNested = _check(options.attributes, value, strict);

                    if (!checkNested)
                        return false;
                }

                return true;
            },
            array: (options, value, strict) => {
                if (typeof(value) === 'undefined' || value == null)
                    return !options.required;

                if (options.min && value.length < options.min)
                    return false;

                if (options.max && value.length > options.max)
                    return false;

                for (let i of value) {
                    let isItemValid = false;

                    if (options.of == 'json' && options.attributes)
                        isItemValid = _check(options.attributes, i, strict);
                    else if (typeof options.of == 'string')
                        isItemValid = _check({ value: { type: options.of } }, { value: i }, strict);
                    else
                        isItemValid = _check({ value: options.of }, { value: i }, strict);

                    if (!isItemValid) return false;
                }

                return true;
            }
        };

        let _check = (schema, obj, strict = true) => {
            if (strict) {
                for (let p in obj)
                    if (!schema[p])
                        return false;
            }

            for (let attr in schema) {
                let settings = schema[attr];

                for (let s in settings) {
                    if (typeof(settings[s]) === 'function')
                        settings[s] = settings[s](obj[attr], obj);
                }

                if (typeof(settings.default) !== 'undefined' && settings.default != null
                    && settings.required && !obj[attr])
                    obj[attr] = settings.default;

                let isValid = _checks[settings.type](settings, obj[attr], strict);

                if (!isValid) return false;
            }

            return true;
        }

        return Promise.resolve({ check: _check });
    });
};
