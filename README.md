# GitHub Actions x AWS CodePipeline

![Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)
![Coverage](./badges/coverage.svg)

This GitHub Actions will help you trigger a pipeline in your AWS CodePipeline -
assuming you already have the pipeline. This will not create the pipeline for
you.

This is mainly copied from project
[GitHub Actions x AWS CodePipeline](https://github.com/zulhfreelancer/aws-codepipeline-action)
by [Zulhilmi Zainudin](https://github.com/zulhfreelancer) and I thank him for
his work on it.

One of the issues I found with this action was that if something went wrong when
triggering the pipeline it would print the error but it would mark the action as
failed. That is what I have tried to address with my changes to his code with
everything else being the same.

## Initial Setup

After you've cloned the repository to your local machine or codespace, you'll
need to perform some initial setup steps before you can develop your action.

> [!NOTE]
>
> You'll need to have a reasonably modern version of
> [Node.js](https://nodejs.org) handy (20.x or later should work!). If you are
> using a version manager like [`nodenv`](https://github.com/nodenv/nodenv) or
> [`fnm`](https://github.com/Schniz/fnm), this template has a `.node-version`
> file at the root of the repository that can be used to automatically switch to
> the correct version when you `cd` into the repository. Additionally, this
> `.node-version` file is used by GitHub Actions in any `actions/setup-node`
> actions.

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

1. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

1. :white_check_mark: Run the tests

   ```bash
   $ npm test

   PASS  ./index.test.js
     ✓ throws invalid number (3ms)
     ✓ wait 500 ms (504ms)
     ✓ test runs (95ms)

   ...
   ```

### Create a release

Checkout a new branch with name `release-<major>.<minor>.<patch>`.

Update the `package.json` with the new version number.

Run:

```bash
npm install
```

Commit the changes with the message `Release <major>.<minor>.<patch>`

Push to GitHub and open a Pull Request.

Once the PR has been merged, GitHub Actions will create a new release tag.

## Setup

### AWS IAM

Create an IAM user with `codepipeline:StartPipelineExecution` permission. You
may take and customize the IAM policy below as starter point. Note that I'm
using `"*"` in the policy. For better security, you can limit the policy to only
execute specific pipelines. You can read more about
[IAM for CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/permissions-reference.html).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["codepipeline:StartPipelineExecution"],
      "Resource": ["*"]
    }
  ]
}
```

### GitHub Secrets

After you create the IAM user with the right permission, add two variables below
in your GitHub repository secrets area:

- `AWS_PIPELINE_ACCESS_KEY`: the Access Key ID for the user that you just
  created
- `AWS_PIPELINE_SECRET_KEY`: the Secret Key for the user that you just created

## Usage

### Basic Usage

**Note**:

- Please check the
  [latest available version](https://github.com/Crown-Commercial-Service/ccs-aws-codepipeline-action/releases/latest)
  and replace it with `X.X.X` in the code examples below.

- Identify in which AWS region your pipeline is located. Use that region name
  for `aws-region` key below. You can use the
  [AWS regions list](https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints)
  to find this.

```yaml
jobs:
  deploy:
    steps:
      - name: Trigger AWS CodePipeline
        uses: Crown-Commercial-Service/aws-codepipeline-action@vX.X.X
        with:
          aws-region: 'ap-southeast-1'
          aws-access-key: ${{ secrets.AWS_PIPELINE_ACCESS_KEY }}
          aws-secret-key: ${{ secrets.AWS_PIPELINE_SECRET_KEY }}
          pipeline-name: 'your-pipeline-name'
          target-branch: 'target-branch' # optional
```

### Advance Usage

Below is the example for situation where:

- You only want to trigger the pipeline if previous job was successful
- You only want to trigger the pipeline if the Git branch that GitHub Actions
  currently running is a specific branch

```yaml
jobs:
  job1: ... code for job1 ...
  deploy:
    needs: job1
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger AWS CodePipeline
        uses: Crown-Commercial-Service/ccs-aws-codepipeline-action@vX.X.X
        if: github.ref == 'refs/heads/your-branch-name'
        with:
          aws-region: 'ap-southeast-1'
          aws-access-key: ${{ secrets.AWS_PIPELINE_ACCESS_KEY }}
          aws-secret-key: ${{ secrets.AWS_PIPELINE_SECRET_KEY }}
          pipeline-name: 'your-pipeline-name'
```
