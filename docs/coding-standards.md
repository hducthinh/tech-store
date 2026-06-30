# Coding Standards

We follow strict coding standards to ensure consistency, prevent bugs, and maintain a high-quality codebase.

## 1. Naming Conventions
- **Components & Classes**: `PascalCase` (e.g., `AdminTable.jsx`, `ApiError.js`).
- **Hooks**: `camelCase` starting with `use` (e.g., `useFetchData.js`, `useDashboard.js`).
- **Utilities & Helpers**: `camelCase` (e.g., `formatDate.js`, `api.js`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`, `PAGE_SIZE`).
- **Files**: Filenames should match the primary export using the conventions above.

## 2. React Practices
- **Avoid Anti-patterns**: Do not cause cascading renders. Calling `setState` synchronously within a `useEffect` body is strictly forbidden unless guarded by explicit disable directives for specific API timing requirements.
- **Memoization**: Use `useMemo` and `useCallback` appropriately for derived expensive calculations or referential equality in dependency arrays.
- **Component Size**: Keep components small and focused. Extract sub-components when files exceed 200 lines.

## 3. General Principles (Ponytail Rules)
- **YAGNI (You Aren't Gonna Need It)**: Do not introduce speculative abstractions.
- **Simplest Working Solution**: Prefer the most minimal solution that meets the requirement.
- **Standard Library First**: Utilize native platform features before reaching for external dependencies.

## 4. Linting
- Code must pass `npm run lint` with **0 errors and 0 warnings**.
- No unused files, imports, or exports allowed (verified via `knip`).
