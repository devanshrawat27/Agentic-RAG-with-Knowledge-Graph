"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app/AppShell";
import {
  changePassword,
  fetchHealth,
  getMe,
  logout,
  updateProfile,
  type HealthResponse,
  type UserPublic,
} from "@/lib/api";

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMe(), fetchHealth().catch(() => null)])
      .then(([me, info]) => {
        if (cancelled) return;
        setUser(me);
        setName(me.name);
        setHealth(info);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "";
        if (
          message.includes("401") ||
          message.toLowerCase().includes("authenticated")
        ) {
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || profileBusy) return;
    setProfileBusy(true);
    setProfileError("");
    setProfileNotice("");
    try {
      const updated = await updateProfile(name.trim());
      setUser(updated);
      setName(updated.name);
      setProfileNotice("Profile updated");
      window.dispatchEvent(new CustomEvent("user:changed"));
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setProfileBusy(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordBusy) return;
    setPasswordError("");
    setPasswordNotice("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("Choose a password different from the current one.");
      return;
    }

    setPasswordBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice("Password updated");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPasswordBusy(false);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  const initials = initialsOf(user?.name ?? "");

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-[30px] font-semibold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-1.5 text-[14px] text-white/55">
            Manage your account and see how this workspace is configured.
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-2.5 py-16 text-[13px] text-white/45">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400" />
            Loading settings…
          </div>
        ) : (
          <div className="mt-7 space-y-5">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-slate-600/60 via-slate-800/70 to-black text-[18px] font-semibold tracking-wide text-white/90">
                  {initials}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0b0d] bg-emerald-400" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-white">
                    Profile
                  </h2>
                  <p className="text-[12.5px] text-white/45">
                    {user?.email ?? ""} · verified
                  </p>
                </div>
              </div>

              <form onSubmit={onSaveProfile} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Display name
                    </span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={120}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13.5px] text-white outline-none transition focus:border-cyan-400/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Email
                    </span>
                    <input
                      value={user?.email ?? ""}
                      readOnly
                      className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[13.5px] text-white/45 outline-none"
                    />
                  </label>
                </div>

                {profileError && (
                  <p className="rounded-lg border border-red-500/25 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-300">
                    {profileError}
                  </p>
                )}
                {profileNotice && (
                  <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-2 text-[12.5px] text-emerald-300">
                    {profileNotice}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!name.trim() || profileBusy}
                    className="rounded-lg bg-white px-4 py-2 text-[12.5px] font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
                  >
                    {profileBusy ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </form>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <h2 className="text-[15px] font-semibold text-white">
                Change password
              </h2>
              <p className="mt-0.5 text-[12.5px] text-white/45">
                You&apos;ll stay signed in on this device after changing it.
              </p>

              <form onSubmit={onChangePassword} className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                    Current password
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13.5px] text-white outline-none transition focus:border-cyan-400/40"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                      New password
                    </span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13.5px] text-white outline-none transition focus:border-cyan-400/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Confirm new password
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13.5px] text-white outline-none transition focus:border-cyan-400/40"
                    />
                  </label>
                </div>

                {passwordError && (
                  <p className="rounded-lg border border-red-500/25 bg-red-500/[0.06] px-3 py-2 text-[12.5px] text-red-300">
                    {passwordError}
                  </p>
                )}
                {passwordNotice && (
                  <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-2 text-[12.5px] text-emerald-300">
                    {passwordNotice}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      passwordBusy
                    }
                    className="rounded-lg bg-white px-4 py-2 text-[12.5px] font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
                  >
                    {passwordBusy ? "Updating…" : "Update password"}
                  </button>
                </div>
              </form>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <h2 className="text-[15px] font-semibold text-white">Session</h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-white/75">{user?.name}</p>
                  <p className="text-[12px] text-white/40">{user?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-[12.5px] font-medium text-white/65 transition hover:border-red-500/30 hover:text-red-300 disabled:opacity-40"
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <h2 className="text-[15px] font-semibold text-white">
                Workspace
              </h2>
              <dl className="mt-3 grid gap-2 text-[12.5px] sm:grid-cols-2">
                <div className="flex justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <dt className="text-white/40">Service</dt>
                  <dd className="text-white/75">{health?.service ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <dt className="text-white/40">Version</dt>
                  <dd className="text-white/75">{health?.version ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <dt className="text-white/40">LLM configured</dt>
                  <dd className="text-white/75">
                    {health ? (health.llm_configured ? "Yes" : "No") : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <dt className="text-white/40">Embeddings</dt>
                  <dd className="text-white/75">
                    {health?.embedding_provider ?? "—"}
                  </dd>
                </div>
              </dl>
            </motion.section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
