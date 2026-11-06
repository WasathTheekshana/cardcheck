# Contributing to CardCheck

Thanks for taking a look. This is a small project and every bit of help matters, whether that is a typo fix or a new
feature. Please read the [Code of Conduct](CODE_OF_CONDUCT.md) first. It applies everywhere we talk to each other.

## You do not need to write code

| If you... | You could... |
| --- | --- |
| know card networks well | [report a wrong or missing prefix or length](../../issues/new?template=brand_range.yml) |
| teach or learn this stuff | tell us which explanation lost you, in an issue |
| write in a language we do not cover | add a Luhn snippet to the code page |
| find a bug on your device | [open a bug report](../../issues/new?template=bug_report.yml) with browser and device |
| design or do 3D | [suggest an idea](../../issues/new?template=feature_request.yml) for the card or the lessons |

## Setting up

You need Node.js 22 or newer and nothing else. Yarn comes from the repo.

```bash
yarn install
yarn dev
```

This project uses Yarn only. Please do not commit a `package-lock.json` or `pnpm-lock.yaml`. If your editor or a tool
creates one, delete it.

Before you open a pull request, run all four and make sure they pass:

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```

CI runs the same four.

## Rules that matter here

**Never put real card numbers anywhere.** Not in tests, issues, screenshots or commit messages. Use the sandbox
numbers in [`src/lib/card/generate.ts`](src/lib/card/generate.ts) or generate new ones. If you accidentally paste a
real number into an issue, say so and a maintainer will remove it.

**Changes to brand ranges need a source.** Link the network's own documentation or a published BIN table in your pull
request. "I have a card that starts with this" is useful as a hint but is not enough to change the table. More in
[`docs/brand-ranges.md`](docs/brand-ranges.md).

**Validation logic gets a test.** Anything under `src/lib/card` is the part people copy, so it has to be right. If
you change a range, add the edge cases on both sides of it.

**Logos are trademarks.** The network marks in `public/logos` are used only to show which network a number belongs
to, on a free educational site. Do not add logos for anything else, and do not load them from other servers.

**No tracking, no network calls from the browser.** The "nothing leaves your device" promise is part of the
project. A change that adds analytics, a remote font loaded at runtime or a call to a BIN lookup API will not be
merged.

## Writing for the site and docs

Write the way you would explain it to a colleague. Short sentences, concrete examples, no marketing voice. Please
avoid em dashes. Check the text on the lesson pages by reading it aloud once.

## Pull requests

1. Open an issue first for anything bigger than a small fix, so we can agree on the approach.
2. Keep each pull request to one thing. A range fix and a redesign should be two.
3. Fill in the template. A screenshot or short recording helps a lot for anything visual.
4. Commit messages follow a loose [Conventional Commits](https://www.conventionalcommits.org) style: `fix:`,
   `feat:`, `docs:`, `chore:`.

By contributing you agree that your work is released under the [MIT License](LICENSE).

## Security

Please do not report security problems in a public issue. See [SECURITY.md](SECURITY.md).
