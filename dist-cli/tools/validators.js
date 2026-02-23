/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Input/Output Validation Schemas
 *
 * Provides validation schemas and utilities for tool inputs and outputs.
 */
/**
 * Built-in validation formats
 */
export const VALIDATION_FORMATS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    uri: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    date: /^\d{4}-\d{2}-\d{2}$/,
    dateTime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
    json: /^[\s\S]*$/, // Basic check - actual JSON parsing is done separately
    integer: /^-?\d+$/,
    float: /^-?\d*\.\d+$/,
};
/**
 * Error messages for validation failures
 */
export const VALIDATION_MESSAGES = {
    required: (field) => `Required field '${field}' is missing`,
    type: (field, expected, actual) => `Field '${field}' expected ${expected}, got ${actual}`,
    enum: (field, validValues) => `Field '${field}' must be one of: ${validValues.join(', ')}`,
    range: (field, min, max) => `Field '${field}' must be between ${min} and ${max}`,
    length: (field, min, max) => `Field '${field}' must be between ${min} and ${max} characters`,
    pattern: (field, pattern) => `Field '${field}' does not match pattern: ${pattern}`,
    format: (field, format) => `Field '${field}' is not a valid ${format}`,
    minItems: (field, min) => `Field '${field}' must have at least ${min} items`,
    maxItems: (field, max) => `Field '${field}' must have at most ${max} items`,
    additionalProperties: (field) => `Additional properties not allowed: '${field}'`,
};
/**
 * Validate a value against a schema property
 */
export function validateProperty(value, property, fieldName, errors, warnings) {
    // Check type
    if (property.type) {
        const actualType = getType(value);
        if (!typeMatches(property.type, actualType)) {
            errors.push(VALIDATION_MESSAGES.type(fieldName, property.type, actualType));
            return; // Skip further validation if type is wrong
        }
    }
    // Check enum values
    if (property.enum && Array.isArray(property.enum)) {
        if (!property.enum.includes(value)) {
            errors.push(VALIDATION_MESSAGES.enum(fieldName, property.enum));
        }
    }
    // Check string-specific constraints
    if (property.type === 'string' && typeof value === 'string') {
        // Length constraints
        if (property.minLength !== undefined && value.length < property.minLength) {
            errors.push(VALIDATION_MESSAGES.length(fieldName, property.minLength, property.maxLength ?? Infinity));
        }
        if (property.maxLength !== undefined && value.length > property.maxLength) {
            errors.push(VALIDATION_MESSAGES.length(fieldName, property.minLength ?? 0, property.maxLength));
        }
        // Pattern matching
        if (property.pattern) {
            const regex = new RegExp(property.pattern);
            if (!regex.test(value)) {
                errors.push(VALIDATION_MESSAGES.pattern(fieldName, property.pattern));
            }
        }
        // Format validation
        if (property.format && VALIDATION_FORMATS[property.format]) {
            const regex = VALIDATION_FORMATS[property.format];
            if (!regex.test(value)) {
                errors.push(VALIDATION_MESSAGES.format(fieldName, property.format));
            }
        }
    }
    // Check number constraints
    if (typeof value === 'number') {
        if (property.minimum !== undefined && value < property.minimum) {
            errors.push(VALIDATION_MESSAGES.range(fieldName, property.minimum, property.maximum ?? Infinity));
        }
        if (property.maximum !== undefined && value > property.maximum) {
            errors.push(VALIDATION_MESSAGES.range(fieldName, property.minimum ?? -Infinity, property.maximum));
        }
    }
    // Check array constraints
    if (Array.isArray(value) && property.type === 'array') {
        if (property.minItems !== undefined && value.length < property.minItems) {
            errors.push(VALIDATION_MESSAGES.minItems(fieldName, property.minItems));
        }
        if (property.maxItems !== undefined && value.length > property.maxItems) {
            errors.push(VALIDATION_MESSAGES.maxItems(fieldName, property.maxItems));
        }
        // Validate items if schema provided
        if (property.items) {
            const itemSchemas = Array.isArray(property.items) ? property.items : [property.items];
            value.forEach((item, index) => {
                const itemSchema = property.items;
                const itemErrors = [];
                validateProperty(item, itemSchema, `${fieldName}[${index}]`, itemErrors);
                errors.push(...itemErrors);
            });
        }
    }
    // Check object constraints
    if (value && typeof value === 'object' && property.type === 'object') {
        const obj = value;
        if (!property.additionalProperties && property.additionalProperties !== undefined) {
            const allowedKeys = Object.keys(property.properties || {});
            const extraKeys = Object.keys(obj).filter(k => !allowedKeys.includes(k));
            if (extraKeys.length > 0) {
                errors.push(VALIDATION_MESSAGES.additionalProperties(extraKeys.join(', ')));
            }
        }
    }
}
/**
 * Validate tool input against schema
 */
