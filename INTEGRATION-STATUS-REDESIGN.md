# Integration Status Engine Redesign
## SPRINT: INTEGRATION-001

**Objective:** Fix architectural flaw where integration status shows "CONNECTED" based solely on credential existence.

**Status:** In Progress

---

## THE PROBLEM

Current implementation incorrectly shows `CONNECTED` status when:
- Credentials are incomplete
- Credentials are invalid  
- Provider has never been tested
- Connection has never been verified
- API calls fail

This creates a **false production status** and masks real connectivity issues.

---

## THE SOLUTION

### 1. New Status Model

Replace 4-state model (DISCONNECTED, CONNECTED, ERROR, DISABLED) with 6-state model:

```
NOT_CONFIGURED → CONFIGURED → TESTING → CONNECTED
                                   ↓
                                 FAILED

DISABLED (any time)
```

**NOT_CONFIGURED**
- No credentials entered
- secretsConfigured == 0

**CONFIGURED**
- All required secrets exist
- Never tested OR last test unknown

**TESTING**
- Connection test in progress
- UI: Show spinner, disable Configure button

**CONNECTED**
- All required secrets exist
- Connection test succeeded
- lastTestOk === true
- lastTestedAt timestamp stored

**FAILED**
- All required secrets exist
- Connection test failed
- lastTestOk === false
- lastTestMessage shows error (e.g., "401 Unauthorized")

**DISABLED**
- Admin intentionally disabled
- Stays disabled until re-enabled

---

## 2. Real Provider Validation

Every provider performs actual API connectivity tests:

| Provider | Real Test |
|----------|-----------|
| **OpenAI** | Call `/v1/models?limit=1` endpoint |
| **Razorpay** | Call `/v1/payments?count=1` API (Basic auth) |
| **PhonePe** | Call merchant info endpoint |
| **SMTP** | Connect, authenticate, and verify |
| **TripJack** | Login flow OR token validation |
| **Cloudinary** | Call `/resources/image` endpoint |
| **reCAPTCHA** | Submit dummy token to verify site/secret pair |
| **Sembark** | Call `/health` endpoint |
| **Ferry** | Call operator `/health` endpoint |

---

## 3. Files Changed

### New Files Created

1. **`src/modules/integrations/types/integration-status.ts`** (82 lines)
   - New status enum (NOT_CONFIGURED, CONFIGURED, TESTING, CONNECTED, FAILED, DISABLED)
   - IntegrationHealth interface
   - ProviderValidator interface
   - Status transition diagram as comments

2. **`src/modules/integrations/validators/provider-validators.ts`** (430 lines)
   - Implementation of ProviderValidator for each provider
   - Real API calls for each provider
   - Error messaging with specific failure reasons
   - Registry of all validators
   - getProviderValidator() lookup function

### Files Modified

1. **`src/modules/integrations/types/integration.ts`**
   - Import new status model
   - Backward compat alias for old IntegrationStatus

2. **`src/modules/integrations/services/integration.service.ts`**
   - Replace effectiveStatus() function (new logic)
   - Update list() method (use new status calculation)
   - Update getByKey() method (use new status calculation)
   - Update update() method (new status transitions)
   - Rewrite testConnection() method (use real validators)
   - Update ensureSeeded() (initialize to NOT_CONFIGURED, not DISCONNECTED)
   - Update refreshStatusesFromVault() (new logic)

### Files Needing Updates (API/Frontend)

3. **`src/app/api/admin/integrations/[key]/index.ts`**
   - Return health information in response
   - Document new status values

4. **`src/features/admin-integrations/`** (Frontend)
   - Display new status badges
   - Show "Last Tested" timestamp
   - Show health message
   - Disable Configure button during TESTING
   - Show spinner during TESTING
   - Display lastTestMessage on FAILED state

---

## 4. Database Changes

**No schema changes required.**

