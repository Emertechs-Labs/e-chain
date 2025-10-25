# Issues Log — Peter (Smart Contract Dev)

| ID | Title | Severity | Status | Notes |
|----|-------|----------|--------|-------|
| SC-001 | Treasury timelock bypass via `setTreasury` | High | Open | Requires deprecation or multi-sig guard as per audit. |
| SC-002 | Platform fee transfer uses `transfer` | Medium | Open | Switch to `call` to avoid 2300 gas limit. |
| SC-003 | Early-bird reward gaming vector | Medium | Open | Need anti-sybil protections and tests. |
| SC-004 | Organizer self-verification lacks checks | Low | Open | Define KYC/reputation workflow. |
