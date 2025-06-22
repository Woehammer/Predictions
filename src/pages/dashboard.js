console.log("✅ dashboard.js is loading");
import Header from '../components/Header';

export default function Dashboard() {
  return (
    <div>
      <Header />
      <div className="p-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p>Here you will see your leagues, predictions, and standings.</p>
      </div>
    </div>
  );
}
