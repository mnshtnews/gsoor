export type NewsroomRole =
  | "SystemAdmin"
  | "EditorInChief"
  | "ManagingEditor"
  | "SeniorEditor"
  | "CrisisEditor"
  | "SeoEditor"
  | "FactChecker"
  | "CopyEditor"
  | "AiEditor"
  | "Researcher"
  | "Reporter";

export interface RoleMeta {
  id: NewsroomRole;
  name: string;
  icon: string;
  rank: number;
  summary: string;
}

export const ROLES_META: Record<NewsroomRole, RoleMeta> = {
  SystemAdmin: {
    id: "SystemAdmin",
    name: "مدير النظام",
    icon: "🛡️",
    rank: 100,
    summary: "مسؤول عن النظام والحسابات والصلاحيات المباشرة وإدارة المنصة.",
  },
  EditorInChief: {
    id: "EditorInChief",
    name: "رئيس التحرير",
    icon: "👑",
    rank: 90,
    summary: "أعلى سلطة تحريرية؛ يملك النشر المباشر والاعتماد وإعادة الأخبار والتصنيفات.",
  },
  ManagingEditor: {
    id: "ManagingEditor",
    name: "مدير التحرير",
    icon: "🧭",
    rank: 80,
    summary: "يدير سير العمل اليومي للأخبار، والاعتماد، والنشر، وهيكل الموقع، ومصادر الأخبار.",
  },
  SeniorEditor: {
    id: "SeniorEditor",
    name: "محرر أول",
    icon: "🖋️",
    rank: 70,
    summary: "محرر خبير يعتمد وينشر ويصدر التصحيحات ويدير الإعلانات ومراقبة الأداء.",
  },
  CrisisEditor: {
    id: "CrisisEditor",
    name: "محرر اطمّن",
    icon: "🚨",
    rank: 60,
    summary: "متخصص في بلاغات الاطمئنان وإدارة طابور حالات خدمة «اطمّن» وقت الأزمات.",
  },
  SeoEditor: {
    id: "SeoEditor",
    name: "محرر SEO",
    icon: "🔎",
    rank: 50,
    summary: "يضبط عناوين ووصف الأخبار وكلمات المفاتيح ومحددات الأرشفة والـ Canonical.",
  },
  FactChecker: {
    id: "FactChecker",
    name: "مدقق حقائق",
    icon: "✅",
    rank: 50,
    summary: "يشاهد القصص الواردة ويدعم التحقق من صحة المعلومات قبل النشر.",
  },
  CopyEditor: {
    id: "CopyEditor",
    name: "مدقق لغوي",
    icon: "📝",
    rank: 40,
    summary: "يراجع الصياغة واللغة، يعدل الأخبار قيد المراجعة، ويطلب تعديل المسودات.",
  },
  AiEditor: {
    id: "AiEditor",
    name: "محرر ذكاء اصطناعي",
    icon: "🤖",
    rank: 40,
    summary: "يراجع مسودات المحتوى والمترجمات ويطلب التعديلات التحريرية.",
  },
  Researcher: {
    id: "Researcher",
    name: "باحث",
    icon: "📚",
    rank: 30,
    summary: "يجمع المعلومات والمصادر ويشاهد القصص الواردة للتحضير الصحفي.",
  },
  Reporter: {
    id: "Reporter",
    name: "مراسل",
    icon: "🎤",
    rank: 20,
    summary: "ينشئ الأخبار ويكتب مسوداته ويرسلها للمراجعة التحريرية.",
  },
};

export type PermissionCategoryKey = "articles" | "publish" | "content" | "site" | "users";

export interface PermissionCategory {
  key: PermissionCategoryKey;
  name: string;
  icon: string;
  description: string;
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: "articles",
    name: "الأخبار",
    icon: "📰",
    description: "صلاحيات إنشاء مسودات الأخبار، تعديلها، طلب المراجعة، وإرجاعها للكاتب.",
  },
  {
    key: "publish",
    name: "النشر",
    icon: "🚀",
    description: "صلاحيات اعتماد الأخبار، النشر المباشر، الجدولة، السحب، الأرشفة، والتصحيح العلني.",
  },
  {
    key: "content",
    name: "المحتوى",
    icon: "✨",
    description: "تحسين SEO، فحص المحتوى المشكوك فيه، متابعة الأداء، القصص الواردة، والإعلانات.",
  },
  {
    key: "site",
    name: "الموقع",
    icon: "🌐",
    description: "إدارة هيكل الموقع والواجهة، مصادر الأخبار، وضع الأزمة، الجغرافيا، وطابور اطمّن.",
  },
  {
    key: "users",
    name: "المستخدمون",
    icon: "👥",
    description: "عرض قائمة المستخدمين، إدارة الأدوار، إنشاء حسابات الموظفين، والصلاحيات المباشرة.",
  },
];

