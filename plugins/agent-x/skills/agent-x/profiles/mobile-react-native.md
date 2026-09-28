# Profile: mobile-react-native
kind: mobile

Covers React Native CLI and Expo apps. Project.md overrides any default.

## Architecture
- Navigation: React Navigation or Expo Router as the repo uses; auth stack vs app stack split; typed route params.
- Data: same single data layer rule as web (TanStack Query or the repo's choice); offline/retry behavior
  explicit; no fetch inside presentational components.
- Screen = container; components below are presentational.
- Styling via the repo's system (StyleSheet/theme, NativeWind, Tamagui, etc.) and tokens; no magic numbers.
- Platform differences via `Platform.select` or `.ios.tsx`/`.android.tsx` files, not scattered conditionals.
- Secure storage (Keychain/Keystore via expo-secure-store / react-native-keychain) for tokens — never AsyncStorage.
- Lists virtualized (FlatList/FlashList) with stable keys; images sized and cached.
- Permissions requested in context with a denied-state UI.
- RTL via `I18nManager`; dynamic type respected.

## Commands (defaults if project.md is silent)
lint `npx eslint --fix <files>` · typecheck `npx tsc --noEmit` · test `npx jest <pattern>` ·
e2e `maestro test <flow>` or `detox test` if configured.

## Verification
Screens verified on at least one iOS and one Android size if simulators are available; otherwise the
ui-fidelity axis is `unmeasured` and that is stated at the final gate. This is the least-proven
verification path in agent-x — treat scores as provisional until run on a real app.

## Structure checklist
- [ ] Screen/container vs presentational split
- [ ] Server state through the data layer; offline + error states handled
- [ ] Typed navigation params; deep links registered if needed
- [ ] Secure storage for credentials
- [ ] Virtualized lists; no inline heavy renders
- [ ] Platform code isolated
- [ ] Accessibility props on every touchable; targets ≥44pt/48dp
- [ ] Tokens only; RTL-safe
- [ ] Tests per screen state; logic unit tests
