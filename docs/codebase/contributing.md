---
title: Contribute
---

# Contribute

Keep issues and pull requests short, repeatable, and testable. State the problem or change in
plain language, then show how someone else can reproduce it or verify it. Start a significant
change with a maintainer conversation so the work fits EagleEye's goals.

## File an issue

Use a title that names the problem. Include:

- What happened and what you expected instead.
- Exact steps to reproduce it.
- EagleEye branch or commit, hardware, and relevant configuration.
- Logs, screenshots, or a small pipeline export when they help.

Do not bury the steps in a long narrative. A maintainer should be able to scan the issue and
reproduce it without asking for the basics.

## Open a pull request

Keep one PR focused on one problem or implementation. Its description should include:

- A short summary of the change and why it belongs in EagleEye.
- The behavior before and after the change.
- Validation run, with exact commands and results.
- Screenshots for a visible WebUI change.
- Related issue or maintainer discussion.

Avoid unrelated cleanup, generated files, and lengthy implementation diaries. Make the diff easy
to review and easy to revert.

## Review and merge

After maintainers agree that a PR is worth adding, the repository's automatic AI code review runs
on it. Address every issue it identifies before asking a maintainer to merge. Fix the issue when
the finding is correct. If a finding needs a different resolution, explain that resolution in the
review thread and make the needed change.

:::warning Write the discussion yourself
AI-generated pull request descriptions and AI-generated comments can result in an immediate ban
from contributing to EagleEye. File-change summaries are the exception. AI-assisted code is
welcome, but maintainers expect to discuss real problems with a human contributor.
:::

## Keep documentation current

For a significant backend or frontend change, check the
[EagleEye Docs repository](https://github.com/Scythe-Engineering/EagleEye-Docs) for outdated
material that needs changing. If the documentation needs an update, open a PR there and link the
EagleEye and documentation PRs in each other's descriptions. That lets maintainers review and
merge the related changes together.

Read [engineering principles](./overview#engineering-principles) before choosing an approach, and
use [Develop EagleEye](./develop-eagleeye) or [Develop the documentation site](./develop-docs)
to set up the repository you are changing.
