import TradingInterface from '@/components/TradingInterface'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">GMX AVAX Trader</h1>
          <p className="text-gray-400">Trade AVAX with up to 10x leverage on Avalanche</p>
        </header>
        
        <main className="max-w-2xl mx-auto">
          <TradingInterface />
        </main>
        
        <footer className="text-center text-gray-500 text-sm mt-16">
          <p>Built on GMX v2 • Avalanche Network</p>
          <p className="mt-1">⚠️ High Risk: Leverage trading can result in total loss</p>
        </footer>
      </div>
    </div>
  );
}
