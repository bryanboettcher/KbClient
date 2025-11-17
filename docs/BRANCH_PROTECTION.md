# Branch Protection Configuration

This document describes how to configure branch protection rules for the KbClient repository to enforce CI pipeline requirements.

## Prerequisites

- Repository must be on GitHub
- CI workflow must have run at least once (required for GitHub to recognize the checks)
- Repository admin access is required

## Required Status Checks

The following checks should be marked as **required** in branch protection settings:

| Check Name | Description | Why Required |
|------------|-------------|--------------|
| `CI Success` | Composite check ensuring all jobs pass | Single gate for all CI requirements |
| `Lint & Format Check` | ESLint and Prettier validation | Ensures code style consistency |
| `Unit Tests` | Jest unit test suite | Validates component behavior |
| `Integration Tests` | API integration tests | Validates service layer behavior |
| `Production Build` | Angular production build | Ensures deployability |

**Recommended minimum**: Require `CI Success` as this job only passes when all other jobs succeed.

**Stricter alternative**: Require all individual checks for more granular control.

## Configuration Steps

### Via GitHub Web UI

1. Navigate to your repository on GitHub
2. Go to **Settings** > **Branches**
3. Under "Branch protection rules", click **Add rule**
4. Configure for `main` branch:

   **Branch name pattern**: `main`

   **Protect matching branches**:
   - [x] Require a pull request before merging
     - [x] Require approvals (1 recommended)
     - [x] Dismiss stale pull request approvals when new commits are pushed
   - [x] Require status checks to pass before merging
     - [x] Require branches to be up to date before merging
     - Status checks: Search and add `CI Success`
   - [x] Require conversation resolution before merging
   - [ ] Require signed commits (optional)
   - [x] Require linear history (recommended)
   - [ ] Include administrators (optional, but recommended for consistency)

5. Click **Create** or **Save changes**

6. Repeat for `develop` branch if desired (can be less strict)

### Via GitHub CLI

```bash
# Install GitHub CLI if not present
# https://cli.github.com/

# Configure branch protection for main
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --header "Accept: application/vnd.github+json" \
  --field required_status_checks='{"strict":true,"checks":[{"context":"CI Success"}]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_linear_history=true \
  --field required_conversation_resolution=true
```

### Via Terraform (Infrastructure as Code)

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.kbclient.node_id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = ["CI Success"]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews           = true
  }

  enforce_admins                  = false
  require_conversation_resolution = true
  required_linear_history         = true
  allows_force_pushes             = false
  allows_deletions                = false
}
```

## Workflow Behavior

### On Pull Request

When a PR is opened or updated:
1. All CI jobs run in parallel (except `build` which waits for `lint` and `test`)
2. Results appear as checks on the PR
3. PR cannot be merged until all required checks pass
4. Code reviewers can see build artifacts and coverage reports

### On Push to Protected Branch

When code is pushed directly (if allowed) or merged via PR:
1. Full CI pipeline runs
2. Ensures branch always remains in deployable state
3. Failed builds are immediately visible in commit status

## Troubleshooting

### "Check not found" when adding required checks

**Solution**: The workflow must run at least once before GitHub recognizes the check names. Push a commit or open a PR to trigger the workflow.

### Checks not appearing on PR

**Possible causes**:
- Workflow file syntax error (validate with `act` or GitHub Actions linter)
- Branch pattern in workflow doesn't match PR target
- Workflow disabled in repository settings

### CI Success check fails even though individual jobs pass

**Check**: Ensure all job names in the workflow match what `ci-success` job expects in its `needs` array.

## Performance Optimization

The current workflow is optimized for speed:

- **Parallel execution**: Lint, test, and integration tests run simultaneously
- **Dependency caching**: npm cache reduces install time
- **Concurrency control**: Cancels outdated runs when new commits pushed
- **Timeout limits**: Each job has 10-minute timeout to prevent hangs

Expected total duration: **5-8 minutes** for typical PRs.

## Security Considerations

1. **Artifact retention**: Build artifacts are retained for 7 days, coverage for 14 days
2. **Secret management**: No secrets are currently used; add to repository secrets if needed
3. **Dependency scanning**: Consider adding `npm audit` step for security scanning
4. **CODEOWNERS**: Consider adding `.github/CODEOWNERS` for automatic reviewer assignment

## Future Enhancements

Consider adding these checks as the project matures:

- **Dependency vulnerability scanning** (`npm audit`)
- **Code coverage thresholds** (fail if coverage drops)
- **E2E browser tests** (Playwright/Cypress)
- **Visual regression tests** (screenshot comparison)
- **Deployment previews** (Vercel/Netlify preview deployments)
- **Performance budgets** (bundle size limits)
