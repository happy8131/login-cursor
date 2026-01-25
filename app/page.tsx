import Navigation from './components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-8">
      <Navigation />
      <div className="flex items-center gap-2 text-gray-800 text-xl">
        <span>Home 페이지입니다</span>
        <span className="text-2xl">🏠</span>
      </div>
    </div>
  );
}
