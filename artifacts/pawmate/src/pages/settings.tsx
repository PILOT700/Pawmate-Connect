import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Bell, Lock, Eye, Heart, MessageCircle, User, PawPrint,
  ChevronRight, Moon, Globe, Trash2, LogOut, Shield, MapPin,
  Smartphone, Mail, ToggleLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetMySettings, useUpdateMySettings, type UserSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}

function Toggle({ enabled, onChange, testId }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      data-testid={testId}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
        enabled ? "bg-primary" : "bg-secondary border border-border"
      }`}
    >
      <span
        className={`inline-block w-4.5 h-4.5 mt-[3px] rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          enabled ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  description?: string;
  toggle?: boolean;
  enabled?: boolean;
  onToggle?: (v: boolean) => void;
  chevron?: boolean;
  danger?: boolean;
  testId?: string;
}

function SettingRow({ icon, iconBg = "bg-secondary", label, description, toggle, enabled, onToggle, chevron, danger, testId }: SettingRowProps) {
  return (
    <div className={`flex items-center gap-4 py-4 px-1 ${danger ? "group cursor-pointer" : ""}`} data-testid={testId}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
      {toggle && onToggle !== undefined && (
        <Toggle enabled={!!enabled} onChange={onToggle} testId={testId ? `toggle-${testId}` : undefined} />
      )}
      {chevron && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="px-5 pt-5 pb-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-4 divide-y divide-border/50">
        {children}
      </div>
    </motion.div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const { data: settingsData, isLoading } = useGetMySettings();
  const updateMutation = useUpdateMySettings();

  type EditableSettings = Omit<UserSettings, "userId">;

  const DEFAULT_SETTINGS: EditableSettings = {
    notifyNewMatches: true,
    notifyMessages: true,
    notifyProfileViews: false,
    notifyWeeklyDigest: true,
    notifyEmail: false,
    notifyPush: true,
    privacyShowDistance: true,
    privacyShowLastActive: false,
    privacyShowAge: true,
    privacyIncognito: false,
    privacyShareActivity: true,
    darkMode: false,
    locationServicesEnabled: true,
    readReceiptsEnabled: true,
  };

  const [settings, setSettings] = useState<EditableSettings>(DEFAULT_SETTINGS);

  // Load settings from API on mount
  useEffect(() => {
    if (settingsData) {
      setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
    }
  }, [settingsData]);

  const toggle = (key: keyof EditableSettings) => async (v: boolean) => {
    setSettings(prev => ({ ...prev, [key]: v }));

    try {
      await updateMutation.mutateAsync({ data: { [key]: v } });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: apiErrorMessage(err, "Failed to save settings"),
      });
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !v }));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 py-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8 max-w-2xl space-y-5">

        {/* Profile */}
        <Section title="Profile">
          <Link href="/profile/me" data-testid="link-settings-profile">
            <div className="flex items-center gap-4 py-4 px-1 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 border-2 border-border flex-shrink-0 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Your Profile</p>
                <p className="text-xs text-muted-foreground">Edit photos, bio, and lifestyle tags</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>
          <Link href="/create-profile" data-testid="link-settings-pet">
            <div className="flex items-center gap-4 py-4 px-1 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <PawPrint className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Pet Profile</p>
                <p className="text-xs text-muted-foreground">Update your pet's details and photos</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow
            icon={<Heart className="w-4 h-4 text-rose-500" />}
            iconBg="bg-rose-50"
            label="New matches"
            description="When someone likes you back"
            toggle enabled={settings.notifyNewMatches}
            onToggle={toggle("notifyNewMatches")}
            testId="setting-new-matches"
          />
          <SettingRow
            icon={<MessageCircle className="w-4 h-4 text-primary" />}
            iconBg="bg-primary/10"
            label="Messages"
            description="When you receive a new message"
            toggle enabled={settings.notifyMessages}
            onToggle={toggle("notifyMessages")}
            testId="setting-messages"
          />
          <SettingRow
            icon={<Eye className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Profile views"
            description="When someone visits your profile"
            toggle enabled={settings.notifyProfileViews}
            onToggle={toggle("notifyProfileViews")}
            testId="setting-profile-views"
          />
          <SettingRow
            icon={<Mail className="w-4 h-4 text-blue-500" />}
            iconBg="bg-blue-50"
            label="Email notifications"
            description="Weekly digest and match summaries"
            toggle enabled={settings.notifyEmail}
            onToggle={toggle("notifyEmail")}
            testId="setting-email-notifs"
          />
          <SettingRow
            icon={<Smartphone className="w-4 h-4 text-violet-500" />}
            iconBg="bg-violet-50"
            label="Push notifications"
            description="Real-time alerts on your device"
            toggle enabled={settings.notifyPush}
            onToggle={toggle("notifyPush")}
            testId="setting-push-notifs"
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <SettingRow
            icon={<MapPin className="w-4 h-4 text-primary" />}
            iconBg="bg-primary/10"
            label="Show distance"
            description="Let others see how far away you are"
            toggle enabled={settings.privacyShowDistance}
            onToggle={toggle("privacyShowDistance")}
            testId="setting-show-distance"
          />
          <SettingRow
            icon={<Eye className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Show last active"
            description="Display when you were last online"
            toggle enabled={settings.privacyShowLastActive}
            onToggle={toggle("privacyShowLastActive")}
            testId="setting-last-active"
          />
          <SettingRow
            icon={<User className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label="Show age on profile"
            toggle enabled={settings.privacyShowAge}
            onToggle={toggle("privacyShowAge")}
            testId="setting-show-age"
          />
          <SettingRow
            icon={<Shield className="w-4 h-4 text-amber-600" />}
            iconBg="bg-amber-50"
            label="Incognito mode"
            description="Browse profiles without being seen"
            toggle enabled={settings.privacyIncognito}
            onToggle={toggle("privacyIncognito")}
            testId="setting-incognito"
          />
          <SettingRow
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Read receipts"
            description="Let matches know when you've read their messages"
            toggle enabled={settings.readReceiptsEnabled}
            onToggle={toggle("readReceiptsEnabled")}
            testId="setting-read-receipts"
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <SettingRow
            icon={<Moon className="w-4 h-4 text-indigo-400" />}
            iconBg="bg-indigo-50"
            label="Dark mode"
            description="Easy on the eyes at night"
            toggle enabled={settings.darkMode}
            onToggle={toggle("darkMode")}
            testId="setting-dark-mode"
          />
          <SettingRow
            icon={<MapPin className="w-4 h-4 text-primary" />}
            iconBg="bg-primary/10"
            label="Location services"
            description="Used to show nearby members"
            toggle enabled={settings.locationServicesEnabled}
            onToggle={toggle("locationServicesEnabled")}
            testId="setting-location"
          />
          <SettingRow
            icon={<Globe className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Language"
            description="English"
            chevron
            testId="setting-language"
          />
          <SettingRow
            icon={<ToggleLeft className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Discovery preferences"
            description="Age range, distance, pet type"
            chevron
            testId="setting-discovery"
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          <SettingRow
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Change password"
            chevron
            testId="setting-password"
          />
          <SettingRow
            icon={<Mail className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Change email"
            description="hello@example.com"
            chevron
            testId="setting-email"
          />
          <SettingRow
            icon={<Shield className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Two-factor authentication"
            description="Not enabled"
            chevron
            testId="setting-2fa"
          />
        </Section>

        {/* Support */}
        <Section title="Support">
          <SettingRow
            icon={<Shield className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Privacy policy"
            chevron
            testId="setting-privacy-policy"
          />
          <SettingRow
            icon={<Globe className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Terms of service"
            chevron
            testId="setting-terms"
          />
          <SettingRow
            icon={<MessageCircle className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label="Contact support"
            chevron
            testId="setting-support"
          />
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <Link href="/" data-testid="link-settings-signout">
            <SettingRow
              icon={<LogOut className="w-4 h-4 text-destructive" />}
              iconBg="bg-destructive/10"
              label="Sign out"
              danger
              testId="setting-sign-out"
            />
          </Link>
          <SettingRow
            icon={<Trash2 className="w-4 h-4 text-destructive" />}
            iconBg="bg-destructive/10"
            label="Delete account"
            description="Permanently remove your profile and all data"
            danger
            testId="setting-delete-account"
          />
        </Section>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground/50 pb-4">Pawmate v1.0 · Made with care for pet lovers</p>
      </div>
    </div>
  );
}
