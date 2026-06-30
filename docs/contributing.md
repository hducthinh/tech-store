# Contributing Guidelines

Thank you for contributing to the Tech Store! We follow a strict philosophy of simplicity and maintainability.

## The Ponytail Philosophy 👱‍♀️
Before submitting any changes, ask yourself:
1. **YAGNI**: Does this feature or abstraction absolutely need to exist right now?
2. **Minimalism**: Is this the simplest, shortest, most minimal solution that actually works?
3. **No Speculation**: Are you adding flexibility for a future that might never arrive? (Don't).
4. **Dependencies**: Did you try the standard library or native platform features before `npm install`?

## Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Ensure you adhere to the [Coding Standards](./coding-standards.md).
3. If adding a new feature, follow the [Hybrid Feature Structure](./project-structure.md) rules. Place domain logic in `src/features/`.
4. **Clean up after yourself**: Remove unused variables, imports, and unreachable code.

## Pre-Commit Verification
Before opening a Pull Request, you MUST ensure absolute repository cleanliness. Run the following:

1. **Linting**:
   ```bash
   cd client && npm run lint
   ```
   Must return 0 errors and 0 warnings.

2. **Dead Code Check**:
   ```bash
   cd client && npx knip
   ```
   Must return 0 unused files and 0 unused exports.

3. **Build Verification**:
   ```bash
   cd client && npm run build
   ```
   The build must succeed without any critical bundle warnings.
