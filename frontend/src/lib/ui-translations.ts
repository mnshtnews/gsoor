import type { SiteLocale } from "@/lib/site-copy";

const UI_TRANSLATIONS: Record<string, Partial<Record<SiteLocale, string>>> = {
  "تأكيد البريد الإلكتروني": { en: "Verify your email", fr: "Vérifier votre e-mail" }, "أدخل رمز التحقق المكوّن من 6 أرقام الذي أرسلناه إلى بريدك.": { en: "Enter the six-digit verification code we sent to your email.", fr: "Saisissez le code de vérification à six chiffres envoyé à votre adresse e-mail." }, "أدخل رمز التحقق المكوّن من 6 أرقام. إذا لم يصلك، يمكنك طلب إرساله مرة أخرى.": { en: "Enter the six-digit verification code. If it did not arrive, you can request another.", fr: "Saisissez le code de vérification à six chiffres. En cas de non-réception, vous pouvez en demander un autre." }, "رمز التحقق": { en: "Verification code", fr: "Code de vérification" }, "تأكيد الرمز": { en: "Verify code", fr: "Vérifier le code" }, "متابعة وإرسال الرمز": { en: "Continue and send code", fr: "Continuer et envoyer le code" }, "إنشاء الحساب وإرسال الرمز": { en: "Create account and send code", fr: "Créer un compte et envoyer le code" }, "إعادة إرسال الرمز": { en: "Resend code", fr: "Renvoyer le code" }, "أرسلنا رمز تحقق إلى بريدك الإلكتروني.": { en: "We sent a verification code to your email.", fr: "Nous avons envoyé un code de vérification à votre e-mail." }, "تعذّر إرسال رمز جديد.": { en: "We couldn't send a new code.", fr: "Impossible d’envoyer un nouveau code." }, "أرسلنا رمزًا جديدًا إلى بريدك.": { en: "A new code was sent to your email.", fr: "Un nouveau code a été envoyé à votre e-mail." }, "تعذّر إرسال رمز التحقق. انتظر دقيقة ثم أعد المحاولة.": { en: "We couldn't send the verification code. Wait one minute and try again.", fr: "Impossible d’envoyer le code. Attendez une minute puis réessayez." }, "تسجيل الدخول برمز البريد غير مهيأ بعد. أكمل إعداد خدمة البريد أولًا.": { en: "Email-code sign-in is not configured yet. Finish the email service setup first.", fr: "La connexion par code e-mail n’est pas encore configurée. Terminez d’abord la configuration du service e-mail." }, "أرسلنا رمزًا مؤخرًا. انتظر دقيقة قبل طلب رمز جديد.": { en: "A code was sent recently. Wait one minute before requesting another.", fr: "Un code a été envoyé récemment. Attendez une minute avant d’en demander un autre." }, "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.": { en: "Too many attempts. Wait a little and try again.", fr: "Trop de tentatives. Attendez un peu puis réessayez." }, "رمز التحقق غير صحيح أو انتهت صلاحيته.": { en: "The verification code is incorrect or has expired.", fr: "Le code est incorrect ou a expiré." },
  "غرفة الأخبار": { en: "Newsroom", fr: "Rédaction" }, "نظرة عامة": { en: "Overview", fr: "Vue d’ensemble" }, "كل المقالات": { en: "All articles", fr: "Tous les articles" }, "المسودات": { en: "Drafts", fr: "Brouillons" }, "قيد المراجعة": { en: "In review", fr: "En cours de révision" }, "مجدول للنشر": { en: "Scheduled", fr: "Programmés" }, "إضافة مقال": { en: "New article", fr: "Nouvel article" }, "تحسين SEO": { en: "SEO", fr: "SEO" }, "الرئيسية والإعلانات": { en: "Homepage and ads", fr: "Accueil et publicités" }, "الرئيسية والقائمة": { en: "Homepage and navigation", fr: "Accueil et navigation" }, "استبيانات الرئيسية": { en: "Homepage polls", fr: "Sondages de la page d’accueil" }, "فيديوهات الرئيسية": { en: "Homepage videos", fr: "Vidéos de la page d’accueil" }, "إدارة الإعلانات": { en: "Ad management", fr: "Gestion des publicités" }, "إدارة المنصة": { en: "Platform management", fr: "Gestion de la plateforme" }, "المستخدمون والصلاحيات": { en: "Users and permissions", fr: "Utilisateurs et autorisations" }, "دليل الدول والمدن": { en: "Countries and cities", fr: "Pays et villes" }, "بيانات خريطة المهجر": { en: "Diaspora map data", fr: "Données de la carte de la diaspora" }, "اطمّن": { en: "Atma’en", fr: "Atma’en" }, "قائمة الحالات المسندة": { en: "Assigned cases", fr: "Dossiers attribués" }, "إدارة الأزمات": { en: "Crisis management", fr: "Gestion des crises" }, "وضع الأزمة والدول المتأثرة": { en: "Crisis mode and affected countries", fr: "Mode crise et pays concernés" }, "التقارير والمراقبة": { en: "Reports and monitoring", fr: "Rapports et suivi" }, "مراقبة غرفة الأخبار": { en: "Newsroom monitoring", fr: "Suivi de la rédaction" }, "مساحة التحرير": { en: "Editorial workspace", fr: "Espace éditorial" }, "جارٍ التحقق من الجلسة…": { en: "Checking session…", fr: "Vérification de la session…" }, "خروج": { en: "Sign out", fr: "Déconnexion" }, "فتح القائمة": { en: "Open menu", fr: "Ouvrir le menu" }, "إغلاق القائمة": { en: "Close menu", fr: "Fermer le menu" }, "القائمة الرئيسية للوحة التحرير": { en: "Editorial dashboard navigation", fr: "Navigation du tableau éditorial" }, "مساحة العمل": { en: "Workspace", fr: "Espace de travail" }, "أنت هنا": { en: "You are here", fr: "Vous êtes ici" }, "جسور · لوحة إدارة المحتوى": { en: "Jusoor · Content management", fr: "Jusoor · Gestion de contenu" }, "نسخة تحريرية": { en: "Editorial edition", fr: "Édition éditoriale" }, "محتوى الصفحة": { en: "Page content", fr: "Contenu de la page" }, "التحرير": { en: "Editorial", fr: "Éditorial" },
  "تعذّر تحميل الفيديوهات": { en: "Could not load videos", fr: "Impossible de charger les vidéos" }, "حدثت مشكلة في الاتصال بالخادم. حاول تحديث الصفحة بعد قليل.": { en: "There was a problem connecting to the server. Please refresh shortly.", fr: "Un problème de connexion au serveur est survenu. Veuillez réessayer dans quelques instants." }, "العودة إلى الفيديوهات": { en: "Back to videos", fr: "Retour aux vidéos" }, "صورة الكاتب": { en: "Author photo", fr: "Photo de l’auteur" },
  "خدمة جسور المجتمعية": { en: "Jusoor community service", fr: "Service communautaire Jusoor" }, "أرسل بلاغًا آمنًا عن شخص تريد الاطمئنان عليه. لن تظهر بيانات البلاغ للعموم.": { en: "Send a confidential report about someone you are trying to reach. Report details will never be public.", fr: "Envoyez un signalement confidentiel au sujet d’une personne dont vous souhaitez avoir des nouvelles. Les détails ne seront jamais publics." }, "خطوات إرسال البلاغ": { en: "Report steps", fr: "Étapes du signalement" }, "تفاصيل البلاغ": { en: "Report details", fr: "Détails du signalement" }, "تأكيد رقمك": { en: "Verify your phone", fr: "Vérifier votre téléphone" }, "جارٍ تحميل دليل الدول…": { en: "Loading country directory…", fr: "Chargement de la liste des pays…" }, "خدمة البلاغات قيد التجهيز في هذه البيئة. يجب على إدارة جسور إضافة الدول والمدن من دليل المواقع قبل استقبال البلاغات.": { en: "Reporting is not configured in this environment. Jusoor administrators must add countries and cities before reports can be submitted.", fr: "Le signalement n’est pas configuré dans cet environnement. Les administrateurs de Jusoor doivent ajouter les pays et les villes avant l’envoi de signalements." }, "تم استلام البلاغ": { en: "Report received", fr: "Signalement reçu" }, "وصلت المعلومات إلى فريق المتابعة المختص. لا تشارك بيانات الحالة أو أرقام التواصل علنًا.": { en: "The information has reached the relevant support team. Do not share case details or contact numbers publicly.", fr: "Les informations ont été transmises à l’équipe compétente. Ne partagez pas publiquement les détails du dossier ni les numéros de contact." }, "إرسال بلاغ آخر": { en: "Send another report", fr: "Envoyer un autre signalement" }, "الدولة التي يوجد بها الشخص": { en: "Country where the person is located", fr: "Pays où se trouve la personne" }, "اختر الدولة": { en: "Select a country", fr: "Choisir un pays" }, "المدينة": { en: "City", fr: "Ville" }, "اختر الدولة أولًا": { en: "Select a country first", fr: "Choisissez d’abord un pays" }, "اختر المدينة": { en: "Select a city", fr: "Choisir une ville" }, "لا توجد مدن مسجلة": { en: "No cities listed", fr: "Aucune ville répertoriée" }, "اسم الشخص الذي تبحث عنه": { en: "Name of the person you are looking for", fr: "Nom de la personne recherchée" }, "رقم تواصل الشخص (اختياري)": { en: "Person’s contact number (optional)", fr: "Numéro de contact (facultatif)" }, "ما الذي يقلقك؟": { en: "What are you concerned about?", fr: "Qu’est-ce qui vous inquiète ?" }, "اشرح بإيجاز سبب طلب المساعدة…": { en: "Briefly explain why you need help…", fr: "Expliquez brièvement pourquoi vous avez besoin d’aide…" }, "رقم هاتفك لإرسال رمز التأكيد": { en: "Your phone number for the verification code", fr: "Votre numéro pour recevoir le code de vérification" }, "اكتب الرقم بالصيغة الدولية، مثل +201XXXXXXXXX.": { en: "Enter the number in international format, for example +201XXXXXXXXX.", fr: "Saisissez le numéro au format international, par exemple +201XXXXXXXXX." }, "أوافق على استخدام بيانات التواصل والمعلومات أعلاه لمعالجة هذا البلاغ والتواصل معي بشأنه.": { en: "I agree to the use of my contact details and the information above to process this report and contact me about it.", fr: "J’accepte l’utilisation de mes coordonnées et des informations ci-dessus pour traiter ce signalement et me contacter à son sujet." }, "لا ترسل معلومات طبية أو مالية أو كلمات مرور.": { en: "Do not send medical or financial information or passwords.", fr: "N’envoyez pas d’informations médicales ou financières ni de mots de passe." }, "جارٍ إرسال الرمز…": { en: "Sending code…", fr: "Envoi du code…" }, "إرسال رمز التأكيد": { en: "Send verification code", fr: "Envoyer le code de vérification" }, "أرسلنا رمز التحقق إلى": { en: "We sent a verification code to", fr: "Nous avons envoyé un code de vérification à" }, "أدخله لتأكيد رقمك وإرسال البلاغ.": { en: "Enter it to verify your number and submit the report.", fr: "Saisissez-le pour vérifier votre numéro et envoyer le signalement." }, "رمز التأكيد": { en: "Verification code", fr: "Code de vérification" }, "تعديل البيانات": { en: "Edit details", fr: "Modifier les informations" }, "جارٍ إرسال البلاغ…": { en: "Sending report…", fr: "Envoi du signalement…" }, "تأكيد وإرسال البلاغ": { en: "Verify and submit report", fr: "Vérifier et envoyer" }, "جسور منصة إعلامية وليست جهة طوارئ. إذا كان هناك خطر مباشر، تواصل مع خدمات الطوارئ المحلية والسفارة المصرية.": { en: "Jusoor is a media platform, not an emergency service. If there is immediate danger, contact local emergency services and the Egyptian embassy.", fr: "Jusoor est une plateforme d’information, pas un service d’urgence. En cas de danger immédiat, contactez les services d’urgence locaux et l’ambassade d’Égypte." },
  "تعذّر إرسال رمز التحقق.": { en: "Could not send the verification code.", fr: "Impossible d’envoyer le code de vérification." }, "تعذّر إرسال البلاغ.": { en: "Could not submit the report.", fr: "Impossible d’envoyer le signalement." }, "تعذّر تحميل دليل الدول.": { en: "Could not load the country directory.", fr: "Impossible de charger la liste des pays." }, "تعذّر تحميل المدن.": { en: "Could not load cities.", fr: "Impossible de charger les villes." }, "تعذّر إتمام الطلب الآن. حاول مرة أخرى لاحقًا.": { en: "The request could not be completed. Please try again later.", fr: "La demande n’a pas pu aboutir. Veuillez réessayer plus tard." }, "يرجى الموافقة على استخدام البيانات لمعالجة البلاغ قبل المتابعة.": { en: "Please consent to data processing before continuing.", fr: "Veuillez consentir au traitement des données avant de continuer." }, "يرجى الموافقة": { en: "Consent is required", fr: "Votre accord est requis" }, "بلاغ خاص لا يظهر للعموم": { en: "Private report, never public", fr: "Signalement privé, jamais public" },

  "الرئيسية": { en: "Home", fr: "Accueil" }, "الأخبار": { en: "News", fr: "Actualités" }, "بحث": { en: "Search", fr: "Rechercher" }, "إغلاق": { en: "Close", fr: "Fermer" },
  "مسار الصفحة": { en: "Breadcrumb", fr: "Fil d’Ariane" }, "الصفحة السابقة": { en: "Previous page", fr: "Page précédente" }, "الصفحة التالية": { en: "Next page", fr: "Page suivante" }, "صفحة": { en: "Page", fr: "Page" }, "من": { en: "of", fr: "sur" },
  "اكتشف التغطيات": { en: "Explore our coverage", fr: "Découvrez nos reportages" }, "ابحث في أخبار جسور": { en: "Search Jusoor news", fr: "Rechercher dans les actualités de Jusoor" }, "ابحث عن خبر، دولة، أو موضوع…": { en: "Search news, a country, or a topic…", fr: "Rechercher une actualité, un pays ou un sujet…" }, "كلمات البحث": { en: "Search terms", fr: "Termes de recherche" }, "اكتب كلمتين على الأقل لبدء البحث في الأخبار المنشورة.": { en: "Enter at least two characters to search published news.", fr: "Saisissez au moins deux caractères pour rechercher des actualités publiées." }, "نتيجة": { en: "results", fr: "résultats" }, "لم نعثر على نتائج مطابقة. جرّب كلمات أخرى.": { en: "No matching results. Try different keywords.", fr: "Aucun résultat correspondant. Essayez d’autres mots-clés." },
  "جسور فيديو": { en: "Jusoor Video", fr: "Jusoor Vidéo" }, "فيديوهات جسور": { en: "Jusoor videos", fr: "Vidéos de Jusoor" }, "الأحدث": { en: "Latest", fr: "Les plus récentes" }, "كل الفيديوهات": { en: "All videos", fr: "Toutes les vidéos" }, "لا توجد فيديوهات منشورة حالياً": { en: "No videos have been published yet", fr: "Aucune vidéo n’a encore été publiée" }, "ستظهر هنا الفيديوهات التي يختارها فريق التحرير وينشرها.": { en: "Videos selected and published by the editorial team will appear here.", fr: "Les vidéos sélectionnées et publiées par la rédaction apparaîtront ici." }, "اقرأ الخبر المرتبط": { en: "Read the related story", fr: "Lire l’article associé" }, "منشور حديثاً": { en: "Recently published", fr: "Récemment publié" }, "صفحات الفيديوهات": { en: "Video pages", fr: "Pages des vidéos" }, "الأقدم": { en: "Older", fr: "Plus anciennes" },
  "مركز الأزمة": { en: "Crisis Center", fr: "Centre de crise" }, "طوارئ": { en: "Emergency", fr: "Urgence" }, "تنبيه": { en: "Advisory", fr: "Alerte" }, "عاجل": { en: "Urgent", fr: "Urgent" }, "الدول المتأثرة": { en: "Affected countries", fr: "Pays concernés" }, "إرشادات المتابعة": { en: "Safety guidance", fr: "Consignes de suivi" }, "العودة إلى الرئيسية": { en: "Back to home", fr: "Retour à l’accueil" }, "معلومات مهمة": { en: "Important information", fr: "Informations importantes" }, "تابع المصادر الرسمية": { en: "Follow official sources", fr: "Suivez les sources officielles" }, "آخر تحديث": { en: "Last updated", fr: "Dernière mise à jour" }, "تحديث جسور:": { en: "Jusoor update:", fr: "Mise à jour de Jusoor :" }, "المصدر:": { en: "Source:", fr: "Source :" }, "لا توجد أزمة نشطة حاليًا": { en: "There is no active crisis at this time", fr: "Aucune crise n’est actuellement active" }, "يُفعّل مركز الأزمة من غرفة أخبار جسور عند اعتماد تنبيه للدول المتأثرة.": { en: "The Jusoor newsroom activates the Crisis Center when an alert for affected countries is approved.", fr: "La rédaction de Jusoor active le Centre de crise lorsqu’une alerte concernant des pays touchés est approuvée." },
  "اطمّن على مغتربك": { en: "Check on your loved one abroad", fr: "Prendre des nouvelles de votre proche à l’étranger" }, "جسور معك وقت القلق": { en: "Jusoor is here when you are worried", fr: "Jusoor est à vos côtés en cas d’inquiétude" }, "لأن الاطمئنان حق": { en: "Because peace of mind matters", fr: "Parce que la tranquillité d’esprit compte" }, "أرسل بلاغًا خاصًا لفريق المتابعة بسرية. نتحقق من رقمك أولًا، ثم تصل التفاصيل إلى محرر مختص لمراجعتها.": { en: "Send a private report to our support team. We verify your phone number first, then a specialist editor reviews the details.", fr: "Envoyez un signalement privé à notre équipe. Nous vérifions d’abord votre numéro, puis un rédacteur spécialisé examine les informations." }, "متابعة من محرر مختص": { en: "Reviewed by a specialist editor", fr: "Examiné par un rédacteur spécialisé" }, "لا ننشر بيانات التواصل": { en: "Your contact details are not published", fr: "Vos coordonnées ne sont pas publiées" }, "قبل إرسال البلاغ": { en: "Before sending a report", fr: "Avant d’envoyer un signalement" }, "اكتب بيانات دقيقة تساعد فريق المتابعة.": { en: "Provide accurate details to help our support team.", fr: "Fournissez des informations exactes pour aider notre équipe." }, "أدخل رقمًا دوليًا تستطيع استلام رمز التأكيد عليه.": { en: "Enter an international number that can receive a verification code.", fr: "Saisissez un numéro international pouvant recevoir un code de vérification." }, "لا ترسل كلمات مرور أو معلومات مالية.": { en: "Do not send passwords or financial information.", fr: "N’envoyez ni mot de passe ni information financière." }, "الخدمة ليست بديلًا عن الطوارئ أو الجهات الرسمية.": { en: "This service is not a substitute for emergency services or official authorities.", fr: "Ce service ne remplace pas les services d’urgence ni les autorités officielles." }, "مركز الأزمة والتنبيهات ←": { en: "Crisis Center and alerts →", fr: "Centre de crise et alertes →" }, "هل يوجد خطر مباشر؟": { en: "Is anyone in immediate danger?", fr: "Y a-t-il un danger immédiat ?" }, "اتصل بخدمات الطوارئ المحلية أو بالسفارة المصرية في بلد الشخص.": { en: "Contact local emergency services or the Egyptian embassy in the person's country.", fr: "Contactez les services d’urgence locaux ou l’ambassade d’Égypte dans le pays concerné." },
  "الكاتب غير موجود": { en: "Author not found", fr: "Auteur introuvable" }, "تعذّر تحميل صفحة الكاتب": { en: "Could not load the author page", fr: "Impossible de charger la page de l’auteur" }, "مقالات الرأي": { en: "Opinion", fr: "Opinions" }, "كاتب / كاتبة جسور": { en: "Jusoor contributor", fr: "Contributeur de Jusoor" }, "كل المقالات المنشورة باسم الكاتب على منصة جسور.": { en: "All articles published under this author's name on Jusoor.", fr: "Tous les articles publiés sous le nom de cet auteur sur Jusoor." }, "مادة منشورة": { en: "published stories", fr: "articles publiés" }, "مقالات الكاتب": { en: "Author's articles", fr: "Articles de l’auteur" }, "أخبار بحسب البلد": { en: "News by country", fr: "Actualités par pays" }, "أخبار المصريين في": { en: "Egyptians abroad in", fr: "Égyptiens à l’étranger en" }, "خبرًا منشورًا": { en: "published stories", fr: "articles publiés" }, "لا توجد أخبار منشورة مرتبطة بهذا البلد حاليًا.": { en: "There are no published stories linked to this country yet.", fr: "Aucun article publié n’est actuellement associé à ce pays." }, "تعذّر تحميل أخبار البلد": { en: "Could not load this country's news", fr: "Impossible de charger les actualités de ce pays" },
  "تعذّر الاتصال بالخادم. حاول تحديث الصفحة بعد قليل.": { en: "Could not connect to the server. Please refresh the page shortly.", fr: "Impossible de joindre le serveur. Veuillez actualiser la page dans quelques instants." }, "لا توجد أخبار في هذا القسم حاليًا.": { en: "There are no stories in this section yet.", fr: "Aucun article dans cette rubrique pour le moment." }, "ستظهر هنا الأخبار بعد نشرها وتحديد هذا القسم لها.": { en: "Stories will appear here once published in this section.", fr: "Les articles apparaîtront ici après leur publication dans cette rubrique." }, "صفحات القسم": { en: "Section pages", fr: "Pages de la rubrique" }, "خبرًا": { en: "stories", fr: "articles" }, "أخبار": { en: "News", fr: "Actualités" }, "القسم غير موجود": { en: "Section not found", fr: "Rubrique introuvable" }, "تعذّر تحميل القسم": { en: "Could not load this section", fr: "Impossible de charger cette rubrique" }, "إغلاق القائمة الرئيسية للوحة التحرير": { en: "Close newsroom menu", fr: "Fermer le menu de la rédaction" }, "جسور، لوحة التحرير": { en: "Jusoor, newsroom", fr: "Jusoor, rédaction" },
  "لوحة التحرير": { en: "Newsroom", fr: "Rédaction" }, "لوحة الأخبار": { en: "Newsroom", fr: "Rédaction" }, "حفظ": { en: "Save", fr: "Enregistrer" }, "حفظ التغييرات": { en: "Save changes", fr: "Enregistrer les modifications" }, "حفظ الترجمة": { en: "Save translation", fr: "Enregistrer la traduction" }, "حفظ النسخة": { en: "Save version", fr: "Enregistrer la version" }, "جارٍ الحفظ…": { en: "Saving…", fr: "Enregistrement…" }, "إلغاء": { en: "Cancel", fr: "Annuler" }, "حذف": { en: "Delete", fr: "Supprimer" }, "إضافة": { en: "Add", fr: "Ajouter" }, "تعديل": { en: "Edit", fr: "Modifier" }, "تحميل": { en: "Loading", fr: "Chargement" }, "جارٍ التحميل…": { en: "Loading…", fr: "Chargement…" }, "لا توجد بيانات": { en: "No data", fr: "Aucune donnée" }, "لا توجد نتائج": { en: "No results", fr: "Aucun résultat" }, "نعم": { en: "Yes", fr: "Oui" }, "لا": { en: "No", fr: "Non" }, "إظهار": { en: "Show", fr: "Afficher" }, "إخفاء": { en: "Hide", fr: "Masquer" }, "عنوان": { en: "Title", fr: "Titre" }, "الاسم": { en: "Name", fr: "Nom" }, "الحالة": { en: "Status", fr: "Statut" }, "الدولة": { en: "Country", fr: "Pays" }, "ملاحظات": { en: "Notes", fr: "Notes" }, "بحث في الأخبار": { en: "Search news", fr: "Rechercher des actualités" }, "البريد الإلكتروني": { en: "Email", fr: "E-mail" }, "كلمة المرور": { en: "Password", fr: "Mot de passe" }, "تسجيل الدخول": { en: "Sign in", fr: "Connexion" }, "إنشاء حساب": { en: "Create account", fr: "Créer un compte" }, "اعتماد": { en: "Approve", fr: "Approuver" }, "إرسال للمراجعة": { en: "Submit for review", fr: "Soumettre à la révision" }, "اعتماد وإظهار للقراء": { en: "Approve and publish translation", fr: "Approuver et afficher la traduction" }, "النسخ اللغوية": { en: "Language versions", fr: "Versions linguistiques" }, "اللغة": { en: "Language", fr: "Langue" }, "عرض فقط": { en: "View only", fr: "Lecture seule" }, "لا توجد حسابات تطابق البحث.": { en: "No accounts match your search.", fr: "Aucun compte ne correspond à votre recherche." }, "لا توجد حسابات هيئة تحرير لعرضها.": { en: "No newsroom accounts to display.", fr: "Aucun compte de la rédaction à afficher." },
  "تم إنشاء مسودتي الترجمة. راجعهما قبل الاعتماد.": { en: "English and French drafts are ready. Review them before approval.", fr: "Les versions anglaise et française sont prêtes. Relisez-les avant approbation." }, "تم حفظ النسخة التحريرية.": { en: "Editorial version saved.", fr: "Version éditoriale enregistrée." }, "تم اعتماد النسخة لتظهر للقراء.": { en: "Version approved and visible to readers.", fr: "Version approuvée et visible par les lecteurs." }, "تعذر تحميل الترجمات.": { en: "Could not load translations.", fr: "Impossible de charger les traductions." }, "تعذّر إنشاء الترجمات.": { en: "Could not generate translations.", fr: "Impossible de générer les traductions." }, "راجع النص قبل اعتماده للقراء.": { en: "Review the text before approving it for readers.", fr: "Relisez le texte avant de l’approuver pour les lecteurs." }, "مسودة آلية": { en: "Machine draft", fr: "Brouillon automatique" }, "معتمدة": { en: "Approved", fr: "Approuvée" }, "تحرير يدوي": { en: "Manually edited", fr: "Modifiée manuellement" }, "يمكنك كتابة هذه اللغة مباشرة.": { en: "You can write this language directly.", fr: "Vous pouvez rédiger directement dans cette langue." }, "لا توجد نسخة لهذه اللغة بعد. يمكنك كتابة ترجمة مباشرة أو توليدها آليًا.": { en: "No version exists for this language yet. Write it directly or generate it automatically.", fr: "Aucune version n’existe encore dans cette langue. Rédigez-la ou générez-la automatiquement." }, "تغير المقال الأصلي؛ حدّث هذه الترجمة قبل اعتمادها.": { en: "The source article has changed. Update this translation before approval.", fr: "L’article source a changé. Mettez à jour la traduction avant de l’approuver." },
  "تم حفظ المقال.": { en: "Article saved.", fr: "Article enregistré." }, "مقال جديد": { en: "New article", fr: "Nouvel article" }, "تحرير مقال": { en: "Edit article", fr: "Modifier l’article" }, "العنوان": { en: "Title", fr: "Titre" }, "الملخص": { en: "Summary", fr: "Résumé" }, "نص الخبر": { en: "Article body", fr: "Corps de l’article" }, "تفاصيل الخبر": { en: "Article details", fr: "Détails de l’article" }, "حفظ كمسودة": { en: "Save as draft", fr: "Enregistrer comme brouillon" }, "تم حفظ التعديلات.": { en: "Changes saved.", fr: "Modifications enregistrées." }, "أُرسل المقال للمراجعة التحريرية. لا يمكن تعديله من كاتبه حتى تتم مراجعته.": { en: "Article submitted for editorial review. Its author cannot edit it until review is complete.", fr: "Article soumis à la révision éditoriale. Son auteur ne peut plus le modifier avant la fin de la révision." }, "تم اعتماد المقال. بإمكان المحرر المسؤول نشره الآن.": { en: "Article approved. The responsible editor can now publish it.", fr: "Article approuvé. Le rédacteur responsable peut maintenant le publier." }, "تم نشر المقال ويظهر الآن على الموقع.": { en: "Article published and now visible on the site.", fr: "Article publié et désormais visible sur le site." },
  "البحث": { en: "Search", fr: "Recherche" },
  "لا تتوفر الخدمة الآن. حاول مرة أخرى لاحقًا.": { en: "This service is temporarily unavailable. Please try again later.", fr: "Ce service est temporairement indisponible. Veuillez réessayer plus tard." },
  "بياناتك أمانة": { en: "Your data is entrusted to us", fr: "Vos données nous sont confiées" }, "الخصوصية في جسور": { en: "Privacy at Jusoor", fr: "Confidentialité chez Jusoor" }, "هذه الصفحة توضح مبادئ التعامل مع البيانات في نسخة التجربة. وهي ليست بديلًا عن إشعار الخصوصية القانوني النهائي.": { en: "This page explains how data is handled in the trial version. It is not a substitute for the final legal privacy notice.", fr: "Cette page explique le traitement des données dans la version d’essai. Elle ne remplace pas l’avis juridique définitif sur la confidentialité." }, "ما البيانات التي قد تستخدمها الخدمات؟": { en: "What data may the services use?", fr: "Quelles données les services peuvent-ils utiliser ?" }, "تستخدم المنصة بيانات الحساب اللازمة لتسجيل الدخول وإدارة الملف الشخصي. وعند استخدام خدمة «اطمّن»، تُرسل بيانات البلاغ إلى فريق المتابعة المخول لمعالجتها، ولا تُعرض في صفحات الأخبار العامة.": { en: "The platform uses account data required for sign-in and profile management. When you use Atma’en, report details are sent to the authorized support team for processing and are not shown on public news pages.", fr: "La plateforme utilise les données du compte nécessaires à la connexion et à la gestion du profil. Avec le service Atma’en, les détails du signalement sont transmis à l’équipe autorisée et ne sont pas publiés sur les pages d’actualités." }, "معلومات الموقع والخريطة": { en: "Location and map information", fr: "Informations de localisation et de carte" }, "اختيارات الموقع التي تحفظها في ملفك الشخصي تخضع لمستوى الخصوصية الذي تحدده. لا تظهر مواقع الأفراد على الخريطة العامة. المؤشرات المجتمعية لا تعرض إلا بعد تجاوز حد التجميع المعتمد، وتبقى بيانات التقديرات السكانية منفصلة ومرفقة بمصادرها.": { en: "Location preferences saved in your profile follow the privacy level you choose. Individual locations are not shown on the public map. Community indicators appear only after meeting the approved aggregation threshold; population estimates remain separate and include their sources.", fr: "Les préférences de localisation enregistrées dans votre profil respectent le niveau de confidentialité que vous choisissez. Les emplacements individuels ne sont pas affichés sur la carte publique. Les indicateurs communautaires ne sont publiés qu’après avoir atteint le seuil d’agrégation approuvé ; les estimations de population restent distinctes et accompagnées de leurs sources." }, "الاحتفاظ بطلبات المتابعة": { en: "Retention of support requests", fr: "Conservation des demandes de suivi" }, "المدد النهائية للاحتفاظ ببيانات البلاغات وإخفاء الهوية ما زالت قيد المراجعة القانونية. لذلك لا نحدد هنا مدة غير معتمدة. لا تستخدم نسخة التجربة لإرسال معلومات شديدة الحساسية أو في حالات الخطر المباشر؛ تواصل مع الطوارئ المحلية أو الجهة الرسمية المختصة.": { en: "The retention periods and de-identification rules for reports are still under legal review, so no unapproved period is stated here. Do not use the trial version to send highly sensitive information or for immediate danger; contact local emergency services or the relevant authority.", fr: "Les durées de conservation et les règles de dé-identification des signalements sont encore à l’étude juridique ; aucune durée non approuvée n’est donc indiquée ici. N’utilisez pas la version d’essai pour transmettre des informations très sensibles ni en cas de danger immédiat ; contactez les services d’urgence locaux ou l’autorité compétente." }, "حالة نسخة التجربة": { en: "Trial version status", fr: "État de la version d’essai" }, "قد تتغير الخدمات والتكاملات أثناء التجربة. إرسال البلاغ لا يضمن تدخلًا طارئًا أو استجابة من جهة رسمية. عند تعطل التحقق من رقم الهاتف، لا تتابع الخدمة الطلب باعتباره مؤكدًا.": { en: "Services and integrations may change during the trial. Submitting a report does not guarantee emergency intervention or a response from an official authority. If phone verification fails, the request is not treated as verified.", fr: "Les services et intégrations peuvent évoluer pendant l’essai. L’envoi d’un signalement ne garantit ni intervention d’urgence ni réponse d’une autorité officielle. Si la vérification téléphonique échoue, la demande n’est pas considérée comme vérifiée." }, "تُستكمل هذه الصفحة وتُعتمد قبل الإطلاق العام بعد مراجعة سياسة الاحتفاظ ووسائل التواصل وبيانات الجهة المسؤولة.": { en: "This page will be completed and approved before public launch after reviewing retention rules, contact channels, and responsible-party details.", fr: "Cette page sera complétée et approuvée avant le lancement public, après examen des règles de conservation, des moyens de contact et des coordonnées de l’entité responsable." }, "تفاصيل خدمة اطمّن ←": { en: "Atma’en service details →", fr: "Détails du service Atma’en →" },
  "الصفحة غير موجودة": { en: "Page not found", fr: "Page introuvable" }, "الخبر أو الصفحة التي تبحث عنها غير متاحة، وربما تمت إزالتها.": { en: "The story or page you are looking for is unavailable and may have been removed.", fr: "L’article ou la page recherchée est indisponible et a peut-être été supprimée." }, "العودة للرئيسية": { en: "Back to home", fr: "Retour à l’accueil" }, "حدث خطأ غير متوقع": { en: "An unexpected error occurred", fr: "Une erreur inattendue s’est produite" }, "نعتذر عن الإزعاج. حاول تحديث الصفحة، أو عد إلينا بعد قليل.": { en: "Sorry for the inconvenience. Refresh the page or try again shortly.", fr: "Veuillez nous excuser. Actualisez la page ou réessayez dans quelques instants." }, "إعادة المحاولة": { en: "Try again", fr: "Réessayer" },  "الصلاحيات المباشرة": { en: "Direct permissions", fr: "Autorisations directes" },
  "عرض المستخدمين والصلاحيات": { en: "View users and permissions", fr: "Voir les utilisateurs et autorisations" },
  "إنشاء حسابات المستخدمين": { en: "Create user accounts", fr: "Créer des comptes utilisateurs" },
  "منح وسحب أدوار المستخدمين": { en: "Grant and revoke user roles", fr: "Attribuer et retirer des rôles" },
  "اختر صلاحية…": { en: "Choose a permission…", fr: "Choisissez une autorisation…" },
  "لا توجد صلاحيات مباشرة": { en: "No direct permissions", fr: "Aucune autorisation directe" },
  "ليس لديك صلاحية عرض حسابات المستخدمين.": { en: "You do not have permission to view user accounts.", fr: "Vous n’êtes pas autorisé à consulter les comptes utilisateurs." },
  "ابحث في الحسابات وأدر الأدوار والصلاحيات المباشرة بحسب صلاحيتك.": { en: "Search accounts and manage roles or direct permissions available to you.", fr: "Recherchez des comptes et gérez les rôles ou autorisations directes qui vous sont accessibles." },
  "تعذر تحديث الصلاحيات المباشرة.": { en: "Could not update direct permissions.", fr: "Impossible de modifier les autorisations directes." },
  "الصلاحية غير معروفة.": { en: "Unknown permission.", fr: "Autorisation inconnue." },
};

