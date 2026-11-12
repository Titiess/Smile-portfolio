import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="not-found">
      <p className="eyebrow">
        <span className="eyebrow-dot" />
        Page not found
      </p>
      <h1 id="not-found-title">A path not yet mapped.</h1>
      <p>
        That page may have moved or the link may be incorrect. Let&apos;s get
        you back to familiar ground.
      </p>
      <Link className="button" href="/">
        <ArrowLeft aria-hidden="true" size={15} />
        Back to home
      </Link>
    </section>
  );
}
