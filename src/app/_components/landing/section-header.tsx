// landing-section-header.tsx
type Props = {
  eyebrow: string;
  title: string;
  titleTestId?: string;
};

export function LandingSectionHeader({ eyebrow, title, titleTestId }: Props) {
  return (
    <header className="mb-12">
      <p className="mb-2 text-[13px] font-semibold text-primary">{eyebrow}</p>
      <h2
        className="brand:text-heading-section max-w-[560px] text-[32px] font-extrabold tracking-[-0.02em] text-foreground"
        data-testid={titleTestId}
      >
        {title}
      </h2>
    </header>
  );
}
