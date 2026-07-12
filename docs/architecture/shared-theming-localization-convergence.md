# Shared theming and localization convergence

## Purpose and non-goals

The repository relocation preserves the existing Acutis visual language, localization, fallback behavior, and RTL behavior without attempting to unify the implementations. This document records the current divergence and a possible later convergence sequence.

This is analysis only. It does not authorize visual redesign, translation changes, token renaming, persistence changes, or a new framework.

## Current implementations

### Shared platform

- `acutis.shared/acutis.shared.web/packages/design-system` provides the product web shell and its current token vocabulary.
- `acutis.shared/acutis.shared.tab/packages/mobile-ui` provides the product mobile/tablet shell.
- `acutis.shared/acutis.shared.api/packages/branding` currently defines branding contracts but has no application runtime consumer.
- `acutis.shared/acutis.shared.resources/packages/localization` contains common and product-specific English and Arabic text. Product-specific translation leakage is intentionally preserved during relocation.
- `acutis.shared/acutis.shared.resources/packages/rtl` supplies direction handling for Arabic, Persian, Hebrew, and Urdu locales.

Community, Practitioner, and Outreach web applications consume the shared design system, localization, identity, and RTL packages. Their tablet/mobile applications consume the shared mobile UI and localization packages and use device locale detection.

### Centre web

Centre web retains its richer local `ThemeProvider` and `themeSystem`. Centre selection, tenant branding, user choice, browser persistence, and component-level theme behavior remain local to `acutis.centre.web`.

Centre web also retains its API-backed `LocalizationProvider`, database translations, fallbacks, and its existing Arabic direction switch. This provider is used across landing, configuration, screening, ambulatory, shared operational, and video-consultation areas.

### Centre tablet

Centre tablet retains its local token and i18n systems. These are used across authentication, admissions, Community legacy screens, dashboard, incidents, maps, observations, residents, synchronization, therapy, unit, and modal flows.

## Known divergence

- Centre theme tokens and precedence rules are richer than the shared web shell.
- Shared branding contracts do not cover every Centre strong, soft, background, and shadow token.
- Centre web and product web applications use different localization sources and fallback paths.
- Centre web currently detects RTL through an Arabic-specific check, while the shared RTL package recognizes additional RTL locales.
- Centre tablet currently depends heavily on local English text and fallbacks.
- Product-specific dictionaries remain embedded in the shared localization package.
- Mobile shells contain platform-specific styling choices that are not represented by one shared semantic-token contract.
- Existing encoding defects, where present, must be corrected separately with byte-level and visual verification rather than during relocation.

## Possible target contracts

A later design should remain small and explicit:

1. A semantic token contract shared by web and React Native renderers, including current Centre background, strong, soft, border, text, focus, and shadow requirements.
2. Explicit precedence for platform defaults, product accents, tenant branding, centre configuration, and user selection.
3. Translation namespaces that separate common resources from product-owned resources while preserving current keys and fallbacks during migration.
4. A documented BCP-47 locale fallback and interpolation contract.
5. RTL direction provided through the existing shared RTL rules, with platform-specific layout adapters.
6. Explicit persistence, caching, server-rendering, hydration, accessibility, and failure behavior.

Shared infrastructure must not imply shared product branding, configuration, membership, or translation ownership.

## Safe later migration sequence

1. Capture visual baselines and token inventories for every product, theme, viewport, and supported mobile platform.
2. Add compatibility tests around existing locale selection, formatting, fallback, interpolation, and RTL behavior.
3. Extend shared contracts until they can represent existing Centre behavior without changing output.
4. Introduce adapters around current Centre providers; do not replace them immediately.
5. Migrate one product and one platform at a time behind parity tests.
6. Move product-specific translation dictionaries only after their consumers and fallback dependencies are proven.
7. Remove old implementations only after byte-level resource comparison, screenshot comparison, accessibility checks, and rollback validation.

## Required verification

- token and computed-style parity for light, dark, and configured product themes;
- server-rendering and hydration stability for web applications;
- React Native rendering and accessibility snapshots;
- locale detection, fallback, formatting, and interpolation tests;
- RTL layout, navigation, icon direction, and form rendering tests;
- failure behavior when API translations or tenant branding are unavailable;
- confirmation that public application identifiers and product authorization boundaries remain unchanged.

The repository reorganisation does not execute this convergence sequence and must not be described as having created one unified theming engine.
