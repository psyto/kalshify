# Instructions to Remove SETUP_COMPLETE.md from Git History

## ⚠️ CRITICAL WARNINGS

1. **This rewrites git history** - All commit hashes will change
2. **Force push required** - You'll need to force push to GitHub
3. **Team coordination needed** - Anyone with a clone must re-clone or reset their local repo
4. **Backup first** - Make sure you have a backup of your work

## Step-by-Step Instructions

### Option 1: Remove File from Entire History (Recommended)

This completely removes the file from all commits:

```bash
cd /Users/hiroyusai/src/fabrknt/fabrknt-suite

# Create a backup branch first
git branch backup-before-cleanup

# Remove the file from entire git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch SETUP_COMPLETE.md" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up backup refs
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Force garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Option 2: Use BFG Repo-Cleaner (Faster, but requires installation)

If you prefer a faster tool:

```bash
# Install BFG (requires Java)
brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/

cd /Users/hiroyusai/src/fabrknt/fabrknt-suite

# Create a backup
git clone --mirror . ../fabrknt-suite-backup.git

# Remove the file
bfg --delete-files SETUP_COMPLETE.md

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 3: Force Push to GitHub

**⚠️ WARNING: This will overwrite GitHub history. Make sure your team is aware!**

```bash
# Verify the file is gone from history
git log --all --full-history -- SETUP_COMPLETE.md

# Should return nothing if successful

# Force push to GitHub
git push origin --force --all
git push origin --force --tags
```

### Step 4: Update Local File (Already Done)

The file has been sanitized locally (sensitive data removed). Commit the cleaned version:

```bash
git add SETUP_COMPLETE.md
git commit -m "Remove sensitive data from SETUP_COMPLETE.md"
git push origin main
```

### Step 5: Team Members Must Reset Their Repos

Anyone who has cloned the repo must do one of:

**Option A: Re-clone (easiest)**

```bash
cd ..
rm -rf fabrknt-suite
git clone [your-repo-url] fabrknt-suite
```

**Option B: Reset existing clone**

```bash
cd fabrknt-suite
git fetch origin
git reset --hard origin/main
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

## Alternative: If You Just Want to Stop Tracking It

If you don't need to remove it from history (less secure, but easier):

```bash
# Remove from git tracking but keep local file
git rm --cached SETUP_COMPLETE.md

# Add to .gitignore
echo "SETUP_COMPLETE.md" >> .gitignore

# Commit
git add .gitignore
git commit -m "Stop tracking SETUP_COMPLETE.md (contains sensitive data)"
git push origin main
```

**Note**: This doesn't remove it from history, but prevents future commits.

## Verify Removal

After completing the steps, verify:

```bash
# Check file is not in any commit
git log --all --full-history -- SETUP_COMPLETE.md

# Check current status
git status

# Verify GitHub (check the web interface)
```

## Additional Security Steps

1. **Rotate your Supabase credentials**:

    - Go to Supabase Dashboard → Settings → Database
    - Reset the database password
    - Update your `.env.local` file

2. **Check GitHub for exposed secrets**:

    - Review your GitHub repository settings
    - Consider using GitHub's secret scanning feature

3. **Review other files**:
    - Check if any other files contain sensitive data
    - Add them to `.gitignore` if needed
