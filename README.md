<div align="center">

# CardCheck

**See how a card number checks itself, on a 3D card you can type into.**

Type a number and the card changes brand, flips to show the security code, and glows green or red as the number passes or fails.
Then open the lessons and watch the Luhn algorithm do its arithmetic, one digit at a time.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-ff69b4.svg)](CODE_OF_CONDUCT.md)

[Contribute](CONTRIBUTING.md) · [Report a problem](../../issues/new/choose) · [Changelog](CHANGELOG.md)

</div>

---

## Why this exists

Every credit and debit card number carries three things that anyone can check without asking a bank: who issued it
(the first digits), how long it should be, and a check digit at the end that has to agree with the rest. Most
people building a checkout form never learn this. They send every number to the backend and wait for a decline.

CardCheck teaches those three checks and lets you play with them. It is also a small, tested validation library you
can lift into your own project.

## What is in it

- **A 3D card on the front page.** It opens as an American Express card. Type a number and it spins into the right
  brand, prints the digits in a real card layout, and flips over when you click into the security code field.
  Every other network's card orbits behind it, and a shower of sparks goes off when a number passes.
- **A 3D backdrop on every page.** Digits drift upward through fog, and the whole scene slides and tilts as you
  scroll and move the pointer.
- **Live validation.** Network, length and Luhn checksum are checked on every keystroke, with the actual sum shown,
  plus expiry and security code length.
- **A Luhn walkthrough, in 3D.** Each digit is a block. Picked blocks lift, flip to show the doubled value, flip
  again when folded, then drop a bar, and a ring closes (or stays open, in red) at the end. It works on any number
  you like, and a button mistypes a digit so you can watch it fail.
- **A brand and prefix reference** for Visa, Mastercard, American Express, Discover, Diners Club, JCB, UnionPay
  and Maestro, with the parts of a card number explained.
- **A test number generator** that makes Luhn-valid numbers for a chosen network and length, next to the public
  sandbox numbers that payment providers publish.
- **Copy-paste code** for the Luhn check in TypeScript, Python, Java, PHP, Go and C#, and a small brand detector.
- **No tracking and no network calls.** Nothing you type is sent anywhere or stored.

## Getting started

You need Node.js 22 or newer (see [`.nvmrc`](.nvmrc)) and Yarn 4. The exact Yarn version is pinned in
`package.json` and committed under `.yarn/releases`, so there is nothing to install globally.

```bash
git clone https://github.com/WasathTheekshana/cardcheck.git
cd cardcheck
yarn install
yarn dev        # http://localhost:3000
```

This repo is Yarn only. `npm install` and `pnpm install` stop with an error on purpose, so a second lockfile never
sneaks in.

| Script | What it does |
| --- | --- |
| `yarn dev` | Start the dev server |
| `yarn build` | Production build |
| `yarn start` | Serve the production build |
| `yarn lint` | ESLint |
| `yarn typecheck` | Generate route types, then run TypeScript |
| `yarn test` | Run the unit tests once |
| `yarn test:watch` | Run the tests on every save |

Fonts come from Google Fonts at build time, so the first build needs a network connection.

## How it is built

Next.js 16 (App Router, the current Active LTS line) with React 19 and TypeScript. Styling is Tailwind CSS 4. The
card is drawn with three.js through `@react-three/fiber`, and `motion` handles the lesson animations. Tests run on
Vitest.

A few choices worth knowing about:

- **The validation code has no UI in it.** Everything under [`src/lib/card`](src/lib/card) is plain TypeScript with
  no React or browser APIs, and has its own tests. Copy the folder and it works anywhere.
- **The card faces are canvas textures.** The front and back are painted with the 2D canvas API and used as
  textures on a beveled card body. That keeps the text sharp and avoids shipping any image files. The network marks are small
  recreations drawn with shapes and text in [`logos.ts`](src/components/card3d/logos.ts), not the official artwork.
- **A flat fallback.** If WebGL is missing, the same card is drawn with CSS 3D instead. It also stops rendering
  when scrolled off screen, and motion is reduced if your system asks for it.
- **Three.js loads late.** The 3D scenes are separate chunks that load on the client only. Each one stops rendering
  when it is scrolled off screen, and the backdrop uses fewer glyphs on phones.

```
src/
  app/            routes: /, /luhn, /brands, /generator, /code
  components/     UI, card3d/ for the card, three/ for the backdrop and the Luhn scene
  data/           code snippets shown on /code
  lib/card/       the validation library and its tests
```

## Accuracy, and what this is not

The prefix and length rules come from publicly documented ranges. Networks change them, and some overlap, so they
are right for a front-end check and not right for deciding whether to take someone's money. A number that passes
every check here is well formed. It might still be a card that does not exist. Your backend and your payment
provider make the real call, so keep calling them.

If you spot a range that is wrong or missing, please open an issue. See
[`docs/brand-ranges.md`](docs/brand-ranges.md) for how we handle that.

## Contributing

Bug reports, range corrections, new languages for the code page and design ideas are all welcome. Start with
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code is released under the [MIT License](LICENSE). Brand names belong to their owners and are used only to
identify card networks. The marks on the cards are simplified drawings, not official assets.