Existing fields in `IntegrationProvider`:
- `status` — now holds one of 6 new enum values
- `lastTestedAt` — already exists, now properly used
- `lastTestOk` — already exists, now properly used
- `lastTestMessage` — already exists, now stores real error messages

---

## 5. API Changes

### GET `/api/admin/integrations`

**Before:**
```json
{
  "status": "CONNECTED",
  "secretsConfigured": 2,
  "secretsTotal": 2,
  "lastTestOk": null,
  "lastTestedAt": null
}
```

**After:**
```json
{
  "status": "CONFIGURED",
  "health": "Not Yet Tested",
  "secretsConfigured": 2,
  "secretsTotal": 2,
  "lastTestOk": null,
  "lastTestedAt": null,
  "lastError": null
}
```

### POST `/api/admin/integrations/[key]/test`

**Before:**
```
Status 200
{ "ok": true, "message": "Razorpay credentials are saved..." }
```

**After (Real Test):**
```
Status 200
{ "ok": true, "message": "Razorpay credentials verified" }

OR

Status 200
{ "ok": false, "message": "Razorpay authentication failed (401). Check key ID and secret." }
```

---

## 6. Regression Tests

### Unit Tests Needed

1. **Status Calculation**
   ```typescript
   test('NOT_CONFIGURED when no secrets', () => {
     const status = effectiveStatus(..., 0, 2);
     expect(status).toBe(IntegrationStatusEnum.NOT_CONFIGURED);
   });
   
   test('CONFIGURED when secrets exist but never tested', () => {
     const status = effectiveStatus(..., null, 2, 2);
     expect(status).toBe(IntegrationStatusEnum.CONFIGURED);
   });
   
   test('CONNECTED only when test succeeded', () => {
     const status = effectiveStatus(..., true, 2, 2);
     expect(status).toBe(IntegrationStatusEnum.CONNECTED);
   });
   
   test('FAILED when test failed', () => {
     const status = effectiveStatus(..., false, 2, 2);
     expect(status).toBe(IntegrationStatusEnum.FAILED);
   });
   ```

2. **Provider Validators**
   ```typescript
   test('OpenAI validator calls real API', async () => {
     const result = await openaiValidator.testConnection({
       apiKey: 'sk-test-123'
     });
     // Mocked fetch should verify correct endpoint called
   });
   
   test('Razorpay validator authenticates', async () => {
     const result = await razorpayValidator.testConnection({
       keyId: 'rzp_test_xxx',
       keySecret: 'secret'
     });
     // Verify Basic auth header constructed
   });
   ```

3. **Status Transitions**
   ```typescript
   test('Credentials change clears test results', async () => {
     // Start with CONNECTED
     // Update credentials
     // Verify status goes to CONFIGURED
     // Verify lastTestOk reset to null
   });
   ```

4. **Integration Tests**
   ```typescript
   test('OpenAI integration full flow', async () => {
     // 1. Create integration (NOT_CONFIGURED)
     // 2. Save credentials (CONFIGURED)
     // 3. Test connection (real API call)
     // 4. Verify status is CONNECTED
   });
   
   test('Invalid credentials show FAILED', async () => {
     // 1. Save invalid credentials
     // 2. Test connection
     // 3. Verify status is FAILED
     // 4. Verify lastTestMessage has error
   });
   ```

---

## 7. Status Transition Diagram

