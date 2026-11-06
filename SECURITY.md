# Security policy

## What counts

CardCheck runs entirely in the browser and has no backend, database or accounts. That limits what can go wrong, but
these are still worth reporting:

- anything that sends what a visitor types (card number, name, expiry, code) off their device
- cross-site scripting or injection through any input or URL
- a compromised or malicious dependency
- a mistake in the validation logic that you think could be abused when someone copies it into a payment flow

A card range that is out of date is not a security issue. Please open a normal issue for that.

## How to report

Use GitHub's private vulnerability reporting: go to the **Security** tab of the repository and choose
**Report a vulnerability**. If that is not available, open an issue that says you have a security concern and leave
out the details. A maintainer will reach out for the rest.

Please do not post details in a public issue or pull request until there is a fix.

## What to expect

This is a volunteer project, so no promises on a strict timeline. We aim to reply within a week, and to fix
confirmed problems as soon as we reasonably can. You will be credited in the changelog if you want to be.

## Supported versions

Only the latest release on the `main` branch gets fixes.
