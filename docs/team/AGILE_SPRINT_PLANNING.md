# 🏃 Agile Development & Sprint Planning Guide

**Last Updated**: October 26, 2025  
**Team**: Echain Development  
**Methodology**: Scrum + Kanban Hybrid

---

## Overview

This guide outlines our Agile development practices, sprint planning processes, story point estimation, and quality assurance integration for the Echain platform.

---

## 🎯 Agile Principles

### Our Core Values

1. **Working Software** > Comprehensive documentation
2. **Customer Collaboration** > Contract negotiation
3. **Responding to Change** > Following a plan
4. **Individuals and Interactions** > Processes and tools

### Team Structure

```
Product Owner
├─ Vision & prioritization
├─ Stakeholder management
└─ Backlog grooming

Scrum Master
├─ Process facilitation
├─ Remove blockers
└─ Team coaching

Development Team (5-7 members)
├─ Smart Contract Developers (2)
├─ Frontend Developers (2)
├─ Backend Developers (1)
├─ QA Engineer (1)
└─ DevOps Engineer (1)
```

---

## 📅 Sprint Structure

### Sprint Cadence

**Sprint Duration**: 2 weeks (10 working days)

```
Week 1:
├─ Monday: Sprint Planning (4h)
├─ Daily: Stand-ups (15min)
├─ Wednesday: Backlog Refinement (1h)
└─ Friday: Mid-sprint check-in (30min)

Week 2:
├─ Monday-Thursday: Development + Stand-ups
├─ Thursday: Sprint Review (2h)
├─ Friday: Sprint Retrospective (1.5h)
└─ Friday PM: Sprint Planning for next sprint
```

### Sprint Ceremonies

#### 1. Sprint Planning (4 hours)

**Part 1: What can we deliver? (2h)**
```
Attendees: Entire team
Goal: Select sprint backlog items

Agenda:
1. Review sprint goal (15min)
2. Review product backlog (30min)
3. Team capacity planning (15min)
4. Story selection & commitment (60min)

Output:
✅ Sprint goal defined
✅ Sprint backlog committed
✅ Stories estimated
```

**Part 2: How will we do the work? (2h)**
```
Agenda:
1. Break stories into tasks (60min)
2. Technical discussions (45min)
3. Identify dependencies (15min)

Output:
✅ Tasks created
✅ Assignments discussed
✅ Risks identified
```

**Example Sprint Goal**:
> "Complete Farcaster Mini App integration to enable social distribution of events"

#### 2. Daily Stand-up (15 minutes)

**Format**:
```
Each team member answers:
1. What did I complete yesterday?
2. What will I work on today?
3. What blockers do I have?

Rules:
- Time-boxed to 15 minutes
- Stand-up (literally)
- No problem-solving (take offline)
- Update Jira/Linear board
```

**Example**:
```
Alice (Frontend):
- Yesterday: Completed event creation form
- Today: Implement ticket purchase flow
- Blockers: Waiting for contract ABI from Bob

Bob (Smart Contracts):
- Yesterday: Deployed contracts to testnet
- Today: Write integration tests
- Blockers: None
```

#### 3. Backlog Refinement (1 hour, mid-sprint)

**Purpose**: Prepare for next sprint

```
Agenda:
1. Review new items (20min)
2. Estimate upcoming stories (30min)
3. Clarify acceptance criteria (10min)

Output:
✅ Next sprint items estimated
✅ Acceptance criteria clear
✅ ~2 sprints worth of ready stories
```

#### 4. Sprint Review (2 hours)

**Format**: Demo + Feedback

```
Agenda:
1. Sprint recap (10min)
2. Demo completed stories (60min)
3. Stakeholder feedback (40min)
4. Update roadmap (10min)

Attendees:
- Development team
- Product owner
- Stakeholders
- Beta users (optional)

Output:
✅ Working software demoed
✅ Feedback collected
✅ Backlog updated
```

#### 5. Sprint Retrospective (1.5 hours)

**Format**: Team reflection

```
Framework: Start-Stop-Continue

What should we START doing?
├─ New practices
├─ Tools to adopt
└─ Experiments to try

What should we STOP doing?
├─ Inefficient processes
├─ Time wasters
└─ Blockers to remove

What should we CONTINUE doing?
├─ What's working well
├─ Successful patterns
└─ Team strengths

Output:
✅ 2-3 action items for next sprint
✅ Process improvements identified
✅ Team morale assessed
```

---

## 📊 Story Points & Estimation

### Fibonacci Scale

