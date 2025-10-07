import { AdminPanel } from '@/components/AdminPanel';
import { EmergencyQuizDeployer } from '@/components/EmergencyQuizDeployer';
import { Navigation } from '@/components/Navigation';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🔧 Admin Panel</h1>
          <p className="text-slate-400">
            Manage quizzes and debug contract issues
          </p>
        </div>

        <div className="space-y-8">
          <EmergencyQuizDeployer />
          <AdminPanel />
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This panel is for debugging contract issues.</p>
          <p>Only contract owners can create new quizzes.</p>
        </div>
      </div>
    </div>
  );
}