---
name: solve-issue
description: Solve one GitHub issue of this repo end to end — read the issue, plan, branch, implement, run the type checks, then commit, push and open a PR that closes the issue. Use when the user runs /solve-issue <number>.
argument-hint: <issue-number>
disable-model-invocation: true
---

# Solve issue #$ARGUMENTS

Work on exactly one issue: **#$ARGUMENTS**. `CLAUDE.md` is the rulebook for every step below. If this skill and `CLAUDE.md` ever disagree, `CLAUDE.md` wins.

If `$ARGUMENTS` is empty or not a number, ask for the issue number and stop.

## 1. Preflight

1. `git status --short` must be empty. If it is not, stop and ask the user what to do with the changes — never stash, reset or discard them yourself.
2. `git fetch origin` (this also confirms the SSH connection to GitHub).
3. `gh auth status`. If `gh` is not logged in, continue, but use the fallbacks below and tell the user they can run `! gh auth login` to let this skill open PRs.

## 2. Read the issue

Get the issue text, first source that works:

1. `gh issue view $ARGUMENTS --json number,title,body,state`
2. `curl -s https://api.github.com/repos/MadhaviRamani/Recap_Project-7-ToDo_List/issues/$ARGUMENTS` (the repo is public)
3. The matching template in `.github/templates/` (file name starts with the zero-padded number, e.g. `04-mark-a-todo-as-done.md`)

Then:

- If the issue is closed or is a pull request, say so and stop.
- Extract the **Acceptance Criteria**, **Tasks** and **Hint** — together they are the spec.
- Check the order: setup issue 1 first, then stories 2–8 in number order, bonus 9 last. If an earlier issue is still open, warn the user and ask whether to continue.
- Read `docs/api-contract.md` and the code the issue touches (`backend/src/routes/todos.ts`, `backend/src/models/Todo.ts`, `frontend/src/api.ts`, `frontend/src/App.tsx`, …) so the plan builds on what exists.
- **Never read, print or log `backend/.env`.** Issue 1 needs the user to create it themselves; never ask for the connection string.

## 3. Plan and wait for approval

Show a short plan:

- the files to create or change (backend and frontend),
- each acceptance criterion and how it will be met,
- the Bruno requests the user should send to check the API.

**Stop and wait for the user to approve or adjust the plan.** The user plans, steers and reviews; do not start coding before they agree.

## 4. Branch

```bash
git switch main
git pull --ff-only
git switch -c issue-$ARGUMENTS-<short-kebab-title>
```

One branch per issue, always from the latest `main`.

## 5. Implement

- Follow `CLAUDE.md`: routes call the mongoose model directly, all `fetch` calls live in `frontend/src/api.ts`, data is loaded with SWR, errors are `{ "error": "..." }`, `request`/`response` as parameter names, async/await, no `any`.
- If the API changes, update `docs/api-contract.md` in the same step.
- Do only what this issue asks: no work from later issues, no unrelated refactors, no new dependencies without asking, no tests, no login.

## 6. Verify

Run the checks of the part you changed and fix the code until they pass:

```bash
cd backend && npm run typecheck
cd frontend && npm run check && npm run build
```

`npm run dev` never finishes: ask the user to start it, or run it in the background.

Then go through the acceptance criteria one by one and state, for each, what proves it is met (a route, a component, a check the user does in Bruno or the browser). List what the user must check by hand (Bruno, browser, reload, database). If a criterion is not met, go back to step 5.

## 7. Review, commit, push, PR

1. Show `git status --short` and a summary of the diff, and ask the user to confirm before committing. Remind them of the review checklist in the README (secrets, scope, errors, structure).
2. Stage only the files of this issue by name (never `git add -A`; `.env`, `node_modules/` and `dist/` must never be committed).
3. Commit with a message whose first line is `<Issue title> (#$ARGUMENTS)` and whose body lists the changes and ends with `Closes #$ARGUMENTS`.
4. `git push -u origin <branch>`.
5. Open the PR:
   - with `gh`: `gh pr create --base main --title "<Issue title>" --body "<summary>\n\nCloses #$ARGUMENTS"`;
   - without `gh`: give the link `https://github.com/MadhaviRamani/Recap_Project-7-ToDo_List/pull/new/<branch>` and the PR text to paste, including `Closes #$ARGUMENTS`.

## 8. Hand over

Report: branch, commit, PR link, the check results, the acceptance criteria checklist, and what the user should test by hand.

**Never merge the PR.** The user reviews and merges it.
