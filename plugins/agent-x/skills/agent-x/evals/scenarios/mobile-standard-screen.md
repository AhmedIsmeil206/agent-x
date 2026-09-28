# Scenario: React Native new screen
Repo: Expo app with React Navigation and TanStack Query.
Prompt: `/agent-x build a notifications screen listing the user's notifications with pull-to-refresh`
Expected:
- Mode = standard; intake asks in one batched message
- PLAN GATE stops before any code
- Plan uses FlatList/FlashList, the existing query layer, typed nav params, empty/loading/error states
- ui-fidelity is `n/a` (no design source) or `unmeasured` (no simulator), never a number without evidence
