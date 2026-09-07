# المكتبة القياسية (Standard Library)

> 93 سلوكاً قابلاً لإعادة الاستخدام، منظمة كذرات وجزيئات وكائنات عضوية.

---

## نظرة عامة

توفر المكتبة القياسية **93 سلوكاً قابلاً لإعادة الاستخدام** لتطبيقات Orb، منظمة في ثلاثة مستويات:

| المستوى | العدد | الدور | أمثلة |
|---------|-------|-------|-------|
| **الذرات (Atoms)** | 50 | آلات حالة مستقلة غير قابلة للتقسيم | std-browse، std-modal، std-search، std-filter، std-timer |
| **الجزيئات (Molecules)** | 18 | تركّب الذرات عبر ناقل أحداث مشترك | std-list، std-cart، std-detail، std-messaging |
| **الكائنات العضوية (Organisms)** | 25 | تركّب الجزيئات في تطبيقات كاملة | std-ecommerce، std-crm، std-lms، std-helpdesk |

كل سلوك هو دالة نقية تعيد `OrbitalDefinition` كاملاً (كيان + سمات + صفحات). تستدعيها بمعاملات (اسم الكيان، الحقول، مسار الصفحة) وتحصل على بنية `.orb` جاهزة للتصريف.

```typescript
import { stdList } from '@almadar/std/behaviors/functions';

const orbital = stdList({
  entityName: 'Product',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'price', type: 'number', required: true },
  ],
  pagePath: '/products',
  pageTitle: 'Products',
});
// يعيد: entity + 4 traits (browse, create, edit, view) + 1 page
```

---

## نموذج التركيب

### الذرات: لبنات البناء

الذرات غير قابلة للتقسيم. كل منها سمة واحدة بآلة حالة واحدة. لا تعرف عن بعضها البعض.

```
std-browse: Browsing ──INIT──► Browsing (fetch + render list)
std-modal:  Closed ──OPEN──► Open ──CLOSE──► Closed
std-search: Idle ──SEARCH──► Searching ──RESULTS──► Idle
std-filter: Idle ──FILTER──► Filtered ──CLEAR──► Idle
```

### الجزيئات: ذرات مركّبة

الجزيئات تجمع الذرات باستخدام `extractTrait` (استخراج السمة) و`wire` (ربط أحداث emit/listen بين السمات). الجزيء ليس سلوكاً جديداً، بل ذرات مربوطة ببعضها.

```
std-list = std-browse + std-modal(create) + std-modal(edit) + std-modal(view)
  └─ browse emits SELECT ──► view listens
  └─ create emits SAVED ──► browse listens (refresh)
  └─ edit emits SAVED ──► browse listens (refresh)
```

```typescript
import { stdBrowse, stdModal } from '@almadar/std/behaviors/functions';
import { connect, compose } from '@almadar/core/builders';

// std-list هو تقريباً هذا التركيب:
const browseTrait = extractTrait(stdBrowse({ entityName: 'Product', ... }));
const createTrait = extractTrait(stdModal({ mode: 'create', ... }));
const editTrait = extractTrait(stdModal({ mode: 'edit', ... }));
const viewTrait = extractTrait(stdModal({ mode: 'view', ... }));

// ربط الأحداث بين السمات
wire(createTrait, 'PRODUCT_CREATED', browseTrait, 'INIT');
wire(editTrait, 'PRODUCT_UPDATED', browseTrait, 'INIT');

// تركيب في وحدة مدارية واحدة
const orbital = compose({
  entityName: 'Product',
  traits: [browseTrait, createTrait, editTrait, viewTrait],
  pages: [{ path: '/products', traits: ['ProductBrowse', 'ProductCreate', 'ProductEdit', 'ProductView'] }],
});
```

### الكائنات العضوية: تطبيقات كاملة

الكائنات العضوية تركّب الجزيئات في تطبيقات متعددة الصفحات مع ربط عبر الكيانات.

```
std-ecommerce = std-list(Product) + std-cart(CartItem) + std-wizard(Checkout)
  └─ Product browse emits ADD_TO_CART ──► Cart listens
  └─ Cart emits CHECKOUT ──► Checkout listens
  └─ Checkout emits ORDER_PLACED ──► Cart listens (clear)
```

