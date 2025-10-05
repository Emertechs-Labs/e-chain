# Base Documentation

## Overview

Base is the #1 Ethereum Layer 2, incubated by Coinbase. Build on Base and choose the features that fit your needs — from sub-cent global payments to creator-first monetization and built-in distribution.

Base enables builders to:
- **Focus on solving real user problems**
- **Scale apps globally by default**
- **Onboard users with a click**
- **Accept payments from anyone, easily**

## Why Base?

### Global Economy
Base is a globally available platform that provides 1-second and <1-cent transactions to anyone in the world.

### Creator Tools
Access to high-quality tooling for building incredible onchain experiences for AI, social, media, and entertainment.

### Builder Experience
A place to earn with grants distributed to more than 1,000 builders, with plans to continue supporting more.

### Distribution
Reach more users through official Base channels and ecosystem partnerships.

## Start Building

### Apps
Build and deploy your app in minutes using OnchainKit.

### Tokens
Launch a new token with Base's token deployment tools.

### Chains
Deploy your own chain on Base with dedicated blockspace.

## Products

- **OnchainKit**: All-in-one toolkit and ready-to-use, full-stack components
- **MiniKit**: Feature your mini app on decentralized social platforms
- **Smart Wallet**: Passkey-based universal account for onchain interactions
- **Base Appchains**: Launch a chain with dedicated blockspace on Base
- **OnchainTestKit**: End-to-end testing framework for blockchain applications

## Get Funded

- **Builder Rewards**: Get rewarded up to 2 ETH weekly
- **Grants**: Apply for fast, retroactive Base Builder Grants
- **Base Batches**: Global program for onchain app builders
- **Retroactive Funding**: Apply for OP Retro Funding

## Reach More Users

- **Build a Mini App**: Run directly inside social feeds with automatic wallet connection
- **Submit to Base Ecosystem**: Showcase your project to the Base community

## Resources

- [Base.org](https://base.org/) - Main website
- [Base Documentation](https://docs.base.org/) - Complete documentation
- [Base Scan](https://basescan.org/) - Block explorer
- [Base Sepolia](https://sepolia.basescan.org/) - Testnet explorer

## AI Prompting Guide

Practical techniques for getting better results from AI coding assistants when building with OnchainKit.

### Understanding Context Windows

AI coding assistants have a "context window" - the amount of text they can process at once. Think of it as working memory:
- Most assistants process thousands of tokens (roughly 4-5 words per token)
- Everything you share consumes this limited space
- Once full, older conversation parts may be lost

**Optimizing for Context Windows:**
1. Share relevant info first - Most important details upfront
2. Skip unnecessary content - Avoid irrelevant code or docs
3. Structure requests clearly - Use sections and formatting
4. Reference smartly - Share only relevant files for large codebases

### Setting Up AI Tools

#### Cursor Rules

Cursor Rules provide consistent context to help AI understand your codebase better.

1. Open Command Palette: `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux)
2. Search "Cursor Rules" and create/edit rules
3. Add project-specific rules:
   - [Next.js](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/nextjs-tailwind-typescript-apps-cursorrules-prompt/.cursorrules)
   - [Astro](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/astro-typescript-cursorrules-prompt-file/.cursorrules)
   - [Vite](https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/refs/heads/main/rules/typescript-vite-tailwind-cursorrules-prompt-file/.cursorrules)

#### OnchainKit Projects

Create a new OnchainKit project:
```bash
npm create onchain@latest
```

After setup, generate comprehensive documentation for your project.

#### Creating Project Documentation

A project instructions file helps AI understand your codebase. Create this early and update regularly.

**Instructions.md prompt:**
```
Create a detailed instructions.md file for my OnchainKit project:

1. Overview: Project goals and core functionality
2. Tech Stack: Technologies, libraries, frameworks with versions
3. Project Structure: File organization with explanations
4. Coding Standards: Style conventions, linting rules, patterns
5. User Stories: Key functionality from user perspective
6. APIs and Integrations: External services and connections
```

### Effective Prompting Strategies

#### Be Specific

AI tools respond best to clear, direct instructions.

❌ "Help me with my code"
✅ "Refactor this authentication function to use async/await instead of nested then() calls"

#### Provide Context

Template:
```
I'm working on an OnchainKit project using [frameworks/libraries]. I need help with:

1. Problem: [describe specific issue]
2. Current approach: [what you've tried]
3. Constraints: [technical limitations]
4. Expected outcome: [what success looks like]

Relevant docs: @https://onchainkit.xyz

Relevant code:
[paste your code]
```

#### Iterate

Start simple and refine rather than trying to get everything perfect at once.

Template:
```
Let's approach this step by step:
1. First, implement basic [feature] with minimal functionality
2. Review and identify improvements
3. Add error handling and edge cases
4. Optimize for performance

Start with step 1.
```

### Working with OnchainKit

#### Using Documentation

Reference OnchainKit documentation directly in your prompts:
1. Browse [OnchainKit docs](https://docs.base.org/onchainkit/latest/getting-started/overview)
2. Find your component
3. Reference the docs URL in your prompt

Example:
```
I'm implementing a swap component with OnchainKit.

Docs: @https://onchainkit.xyz

Show me how to implement a swap that:
1. Swaps USDC to ETH on Base
2. Handles connection states
3. Includes error handling
4. Follows UX best practices
```

#### Component Integration

Token balance example:
```
Implement a token balance display feature:

1. Shows connected wallet's balance of [TOKEN_SYMBOL]
2. Updates when balance changes
3. Handles loading and error states
4. Follows project coding standards
5. Update instructions.md with this implementation
```

### Debugging with AI

#### Debugging Prompts

Bug analysis template:
```
I'm encountering an issue:

1. Expected behavior: [what should happen]
2. Actual behavior: [what's happening]
3. Error messages: [any errors]
4. Relevant code: [problematic code]

Analyze step by step and help me:
1. Identify potential causes
2. Suggest debugging steps
3. Propose solutions
```

Debug logging template:
```
Add comprehensive logging to this function to trace:
1. Input values and types
2. Function execution flow
3. Intermediate state changes
4. Output values or errors

Code:
[paste your code]
```

#### When Stuck

Clarification template:
```
I'm unsure how to proceed with [specific task]. Here's what I know:
1. [problem context]
2. [what you've tried]
3. [specific areas needing guidance]

What additional information would help you assist better?
```

### Advanced Techniques

1. **Step-by-step reasoning**
   ```
   Analyze this code step by step and identify potential issues.
   ```

2. **Format specification**
   ```
   Structure your response as a tutorial with code examples.
   ```

3. **Length guidance**
   ```
   Provide a concise explanation in 2-3 paragraphs.
   ```

4. **Clarify ambiguities**
   ```
   You suggested two approaches. I prefer the first with TypeScript.
   ```

### Best Practices

1. Understand context limitations - AI has finite memory, prioritize important info
2. Provide relevant context - Share code, errors, and project details that matter
3. Be specific - Clear instructions beat vague questions
4. Break down complex tasks - Iterative approaches work better
5. Request explanations - Ask AI to explain generated code you don't understand
6. Use clear formatting - Structure prompts with sections
7. Reference docs - Include OnchainKit documentation links
8. Test and validate - Always review AI-generated code before implementing
9. Build on context - Reference earlier conversation parts when iterating
10. Provide feedback - Tell AI what worked and what didn't

**Reference:** [OnchainKit AI Prompting Guide](https://docs.base.org/onchainkit/latest/guides/ai-prompting-guide)