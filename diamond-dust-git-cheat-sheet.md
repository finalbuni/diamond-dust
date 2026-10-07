# Diamond Dust — Quick Git Cheat Sheet

Use this for small translation, typo, or wording changes you make on your own.

## Normal workflow

### 1. Go to the Diamond Dust repo

```bash
cd "/path/to/diamond-dust"
```

### 2. Make your edits

Edit the files inside:

```text
EDIT_CHAPTERS_HERE/
```

**Do not manually edit `_chapters` or `_sections`.** Those are generated for you.

### 3. Rebuild the site

```bash
python3 build_hybrid.py
```

This updates the generated `_chapters` and `_sections` files from `EDIT_CHAPTERS_HERE`.

### 4. Check for whitespace/errors

```bash
git diff --check
```

**Good result:** no output.

### 5. See which files changed

```bash
git status --short
```

Make sure the files listed make sense for the chapters you edited.

### 6. Review your changes

```bash
PAGER=cat git diff
```

Read through the diff and make sure nothing unexpected changed.

---

## Ready to commit?

### 7. Stage your tracked changes

```bash
git add -u
```

`git add -u` stages modified/deleted files Git already knows about, but does **not** stage random new untracked files.

### 8. Check exactly what is staged

```bash
git status --short
git diff --cached --check
git diff --cached --stat
PAGER=cat git diff --cached
```

What you see in `git diff --cached` is what will go into the commit.

### 9. Commit

```bash
git commit -m "Describe what you changed"
```

Examples:

```bash
git commit -m "Fix chapter 12 translation"
git commit -m "Correct chapter 8 typos"
git commit -m "Standardize character references"
```

### 10. Push to GitHub

```bash
git push origin main
```

Done. ♡

---

## Useful rescue commands

### Undo changes to one file BEFORE staging

```bash
git restore path/to/file
```

⚠️ This discards your uncommitted edits to that file.

### Unstage a file WITHOUT deleting your edits

```bash
git restore --staged path/to/file
```

Your edits stay; the file is simply removed from the next commit.

### See what has changed but is not staged

```bash
PAGER=cat git diff
```

### See what IS staged

```bash
PAGER=cat git diff --cached
```

### Check whether your working tree is clean

```bash
git status
```

---

## Commands I should NOT casually use

Ask for help before using these unless you know exactly why you need them:

```bash
git reset --hard
git clean
git push --force
git stash drop
```

These can discard work or rewrite history.

---

## Tiny version

When everything is routine:

```bash
python3 build_hybrid.py
git diff --check
git status --short
PAGER=cat git diff
git add -u
git diff --cached --check
PAGER=cat git diff --cached
git commit -m "Describe the change"
git push origin main
```

**Mental model:**  
edit source → build → check → review → stage → review staged → commit → push
