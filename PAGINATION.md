# Pagination Methods

This document explains how to use the new pagination methods in the Laravel Orion QueryBuilder.

## Overview

The pagination methods provide a clean way to retrieve paginated data with structured metadata, eliminating the need to manually extract pagination information from response objects.

## Available Methods

### 1. `paginate(limit, page)`

Retrieves paginated data using the standard GET endpoint.

```typescript
const result = await User.$query().paginate(10, 1);
```

### 2. `searchPaginate(limit, page)`

Retrieves paginated search results using the search endpoint with filters, scopes, and search terms.

```typescript
const result = await User.$query()
  .lookFor('john')
  .filter('age', '>', 18)
  .searchPaginate(5, 2);
```

### 3. `Model.$paginate(limit, page)` (Static Method)

Convenient static method for basic pagination.

```typescript
const result = await User.$paginate(10, 1);
```

## Response Structure

All pagination methods return a `PaginationResponse<T>` object with the following structure:

```typescript
interface PaginationResponse<T> {
  meta: {
    total: number;           // Total number of items
    per_page: number;        // Number of items per page
    current_page: number;    // Current page number
    prev_page_url: string | null;  // URL for previous page
    next_page_url: string | null;  // URL for next page
  };
  items: T[];               // Array of model instances
}
```

## Usage Examples

### Basic Pagination

```typescript
import { Model } from './src/model';

class User extends Model {
  public $resource(): string {
    return 'users';
  }
}

// Get first page with 10 items per page
const users = await User.$query().paginate(10, 1);

console.log(`Page ${users.meta.current_page} of ${Math.ceil(users.meta.total / users.meta.per_page)}`);
console.log(`Total users: ${users.meta.total}`);
console.log(`Users on this page: ${users.items.length}`);

// Access individual users
users.items.forEach(user => {
  console.log(`User: ${user.$attributes.name} (ID: ${user.$getKey()})`);
});
```

### Advanced Search with Pagination

```typescript
// Search for users with specific criteria
const searchResults = await User.$query()
  .lookFor('john')                    // Search term
  .filter('age', '>', 18)            // Age filter
  .filter('status', '=', 'active')   // Status filter
  .scope('verified')                 // Apply scope
  .with(['profile', 'posts'])        // Include relations
  .sortBy('created_at', 'desc')      // Sort by creation date
  .searchPaginate(15, 2);            // 15 items per page, page 2

console.log('Search Results:');
console.log(`Found ${searchResults.meta.total} users matching criteria`);
console.log(`Showing page ${searchResults.meta.current_page}`);

searchResults.items.forEach(user => {
  console.log(`${user.$attributes.name} - ${user.$attributes.email}`);
});
```

### Using Static Method

```typescript
// Simple pagination using static method
const users = await User.$paginate(20, 1);

// This is equivalent to:
// const users = await User.$query().paginate(20, 1);
```

### Working with Pagination Metadata

```typescript
const result = await User.$query().paginate(10, 3);

// Check if there are more pages
if (result.meta.next_page_url) {
  console.log('There are more pages available');
}

// Check if there are previous pages
if (result.meta.prev_page_url) {
  console.log('Previous pages are available');
}

// Calculate total pages
const totalPages = Math.ceil(result.meta.total / result.meta.per_page);
console.log(`Total pages: ${totalPages}`);

// Check if current page is the last page
const isLastPage = result.meta.current_page === totalPages;
console.log(`Is last page: ${isLastPage}`);
```

### Pagination with Relations

```typescript
// Include related data in paginated results
const posts = await Post.$query()
  .with(['author', 'comments', 'tags'])
  .paginate(5, 1);

posts.items.forEach(post => {
  console.log(`Post: ${post.$attributes.title}`);
  console.log(`Author: ${post.$relations.author.$attributes.name}`);
  console.log(`Comments: ${post.$relations.comments.length}`);
});
```

### Error Handling

```typescript
try {
  const result = await User.$query().paginate(10, 1);
  
  if (result.items.length === 0) {
    console.log('No users found');
  } else {
    console.log(`Found ${result.items.length} users`);
  }
} catch (error) {
  console.error('Error fetching users:', error);
}
```

## Comparison with Existing Methods

### Before (Manual Extraction)

```typescript
// Old way - manual extraction from response
const response = await User.$query().get(10, 1);
const total = response.$response?.data.meta?.total || 0;
const currentPage = response.$response?.data.meta?.current_page || 1;
// ... more manual extraction
```

### After (Structured Response)

```typescript
// New way - structured response
const result = await User.$query().paginate(10, 1);
const { meta, items } = result;
// All pagination data is easily accessible
```

## Method Chaining

Pagination methods can be chained with other QueryBuilder methods:

```typescript
const result = await User.$query()
  .with(['profile', 'posts'])        // Include relations
  .withTrashed()                     // Include soft-deleted records
  .filter('status', '=', 'active')   // Apply filters
  .sortBy('created_at', 'desc')      // Sort results
  .paginate(20, 1);                  // Paginate results

// Or with search
const searchResult = await User.$query()
  .lookFor('search term')
  .scope('verified')
  .filter('age', '>', 18)
  .searchPaginate(15, 2);
```

## TypeScript Support

The pagination methods are fully typed:

```typescript
// TypeScript will infer the correct types
const result: PaginationResponse<User> = await User.$query().paginate(10, 1);

// Access to typed properties
const total: number = result.meta.total;
const users: User[] = result.items;
const currentPage: number = result.meta.current_page;
```

## Best Practices

1. **Always handle empty results**: Check if `items.length === 0`
2. **Use appropriate page sizes**: Consider performance implications of large page sizes
3. **Validate page numbers**: Ensure page numbers are positive integers
4. **Handle pagination metadata**: Use `prev_page_url` and `next_page_url` for navigation
5. **Combine with other methods**: Use filters, scopes, and relations as needed

## Migration Guide

If you're currently using the `get()` or `search()` methods and manually extracting pagination data:

1. Replace `get(limit, page)` with `paginate(limit, page)`
2. Replace `search(limit, page)` with `searchPaginate(limit, page)`
3. Access pagination data through the `meta` property
4. Access items through the `items` property

The existing `get()` and `search()` methods remain unchanged for backward compatibility.