export interface PermissionDefinition {
  id: string;
  category: PermissionCategoryKey;
  label: string;
  description: string;
  /** Roles that possess this permission by default in the system matrix */
  allowedRoles: NewsroomRole[];
  /** Roles that only have permission on their own items (أخباره فقط) */
  ownOnlyRoles?: NewsroomRole[];
  note?: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // 1. الأخبار
  {
    id: "Articles.Create",
    category: "articles",
    label: "إنشاء خبر جديد",
    description: "بدء كتابة وصياغة خبر جديد في النظام وحفظه كمسودة.",
    allowedRoles: ["Reporter", "AiEditor", "CopyEditor", "SeniorEditor", "ManagingEditor", "EditorInChief"],
  },
  {
    id: "Articles.EditDraft",
    category: "articles",
    label: "تعديل مسودة وإرسالها للمراجعة",
    description: "تعديل المسودات غير المعتمدة ونقلها إلى حالة قيد المراجعة التحريرية.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief"],
    ownOnlyRoles: ["Reporter", "AiEditor", "CopyEditor"],
    note: "للمراسلين والمدققين: مسوداتهم فقط افتراضياً",
  },
  {
    id: "Articles.EditInReview",
    category: "articles",
    label: "تعديل أي خبر قيد المراجعة",
    description: "تعديل متن ومحتوى أي خبر موجود في طابور المراجعة التحريرية.",
    allowedRoles: ["AiEditor", "CopyEditor", "SeniorEditor", "ManagingEditor", "EditorInChief"],
  },
  {
    id: "Articles.RequestRevision",
    category: "articles",
    label: "طلب تعديل (إرجاع الخبر لمسودة)",
    description: "إعادة الخبر قيد المراجعة إلى حالة مسودة مع إرفاق ملاحظات للكاتب.",
    allowedRoles: ["AiEditor", "CopyEditor", "SeniorEditor", "ManagingEditor", "EditorInChief"],
  },

  // 2. النشر
  {
    id: "Publish.Approve",
    category: "publish",
    label: "اعتماد الخبر",
    description: "اعتماد الخبر التحريري بعد مراجعته ليصبح مؤهلاً للنشر الفوري أو المجدول.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief"],
  },
  {
    id: "Publish.Publish",
    category: "publish",
    label: "نشر خبر قيد المراجعة أو معتمد",
    description: "إطلاق الخبر مباشرة للموقع العام ليصبح متاحاً للجمهور والقراء.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin"],
    note: "لمدير النظام: إجراء طوارئ مسجل",
  },
  {
    id: "Publish.DirectPublish",
    category: "publish",
    label: "نشر مباشر من مسودة",
    description: "تجاوز مرحلة المراجعة ونشر المسودة مباشرة إلى الموقع العام.",
    allowedRoles: ["SeniorEditor", "EditorInChief"],
  },
  {
    id: "Publish.Schedule",
    category: "publish",
    label: "جدولة نشر خبر معتمد",
    description: "تحديد تاريخ ووقت مستقبلي ليقوم النظام تلقائياً بنشر الخبر.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief"],
  },
  {
    id: "Publish.Unpublish",
    category: "publish",
    label: "إلغاء نشر خبر",
    description: "سحب الخبر من الواجهة العامة وإعادته كمسودة مغلقة داخل غرفة الأخبار.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin"],
    note: "لمدير النظام: إجراء طوارئ مسجل",
  },
  {
    id: "Publish.RetractArchive",
    category: "publish",
    label: "سحب خبر / أرشفته / استعادته من الأرشيف",
    description: "أرشفة الخبر القديم أو سحبه مع ترك إشعار علني، واسترجاعه عند الحاجة.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief"],
  },
  {
    id: "Publish.ReinstateRetracted",
    category: "publish",
    label: "إعادة خبر مسحوب إلى مسودة",
    description: "إلغاء السحب وإعادة المقال لمرحلة التحرير كمسودة قابلة للتنقيح.",
    allowedRoles: ["EditorInChief"],
  },
  {
    id: "Publish.IssueCorrection",
    category: "publish",
    label: "إصدار تصحيح علني على خبر منشور",
    description: "إضافة صندوق تنويه صحفي أو تصحيح رسمي ظاهر للقراء داخل الخبر.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief"],
  },

  // 3. المحتوى
  {
    id: "Content.Seo",
    category: "content",
    label: "تعديل بيانات SEO",
    description: "تخصيص عنوان ووصف محركات البحث وروابط المشاركة الاجتماعية والـ Canonical.",
    allowedRoles: ["SeoEditor", "SeniorEditor", "ManagingEditor", "EditorInChief"],
  },
  {
    id: "Content.ReviewQuestionable",
    category: "content",
    label: "مراجعة بشرية للمحتوى المشكوك فيه",
    description: "التحقق والبت في الأخبار والمصادر التي وضع عليها نظام الذكاء الاصطناعي إشارة اشتباه.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin"],
  },
  {
    id: "Content.EditorialMonitoring",
    category: "content",
    label: "مراقبة الأداء التحريري",
    description: "الاطلاع على تقارير إنتاجية غرفة الأخبار وإحصائيات النشر وسرعة التدقيق.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief", "SystemAdmin"],
  },
  {
    id: "Content.ViewStories",
    category: "content",
    label: "عرض القصص الواردة",
    description: "استعراض المواد والقصص الصحفية الواردة من مصادر الرصد والخلاصات الخارجية.",
    allowedRoles: [
      "Reporter",
      "Researcher",
      "AiEditor",
      "CopyEditor",
      "FactChecker",
      "SeoEditor",
      "CrisisEditor",
      "SeniorEditor",
      "ManagingEditor",
      "EditorInChief",
      "SystemAdmin",
    ],
  },
  {
    id: "Content.ManageAdsAndVideo",
    category: "content",
    label: "إدارة الإعلانات والفيديو الرئيسي",
    description: "إدراج وتعديل المساحات الإعلانية واختيار الفيديو المثبت في الصفحة الرئيسية.",
    allowedRoles: ["SeniorEditor", "ManagingEditor", "EditorInChief"],
  },

  // 4. الموقع
  {
    id: "Site.Structure",
    category: "site",
    label: "إدارة هيكل الموقع (القوائم والواجهة)",
    description: "التحكم في القوائم الرئيسية، تبويبات الأقسام، وبلوكات الصفحة الأولى.",
    allowedRoles: ["ManagingEditor", "EditorInChief", "SystemAdmin"],
  },
  {
    id: "Site.Sources",
    category: "site",
    label: "إدارة مصادر الأخبار",
    description: "إضافة مصادر الرصد RSS والروابط الإخبارية وتفعيلها أو إيقافها.",
    allowedRoles: ["ManagingEditor", "EditorInChief", "SystemAdmin"],
  },
  {
    id: "Site.CrisisMode",
    category: "site",
    label: "وضع الأزمة",
    description: "تفعيل شريط الطوارئ وتحديد الدول المتأثرة وبث التنبيهات العاجلة.",
    allowedRoles: ["ManagingEditor", "EditorInChief"],
  },
  {
    id: "Site.GeographyAndTaxonomy",
    category: "site",
    label: "الجغرافيا والتصنيفات وخريطة المهجر",
    description: "إدارة دليل الدول والمدن وخريطة توزيع الجاليات والتصنيفات الأساسية.",
    allowedRoles: ["EditorInChief"],
  },
  {
    id: "Site.AtmaenQueue",
    category: "site",
    label: "طابور حالات «اطمّن»",
    description: "الوصول السري لبلاغات الاطمئنان ومتابعة حالات المواطنين بالخارج.",
    allowedRoles: ["CrisisEditor"],
    note: "للحالات المسندة فقط",
  },

  // 5. المستخدمون
  {
    id: "Users.View",
    category: "users",
    label: "عرض قائمة المستخدمين والأدوار",
    description: "عرض قائمة العاملين والمستخدمين المسجلين وأدوارهم وصلاحياتهم.",
    allowedRoles: ["EditorInChief", "SystemAdmin"],
    note: "لرئيس التحرير: حتى رتبته فقط",
  },
  {
    id: "Users.ManageRoles",
    category: "users",
    label: "منح وسحب الأدوار",
    description: "تعيين وتعديل الأدوار التحريرية لحسابات هيئة التحرير.",
    allowedRoles: ["SystemAdmin"],
  },
  {
    id: "Users.Create",
    category: "users",
    label: "إنشاء حسابات الموظفين",
    description: "إنشاء حسابات جديدة للعاملين وتعيين كلمات المرور الأولية لهم.",
    allowedRoles: ["SystemAdmin"],
  },
  {
    id: "Users.DirectPermissions",
    category: "users",
    label: "منح الصلاحيات المباشرة (Users.*)",
    description: "إسناد صلاحيات إدارية مباشرة لموظف وتجاوز القيود الافتراضية للرتبة.",
    allowedRoles: ["SystemAdmin"],
  },
];