const UI_EXTRA: Record<string, Partial<Record<SiteLocale, string>>> = {
  "بعد أخبار المغتربين": { en: "After diaspora news", fr: "Après les actualités de la diaspora" },
  "مساحة عرضية بين أخبار المغتربين ومنظومة الخدمات": { en: "Wide placement between diaspora news and services", fr: "Emplacement horizontal entre la diaspora et les services" },
  "بعد منظومة الخدمات": { en: "After services", fr: "Après les services" },
  "إعلان مربع بين منظومة الخدمات وقسم اطمّن": { en: "Square ad between services and Atma’en", fr: "Annonce carrée entre les services et Atma’en" },
  "قسم اطمّن": { en: "Atma’en section", fr: "Rubrique Atma’en" },
  "على الويب داخل القسم، وعلى الموبايل بعده كمساحة عرضية": { en: "Inside the section on web; as a wide ad after it on mobile", fr: "Dans la rubrique sur ordinateur ; en bandeau après celle-ci sur mobile" },
  "بعد قصص النجاح": { en: "After success stories", fr: "Après les récits de réussite" },
  "إعلان مربع بين قصص النجاح وأخبار مصر": { en: "Square ad between success stories and Egypt news", fr: "Annonce carrée entre les récits de réussite et l’Égypte" },
  "بعد أخبار مصر": { en: "After Egypt news", fr: "Après les actualités d’Égypte" },
  "مساحة عرضية قبل قسم خط أحمر ومع مسؤول": { en: "Wide placement before Red Line and Ask an Official", fr: "Bandeau avant Ligne rouge et Parole officielle" },
  "بعد خط أحمر ومع مسؤول": { en: "After Red Line and Ask an Official", fr: "Après Ligne rouge et Parole officielle" },
  "إعلان مربع قبل مقالات الرأي": { en: "Square ad before opinion", fr: "Annonce carrée avant les opinions" },
  "بعد مقالات الرأي": { en: "After opinion", fr: "Après les opinions" },
  "مساحة عرضية قبل فرص الاستثمار": { en: "Wide placement before investment opportunities", fr: "Bandeau avant les opportunités d’investissement" },
  "بعد فرص الاستثمار": { en: "After investment opportunities", fr: "Après les opportunités d’investissement" },
  "إعلان مربع قبل قسم الجيل الثاني": { en: "Square ad before Second Generation", fr: "Annonce carrée avant la rubrique Deuxième génération" },
  "بعد الجيل الثاني": { en: "After Second Generation", fr: "Après la rubrique Deuxième génération" },
  "مساحة عرضية قبل اللمة الحلوة والفعاليات": { en: "Wide placement before Community and Events", fr: "Bandeau avant Communauté et Événements" },
  "بعد اللمة الحلوة والفعاليات": { en: "After Community and Events", fr: "Après Communauté et Événements" },
  "إعلان مربع قبل الأقسام الإضافية": { en: "Square ad before additional sections", fr: "Annonce carrée avant les rubriques supplémentaires" },
  "بعد الأقسام الإضافية": { en: "After additional sections", fr: "Après les rubriques supplémentaires" },
  "مساحة عرضية بعد أقسام الصفحة الرئيسية التي يديرها المحرر": { en: "Wide placement after editor-managed homepage sections", fr: "Bandeau après les rubriques d’accueil gérées par la rédaction" },
  "بعد تنبيهات الأزمات": { en: "After crisis alerts", fr: "Après les alertes de crise" },
  "إعلان مربع قبل موجز الأخبار الإضافي": { en: "Square ad before more news", fr: "Annonce carrée avant les actualités complémentaires" },
  "إعلان مربع": { en: "Square placement", fr: "Emplacement carré" },
  "داخل قسم اطمّن": { en: "Inside the Atma’en section", fr: "Dans la rubrique Atma’en" },
  "إعلان أفقي أسفل قصص النجاح": { en: "Wide ad below success stories", fr: "Bandeau sous les récits de réussite" },
  "إعلان مربع أسفل أحدث الأخبار": { en: "Square ad below latest news", fr: "Annonce carrée sous les dernières actualités" },
  "مساحة عرضية جديدة — الويب فقط": { en: "New wide placement — web only", fr: "Nouvel emplacement horizontal — ordinateur uniquement" },
  "بث تجريبي": { en: "Live test", fr: "Test en direct" },
  "صوت المصريين في الخارج": { en: "The voice of Egyptians abroad", fr: "La voix des Égyptiens à l’étranger" },
  "صوتك يهمنا": { en: "Your voice matters", fr: "Votre avis compte" },
  "استبيان جسور": { en: "Jusoor poll", fr: "Sondage Jusoor" },
  "شاركنا رأيك في سؤال يهم المصريين بالخارج.": { en: "Share your views on an issue that matters to Egyptians abroad.", fr: "Donnez votre avis sur un sujet important pour les Égyptiens à l’étranger." },
  "ماذا تريد من منصة جسور؟": { en: "What would you like from the Jusoor platform?", fr: "Qu’attendez-vous de la plateforme Jusoor ?" },
  "أخبار مصر": { en: "Egypt news", fr: "Actualités d’Égypte" },
  "أخبار المغتربين": { en: "Diaspora news", fr: "Actualités de la diaspora" },
  "فرص استثمارية": { en: "Investment opportunities", fr: "Opportunités d’investissement" },
  "مساحة للتواصل": { en: "A place to connect", fr: "Un espace d’échange" },
  "شارك في الاستبيان": { en: "Vote in the poll", fr: "Participer au sondage" },
  "جارٍ تسجيل صوتك…": { en: "Submitting your vote…", fr: "Enregistrement de votre vote…" },
  "انتهى التصويت في هذا الاستبيان.": { en: "Voting in this poll has closed.", fr: "Le vote pour ce sondage est terminé." },
  "إجمالي المشاركات:": { en: "Total votes:", fr: "Nombre total de votes :" },
  "تعذّر تسجيل التصويت.": { en: "Could not submit your vote.", fr: "Impossible d’enregistrer votre vote." },
  "شكرًا لمشاركتك.": { en: "Thank you for taking part.", fr: "Merci pour votre participation." },
  "تعذّر الاتصال. حاول مجددًا.": { en: "Could not connect. Please try again.", fr: "Connexion impossible. Veuillez réessayer." },
  "بريدك الإلكتروني": { en: "Your email address", fr: "Votre adresse e-mail" },
  "اشترك": { en: "Subscribe", fr: "S’abonner" },
  "جارٍ التسجيل…": { en: "Submitting…", fr: "Envoi…" },
  "أوافق على حفظ بريدي لإرسال تنبيهات الأزمات العامة وفق": { en: "I agree to the use of my email for public crisis alerts under the", fr: "J’accepte l’utilisation de mon e-mail pour les alertes publiques selon la" },
  "سياسة الخصوصية": { en: "Privacy Policy", fr: "Politique de confidentialité" },
  "جارٍ التحقق من إتاحة الاشتراك…": { en: "Checking subscription availability…", fr: "Vérification de la disponibilité de l’inscription…" },
  "الاشتراك مغلق مؤقتًا.": { en: "Subscriptions are temporarily closed.", fr: "Les inscriptions sont temporairement fermées." },
  "تم حفظ بريدك. سيبدأ إرسال التنبيهات عند ربط مزوّد البريد وتفعيله.": { en: "Your email has been saved. Alerts will be sent once the email provider is connected and enabled.", fr: "Votre e-mail a été enregistré. Les alertes seront envoyées une fois le fournisseur connecté et activé." },
  "تعذّر تسجيل الاشتراك.": { en: "Could not subscribe.", fr: "Impossible de vous inscrire." },
  "تحديثات الاطمئنان من المجتمع": { en: "Community reassurance updates", fr: "Messages rassurants de la communauté" },
  "لا توجد نتائج مطابقة حتى الآن.": { en: "No matching results yet.", fr: "Aucun résultat correspondant pour le moment." },
  "شارك أو تابع تحديثات عامة منفصلة تمامًا عن البلاغات السرية.": { en: "Share or follow public updates kept completely separate from confidential reports.", fr: "Partagez ou consultez des nouvelles publiques, totalement séparées des signalements confidentiels." },
  "تصفّح مجتمع الاطمئنان ←": { en: "Browse the reassurance community →", fr: "Voir la communauté de soutien →" },
  "أرغب في مشاركة تحديث عام منفصل في مجتمع الاطمئنان بعد تأكيد البلاغ. لن تُنشر بيانات البلاغ أو أسماء أو أرقام التواصل.": { en: "I would like to share a separate public update in the reassurance community after my report is confirmed. Report details, names, and contact numbers will not be published.", fr: "Je souhaite partager une mise à jour publique distincte dans la communauté après confirmation du signalement. Les détails, noms et numéros de contact ne seront pas publiés." },
  "التحديث العام الذي سيظهر للمجتمع": { en: "Public update visible to the community", fr: "Mise à jour publique visible par la communauté" },
  "اكتب معلومة عامة تساعد الآخرين دون أسماء أو أرقام أو تفاصيل خاصة…": { en: "Share general information that may help others. Do not include names, numbers, or private details…", fr: "Partagez une information générale utile, sans nom, numéro ni détail privé…" },
  "منظومة الخدمات": {
    "en": "Our services",
    "fr": "Nos services"
  },
  "إرسال بلاغ خاص لفريق المتابعة": {
    "en": "Send a private report to our support team",
    "fr": "Envoyer un signalement privé à notre équipe"
  },
  "بيانات موثقة عن الجاليات": {
    "en": "Sourced diaspora information",
    "fr": "Informations sourcées sur la diaspora"
  },
  "تنبيهات جغرافية": {
    "en": "Location alerts",
    "fr": "Alertes géographiques"
  },
  "إشعارات الطوارئ": {
    "en": "Emergency notifications",
    "fr": "Notifications d’urgence"
  },
  "الرياضيون": {
    "en": "Egyptian athletes abroad",
    "fr": "Sportifs égyptiens à l’étranger"
  },
  "متابعة المحترفين": {
    "en": "Follow Egyptian professionals",
    "fr": "Suivre les professionnels égyptiens"
  },
  "دليل السفارات": {
    "en": "Embassy directory",
    "fr": "Annuaire des ambassades"
  },
  "المعاملات والتواصل": {
    "en": "Services and contacts",
    "fr": "Démarches et contacts"
  },
  "ملف جسور": {
    "en": "Jusoor profile",
    "fr": "Profil Jusoor"
  },
  "أخبار تهمك": {
    "en": "News that matters to you",
    "fr": "L’actualité qui vous concerne"
  },
  "فرص العمل": {
    "en": "Job opportunities",
    "fr": "Offres d’emploi"
  },
  "وظائف دولية": {
    "en": "International jobs",
    "fr": "Emplois internationaux"
  },
  "برامج وقصص ملهمة": {
    "en": "Programs and inspiring stories",
    "fr": "Programmes et récits inspirants"
  },
  "التنقل بين الخدمات": {
    "en": "Browse services",
    "fr": "Parcourir les services"
  },
  "الخدمة السابقة": {
    "en": "Previous service",
    "fr": "Service précédent"
  },
  "الخدمة التالية": {
    "en": "Next service",
    "fr": "Service suivant"
  },
  "مساحة إعلانية · إعلان ممول": {
    "en": "Sponsored advertising space",
    "fr": "Espace publicitaire sponsorisé"
  },
  "زيارة موقع المعلن": {
    "en": "Visit advertiser’s website",
    "fr": "Visiter le site de l’annonceur"
  },
  "مسودة": {
    "en": "Draft",
    "fr": "Brouillon"
  },
  "معتمد": {
    "en": "Approved",
    "fr": "Approuvé"
  },
  "منشور": {
    "en": "Published",
    "fr": "Publié"
  },
  "مسحوب": {
    "en": "Retracted",
    "fr": "Retiré"
  },
  "مؤرشف": {
    "en": "Archived",
    "fr": "Archivé"
  },
  "إلغاء النشر": {
    "en": "Unpublish",
    "fr": "Dépublier"
  },
  "نشر": {
    "en": "Publish",
    "fr": "Publier"
  },
  "آخر الأخبار": {
    "en": "Latest news",
    "fr": "Dernières actualités"
  },
  "أهلًا بعودتك": {
    "en": "Welcome back",
    "fr": "Bon retour"
  },
  "تابع الأخبار وسير المراجعة، وأنجز مهام التحرير من مكان واحد.": {
    "en": "Track stories and reviews, and manage editorial tasks in one place.",
    "fr": "Suivez les articles et les révisions, et gérez les tâches éditoriales au même endroit."
  },
  "اختصارات لوحة التحرير": {
    "en": "Newsroom shortcuts",
    "fr": "Raccourcis de la rédaction"
  },
  "إدارة الأخبار": {
    "en": "Manage news",
    "fr": "Gérer les actualités"
  },
  "بحث، تحرير، ومتابعة حالة النشر": {
    "en": "Search, edit, and track publication status",
    "fr": "Rechercher, modifier et suivre l’état de publication"
  },
  "اختيار وترتيب فيديوهات الواجهة": {
    "en": "Select and arrange homepage videos",
    "fr": "Choisir et organiser les vidéos d’accueil"
  },
  "توزيع إعلانات الويب والموبايل": {
    "en": "Manage web and mobile ads",
    "fr": "Gérer les publicités web et mobile"
  },
  "إدارة ظهور الأخبار في البحث": {
    "en": "Manage news search visibility",
    "fr": "Gérer la visibilité des actualités dans la recherche"
  },
  "آخر تعديل": {
    "en": "Last updated",
    "fr": "Dernière modification"
  },
  "إجراءات": {
    "en": "Actions",
    "fr": "Actions"
  },
  "تحرير": {
    "en": "Edit",
    "fr": "Modifier"
  },
  "السابق": {
    "en": "Previous",
    "fr": "Précédent"
  },
  "التالي": {
    "en": "Next",
    "fr": "Suivant"
  },
  "مسجّل الدخول:": {
    "en": "Signed in:",
    "fr": "Connecté :"
  },
  "ابحث في عنوان الخبر أو ملخصه": {
    "en": "Search article title or summary",
    "fr": "Rechercher par titre ou résumé"
  },
  "البحث في الأخبار": {
    "en": "Search news",
    "fr": "Rechercher des actualités"
  },
  "جارٍ البحث…": {
    "en": "Searching…",
    "fr": "Recherche…"
  },
  "نتيجة بحث": {
    "en": "search results",
    "fr": "résultats"
  },
  "مقالًا": {
    "en": "articles",
    "fr": "articles"
  },
  "لا توجد أخبار تطابق كلمات البحث. جرّب كلمات أخرى.": {
    "en": "No stories match your search. Try different keywords.",
    "fr": "Aucun article ne correspond à votre recherche. Essayez d’autres mots-clés."
  },
  "لا توجد أخبار بهذه الحالة.": {
    "en": "There are no stories with this status.",
    "fr": "Aucun article avec ce statut."
  },
  "لا توجد مقالات بعد. ابدأ بإنشاء مقال جديد.": {
    "en": "There are no articles yet. Start by creating one.",
    "fr": "Il n’y a pas encore d’articles. Commencez par en créer un."
  },
  "موعد النشر:": {
    "en": "Scheduled for:",
    "fr": "Programmé pour :"
  },
  "رسالة الأزمة واردة باللغة العربية؛ يجب مراجعة ترجمتها التحريرية قبل عرضها بلغة أخرى.": {
    "en": "This crisis message was submitted in Arabic. An editorial translation must be reviewed before it is shown in another language.",
    "fr": "Ce message de crise a été soumis en arabe. Une traduction éditoriale doit être vérifiée avant sa diffusion dans une autre langue."
  },
  "جسور منصة إعلامية للمعلومات والمتابعة، وليست جهة طوارئ أو استجابة رسمية. اتبع تعليمات السلطات المحلية والسفارة المصرية، وتحقق من تاريخ كل معلومة قبل تداولها.": {
    "en": "Jusoor is a media platform for information and updates, not an emergency or official response authority. Follow local authorities and the Egyptian embassy, and check each item's date before sharing it.",
    "fr": "Jusoor est une plateforme d’information et de suivi, et non un service d’urgence ni une autorité officielle. Suivez les consignes locales et celles de l’ambassade d’Égypte, et vérifiez la date avant tout partage."
  },
  "لا تنشر أرقام هواتف أو عناوين أو بيانات شخصية علنًا. البلاغات الفردية لا تظهر هنا ولا تُستخدم لإنتاج أعداد عامة.": {
    "en": "Do not publish phone numbers, addresses, or personal information. Individual reports do not appear here or contribute to public totals.",
    "fr": "Ne publiez pas de numéros, d’adresses ni de données personnelles. Les signalements individuels ne sont pas affichés ici et ne contribuent pas aux chiffres publics."
  },
  "مركز الأزمة": {
    "en": "Crisis Center",
    "fr": "Centre de crise"
  },
  "المصدر:": {
    "en": "Source:",
    "fr": "Source :"
  },
  "صفحات أخبار البلد": {
    "en": "Country news pages",
    "fr": "Pages d’actualités du pays"
  },
  "أرسل معلوماتك لفريق المتابعة بسرية. نتحقق من رقمك أولًا، ثم تصل التفاصيل إلى محرر مختص لمراجعتها.": {
    "en": "Send your information confidentially to our support team. We verify your number first, then a specialist editor reviews the details.",
    "fr": "Envoyez vos informations en toute confidentialité à notre équipe. Nous vérifions d’abord votre numéro, puis un rédacteur spécialisé examine les détails."
  },
  "الدولة التي يوجد بها الشخص": {
    "en": "Country where the person is located",
    "fr": "Pays où se trouve la personne"
  },
  "اسم الشخص الذي تبحث عنه": {
    "en": "Name of the person you are looking for",
    "fr": "Nom de la personne recherchée"
  },
  "ما الذي يقلقك؟": {
    "en": "What are you concerned about?",
    "fr": "Qu’est-ce qui vous inquiète ?"
  },
  "رقم هاتفك لإرسال رمز التأكيد": {
    "en": "Your phone number for the verification code",
    "fr": "Votre numéro pour recevoir le code de vérification"
  },
  "اشرح بإيجاز سبب طلب المساعدة…": {
    "en": "Briefly explain why you need help…",
    "fr": "Expliquez brièvement pourquoi vous avez besoin d’aide…"
  },
  "أوافق على استخدام بيانات التواصل والمعلومات أعلاه لمعالجة هذا البلاغ والتواصل معي بشأنه.": {
    "en": "I agree to use of my contact details and the information above to process this report and contact me about it.",
    "fr": "J’accepte l’utilisation de mes coordonnées et des informations ci-dessus pour traiter ce signalement et me contacter à son sujet."
  },
  "أدخله لتأكيد رقمك وإرسال البلاغ.": {
    "en": "Enter it to verify your number and submit the report.",
    "fr": "Saisissez-le pour vérifier votre numéro et envoyer le signalement."
  }
};

