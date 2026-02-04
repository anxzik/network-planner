# GitHub Copilot Instructions for Network Planner

## Project Overview
Network Planner is an Electron-based desktop application for network topology visualization and planning. It uses React, ReactFlow for visual diagramming, and Tailwind CSS for styling.

## Tech Stack
- **Frontend Framework**: React 19.2.3
- **Desktop Framework**: Electron 40.0.0
- **Build Tools**: Vite, Electron Forge
- **Styling**: Tailwind CSS 4.1.18
- **Diagramming**: ReactFlow 11.11.4
- **Icons**: Lucide React
- **Language**: TypeScript and JavaScript (mixed)
- **Testing**: Vitest

## Code Style and Best Practices

### General Guidelines
- Follow existing code patterns and naming conventions in the repository
- Maintain consistent indentation and formatting with existing files
- Use ES6+ syntax and modern JavaScript/TypeScript features
- Keep components modular and focused on single responsibilities

### React Development
- Use functional components with hooks (useState, useEffect, useCallback, etc.)
- Leverage custom hooks in the `context` folder for shared state (NetworkContext, SettingsContext, ScratchpadContext)
- Follow React best practices for component composition
- Use PropTypes or TypeScript for component props validation where appropriate

### Styling
- Use Tailwind CSS utility classes for styling
- Access theme colors from `currentTheme` object for dynamic theming
- Maintain responsive design principles
- Follow the existing color scheme and design patterns

### File Organization
- Components go in `src/components/[ComponentName]/`
- Utility functions in `src/utils/`
- Context providers in `src/context/`
- Static assets in `src/assets/` or `public/`
- Main process code in `src/main.ts`
- Renderer process code starts at `src/renderer.ts` and `src/main.jsx`

### Network-Specific Features
- Network devices are represented as nodes using ReactFlow
- Use `nodeFactory.js` for creating new node types
- Port management via `portFactory.js` and `PortSelector` components
- VLAN configuration through `vlanFactory.js` and VlanConfig components
- IP validation and subnet calculations in `utils/ipValidation.js` and `utils/subnetCalculator.js`

### Testing
- Write tests for utility functions (see `*.test.js` files in `src/utils/`)
- Use Vitest for unit and integration tests
- Test network topology calculations, IP validation, and subnet calculations thoroughly
- Run tests with `npm test` before committing

### Linting and Code Quality
- Run `npm run lint` before committing
- Fix all linting errors (currently using ESLint flat config)
- The project uses both `.eslintrc.json` (TypeScript) and `eslint.config.js` (JavaScript/JSX)

### Building and Packaging
- Development: `npm start`
- Package: `npm run package`
- Build distributables: `npm run make`
- Linting: `npm run lint`

## Known Issues and Constraints

### Dependencies
- The project has 31 known vulnerabilities in dependencies (primarily in dev dependencies)
- Major vulnerabilities in: tar, lodash, esbuild/vite
- Use caution when updating dependencies - test thoroughly after updates
- Some vulnerabilities are in transitive dependencies of Electron Forge and cannot be easily fixed

### ESLint Configuration
- The project is in transition between old and new ESLint config formats
- Has both `.eslintrc.json` and `eslint.config.js`
- The lint script needs updating to work with flat config format
- Avoid using `--ext` flag with eslint command

### Build Constraints
- Node version warning: Project requires Node >= 22.12.0 for @electron/build-tools
- Current CI uses Node 20.20.0 (may cause warnings)
- Electron 40.0.0 is current version - be cautious with breaking changes

## Security Considerations
- Always validate user input, especially for IP addresses and subnet calculations
- Sanitize file paths when saving/loading network configurations
- Be mindful of XSS vulnerabilities in any user-generated content
- Review dependency updates for security patches
- Document any new security vulnerabilities discovered

## Error Handling
- Provide user-friendly error messages
- Log errors appropriately for debugging
- Handle network validation errors gracefully
- Validate all network configuration inputs (IP addresses, subnet masks, VLAN IDs)

## Development Workflow
1. Check for existing lint/build errors before making changes
2. Make minimal, focused changes
3. Test changes locally (run the app with `npm start`)
4. Run lint and fix any issues
5. Write/update tests as needed
6. Document any new features or breaking changes
7. Report vulnerabilities and build issues

## Important Notes
- The application stores network configurations locally (see `utils/storage.js`)
- Supports multiple themes through SettingsContext
- Canvas background and grid settings are configurable
- Device library is extensible through the DeviceLibrary component
- The scratchpad feature allows saving subnet calculations for reference

## When Adding New Features
- Follow the existing component structure and patterns
- Update context providers if adding new global state
- Add tests for new utility functions
- Document complex network topology logic
- Ensure new features work with the existing theming system
- Test both light and dark themes if UI changes are made
