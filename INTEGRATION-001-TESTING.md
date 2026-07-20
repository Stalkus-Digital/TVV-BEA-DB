# INTEGRATION-001: Testing & Validation Guide

**Status:** Implementation Complete | Ready for Testing

---

## IMPLEMENTATION SUMMARY

### What Changed (Minimal & Surgical)

**Backend:**
- ✅ New status model: `integration-status.ts` (6 states, not 4)
- ✅ Real provider validators: `provider-validators.ts` (actual API calls)
- ✅ Updated `integration.service.ts`:
  - Replaced credential-checking logic with real validators
  - Fixed status transitions (NOT_CONFIGURED → CONFIGURED → CONNECTED)
  - Removed old DISCONNECTED/ERROR states
  - Fixed all enum references
  
**What Stayed the Same:**
- ✅ Database schema (no changes)
- ✅ API endpoints (no changes)
- ✅ API response structure (except new `health` field)
- ✅ Frontend components (only status badge styling needed)
- ✅ All existing integrations continue to work

### Files Modified

```
src/modules/integrations/
├── types/
│   ├── integration-status.ts        [NEW - 82 lines]
│   └── integration.ts               [MODIFIED - imports only]
├── validators/
│   └── provider-validators.ts       [NEW - 430 lines]
└── services/
    └── integration.service.ts        [MODIFIED - 3 critical changes]
```

---

## TESTING PLAN

### Phase 1: Unit Testing (Each Provider)

For each of the 9 providers, test with 3 credential states:

#### OpenAI
```bash
# 1. Missing Credentials
POST /api/admin/integrations/openai/test
# Expected: { ok: false, message: "OpenAI API key not configured" }
# Status should be: NOT_CONFIGURED

# 2. Invalid Credentials
Save: apiKey=invalid
POST /api/admin/integrations/openai/test
# Expected: { ok: false, message: "OpenAI rejected this API key (401...)" }
# Status should be: FAILED
# lastTestMessage should show the error

# 3. Valid Credentials
Save: apiKey=sk-proj-xxxxx (real key)
POST /api/admin/integrations/openai/test
# Expected: { ok: true, message: "OpenAI API connection successful" }
# Status should be: CONNECTED
# lastTestedAt should be set
```

#### Razorpay
```bash
# 1. Missing Credentials
# Expected: { ok: false, message: "Razorpay key ID and secret not configured" }

# 2. Invalid Credentials  
Save: keyId=rzp_test_xxx, keySecret=invalid
POST /api/admin/integrations/razorpay/test
# Expected: { ok: false, message: "Razorpay authentication failed (401)..." }
# Status should be: FAILED

# 3. Valid Credentials
Save: keyId=rzp_test_xxx, keySecret=actual_secret
POST /api/admin/integrations/razorpay/test
# Expected: { ok: true, message: "Razorpay credentials verified" }
# Status should be: CONNECTED
```

#### SMTP
```bash
# 1. Missing Credentials
# Expected: { ok: false, message: "SMTP host, user, and password not configured" }

# 2. Invalid Credentials
Save: host=smtp.gmail.com, user=test@gmail.com, pass=invalid
POST /api/admin/integrations/smtp/test
# Expected: { ok: false, message: "SMTP authentication failed. Check username and password." }
# Status should be: FAILED

# 3. Valid Credentials
Save: host=smtp.gmail.com, user=test@gmail.com, pass=actual_app_password
POST /api/admin/integrations/smtp/test
# Expected: { ok: true, message: "SMTP connection successful" }
# Status should be: CONNECTED
```

#### TripJack, Cloudinary, PhonePe, reCAPTCHA, Sembark
[Same pattern: Missing → Invalid → Valid]

---

### Phase 2: Status Transition Testing