const AUTH_TRANSLATIONS: Record<string, Partial<Record<SiteLocale, string>>> = {
  "استعادة كلمة المرور": {
    "en": "Reset password",
    "fr": "Réinitialiser le mot de passe"
  },
  "استخدم حسابك للوصول إلى الملف الشخصي وخدمات جسور.": {
    "en": "Sign in to access your profile and Jusoor services.",
    "fr": "Connectez-vous pour accéder à votre profil et aux services de Jusoor."
  },
  "أنشئ حسابك لمتابعة خدمات جسور للمصريين بالخارج.": {
    "en": "Create an account to use Jusoor services for Egyptians abroad.",
    "fr": "Créez un compte pour utiliser les services de Jusoor destinés aux Égyptiens à l’étranger."
  },
  "استعادة كلمة المرور غير متاحة في نسخة التجربة الحالية.": {
    "en": "Password recovery is not available in this trial version.",
    "fr": "La réinitialisation du mot de passe n’est pas disponible dans cette version d’essai."
  },
  "خيارات الحساب": {
    "en": "Account options",
    "fr": "Options du compte"
  },
  "دخول": {
    "en": "Sign in",
    "fr": "Connexion"
  },
  "نسيت كلمة السر": {
    "en": "Forgot password",
    "fr": "Mot de passe oublié"
  },
  "لا تتوفر حاليًا خدمة إعادة تعيين كلمة المرور. تواصل مع فريق جسور لاستعادة الوصول إلى حسابك.": {
    "en": "Password reset is not currently available. Contact the Jusoor team to recover access to your account.",
    "fr": "La réinitialisation du mot de passe n’est pas disponible. Contactez l’équipe Jusoor pour récupérer l’accès à votre compte."
  },
  "الاسم بالكامل": {
    "en": "Full name",
    "fr": "Nom complet"
  },
  "نسيت كلمة المرور؟": {
    "en": "Forgot your password?",
    "fr": "Mot de passe oublié ?"
  },
  "أوافق على": {
    "en": "I agree to the",
    "fr": "J’accepte la"
  },
  "جارٍ التنفيذ…": {
    "en": "Please wait…",
    "fr": "Veuillez patienter…"
  },
  "إنشاء الحساب": {
    "en": "Create account",
    "fr": "Créer un compte"
  },
  "مستخدم جديد؟": {
    "en": "New here?",
    "fr": "Nouveau ici ?"
  },
  "أنشئ حسابًا": {
    "en": "Create an account",
    "fr": "Créer un compte"
  },
  "لديك حساب؟": {
    "en": "Already have an account?",
    "fr": "Vous avez déjà un compte ?"
  },
  "سجّل الدخول": {
    "en": "Sign in",
    "fr": "Connectez-vous"
  },
  "مرحبًا بك في جسور": {
    "en": "Welcome to Jusoor",
    "fr": "Bienvenue chez Jusoor"
  },
  "ملف المهجر": {
    "en": "Diaspora profile",
    "fr": "Profil diaspora"
  },
  "مستوى مشاركة الموقع:": {
    "en": "Location sharing level:",
    "fr": "Niveau de partage de la localisation :"
  },
  "بدون موقع": {
    "en": "No location",
    "fr": "Aucune localisation"
  },
  "الدولة فقط": {
    "en": "Country only",
    "fr": "Pays uniquement"
  },
  "المنطقة": {
    "en": "Region",
    "fr": "Région"
  },
  "غير محدد": {
    "en": "Not specified",
    "fr": "Non spécifié"
  },
  "الموقع المسجل:": {
    "en": "Saved location:",
    "fr": "Localisation enregistrée :"
  },
  "لم تضف موقعًا": {
    "en": "No location added",
    "fr": "Aucune localisation ajoutée"
  },
  "إعدادات الموقع": {
    "en": "Location settings",
    "fr": "Paramètres de localisation"
  },
  "حفظ الموقع": {
    "en": "Save location",
    "fr": "Enregistrer la localisation"
  },
  "مدن تتابعها": {
    "en": "Followed cities",
    "fr": "Villes suivies"
  },
  "اختر مدينة للمتابعة": {
    "en": "Select a city to follow",
    "fr": "Choisir une ville à suivre"
  },
  "اختر مدينة": {
    "en": "Select a city",
    "fr": "Choisir une ville"
  },
  "إزالة": {
    "en": "Remove",
    "fr": "Retirer"
  },
  "لا تتابع مدنًا بعد.": {
    "en": "You are not following any cities yet.",
    "fr": "Vous ne suivez encore aucune ville."
  },
  "يمكنك اختيار «بدون موقع» في أي وقت. لا يعرض الملف موقعك الدقيق للجمهور.": {
    "en": "You can choose “No location” at any time. Your exact location is never shown publicly.",
    "fr": "Vous pouvez choisir « Aucune localisation » à tout moment. Votre position exacte n’est jamais affichée publiquement."
  },
  "جارٍ تحميل الحساب…": {
    "en": "Loading account…",
    "fr": "Chargement du compte…"
  },
  "تم حفظ إعدادات الموقع.": {
    "en": "Location settings saved.",
    "fr": "Paramètres de localisation enregistrés."
  },
  "تعذّر حفظ إعدادات الموقع.": {
    "en": "Could not save location settings.",
    "fr": "Impossible d’enregistrer les paramètres de localisation."
  },
  "أضيفت المدينة إلى قائمة المتابعة.": {
    "en": "City added to your followed list.",
    "fr": "Ville ajoutée à votre liste de suivi."
  },
  "تعذّر إضافة المدينة.": {
    "en": "Could not add the city.",
    "fr": "Impossible d’ajouter la ville."
  },
  "أزيلت المدينة من قائمة المتابعة.": {
    "en": "City removed from your followed list.",
    "fr": "Ville retirée de votre liste de suivi."
  },
  "تعذّر إزالة المدينة.": {
    "en": "Could not remove the city.",
    "fr": "Impossible de retirer la ville."
  },
  "تم تسجيل الخروج.": {
    "en": "You have signed out.",
    "fr": "Vous êtes déconnecté."
  },
  "تصفّح الموقع كزائر": {
    "en": "Browse as a guest",
    "fr": "Continuer comme visiteur"
  },
  "العودة إلى جسور": {
    "en": "Back to Jusoor",
    "fr": "Retour à Jusoor"
  },
  "صوت المصريين في الخارج": {
    "en": "The voice of Egyptians abroad",
    "fr": "La voix des Égyptiens à l’étranger"
  },
  "أخبارك وخدماتك وشبكة اطمئنان أسرتك — ": {
    "en": "Your news, services, and family check-in network — ",
    "fr": "Vos actualités, vos services et le réseau de suivi de vos proches — "
  },
  "تابع ما يهمك من أخبار المصريين بالخارج، واستفد من خدمات جسور أينما كنت.": {
    "en": "Follow the news that matters to Egyptians abroad and use Jusoor services wherever you are.",
    "fr": "Suivez l’actualité importante pour les Égyptiens à l’étranger et profitez des services de Jusoor où que vous soyez."
  }
};

