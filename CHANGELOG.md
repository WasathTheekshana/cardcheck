# Changelog

All notable changes are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- 3D card on the home page that opens as American Express and changes with the number typed. It flips to show the
  security code, and glows green or red on valid and invalid numbers.
- Live validation for network, length, Luhn checksum, expiry and security code length.
- Luhn walkthrough page with step controls and a button that mistypes a digit, with a 3D scene that follows each step.
- Full-page 3D backdrop of drifting digits that reacts to scroll and pointer.
- Orbiting brand cards, sparkles and a success burst around the hero card.
- Scroll reveals, tilt cards, a sliding nav indicator and page transitions.
- Brand reference for Visa, Mastercard, American Express, Discover, Diners Club, JCB, UnionPay and Maestro.
- Test number generator and a list of public sandbox numbers.
- Copy-paste Luhn code in TypeScript, Python, Java, PHP, Go and C#, plus a brand detector.
- Framework-free validation library in `src/lib/card` with unit tests.
- CSS 3D fallback for browsers without WebGL, and reduced motion support.
