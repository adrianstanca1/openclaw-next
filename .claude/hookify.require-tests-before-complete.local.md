---
action: warn
enabled: true
event: taskupdate
name: require-tests-before-complete
pattern: status.*completed
---

✅ **Task Completion Check**

You're marking a task as **completed**. Before finalizing:

**Have you run tests?**
```bash
npm run build    # Check TypeScript compilation
npm test         # Run test suite (if available)
```

**Verification Checklist:**
- [ ] TypeScript compiles without errors
- [ ] All related tests pass
- [ ] Manual verification in dev mode (if applicable)
- [ ] No console errors in browser

**Quick test now?**
Ask me to "run tests" or "verify build" before marking complete.

Only mark complete when code is verified working!
