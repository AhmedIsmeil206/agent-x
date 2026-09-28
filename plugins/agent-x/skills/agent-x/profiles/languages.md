# Language toolchain map (any language)

Used by init, implementer, qa-tester, environment and the lint hook when project.md doesn't name a command.
Project commands always win; these are fallbacks to check for (`which` / config files), never to install silently.

| Language | Manifest | Lint / format | Typecheck / build | Test |
|---|---|---|---|---|
| TypeScript / JavaScript | package.json | eslint / biome / prettier | tsc --noEmit | vitest / jest / mocha |
| Python | pyproject.toml, requirements.txt | ruff / black | mypy / pyright | pytest |
| Go | go.mod | gofmt, golangci-lint | go build ./... , go vet ./... | go test ./... |
| Rust | Cargo.toml | cargo fmt, cargo clippy | cargo check | cargo test |
| Java | pom.xml, build.gradle | spotless / checkstyle | mvn -q compile / gradle build | mvn test / gradle test |
| Kotlin (JVM/Android) | build.gradle.kts | ktlint / detekt | gradle assemble | gradle test, connectedAndroidTest |
| Swift (iOS/macOS) | Package.swift, *.xcodeproj | swiftformat, swiftlint | swift build / xcodebuild build | swift test / xcodebuild test |
| Dart / Flutter | pubspec.yaml | dart format, dart analyze | flutter analyze | flutter test |
| C# / .NET | *.csproj, *.sln | dotnet format | dotnet build | dotnet test |
| PHP | composer.json | php-cs-fixer, phpstan | phpstan / psalm | phpunit / pest |
| Ruby | Gemfile | rubocop | sorbet (if used) | rspec / minitest |
| Elixir | mix.exs | mix format, credo | mix compile --warnings-as-errors | mix test |
| Scala | build.sbt | scalafmt | sbt compile | sbt test |
| C / C++ | CMakeLists.txt, Makefile | clang-format, clang-tidy | cmake --build | ctest |

## Architecture fallback for any language
When no specific profile exists, `generic.md` applies with these language-neutral rules: follow the project's
layering (entry/handler → domain/service → data access), validate external input at the boundary with the
language's usual tool, typed domain errors mapped in one place, no secrets in code, tests beside the project's
existing tests using its framework. Specific profiles (web-react, mobile-react-native, backend-node,
backend-python) are refinements, not requirements; add more by copying generic.md (e.g. backend-go,
mobile-flutter, backend-dotnet).
