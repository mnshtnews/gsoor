"use client";

import { LocalizedContent } from "@/components/LocalizedContent";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CmsError, cms } from "@/lib/cms-client";
import { useUiLocale } from "@/lib/use-ui-locale";

type NewsroomRole = "Reporter" | "Researcher" | "AiEditor" | "CopyEditor" | "SeniorEditor" | "ManagingEditor" | "EditorInChief" | "FactChecker" | "SeoEditor" | "CrisisEditor" | "SystemAdmin";
type AdminPermission = "Users.View" | "Users.Create" | "Users.ManageRoles";
type UserRow = { id: string; email: string | null; displayName: string; roles: NewsroomRole[]; permissions: AdminPermission[] };
type UsersPage = { items: UserRow[]; page: number; pageSize: number; totalCount: number; totalPages: number };
const ROLE_NAMES: Record<NewsroomRole, string> = { Reporter: "مراسل", Researcher: "باحث", AiEditor: "محرر ذكاء اصطناعي", CopyEditor: "مدقق لغوي", SeniorEditor: "محرر أول", ManagingEditor: "مدير التحرير", EditorInChief: "رئيس التحرير", FactChecker: "مدقق حقائق", SeoEditor: "محرر SEO", CrisisEditor: "محرر اطمّن", SystemAdmin: "مدير النظام" };
const ROLES = Object.keys(ROLE_NAMES) as NewsroomRole[];
const PERMISSION_LABELS: Record<AdminPermission, string> = { "Users.View": "عرض المستخدمين والصلاحيات", "Users.Create": "إنشاء حسابات المستخدمين", "Users.ManageRoles": "منح وسحب أدوار المستخدمين" };
const PERMISSIONS = Object.keys(PERMISSION_LABELS) as AdminPermission[];

