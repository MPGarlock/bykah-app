import { AffordCalculator } from './_components/afford-calculator';

export default function AffordPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-gold mb-2">Can I Afford It?</h1>
          <p className="font-sans text-slate-muted text-lg">
            Run any major purchase through the BYKAH framework before you commit.
          </p>
        </div>
        <AffordCalculator />
      </div>
    </div>
  );
}
