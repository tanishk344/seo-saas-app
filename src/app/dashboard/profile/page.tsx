"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { User, Calendar, CreditCard, Trash2 } from "lucide-react";
import { FREE_LIMITS } from "@/config/firebase";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, appUser, signOut } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (appUser) {
      setName(appUser.name);
    }
  }, [appUser]);

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setSaving(true);
    try {
      showToast("success", "Profile updated successfully!");
    } catch {
      showToast("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await user.delete();
      showToast("success", "Account deleted successfully");
      router.push("/");
    } catch {
      showToast("error", "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isFree = appUser?.plan === "free";
  const currentMonth = new Date().toISOString().slice(0, 7);
  const usage = appUser?.usage?.month === currentMonth ? appUser.usage : { audits: 0, keywords: 0, contentGenerations: 0 };

  if (!appUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account settings
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {appUser.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {appUser.email}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="email"
              label="Email"
              value={appUser.email}
              disabled
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isFree ? "bg-slate-100 dark:bg-slate-700" : "bg-primary-100 dark:bg-primary-900/30"}`}>
                <CreditCard className={`w-5 h-5 ${isFree ? "text-slate-600 dark:text-slate-400" : "text-primary-600 dark:text-primary-400"}`} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {isFree ? "Free Plan" : "Pro Plan"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isFree 
                    ? `Limited to ${FREE_LIMITS.audits} audits, ${FREE_LIMITS.keywords} keywords, ${FREE_LIMITS.contentGenerations} content generations/month`
                    : "Unlimited access to all features"
                  }
                </p>
              </div>
            </div>
            {isFree && (
              <Link href="/pricing">
                <Button>Upgrade to Pro</Button>
              </Link>
            )}
            {!isFree && appUser.subscription?.expiresAt && (
              <Badge variant="success">
                Expires: {formatDate(appUser.subscription.expiresAt.toDate())}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats (Free users) */}
      {isFree && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>Your current month usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Audits</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {usage.audits} / {FREE_LIMITS.audits}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Keywords</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {usage.keywords} / {FREE_LIMITS.keywords}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Content</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {usage.contentGenerations} / {FREE_LIMITS.contentGenerations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Member since {formatDate(appUser.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Delete Account</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