/** Override mode for an individual permission on a specific user */
export type OverrideMode = "default" | "grant" | "revoke";

export type RoleDefaultState = "allowed" | "own_only" | "denied";

export function getRoleDefaultState(
  roles: NewsroomRole[],
  perm: PermissionDefinition
): RoleDefaultState {
  if (roles.some((r) => perm.allowedRoles.includes(r))) {
    return "allowed";
  }
  if (perm.ownOnlyRoles && roles.some((r) => perm.ownOnlyRoles?.includes(r))) {
    return "own_only";
  }
  return "denied";
}

export function computeEffectiveAccess(
  roles: NewsroomRole[],
  perm: PermissionDefinition,
  override: OverrideMode = "default"
): { isAllowed: boolean; isOwnOnly: boolean; origin: "role" | "custom_grant" | "custom_revoke" } {
  if (override === "grant") {
    return { isAllowed: true, isOwnOnly: false, origin: "custom_grant" };
  }
  if (override === "revoke") {
    return { isAllowed: false, isOwnOnly: false, origin: "custom_revoke" };
  }
  const defaultState = getRoleDefaultState(roles, perm);
  return {
    isAllowed: defaultState === "allowed" || defaultState === "own_only",
    isOwnOnly: defaultState === "own_only",
    origin: "role",
  };
}
