type FunctioningStepProps = {
  number: number;
  title: string;
  description: string;
};

export function FunctioningStep({ number, title, description }: FunctioningStepProps) {
  return (
    <div>
      <p className="mb-4 text-4xl font-extrabold tracking-tight text-landing-faint">{number}</p>
      <h3 className="mb-2.5 text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-tertiary-foreground">{description}</p>
    </div>
  );
}
