# How brand ranges are handled

The prefix and length rules live in [`src/lib/card/brands.ts`](../src/lib/card/brands.ts). This note explains how
they are chosen and how to propose a change.

## Where the data comes from

Card networks do not publish one authoritative free list. The rules here are the ones that appear consistently in the
networks' public technical documents, the ISO/IEC 7812 numbering standard, and widely used payment provider
documentation. When sources disagree we pick the narrower, better documented range and leave a comment.

Known soft spots:

- **Discover and UnionPay overlap.** Discover's 622126-622925 sits inside UnionPay's 62. The narrower range is
  listed first and wins.
- **Maestro** prefixes change often and overlap with other networks. We list only the stable ones.
- **Lengths** are the ones commonly issued. Some networks allow 19 digits but few cards use them.
- **UnionPay** does not always use a Luhn check digit, so a UnionPay number is accepted without one when the length
  is right.

## Proposing a change

Open a [brand range issue](../../../issues/new?template=brand_range.yml) or a pull request. Include:

1. The network, the prefix or length, and whether you are adding, removing or narrowing it.
2. A link to the source, ideally the network's own document.
3. Edge cases for tests: the number just inside the range and the number just outside it.

Order in `BRANDS` matters. Put narrower ranges before the broader ranges that contain them, and add a test to
`src/lib/card/card.test.ts` that proves the narrower one wins.

## Why this is only a front-end check

A number that matches here can still be unissued. And a range this project does not know about is not necessarily
invalid. That is why the site, and the code page, tell you to let your payment provider make the final decision.
