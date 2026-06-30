# ADR 0001: Hybrid Feature Structure

## Status
Accepted

## Context
As the project evolved past the initial MVP phase, it accumulated numerous domain entities (Admin, Auth, Products, Builder, Orders, Profile). Keeping all components flat inside `src/components` and all hooks flat inside `src/hooks` made it difficult to scale and understand the boundaries between different parts of the application. We needed a structure that would support growth for the next 6 months.

A pure Feature-Based structure was proposed (moving *everything* into `src/features/`), but this was rejected because it would compromise the reusability of our core UI primitives and global utilities.

## Decision
We adopted a **Hybrid Feature Structure**.
- **Core Infrastructure** (UI primitives like Buttons/Modals, global contexts, global hooks like `useFetchData`, and API services) remains at the project root.
- **Domain Logic** (components and hooks specifically tied to one business area, e.g., Admin Dashboard, PC Builder) is encapsulated into `src/features/[feature-name]`.

## Consequences
- **Positive**: Domain features are self-contained and easier to reason about. Team members can work on `features/builder` without worrying about impacting `features/admin`.
- **Positive**: Core UI primitives remain highly reusable across all features.
- **Negative**: Developers must make a conscious decision on whether a new component is a "Core Component" or a "Feature Component" when creating it.
