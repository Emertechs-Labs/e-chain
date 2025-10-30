# Email-Based Self-Custodial Wallet Integration Plan

## Executive Summary

This document outlines a comprehensive plan to enhance the `@polymathuniversata/echain-wallet` package with email-based authentication and account abstraction, allowing users to:

1. Create self-custodial wallets using email (no seed phrases required)
2. Bind existing wallets to email accounts for backup/recovery
3. Switch between multiple wallets while maintaining the same email identity
4. Maintain full compatibility with existing Farcaster, Base wallets, and smart wallets

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technical Approach](#technical-approach)
3. [Implementation Phases](#implementation-phases)
4. [Security Considerations](#security-considerations)
5. [User Flows](#user-flows)
6. [Integration Points](#integration-points)
7. [Database Schema](#database-schema)
8. [API Specifications](#api-specifications)
9. [Testing Strategy](#testing-strategy)
10. [Migration & Rollout](#migration--rollout)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Email Wallet │  │ Web3 Wallet  │  │ Smart Wallet │     │
│  │   (New)      │  │  (Existing)  │  │  (Existing)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified Account Abstraction Layer              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Account Manager (Email ↔ Wallet Binding)           │   │
│  │  - Email Authentication                             │   │
│  │  - Wallet Binding/Unbinding                         │   │
│  │  - Multi-Wallet Support                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Email Auth   │  │ Key Mgmt     │  │ Smart Contract│     │
│  │ Service      │  │ Service      │  │ Factory       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Blockchain Layer (Base)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Account      │  │ Guardian     │  │ Recovery     │     │
│  │ Abstraction  │  │ Module       │  │ Module       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. **Email Authentication Service**
- Magic Link / Passkey-based authentication
- Email verification and validation
- Session management
- Rate limiting and security controls

#### 2. **Key Management Service**
- Threshold Signature Scheme (TSS) or MPC-based key sharding
- Secure key generation and storage
- Key recovery mechanisms
- Hardware Security Module (HSM) integration

#### 3. **Account Abstraction Layer**
- Email → Smart Wallet mapping
- Multi-wallet binding per email
- Wallet switching logic
- Account metadata management

#### 4. **Smart Contract Infrastructure**
- ERC-4337 Account Abstraction contracts
- Guardian-based recovery system
- Modular account architecture
- Gas sponsorship capabilities

---

## Technical Approach

### 1. Email Wallet Architecture

We'll implement a **hybrid approach** combining:

#### Option A: Magic-Based Authentication (Recommended)
- **Provider**: Magic.link or similar (Web3Auth, Privy)
- **Pros**: 
  - Production-ready infrastructure
  - Built-in security best practices
  - Minimal backend complexity
  - Supports passkeys and social logins
- **Cons**: 
  - Third-party dependency
  - Potential vendor lock-in

#### Option B: Self-Hosted Solution
- **Stack**: Shamir Secret Sharing + Threshold Signatures
- **Components**:
  - User holds 1/3 key share (device)
  - Email recovery holds 1/3 key share (encrypted)
  - Service holds 1/3 key share (HSM)
- **Pros**: 
  - Full control and customization
  - No third-party dependencies
  - Privacy-preserving
- **Cons**: 
  - Complex implementation
  - Higher security responsibility
  - Requires significant infrastructure

**Recommendation**: Start with **Option A (Magic)** for MVP, plan migration path to Option B for full decentralization.

### 2. Account Abstraction Implementation

#### Smart Wallet Factory Pattern

```solidity
// Simplified concept
contract EmailAccountFactory {
    mapping(bytes32 => address) public emailToWallet;
    mapping(address => EmailAccount) public accounts;
    
    struct EmailAccount {
        bytes32 emailHash;        // Hash of email for privacy
        address smartWallet;      // Primary smart wallet
        address[] boundWallets;   // EOAs bound to this email
        uint256 createdAt;
        bool isActive;
    }
    
    function createEmailAccount(
        bytes32 emailHash,
        address initialWallet
    ) external returns (address smartWallet);
    
    function bindWallet(
        bytes32 emailHash,
        address newWallet,
        bytes calldata signature
    ) external;
    
    function switchPrimaryWallet(
        bytes32 emailHash,
        address newPrimary
    ) external;
}
```

### 3. Multi-Wallet Binding System

#### Architecture Patterns

1. **Primary Wallet Model**
   - One email → One primary smart wallet
   - Multiple EOAs can be bound as "authorized signers"
   - Transactions executed through the smart wallet

2. **Wallet Switching**
   - User can designate any bound wallet as "active"
   - Frontend routes transactions through selected wallet
   - On-chain identity remains consistent (smart wallet)

3. **Recovery Flow**
   - Email verification → Access to bound wallets
   - Can add/remove bound wallets after email verification
   - Guardian-based social recovery as backup

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

#### Deliverables:
1. **Research & Technology Selection**
   - Evaluate Magic.link, Web3Auth, Privy, Turnkey
   - Choose email authentication provider
   - Define smart contract architecture
   - Select account abstraction framework (ZeroDev, Biconomy, etc.)

2. **Smart Contract Development**
   - EmailAccountFactory contract
   - Account implementation (ERC-4337)
   - Guardian module
   - Recovery module
   - Comprehensive test suite

3. **Backend Infrastructure**
   - Database schema design
   - Email service API endpoints
   - Authentication middleware
   - Key management service setup

#### Files to Create:
- `contracts/account-abstraction/EmailAccountFactory.sol`
- `contracts/account-abstraction/EmailAccount.sol`
- `contracts/modules/GuardianModule.sol`
- `contracts/modules/RecoveryModule.sol`
- `backend/services/email-auth.service.ts`
- `backend/services/key-management.service.ts`
- `backend/models/email-account.model.ts`

### Phase 2: Core Email Wallet Features (Weeks 4-6)

#### Deliverables:
1. **Email Authentication Flow**
   - Magic link generation and verification
   - Passkey registration and authentication
   - Session management
   - Security headers and CSRF protection

2. **Wallet Creation & Management**
   - Email-based wallet creation UI
   - Smart wallet deployment
   - Private key management (if self-hosted)
   - Wallet metadata storage

3. **Frontend Integration**
   - New `useEmailWallet` hook
   - `EmailWalletProvider` component
   - Login/signup flows
   - Email verification UI

#### Files to Create:
- `packages/wallet/src/hooks/useEmailWallet.ts`
- `packages/wallet/src/providers/EmailWalletProvider.tsx`
- `packages/wallet/src/components/EmailLogin.tsx`
- `packages/wallet/src/components/EmailSignup.tsx`
- `packages/wallet/src/lib/email-auth-manager.ts`
- `packages/wallet/src/types/email-account.types.ts`

### Phase 3: Wallet Binding & Management (Weeks 7-9)

#### Deliverables:
1. **Wallet Binding System**
   - Bind existing EOA to email account
   - Multi-signature verification
   - Wallet ownership proof
   - Unbind wallet functionality

2. **Wallet Switching**
   - Switch between bound wallets
   - Transaction routing logic
   - Active wallet indicator UI
   - Wallet management dashboard

3. **Recovery Mechanisms**
   - Email-based recovery flow
   - Guardian setup and management
   - Social recovery implementation
   - Recovery simulation and testing

#### Files to Create:
- `packages/wallet/src/hooks/useWalletBinding.ts`
- `packages/wallet/src/components/WalletBindingManager.tsx`
- `packages/wallet/src/components/WalletSwitcher.tsx`
- `packages/wallet/src/lib/wallet-binding-manager.ts`
- `packages/wallet/src/lib/recovery-manager.ts`

### Phase 4: Integration & Compatibility (Weeks 10-11)

#### Deliverables:
1. **Farcaster Integration**
   - Maintain existing Farcaster authentication
   - Email-Farcaster account linking
   - Unified profile management
   - Cross-platform identity sync

2. **Base Wallet Compatibility**
   - Ensure all existing Base wallet features work
   - Email account → Base wallet binding
   - Transaction compatibility testing
   - Gas optimization

3. **Smart Wallet Enhancement**
   - Email-controlled smart wallets
   - Batch transactions
   - Gas sponsorship integration
   - Session keys for dApps

#### Files to Update:
- `packages/wallet/src/lib/wagmi.ts` (unified config)
- `packages/wallet/src/hooks/useBaseWallet.ts` (email integration)
- `packages/wallet/src/components/UnifiedConnectButton.tsx` (email option)
- `frontend/lib/farcaster-integration.ts` (email linking)

### Phase 5: Security & Testing (Weeks 12-13)

#### Deliverables:
1. **Security Audit**
   - Smart contract audit (external firm)
   - Penetration testing
   - Code review
   - Security best practices documentation

2. **Comprehensive Testing**
   - Unit tests (100% coverage target)
   - Integration tests
   - E2E tests
   - Load testing
   - Recovery flow testing

3. **Documentation**
   - User guides
   - Developer documentation
   - API reference
   - Security guidelines
   - Migration guides

### Phase 6: Beta Launch & Refinement (Weeks 14-16)

#### Deliverables:
1. **Beta Release**
   - Testnet deployment (Base Sepolia)
   - Limited beta user group
   - Feature flag system
   - Analytics and monitoring

2. **User Feedback Integration**
   - UX improvements
   - Bug fixes
   - Performance optimization
   - Documentation updates

3. **Mainnet Preparation**
   - Final security review
   - Gas optimization
   - Deployment scripts
   - Monitoring and alerting setup

---

## Security Considerations

### 1. Key Management Security

#### For Self-Hosted Solution:
```
User Key Share (1/3)
├── Stored: Browser local storage (encrypted)
├── Backup: User's device (encrypted export)
└── Recovery: Email-encrypted share

Service Key Share (1/3)
├── Stored: HSM (Hardware Security Module)
├── Backup: Multi-region HSM replication
└── Access: Rate-limited API with MFA

Email Recovery Share (1/3)
├── Stored: Encrypted with email-derived key
├── Backup: Distributed storage (IPFS/Arweave)
└── Access: Email verification + time lock
```

#### For Magic-Based Solution:
- Delegated key management to Magic infrastructure
- Non-custodial architecture maintained
- User retains ultimate control
- Regular security audits of integration

### 2. Email Security

- **Email Verification**: Required for all sensitive operations
- **Rate Limiting**: Prevent brute force attacks
- **Magic Link Expiry**: Short-lived tokens (15 minutes)
- **Session Management**: Secure, HTTP-only cookies
- **CSRF Protection**: Token-based protection
- **Email Privacy**: Hash emails on-chain (SHA-256)

### 3. Smart Contract Security

- **Access Control**: Role-based permissions (OpenZeppelin)
- **Upgradeability**: Proxy pattern with time-locked upgrades
- **Guardian System**: Multi-signature recovery
- **Rate Limiting**: Daily transaction limits (configurable)
- **Emergency Pause**: Circuit breaker for critical issues

### 4. Recovery Security

- **Multi-Factor Recovery**:
  - Email verification (factor 1)
  - Guardian approval (factor 2) - optional
  - Time delay (24-48 hours) for high-value changes

- **Social Recovery**:
  - 3-5 guardians (user-selected)
  - Threshold: 2-3 guardians required
  - Guardian verification via email/wallet

### 5. Privacy Considerations

- **On-Chain Privacy**:
  - Store email hashes, not raw emails
  - Use zkProofs for sensitive operations
  - Minimal metadata on-chain

- **Off-Chain Privacy**:
  - Encrypted database fields
  - GDPR compliance
  - Right to deletion support
  - Data minimization principle

---

## User Flows

### Flow 1: New User - Email Wallet Creation

```
1. User enters email address
   ↓
2. System sends magic link
   ↓
3. User clicks link (email verification)
   ↓
4. System generates key shares (MPC/TSS)
   ↓
5. Smart wallet deployed on Base
   ↓
6. User completes profile
   ↓
7. User can transact immediately
```

**UI Components:**
- Email input form
- Email sent confirmation screen
- Magic link landing page
- Wallet creation loading state
- Success screen with wallet address
- Optional: Guardian setup wizard

### Flow 2: Existing Wallet User - Bind Email

```
1. User connects existing wallet (MetaMask, etc.)
   ↓
2. User navigates to "Add Email Backup"
   ↓
3. User enters email address
   ↓
4. System sends verification link
   ↓
5. User clicks link
   ↓
6. User signs message with wallet (proof of ownership)
   ↓
7. Smart contract records binding
   ↓
8. Email ↔ Wallet binding complete
```

**UI Components:**
- Email binding form
- Wallet signature prompt
- Transaction confirmation
- Binding success notification
- Wallet management dashboard

### Flow 3: Multi-Wallet Management

```
1. User logs in with email
   ↓
2. System shows all bound wallets
   ↓
3. User selects "Add Another Wallet"
   ↓
4. User connects new wallet
   ↓
5. Signs verification message
   ↓
6. New wallet bound to email account
   ↓
7. User can switch between wallets anytime
```

**UI Components:**
- Wallet list view
- Add wallet button
- Wallet selector dropdown
- Active wallet indicator
- Remove wallet confirmation

### Flow 4: Account Recovery

```
1. User lost access to wallet
   ↓
2. User clicks "Recover Account"
   ↓
3. User enters email
   ↓
4. System sends recovery link
   ↓
5. User verifies email
   ↓
6. User either:
   a) Access existing bound wallets, OR
   b) Generate new wallet (if all wallets lost)
   ↓
7. Optional: Guardian approval (if configured)
   ↓
8. Access restored / New wallet created
```

**UI Components:**
- Recovery initiation screen
- Email verification
- Recovery options screen
- Guardian approval UI
- Recovery success screen

### Flow 5: Hybrid User - Email + Farcaster

```
1. User has Farcaster account
   ↓
2. User logs in via Farcaster
   ↓
3. System prompts: "Add email for backup?"
   ↓
4. User adds email
   ↓
5. Email verification
   ↓
6. Farcaster wallet bound to email
   ↓
7. User can login via:
   - Farcaster (primary)
   - Email (backup)
   - Direct wallet connection
```

---

## Integration Points

### 1. Existing Wallet Package Integration

#### Updated `useBaseWallet` Hook

```typescript
interface WalletConfig {
  // Existing
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  
  // New: Email wallet support
  enableEmailAuth?: boolean;
  emailProvider?: 'magic' | 'web3auth' | 'privy';
  emailConfig?: {
    apiKey: string;
    network: 'base' | 'base-sepolia';
    redirectUri?: string;
  };
  
  // New: Multi-wallet support
  enableMultiWallet?: boolean;
  primaryWalletStrategy?: 'email' | 'eoa' | 'smart';
}

interface BaseWalletState {
  // Existing
  isConnected: boolean;
  address: string | undefined;
  
  // New: Email account
  emailAccount?: {
    email: string;
    emailHash: string;
    smartWallet: string;
    boundWallets: string[];
    activeBoundWallet?: string;
  };
  
  // New: Account type
  accountType: 'eoa' | 'email' | 'smart' | 'hybrid';
  
  // New: Multi-wallet
  availableWallets?: WalletInfo[];
}
```

### 2. Unified Connect Button Enhancement

```typescript
<UnifiedConnectButton
  // Existing props
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  
  // New props
  enableEmailLogin={true}
  enableWalletBinding={true}
  showWalletSwitcher={true}
  emailProvider="magic"
  
  // Customization
  customEmailUI={<CustomEmailLogin />}
  walletPriority={['email', 'metamask', 'walletconnect']}
/>
```

### 3. Farcaster Integration

```typescript
// Link Farcaster account to email
const linkFarcasterToEmail = async (
  fid: number,
  email: string,
  verification: EmailVerification
) => {
  // Verify email ownership
  await verifyEmail(verification);
  
  // Get Farcaster signer wallet
  const signerAddress = await getFarcasterSignerAddress(fid);
  
  // Bind wallet to email account
  await bindWalletToEmail(email, signerAddress);
  
  // Store Farcaster metadata
  await linkFarcasterProfile(email, fid);
};
```

### 4. Smart Wallet Integration

```typescript
// Email-controlled smart wallet
const createEmailSmartWallet = async (
  email: string,
  emailVerification: EmailVerification
) => {
  // Generate key shares via email provider
  const keyShares = await emailProvider.generateKeys(email);
  
  // Deploy smart wallet contract
  const smartWallet = await deploySmartWallet({
    owner: keyShares.publicKey,
    guardians: [], // Optional
    modules: ['SessionKey', 'Recovery']
  });
  
  // Store email → smart wallet mapping
  await storeEmailMapping(email, smartWallet.address);
  
  return smartWallet;
};
```

---

## Database Schema

### PostgreSQL Schema

```sql
-- Email Accounts Table
CREATE TABLE email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash
    email_encrypted TEXT NOT NULL,           -- AES encrypted
    smart_wallet_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    recovery_email_hash VARCHAR(64),         -- Optional backup email
    
    -- Privacy & Security
    ip_address_encrypted TEXT,
    user_agent_hash VARCHAR(64),
    
    -- Compliance
    gdpr_consent BOOLEAN DEFAULT FALSE,
    gdpr_consent_date TIMESTAMP,
    
    INDEX idx_email_hash (email_hash),
    INDEX idx_smart_wallet (smart_wallet_address)
);

-- Bound Wallets Table
CREATE TABLE bound_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    wallet_type VARCHAR(20) NOT NULL, -- 'eoa', 'smart', 'farcaster'
    is_primary BOOLEAN DEFAULT FALSE,
    bound_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP,
    binding_signature TEXT NOT NULL,
    
    -- Wallet metadata
    wallet_label VARCHAR(100),          -- User-defined name
    wallet_source VARCHAR(50),          -- 'metamask', 'walletconnect', etc.
    
    UNIQUE(email_account_id, wallet_address),
    INDEX idx_email_wallet (email_account_id),
    INDEX idx_wallet_address (wallet_address)
);

-- Email Verification Tokens
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_hash VARCHAR(64) NOT NULL,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    purpose VARCHAR(50) NOT NULL,        -- 'signup', 'login', 'recovery', 'binding'
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_token_hash (token_hash),
    INDEX idx_email_purpose (email_hash, purpose)
);

-- Guardian System
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    guardian_type VARCHAR(20) NOT NULL,  -- 'email', 'wallet', 'phone'
    guardian_identifier_hash VARCHAR(64) NOT NULL,
    guardian_name VARCHAR(100),
    added_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_email_guardian (email_account_id)
);

-- Recovery Requests
CREATE TABLE recovery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL,   -- 'wallet_recovery', 'guardian_recovery'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
    requested_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    
    -- Guardian approvals
    required_approvals INTEGER DEFAULT 2,
    current_approvals INTEGER DEFAULT 0,
    
    INDEX idx_email_recovery (email_account_id),
    INDEX idx_status (status)
);

-- Guardian Approvals
CREATE TABLE guardian_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_request_id UUID REFERENCES recovery_requests(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES guardians(id),
    approved_at TIMESTAMP DEFAULT NOW(),
    signature TEXT NOT NULL,
    
    UNIQUE(recovery_request_id, guardian_id)
);

-- Farcaster Integration
CREATE TABLE farcaster_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    fid BIGINT NOT NULL,
    username VARCHAR(100),
    signer_address VARCHAR(42),
    linked_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(email_account_id, fid),
    INDEX idx_fid (fid)
);

-- Session Management
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(64) UNIQUE NOT NULL,
    active_wallet_address VARCHAR(42),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent_hash VARCHAR(64),
    
    INDEX idx_session_token (session_token_hash),
    INDEX idx_email_session (email_account_id)
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent_hash VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_email_audit (email_account_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);
```

### Redis Cache Schema

```typescript
// Session cache
session:{sessionId} = {
  emailAccountId: string;
  emailHash: string;
  activeWallet: string;
  expiresAt: number;
}

// Rate limiting
ratelimit:email:{emailHash}:{action} = {
  count: number;
  resetAt: number;
}

// Email verification cache
email:verification:{tokenHash} = {
  emailHash: string;
  purpose: string;
  expiresAt: number;
}

// Wallet binding pending
wallet:binding:{walletAddress} = {
  emailHash: string;
  signature: string;
  expiresAt: number;
}
```

---

## API Specifications

### REST API Endpoints

#### Authentication Endpoints

```typescript
POST /api/v1/auth/email/send-magic-link
Request: {
  email: string;
  purpose: 'signup' | 'login' | 'recovery';
  redirectUrl?: string;
}
Response: {
  success: boolean;
  message: string;
  expiresIn: number; // seconds
}

POST /api/v1/auth/email/verify
Request: {
  token: string;
}
Response: {
  success: boolean;
  sessionToken: string;
  emailAccount: {
    id: string;
    emailHash: string;
    smartWallet: string;
    boundWallets: WalletInfo[];
  };
}

POST /api/v1/auth/logout
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  success: boolean;
}

GET /api/v1/auth/session
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  valid: boolean;
  emailAccount?: EmailAccount;
  expiresAt?: number;
}
```

#### Wallet Management Endpoints

```typescript
POST /api/v1/wallets/bind
Headers: { Authorization: 'Bearer {sessionToken}' }
Request: {
  walletAddress: string;
  walletType: 'eoa' | 'smart';
  signature: string; // Signature proving wallet ownership
  label?: string;
}
Response: {
  success: boolean;
  boundWallet: BoundWallet;
}

DELETE /api/v1/wallets/:walletAddress/unbind
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  success: boolean;
}

PUT /api/v1/wallets/:walletAddress/set-primary
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  success: boolean;
  primaryWallet: string;
}

GET /api/v1/wallets
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  wallets: BoundWallet[];
  primaryWallet: string;
}

POST /api/v1/wallets/switch
Headers: { Authorization: 'Bearer {sessionToken}' }
Request: {
  walletAddress: string;
}
Response: {
  success: boolean;
  activeWallet: string;
}
```

#### Account Management Endpoints

```typescript
GET /api/v1/account
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  id: string;
  emailHash: string;
  smartWallet: string;
  boundWallets: BoundWallet[];
  farcasterLink?: FarcasterLink;
  guardians: Guardian[];
  createdAt: string;
}

PUT /api/v1/account
Headers: { Authorization: 'Bearer {sessionToken}' }
Request: {
  recoveryEmail?: string;
  // Other updatable fields
}
Response: {
  success: boolean;
  account: EmailAccount;
}

DELETE /api/v1/account
Headers: { Authorization: 'Bearer {sessionToken}' }
Request: {
  confirmation: string; // Email confirmation
}
Response: {
  success: boolean;
}
```

#### Guardian Management Endpoints

```typescript
POST /api/v1/guardians
Headers: { Authorization: 'Bearer {sessionToken}' }
Request: {
  guardianType: 'email' | 'wallet';
  identifier: string;
  name?: string;
}
Response: {
  success: boolean;
  guardian: Guardian;
}

DELETE /api/v1/guardians/:guardianId
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  success: boolean;
}

GET /api/v1/guardians
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  guardians: Guardian[];
}
```

#### Recovery Endpoints

```typescript
POST /api/v1/recovery/initiate
Request: {
  email: string;
  recoveryType: 'wallet' | 'guardian';
}
Response: {
  success: boolean;
  recoveryRequestId: string;
  requiredApprovals: number;
  expiresAt: string;
}

POST /api/v1/recovery/:requestId/approve
Request: {
  guardianId: string;
  signature: string;
}
Response: {
  success: boolean;
  currentApprovals: number;
  requiredApprovals: number;
  status: 'pending' | 'approved';
}

GET /api/v1/recovery/:requestId/status
Response: {
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  currentApprovals: number;
  requiredApprovals: number;
  expiresAt: string;
}
```

#### Farcaster Integration Endpoints

```typescript
POST /api/v1/farcaster/link
Headers: { Authorization: 'Bearer {sessionToken}' }
Request: {
  fid: number;
  signature: string; // Farcaster signature
}
Response: {
  success: boolean;
  farcasterLink: FarcasterLink;
}

DELETE /api/v1/farcaster/unlink
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  success: boolean;
}

GET /api/v1/farcaster/profile
Headers: { Authorization: 'Bearer {sessionToken}' }
Response: {
  linked: boolean;
  profile?: {
    fid: number;
    username: string;
    signerAddress: string;
  };
}
```

---

## Testing Strategy

### 1. Unit Tests

#### Smart Contracts
```typescript
describe('EmailAccountFactory', () => {
  it('should create email account with initial wallet');
  it('should bind additional wallet to email account');
  it('should prevent unauthorized wallet binding');
  it('should allow wallet switching');
  it('should handle guardian-based recovery');
  it('should enforce rate limits on sensitive operations');
});

describe('GuardianModule', () => {
  it('should add guardians correctly');
  it('should require minimum guardian approvals');
  it('should prevent duplicate guardian approvals');
  it('should expire recovery requests');
});
```

#### Frontend Hooks
```typescript
describe('useEmailWallet', () => {
  it('should initialize email wallet connection');
  it('should send magic link for authentication');
  it('should create new wallet for new email');
  it('should retrieve existing wallet for known email');
  it('should handle authentication errors');
});

describe('useWalletBinding', () => {
  it('should bind EOA to email account');
  it('should unbind wallet from email account');
  it('should switch between bound wallets');
  it('should prevent binding unauthorized wallets');
});
```

#### Backend Services
```typescript
describe('EmailAuthService', () => {
  it('should generate and send magic links');
  it('should validate magic link tokens');
  it('should enforce rate limits');
  it('should handle expired tokens');
});

describe('KeyManagementService', () => {
  it('should generate key shares securely');
  it('should reconstruct keys with valid shares');
  it('should prevent key reconstruction with insufficient shares');
  it('should rotate keys safely');
});
```

### 2. Integration Tests

```typescript
describe('Email Wallet Flow', () => {
  it('should complete end-to-end signup flow');
  it('should complete end-to-end login flow');
  it('should bind existing wallet to email');
  it('should switch between multiple wallets');
  it('should recover account via email');
  it('should recover account via guardians');
});

describe('Farcaster Integration', () => {
  it('should link Farcaster account to email');
  it('should sync Farcaster profile with email account');
  it('should allow login via Farcaster after linking');
});

describe('Cross-Platform Compatibility', () => {
  it('should work with MetaMask');
  it('should work with WalletConnect');
  it('should work with Coinbase Wallet');
  it('should work with smart wallets');
});
```

### 3. E2E Tests (Playwright/Cypress)

```typescript
describe('User Journeys', () => {
  it('New user creates email wallet and makes transaction');
  it('Existing wallet user binds email for backup');
  it('User loses wallet and recovers via email');
  it('User sets up guardians and recovers account');
  it('User links Farcaster and uses both auth methods');
  it('User switches between 3 different wallets seamlessly');
});
```

### 4. Security Tests

```typescript
describe('Security', () => {
  it('should prevent email enumeration attacks');
  it('should enforce rate limits on all endpoints');
  it('should validate all signatures correctly');
  it('should prevent CSRF attacks');
  it('should prevent XSS attacks');
  it('should handle SQL injection attempts');
  it('should encrypt sensitive data at rest');
  it('should use HTTPS for all communications');
});
```

### 5. Load Tests

```typescript
describe('Performance', () => {
  it('should handle 1000 concurrent magic link requests');
  it('should handle 500 concurrent wallet bindings');
  it('should maintain <500ms response time under load');
  it('should scale horizontally with load balancing');
});
```

---

## Migration & Rollout

### Phase 1: Internal Testing (Week 14)

- Deploy to Base Sepolia testnet
- Internal team testing
- Bug fixes and refinements
- Documentation updates

### Phase 2: Closed Beta (Week 15)

- Invite 100 beta testers
- Feature flags for email wallet features
- Collect user feedback
- Monitor analytics and errors
- A/B testing different UX flows

### Phase 3: Open Beta (Week 16)

- Open to all users on testnet
- Gradual rollout with feature flags
- Monitor performance metrics
- Final security review
- Prepare mainnet deployment

### Phase 4: Mainnet Launch (Week 17+)

- Deploy smart contracts to Base mainnet
- Gradual feature enablement
- 24/7 monitoring
- Support team ready
- Marketing and announcements

### Rollback Plan

- Feature flags for instant disable
- Database migration rollback scripts
- Smart contract upgrade path
- User communication plan
- Data preservation guarantees

---

## Success Metrics

### User Adoption
- Number of email wallets created
- Conversion rate: Email signup vs. traditional wallet
- Retention rate: Day 1, Day 7, Day 30
- Wallet binding rate: % of traditional wallet users who add email

### Security Metrics
- Zero security incidents
- 99.9% uptime
- Average recovery time < 15 minutes
- Failed authentication attempts rate

### Performance Metrics
- Magic link delivery time < 5 seconds
- Wallet creation time < 30 seconds
- Transaction confirmation time (standard)
- API response time < 200ms (p95)

### User Experience
- NPS score > 50
- User satisfaction rating > 4.5/5
- Support ticket volume
- Feature request frequency

---

## Conclusion

This comprehensive plan provides a roadmap for integrating email-based self-custodial wallets into the Echain ecosystem while maintaining full compatibility with existing Farcaster, Base wallet, and smart wallet integrations.

### Key Advantages:

1. **Lower Barrier to Entry**: Users can onboard with just an email
2. **Enhanced Security**: Multi-wallet binding with email recovery
3. **Flexibility**: Support for multiple authentication methods
4. **User Control**: Self-custodial despite email abstraction
5. **Future-Proof**: Built on Account Abstraction (ERC-4337)

### Next Steps:

1. **Review and Approval**: Stakeholder review of this plan
2. **Technology Selection**: Finalize email auth provider choice
3. **Resource Allocation**: Assign development team
4. **Timeline Confirmation**: Confirm 17-week timeline
5. **Kick-off Meeting**: Align team on architecture and approach

---

**Document Version**: 1.0  
**Last Updated**: October 9, 2025  
**Status**: Draft - Awaiting Approval  
**Owner**: Echain Development Team
