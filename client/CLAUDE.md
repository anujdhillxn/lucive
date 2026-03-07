# Lucive Client — React Native Layer

## Stack

- **Framework**: React Native 0.74.5 via Expo SDK 51 (bare workflow)
- **Language**: TypeScript 5
- **Navigation**: `@react-navigation/stack` v6
- **State**: React Context (no Redux/Zustand)
- **Auth**: `@react-native-google-signin/google-signin` + token stored in native storage
- **Push notifications**: `@react-native-firebase/messaging`
- **Build/run**: `expo run:android` (not `npx react-native run-android`)

## Directory Structure

```
src/
├── api/             # HTTP layer — ApiProvider, createApi, per-resource API modules
├── components/      # Shared UI primitives
├── contexts/        # React Context providers
├── features/        # Screen-level components, grouped by auth state
│   ├── BeforeLogin/
│   └── AfterLogin/
│       ├── Rules/
│       ├── Scores/
│       └── User/
├── hooks/           # Custom hooks
├── styles/          # colors.ts, fonts.ts
├── types/           # Shared TypeScript types
└── utils/           # Pure utility functions
```

## Navigation Flow

```
AppScreenStack decides which navigator to render:

No auth token / no user  →  Stack: Login → Signup
Missing permissions      →  PermissionsScreen (full-screen, no nav)
Has user, no duo         →  Stack: NoDuo (UserScreen only)
Has user + duo           →  Stack: Rules | Scores | User  +  bottom tab bar
                              └── Rules → RuleCreator (push)
```

The bottom tab bar is a custom `BottomButton` row, not `@react-navigation/bottom-tabs`.

## State Management

Two separate React Contexts:

### `AppContext` / `AppActions`
Primary app state. Provided by `AppContextProvider`.
- `user`, `myDuo`, `rules`, `appLoading`, `currentScreen`
- `fetchData()` — refetches all three (user, duo, rules) in parallel
- On `user` change: syncs to native storage via `LocalStorageModule.setUser()`
- On `myDuo` change: re-fetches rules; persists to `AsyncStorage`
- On `rules` change: syncs to native storage via `LocalStorageModule.setRules()`

### `NativeContext`
Bridges to Android native modules.
- `installedApps` — map of `packageName → AppInfo`
- `permissions` — `{ hasUsageStatsPermission, hasOverlayPermission }`
- `requestUsageStatsPermission`, `requestOverlayPermission`, `checkPermissions`

## API Layer

All HTTP calls go through `useRemote` → `createApi` → per-resource modules.

```
ApiProvider
  └── useRemote(requestToken, setRequestToken, baseUrl)
        └── createApi(remote)
              ├── userApi
              ├── duoApi
              ├── ruleApi
              ├── scoreApi
              └── contentApi
```

- Base URL comes from `BuildConfigModule.getApiUrl()` (injected at build time per flavor).
- Auth token is stored in native SharedPreferences and read on startup by `LocalStorageModule.getRequestToken()`.
- `useRemote` is responsible for attaching the `Authorization: Token <token>` header.

## Key Hooks

| Hook | Purpose |
|---|---|
| `useAppContext()` | Access `AppContext` — throws if used outside provider |
| `useActions()` | Access `AppActions` — throws if used outside provider |
| `useApi()` | Access `ApiContext` (api object + token) |
| `useNativeContext()` | Access `NativeContext` |
| `useConfirm()` | Imperative confirm modal (promise-based) |
| `useDeepCompareEffect()` | `useEffect` with deep equality check (uses `lodash.isequal`) |
| `useRemote()` | Raw HTTP client; not used directly in components |

## Native Modules (accessed via `NativeModules`)

| Module | Methods |
|---|---|
| `LocalStorageModule` | `getRequestToken`, `setRequestToken`, `clearRequestToken`, `getUser`, `setUser`, `clearUser`, `getRules`, `setRules` |
| `UsageTracker` | `startService`, `stopService`, `isServiceRunning` |
| `InstalledApps` | `getInstalledApps()` → `AppInfo[]` |
| `PermissionsModule` | `hasUsageStatsPermission`, `hasOverlayPermission`, `requestUsageStatsPermission`, `requestOverlayPermission` |
| `BuildConfigModule` | `getApiUrl(callback)` |

## Type Conventions

- Domain types live in `src/types/state.ts` (`User`, `Duo`, `Rule`, `RuleConstraint`, `Score`, etc.)
- API contract types in `src/types/api.ts`
- Native bridge types in `src/types/native.ts`
- Server uses `snake_case`; all API responses are serialized to `camelCase` by the Django serializers — types reflect camelCase.

## Rule Types

```typescript
RuleConstraint       // the constraint fields only (shared base)
Rule                 // extends RuleConstraint + appDisplayName, createdAt, isMyRule, modificationData?, isTemporary, validTill, version
RuleModificationData // same shape as RuleConstraint (the pending relaxation)
RuleModificationRequest // RuleModificationData + appDisplayName
```

`rule.isMyRule` is computed server-side and indicates whether the authenticated user owns this rule (vs. it being the partner's rule).

## Styles

- `src/styles/colors.ts` exports a `Colors` object — always use these, no hardcoded hex values.
- `src/styles/fonts.ts` exports font definitions.
- Inline `StyleSheet.create()` per component file; no CSS-in-JS library.

## Commands

```bash
# Install dependencies
cd client && npm install

# Start Metro bundler
npm start

# Run on Android (debug build)
npm run android

# Run with specific build variant
expo run:android --variant staging
```
