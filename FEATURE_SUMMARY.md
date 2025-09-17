# Header Management Feature Implementation

## Overview
This PR adds comprehensive header management functionality to the Laravel Orion TypeScript SDK, allowing developers to set custom headers on HTTP requests similar to the existing token management.

## New Methods Added

### `Orion.setHeader(name: string, value: string): Orion`
Sets a single custom header that will be included in all HTTP requests.

```typescript
Orion.setHeader('x-custom-header', 'header value');
```

### `Orion.setHeaders(headers: Record<string, string>): Orion`
Sets multiple custom headers at once. Merges with existing headers, overwriting any with the same name.

```typescript
Orion.setHeaders({
    'x-custom-header': 'header value',
    'x-custom-header2': 'header value2',
});
```

### `Orion.getHeaders(): Record<string, string>`
Returns a copy of all currently set custom headers.

```typescript
const headers = Orion.getHeaders();
```

### `Orion.removeHeader(name: string): Orion`
Removes a specific custom header.

```typescript
Orion.removeHeader('x-custom-header');
```

### `Orion.clearHeaders(): Orion`
Clears all custom headers.

```typescript
Orion.clearHeaders();
```

## Key Features

1. **Method Chaining**: All methods return the Orion class for fluent API usage
2. **Auth Token Priority**: Authentication tokens take precedence over custom Authorization headers
3. **Automatic Integration**: Custom headers are automatically included in all HTTP requests
4. **Immutable Getters**: `getHeaders()` returns a copy to prevent external modification
5. **Config Rebuilding**: HTTP client configuration is automatically rebuilt when headers change

## Implementation Details

- Added `customHeaders` static property to store headers
- Modified `buildHttpClientConfig()` to merge custom headers with auth headers
- All header methods trigger config rebuilding for immediate effect
- Headers are stored as `Record<string, string>` for type safety

## Testing

Comprehensive unit tests added covering:
- Setting single and multiple headers
- Header merging and overwriting behavior
- Integration with auth tokens
- Method chaining functionality
- Config rebuilding verification
- Immutable getter behavior
- Header removal and clearing

All existing tests continue to pass, ensuring backward compatibility.

## Usage Examples

```typescript
// Initialize Orion
Orion.init('https://api.example.com', 'api', AuthDriver.Default, 'auth-token');

// Set individual headers
Orion.setHeader('x-api-version', '1.0')
      .setHeader('x-client-id', 'my-app');

// Set multiple headers at once
Orion.setHeaders({
    'x-custom-header': 'value1',
    'x-another-header': 'value2'
});

// Use with models (headers automatically included)
const users = await User.all();

// Manage headers
const currentHeaders = Orion.getHeaders();
Orion.removeHeader('x-api-version');
Orion.clearHeaders();
```

## Files Modified

- `src/orion.ts`: Added header management methods and storage
- `tests/unit/orion.test.ts`: Added comprehensive test suite for header functionality

## Backward Compatibility

This feature is fully backward compatible. No existing functionality is changed or removed.