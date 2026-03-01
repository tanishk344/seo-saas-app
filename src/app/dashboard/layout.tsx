import { Sidebar } from "@/components/dashboard/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen">
          <div className="p-4 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