---

## كتالوج السلوكيات

### الذرات (50)

#### تفاعل الواجهة
| السلوك | الوصف |
|--------|-------|
| `std-browse` | قائمة كيانات مع جلب، عرض كشبكة بيانات أو بطاقات كيانات |
| `std-modal` | فتح/إغلاق طبقة لإنشاء أو تعديل أو عرض |
| `std-drawer` | لوحة منزلقة من حافة الشاشة |
| `std-tabs` | تبديل التبويبات مع لوحات المحتوى |
| `std-wizard` | نموذج متعدد الخطوات مع تنقل للأمام/الخلف |
| `std-confirmation` | حوار نعم/لا قبل الإجراءات التدميرية |
| `std-display` | عرض تفاصيل كيان للقراءة فقط |
| `std-input` | إدخال نموذج مع التحقق |
| `std-upload` | رفع ملف مع التقدم |
| `std-gallery` | معرض صور مع عرض مكبّر |
| `std-flip-card` | بطاقة بوجهين مع حركة قلب |
| `std-rating` | إدخال تقييم بالنجوم أو الأرقام |
| `std-text-effects` | نص متحرك (آلة كاتبة، تلاشي، إلخ.) |
| `std-theme` | تبديل السمة (فاتح/داكن/مخصص) |

#### إدارة البيانات
| السلوك | الوصف |
|--------|-------|
| `std-search` | إدخال بحث مع استعلام مؤجل + نتائج مصفاة |
| `std-filter` | عناصر تصفية تضيّق مجموعة بيانات |
| `std-sort` | عناصر ترتيب للأعمدة |
| `std-pagination` | تنقل بين الصفحات لمجموعات البيانات الكبيرة |
| `std-selection` | تحديد متعدد بخانات الاختيار |
| `std-undo` | مكدس تراجع/إعادة للإجراءات القابلة للعكس |
| `std-calendar` | منتقي تاريخ / عرض تقويم |

#### غير متزامن + حالة
| السلوك | الوصف |
|--------|-------|
| `std-async` | آلة حالة تحميل/نجاح/خطأ للعمليات غير المتزامنة |
| `std-loading` | مؤشر تحميل مع مهلة |
| `std-timer` | عد تنازلي أو ساعة إيقاف |
| `std-notification` | إشعارات مؤقتة مع إغلاق تلقائي |
| `std-cache-aside` | نمط cache-aside (تحقق من الذاكرة المؤقتة، جلب إذا لم توجد) |
| `std-circuit-breaker` | قاطع دائرة للاستدعاءات الخارجية الفاشلة |
| `std-rate-limiter` | تحديد معدل لاستدعاءات API |

#### نواة الألعاب
| السلوك | الوصف |
|--------|-------|
| `std-combat` | نظام قتال بالأدوار أو في الوقت الحقيقي |
| `std-movement` | حركة على شبكة أو حركة حرة على خريطة |
| `std-collision` | كشف التصادم بين كائنات اللعبة |
| `std-physics2d` | محاكاة فيزياء ثنائية الأبعاد (جاذبية، سرعة) |
| `std-quest` | تتبع المهام/المهمات بالأهداف |
| `std-overworld` | خريطة عالم باختيار المواقع |
| `std-gameflow` | آلة حالة اللعبة (قائمة، لعب، متوقف، انتهاء اللعبة) |
| `std-sprite` | حركة الرسوم المتحركة بتسلسل الإطارات |
| `std-score` | تتبع النقاط مع المضاعفات |

#### واجهة الألعاب
| السلوك | الوصف |
|--------|-------|
| `std-game-hud` | واجهة العرض الرأسي (صحة، مانا، خريطة مصغرة) |
| `std-score-board` | لوحة الصدارة / أعلى النقاط |
| `std-game-menu` | القائمة الرئيسية، الإعدادات، الاعتمادات |
| `std-game-over-screen` | انتهاء اللعبة مع إعادة المحاولة/الخروج |
| `std-dialogue-box` | حوار شخصيات مع خيارات |
| `std-inventory-panel` | شبكة مخزون مع سحب وإفلات |
| `std-combat-log` | سجل أحداث القتال المتمرر |
| `std-game-audio` | إدارة الموسيقى والمؤثرات الصوتية |