const MAP_TRANSLATIONS: Record<string, Partial<Record<SiteLocale, string>>> = {
  "المواقع والبيانات المنشورة": {
    "en": "Published locations and data",
    "fr": "Lieux et données publiés"
  },
  "مجتمعات المصريين حول العالم": {
    "en": "Egyptian communities around the world",
    "fr": "Communautés égyptiennes dans le monde"
  },
  "تصفية حسب الدولة": {
    "en": "Filter by country",
    "fr": "Filtrer par pays"
  },
  "كل الدول": {
    "en": "All countries",
    "fr": "Tous les pays"
  },
  "الغرب": {
    "en": "West",
    "fr": "Ouest"
  },
  "خطوط إحداثية للمدن المسجلة": {
    "en": "Coordinate grid for listed cities",
    "fr": "Grille de coordonnées des villes répertoriées"
  },
  "الشرق": {
    "en": "East",
    "fr": "Est"
  },
  "تموضع النقاط مستمد من إحداثيات المدن المدخلة في دليل جسور؛ العرض إرشادي ولا يمثل حدودًا سياسية أو مواقع أفراد.": {
    "en": "Points use coordinates recorded in Jusoor’s directory. This illustrative view does not show political borders or individual locations.",
    "fr": "Les points utilisent les coordonnées du répertoire Jusoor. Cette visualisation indicative ne représente ni frontières politiques ni emplacements individuels."
  },
  "مؤشر على مستوى المدينة": {
    "en": "City-level indicator",
    "fr": "Indicateur à l’échelle de la ville"
  },
  "بيانات على مستوى الدولة": {
    "en": "Country-level data",
    "fr": "Données à l’échelle du pays"
  },
  "تقدير منشور": {
    "en": "Published estimate",
    "fr": "Estimation publiée"
  },
  "مصدر خارجي موثق": {
    "en": "Sourced from an external reference",
    "fr": "Source externe documentée"
  },
  "مؤشر مجتمع جسور": {
    "en": "Jusoor community indicator",
    "fr": "Indicateur de la communauté Jusoor"
  },
  "غير معروض لحماية الخصوصية": {
    "en": "Not shown to protect privacy",
    "fr": "Non affiché pour protéger la vie privée"
  },
  "مشاركات موقع مجمّعة": {
    "en": "Aggregated location contributions",
    "fr": "Contributions de localisation agrégées"
  },
  "مصدر التقدير:": {
    "en": "Estimate source:",
    "fr": "Source de l’estimation :"
  },
  "الاطلاع على المصدر ↗": {
    "en": "View source ↗",
    "fr": "Consulter la source ↗"
  },
  "لا توجد بيانات لهذه الدولة": {
    "en": "No data for this country",
    "fr": "Aucune donnée pour ce pays"
  },
  "لا توجد تقديرات منشورة حتى الآن": {
    "en": "No estimates have been published yet",
    "fr": "Aucune estimation n’a encore été publiée"
  },
  "اختر دولة أخرى من القائمة.": {
    "en": "Choose another country from the list.",
    "fr": "Choisissez un autre pays dans la liste."
  },
  "سيتم عرض البيانات بعد إدخال تقديرات موثقة واعتمادها من فريق جسور. لا نعرض أرقامًا افتراضية.": {
    "en": "Data will appear after sourced estimates are entered and approved by the Jusoor team. We do not show invented figures.",
    "fr": "Les données seront affichées après la saisie et la validation d’estimations sourcées. Aucun chiffre fictif n’est présenté."
  },
  "جسور حول العالم": {
    "en": "Jusoor around the world",
    "fr": "Jusoor dans le monde"
  },
  "صورة موثقة عن أماكن انتشار المصريين بالخارج، مع تمييز واضح بين التقديرات المنشورة ومؤشرات مجتمع جسور.": {
    "en": "A sourced view of where Egyptians live abroad, clearly separating published estimates from Jusoor community indicators.",
    "fr": "Une vue documentée des lieux de résidence des Égyptiens à l’étranger, distinguant clairement les estimations publiées des indicateurs communautaires Jusoor."
  },
  "دول ذات بيانات منشورة": {
    "en": "Countries with published data",
    "fr": "Pays avec données publiées"
  },
  "مواقع موثقة": {
    "en": "Documented locations",
    "fr": "Lieux documentés"
  },
  "كيف تقرأ الخريطة؟": {
    "en": "How to read the map",
    "fr": "Comment lire la carte"
  },
  "تقديرات السكان مصدرها الروابط وتواريخ النشر بجانب كل رقم، وهي بيانات تقديرية وليست إحصاءً حكوميًا. مؤشرات مستخدمي جسور مجهّلة ولا تظهر إلا للمجموعات التي تضم 25 مشاركة موقع على الأقل. لا نعرض مواقع أو هويات أفراد.": {
    "en": "Population estimates include their source links and publication dates; they are estimates, not government statistics. Jusoor user indicators are anonymized and shown only for groups with at least 25 location contributions. Individual locations and identities are never displayed.",
    "fr": "Les estimations de population sont accompagnées de leurs sources et dates de publication ; ce ne sont pas des statistiques gouvernementales. Les indicateurs des utilisateurs Jusoor sont anonymisés et affichés uniquement pour les groupes d’au moins 25 contributions. Les lieux et identités individuels ne sont jamais affichés."
  }
};


