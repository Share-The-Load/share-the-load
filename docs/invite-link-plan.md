# Shareable Group Invite Links

## Context
Users currently join groups by searching by name and entering a passcode. There's no way to share a direct link. This feature lets any group member generate and share an invite link that deep-links recipients into the app to join the group.

## User Flow

**Sender:** GroupHomeScreen → taps "Share Invite Link" → native OS share sheet opens → sends via iMessage/WhatsApp/AirDrop/email/etc.

**Recipient (has app, is logged in, no group):** Taps link → app opens → auto-joins group (or prompts for passcode if group has one)

**Recipient (has app, not logged in):** Taps link → app opens → invite code is stored → after login, processes the pending invite

**Recipient (already in a group):** Taps link → shown "You must leave your current group first" alert

---

## Implementation

### 1. Backend: Add `invite_code` to Group model
**File:** `share-the-load-api/models/group.js`
- Add `invite_code: STRING(12), unique, nullable` column

### 2. Backend: Add two new endpoints
**File:** `share-the-load-api/routes/group.js`

**`GET /group-invite-code/:groupId`** (authenticated, must be group member)
- Returns existing invite code, or generates one if none exists
- Code: 8-char alphanumeric via `crypto.randomBytes(6).toString('base64url').slice(0, 8)`

**`POST /join-group-by-invite`** (authenticated)
- Body: `{ inviteCode, passcode? }`
- Looks up group by invite_code
- If group has passcode and none provided: returns 403 `{ requiresPasscode: true, groupId, groupName }`
- Otherwise: joins user to group

### 3. Frontend: Add API methods
**File:** `app/services/api/api.ts`
- `getInviteCode(groupId)` → GET `/group-invite-code/:groupId`
- `joinGroupByInvite(inviteCode, passcode?)` → POST `/join-group-by-invite`

**File:** `app/services/api/api.types.ts`
- Add response type for invite code

### 4. Frontend: Add `pendingInviteCode` to auth store
**File:** `app/store/authStore.ts`
- Add `pendingInviteCode` field + setter, persisted to MMKV

### 5. Frontend: Deep link handling
**File:** `app/app.tsx`
- Use `expo-linking` (already installed) to listen for `share-the-load://invite/{code}`
- Handle both cold start (`getInitialURL`) and warm start (`addEventListener`)
- Extract invite code, call join API, handle passcode prompt if needed
- If not authenticated, store code as `pendingInviteCode` and process after login

### 6. Frontend: Share button on GroupHomeScreen
**File:** `app/screens/GroupHomeScreen.tsx`
- Add "Share Invite Link" button (visible to all members)
- Calls `getInviteCode`, then uses React Native's built-in `Share.share()` API
- This opens the **native OS share sheet** (iOS/Android) — the same one you see when tapping the share icon in Safari or any app
- The user chooses how to send it themselves: iMessage, WhatsApp, AirDrop, email, copy link, etc.
- No in-app messaging — the OS handles everything

---

## Key Design Decisions
- **One invite code per group** (not per-invite) — simple, no expiration table needed. Owner can regenerate if needed later.
- **Custom scheme only** (`share-the-load://`) — universal links require web server config (apple-app-site-association, assetlinks.json), out of scope for now.
- **Deep links handled in app.tsx**, not React Navigation linking config — the invite triggers an API call + state change, not a screen navigation.
- **Passcode still required** if group has one — invite link doesn't bypass existing security.

---

## Implementation Order
1. Backend: model change + endpoints (test with curl)
2. Frontend: API methods + types
3. Frontend: auth store changes
4. Frontend: share button on GroupHomeScreen
5. Frontend: deep link handling in app.tsx
6. Edge case testing

## Verification
- Generate invite link from GroupHomeScreen, verify share sheet opens with correct URL
- Open `share-the-load://invite/{code}` in device browser, verify app opens and joins group
- Test with passcode-protected group (should prompt)
- Test while logged out (should store pending code, join after login)
- Test while already in a group (should show alert)
- Test with invalid code (should show error)