```
                    ┌─────────────────────────────────┐
                    │    NOT_CONFIGURED               │
                    │  (No secrets entered)           │
                    └──────────────┬────────────────────┘
                                   │
                        User enters required secrets
                                   │
                                   ▼
                    ┌─────────────────────────────────┐
                    │    CONFIGURED                   │
                    │  (All secrets present)          │
                    │  (Never tested)                 │
                    └──────┬───────────────┬───────────┘
                           │               │
                    Admin clicks       Credentials
                    "Test Connection"   changed
                           │               │
                           ▼               ▼
              ┌──────────────────┐   NOT_CONFIGURED
              │   TESTING        │   (need to retest)
              │  (spinner...)    │
              │  (UI disabled)   │
              └────┬────────┬────┘
                   │        │
                   │ success│ failure
                   ▼        ▼
           ┌──────────┐  ┌──────────┐
           │CONNECTED │  │  FAILED  │
           │  (badge) │  │ (error)  │
           └──────────┘  └────┬─────┘
                              │
                       User fixes credentials
                              │
                              ▼
                         CONFIGURED
                         (retry test)
                              │
                              └─► CONNECTED (success)
                                  or FAILED (still broken)

DISABLED state (admin disabled):
  ╔═════════════════════════════════════════════╗
  ║   Any state → DISABLED (admin action)       ║
  ║   DISABLED → CONFIGURED (admin re-enables)  ║
  ╚═════════════════════════════════════════════╝
```

---

## 8. Implementation Checklist

- [x] Create `integration-status.ts` with new enum and interfaces
- [x] Create `provider-validators.ts` with real API tests for each provider
- [x] Update `integration.ts` type definitions
- [ ] Update `integration.service.ts`:
  - [ ] Rewrite effectiveStatus() function
  - [ ] Update list() method
  - [ ] Update getByKey() method
  - [ ] Update update() method
  - [ ] Rewrite testConnection() with real validators
  - [ ] Fix all references from IntegrationStatus to IntegrationStatusEnum
  - [ ] Update error handling in testConnection
- [ ] Update API response types to include health field
- [ ] Update frontend to display new status badges and messages
- [ ] Update admin integration card UI:
  - [ ] Status badge with new states
  - [ ] Health message
  - [ ] Last Tested timestamp
  - [ ] Configure button (disabled during TESTING)
  - [ ] Test Connection button
  - [ ] Error message on FAILED
  - [ ] Spinner on TESTING
- [ ] Write regression tests
- [ ] Test all 9 providers with real credentials
- [ ] Verify status transitions

---

## Frontend UI Changes

### Integration Card

Before:
```
┌─ OpenAI ─────────────────────────────┐
│ ✅ CONNECTED                         │
│ Secrets: 1/1                         │
│ [Configure] [Test]                   │
└──────────────────────────────────────┘
```

After:
```
┌─ OpenAI ─────────────────────────────┐
│ ⚪ CONNECTED                         │
│ Health: Healthy                      │
│ Secrets: 1/1                         │
│ Last Tested: 19 Jul 2026, 18:22     │
│ [Configure] [Test Connection] [Logs] │
└──────────────────────────────────────┘
```

Failure State:
```
┌─ SMTP ────────────────────────────────┐
│ 🔴 FAILED                            │
│ Health: Authentication Failed        │
│ Secrets: 2/2                         │
│ Last Tested: 19 Jul 2026, 17:05     │
│                                      │
│ Error: SMTP authentication failed.   │
│        Check username and password.  │
│                                      │
│ [Configure] [Test Connection] [Logs] │
└───────────────────────────────────────┘
```

Testing State:
```
┌─ TripJack ────────────────────────────┐
│ ⏳ TESTING...                        │
│ (spinner)                            │
│ Secrets: 2/2                         │
│ [Configure (disabled)] [Cancel Test]  │
└───────────────────────────────────────┘
```

---

## Production Safety

- ✅ No false "CONNECTED" states
- ✅ Every status backed by real provider validation
- ✅ Clear error messages for debugging
- ✅ Timestamps for audit trail
- ✅ Audit logging of test results
- ✅ No breaking changes to database
- ✅ Backward compatible status field

---

## Estimated Effort

- Backend: 4-6 hours (validators, service logic, tests)
- Frontend: 2-3 hours (UI updates, status handling)
- Testing: 2-3 hours (regression tests, manual testing all 9 providers)
- **Total: ~8-12 hours**

---

**Created:** 2026-07-19  
**Sprint:** INTEGRATION-001  
**Priority:** HIGH (Production Readiness)