const CMS_TRANSLATIONS: Record<string, Partial<Record<SiteLocale, string>>> = Object.fromEntries(
  [["رابط المعلن","Advertiser URL","URL de l’annonceur"],["وصف الصورة","Image description","Description de l’image"],["إزالة من هذه المساحة","Remove from this placement","Retirer de cet emplacement"],["استبدال بالصورة المحددة","Replace with selected image","Remplacer par l’image sélectionnée"],["اسحب صورة إعلان إلى هنا","Drag an ad image here","Faites glisser une image publicitaire ici"],["استخدم الصورة المحددة هنا","Use the selected image here","Utiliser l’image sélectionnée ici"],["إدارة الإعلانات","Manage advertisements","Gérer les publicités"],["ارفع المواد الإعلانية، ثم اسحب كل صورة إلى المساحة المناسبة لكل واجهة. أضف رابط المعلن قبل الحفظ.","Upload ad assets, then drag each image to the right placement. Add the advertiser URL before saving.","Téléversez les visuels publicitaires, puis faites glisser chaque image vers l’emplacement voulu. Ajoutez l’URL de l’annonceur avant d’enregistrer."],["لوحة الأخبار","News dashboard","Tableau de bord des actualités"],["جارٍ تحميل المساحات…","Loading placements…","Chargement des emplacements…"],["معاينة المساحات","Placement preview","Aperçu des emplacements"],["مكتبة صور الإعلانات","Ad image library","Bibliothèque d’images publicitaires"],["اختر صورة ثم ضعها في مساحة، أو اسحبها مباشرة.","Select an image and assign it to a placement, or drag it directly.","Sélectionnez une image et affectez-la à un emplacement, ou faites-la glisser directement."],["لا توجد صور في مكتبة الوسائط بعد. ارفع صورة إعلان للبدء.","There are no images in the media library yet. Upload an ad image to get started.","La bibliothèque multimédia ne contient encore aucune image. Téléversez une image publicitaire pour commencer."],["لا توجد صور تطابق البحث.","No images match your search.","Aucune image ne correspond à votre recherche."],["إدارة الحالات المصرح بها","Authorized case management","Gestion des dossiers autorisés"],["قائمة الحالات المسندة إليك مرتبة بالأقدم أولًا لمتابعة عادلة.","Your assigned cases are listed oldest first for fair follow-up.","Vos dossiers attribués sont classés du plus ancien au plus récent pour un suivi équitable."],["إجمالي الحالات المسندة","Total assigned cases","Total des dossiers attribués"],["في هذه الصفحة","On this page","Sur cette page"],["صفحة العرض","Display page","Page affichée"],["قائمة المتابعة","Follow-up list","Liste de suivi"],["تعرض القائمة الحد الأدنى من البيانات اللازمة للفرز. افتح الحالة للوصول إلى التفاصيل بصلاحية محرر الأزمات المسندة إليه.","The list shows only the minimum information needed for triage. Open a case to view details if you are its assigned crisis editor.","La liste affiche uniquement les informations nécessaires au tri. Ouvrez un dossier pour voir les détails si vous êtes l’éditeur de crise qui lui est attribué."],["جارٍ تحميل الحالات…","Loading cases…","Chargement des dossiers…"],["الحالة","Case","Dossier"],["المرحلة","Stage","Étape"],["الموقع","Location","Lieu"],["تاريخ الوصول","Received","Reçu le"],["تاريخ الإسناد","Assigned","Attribué le"],["التفاصيل","Details","Détails"],["فتح الحالة","Open case","Ouvrir le dossier"],["لا توجد حالات مسندة إليك حاليًا.","No cases are currently assigned to you.","Aucun dossier ne vous est actuellement attribué."],["بيانات اطمّن سرية. لا تظهر أرقام التواصل في قائمة العرض، وتبقى صلاحية الحالة محصورة في محرر الأزمات المسندة إليه.","Atma’en data is confidential. Contact numbers are hidden from the list, and case access is limited to its assigned crisis editor.","Les données Atma’en sont confidentielles. Les numéros de contact sont masqués dans la liste et l’accès au dossier est réservé à l’éditeur de crise qui lui est attribué."],["جارٍ تحميل تفاصيل الحالة…","Loading case details…","Chargement des détails du dossier…"],["ملف حالة سري","Confidential case file","Dossier confidentiel"],["إغلاق","Close","Fermer"],["وصف الحالة","Case description","Description du dossier"],["رقم التواصل مع صاحب البلاغ","Reporter’s contact number","Numéro de contact du déclarant"],["رقم التواصل الخاص بالحالة","Case contact number","Numéro de contact du dossier"],["التحقق عبر OTP","OTP verification","Vérification par OTP"],["تاريخ إنشاء الحالة","Case created","Dossier créé le"],["حالة المتابعة","Follow-up status","État du suivi"],["بيانات جاليات موثقة","Sourced diaspora data","Données sourcées de la diaspora"],["خريطة المهجر","Diaspora map","Carte de la diaspora"],["أضف تقديرات منشورة مع مصدرها وتاريخها. لا تظهر التقديرات للعامة قبل اعتمادها.","Add published estimates with their source and date. Estimates remain private until approved.","Ajoutez des estimations publiées avec leur source et leur date. Elles restent privées jusqu’à leur validation."],["الخصوصية والمصدر","Privacy and sources","Confidentialité et sources"],["تُعرض الأرقام التقديرية منفصلة عن مؤشرات مستخدمي جسور. المؤشر المجتمعي لا يظهر إلا عند بلوغ 25 مشاركة موقع على الأقل، ولا تُعرض مواقع الأفراد. الأرقام المنشورة هنا تقديرية وليست إحصاءً حكوميًا.","Population estimates are shown separately from Jusoor user indicators. Community indicators appear only after at least 25 location contributions. Individual locations are never shown. Published figures are estimates, not government statistics.","Les estimations de population sont distinctes des indicateurs des utilisateurs Jusoor. Les indicateurs communautaires ne s’affichent qu’à partir de 25 contributions de localisation. Les lieux individuels ne sont jamais affichés. Les chiffres publiés sont des estimations, pas des statistiques gouvernementales."],["إدارة بيانات الخريطة متاحة لرئيس التحرير فقط.","Map data can only be managed by the editor-in-chief.","Seul le rédacteur en chef peut gérer les données de la carte."],["أدخل الرقم كما ورد في المصدر. لا تضف تقديرًا بلا رابط يمكن التحقق منه.","Enter the figure as published by its source. Do not add estimates without a verifiable link.","Saisissez le chiffre tel qu’il est publié par sa source. N’ajoutez aucune estimation sans lien vérifiable."],["إلغاء التعديل","Cancel editing","Annuler la modification"],["اختر الدولة","Select a country","Sélectionner un pays"],["الدولة بالكامل","Entire country","Pays entier"],["عدد المصريين التقديري","Estimated number of Egyptians","Nombre estimé d’Égyptiens"],["اسم المصدر","Source name","Nom de la source"],["رابط المصدر","Source URL","URL de la source"],["تاريخ نشر المصدر","Source publication date","Date de publication de la source"],["إظهار هذا التقدير على الخريطة العامة","Show this estimate on the public map","Afficher cette estimation sur la carte publique"],["أضف الدول والمدن أولًا من صفحة دليل الدول والمدن.","First add countries and cities from the Countries and cities page.","Ajoutez d’abord les pays et les villes depuis la page Pays et villes."],["التقديرات المسجلة","Saved estimates","Estimations enregistrées"],["المسودات لا تظهر في الموقع، وكل رقم منشور يحمل مصدره.","Drafts are not shown on the site. Every published figure includes its source.","Les brouillons ne sont pas affichés. Chaque chiffre publié comporte sa source."],["جارٍ تحميل البيانات…","Loading data…","Chargement des données…"],["التقدير","Estimate","Estimation"],["المصدر وتاريخه","Source and date","Source et date"],["لا توجد تقديرات بعد. أضف أرقامًا منشورة مع مصدرها وتاريخها، أو اترك الخريطة فارغة إلى أن تتوفر بيانات موثوقة.","There are no estimates yet. Add published figures with their sources and dates, or leave the map empty until reliable data is available.","Aucune estimation pour le moment. Ajoutez des chiffres publiés avec leurs sources et dates, ou laissez la carte vide jusqu’à ce que des données fiables soient disponibles."],["بيانات المكان المعتمدة","Approved location data","Données géographiques approuvées"],["إدارة قائمة المواقع المستخدمة في الأخبار، وضع الأزمة، وخدمات «اطمّن» والخريطة.","Manage locations used in news, crisis mode, Atma’en services, and the map.","Gérez les lieux utilisés dans les actualités, le mode crise, les services Atma’en et la carte."],["إدارة دليل الدول متاحة لرئيس التحرير فقط.","Only the editor-in-chief can manage the country directory.","Seul le rédacteur en chef peut gérer le répertoire des pays."],["إضافة دولة","Add country","Ajouter un pays"],["استخدم رمز ISO 3166-1 alpha-2 المعتمد. إحداثيات الدولة نقطة مرجعية للتموضع على الخريطة.","Use the official ISO 3166-1 alpha-2 code. Country coordinates provide a reference point for the map.","Utilisez le code officiel ISO 3166-1 alpha-2. Les coordonnées du pays servent de point de référence sur la carte."],["اسم الدولة بالعربية","Country name in Arabic","Nom du pays en arabe"],["اسم الدولة بالإنجليزية","Country name in English","Nom du pays en anglais"],["رمز الدولة","Country code","Code du pays"],["خط العرض","Latitude","Latitude"],["خط الطول","Longitude","Longitude"],["إضافة مدينة","Add city","Ajouter une ville"],["الإحداثيات اختيارية، لكنها مطلوبة لإظهار مواقع المدن على الخريطة بدقة.","Coordinates are optional, but required to show city locations accurately on the map.","Les coordonnées sont facultatives, mais nécessaires pour afficher précisément les villes sur la carte."],["اسم المدينة بالعربية","City name in Arabic","Nom de la ville en arabe"],["اسم المدينة بالإنجليزية","City name in English","Nom de la ville en anglais"],["المعرّف في الرابط","URL slug","Identifiant URL"],["الدليل الحالي","Current directory","Répertoire actuel"],["لا تظهر البيانات إلا بعد إضافتها واعتمادها هنا.","Data appears only after it is added and approved here.","Les données ne s’affichent qu’après leur ajout et leur validation ici."],["جارٍ تحميل الدليل…","Loading directory…","Chargement du répertoire…"],["لا توجد مدن مسجلة لهذه الدولة بعد.","No cities have been added for this country yet.","Aucune ville n’a encore été ajoutée pour ce pays."],["الدليل فارغ. أضف الدول والمدن التي يغطيها الموقع من النموذجين أعلاه.","The directory is empty. Add the countries and cities covered by the site using the forms above.","Le répertoire est vide. Ajoutez les pays et villes couverts par le site à l’aide des formulaires ci-dessus."],["فيديوهات الصفحة الرئيسية","Homepage videos","Vidéos de la page d’accueil"],["اختر الفيديوهات التي تظهر في أول الصفحة الرئيسية ورتّبها. لا يُضاف شيء تلقائيًا، ولو لم تختر أي فيديو يختفي هذا القسم من الموقع. تظهر هنا الأخبار المنشورة التي اختير لها ملف فيديو مرفوع أو فيديو مضمّن.","Choose and arrange videos for the homepage. Nothing is added automatically; if no video is selected, this section is hidden. Published stories with an uploaded or embedded video appear here.","Choisissez et organisez les vidéos de la page d’accueil. Rien n’est ajouté automatiquement ; sans sélection, cette section est masquée. Les actualités publiées avec une vidéo téléversée ou intégrée apparaissent ici."],["جارٍ التحميل…","Loading…","Chargement…"],["لا توجد فيديوهات مختارة — القسم مخفي حاليًا.","No videos selected — this section is currently hidden.","Aucune vidéo sélectionnée — cette section est actuellement masquée."],["لا توجد فيديوهات أخرى. انشر خبرًا بفيديو (اختر «عرض فيديو من هذا الخبر في قسم الفيديوهات») ليظهر هنا.","No other videos are available. Publish a story with a video and select “Show this story’s video in the videos section” to list it here.","Aucune autre vidéo disponible. Publiez un article avec une vidéo et choisissez « Afficher la vidéo de cet article dans la section vidéos » pour qu’il apparaisse ici."],["التفاعل التحريري","Editorial engagement","Participation éditoriale"],["استبيانات الرئيسية","Homepage polls","Sondages de la page d’accueil"],["أنشئ سؤالًا واختياراته، ثم فعّله ليظهر للزوار. لا يمكن تفعيل أكثر من استبيان في الوقت نفسه.","Create a question and its choices, then activate it for visitors. Only one poll can be active at a time.","Créez une question et ses choix, puis activez-la pour les visiteurs. Un seul sondage peut être actif à la fois."],["السؤال","Question","Question"],["الاختيارات (اختيار في كل سطر، من 2 إلى 8)","Choices (one per line, 2 to 8)","Choix (un par ligne, de 2 à 8)"],["يبدأ في (اختياري)","Starts at (optional)","Début (facultatif)"],["ينتهي في (اختياري)","Ends at (optional)","Fin (facultatif)"],["تفعيل ونشر في الصفحة الرئيسية","Activate and publish on homepage","Activer et publier sur la page d’accueil"],["إلغاء التحرير","Cancel editing","Annuler la modification"],["الاستبيانات السابقة","Previous polls","Sondages précédents"],["لم تُنشأ استبيانات بعد. ابدأ بسؤال واضح واختيارات قصيرة.","No polls created yet. Start with a clear question and short choices.","Aucun sondage créé. Commencez par une question claire et des choix courts."],["متابعة سير العمل التحريري","Editorial workflow monitoring","Suivi du flux éditorial"],["مراقبة غرفة الأخبار","Newsroom monitoring","Suivi de la rédaction"],["صورة تشغيلية لحالة المقالات وحركة سير العمل. لا يتضمن التقرير بيانات شخصية أو أسباب التعديلات.","An operational view of article statuses and workflow activity. This report contains no personal data or edit reasons.","Vue opérationnelle des statuts des articles et de l’activité éditoriale. Ce rapport ne contient aucune donnée personnelle ni motif de modification."],["الفترة","Period","Période"],["آخر 7 أيام","Last 7 days","7 derniers jours"],["آخر 30 يومًا","Last 30 days","30 derniers jours"],["آخر 90 يومًا","Last 90 days","90 derniers jours"],["هذا التقرير متاح لأدوار التحرير القيادية فقط.","This report is available only to senior editorial roles.","Ce rapport est réservé aux rôles éditoriaux de direction."],["جارٍ تحميل التقرير…","Loading report…","Chargement du rapport…"],["المقالات حسب الحالة","Articles by status","Articles par statut"],["الأعداد الحالية، بحسب حالة سير العمل.","Current counts by workflow status.","Nombre actuel d’articles par statut du flux éditorial."],["آخر انتقالات سير العمل","Latest workflow transitions","Dernières transitions du flux éditorial"],["آخر 30 انتقالًا مسجلًا للمقالات.","The 30 most recent recorded article transitions.","Les 30 dernières transitions d’articles enregistrées."],["لا توجد انتقالات مسجلة حتى الآن.","No transitions have been recorded yet.","Aucune transition enregistrée pour le moment."],["المقال","Article","Article"],["الحالة السابقة","Previous status","Statut précédent"],["الحالة الجديدة","New status","Nouveau statut"],["الدور المسجل","Recorded role","Rôle enregistré"],["التوقيت","Time","Heure"],["تحسين ظهور المقال","Article SEO settings","Référencement de l’article"],["عودة للمقال","Back to article","Retour à l’article"],["تم حفظ إعدادات SEO.","SEO settings saved.","Paramètres SEO enregistrés."],["التصنيف الرئيسي","Primary category","Catégorie principale"],["اختر تصنيفًا رئيسيًا","Select a primary category","Sélectionnez une catégorie principale"],["التصنيف يساعد على تجميع الخبر وفهم موضوعه؛ يدير رئيس التحرير قائمة التصنيفات.","Categories group stories by topic. The editor-in-chief manages the category list.","Les catégories regroupent les actualités par sujet. Le rédacteur en chef gère leur liste."],["وسوم ثانوية (حتى 12، افصل بينها بفواصل)","Secondary tags (up to 12, comma-separated)","Étiquettes secondaires (12 maximum, séparées par des virgules)"],["أقسام الديمو التحريرية مثل «أخبار المغتربين» ليست بديلًا عن التصنيف الموضوعي للمقال.","Editorial homepage sections such as “Egyptians Abroad” are not a replacement for an article’s subject category.","Les rubriques éditoriales de la page d’accueil, comme « Égyptiens à l’étranger », ne remplacent pas la catégorie thématique de l’article."],["إدارة التصنيفات الرئيسية","Manage primary categories","Gérer les catégories principales"],["اسم التصنيف","Category name","Nom de la catégorie"],["معرّف التصنيف","Category slug","Identifiant de la catégorie"],["إضافة تصنيف","Add category","Ajouter une catégorie"],["منع الفهرسة وإخراج المقال من خرائط الموقع","Prevent indexing and exclude article from sitemaps","Empêcher l’indexation et exclure l’article des plans de site"],["فعّله فقط للمحتوى الذي لا تريد ظهوره في نتائج البحث؛ قد يقلل الزيارات من البحث.","Enable only for content you do not want in search results; this may reduce search traffic.","Activez cette option uniquement pour un contenu à exclure des résultats de recherche ; le trafic issu des moteurs peut diminuer."],["منع تتبع الروابط","Prevent link following","Empêcher le suivi des liens"],["إعداد متقدم؛ لا تفعّله للمقالات العادية. يمنع محركات البحث من متابعة روابط الصفحة.","Advanced setting. Do not enable for regular articles; it prevents search engines from following page links.","Paramètre avancé : ne l’activez pas pour les articles habituels. Il empêche les moteurs de suivre les liens de la page."],["حفظ SEO","Save SEO","Enregistrer le SEO"],["تحسين ظهور المقالات","Article SEO","SEO des articles"],["غير مفهرس","Not indexed","Non indexé"],["يحتاج تصنيفًا رئيسيًا","Primary category required","Catégorie principale requise"],["إدارة تجربة الموقع","Manage site experience","Gérer l’expérience du site"],["الرئيسية والتنقل","Homepage and navigation","Accueil et navigation"],["تحكم في روابط الشريط وأقسام تحريرية إضافية تظهر على الويب والموبايل.","Manage navigation links and additional editorial sections shown on desktop and mobile.","Gérez les liens de navigation et les rubriques éditoriales supplémentaires sur ordinateur et mobile."],["حفظ التغييرات","Save changes","Enregistrer les modifications"],["أسماء الإدارة والتحرير","Leadership and editorial team","Direction et rédaction"],["تظهر بجوار شعار جسور. الحقلان الأساسيان ثابتان، ويمكن إضافة حتى 8 مسميات أخرى وتعديلها أو حذفها.","Displayed beside the Jusoor logo. The two core roles are fixed; you can add, edit, or remove up to eight more roles.","Affichés à côté du logo Jusoor. Les deux fonctions principales sont fixes ; vous pouvez ajouter, modifier ou supprimer jusqu’à huit autres fonctions."],["＋ إضافة مسمى","＋ Add role","＋ Ajouter une fonction"],["المسمى الوظيفي","Role title","Intitulé du poste"],["مسمى الحقل الإضافي","Additional field title","Intitulé du champ supplémentaire"],["الاسم","Name","Nom"],["حذف الحقل","Remove field","Supprimer le champ"],["روابط التواصل الاجتماعي","Social media links","Liens des réseaux sociaux"],["تظهر الروابط المفعّلة في رأس الموقع والفوتر. لا يُعرض YouTube حتى تضيف رابطه وتفعّله.","Enabled links appear in the site header and footer. YouTube is hidden until you add and enable its URL.","Les liens activés apparaissent dans l’en-tête et le pied de page. YouTube reste masqué jusqu’à l’ajout et l’activation de son URL."],["＋ إضافة منصة","＋ Add platform","＋ Ajouter une plateforme"],["اسم المنصة","Platform name","Nom de la plateforme"],["رابط HTTPS","HTTPS URL","URL HTTPS"],["الأيقونة","Icon","Icône"],["رابط عام","Public link","Lien public"],["ظاهر","Visible","Visible"],["حذف","Delete","Supprimer"],["الفيديو التعريفي عند أول زيارة","Welcome video on first visit","Vidéo d’accueil à la première visite"],["ارفع فيديو MP4 أو WebM عبر مكتبة الوسائط الآمنة. يظهر للزائر مرة واحدة، ويمكنه إعادة تشغيله من صفحة «عن جسور» أو الفوتر.","Upload an MP4 or WebM video through the secure media library. It appears once to each visitor and can be replayed from About Jusoor or the footer.","Téléversez une vidéo MP4 ou WebM dans la bibliothèque multimédia sécurisée. Elle s’affiche une fois et peut être relancée depuis À propos de Jusoor ou le pied de page."],["ملف الفيديو","Video file","Fichier vidéo"],["جارٍ رفع الفيديو إلى مكتبة الوسائط…","Uploading video to the media library…","Téléversement de la vidéo dans la bibliothèque…"],["إزالة الفيديو","Remove video","Supprimer la vidéo"],["تفعيل عرضه مرة واحدة للزائر الجديد","Show once to new visitors","Afficher une fois aux nouveaux visiteurs"],["ترتيب روابط القائمة","Order navigation links","Ordre des liens de navigation"],["اسحب ترتيب الروابط بالأسهم، واختر ظهور الرابط في الشريط أو قائمة «المزيد». الاختيارات نفسها تُستخدم في قائمة الموبايل.","Reorder links with the arrows and choose whether they appear in the main bar or More menu. The same settings apply on mobile.","Réorganisez les liens avec les flèches et choisissez leur affichage dans la barre principale ou le menu Plus. Les mêmes réglages s’appliquent au mobile."],["الشريط","Main bar","Barre principale"],["المزيد","More","Plus"],["أقسام إضافية في الرئيسية","Additional homepage sections","Rubriques supplémentaires de la page d’accueil"],["اختر قسمًا تحريريًا موجودًا، ثم حدد نمط عرضه ومكان ظهوره. لا تُنشأ روابط أو تصنيفات غير معتمدة من هذه الشاشة.","Choose an existing editorial section, then set its layout and placement. This screen cannot create unapproved links or categories.","Choisissez une rubrique éditoriale existante, puis définissez sa mise en page et son emplacement. Cet écran ne crée aucun lien ni catégorie non approuvés."],["اختر قسمًا لإضافته","Choose a section to add","Choisissez une rubrique à ajouter"],["＋ إضافة قسم","＋ Add section","＋ Ajouter une rubrique"],["لم تُضف أقسامًا إضافية. الأقسام التحريرية الأساسية في الصفحة مستمرة كما هي.","No additional sections have been added. The homepage’s core editorial sections remain unchanged.","Aucune rubrique supplémentaire n’a été ajoutée. Les rubriques éditoriales principales restent en place."],["عنوان القسم","Section title","Titre de la rubrique"],["نمط العرض","Display layout","Mise en page"],["مفعّل","Enabled","Activé"],["الويب","Desktop","Ordinateur"],["الموبايل","Mobile","Mobile"],["إدارة المنصة","Platform management","Gestion de la plateforme"],["المستخدمون والصلاحيات","Users and permissions","Utilisateurs et autorisations"],["ابحث في حسابات هيئة التحرير وأدر الأدوار حسب صلاحيتك.","Search newsroom accounts and manage roles according to your permissions.","Recherchez les comptes de la rédaction et gérez les rôles selon vos autorisations."],["إضافة موظف إلى هيئة التحرير","Add newsroom staff member","Ajouter un membre à la rédaction"],["أنشئ الحساب بالدور المناسب. أنشئ كلمة مرور قوية وسلّمها للموظف عبر قناة آمنة. لا تظهر كلمة المرور بعد الحفظ.","Create the account with the right role. Set a strong password and share it securely; it will not be shown again after saving.","Créez le compte avec le rôle approprié. Choisissez un mot de passe robuste et transmettez-le de manière sécurisée ; il ne sera plus affiché après l’enregistrement."],["اسم الموظف","Staff name","Nom du membre"],["البريد الإلكتروني","Email address","Adresse e-mail"],["كلمة مرور مؤقتة (12 حرفًا على الأقل)","Temporary password (at least 12 characters)","Mot de passe temporaire (12 caractères minimum)"],["الدور التحريري","Editorial role","Rôle éditorial"],["جارٍ تحميل المستخدمين…","Loading users…","Chargement des utilisateurs…"],["المستخدم","User","Utilisateur"],["الأدوار الحالية","Current roles","Rôles actuels"],["إدارة الدور","Manage role","Gérer le rôle"],["لا توجد أدوار","No roles","Aucun rôle"],["عرض فقط","View only","Lecture seule"],["تغيير الأدوار مسجل في سجل التدقيق، والخادم يطبق الصلاحيات ويمنع إزالة آخر مدير نظام.","Role changes are audited. The server enforces permissions and prevents removing the last system administrator.","Les changements de rôle sont consignés. Le serveur applique les autorisations et empêche la suppression du dernier administrateur système."],["اختر دورًا…","Select a role…","Sélectionnez un rôle…"],["منح","Grant","Attribuer"],["رئيس التحرير","Editor-in-chief","Rédacteur en chef"],["مراسل","Reporter","Correspondant"],["باحث","Researcher","Chercheur"],["محرر ذكاء اصطناعي","AI editor","Éditeur IA"],["مدقق لغوي","Copy editor","Correcteur"],["محرر أول","Senior editor","Rédacteur principal"],["مدير التحرير","Managing editor","Directeur de rédaction"],["مدقق حقائق","Fact checker","Vérificateur des faits"],["محرر SEO","SEO editor","Éditeur SEO"],["محرر اطمّن","Atma’en editor","Éditeur Atma’en"],["مدير النظام","System administrator","Administrateur système"],["فتاوى","Fatwas","Fatwas"],["جسور","Jusoor","Jusoor"],["مسجّل الدخول:","Signed in:","Connecté :"],["العربية","Arabic","Arabe"],["الإنجليزية","English","Anglais"],["إدارة التصنيفات","Manage categories","Gérer les catégories"],["إضافة مقال","Add article","Ajouter un article"],["اللغة","Language","Langue"],["عنوان الخبر","Article title","Titre de l’article"],["ابحث بالاسم أو البريد الإلكتروني","Search by name or email","Rechercher par nom ou e-mail"],["البحث عن مستخدم","Search users","Rechercher des utilisateurs"],["اسم الدولة بالعربية","Country name in Arabic","Nom du pays en arabe"],["اسم المدينة بالعربية","City name in Arabic","Nom de la ville en arabe"],["نشط على الموقع","Active on site","Actif sur le site"],["غير نشط","Inactive","Inactif"],["جارٍ إعادة المحاولة…","Retrying…","Nouvelle tentative…"],["إعادة المحاولة","Retry","Réessayer"],["مثال: تنبيه للمصريين في…","Example: Alert for Egyptians in…","Exemple : Alerte aux Égyptiens en…"],["اكتب ما تأكد من مصادر موثوقة، وما لا يزال قيد المتابعة.","Enter what has been confirmed by reliable sources and what is still being monitored.","Indiquez ce qui est confirmé par des sources fiables et ce qui reste à suivre."],["مثال: بيان رسمي من…","Example: Official statement from…","Exemple : Communiqué officiel de…"],["صوت تنبيه الأزمة","Crisis alert sound","Son de l’alerte de crise"],["يُطلب من الزائر تشغيل الصوت يدويًا احترامًا لإعدادات المتصفح. الملفات المسموحة: MP3 وOGG وWAV بحد أقصى 10 ميجابايت.","Visitors must start audio manually to respect browser settings. Allowed: MP3, OGG, WAV; 10 MB maximum.","Les visiteurs doivent lancer le son manuellement, conformément aux réglages du navigateur. Formats acceptés : MP3, OGG, WAV ; 10 Mo maximum."],["رفع نغمة التنبيه","Upload alert sound","Téléverser le son d’alerte"],["المتصفح لا يدعم تشغيل الصوت.","Your browser does not support audio playback.","Votre navigateur ne prend pas en charge la lecture audio."],["إزالة الصوت","Remove sound","Supprimer le son"],["تكرار التنبيه (بالثواني)","Repeat alert (seconds)","Répéter l’alerte (secondes)"],["من 15 ثانية إلى ساعة واحدة.","From 15 seconds to one hour.","De 15 secondes à une heure."],["الدول المتأثرة","Affected countries","Pays concernés"],["يظهر التنبيه مع إشارة البلد للزوار. اختر الدول التي تشملها الرسالة فقط.","Visitors see the alert with a country indicator. Select only countries covered by this message.","Les visiteurs voient l’alerte accompagnée d’un indicateur de pays. Sélectionnez uniquement les pays concernés par ce message."],["دولة","country","pays"],["تعذّر تحميل دليل الدول. أعد المحاولة، وإذا استمر العطل فتحقق من اتصال خدمة الـAPI.","Could not load the country directory. Retry; if the issue continues, check the API connection.","Impossible de charger le répertoire des pays. Réessayez ; si le problème persiste, vérifiez la connexion à l’API."],["لا توجد دول في قاعدة البيانات. أضف بيانات الدول أولًا قبل تفعيل وضع الأزمة.","No countries are available. Add country data before activating crisis mode.","Aucun pays n’est disponible. Ajoutez les données des pays avant d’activer le mode crise."],["آخر تحديث:","Last updated:","Dernière mise à jour :"],["لم يُحفظ بعد","Not saved yet","Pas encore enregistré"],["اشتراكات تنبيهات البريد","Email alert subscriptions","Abonnements aux alertes e-mail"],["تحكم في استقبال اشتراكات جديدة. إيقاف الاستقبال لا يحذف العناوين المسجلة.","Control whether new subscriptions are accepted. Disabling subscriptions does not delete existing addresses.","Contrôlez l’acceptation de nouveaux abonnements. La désactivation ne supprime pas les adresses existantes."],["الاستقبال مفتوح","Subscriptions open","Abonnements ouverts"],["الاستقبال مغلق","Subscriptions closed","Abonnements fermés"],["العناوين المسجلة حاليًا:","Currently registered addresses:","Adresses actuellement inscrites :"],[". تُحفظ البيانات مشفرة في قاعدة البيانات. ربط مزود البريد مطلوب قبل إرسال رسائل فعلية.",". Data is encrypted in the database. Connect an email provider before sending real messages.",". Les données sont chiffrées dans la base. Connectez un fournisseur e-mail avant tout envoi réel."],["إيقاف استقبال الاشتراكات","Stop accepting subscriptions","Désactiver les abonnements"],["فتح استقبال الاشتراكات","Accept new subscriptions","Accepter les nouveaux abonnements"],["حدود مهمة","Important limitations","Limites importantes"],["هذه الرسالة لا تمثل جهة طوارئ رسمية. بيانات حالات «اطمّن» سرية ولا تدخل في ملخص الأزمة العام. اربط أي تحديث صحفي بخبر منشور ومعتمد من سير العمل التحريري.","This message does not represent an official emergency authority. Confidential Atma’en case data is never included in public crisis summaries. Link every journalistic update to a published, approved article.","Ce message ne représente pas une autorité officielle d’urgence. Les données confidentielles des dossiers Atma’en ne figurent jamais dans les résumés publics de crise. Reliez toute mise à jour journalistique à un article publié et validé."]].map(([ar, en, fr]) => [ar, { en, fr }]),
);

