# Copilot Instructions for Issue Management

These instructions are mandatory for every new GitHub issue created for this repository.

## User Story Template Usage

When creating a new issue, if the issue describes a feature, requirement, or user need, use the User Story template from `.github/ISSUE_TEMPLATE/user-story.md`.
This template should be preferred for all user-facing features or enhancements. Ensure the issue body follows the template structure:

**As a** [role]  
**I need** [function]  
**So that** [benefit]  
### Details and Assumptions
* [document what you know]
### Acceptance Criteria  
```gherkin
Given [some context]
When [certain action is taken]
Then [the outcome of action is observed]
```

## Required Actions On Issue Creation

1. Always add label `backlog`.
2. Always set milestone to `Backlog`.
3. Always set exactly one priority label:
   - `priority:p0` for `[CRITICAL]`
   - `priority:p1` for `[P1]`
   - `priority:p2` for `[P2]`
   - `priority:p3` for `[P3]`
   - `priority:p4` for `[P4]`
4. Add topic labels when applicable:
   - `area:security` when title/body indicates security work
   - `area:testing` when title/body indicates tests or test coverage
   - `bug` when issue is a bug
5. Add phase label when applicable:
   - `phase-7` for `[Phase 7]`
   - `phase-8` for `[Phase 8]`
   - `phase-9` for `[Phase 9]`

## Required Validation Step

After creating or editing an issue, verify it with a read command and report:
- issue number
- final labels
- final milestone
- validation status

Do not finish until validation succeeds.

## Title Convention

Use one of these formats whenever possible:
- `[CRITICAL][Security] <short action title>`
- `[P1][Security] <short action title>`
- `[P2][Testing] <short action title>`
- `[P3][Phase 8] <short action title>`

## Operational Rule

If a required label does not exist, create it first, then continue issue creation/editing and validation.
