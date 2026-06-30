# ADR 0003: Admin Table Component Architecture

## Status
Accepted

## Context
The Admin dashboard required multiple tables (Users, Products, Orders, Categories) that shared visual styling and pagination logic, but differed vastly in columns, row data, and action buttons. Initially, these were either duplicated entirely or abstracted into a single massive `AdminTable` component taking an overly complex configuration object.

## Decision
We refactored `AdminTable` into a more modular structure, removing unused generic exports and focusing on a flexible layout wrapper. Specific tables (e.g., `ProductTable`, `OrderTable`) are built by composing standard table HTML/UI primitives provided by the Core infrastructure, keeping the rendering logic for specific domains inside `features/admin/components/`.

## Consequences
- **Positive**: Highly flexible. Changing the layout of a specific column in the Products table does not risk breaking the Users table.
- **Positive**: Eliminated unused generic table configurations (detected and cleaned up via `knip`).
- **Negative**: Slight duplication of standard `<table>`, `<thead>`, `<tbody>` boilerplate across different admin views, which is considered an acceptable trade-off for flexibility.