const HOME_TRANSLATIONS: Record<string, Partial<Record<SiteLocale, string>>> = Object.fromEntries([
  ["أخبار المغتربين", "Diaspora news", "Actualités de la diaspora"], ["قصص نجاح", "Success stories", "Histoires de réussite"], ["قصة نجاح", "Success story", "Histoire de réussite"],
  ["أخبار مصر", "Egypt news", "Actualités d’Égypte"], ["فرص استثمارية", "Investment opportunities", "Opportunités d’investissement"], ["مع مسئول", "Ask an official", "Parole officielle"],
  ["فعاليات", "Events", "Événements"], ["خط أحمر", "Red Line", "Ligne rouge"], ["اللمة الحلوة", "Community", "Communauté"],
  ["فعاليات وتغطيات", "Events and coverage", "Événements et reportages"], ["لمّة الجالية", "Diaspora gathering", "Rencontre de la diaspora"], ["كل اللمّات ←", "All community stories →", "Toutes les rencontres →"],
  ["الجيل الثاني", "Second generation", "Deuxième génération"], ["رياضة", "Sports", "Sports"], ["فنون", "Arts", "Arts"], ["مقالات رأي", "Opinion", "Opinions"], ["فتاوى", "Fatwas", "Fatwas"],
  ["منظومة الخدمات", "Our services", "Nos services"], ["اطمن على مغتربك", "Check on your loved one abroad", "Prendre des nouvelles de votre proche à l’étranger"],
  ["إرسال بلاغ خاص لفريق المتابعة", "Send a private report to the support team", "Envoyer un signalement privé à l’équipe de suivi"],
  ["بيانات موثقة عن الجاليات", "Verified diaspora data", "Données vérifiées sur les diasporas"], ["تنبيهات جغرافية", "Location-based alerts", "Alertes géolocalisées"], ["إشعارات الطوارئ", "Emergency notifications", "Notifications d’urgence"],
  ["الرياضيون", "Athletes", "Sportifs"], ["متابعة المحترفين", "Follow professional athletes", "Suivre les sportifs professionnels"], ["دليل السفارات", "Embassy directory", "Annuaire des ambassades"], ["المعاملات والتواصل", "Services and contacts", "Démarches et contacts"],
  ["ملف جسور", "Jusoor profile", "Profil Jusoor"], ["أخبار تهمك", "News that matters to you", "Les actualités qui vous concernent"], ["فرص العمل", "Job opportunities", "Offres d’emploi"], ["وظائف دولية", "International jobs", "Emplois à l’international"],
  ["برامج وقصص ملهمة", "Programs and inspiring stories", "Programmes et récits inspirants"], ["تغطية مرئية", "Video coverage", "Reportage vidéo"],
  ["زيارة موقع المعلن", "Visit advertiser website", "Visiter le site de l’annonceur"], ["مساحة إعلانية", "Advertisement", "Publicité"], ["التنقل بين الخدمات", "Browse services", "Parcourir les services"], ["الخدمة السابقة", "Previous service", "Service précédent"], ["الخدمة التالية", "Next service", "Service suivant"],
  ["أبرز التغطيات المرئية", "Featured video coverage", "Reportages vidéo à la une"], ["عرض:", "Show:", "Afficher :"], ["تشغيل الفيديو:", "Play video:", "Lire la vidéo :"], ["اقرأ:", "Read:", "Lire :"],
  ["الفيديو السابق", "Previous video", "Vidéo précédente"], ["الفيديو التالي", "Next video", "Vidéo suivante"], ["اختيار التغطية", "Choose coverage", "Choisir un reportage"], ["التغطية", "Coverage", "Reportage"], ["جسور فيديو", "Jusoor Videos", "Vidéos Jusoor"],
  ["شاهد كل الفيديوهات ←", "View all videos →", "Voir toutes les vidéos →"], ["مشغّل الفيديو", "Video player", "Lecteur vidéo"], ["فيديو", "Video", "Vidéo"], ["إغلاق", "Close", "Fermer"], ["اقرأ التقرير كاملاً →", "Read the full story →", "Lire l’article complet →"],
  ["خط أحمر ومع مسؤول", "Red Line and an Official", "Ligne rouge et parole officielle"], ["خط أحمر ومع مسئول", "Red Line and an Official", "Ligne rouge et parole officielle"],
  ["لا توجد مواد منشورة في «{label}» حتى الآن.", "No published items in “{label}” yet.", "Aucun contenu publié dans « {label} » pour le moment."],
  ["ستظهر التغطيات هنا بعد نشر خبر واختيار هذا القسم.", "Coverage will appear here after an article is published in this section.", "Les articles apparaîtront ici après la publication d’un contenu dans cette rubrique."],
  ["كل التحديثات ←", "All updates ←", "Toutes les mises à jour ←"], ["كل اللقاءات ←", "All interviews ←", "Tous les entretiens ←"],
  ["ج", "J", "J"], ["🤝 لمّة الجالية", "🤝 Community gathering", "🤝 Rencontre de la communauté"],
  ["📅 فعاليات وتغطيات", "📅 Events and coverage", "📅 Événements et couverture"], ["شاهد كل الفعاليات ←", "See all events ←", "Voir tous les événements ←"],
  ["على منصة جسور فقط", "Only on Jusoor", "Uniquement sur Jusoor"],
  ["لا تنتظر أخبار الوكالات والمراسلين وقت الأزمات الكبرى.. تابع المستجدات المعتمدة، وأرسل بلاغًا خاصًا للاطمئنان على مغتربك", "During major crises, follow verified updates and send a private report to check on a loved one abroad.", "Lors de crises majeures, suivez les informations vérifiées et envoyez un signalement privé pour prendre des nouvelles d’un proche à l’étranger."],
  ["اطمّن على مغتربك", "Check on your loved one abroad", "Prenez des nouvelles de votre proche à l’étranger"], ["مركز الأزمة", "Crisis center", "Centre de crise"],
  ["طوارئ", "Emergency", "Urgence"], ["تنبيه", "Alert", "Alerte"], ["عاجل", "Urgent", "Urgent"], ["التفاصيل وإرشادات المتابعة ←", "Details and follow-up guidance ←", "Détails et consignes de suivi ←"],
  ["أحدث الأخبار", "Latest news", "Dernières actualités"], ["ما تفوّتش أي تحديث يخص بلدك", "Never miss an update about your country", "Ne manquez aucune actualité concernant votre pays"],
  ["اشترك في تنبيهات المدينة اللي إنت أو أهلك فيها — إشعار لحظي وقت الأزمات فقط، مفيش إزعاج يومي.", "Subscribe to alerts for your city or your family’s city. Instant notifications during crises only, with no daily noise.", "Abonnez-vous aux alertes de votre ville ou de celle de votre famille. Notifications instantanées uniquement en période de crise, sans messages quotidiens."],
  ["خط أحمر ومع مسئول", "Red Line and With an Official", "Ligne rouge et Avec un responsable"],
  ["كل المقالات ←", "All articles ←", "Tous les articles ←"], ["كل اللمّات ←", "All gatherings ←", "Toutes les rencontres ←"],
].map(([ar, en, fr]) => [ar, { en, fr }]));

