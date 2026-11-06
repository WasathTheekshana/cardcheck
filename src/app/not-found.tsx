import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-24 text-center sm:px-6">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">That page does not exist</h1>
      <p className="mt-3 text-ink-soft">The link may be old or mistyped. Luckily, that is the kind of mistake this site is about.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Back to the card
      </Link>
    </div>
  );
}