#### Transition 1: NOT_CONFIGURED → CONFIGURED
```
1. Create new integration (or clear credentials)
   GET /api/admin/integrations/openai
   # Status should be: NOT_CONFIGURED
   
2. Save credentials
   POST /api/admin/integrations/openai
   Body: { secrets: { apiKey: "sk-..." } }
   
   GET /api/admin/integrations/openai
   # Status should be: CONFIGURED (not CONNECTED!)
   # lastTestOk should be: null
   # lastTestedAt should be: null
```

#### Transition 2: CONFIGURED → CONNECTED
```
1. Start in CONFIGURED state (credentials saved, not tested)
   GET /api/admin/integrations/openai
   # Status: CONFIGURED

2. Test connection (with VALID credentials)
   POST /api/admin/integrations/openai/test
   # Response: { ok: true, message: "..." }
   
   GET /api/admin/integrations/openai
   # Status should now be: CONNECTED
   # lastTestOk should be: true
   # lastTestedAt should be: set to test timestamp
```

#### Transition 3: CONFIGURED → FAILED
```
1. Start in CONFIGURED state (credentials saved, not tested)
   GET /api/admin/integrations/openai
   # Status: CONFIGURED

2. Test connection (with INVALID credentials)
   POST /api/admin/integrations/openai/test
   # Response: { ok: false, message: "OpenAI rejected..." }
   
   GET /api/admin/integrations/openai
   # Status should now be: FAILED
   # lastTestOk should be: false
   # lastTestMessage should show error
   # lastTestedAt should be: set
```

#### Transition 4: CONNECTED → CONFIGURED (on credential change)
```
1. Start in CONNECTED state
   GET /api/admin/integrations/openai
   # Status: CONNECTED, lastTestOk: true

2. Update credentials
   POST /api/admin/integrations/openai
   Body: { secrets: { apiKey: "sk-new..." } }
   
   GET /api/admin/integrations/openai
   # Status should be: CONFIGURED (reverted!)
   # lastTestOk should be: null (cleared)
   # lastTestedAt should be: null (cleared)
   # Reason: credentials changed, must re-test
```

#### Transition 5: FAILED → CONFIGURED (after fixing credentials)
```
1. Start in FAILED state
   GET /api/admin/integrations/openai
   # Status: FAILED, lastTestOk: false

2. Update credentials (fix the invalid key)
   POST /api/admin/integrations/openai
   Body: { secrets: { apiKey: "sk-valid..." } }
   
   GET /api/admin/integrations/openai
   # Status should be: CONFIGURED
   # lastTestOk should be: null (cleared)
   # lastTestedAt should be: null (cleared)
```

---

### Phase 3: UI Rendering Testing

#### Integration Card Display

**NOT_CONFIGURED State:**
```
OpenAI
Status Badge: ⚪ NOT_CONFIGURED
Health: No credentials entered
Secrets: 0 / 1
Last Tested: —
[Configure] [Test Connection (disabled)]
```

**CONFIGURED State:**
```
OpenAI
Status Badge: 🔵 CONFIGURED
Health: Not yet tested
Secrets: 1 / 1
Last Tested: —
[Configure] [Test Connection]
```

**CONNECTED State:**
```
OpenAI
Status Badge: 🟢 CONNECTED
Health: Healthy
Secrets: 1 / 1
Last Tested: 19 Jul 2026, 18:22
[Configure] [Test Connection] [View Logs]
```

**FAILED State:**
```
OpenAI
Status Badge: 🔴 FAILED
Health: Authentication Failed
Secrets: 1 / 1
Last Tested: 19 Jul 2026, 17:05

❌ Error: OpenAI rejected this API key (401).
Confirm it is a valid key from platform.openai.com

[Configure] [Test Connection] [View Logs]
```

**TESTING State:**
```
OpenAI
Status Badge: ⏳ TESTING...
(spinner)
Secrets: 1 / 1
[Configure (disabled)] [Cancel Test]
```

---

### Phase 4: Regression Testing

#### All Integrations Must Pass