```
Story Points: 1, 2, 3, 5, 8, 13, 21

1 point = ~2-4 hours (trivial)
2 points = ~4-8 hours (simple)
3 points = ~1 day (medium)
5 points = ~2-3 days (complex)
8 points = ~1 week (very complex)
13 points = ~2 weeks (epic - split it!)
21+ points = Too large (break down)
```

### Estimation Technique: Planning Poker

**Process**:
```
1. Product Owner reads user story
2. Team asks clarifying questions
3. Each member selects a card (1-21)
4. All reveal simultaneously
5. Discuss differences
6. Re-estimate until consensus

If estimates vary widely (>3 points):
└─ Discuss assumptions
└─ Clarify requirements
└─ Re-estimate
```

### Reference Stories (Baseline)

**1 Point (Simple)**:
```
User Story: Update button color
- Change CSS color value
- Test on all browsers
- Deploy change

Acceptance Criteria:
- Button is blue (#0052FF)
- Works on Chrome, Firefox, Safari
- Mobile responsive
```

**3 Points (Medium)**:
```
User Story: Add event search functionality
- Create search input component
- Implement filter logic
- Add search API endpoint
- Write unit tests

Acceptance Criteria:
- Users can search by event name
- Results update in real-time
- Shows "no results" message
- Tests pass with >80% coverage
```

**5 Points (Complex)**:
```
User Story: Integrate Farcaster frames
- Research Farcaster Frame API
- Create frame metadata component
- Implement frame endpoints
- Add frame validation
- Write integration tests
- Document implementation

Acceptance Criteria:
- Frame renders in Warpcast
- Buttons trigger correct actions
- Validates with official tool
- Documentation complete
```

---

## 📝 User Story Template

### Format

```markdown
## User Story

**As a** [role]
**I want** [feature]
**So that** [benefit]

### Acceptance Criteria

Given [context]
When [action]
Then [outcome]

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Technical Notes

- Implementation details
- API endpoints
- Database changes
- Dependencies

### Definition of Done

- [ ] Code complete & reviewed
- [ ] Tests written & passing
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance

### Story Points: [X]
### Priority: [High/Medium/Low]
### Sprint: [Sprint number]
```

### Example User Story

```markdown
## User Story: Buy Event Ticket with NFT

**As an** event attendee
**I want to** purchase a ticket as an NFT
**So that** I own my ticket and can resell it if needed

### Acceptance Criteria

Given I'm on an event page
When I click "Buy Ticket"
Then I should see wallet connection prompt

Given my wallet is connected
When I confirm purchase
Then ticket NFT is minted to my address

- [ ] Wallet connection works with RainbowKit
- [ ] Transaction succeeds on Base Sepolia
- [ ] NFT appears in user's wallet
- [ ] Email confirmation sent
- [ ] Event capacity decrements

### Technical Notes

- Use EventTicket.sol contract
- Address: 0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C
- Gas estimation needed
- Handle transaction failures gracefully

### Definition of Done

- [ ] Code merged to main
- [ ] Unit tests: 85%+ coverage
- [ ] Integration tests pass
- [ ] Smart contract interactions tested
- [ ] Deployed to production
- [ ] Docs updated

### Story Points: 5
### Priority: High
### Sprint: Sprint 3
```

---

## 🎯 Sprint Planning for Beta Release

### Sprint 1: Foundation (Nov 1-14, 2025)

**Sprint Goal**: Deploy core platform to production

**Stories** (40 points total):

1. **Deploy smart contracts to Base Mainnet** (8 points)
   - Migrate from Sepolia to Mainnet
   - Verify all contracts on BaseScan
   - Update frontend contract addresses

2. **Implement monitoring & alerts** (5 points)
   - Configure Sentry
   - Set up error tracking
   - Create health check endpoints

3. **Create user onboarding flow** (5 points)
   - Welcome page for new users
   - Wallet setup guide
   - First event creation tutorial

4. **Polish event creation UI** (3 points)
   - Improve form validation
   - Add image upload
   - Better error messages

5. **Add ticket purchase flow** (5 points)
   - Wallet connection
   - Transaction handling
   - Success/error states

6. **QA & bug fixes** (8 points)
   - Fix critical bugs
   - Cross-browser testing
   - Mobile responsiveness

7. **Documentation updates** (3 points)
   - User guide
   - FAQ
   - Troubleshooting

8. **Beta testing recruitment** (3 points)
   - Create beta signup form
   - Email campaign
   - Social media outreach

**Velocity Target**: 40 points  
**Team Capacity**: 45 points (buffer for unknowns)

---

