export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-ink-soft sm:px-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-2">
          <p className="font-medium text-ink">Nothing you type leaves this page.</p>
          <p>
            Every check runs in your browser. There is no server call, no analytics and no storage. You still do not
            need a real card number here: the sandbox numbers on the Validate page work fine.
          </p>
          <p className="text-ink-faint">
            A number that passes these checks is only well formed. Whether the card exists, has money on it or belongs
            to the person typing is something only the bank can tell you.
          </p>
        </div>
        <div className="space-y-2 md:text-right">
          <p>
            Open source under the{" "}
            <a className="underline decoration-line underline-offset-4 hover:text-ink" href="https://github.com/WasathTheekshana/cardcheck/blob/main/LICENSE">
              MIT license
            </a>
            .
          </p>
          <p>
            <a className="underline decoration-line underline-offset-4 hover:text-ink" href="https://github.com/WasathTheekshana/cardcheck">
              Source and issues on GitHub
            </a>
          </p>
          <p className="text-ink-faint">Brand names belong to their owners. No logos are used.</p>
        </div>
      </div>
    </footer>
  );
}
