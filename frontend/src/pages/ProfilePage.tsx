import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings.</p>
        </header>

        <div className="space-y-8">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">User Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
             <h2 className="text-2xl font-semibold mb-4">Actions</h2>
             <Button variant="destructive" onClick={logout}>
                Log Out
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
