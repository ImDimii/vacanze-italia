export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center text-text-secondary">
      <div className="w-16 h-16 border-4 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin mb-6" />
      <h2 className="text-xl font-bold text-white mb-2 font-heading">Caricamento in corso...</h2>
      <p>Stiamo preparando le informazioni per te.</p>
    </div>
  );
}
