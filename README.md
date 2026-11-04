# ClaudeHackathon
Northumbria Claude Hackathon project  

NextJS

https://www.figma.com/design/OBfTJZbbFtNPameBs4sixt/Untitled?node-id=0-1&t=uvpMwQyvlHH7l4h4-1

# Basic Idea
When small businesses in the North East get overloaded, they can post a short-term task instead of hiring a full-time employee. Each post sets out the type of work, required experience, preferred experience and pay, and students can apply directly.

One reason graduates leave the North East is that it can be hard to build experience and skills here. Our platform helps address this by giving students real work experience and career development opportunities with local businesses.

# What information do company must provide
0. Company name and about us - Brief explanation for company

1. Job Contents - What the works are for(Explanations for temporary works)

2. Period - How long are students expected to do assists

3. Requirement - What kind of career do company demands for 
ex- Students need to be expert in JavaScript, Students must have used Excel

4. Preferred experience(choice) - What kind of experiences that students work do company prefer

5. Payment - How will be the payment be


# What information do students must provide
1. Name and University, Field of study

2. Work History

3. Motivations and Goal


<img width="475" height="578" alt="imagen" src="https://github.com/user-attachments/assets/5f368eb4-0e2a-492f-bfc3-9d53b9fcb23f" />


# Git Workflow (Branch & Commit Convention)

> **For AI agents (Claude Code, Cursor, Copilot, etc.):** Treat this section as mandatory project rules. Follow it for every branch, commit, and pull request you create in this repository. If a request conflicts with these rules, point out the conflict to the user before proceeding.

## Branch Strategy

```
main  ←  develop  ←  feature/* | fix/* | docs/* | refactor/* | chore/*
```

| Branch | Purpose | Rules |
|---|---|---|
| `main` | Stable, demo/deploy-ready code | Never commit or push directly. Updated only by merging `develop` via PR. |
| `develop` | Integration branch for ongoing work | Never commit directly. Updated only by merging work branches via PR. |
| `feature/<name>` | New functionality | Branch from `develop`, PR into `develop`. |
| `fix/<name>` | Bug fixes | Branch from `develop`, PR into `develop`. |
| `docs/<name>` | Documentation only | Branch from `develop`, PR into `develop`. |
| `refactor/<name>` | Code restructuring with no behaviour change | Branch from `develop`, PR into `develop`. |
| `chore/<name>` | Config, dependencies, tooling | Branch from `develop`, PR into `develop`. |

**Branch naming**
- Format: `<type>/<short-description>`
- Lowercase, words separated by hyphens (kebab-case), English only.
- Keep it short and specific.
- Examples: `feature/job-post-form`, `feature/student-profile`, `fix/login-redirect`, `docs/api-guide`

**Workflow**
1. Update `develop` first: `git checkout develop && git pull origin develop`
2. Create a work branch: `git checkout -b feature/<name>`
3. Commit using the commit convention below.
4. Before opening a PR, sync with the latest `develop`: `git pull origin develop` (resolve conflicts locally).
5. Push and open a PR into `develop`: `git push -u origin feature/<name>`
6. At least one teammate reviews before merging. Delete the branch after merge.
7. When `develop` is stable, open a PR from `develop` into `main`.

## Commit Convention ([Conventional Commits](https://www.conventionalcommits.org/))

**Format**
```
<type>(<optional scope>): <subject>

<optional body: what and why>
```

**Types**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace, semicolons; no logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Build, config, dependencies, tooling |
| `perf` | Performance improvement |

**Rules**
- Write in English.
- Subject: imperative mood ("add", not "added"/"adds"), lowercase first letter, no trailing period, max ~50 characters.
- Scope (optional) names the affected area, e.g. `job-post`, `student`, `auth`, `ui`, `api`.
- One logical change per commit. Do not mix unrelated changes.
- Use the body to explain *why* when the change is not obvious. Wrap at ~72 characters.
- Breaking changes: add `!` after the type (`feat!: ...`) and describe it in the body with `BREAKING CHANGE:`.

**Examples**
```
feat(job-post): add pay and period fields to job form
fix(auth): redirect to dashboard after login
docs: add branch and commit convention to README
chore: set up eslint and prettier
refactor(student): extract profile card component
```

## Pull Requests
- PR title follows the commit format, e.g. `feat(job-post): add job posting form`.
- Base branch is `develop` (only `develop` → `main` PRs target `main`).
- Description includes: what changed, why, and how to test it. Link related issues if any.
