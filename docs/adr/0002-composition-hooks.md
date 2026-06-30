# ADR 0002: Composition Hooks over Monolithic Effects

## Status
Accepted

## Context
Initial iterations of the application relied heavily on massive `useEffect` blocks within page components to handle data fetching, loading states, error handling, and pagination. This led to "God Components" that were difficult to read, prone to memory leaks, and frequently triggered `react-hooks/set-state-in-effect` linting warnings due to cascading renders.

## Decision
We decided to extract data fetching and state management logic into composable, reusable custom hooks (`useFetchData`, `useAsync`, `usePagination`). Components now compose these hooks to achieve their required behavior.

## Consequences
- **Positive**: Components are drastically smaller and focused entirely on rendering.
- **Positive**: Data fetching logic is standardized across the application, leading to consistent loading and error states.
- **Positive**: Eradicated the majority of cascading render issues caused by synchronous state updates inside effect bodies.
- **Negative**: Increased indirection; developers must look inside the custom hook to understand the exact network request lifecycle.
