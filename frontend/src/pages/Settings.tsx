import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Save
} from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useTheme } from '@/hooks/use-theme';

export default function Settings() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    notifications: {
      email: true,
      push: false,
      studyReminders: true
    },
    privacy: {
      publicProfile: false,
      shareProgress: true
    }
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    console.log('Settings saved:', settings);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b sticky top-0 z-40 bg-background">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-primary">Settings</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="heading-1 mb-2">Settings</h1>
          <p className="body text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <h2 className="heading-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile
              </h2>
              <p className="small text-muted-foreground">Update your personal information</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({...settings, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <h2 className="heading-3 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </h2>
              <p className="small text-muted-foreground">Customize how Padh.ai looks</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <h2 className="heading-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </h2>
              <p className="small text-muted-foreground">Manage your notification preferences</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: {...settings.notifications, email: checked}
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Study Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded to study regularly
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.studyReminders}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: {...settings.notifications, studyReminders: checked}
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <h2 className="heading-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy
              </h2>
              <p className="small text-muted-foreground">Control your privacy settings</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to others
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      privacy: {...settings.privacy, publicProfile: checked}
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Progress</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your learning progress
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.shareProgress}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      privacy: {...settings.privacy, shareProgress: checked}
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
