export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 text-slate-400" role="status" aria-live="polite">
      <div className="gem-loader" />
      <p className="font-display text-lg text-slate-300">Loading</p>
    </div>
  );
}
