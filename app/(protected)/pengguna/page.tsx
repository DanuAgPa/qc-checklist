'use client';

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ROLE_LABELS } from '@/lib/access';
import type { Role } from '@/app/types';
import {
  createUserAction,
  updateUserRoleAction,
  toggleUserActiveAction,
  resetUserPasswordAction,
} from './actions';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

function UserActionButtons({
  user,
  sessionUser,
  onToggleActive,
  onResetPassword,
  onDeactivate,
}: {
  user: UserRecord;
  sessionUser: { userId: string } | undefined;
  onToggleActive: (id: string, currentlyActive: boolean) => void;
  onResetPassword: (user: UserRecord) => void;
  onDeactivate: (user: UserRecord) => void;
}) {
  const isSelf = Boolean(sessionUser && user.id === sessionUser.userId);

  const smallButton = (
    variant: 'deactivate' | 'activate' | 'reset',
    disabled: boolean,
    onClick: () => void,
    label: string
  ) => {
    const base =
      'h-[32px] px-3 text-[13px] font-semibold rounded-[8px] border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    const styles: Record<string, string> = {
      deactivate:
        'border-fail-fg/30 text-fail-fg hover:bg-fail-bg active:bg-fail-bg/50',
      activate:
        'border-pass-fg/30 text-pass-fg hover:bg-pass-bg active:bg-pass-bg/50',
      reset:
        'border-border text-accent hover:bg-surface-hover active:bg-surface-hover',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${styles[variant]}`}
      >
        {disabled ? 'Memproses...' : label}
      </button>
    );
  };

  if (isSelf) {
    return <span className="text-[12px] text-text-muted">Akun Anda</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {user.isActive ? (
        smallButton(
          'deactivate',
          false,
          () => onDeactivate(user),
          'Nonaktifkan'
        )
      ) : (
        smallButton(
          'activate',
          false,
          () => onToggleActive(user.id, false),
          'Aktifkan'
        )
      )}
      <button
        type="button"
        onClick={() => onResetPassword(user)}
        className="flex-1 h-[32px] text-[13px] font-semibold border border-border text-accent hover:bg-surface-hover active:bg-surface-hover rounded-[8px] transition-colors duration-150 bg-surface"
      >
        Reset Password
      </button>
    </div>
  );
}

function UserRowDesktop({
  user,
  sessionUser,
  onToggleActive,
  onChangeRole,
  onResetPassword,
  onDeactivate,
}: {
  user: UserRecord;
  sessionUser: { userId: string } | undefined;
  onToggleActive: (id: string, currentlyActive: boolean) => void;
  onChangeRole: (id: string, role: Role) => void;
  onResetPassword: (user: UserRecord) => void;
  onDeactivate: (user: UserRecord) => void;
}) {
  const isSelf = Boolean(sessionUser && user.id === sessionUser.userId);

  return (
    <tr
      key={user.id}
      className="border-b border-border hover:bg-surface-hover transition-colors duration-150"
    >
      <td className="px-4 py-3 font-medium text-text">
        {user.name}
        {isSelf && (
          <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-[4px] bg-surface-hover text-text-muted">
            Anda
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-text-muted tabular-nums">{user.email}</td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-[13px] font-medium text-text">
            {ROLE_LABELS[user.role] || user.role}
          </span>
        ) : (
          <select
            value={user.role}
            onChange={(e) =>
              onChangeRole(user.id, e.target.value as Role)}
            className="rounded-[8px] border border-border bg-surface px-3 py-2 text-[14px] text-text focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 h-[44px]"
          >
            <option value="QC_WEB">QC Web</option>
            <option value="QC_MOBILE">QC Mobile</option>
            <option value="QC_API">QC API</option>
            <option value="PRODUCT_MANAGER">Product Manager</option>

          </select>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-[12px] font-semibold px-2 py-0.5 rounded-[6px] ${
            user.isActive
              ? 'bg-pass-bg text-pass-fg'
              : 'bg-fail-bg text-fail-fg'
          }`}
        >
          {user.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td className="px-4 py-3">
        <UserActionButtons
          user={user}
          sessionUser={sessionUser}
          onToggleActive={onToggleActive}
          onResetPassword={onResetPassword}
          onDeactivate={onDeactivate}
        />
      </td>
    </tr>
  );
}

