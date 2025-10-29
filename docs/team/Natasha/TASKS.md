# Natasha's Tasks

## Current Assignment: Replace Static Data with Dynamic Data (24-hour deadline)

**Assigned:** Today
**Deadline:** 24 hours from assignment
**Priority:** High
**Status:** In Progress

### Task Overview
The codebase currently contains several areas with static/hardcoded data that should be made dynamic for better scalability and maintainability. This task involves identifying and replacing these static elements with dynamic data fetching and proper fallbacks.

### Areas Requiring Dynamic Data Implementation

#### 1. Venue Information (`frontend/app/hooks/useTickets.ts`)
**Issue:** Hardcoded "TBA" fallback when venue metadata cannot be fetched
**Current Code:**
```typescript
let venue = "TBA";
try {
  if (event.metadataURI) {
    const metadata = await fetchMetadataFromIPFS(event.metadataURI);
    const defaultMetadata = generateDefaultMetadata(event);
    venue = metadata?.venue || defaultMetadata.venue || "TBA";
  }
} catch (metadataError) {
  console.warn(`Failed to fetch venue for event ${event.id}:`, metadataError);
}
```
**Required Changes:**
- Implement proper fallback hierarchy for venue data
- Add database/API fallback when IPFS metadata is unavailable
- Consider venue validation and standardization

#### 2. Ticket Types (`frontend/app/hooks/useTickets.ts`, `useTransactions.ts`, `useTransactionsDirect.ts`)
**Issue:** Hardcoded "General Admission" ticket type
**Current Code:**
```typescript
ticketType: "General Admission",
```
**Required Changes:**
- Fetch actual ticket types from event metadata
- Support multiple ticket tiers (VIP, Early Bird, General Admission, etc.)
- Add ticket type validation and proper fallbacks

#### 3. Transaction Hashes (`frontend/app/my-tickets/page.tsx`)
**Issue:** Placeholder transaction hash in verification modal
**Current Code:**
```typescript
href={getVerificationUrl('placeholder-tx-hash')} // In production, use actual transaction hash
```
**Required Changes:**
- Implement proper transaction hash retrieval from ticket data
- Add transaction hash validation
- Ensure QR code generation uses real transaction data

#### 4. Mock Event Data (`frontend/lib/mockEvents.ts`)
**Issue:** Static mock events that should be replaced with dynamic data
**Current Code:** Hardcoded event objects with static data
**Required Changes:**
- Replace mock data with dynamic event fetching
- Implement proper event data structure validation
- Add loading states and error handling for dynamic data

#### 5. Default Metadata Generation (`frontend/lib/metadata.ts`)
**Issue:** Static fallback values in metadata generation
**Required Changes:**
- Implement dynamic metadata generation based on event data
- Add proper validation for metadata fields
- Support customizable metadata templates

### Implementation Requirements

#### Technical Specifications
- **Data Sources:** IPFS metadata, database API, smart contract data
- **Fallback Strategy:** IPFS → Database API → Smart Contract → Default Values
- **Error Handling:** Graceful degradation with user-friendly messages
- **Performance:** Implement caching and lazy loading where appropriate
- **Type Safety:** Maintain TypeScript strict mode compliance

#### Code Quality Standards
- Add comprehensive error handling and logging
- Implement proper loading states for async operations
- Add unit tests for dynamic data fetching functions
- Ensure backward compatibility with existing data structures
- Follow existing code patterns and conventions

### Testing Requirements
- Unit tests for all dynamic data fetching functions
- Integration tests for metadata fetching and fallbacks
- UI tests to ensure proper loading states and error handling
- Cross-browser testing for dynamic content rendering

### Deliverables
1. **Modified Files:** All files listed above with dynamic data implementation
2. **New Functions:** Dynamic data fetching utilities and helpers
3. **Tests:** Unit and integration tests for new functionality
4. **Documentation:** Updated code comments and README sections explaining dynamic data flow

### Success Criteria
- [ ] No hardcoded "TBA", "General Admission", or placeholder values in production
- [ ] Proper fallback chains implemented for all data types
- [ ] All dynamic data fetching includes error handling and loading states
- [ ] Unit tests pass with >90% coverage for new functions
- [ ] No breaking changes to existing functionality
- [ ] Performance impact minimal (<5% increase in load times)

### Notes
- Coordinate with backend team for any required API changes
- Test thoroughly on Base Sepolia testnet before mainnet deployment
- Consider implementing feature flags for gradual rollout
- Document any new environment variables or configuration needed

---

*This task was assigned based on a comprehensive codebase scan identifying static data patterns that should be made dynamic for better scalability and user experience.*