async function usersApi<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/cms-api/admin-users${path}`, { method, credentials: "same-origin", cache: "no-store", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { message?: string };
    throw new CmsError(data.message ?? (response.status === 403 ? "ليست لديك صلاحية إدارة المستخدمين." : "تعذر تنفيذ الطلب."), response.status);
  }
  return response.json() as Promise<T>;
}

export default function CmsUsersPage() {
  const { locale, t } = useUiLocale();
  const router = useRouter();
  const [data, setData] = useState<UsersPage | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ displayName: "", email: "", password: "", role: "Reporter" as NewsroomRole });
  const [creating, setCreating] = useState(false);
  const isSystemAdmin = roles.includes("SystemAdmin");
  const canView = isSystemAdmin || roles.includes("EditorInChief") || permissions.includes("Users.View") || permissions.includes("Users.ManageRoles");
  const canCreate = isSystemAdmin || permissions.includes("Users.Create");
  const canManageRoles = isSystemAdmin || permissions.includes("Users.ManageRoles");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const session = await cms.session();
      if (!session.authenticated) { router.replace("/cms/login"); return; }
      setRoles(session.roles ?? []); setPermissions(session.permissions ?? []);
      const query = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search.trim()) query.set("search", search.trim());
      setData(await usersApi<UsersPage>(`?${query}`));
    } catch (e) {
      if (e instanceof CmsError && e.status === 401) router.replace("/cms/login");
      else setError(e instanceof Error ? e.message : "تعذر تحميل المستخدمين.");
    } finally { setLoading(false); }
  }, [page, router, search]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), search ? 250 : 0); return () => window.clearTimeout(timer); }, [load, search]);

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true); setError(null); setNotice(null);
    try {
      await usersApi("", "POST", newUser);
      setNewUser({ displayName: "", email: "", password: "", role: "Reporter" });
      setNotice("تم إنشاء الحساب وإسناد الدور. سلّم بيانات الدخول للموظف عبر قناة آمنة.");
      if (page === 1) await load(); else setPage(1);
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر إنشاء الحساب."); }
    finally { setCreating(false); }
  }
  async function changeRole(user: UserRow, role: NewsroomRole, action: "grant" | "revoke") {
    const key = `${user.id}:${role}`; setBusy(key); setError(null); setNotice(null);
    try {
      await usersApi(`/${encodeURIComponent(user.id)}/roles${action === "revoke" ? `/${role}` : ""}`, action === "grant" ? "POST" : "DELETE", action === "grant" ? { role } : undefined);
      setNotice(action === "grant" ? `تم منح دور ${ROLE_NAMES[role]} للمستخدم.` : `تم سحب دور ${ROLE_NAMES[role]} من المستخدم.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحديث الأدوار."); }
    finally { setBusy(null); }
  }
  async function changePermission(user: UserRow, permission: AdminPermission, action: "grant" | "revoke") {
    const key = `${user.id}:${permission}`; setBusy(key); setError(null); setNotice(null);
    try {
      await usersApi(`/${encodeURIComponent(user.id)}/permissions${action === "revoke" ? `/${encodeURIComponent(permission)}` : ""}`, action === "grant" ? "POST" : "DELETE", action === "grant" ? { permission } : undefined);
      setNotice(action === "grant" ? `تم منح ${PERMISSION_LABELS[permission]} إلى ${user.displayName}.` : `تم سحب ${PERMISSION_LABELS[permission]} من ${user.displayName}.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحديث الصلاحيات المباشرة."); }
    finally { setBusy(null); }
  }

  return <LocalizedContent>{<div className="cms-page-stack">
    <section className="cms-page-heading"><div><span className="cms-eyebrow">إدارة المنصة</span><h1>المستخدمون والصلاحيات</h1><p>ابحث في الحسابات وأدر الأدوار والصلاحيات المباشرة بحسب صلاحيتك.</p></div><span className="cms-heading-icon" aria-hidden="true">♙</span></section>
    <section className="cms-card cms-users-card">
      <div className="cms-users-toolbar"><label className="cms-news-search"><span aria-hidden="true">⌕</span><input type="search" maxLength={100} value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="ابحث بالاسم أو البريد الإلكتروني" aria-label="البحث عن مستخدم" /></label><span className="cms-hint" aria-live="polite">{loading ? "جارٍ التحميل…" : `${data?.totalCount ?? 0} حساب`}</span></div>
      {!canView && !loading && <div className="cms-msg error" role="alert">لا توجد لديك صلاحية عرض حسابات المستخدمين.</div>}
      {canCreate && <form className="cms-card cms-create-newsroom-user" onSubmit={(event) => void createUser(event)}>
        <h2>إضافة موظف إلى هيئة التحرير</h2><p className="cms-hint">أنشئ الحساب بالدور المناسب. أنشئ كلمة مرور قوية وسلّمها للموظف عبر قناة آمنة. لا تظهر كلمة المرور بعد الحفظ.</p>
        <div className="cms-users-create-grid">
          <label className="cms-field"><span>اسم الموظف</span><input required maxLength={100} value={newUser.displayName} onChange={(event) => setNewUser({ ...newUser, displayName: event.target.value })} /></label>
          <label className="cms-field"><span>البريد الإلكتروني</span><input required type="email" maxLength={256} dir="ltr" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /></label>
          <label className="cms-field"><span>كلمة مرور مؤقتة (12 حرفًا على الأقل)</span><input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} /></label>
          <label className="cms-field"><span>الدور التحريري</span><select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as NewsroomRole })}>{ROLES.filter((role) => role !== "SystemAdmin").map((role) => <option key={role} value={role}>{ROLE_NAMES[role]}</option>)}</select></label>
        </div><button className="cms-btn primary" type="submit" disabled={creating}>{creating ? "جارٍ إنشاء الحساب…" : "إنشاء حساب الموظف"}</button>
      </form>}
      {error && <div className="cms-msg error" role="alert">{error}</div>}{notice && <div className="cms-msg ok" role="status">{notice}</div>}
      {loading && !data ? <p>جارٍ تحميل المستخدمين…</p> : data?.items.length ? <div className="cms-table-scroll"><table className="cms-table"><thead><tr><th>المستخدم</th><th>الأدوار الحالية</th><th>إدارة الدور</th>{isSystemAdmin && <th>الصلاحيات المباشرة</th>}</tr></thead><tbody>{data.items.map((user) => <tr key={user.id}><td data-label="المستخدم"><strong>{user.displayName}</strong><small className="cms-user-email" dir="ltr">{user.email ?? "—"}</small></td><td data-label="الأدوار الحالية"><div className="cms-role-chips">{user.roles.length ? user.roles.map((role) => <span className="cms-role-chip" key={role}>{ROLE_NAMES[role] ?? role}{canManageRoles && <button type="button" aria-label={`سحب ${ROLE_NAMES[role]}`} disabled={busy === `${user.id}:${role}`} onClick={() => { if (window.confirm(locale === "ar" ? `هل تريد سحب دور ${ROLE_NAMES[role]} من ${user.displayName}؟` : locale === "en" ? `Remove the role ${t(ROLE_NAMES[role])} from ${user.displayName}?` : `Retirer le rôle ${t(ROLE_NAMES[role])} de ${user.displayName} ?`)) void changeRole(user, role, "revoke"); }}>×</button>}</span>) : <span className="cms-hint">لا توجد أدوار</span>}</div></td><td data-label="إدارة الدور">{canManageRoles ? <GrantRoleControl user={user} onGrant={(role) => changeRole(user, role, "grant")} busy={busy} /> : <span className="cms-hint">عرض فقط</span>}</td>{isSystemAdmin && <td data-label="الصلاحيات المباشرة"><PermissionControl user={user} onChange={changePermission} busy={busy} /></td>}</tr>)}</tbody></table></div> : <div className="cms-news-empty">{search ? "لا توجد حسابات تطابق البحث." : "لا توجد حسابات هيئة تحرير لعرضها."}</div>}
      {data && data.totalPages > 1 && <div className="cms-pager"><button className="cms-btn" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>السابق</button><span>{data.page} من {data.totalPages}</span><button className="cms-btn" disabled={page >= data.totalPages || loading} onClick={() => setPage((value) => Math.min(data.totalPages, value + 1))}>التالي</button></div>}
    </section>
    <p className="cms-hint cms-security-note">مدير النظام وحده يمنح الصلاحيات المباشرة. المنح والسحب يُطبّقان على الخادم ويصبحان نافذين فورًا. إنشاء الحسابات لا يمنح دور مدير النظام.</p>
  </div>}</LocalizedContent>;
}

function GrantRoleControl({ user, onGrant, busy }: { user: UserRow; onGrant: (role: NewsroomRole) => void; busy: string | null }) {
  const [selected, setSelected] = useState<NewsroomRole | "">("");
  const options = ROLES.filter((role) => !user.roles.includes(role));
  return <div className="cms-grant-role"><select aria-label={`اختيار دور لـ ${user.displayName}`} value={selected} onChange={(event) => setSelected(event.target.value as NewsroomRole | "")}><option value="">اختر دورًا…</option>{options.map((role) => <option key={role} value={role}>{ROLE_NAMES[role]}</option>)}</select><button className="cms-btn primary" type="button" disabled={!selected || busy === `${user.id}:${selected}`} onClick={() => { if (selected) onGrant(selected); }}>منح</button></div>;
}

function PermissionControl({ user, onChange, busy }: { user: UserRow; onChange: (user: UserRow, permission: AdminPermission, action: "grant" | "revoke") => void; busy: string | null }) {
  const [selected, setSelected] = useState<AdminPermission | "">("");
  const options = PERMISSIONS.filter((permission) => !user.permissions.includes(permission));
  return <div className="cms-permission-control"><div className="cms-role-chips">{user.permissions.map((permission) => <span className="cms-role-chip" key={permission}>{PERMISSION_LABELS[permission]}<button type="button" aria-label={`سحب ${PERMISSION_LABELS[permission]} من ${user.displayName}`} disabled={busy === `${user.id}:${permission}`} onClick={() => onChange(user, permission, "revoke")}>×</button></span>)}{!user.permissions.length && <span className="cms-hint">لا توجد صلاحيات مباشرة</span>}</div><div className="cms-grant-role"><select aria-label={`اختيار صلاحية مباشرة لـ ${user.displayName}`} value={selected} onChange={(event) => setSelected(event.target.value as AdminPermission | "")}><option value="">اختر صلاحية…</option>{options.map((permission) => <option key={permission} value={permission}>{PERMISSION_LABELS[permission]}</option>)}</select><button className="cms-btn primary" type="button" disabled={!selected || busy === `${user.id}:${selected}`} onClick={() => { if (selected) onChange(user, selected, "grant"); }}>منح</button></div></div>;
}