function UserCardMobile({
  user,
  sessionUser,
  onToggleActive,
  onChangeRole,
  onResetPassword,
  onDeactivate,
}: {
  user: UserRecord;
  sessionUser: { userId: string } | undefined;
  onToggleActive: (id: string, currentlyActive: boolean) => void;
  onChangeRole: (id: string, role: Role) => void;
  onResetPassword: (user: UserRecord) => void;
  onDeactivate: (user: UserRecord) => void;
}) {
  const isSelf = Boolean(sessionUser && user.id === sessionUser.userId);

  return (
    <div
      key={user.id}
      className="border-b border-border px-4 py-4 last:border-0 hover:bg-surface-hover transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[14px] text-text">{user.name}</span>
            {isSelf && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-surface-hover text-text-muted">
                Anda
              </span>
            )}
          </div>
          <p className="text-[13px] text-text-muted tabular-nums">{user.email}</p>
        </div>
        <span
          className={`text-[12px] font-semibold px-2 py-0.5 rounded-[6px] ${
            user.isActive
              ? 'bg-pass-bg text-pass-fg'
              : 'bg-fail-bg text-fail-fg'
          }`}
        >
          {user.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={user.role}
          onChange={(e) => onChangeRole(user.id, e.target.value as Role)}
          className="rounded-[8px] border border-border bg-surface px-3 py-2 text-[14px] text-text focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 h-[44px]"
          disabled={isSelf}
        >
          <option value="QC_WEB">QC Web</option>
          <option value="QC_MOBILE">QC Mobile</option>
          <option value="QC_API">QC API</option>
          <option value="PRODUCT_MANAGER">Product Manager</option>

        </select>
        <div className="flex items-center gap-2">
          {isSelf ? (
            <span className="text-[12px] text-text-muted">Akun Anda</span>
          ) : (
            <>
              {user.isActive ? (
                <button
                  type="button"
                  onClick={() => onDeactivate(user)}
                  className="flex-1 h-[44px] text-[13px] font-semibold border border-fail-fg/30 text-fail-fg hover:bg-fail-bg active:bg-fail-bg/50 rounded-[8px] transition-colors duration-150"
                >
                  Nonaktifkan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleActive(user.id, false)}
                  className="flex-1 h-[44px] text-[13px] font-semibold border border-pass-fg/30 text-pass-fg hover:bg-pass-bg active:bg-pass-bg/50 rounded-[8px] transition-colors duration-150"
                >
                  Aktifkan
                </button>
              )}
              <button
                type="button"
                onClick={() => onResetPassword(user)}
                className="flex-1 h-[44px] text-[13px] font-semibold border border-border text-accent hover:bg-surface-hover active:bg-surface-hover rounded-[8px] transition-colors duration-150 bg-surface"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PenggunaPage() {
  const { user: sessionUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRecord['role']>('QC_WEB');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [resetTargetUser, setResetTargetUser] = useState<UserRecord | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState<UserRecord | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = (await res.json()) as { users: UserRecord[] };
        setUsers(data.users);
        setLoadError(false);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch('/api/users');
        if (res.ok && !ignore) {
          const data = (await res.json()) as { users: UserRecord[] };
          setUsers(data.users);
          setLoadError(false);
        }
        if (!ignore && !res.ok) {
          setLoadError(true);
        }
      } catch {
        if (!ignore) setLoadError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }

  async function handleAddUser(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setActionError('');
    setActionSuccess('');
    setFormLoading(true);

    const res = await createUserAction({
      name: formName,
      email: formEmail,
      password: formPassword,
      role: formRole,
    });

    if (res.error) {
      setFormError(res.error);
      setFormLoading(false);
      return;
    }

    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('QC_WEB');
    setShowForm(false);
    setFormLoading(false);
    showToast('Pengguna baru berhasil ditambahkan.', 'success');
    await fetchUsers();
  }

  async function handleChangeRole(userId: string, newRole: UserRecord['role']) {
    setActionError('');
    setActionSuccess('');
    const res = await updateUserRoleAction(userId, newRole);
    if (res.error) {
      setActionError(res.error);
      showToast(res.error, 'error');
    } else {
      showToast('Role pengguna berhasil diubah.', 'success');
    }
    await fetchUsers();
  }

  async function handleToggleActive(userId: string, currentlyActive: boolean) {
    setActionError('');
    setActionSuccess('');
    const res = await toggleUserActiveAction(userId, currentlyActive);
    if (res.error) {
      setActionError(res.error);
      showToast(res.error, 'error');
    } else {
      showToast(
        `Pengguna berhasil ${currentlyActive ? 'dinonaktifkan' : 'diaktifkan'}.`,
        'success'
      );
    }
    await fetchUsers();
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetError('');
    setResetLoading(true);

    const res = await resetUserPasswordAction(resetTargetUser.id, resetNewPassword);
    if (res.error) {
      setResetError(res.error);
      setResetLoading(false);
      return;
    }

    setResetLoading(false);
    setResetTargetUser(null);
    setResetNewPassword('');
    showToast(`Password untuk ${resetTargetUser.name} berhasil direset.`, 'success');
  }

  async function handleDeactivateConfirm(userId: string) {
    if (!deactivateTarget) return;
    const res = await toggleUserActiveAction(userId, true);
    setDeactivateTarget(null);
    if (res.error) {
      setActionError(res.error);
      showToast(res.error, 'error');
    } else {
      showToast(`Akun ${deactivateTarget.name} dinonaktifkan.`, 'success');
    }
    await fetchUsers();
  }

  const inputClass =
    'w-full rounded-[8px] border border-border bg-surface px-3.5 py-3 text-[16px] text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring/10 transition-colors duration-150 h-[44px]';

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-[-0.02em] leading-tight mb-2">
            Kelola Pengguna
          </h1>
          <p className="text-[14px] text-text-muted font-normal">
            Tambah, ubah role, reset password, atau nonaktifkan akun pengguna.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setFormError('');
          }}
          className="w-full lg:w-auto h-[44px] px-4 text-[14px] font-semibold rounded-[8px] bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
        >
          {showForm ? 'Batal' : 'Tambah Pengguna'}
        </button>
      </div>

      {actionError && (
        <div className="mb-5 p-3.5 rounded-[8px] bg-[var(--fail-bg)] border border-[var(--fail-fg)]/20 text-fail-fg text-[14px] font-medium flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="text-[13px] font-semibold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-5 p-3.5 rounded-[8px] bg-[var(--pass-bg)] border border-[var(--pass-fg)]/20 text-pass-fg text-[14px] font-medium flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess('')}
            className="text-[13px] font-semibold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {toast && (
        <div className="mb-4 p-3.5 rounded-[8px] flex items-center justify-between gap-3 ${
          toast.type === 'success'
            ? 'bg-[var(--pass-bg)] border border-[var(--pass-fg)]/20 text-pass-fg'
            : 'bg-[var(--fail-bg)] border border-[var(--fail-fg)]/20 text-fail-fg'
        }">
          <span className="text-[14px] font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[13px] font-semibold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-surface border border-border rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 sm:p-6 mb-6">
          <h2 className="text-[14px] font-semibold text-text mb-4">Pengguna Baru</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="add-name" className="block text-[13px] font-semibold text-label">
                Nama
              </label>
              <input
                id="add-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="Nama lengkap"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-email" className="block text-[13px] font-semibold text-label">
                Email
              </label>
              <input
                id="add-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                placeholder="email@contoh.com"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-password" className="block text-[13px] font-semibold text-label">
                Password
              </label>
              <input
                id="add-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required
                placeholder="Minimal 6 karakter"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-role" className="block text-[13px] font-semibold text-label">
                Role
              </label>
              <select
                id="add-role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRecord['role'])}
                className={inputClass}
              >
                <option value="QC_WEB">QC Web</option>
                <option value="QC_MOBILE">QC Mobile</option>
                <option value="QC_API">QC API</option>
                <option value="PRODUCT_MANAGER">Product Manager</option>
    
              </select>
            </div>
            {formError && (
              <p className="text-[14px] text-fail-fg font-medium">{formError}</p>
            )}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full h-[48px] text-[15px] font-semibold rounded-[8px] bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-60"
            >
              {formLoading ? 'Menyimpan...' : 'Simpan Pengguna'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="border border-border rounded-[10px] bg-surface px-4 sm:px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] text-text-muted">Memuat data pengguna...</p>
        </div>
      ) : loadError ? (
        <div className="border border-border rounded-[10px] bg-surface px-4 sm:px-6 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[14px] text-fail-fg font-medium">
            Gagal memuat data pengguna dari server.
          </p>
          <button
            type="button"
            onClick={() => void fetchUsers()}
            className="mt-3 h-[44px] px-4 text-[14px] font-semibold text-accent hover:underline border border-border rounded-[8px] bg-surface transition-colors duration-150"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <div className="border border-border rounded-[10px] overflow-hidden bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <table className="w-full text-[14px] text-left">
                <thead>
                  <tr className="bg-surface-hover border-b border-border sticky top-0 z-10">
                    <th className="px-4 py-3 font-semibold text-text-muted text-[11px] tracking-tight">Nama</th>
                    <th className="px-4 py-3 font-semibold text-text-muted text-[11px] tracking-tight">Email</th>
                    <th className="px-4 py-3 font-semibold text-text-muted text-[11px] tracking-tight">Role</th>
                    <th className="px-4 py-3 font-semibold text-text-muted text-[11px] tracking-tight">Status</th>
                    <th className="px-4 py-3 font-semibold text-text-muted text-[11px] tracking-tight">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <UserRowDesktop
                      key={u.id}
                      user={u}
                      sessionUser={sessionUser}
                      onToggleActive={handleToggleActive}
                      onChangeRole={handleChangeRole}
                      onResetPassword={(user) => {
                        setResetTargetUser(user);
                        setResetNewPassword('');
                        setResetError('');
                      }}
                      onDeactivate={(user) => setDeactivateTarget(user)}
                    />
                  ))}
                </tbody>
              </table>
              <div className="bg-surface-hover border-t border-border px-4 py-2.5 text-[12px] text-text-muted">
                {users.length} pengguna terdaftar
              </div>
            </div>
          </div>

          <div className="lg:hidden">
            <div className="border border-border rounded-[10px] overflow-hidden bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {users.map((u) => (
                <UserCardMobile
                  key={u.id}
                  user={u}
                  sessionUser={sessionUser}
                  onToggleActive={handleToggleActive}
                  onChangeRole={handleChangeRole}
                  onResetPassword={(user) => {
                    setResetTargetUser(user);
                    setResetNewPassword('');
                    setResetError('');
                  }}
                  onDeactivate={(user) => setDeactivateTarget(user)}
                />
              ))}
              <div className="bg-surface-hover border-t border-border px-4 py-3 text-[12px] text-text-muted">
                {users.length} pengguna terdaftar
              </div>
            </div>
          </div>
        </>
      )}

      {resetTargetUser && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-surface border border-border rounded-[10px] shadow-lg max-w-sm w-full p-6">
            <h3 className="text-[16px] font-bold text-text mb-2">
              Reset Password
            </h3>
            <p className="text-[14px] text-text-muted mb-4">
              Masukkan password baru untuk pengguna <span className="font-semibold text-text">{resetTargetUser.name}</span> ({resetTargetUser.email}).
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="reset-pw"
                  className="block text-[13px] font-semibold text-label"
                >
                  Password Baru
                </label>
                <input
                  id="reset-pw"
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  className={inputClass}
                  autoFocus
                />
              </div>

              {resetError && (
                <p className="text-[13px] text-fail-fg font-medium">{resetError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="h-[44px] px-4 text-[14px] font-semibold rounded-[8px] border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-150"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="h-[44px] px-4 text-[14px] font-semibold rounded-[8px] bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-60"
                >
                  {resetLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deactivateTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="bg-surface border border-border rounded-[10px] shadow-lg max-w-sm w-full p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-dialog-title"
          >
            <h3
              id="deactivate-dialog-title"
              className="text-[16px] font-bold text-text mb-3"
            >
              Nonaktifkan akun ini?
            </h3>
            <p className="text-[14px] text-text-muted mb-6">
              {deactivateTarget.name} tidak akan bisa masuk. Riwayat testing yang pernah diinput tetap tersimpan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeactivateTarget(null)}
                className="h-[44px] px-4 text-[14px] font-semibold rounded-[8px] border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors duration-150"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeactivateConfirm(deactivateTarget.id)}
                className="h-[44px] px-4 text-[14px] font-semibold rounded-[8px] bg-fail-fg text-white hover:bg-fail-fg/90 transition-colors duration-150"
              >
                Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