Object.assign(CMS_TRANSLATIONS, Object.fromEntries([
  ["جارٍ تحميل المقالات…", "Loading articles…", "Chargement des articles…"],
  ["جارٍ تحميل الاستبيانات…", "Loading polls…", "Chargement des sondages…"],
  ["جارٍ تحميل إعدادات الموقع…", "Loading site settings…", "Chargement des paramètres du site…"],
  ["جارٍ تحميل وضع الأزمة…", "Loading crisis mode…", "Chargement du mode crise…"],
  ["لديك تغييرات غير محفوظة.", "You have unsaved changes.", "Vous avez des modifications non enregistrées."],
  ["إيقاف", "Pause", "Désactiver"], ["عرض الفيديو من هذا الخبر في قسم الفيديوهات", "Show this story’s video in the videos section", "Afficher la vidéo de cet article dans la section vidéos"],
  ["فيديو مضمّن", "Embedded video", "Vidéo intégrée"], ["ملف مرفوع", "Uploaded file", "Fichier téléversé"],
  ["بدون صورة غلاف (ستظهر «جسور» مكانها)", "No cover image (Jusoor placeholder will appear)", "Sans image de couverture (le visuel Jusoor sera affiché)"],
  ["تحديث", "Refresh", "Actualiser"], ["السابق", "Previous", "Précédent"], ["التالي", "Next", "Suivant"],
].map(([ar, en, fr]) => [ar, { en, fr }])));