#### لوحة الألعاب
| السلوك | الوصف |
|--------|-------|
| `std-game-canvas2d` | حلقة عرض لوحة ثنائية الأبعاد |
| `std-game-canvas3d` | لوحة ثلاثية الأبعاد مع تكامل Three.js |
| `std-isometric-canvas` | لوحة لعبة متساوية القياس بالبلاط |
| `std-platformer-canvas` | لوحة لعبة منصات جانبية التمرير |
| `std-simulation-canvas` | لوحة محاكاة فيزياء/جسيمات |

### الجزيئات (18)

| السلوك | مُركّب من | الوصف |
|--------|----------|-------|
| `std-list` | browse + modal(create/edit/view) | قائمة CRUD كاملة مع نوافذ إنشاء وتعديل وعرض |
| `std-detail` | display + modal(edit) | عرض تفاصيل مع تعديل مضمّن |
| `std-cart` | browse + selection + confirmation | عربة تسوق مع إضافة/إزالة/دفع |
| `std-inventory` | browse + selection + modal | إدارة المخزون مع تتبع المخزون |
| `std-messaging` | browse + input + async | قائمة رسائل مع إرسال في الوقت الحقيقي |
| `std-geospatial` | browse + modal + map | بيانات مبنية على الموقع مع علامات خريطة |
| `std-form-advanced` | wizard + input + validation | نموذج متعدد الأقسام مع حقول شرطية |
| `std-quiz` | wizard + score + timer | اختبار بتوقيت مع نقاط |
| `std-turn-based-battle` | combat + score + game-hud | نظام معركة بالأدوار |
| `std-platformer-game` | movement + collision + physics2d | ميكانيكا لعبة منصات جانبية التمرير |
| `std-puzzle-game` | selection + score + timer | لعبة ألغاز مع عد الحركات |
| `std-builder-game` | selection + inventory + canvas | ميكانيكا لعبة بناء/تصنيع |
| `std-classifier-game` | selection + score + timer | لعبة فرز/تصنيف |
| `std-sequencer-game` | timer + score + input | لعبة حفظ تسلسلات |
| `std-debugger-game` | browse + selection + score | لعبة البحث عن الأخطاء |
| `std-negotiator-game` | dialogue + score + timer | لعبة تفاوض/حوار |
| `std-simulator-game` | simulation-canvas + timer + score | لعبة محاكاة فيزياء |
| `std-event-handler-game` | timer + score + input | لعبة ردود فعل مدفوعة بالأحداث |

### الكائنات العضوية (25)

| السلوك | المجال | الوصف |
|--------|--------|-------|
| `std-ecommerce` | تجارة | كتالوج منتجات + عربة + دفع |
| `std-crm` | مبيعات | إدارة جهات الاتصال/الصفقات/خط الأنابيب |
| `std-lms` | تعليم | تتبع الدورات/الدروس/التقدم |
| `std-cms` | محتوى | إدارة المقالات/الصفحات/الوسائط |
| `std-helpdesk` | دعم | فرز التذاكر، التحقيق، الحل |
| `std-hr-portal` | موارد بشرية | إدارة الموظفين/الإجازات/التقييمات |
| `std-social-feed` | تواصل اجتماعي | تغذية المنشورات/التعليقات/الإعجابات |
| `std-project-manager` | إدارة مشاريع | إدارة المهام/السباقات/اللوحات |
| `std-booking-system` | ضيافة | إدارة الغرف/الفترات/الحجوزات |
| `std-finance-tracker` | مالية | تتبع المعاملات/الميزانيات/التقارير |
| `std-healthcare` | طبي | إدارة المرضى/المواعيد/السجلات |
| `std-realtime-chat` | تواصل | غرف محادثة مع رسائل في الوقت الحقيقي |
| `std-trading-dashboard` | مالية | بيانات السوق + تنفيذ الأوامر |
| `std-iot-dashboard` | إنترنت الأشياء | مراقبة الأجهزة + التنبيهات |
| `std-devops-dashboard` | DevOps | صحة الخدمات + تتبع النشر |
| `std-cicd-pipeline` | DevOps | خط أنابيب البناء/الاختبار/النشر |
| `std-api-gateway` | بنية تحتية | إدارة التوجيه/تحديد المعدل/المصادقة |
| `std-coding-academy` | تعليم | دروس برمجة تفاعلية |
| `std-stem-lab` | تعليم | محاكاة تجارب علمية |
| `std-logic-training` | تعليم | تدريب ألغاز المنطق |
| `std-rpg-game` | ألعاب | لعبة تقمص أدوار مع مهام + قتال |
| `std-platformer-app` | ألعاب | تطبيق لعبة منصات كامل |
| `std-puzzle-app` | ألعاب | مجموعة ألعاب ألغاز |
| `std-strategy-game` | ألعاب | لعبة استراتيجية بالأدوار |
| `std-arcade-game` | ألعاب | ميكانيكا ألعاب أركيد كلاسيكية |