### Sprint 2: Social Integration (Nov 15-28, 2025)

**Sprint Goal**: Enable Farcaster distribution

**Stories** (38 points total):

1. **Farcaster Frame metadata** (5 points)
   - Add frame tags to event pages
   - Generate OG images
   - Test in Warpcast

2. **Minikit integration** (8 points)
   - Install Minikit SDK
   - Create manifest
   - Test wallet integration

3. **Social sharing features** (3 points)
   - Share to Farcaster button
   - Twitter/X integration
   - Copy link functionality

4. **Event discovery page** (5 points)
   - List all events
   - Filtering & sorting
   - Search functionality

5. **Attendee dashboard** (5 points)
   - View purchased tickets
   - View POAPs
   - Transaction history

6. **Analytics tracking** (3 points)
   - Google Analytics
   - Custom events
   - Conversion tracking

7. **Email notifications** (5 points)
   - Purchase confirmations
   - Event reminders
   - POAP claim notifications

8. **QA & bug fixes** (4 points)

**Velocity Target**: 38 points

---

### Sprint 3: Marketplace & Monetization (Nov 29-Dec 12, 2025)

**Sprint Goal**: Enable secondary ticket sales

**Stories** (36 points total):

1. **Marketplace listing UI** (5 points)
   - List ticket for sale
   - Set price
   - Delist functionality

2. **Marketplace browse UI** (5 points)
   - View available tickets
   - Filter by event
   - Purchase flow

3. **Royalty distribution** (5 points)
   - Calculate organizer royalties
   - Handle platform fees
   - Transaction receipts

4. **POAP claiming** (3 points)
   - Check-in mechanism
   - Claim POAP button
   - Verify attendance

5. **Organizer dashboard** (8 points)
   - View events
   - See ticket sales
   - Withdraw funds
   - Analytics

6. **Mobile optimization** (5 points)
   - Responsive design
   - Touch interactions
   - Performance tuning

7. **QA & bug fixes** (5 points)

**Velocity Target**: 36 points

---

### Sprint 4: Polish & Launch Prep (Dec 13-26, 2025)

**Sprint Goal**: Production-ready platform

**Stories** (32 points total):

1. **Performance optimization** (5 points)
   - Reduce bundle size
   - Image optimization
   - Lazy loading

2. **SEO optimization** (3 points)
   - Meta tags
   - Sitemap
   - robots.txt

3. **Accessibility audit** (3 points)
   - WCAG 2.1 AA compliance
   - Screen reader testing
   - Keyboard navigation

4. **Security hardening** (5 points)
   - Rate limiting
   - CSRF protection
   - Input sanitization

5. **Load testing** (3 points)
   - Stress test API
   - Database optimization
   - CDN configuration

6. **Documentation final review** (3 points)
   - User guide complete
   - API docs updated
   - Deployment guide

7. **Beta user feedback** (5 points)
   - Collect feedback
   - Prioritize improvements
   - Quick wins

8. **Launch marketing** (5 points)
   - Product Hunt submission
   - Press release
   - Social media campaign

**Velocity Target**: 32 points

---

## 📈 Velocity Tracking

### Sprint Metrics

**Planned vs Actual**:
```
Sprint 1:
├─ Planned: 40 points
├─ Completed: 35 points
└─ Velocity: 87.5%

Sprint 2:
├─ Planned: 38 points
├─ Completed: 38 points
└─ Velocity: 100%

Sprint 3:
├─ Planned: 36 points
├─ Completed: 40 points
└─ Velocity: 111%

Average Velocity: ~38 points/sprint
```

### Burndown Chart

```
Points Remaining
 │
40│●
  │  ●
30│    ●
  │      ●
20│        ●
  │          ●
10│            ●
  │              ●
 0│                ●
  └─────────────────────
   D1 D2 D3 D4 D5 ... D10

Ideal: ● (straight line)
Actual: ● (adjust based on reality)
```

---

## ✅ Quality Assurance Integration

### Definition of Done (DoD)

**Story-Level DoD**:
```
- [ ] Code complete
- [ ] Code review approved (2+ reviewers)
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests pass
- [ ] UI tests pass (if applicable)
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] PO acceptance
```

**Sprint-Level DoD**:
```
- [ ] All stories meet story-level DoD
- [ ] No critical/high bugs open
- [ ] Sprint goal achieved
- [ ] Demo completed
- [ ] Stakeholder approval
- [ ] Deployed to production (or prod-ready)
```

### Testing Strategy

