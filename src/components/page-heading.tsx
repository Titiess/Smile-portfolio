type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <section aria-labelledby="page-title" className="page-hero">
      <div className="page-hero-inner page-heading">
        <p className="eyebrow">
          <span className="eyebrow-dot" />
          {eyebrow}
        </p>
        <h1 id="page-title">{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