export function validateInput(input, schema, options) {
    const errors = [];
    const warnings = [];
    let sanitizedData = input;
    if (schema.type !== 'object') {
        return {
            valid: false,
            errors: ['Schema must be of type object'],
        };
    }
    const properties = schema.properties || {};
    const required = schema.required || [];
    const allowUnknown = options?.allowUnknownFields ?? !schema.additionalProperties;
    // Check required fields
    for (const requiredField of required) {
        if (!(requiredField in input)) {
            errors.push(VALIDATION_MESSAGES.required(requiredField));
        }
    }
    // Validate each provided field
    for (const [key, value] of Object.entries(input)) {
        if (key in properties) {
            validateProperty(value, properties[key], key, errors, warnings);
        }
        else if (!allowUnknown) {
            errors.push(VALIDATION_MESSAGES.additionalProperties(key));
        }
    }
    // Return sanitized data if requested and validation passed
    if (options?.sanitize && errors.length === 0) {
        sanitizedData = input;
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        sanitizedData,
    };
}
/**
 * Validate tool output structure
 */
export function validateOutput(output) {
    const errors = [];
    const warnings = [];
    // Check required fields
    if (typeof output.success !== 'boolean') {
        errors.push('ToolOutput must have a boolean "success" field');
    }
    // Validate metadata if present
    if (output.metadata) {
        const { metadata } = output;
        if (metadata.executionTime !== undefined && typeof metadata.executionTime !== 'number') {
            warnings.push('metadata.executionTime should be a number (milliseconds)');
        }
        if (metadata.tokensUsed !== undefined && typeof metadata.tokensUsed !== 'number') {
            warnings.push('metadata.tokensUsed should be a number');
        }
        if (metadata.cost !== undefined && typeof metadata.cost !== 'number') {
            warnings.push('metadata.cost should be a number');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        sanitizedData: output,
    };
}
/**
 * Generate a JSON schema from TypeScript type inference
 * This is a helper for creating schemas programmatically
 */
export function inferSchema(example) {
    return {
        type: 'object',
        properties: inferProperties(example),
    };
}
/**
 * Infer property schemas recursively
 */
function inferProperties(obj) {
    if (obj === null || typeof obj !== 'object') {
        return {};
    }
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = inferProperty(value);
    }
    return result;
}
/**
 * Infer schema for a single property
 */
function inferProperty(value) {
    if (value === null) {
        return { type: 'null' };
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return { type: 'array' };
        }
        const itemSchemas = value.map(item => inferProperty(item));
        // Simplification: use first item's schema for array items
        return { type: 'array', items: itemSchemas[0] };
    }
    if (typeof value === 'object') {
        return {
            type: 'object',
            properties: inferProperties(value),
        };
    }
    const typeMap = {
        string: 'string',
        number: Number.isInteger(value) ? 'integer' : 'number',
        boolean: 'boolean',
        undefined: 'null',
    };
    return { type: typeMap[typeof value] || 'string' };
}
/**
 * Get the JavaScript type of a value
 */
function getType(value) {
    if (value === null)
        return 'null';
    if (Array.isArray(value))
        return 'array';
    return typeof value;
}
/**
 * Check if actual type matches expected type
 */
function typeMatches(expected, actual) {
    const typeMap = {
        string: ['string'],
        number: ['number'],
        integer: ['number'],
        boolean: ['boolean'],
        array: ['array'],
        object: ['object'],
        null: ['null'],
    };
    const allowedTypes = typeMap[expected] || [];
    return allowedTypes.includes(actual);
}
/**
 * Sanitize tool output to prevent data leakage
 */
export function sanitizeOutput(output, maxSize) {
    const MAX_SIZE = maxSize ?? 1024 * 1024; // Default 1MB
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // Truncate long strings
            if (value.length > MAX_SIZE) {
                return value.substring(0, MAX_SIZE) + '...[truncated]';
            }
            return value;
        }
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                return value.map(item => sanitizeValue(item));
            }
            const result = {};
            for (const [key, val] of Object.entries(value)) {
                result[key] = sanitizeValue(val);
            }
            return result;
        }
        return value;
    };
    if (output.data !== undefined) {
        const sanitizedData = sanitizeValue(output.data);
        const outputSize = JSON.stringify(sanitizedData).length;
        if (outputSize > MAX_SIZE) {
            return {
                success: output.success,
                error: `Output exceeds maximum size of ${MAX_SIZE} bytes`,
                metadata: {
                    ...output.metadata,
                    originalSize: outputSize,
                },
            };
        }
        return {
            ...output,
            data: sanitizedData,
        };
    }
    return output;
}
/**
 * Create a reusable validation function for a schema
 */
export function createValidator(schema) {
    return (input, options) => validateInput(input, schema, options);
}
/**
 * Validation utilities
 */
export const ValidationUtils = {
    validateInput,
    validateOutput,
    validateProperty,
    inferSchema,
    sanitizeOutput,
    createValidator,
    VALIDATION_FORMATS,
    VALIDATION_MESSAGES,
};