**Test Pyramid**:
```
        /\
       /UI\ (10% - E2E tests)
      /────\
     /      \
    /  API  \ (30% - Integration tests)
   /────────\
  /          \
 /    Unit    \ (60% - Unit tests)
/──────────────\
```

**Test Coverage Requirements**:
- Smart Contracts: 85%+
- Backend API: 80%+
- Frontend Components: 70%+
- E2E Critical Paths: 100%

### QA Tasks per Sprint

**Daily**:
- Automated test runs
- Bug triage
- Smoke testing

**Per Story**:
- Functional testing
- Regression testing
- Performance testing
- Security testing

**Per Sprint**:
- Exploratory testing
- Cross-browser testing
- Mobile testing
- Accessibility testing

---

## 🚀 Continuous Integration/Deployment

### CI/CD Pipeline

```
Code Commit (GitHub)
    ↓
Automated Tests (GitHub Actions)
├─ Linting (ESLint, Solhint)
├─ Type checking (TypeScript)
├─ Unit tests (Jest, Foundry)
├─ Integration tests
└─ Security scan (Slither)
    ↓
Build (Next.js, Foundry)
    ↓
Deploy to Staging (Vercel)
    ↓
Smoke Tests
    ↓
Manual QA Approval
    ↓
Deploy to Production (Vercel)
    ↓
Monitor (Sentry, Analytics)
```

### Deployment Frequency

**Target**: Deploy to production at end of each sprint (every 2 weeks)

**Actual**:
- Staging: Multiple times per day
- Production: End of sprint + hotfixes as needed

---

## 📊 Metrics & KPIs

### Development Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Sprint Velocity | 35-40 points | TBD |
| Sprint Goal Success | >90% | TBD |
| Code Review Time | <24h | TBD |
| Build Time | <10min | TBD |
| Test Coverage | >80% | 85% |
| Bug Escape Rate | <5% | TBD |
| Deployment Frequency | Bi-weekly | TBD |
| Mean Time to Recovery | <4h | TBD |

### Product Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| User Satisfaction | >4.5/5 | TBD |
| Feature Adoption | >60% | TBD |
| Bug Reports | <10/sprint | TBD |
| Performance (LCP) | <2.5s | TBD |
| Uptime | >99.9% | TBD |

---

## 🔄 Continuous Improvement

### Retrospective Action Items

**Sprint 1 Actions**:
1. Add automated deployment to reduce manual work
2. Improve test coverage for smart contracts
3. Better estimation (stories were over-estimated)

**Sprint 2 Actions**:
1. Earlier involvement of QA in story definition
2. More frequent pair programming sessions
3. Dedicated time for technical debt

### Process Improvements

**Implemented**:
- ✅ Automated CI/CD pipeline
- ✅ Code review checklist
- ✅ Sprint planning template

**Planned**:
- 📅 Automated dependency updates
- 📅 Performance monitoring dashboard
- 📅 Incident response playbook

---

## 🛠️ Tools & Tech Stack

### Project Management

**Primary**: Linear (https://linear.app/)
- Sprint planning
- Backlog management
- Issue tracking

**Alternative**: Jira, Trello

### Communication

- **Slack**: Daily communication
- **Discord**: Community engagement
- **Google Meet**: Ceremonies & meetings

### Documentation

- **Notion**: Team wiki
- **GitHub**: Code documentation
- **Confluence**: (alternative)

### Development

- **GitHub**: Version control
- **GitHub Actions**: CI/CD
- **Vercel**: Deployment
- **Sentry**: Error tracking

---

## 📚 Resources

### Agile Resources

- **Scrum Guide**: https://scrumguides.org/
- **Agile Manifesto**: https://agilemanifesto.org/
- **Planning Poker**: https://www.planningpoker.com/

### Templates

- Sprint planning doc (Notion)
- Retrospective board (Miro)
- User story template (Linear)

---

## 📝 Checklist for Sprint Success

### Sprint Planning
- [ ] Sprint goal defined
- [ ] Stories estimated
- [ ] Team capacity calculated
- [ ] Dependencies identified

### During Sprint
- [ ] Daily stand-ups held
- [ ] Blockers removed quickly
- [ ] WIP limits respected
- [ ] Tests written with code

### Sprint End
- [ ] All stories demoed
- [ ] Retrospective completed
- [ ] Action items assigned
- [ ] Next sprint planned

---

**Team Velocity**: ~38 points per sprint  
**Sprint Duration**: 2 weeks  
**Team Size**: 5-7 members  
**Next Sprint Start**: November 1, 2025  

**Last Updated**: October 26, 2025  
**Next Review**: End of Sprint 1

