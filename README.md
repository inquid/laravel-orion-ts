<p align="center">
    <img src="https://res.cloudinary.com/dudxt4lp6/image/upload/v1572976051/Laravel%20Orion/logo_with_text_t5jjyc.png" width="400">
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@tailflow/laravel-orion"><img src="https://img.shields.io/npm/v/@tailflow/laravel-orion" alt="Latest Version on NPM"></a>
<a href="https://github.com/tailflow/laravel-orion-ts/actions"><img src="https://img.shields.io/github/actions/workflow/status/tailflow/laravel-orion-ts/default.yml?branch=main" alt="Build Status"></a>
</p>

## Introduction

Laravel Orion TypeScript SDK allows you to build expressive frontend applications powered by REST API.

## Official Documentation

Documentation for Laravel Orion and its TypeScript SDK can be found on the [website](https://tailflow.github.io/laravel-orion-docs/).

## Custom Headers

Laravel Orion TypeScript SDK now supports adding custom headers to all requests. This is useful when you need to include additional headers like API keys, request IDs, or other custom headers required by your application.

### Setting a Single Header

```typescript
import { Orion } from '@tailflow/laravel-orion';

// Set a single custom header
Orion.setHeader('X-Custom-Header', 'header-value');
```

### Setting Multiple Headers

```typescript
// Set multiple headers at once
Orion.setHeaders({
    'X-Custom-Header': 'header-value',
    'X-Another-Header': 'another-value',
    'X-Request-ID': 'unique-request-id'
});
```

### Method Chaining

All header methods support chaining for a fluent interface:

```typescript
Orion
    .setHeader('X-First', 'first-value')
    .setHeaders({
        'X-Second': 'second-value',
        'X-Third': 'third-value'
    })
    .setToken('auth-token');
```

### Clearing Headers

```typescript
// Remove all custom headers
Orion.clearHeaders();

// Get current headers
const headers = Orion.getHeaders();
```

### Usage with Authentication

Custom headers work seamlessly with existing authentication methods:

```typescript
Orion.setToken('your-auth-token');
Orion.setHeader('X-Custom-Header', 'custom-value');

// Both Authorization and X-Custom-Header will be included in requests
```