const CMS_PREFIX_TRANSLATIONS: Record<string, Partial<Record<SiteLocale, string>>> = {
  "الرابط الحالي: ": { en: "Current URL: ", fr: "URL actuelle : " },
  "هل تريد سحب دور ": { en: "Remove the role ", fr: "Retirer le rôle " },
  " من ": { en: " from ", fr: " de " },
  "مسجّل الدخول:": { en: "Signed in:", fr: "Connecté :" },
  "معاينة ": { en: "Preview ", fr: "Aperçu " },
  "المعروضة في الصفحة الرئيسية (": { en: "Shown on homepage (", fr: "Affichées sur la page d’accueil (" },
  "فيديوهات منشورة متاحة للإضافة (": { en: "Published videos available to add (", fr: "Vidéos publiées disponibles à l’ajout (" },
  "آخر تحديث:": { en: "Last updated:", fr: "Dernière mise à jour :" },
  "آخر حفظ:": { en: "Last saved:", fr: "Dernier enregistrement :" },
  "＋ ": { en: "＋ ", fr: "＋ " },
};

export function translateUi(locale: SiteLocale, text: string): string {
  if (locale === "ar") return text;
  const emptyDesk = text.match(/^لا توجد مواد منشورة في «(.+)» حتى الآن\.$/);
  if (emptyDesk) {
    const label = translateUi(locale, emptyDesk[1]);
    return locale === "en" ? `No published items in “${label}” yet.` : `Aucun contenu publié dans « ${label} » pour le moment.`;
  }
  const exact = UI_TRANSLATIONS[text]?.[locale] ?? UI_EXTRA[text]?.[locale] ?? AUTH_TRANSLATIONS[text]?.[locale] ?? MAP_TRANSLATIONS[text]?.[locale] ?? CMS_TRANSLATIONS[text]?.[locale] ?? HOME_TRANSLATIONS[text]?.[locale];
  if (exact) return exact;
  const prefix = Object.entries(CMS_PREFIX_TRANSLATIONS).find(([key]) => text.startsWith(key));
  return prefix ? prefix[1][locale] + text.slice(prefix[0].length) : text;
}