- [ ] OpenAI: real API call to models endpoint
- [ ] Razorpay: real authentication to payment API
- [ ] PhonePe: merchant validation API
- [ ] SMTP: real connection + auth
- [ ] TripJack: login flow + API call
- [ ] Cloudinary: resource endpoint validation
- [ ] reCAPTCHA: site/secret pair validation
- [ ] Sembark: health endpoint check
- [ ] Ferry: generic operator health check

#### No False Positives

- [ ] CONNECTED status never shown with invalid credentials
- [ ] CONNECTED status never shown without testing
- [ ] FAILED status shows actual error message (not generic)
- [ ] NOT_CONFIGURED shown when any required secret missing

#### Status Transitions Work Correctly

- [ ] NOT_CONFIGURED → CONFIGURED (save credentials)
- [ ] CONFIGURED → CONNECTED (test success)
- [ ] CONFIGURED → FAILED (test failure)
- [ ] CONNECTED → CONFIGURED (credentials changed)
- [ ] FAILED → CONFIGURED (credentials fixed)
- [ ] Any → DISABLED (admin disables)
- [ ] DISABLED → CONFIGURED (admin re-enables)

---

## TEST CHECKLIST

### Before Launch

- [ ] All 9 providers tested with valid credentials
- [ ] All 9 providers tested with invalid credentials
- [ ] All 9 providers tested with missing credentials
- [ ] Status transitions verified end-to-end
- [ ] UI displays correct badges & messages
- [ ] Error messages are specific (not generic)
- [ ] `lastTestedAt` timestamp accurate
- [ ] `lastTestMessage` shows actual error
- [ ] `lastTestOk` boolean correct
- [ ] No false "CONNECTED" status
- [ ] No generic error messages
- [ ] Test button disabled during TESTING state
- [ ] Configure button disabled during TESTING state
- [ ] All existing admin features still work
- [ ] No database schema changes needed
- [ ] All API endpoints respond correctly

### Test Credentials Needed

**OpenAI:**
- Valid: `sk-proj-xxxxx` (real API key)
- Invalid: `invalid-key` or `sk-wrong`

**Razorpay:**
- Valid: Test account credentials
- Invalid: Wrong secret key

**SMTP:**
- Valid: Gmail app password or real SMTP server
- Invalid: Wrong password

**TripJack:**
- Valid: Test API credentials from TripJack
- Invalid: Wrong token

**PhonePe, Cloudinary, reCAPTCHA, Sembark, Ferry:**
- Test with real or mock credentials

---

## Running Tests

### Unit Tests
```bash
npm run test src/modules/integrations/
```

### Manual Testing
```bash
# Start backend
npm run dev

# Test each provider endpoint
curl -X POST http://localhost:3000/api/admin/integrations/openai/test \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Frontend Testing
```bash
# Start both servers
npm run dev  # backend (3000)
npm run dev -p 3001  # frontend (3001)

# Navigate to Admin > Integrations
# Verify card displays correct status badge
# Test credential update flow
# Test connection test flow
```

---

## Success Criteria

✅ **PASS if:**
- Zero "CONNECTED" status with invalid credentials
- Zero "CONNECTED" status without testing
- All 9 providers perform real API validation
- Status transitions match the diagram
- UI displays accurate information
- Error messages are specific and helpful
- Timestamps are accurate
- No false positives

❌ **FAIL if:**
- Any provider shows CONNECTED without real validation
- Status badge doesn't update after test
- Error message is generic or missing
- Timestamp is wrong
- UI doesn't reflect actual status

---

## Launch Readiness Checklist

Before marking sprint complete:

- [ ] All unit tests pass
- [ ] All 9 providers tested with real credentials
- [ ] All status transitions verified
- [ ] UI rendering matches design
- [ ] No false positive statuses
- [ ] Error messages are specific
- [ ] Timestamps accurate
- [ ] Performance acceptable
- [ ] Database queries optimized
- [ ] No regressions in existing features
- [ ] Documentation updated
- [ ] Team trained on new status model

---

**Created:** 2026-07-19  
**Ready for Testing:** Yes  
**Estimated Testing Time:** 4-6 hours (all 9 providers, all transitions)
