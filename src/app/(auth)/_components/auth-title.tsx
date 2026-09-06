export default function AuthTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <h1 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.01em] text-foreground">{title}</h1>
      <p className="mb-8 text-sm text-tertiary-foreground">{subtitle}</p>
    </>
  );
}
