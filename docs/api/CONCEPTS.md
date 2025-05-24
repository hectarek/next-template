# 🌐 REST API Design Concepts

This guide explains **fundamental REST API design principles** and patterns that every developer should understand. These concepts will help you design clean, maintainable APIs in any framework or language.

> **Educational Resource**: Learn these concepts to design better APIs in any project. For our specific implementation, see [Our API Reference](./OUR_API.md).

## 🎯 What is REST?

**REST (Representational State Transfer)** is an architectural style for designing web APIs. It's not a standard or protocol, but a set of principles that make APIs predictable and easy to use.

### **Core REST Principles**

1. **Stateless**: Each request contains all information needed to process it
2. **Resource-Based**: URLs represent resources (things), not actions
3. **HTTP Methods**: Use standard HTTP verbs for different operations
4. **Uniform Interface**: Consistent patterns across all endpoints
5. **Cacheable**: Responses can be cached for better performance

## 🛣️ Resource Design Fundamentals

### **Understanding Resources**

A **resource** is any information that can be named. In APIs, resources are typically:

- **Entities**: Users, products, orders, articles
- **Collections**: List of users, search results
- **Relationships**: User's posts, order items

### **URL Structure Patterns**

```
# Good: Noun-based, hierarchical
GET /users              # Collection of users
GET /users/123          # Specific user
GET /users/123/posts    # User's posts
POST /posts             # Create a new post

# Bad: Verb-based URLs
GET /getUsers           # ❌ Verb in URL
POST /createUser        # ❌ Verb in URL
GET /user_posts?id=123  # ❌ Poor structure
```

### **Resource Naming Conventions**

```
# Collections (plural nouns)
/users, /products, /orders, /articles

# Individual resources (plural + identifier)
/users/123, /products/abc, /orders/order-456

# Nested resources (show relationships)
/users/123/posts        # User's posts
/posts/456/comments     # Post's comments
/categories/tech/posts  # Posts in tech category

# Special operations (use descriptive names)
/users/123/activate     # Activate user
/orders/456/cancel      # Cancel order
/posts/789/publish      # Publish post
```

## 🔧 HTTP Methods (Verbs)

### **Standard CRUD Operations**

| Method     | Purpose                 | Example             | Response        |
| ---------- | ----------------------- | ------------------- | --------------- |
| **GET**    | Retrieve data           | `GET /users/123`    | User data       |
| **POST**   | Create new resource     | `POST /users`       | Created user    |
| **PUT**    | Replace entire resource | `PUT /users/123`    | Updated user    |
| **PATCH**  | Update part of resource | `PATCH /users/123`  | Updated user    |
| **DELETE** | Remove resource         | `DELETE /users/123` | Success message |

### **When to Use Each Method**

```javascript
// GET - Retrieve data (safe, idempotent)
GET /users/123          // Get specific user
GET /users?role=admin   // Get users with filters

// POST - Create resources (not idempotent)
POST /users             // Create new user
POST /posts             // Create new post

// PUT - Replace entire resource (idempotent)
PUT /users/123          // Replace user completely
// Requires ALL fields in request body

// PATCH - Partial updates (idempotent)
PATCH /users/123        // Update only provided fields
// Only send fields you want to change

// DELETE - Remove resources (idempotent)
DELETE /users/123       // Delete user
DELETE /posts/456       // Delete post
```

## 📊 Response Design Patterns

### **HTTP Status Codes**

**Success Codes (2xx)**

```
200 OK              // Successful GET, PUT, PATCH
201 Created         // Successful POST
204 No Content      // Successful DELETE (no response body)
```

**Client Error Codes (4xx)**

```
400 Bad Request     // Invalid request data
401 Unauthorized    // Authentication required
403 Forbidden       // Insufficient permissions
404 Not Found       // Resource doesn't exist
409 Conflict        // Resource conflict (duplicate)
422 Unprocessable   // Validation errors
```

**Server Error Codes (5xx)**

```
500 Internal Error  // Unexpected server error
502 Bad Gateway     // External service error
503 Service Unavailable // Temporary outage
```

### **Response Format Patterns**

**Single Resource Response**

```json
{
	"id": "user-123",
	"name": "John Doe",
	"email": "john@example.com",
	"createdAt": "2024-01-01T00:00:00Z"
}
```

**Collection Response (with pagination)**

```json
{
	"data": [
		{ "id": "user-123", "name": "John Doe" },
		{ "id": "user-456", "name": "Jane Smith" }
	],
	"pagination": {
		"page": 1,
		"limit": 10,
		"total": 150,
		"hasMore": true
	}
}
```

