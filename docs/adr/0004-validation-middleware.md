# ADR 0004: Centralized Backend Validation

## Status
Accepted

## Context
In early iterations, request payload validation (checking if passwords matched, ensuring emails were valid, validating product prices) was scattered across controller functions. This led to inconsistent error responses, duplicated validation logic, and bloated controllers.

## Decision
We adopted a centralized validation strategy using Express middleware. Validation schemas are defined separately, and routes are protected by a validation middleware that executes before the controller. If validation fails, the middleware automatically throws an `ApiError` which is caught by the global error handler.

## Consequences
- **Positive**: Controllers are clean and only handle business logic, safely assuming the incoming `req.body` is valid.
- **Positive**: The frontend receives consistent, predictable `400 Bad Request` payloads for all validation failures across the entire API.
- **Positive**: Easier to test validation schemas in isolation.
- **Negative**: Requires learning and maintaining the schema definition syntax used by the chosen validation library.
