import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Bell, Lock, Eye, Heart, MessageCircle, User, PawPrint,
  ChevronRight, Moon, Globe, Trash2, LogOut, Shield, MapPin,
  Smartphone, Mail, ToggleLeft, Ban, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useGetMySettings,
  useUpdateMySettings,
  useLogoutUser,
  useDeleteMyAccount,
  useListBlockedUsers,
  useUnblockUser,
  exportMyData,
  getListBlockedUsersQueryKey,
  type UserSettings,
} from "@workspace/api-client-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { useT, useI18n, useFormatters, LANGUAGES } from "@/lib/i18n";

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
  const t = useT();
  const { language } = useI18n();
  const { formatDate } = useFormatters();
  const { toast } = useToast();
  const { refreshSession } = useAuth();
  const [, setLocation] = useLocation();
  const { data: settingsData, isLoading } = useGetMySettings();
  const updateMutation = useUpdateMySettings();
  const logout = useLogoutUser();
  const deleteAccount = useDeleteMyAccount();
  const queryClient = useQueryClient();
  const { data: blockedUsers } = useListBlockedUsers({
    query: { queryKey: getListBlockedUsersQueryKey() },
  });
  const unblock = useUnblockUser();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Built and saved in the browser rather than opened in a tab: the response
  // needs the session cookie, and a plain link to it would also leave the
  // file sitting in the address bar.
  const handleExport = async () => {
    setIsExporting(true);

    try {
      const data = await exportMyData();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `pawmate-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: t("settings.downloaded"), description: t("settings.downloadedBody") });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("settings.couldNotExport"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    await refreshSession();
    setLocation("/");
  };

  const handleUnblock = async (userId: string, firstName: string) => {
    try {
      await unblock.mutateAsync({ userId });
      await queryClient.invalidateQueries({ queryKey: getListBlockedUsersQueryKey() });
      toast({
        title: t("settings.unblocked"),
        description: t("settings.unblockedBody", { name: firstName }),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("settings.couldNotUnblock"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteOpen(false);

    try {
      await deleteAccount.mutateAsync();
      // The account is gone, so the cached session has to go with it.
      await refreshSession();
      setLocation("/");
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("settings.couldNotDelete"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

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
        title: t("settings.couldNotSave"),
        description: apiErrorMessage(err, t("common.tryAgain")),
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
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-1">{t("settings.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("settings.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8 max-w-2xl space-y-5">

        {/* Profile */}
        <Section title={t("settings.secProfile")}>
          <Link href="/profile/me" data-testid="link-settings-profile">
            <div className="flex items-center gap-4 py-4 px-1 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 border-2 border-border flex-shrink-0 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{t("settings.yourProfile")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.yourProfileBody")}</p>
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
                <p className="text-sm font-medium text-foreground">{t("settings.petProfile")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.petProfileBody")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>
        </Section>

        {/* Notifications */}
        <Section title={t("settings.secNotifications")}>
          <SettingRow
            icon={<Heart className="w-4 h-4 text-rose-500" />}
            iconBg="bg-rose-50"
            label={t("settings.newMatches")}
            description={t("settings.newMatchesBody")}
            toggle enabled={settings.notifyNewMatches}
            onToggle={toggle("notifyNewMatches")}
            testId="setting-new-matches"
          />
          <SettingRow
            icon={<MessageCircle className="w-4 h-4 text-primary" />}
            iconBg="bg-primary/10"
            label={t("settings.messages")}
            description={t("settings.messagesBody")}
            toggle enabled={settings.notifyMessages}
            onToggle={toggle("notifyMessages")}
            testId="setting-messages"
          />
          <SettingRow
            icon={<Eye className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.profileViews")}
            description={t("settings.profileViewsBody")}
            toggle enabled={settings.notifyProfileViews}
            onToggle={toggle("notifyProfileViews")}
            testId="setting-profile-views"
          />
          <SettingRow
            icon={<Mail className="w-4 h-4 text-blue-500" />}
            iconBg="bg-blue-50"
            label={t("settings.emailNotifs")}
            description={t("settings.emailNotifsBody")}
            toggle enabled={settings.notifyEmail}
            onToggle={toggle("notifyEmail")}
            testId="setting-email-notifs"
          />
          <SettingRow
            icon={<Smartphone className="w-4 h-4 text-violet-500" />}
            iconBg="bg-violet-50"
            label={t("settings.pushNotifs")}
            description={t("settings.pushNotifsBody")}
            toggle enabled={settings.notifyPush}
            onToggle={toggle("notifyPush")}
            testId="setting-push-notifs"
          />
        </Section>

        {/* Privacy */}
        <Section title={t("settings.secPrivacy")}>
          <SettingRow
            icon={<MapPin className="w-4 h-4 text-primary" />}
            iconBg="bg-primary/10"
            label={t("settings.showDistance")}
            description={t("settings.showDistanceBody")}
            toggle enabled={settings.privacyShowDistance}
            onToggle={toggle("privacyShowDistance")}
            testId="setting-show-distance"
          />
          <SettingRow
            icon={<Eye className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.lastActive")}
            description={t("settings.lastActiveBody")}
            toggle enabled={settings.privacyShowLastActive}
            onToggle={toggle("privacyShowLastActive")}
            testId="setting-last-active"
          />
          <SettingRow
            icon={<User className="w-4 h-4 text-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.showAge")}
            toggle enabled={settings.privacyShowAge}
            onToggle={toggle("privacyShowAge")}
            testId="setting-show-age"
          />
          <SettingRow
            icon={<Shield className="w-4 h-4 text-amber-600" />}
            iconBg="bg-amber-50"
            label={t("settings.incognito")}
            description={t("settings.incognitoBody")}
            toggle enabled={settings.privacyIncognito}
            onToggle={toggle("privacyIncognito")}
            testId="setting-incognito"
          />
          <SettingRow
            icon={<Lock className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.readReceipts")}
            description={t("settings.readReceiptsBody")}
            toggle enabled={settings.readReceiptsEnabled}
            onToggle={toggle("readReceiptsEnabled")}
            testId="setting-read-receipts"
          />
        </Section>

        {/* Preferences */}
        <Section title={t("settings.secPreferences")}>
          <SettingRow
            icon={<Moon className="w-4 h-4 text-indigo-400" />}
            iconBg="bg-indigo-50"
            label={t("settings.darkMode")}
            description={t("settings.darkModeBody")}
            toggle enabled={settings.darkMode}
            onToggle={toggle("darkMode")}
            testId="setting-dark-mode"
          />
          <SettingRow
            icon={<MapPin className="w-4 h-4 text-primary" />}
            iconBg="bg-primary/10"
            label={t("settings.locationServices")}
            description={t("settings.locationServicesBody")}
            toggle enabled={settings.locationServicesEnabled}
            onToggle={toggle("locationServicesEnabled")}
            testId="setting-location"
          />
          <SettingRow
            icon={<Globe className="w-4 h-4 text-muted-foreground" />}
            iconBg="bg-secondary"
            label={t("settings.language")}
            description={LANGUAGES.find((l) => l.code === language)?.label}
            testId="setting-language"
          />
          <Link href="/onboarding" data-testid="link-settings-discovery">
            <SettingRow
              icon={<ToggleLeft className="w-4 h-4 text-muted-foreground" />}
              iconBg="bg-secondary"
              label={t("settings.discovery")}
              description={t("settings.discoveryBody")}
              chevron
              testId="setting-discovery"
            />
          </Link>
        </Section>

        {/* Blocked members — only worth showing when there are any */}
        {blockedUsers && blockedUsers.length > 0 && (
          <Section title={t("settings.secBlocked")}>
            {blockedUsers.map((blocked) => (
              <div key={blocked.id} className="flex items-center gap-4 py-4 px-1">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {blocked.avatarUrl ? (
                    <img src={blocked.avatarUrl} alt={blocked.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <Ban className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{blocked.firstName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("settings.blockedOn", { date: formatDate(blocked.blockedAt) })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full flex-shrink-0"
                  onClick={() => handleUnblock(blocked.id, blocked.firstName)}
                  disabled={unblock.isPending}
                  data-testid={`btn-unblock-${blocked.id}`}
                >
                  {t("settings.unblock")}
                </Button>
              </div>
            ))}
          </Section>
        )}

        {/* Your data — sits above the danger zone because downloading a copy
            is the opposite of destructive, and often what someone actually
            wants before they reach for delete. */}
        <Section title={t("settings.secData")}>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full text-left disabled:opacity-60"
            data-testid="btn-settings-export"
          >
            <SettingRow
              icon={<Download className="w-4 h-4 text-primary" />}
              iconBg="bg-primary/10"
              label={isExporting ? t("settings.preparingFile") : t("settings.downloadData")}
              description={t("settings.downloadDataBody")}
              testId="setting-export-data"
            />
          </button>
        </Section>

        {/* Danger zone */}
        <Section title={t("settings.secDanger")}>
          <button type="button" onClick={handleLogout} className="w-full text-left" data-testid="btn-settings-signout">
            <SettingRow
              icon={<LogOut className="w-4 h-4 text-destructive" />}
              iconBg="bg-destructive/10"
              label={t("settings.signOut")}
              danger
              testId="setting-sign-out"
            />
          </button>
          <button type="button" onClick={() => setDeleteOpen(true)} className="w-full text-left" data-testid="btn-settings-delete">
            <SettingRow
              icon={<Trash2 className="w-4 h-4 text-destructive" />}
              iconBg="bg-destructive/10"
              label={t("settings.deleteAccount")}
              description={t("settings.deleteAccountBody")}
              danger
              testId="setting-delete-account"
            />
          </button>
        </Section>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground/50 pb-4">{t("settings.version")}</p>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.deleteBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="btn-delete-cancel">{t("settings.keepAccount")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} data-testid="btn-delete-confirm">
              {t("settings.deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