**Error Response**

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Email is required",
		"field": "email"
	}
}
```

## 🔍 Query Parameters & Filtering

### **Common Query Parameter Patterns**

```
# Pagination
GET /users?page=2&limit=20

# Filtering
GET /users?role=admin&active=true
GET /products?category=electronics&price_min=100

# Sorting
GET /users?sort=created_at&order=desc
GET /products?sort=price,name&order=asc,asc

# Field Selection
GET /users?fields=id,name,email
GET /posts?include=author,comments

# Search
GET /users?search=john
GET /products?q=laptop
```

### **Filter Design Guidelines**

```
# Simple equality
?status=active
?role=admin

# Comparison operators
?price_min=100&price_max=500
?created_after=2024-01-01
?age_gte=18

# Multiple values
?category=tech,science
?status=active,pending

# Boolean values
?featured=true
?archived=false
```

## 🛡️ Error Handling Principles

### **Consistent Error Structure**

Every error response should include:

- **HTTP Status Code**: Appropriate status code
- **Error Code**: Machine-readable error identifier
- **Message**: Human-readable description
- **Details**: Additional context when helpful

```json
// Validation Error Example
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": {
      "email": "Email is required",
      "age": "Must be a positive number"
    }
  }
}

// Not Found Error Example
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "resource": "user",
    "id": "user-123"
  }
}
```

### **Error Handling Best Practices**

1. **Be Specific**: Clear error messages help developers debug
2. **Be Consistent**: Same error format across all endpoints
3. **Be Helpful**: Include what went wrong and how to fix it
4. **Be Secure**: Don't expose sensitive system information

## 📈 API Design Best Practices

### **1. Consistency**

```
# Good: Consistent naming
GET /users          POST /users
GET /posts          POST /posts
GET /comments       POST /comments

# Bad: Inconsistent naming
GET /users          POST /createUser
GET /articles       POST /newPost
GET /getAllComments POST /comment
```

### **2. Predictability**

```
# Predictable patterns
GET    /resources           # List all
POST   /resources           # Create new
GET    /resources/123       # Get specific
PUT    /resources/123       # Replace
PATCH  /resources/123       # Update
DELETE /resources/123       # Delete
```

### **3. Versioning**

```
# URL versioning
/api/v1/users
/api/v2/users

# Header versioning
Accept: application/vnd.api+json;version=1
API-Version: v2

# Parameter versioning
/api/users?version=2
```

### **4. Documentation**

Every API should have:

- **Endpoint documentation**: What each endpoint does
- **Request examples**: Sample requests with all parameters
- **Response examples**: Sample responses for success and error cases
- **Authentication**: How to authenticate requests
- **Rate limits**: Usage restrictions and limits

## 🎯 Common Anti-Patterns to Avoid

### **❌ Poor URL Design**

```
# Don't use verbs in URLs
GET /getUsers
POST /createUser
DELETE /deleteUser/123

# Don't mix conventions
GET /user/123          # Singular
GET /products          # Plural

# Don't make URLs too deep
GET /companies/123/departments/456/teams/789/members/101
```

### **❌ Ignoring HTTP Methods**

```
# Don't use only GET and POST
GET /deleteUser/123    # Should be DELETE
POST /getUsers         # Should be GET

# Don't use wrong status codes
POST /users -> 200 OK  # Should be 201 Created
DELETE /users/123 -> 200 OK with user data  # Should be 204 No Content
```

### **❌ Inconsistent Responses**

```
# Don't mix response formats
// Endpoint 1
{ "users": [...] }

// Endpoint 2
{ "data": [...] }

// Endpoint 3
[...]  // Just array
```

## 📚 Learning Resources

### **REST & API Design**

- **[REST API Tutorial](https://restfulapi.net/)** - Comprehensive REST guide
- **[HTTP Status Dogs](https://httpstatusdogs.com/)** - Fun way to learn status codes
- **[API Design Guidelines](https://github.com/microsoft/api-guidelines)** - Microsoft's API design guide

### **Best Practices**

- **[JSON API Specification](https://jsonapi.org/)** - Standardized JSON API format
- **[OpenAPI Specification](https://swagger.io/specification/)** - API documentation standard
- **[REST API Design Rulebook](https://www.oreilly.com/library/view/rest-api-design/9781449317904/)** - Comprehensive design patterns

### **Tools for Learning**

- **[Postman](https://www.postman.com/)** - API testing and documentation
- **[HTTPie](https://httpie.io/)** - Command-line HTTP client
- **[Swagger Editor](https://editor.swagger.io/)** - API design and documentation

---

**Apply These Concepts**: Use these principles when designing your APIs. Start simple, be consistent, and always think from the API consumer's perspective. For practical examples in our project, see [Our API Reference](./OUR_API.md).
