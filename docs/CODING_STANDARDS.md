# Coding Standards

## 1. General Principles

- Always write production-ready code.
- Never use placeholder implementations.
- Never leave TODOs unless approved.
- Reuse existing components before creating new ones.
- Follow the existing architecture.

---

## 2. TypeScript

- Strict typing only.
- No use of `any`.
- Use interfaces or types for all DTOs.
- Validate API input before processing.

---

## 3. API Standards

Every API must:

- Validate request
- Return consistent responses
- Handle errors
- Log failures
- Return correct HTTP status codes

Standard Response:

{
  success: true,
  data: {},
  message: ""
}

---

## 4. Database

Never:

- Hardcode IDs
- Bypass repositories
- Write raw SQL unless necessary

Always:

- Use Prisma
- Use transactions where required
- Handle rollback

---

## 5. Components

Components should:

- Be reusable
- Have a single responsibility
- Receive typed props
- Avoid duplicated logic

---

## 6. Hooks

Business logic belongs inside hooks.

UI components should stay lightweight.

---

## 7. Error Handling

Every API must:

- Catch exceptions
- Log errors
- Return meaningful messages

Never expose stack traces.

---

## 8. Logging

Important actions must create:

- Audit Log
- System Log

---

## 9. Security

Never:

- Store plaintext passwords
- Trust frontend validation
- Expose secrets

Always:

- Validate JWT
- Check permissions
- Sanitize inputs

---

## 10. Performance

- Lazy load large modules
- Paginate large tables
- Debounce search
- Avoid duplicate API calls

---

## 11. Code Review Checklist

Before completion:

✓ TypeScript passes

✓ Build passes

✓ No lint errors

✓ No console errors

✓ No dead code

✓ API tested

✓ UI tested