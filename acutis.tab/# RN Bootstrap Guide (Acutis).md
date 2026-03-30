# RN Bootstrap Guide (Acutis)

## 0. Root Assumption
This bootstrap assumes React Native is being introduced inside the existing `acutis.tab` repository.

DO NOT:
- create a separate repo (e.g. acutis.mobile)
- scaffold outside this root

---

## 1. Purpose

Establish a minimal, production-aligned React Native foundation that:
- respects platform rules (audit, localisation, theme)
- supports shared-tablet workflows
- is offline-capable (queue-based)
- uses encrypted local storage

---

## 2. Non-Negotiables

- Audit is server-side only
- RN must not generate authoritative audit timestamps or actor identity
- RN may capture local timestamps as **non-authoritative business metadata only**
- Local timestamps must never be treated as audit truth
- Localisation keys are shared with web
- Theme tokens are shared with web
- SQLite MUST be encrypted (SQLCipher)
- Device is not a trusted source of truth
- RN must not introduce parallel models or logic

---

## 3. Local Timestamp Rule

RN may record local timestamps for operational/business purposes such as:
- roll call timing
- therapy attendance timing
- admissions progress tracking
- offline queue ordering

These must be clearly named, e.g.:
- `capturedAtLocal`
- `occurredAtClient`
- `deviceRecordedAt`

Reserved for server authority only:
- `createdAt`
- `auditCreatedAt`
- `auditedAt`

---

## 4. Required Packages

Install core dependencies:
