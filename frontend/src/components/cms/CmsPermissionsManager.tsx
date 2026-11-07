"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalizedContent } from "@/components/LocalizedContent";
import { CmsError, cms } from "@/lib/cms-client";
import { useUiLocale } from "@/lib/use-ui-locale";
import {
  type NewsroomRole,
  type OverrideMode,
  type PermissionCategoryKey,
  PERMISSION_CATEGORIES,
  PERMISSION_DEFINITIONS,
  PermissionDefinition,
  ROLES_META,
  computeEffectiveAccess,
  getRoleDefaultState,
} from "@/lib/permissions-catalog";

interface UserRow {
  id: string;
  email: string | null;
  displayName: string;
  roles: NewsroomRole[];
  permissions?: string[];
}

interface UsersApiResponse {
  items: UserRow[];
  totalCount: number;
}

export default function CmsPermissionsManager() {
  const { t } = useUiLocale();
  const router = useRouter();

  // Session & Auth state
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [isSystemAdmin, setIsSystemAdmin] = useState<boolean>(false);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);

  // Staff users state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");

  // Overrides state: Record<permissionId, "grant" | "revoke">
  const [savedOverrides, setSavedOverrides] = useState<Record<string, OverrideMode>>({});
  const [draftOverrides, setDraftOverrides] = useState<Record<string, OverrideMode>>({});

  // UI view state
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [onlyShowOverrides, setOnlyShowOverrides] = useState<boolean>(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    articles: true,
    publish: true,
    content: true,
    site: true,
    users: true,
  });

  // Async feedback state
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Check Session & verify SystemAdmin
  useEffect(() => {
    async function initSession() {
      setSessionLoading(true);
      try {
        const session = await cms.session();
        if (!session.authenticated) {
          router.replace("/cms/login");
          return;
        }
        const roles = session.roles ?? [];
        setCurrentUserRoles(roles);
        setIsSystemAdmin(roles.includes("SystemAdmin"));
      } catch {
        router.replace("/cms/login");
      } finally {
        setSessionLoading(false);
      }
    }
    void initSession();
  }, [router]);

  // 2. Load staff accounts
  const loadStaffUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/cms-api/admin-users?group=staff&page=1&pageSize=100", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new CmsError("تعذر تحميل قائمة أعضاء هيئة التحرير.", res.status);
      }
      const data = (await res.json()) as UsersApiResponse;
      setUsers(data.items || []);
      if (data.items.length > 0 && !selectedUserId) {
        setSelectedUserId(data.items[0].id);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "تعذر الاتصال بالخادم لتحميل المستخدمين.");
    } finally {
      setLoadingUsers(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (isSystemAdmin) {
      void loadStaffUsers();
    }
  }, [isSystemAdmin, loadStaffUsers]);

  // Selected user object
  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // 3. Load permissions overrides when selected user changes
  useEffect(() => {
    if (!selectedUserId) return;
    let isCancelled = false;

    async function fetchUserOverrides() {
      setLoadingPermissions(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const res = await fetch(`/cms-api/permissions?userId=${encodeURIComponent(selectedUserId)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("تعذر تحميل استثناءات الصلاحيات للمستخدم المحدد.");
        const data = (await res.json()) as { overrides?: Record<string, OverrideMode> };
        if (!isCancelled) {
          const map = data.overrides || {};
          setSavedOverrides(map);
          setDraftOverrides(map);
        }
      } catch (err) {
        if (!isCancelled) {
          setErrorMessage(err instanceof Error ? err.message : "تعذر استرجاع الصلاحيات.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingPermissions(false);
        }
      }
    }

    void fetchUserOverrides();

    return () => {
      isCancelled = true;
    };
  }, [selectedUserId]);

  // 4. Dirty state tracking
  const isDirty = useMemo(() => {
    const allKeys = Array.from(
      new Set([...Object.keys(savedOverrides), ...Object.keys(draftOverrides)])
    );
    for (const key of allKeys) {
      const savedVal = savedOverrides[key] || "default";
      const draftVal = draftOverrides[key] || "default";
      if (savedVal !== draftVal) return true;
    }
    return false;
  }, [savedOverrides, draftOverrides]);

  // 5. Change single permission override
  const handleSetOverride = useCallback((permId: string, mode: OverrideMode) => {
    setDraftOverrides((prev) => {
      const next = { ...prev };
      if (mode === "default") {
        delete next[permId];
      } else {
        next[permId] = mode;
      }
      return next;
    });
  }, []);

  // 6. Category batch actions
  const handleBatchCategory = useCallback(
    (categoryKey: PermissionCategoryKey, mode: OverrideMode) => {
      const catPerms = PERMISSION_DEFINITIONS.filter((p) => p.category === categoryKey);
      setDraftOverrides((prev) => {
        const next = { ...prev };
        for (const p of catPerms) {
          if (mode === "default") {
            delete next[p.id];
          } else {
            next[p.id] = mode;
          }
        }
        return next;
      });
    },
    []
  );

  // 7. Reset all overrides to role defaults
  const handleResetAllToRoleDefaults = useCallback(() => {
    if (
      window.confirm(
        `هل تريد استعادة كافة الصلاحيات إلى الوضع الافتراضي لدور "${selectedUser?.displayName}"؟ سيلغي ذلك أي استثناء ممنوح أو محجوب.`
      )
    ) {
      setDraftOverrides({});
    }
  }, [selectedUser?.displayName]);

  // 8. Save changes to API
  const handleSaveChanges = async () => {
    if (!selectedUserId || !isDirty) return;
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const cleanedOverrides: Record<string, "grant" | "revoke"> = {};
      for (const [k, v] of Object.entries(draftOverrides)) {
        if (v === "grant" || v === "revoke") {
          cleanedOverrides[k] = v;
        }
      }
      const res = await fetch("/cms-api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          overrides: cleanedOverrides,
        }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errData.message || "حدث خطأ أثناء حفظ الصلاحيات.");
      }
      setSavedOverrides(cleanedOverrides);
      setDraftOverrides(cleanedOverrides);
      setSuccessMessage(`تم حفظ واعتماد الصلاحيات المخصصة لـ "${selectedUser?.displayName}" بنجاح.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "تعذر حفظ التعديلات.");
    } finally {
      setSaving(false);
    }
  };

  // 9. Discard draft changes
  const handleDiscardChanges = useCallback(() => {
    setDraftOverrides(savedOverrides);
  }, [savedOverrides]);

  // 10. Compute analytics for selected user
  const stats = useMemo(() => {
    if (!selectedUser) {
      return { total: 26, active: 0, denied: 26, customGrants: 0, customRevokes: 0 };
    }
    const roles = selectedUser.roles || [];
    let active = 0;
    let customGrants = 0;
    let customRevokes = 0;

    for (const perm of PERMISSION_DEFINITIONS) {
      const override = draftOverrides[perm.id] || "default";
      if (override === "grant") customGrants++;
      if (override === "revoke") customRevokes++;

      const access = computeEffectiveAccess(roles, perm, override);
      if (access.isAllowed) {
        active++;
      }
    }

    return {
      total: PERMISSION_DEFINITIONS.length,
      active,
      denied: PERMISSION_DEFINITIONS.length - active,
      customGrants,
      customRevokes,
    };
  }, [selectedUser, draftOverrides]);

  // Filtered staff list for search in selector
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return users;
    const q = userSearchQuery.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        u.roles.some((r) => (ROLES_META[r]?.name || r).toLowerCase().includes(q))
    );
  }, [users, userSearchQuery]);

  // Filtered permissions by text search, category, and override status
  const visibleCategories = useMemo(() => {
    return PERMISSION_CATEGORIES.filter((cat) => {
      if (activeCategoryFilter !== "all" && cat.key !== activeCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [activeCategoryFilter]);

  const toggleCategoryOpen = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const expandAll = () => {
    setOpenCategories({
      articles: true,
      publish: true,
      content: true,
      site: true,
      users: true,
    });
  };

  const collapseAll = () => {
    setOpenCategories({
      articles: false,
      publish: false,
      content: false,
      site: false,
      users: false,
    });
  };

  // Loading skeleton / Access Denied
  if (sessionLoading) {
    return (
      <LocalizedContent>
        <div className="cms-page-stack">
          <p className="cms-hint">جارٍ التحقق من صلاحيات مدير النظام…</p>
        </div>
      </LocalizedContent>
    );
  }

  if (!isSystemAdmin) {
    return (
      <LocalizedContent>
        <div className="cms-page-stack">
          <div className="cms-msg error" role="alert">
            <strong>عفوًا! هذه الصفحة مخصصة حصريًا لمدير النظام (SystemAdmin).</strong>
            <p>لا تملك الصلاحية الكافية لتهيئة أو تغيير مصفوفة الصلاحيات المباشرة لموظفي التحرير.</p>
          </div>
        </div>
      </LocalizedContent>
    );
  }

  return (
    <LocalizedContent>
      <div className="cms-page-stack cms-perm-container">
        {/* Page Heading */}
        <section className="cms-page-heading">
          <div>
            <span className="cms-eyebrow">إدارة المنصة · التحكم الأمني الشامل</span>
            <h1>صلاحيات المسؤولين والاستثناءات المباشرة</h1>
            <p>
              تحكم كامل في مصفوفة الصلاحيات لأي مسؤول أو عضو في هيئة التحرير، مع إمكانية منح صلاحيات إضافية غير
              متاحة لدوره افتراضيًا، أو حظر صلاحيات مسموحة له بشكل استثنائي.
            </p>
          </div>
          <span className="cms-heading-icon" aria-hidden="true">
            🛡️
          </span>
        </section>

        {/* Global Alert Messages */}
        {errorMessage && (
          <div className="cms-msg error" role="alert">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="cms-msg ok" role="status">
            {successMessage}
          </div>
        )}

        {/* User Selection & Profile Banner */}
        <section className="cms-perm-user-card">
          <div className="cms-perm-user-grid">
            <div className="cms-perm-user-selector">
              <label htmlFor="user-select-box">
                <span>اختر المسؤول المراد ضبط صلاحياته:</span>
                <span className="cms-hint">({users.length} حساب هيئة تحرير)</span>
              </label>

              <div className="cms-perm-select-wrap">
                <select
                  id="user-select-box"
                  className="cms-perm-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loadingUsers}
                >
                  {loadingUsers && <option>جارٍ تحميل الموظفين…</option>}
                  {filteredUsers.map((u) => {
                    const primaryRole = u.roles[0] || "Reporter";
                    const roleLabel = ROLES_META[primaryRole]?.name || primaryRole;
                    const roleIcon = ROLES_META[primaryRole]?.icon || "👤";
                    return (
                      <option key={u.id} value={u.id}>
                        {roleIcon} {u.displayName} ({roleLabel}) — {u.email}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quick user search box if many users */}
              {users.length > 5 && (
                <div className="cms-perm-search-box" style={{ marginTop: "4px" }}>
                  <input
                    type="search"
                    placeholder="ابحث بالاسم، البريد، أو الدور للترشيح السريع…"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                  <span aria-hidden="true">🔍</span>
                </div>
              )}
            </div>

            {/* Selected User Highlighted Profile Card */}
            {selectedUser ? (
              <div className="cms-perm-profile">
                <div className="cms-perm-avatar" aria-hidden="true">
                  {ROLES_META[selectedUser.roles[0]]?.icon || "👤"}
                </div>
                <div className="cms-perm-profile-info">
                  <h2 className="cms-perm-profile-name">{selectedUser.displayName}</h2>
                  <p className="cms-perm-profile-email">{selectedUser.email || "بدون بريد مسجل"}</p>
                  <div className="cms-perm-profile-roles">
                    {selectedUser.roles.map((r) => (
                      <span className="cms-perm-role-badge" key={r}>
                        {ROLES_META[r]?.icon || "•"} {ROLES_META[r]?.name || r}
                      </span>
                    ))}
                    <span className="cms-perm-role-badge cms-perm-rank-badge">
                      الرتبة: {ROLES_META[selectedUser.roles[0]]?.rank ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="cms-hint">يرجى اختيار مسؤول لعرض صلاحياته.</p>
            )}
          </div>
        </section>

        {/* Live Metrics Ribbon */}
        {selectedUser && (
          <section className="cms-perm-stats" aria-label="إحصائيات الصلاحيات الفعالة">
            <div className="cms-perm-stat total">
              <div className="cms-perm-stat-icon">📊</div>
              <div className="cms-perm-stat-data">
                <b>{stats.total}</b>
                <span>إجمالي الإجراءات</span>
              </div>
            </div>

            <div className="cms-perm-stat active">
              <div className="cms-perm-stat-icon">✔</div>
              <div className="cms-perm-stat-data">
                <b>{stats.active}</b>
                <span>مسموحة فعلياً</span>
              </div>
            </div>

            <div className="cms-perm-stat denied">
              <div className="cms-perm-stat-icon">✖</div>
              <div className="cms-perm-stat-data">
                <b>{stats.denied}</b>
                <span>محجوبة فعلياً</span>
              </div>
            </div>

            <div className="cms-perm-stat grants">
              <div className="cms-perm-stat-icon">➕</div>
              <div className="cms-perm-stat-data">
                <b style={{ color: "#15803d" }}>+{stats.customGrants}</b>
                <span>استثناءات ممنوحة</span>
              </div>
            </div>

            <div className="cms-perm-stat revokes">
              <div className="cms-perm-stat-icon">🔒</div>
              <div className="cms-perm-stat-data">
                <b style={{ color: "#b91c1c" }}>-{stats.customRevokes}</b>
                <span>استثناءات محجوبة</span>
              </div>
            </div>
          </section>
        )}

        {/* Global Toolbar & Filter Bar */}
        {selectedUser && (
          <section className="cms-perm-toolbar">
            <div className="cms-perm-toolbar-row">
              {/* Text Search in Permissions */}
              <div className="cms-perm-search-box">
                <input
                  type="search"
                  placeholder="ابحث في أسماء الصلاحيات (مثل: نشر، SEO، حذف، اعتماد، اطمّن)…"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                <span aria-hidden="true">⌕</span>
              </div>

              {/* View Filters & Controls */}
              <div className="cms-perm-actions-group">
                <button
                  type="button"
                  className={`cms-perm-cat-pill ${onlyShowOverrides ? "active" : ""}`}
                  onClick={() => setOnlyShowOverrides(!onlyShowOverrides)}
                  title="تصفية لعرض الصلاحيات التي تم تعديلها عن الدور فقط"
                >
                  ⚡ الاستثناءات المخصصة فقط ({stats.customGrants + stats.customRevokes})
                </button>

                <button
                  type="button"
                  className="cms-btn"
                  onClick={expandAll}
                  style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                >
                  فتح الكل
                </button>
                <button
                  type="button"
                  className="cms-btn"
                  onClick={collapseAll}
                  style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                >
                  طي الكل
                </button>

                <button
                  type="button"
                  className="cms-btn danger"
                  onClick={handleResetAllToRoleDefaults}
                  disabled={saving || (stats.customGrants === 0 && stats.customRevokes === 0)}
                  style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                  title="إلغاء جميع الاستثناءات واستعادة الصلاحيات الأصلية لدور المستخدم"
                >
                  استعادة افتراضيات الدور
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="cms-perm-category-pills" role="tablist" aria-label="أقسام الصلاحيات">
              <button
                type="button"
                className={`cms-perm-cat-pill ${activeCategoryFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter("all")}
              >
                الكل (5 أقسام)
              </button>
              {PERMISSION_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`cms-perm-cat-pill ${activeCategoryFilter === cat.key ? "active" : ""}`}
                  onClick={() => setActiveCategoryFilter(cat.key)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Permissions Accordions / Dropdowns */}
        {selectedUser && (
          <section className="cms-perm-accordion-group">
            {loadingPermissions ? (
              <div className="cms-card">
                <p className="cms-hint">جارٍ تحميل استثناءات الصلاحيات للمستخدم…</p>
              </div>
            ) : (
              visibleCategories.map((category) => {
                const isOpen = !!openCategories[category.key];

                // Filter items by category, text search, and override toggle
                const categoryItems = PERMISSION_DEFINITIONS.filter((p) => {
                  if (p.category !== category.key) return false;

                  const override = draftOverrides[p.id] || "default";
                  if (onlyShowOverrides && override === "default") {
                    return false;
                  }

                  if (searchFilter.trim()) {
                    const q = searchFilter.trim().toLowerCase();
                    const matchesLabel = p.label.toLowerCase().includes(q);
                    const matchesDesc = p.description.toLowerCase().includes(q);
                    const matchesNote = p.note ? p.note.toLowerCase().includes(q) : false;
                    if (!matchesLabel && !matchesDesc && !matchesNote) return false;
                  }

                  return true;
                });

                // Category Active stats
                const activeCount = PERMISSION_DEFINITIONS.filter((p) => {
                  if (p.category !== category.key) return false;
                  const override = draftOverrides[p.id] || "default";
                  return computeEffectiveAccess(selectedUser.roles, p, override).isAllowed;
                }).length;

                const totalCategoryPerms = PERMISSION_DEFINITIONS.filter(
                  (p) => p.category === category.key
                ).length;

                return (
                  <div
                    key={category.key}
                    className={`cms-perm-cat-card ${isOpen ? "open" : ""}`}
                    id={`perm-cat-${category.key}`}
                  >
                    {/* Collapsible Header */}
                    <div
                      className="cms-perm-cat-header"
                      onClick={() => toggleCategoryOpen(category.key)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                    >
                      <div className="cms-perm-cat-title-block">
                        <span className="cms-perm-cat-icon" aria-hidden="true">
                          {category.icon}
                        </span>
                        <div>
                          <h3>{category.name}</h3>
                          <p>{category.description}</p>
                        </div>
                        <span className="cms-perm-cat-badge">
                          {activeCount} من {totalCategoryPerms} مسموح
                        </span>
                      </div>

                      <div
                        className="cms-perm-cat-controls"
                        onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking batch buttons
                      >
                        <button
                          type="button"
                          className="cms-perm-batch-btn grant-all"
                          onClick={() => handleBatchCategory(category.key, "grant")}
                          title="منح كل صلاحيات هذا القسم لهذا المستخدم"
                        >
                          منح الكل ✔
                        </button>

                        <button
                          type="button"
                          className="cms-perm-batch-btn revoke-all"
                          onClick={() => handleBatchCategory(category.key, "revoke")}
                          title="حظر كل صلاحيات هذا القسم عن هذا المستخدم"
                        >
                          حظر الكل ✖
                        </button>

                        <button
                          type="button"
                          className="cms-perm-batch-btn"
                          onClick={() => handleBatchCategory(category.key, "default")}
                          title="استعادة الوضع الافتراضي لجميع صلاحيات هذا القسم"
                        >
                          الافتراضي ⚙️
                        </button>

                        <span className="cms-perm-chevron" aria-hidden="true">
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Sub-Access Items List */}
                    {isOpen && (
                      <div className="cms-perm-items-list">
                        {categoryItems.length === 0 ? (
                          <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                            لا توجد صلاحيات مطابقة لمعايير البحث في هذا القسم.
                          </div>
                        ) : (
                          categoryItems.map((perm) => (
                            <PermissionRowItem
                              key={perm.id}
                              perm={perm}
                              roles={selectedUser.roles}
                              override={draftOverrides[perm.id] || "default"}
                              onSetOverride={(mode) => handleSetOverride(perm.id, mode)}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        )}

        {/* Sticky Save Changes Bar */}
        {selectedUser && isDirty && (
          <aside className="cms-perm-save-bar" role="region" aria-label="شريط حفظ التعديلات">
            <div className="cms-perm-save-bar-info">
              <b>⚠️ لديك تعديلات غير محفوظة في مصفوفة الصلاحيات</b>
              <span>سيتم تطبيق الاستثناءات المحددة فور الضغط على زر الحفظ والاعتماد.</span>
            </div>

            <div className="cms-perm-save-bar-actions">
              <button
                type="button"
                className="cms-btn"
                disabled={saving}
                onClick={handleDiscardChanges}
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
              >
                تراجع عن التعديلات
              </button>

              <button
                type="button"
                className="cms-btn primary"
                disabled={saving}
                onClick={() => void handleSaveChanges()}
                style={{
                  background: "#1f9d63",
                  borderColor: "#1f9d63",
                  padding: "10px 22px",
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 14px rgba(31, 157, 99, 0.4)",
                }}
              >
                {saving ? "جارٍ الحفظ والاعتماد…" : "حفظ واعتماد التعديلات"}
              </button>
            </div>
          </aside>
        )}

        {/* Security & Audit Footnote */}
        <p className="cms-hint cms-security-note" style={{ marginTop: "24px" }}>
          🛡️ تنبيه أمني: مدير النظام وحده يملك الحق في تخصيص استثناءات الصلاحيات المباشرة. تُحفظ التغييرات وتُسجل
          في سجل التدقيق (Audit Log)، وتسري فوراً على جلسات المستخدمين في النظام.
        </p>
      </div>
    </LocalizedContent>
  );
}

// -----------------------------------------------------------------------------
// Single Sub-Access Permission Row Component
// -----------------------------------------------------------------------------
function PermissionRowItem({
  perm,
  roles,
  override,
  onSetOverride,
}: {
  perm: PermissionDefinition;
  roles: NewsroomRole[];
  override: OverrideMode;
  onSetOverride: (mode: OverrideMode) => void;
}) {
  const roleDefault = getRoleDefaultState(roles, perm);
  const effective = computeEffectiveAccess(roles, perm, override);

  // Row highlight class based on override
  let rowHighlight = "";
  if (override === "grant") rowHighlight = "is-custom-granted";
  else if (override === "revoke") rowHighlight = "is-custom-revoked";

  return (
    <div className={`cms-perm-item-row ${rowHighlight}`}>
      <div className="cms-perm-item-info">
        <div className="cms-perm-item-title-row">
          <h4 className="cms-perm-item-title">{perm.label}</h4>

          {/* Role Default Indicator */}
          <span className="cms-perm-badge-default">
            الافتراضي للدور:{" "}
            {roleDefault === "allowed"
              ? "مسموح ✔"
              : roleDefault === "own_only"
              ? "أخباره فقط 🔒"
              : "محجوب ✖"}
          </span>

          {/* Custom Override Tag */}
          {override === "grant" && (
            <span className="cms-perm-badge-override-grant">
              <span>+</span> استثناء: صلاحية إضافية ممنوحة
            </span>
          )}
          {override === "revoke" && (
            <span className="cms-perm-badge-override-revoke">
              <span>✖</span> استثناء: صلاحية محجوبة
            </span>
          )}
          {override === "default" && (
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              (موروث من الدور الأساسي)
            </span>
          )}

          {perm.note && (
            <span style={{ fontSize: "0.75rem", color: "#b45309", background: "#fef3c7", padding: "1px 7px", borderRadius: "4px" }}>
              {perm.note}
            </span>
          )}
        </div>

        <p className="cms-perm-item-desc">{perm.description}</p>
      </div>

      {/* 3-Way Segmented Control */}
      <div className="cms-perm-segmented-control" role="group" aria-label={`تحديد صلاحية ${perm.label}`}>
        <button
          type="button"
          className={`cms-perm-segment-btn ${override === "default" ? "active-default" : ""}`}
          onClick={() => onSetOverride("default")}
          title="استعادة الوضع الافتراضي المستند إلى دور المستخدم"
        >
          <span aria-hidden="true">⚙️</span>
          افتراضي
        </button>

        <button
          type="button"
          className={`cms-perm-segment-btn ${override === "grant" ? "active-grant" : ""}`}
          onClick={() => onSetOverride("grant")}
          title="منح الصلاحية للمستخدم كاستثناء مباشر"
        >
          <span aria-hidden="true">✔</span>
          منح
        </button>

        <button
          type="button"
          className={`cms-perm-segment-btn ${override === "revoke" ? "active-revoke" : ""}`}
          onClick={() => onSetOverride("revoke")}
          title="حظر هذه الصلاحية عن المستخدم كاستثناء مباشر"
        >
          <span aria-hidden="true">✖</span>
          منع
        </button>
      </div>
    </div>
  );
}
