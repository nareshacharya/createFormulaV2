/**
 * Error handling for DX API service
 * 
 * Defines custom error classes and error code constants
 * used throughout the DX API integration
 */

export class DxApiError extends Error {
    code: string;
    statusCode?: number;
    retryable: boolean;
    originalError?: unknown;
    timestamp: Date;

    constructor(
        code: string,
        message: string,
        originalError?: unknown,
        statusCode?: number,
        retryable: boolean = true
    ) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.originalError = originalError;
        this.timestamp = new Date();

        // Set prototype explicitly for instanceof to work with transpiled code
        Object.setPrototypeOf(this, DxApiError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            retryable: this.retryable,
            timestamp: this.timestamp.toISOString()
        };
    }
}

export class HttpError extends Error {
    statusCode: number;
    statusText: string;
    retryable: boolean;
    timestamp: Date;

    constructor(statusCode: number, statusText: string) {
        super(`HTTP ${statusCode}: ${statusText}`);
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.retryable = statusCode >= 500 || statusCode === 429 || statusCode === 408;
        this.timestamp = new Date();

        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

/**
 * Error codes used in DX API operations
 */
export const ErrorCodes = {
    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    CONNECTION_REFUSED: 'CONNECTION_REFUSED',

    // Authentication errors
    AUTH_FAILED: 'AUTH_FAILED',
    AUTH_EXPIRED: 'AUTH_EXPIRED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // API errors
    BAD_REQUEST: 'BAD_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
    RATE_LIMIT: 'RATE_LIMIT',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    SERVER_ERROR: 'SERVER_ERROR',

    // Data errors
    PARSE_ERROR: 'PARSE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_FIELD: 'MISSING_FIELD',

    // Cache errors
    CACHE_MISS: 'CACHE_MISS',

    // Request errors
    REQUEST_FAILED: 'REQUEST_FAILED',
    REQUEST_CANCELLED: 'REQUEST_CANCELLED',

    // Unknown errors
    UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Helper function to determine if error is retryable
 */
export function isRetryable(error: unknown): boolean {
    if (error instanceof DxApiError) {
        return error.retryable;
    }

    if (error instanceof HttpError) {
        return error.retryable;
    }

    if (error instanceof TypeError) {
        // Network errors are retryable
        return true;
    }

    return false;
}

/**
 * Helper function to get status code from any error
 */
export function getStatusCode(error: unknown): number | undefined {
    if (error instanceof DxApiError) {
        return error.statusCode;
    }

    if (error instanceof HttpError) {
        return error.statusCode;
    }

    return undefined;
}

/**
 * Helper function to map HTTP status codes to error codes
 */
export function httpStatusToErrorCode(statusCode: number): ErrorCode {
    switch (statusCode) {
        case 400:
            return ErrorCodes.BAD_REQUEST;
        case 401:
            return ErrorCodes.UNAUTHORIZED;
        case 403:
            return ErrorCodes.FORBIDDEN;
        case 404:
            return ErrorCodes.NOT_FOUND;
        case 408:
            return ErrorCodes.TIMEOUT;
        case 409:
            return ErrorCodes.CONFLICT;
        case 422:
            return ErrorCodes.UNPROCESSABLE_ENTITY;
        case 429:
            return ErrorCodes.RATE_LIMIT;
        case 503:
            return ErrorCodes.SERVICE_UNAVAILABLE;
        default:
            return statusCode >= 500 ? ErrorCodes.SERVER_ERROR : ErrorCodes.REQUEST_FAILED;
    }
}