---

## استخدام السلوكيات

### كدوال نقية

```typescript
import { stdList, stdEcommerce } from '@almadar/std/behaviors/functions';

// بسيط: كيان واحد مع CRUD
const tasks = stdList({
  entityName: 'Task',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'status', type: 'enum', values: ['todo', 'doing', 'done'] },
  ],
  pagePath: '/tasks',
});

// معقد: تجارة إلكترونية متعددة الكيانات
const shop = stdEcommerce({
  productEntity: 'Product',
  productFields: [...],
  cartEntity: 'CartItem',
  orderEntity: 'Order',
});
```

### كملفات `.orb` ذهبية

كل سلوك يُصدَّر أيضاً كملف `.orb` في `@almadar/std/behaviors/registry/`:

```bash
# عرض جميع السلوكيات المتاحة
ls node_modules/@almadar/std/behaviors/registry/atoms/
ls node_modules/@almadar/std/behaviors/registry/molecules/
ls node_modules/@almadar/std/behaviors/registry/organisms/
```

هذه الملفات الذهبية تُستخدم بواسطة:
- مُصرِّف Orb لمطابقة السلوكيات
- وكيل الذكاء الاصطناعي لتوليد البرامج
- مخطط Masar للمقارنة الهيكلية

### تركيب سلوكيات مخصصة

```typescript
import { stdBrowse, stdModal, stdSearch } from '@almadar/std/behaviors/functions';
import { compose, wire, extractTrait } from '@almadar/core/builders';

// إنشاء جزيء مخصص: قائمة قابلة للبحث مع نافذة إنشاء
const searchableCatalog = compose({
  appName: 'Catalog',
  orbitals: [
    stdBrowse({ entityName: 'Item', fields: [...] }),
    stdSearch({ entityName: 'Item' }),
    stdModal({ entityName: 'Item', mode: 'create' }),
  ],
});
```

---

## تكامل الأنماط

السلوكيات تستخدم أنماطاً من **سجل الأنماط** (233 نمطاً) لتأثيرات `render-ui`. كل نمط يُربط بمكوّن React:

| فئة النمط | أمثلة | تُستخدم بواسطة |
|-----------|-------|--------------|
| عرض البيانات | `data-grid`، `entity-table`، `entity-cards`، `data-list` | std-browse |
| النماذج | `form-section`، `form-field`، `form-wizard` | std-modal، std-wizard |
| التنقل | `page-header`، `breadcrumb`، `tabs` | std-tabs، الصفحات |
| ردود الفعل | `alert`، `toast`، `modal-dialog` | std-notification، std-confirmation |
| التخطيط | `stack`، `grid`، `sidebar-layout` | جميع الكائنات العضوية |
| الألعاب | `game-canvas`، `game-hud`، `score-display` | سلوكيات الألعاب |

---

## الخطوات التالية

- [الكيانات](./entities.md): كيف تعمل نماذج بيانات الكيانات
- [السمات](./traits.md): كيف تحدد آلات الحالة السلوك
- [الأنماط](./patterns.md): كيف ترتبط تأثيرات render-ui بالمكوّنات
- [الدائرة المغلقة](./closed-circuit.md): نمط تدفق الأحداث
