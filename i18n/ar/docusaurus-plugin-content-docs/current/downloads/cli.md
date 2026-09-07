# تحميل أداة المدار

أداة المدار (`orb`) هي أداة سطر الأوامر للتحقق من صحة مخططات المدار وتصريفها والعمل معها.

## التثبيت السريع

### npm (موصى به)

```bash
curl -fsSL https://orb.almadar.io/install.sh | sh
```

### npm

```bash
npm install -g @almadar/orb
```

### Homebrew (macOS/Linux)

```bash
brew install almadar/tap/orb
```

### Cargo (لمطوري Rust)

```bash
cargo install orb-cli
```

## التحميل حسب المنصة

### Linux

| المعمارية | الصيغة | التحميل |
|----------|--------|---------|
| x86_64 | tar.gz | [orb-linux-x86_64.tar.gz](#) |
| x86_64 | deb | [orb_x86_64.deb](#) |
| x86_64 | rpm | [orb-x86_64.rpm](#) |
| ARM64 | tar.gz | [orb-linux-aarch64.tar.gz](#) |

**التثبيت (tar.gz):**

```bash
tar -xzf orb-linux-x86_64.tar.gz
sudo mv orb /usr/local/bin/
```

### macOS

| المعمارية | الصيغة | التحميل |
|----------|--------|---------|
| Intel (x86_64) | tar.gz | [orb-macos-x86_64.tar.gz](#) |
| Apple Silicon (ARM64) | tar.gz | [orb-macos-aarch64.tar.gz](#) |
| Universal | pkg | [orb-macos.pkg](#) |

### Windows

| المعمارية | الصيغة | التحميل |
|----------|--------|---------|
| x86_64 | zip | [orb-windows-x86_64.zip](#) |
| x86_64 | msi | [orb-windows-x86_64.msi](#) |

**التثبيت (winget):**

```powershell
winget install Almadar.Orb
```

## التحقق من التثبيت

```bash
orb --version
# Orb CLI v1.0.0

orb --help
# المدار - فيزياء البرمجيات
#
# الاستخدام:
#     orb <أمر>
#
# الأوامر:
#     validate   التحقق من صحة مخطط .orb
#     compile    تصريف المخطط إلى الهدف
#     format     تنسيق مخطط .orb
#     dev        تشغيل خادم التطوير
#     test       تشغيل اختبارات آلة الحالة
#     new        إنشاء مشروع جديد
#     help       طباعة هذه الرسالة
```

## الاستخدام الأساسي

### التحقق من المخطط

```bash
orb validate my-app.orb
# ✓ المخطط صالح
# ✓ ٣ مدارات، ٥ سمات، ٨ كيانات
```

### التصريف إلى TypeScript

```bash
orb compile my-app.orb --shell typescript --output ./generated
# ✓ تم توليد ٢٤ ملف
# ✓ المخرجات: ./generated
```

### تشغيل خادم التطوير

```bash
orb dev my-app.orb
# جاري تشغيل خادم تطوير المدار...
# ✓ تم تحميل المخطط: my-app.orb
# ✓ الخادم: http://localhost:3000
# ✓ العميل: http://localhost:5173
# 
# جاري مراقبة التغييرات...
```

### تشغيل الاختبارات

```bash
orb test my-app.orb
# جاري تشغيل اختبارات آلة الحالة...
# ✓ TaskLifecycle: ١٢ انتقال تم اختباره
# ✓ UserAuth: ٨ انتقالات تم اختبارها
# ✓ تم تقييم جميع الحراس
# 
# الاختبارات: ٢٠ نجحت، ٠ فشلت
```

### إنشاء مشروع جديد

```bash
orb new my-app
# ✓ تم إنشاء my-app/
# ✓ تم إنشاء my-app/schema.orb
# ✓ تم إنشاء my-app/orb.config.json
#
# ابدأ الآن:
#   cd my-app
#   orb dev
```

## الإعدادات

أنشئ ملف `orb.config.json` في جذر مشروعك:

```json
{
  "$schema": "https://almadar.io/schemas/config.json",
  "schema": "./schema/my-app.orb",
  "output": "./src/generated",
  "shell": "typescript",
  "locale": "ar",
  "features": {
    "hotReload": true,
    "generateTypes": true,
    "generateDocs": true
  }
}
```

ثم قم بتشغيل:

```bash
orb compile
# يستخدم الإعدادات من orb.config.json
```

## دعم اللغة العربية

المدار يدعم اللغة العربية بشكل كامل لرسائل الخطأ والمخرجات:

```bash
orb validate schema.orb --locale ar
# ✓ المخطط صالح
# ✓ ٣ مدارات، ٥ سمات، ٨ كيانات
```

## الخطوات التالية

- [بناء مدير المهام](/docs/tutorials/beginner/task-manager) - ابنِ شيئاً!
- [مرجع المشغلات](/docs/reference/operators/) - مرجع كامل للمشغلات
- [الحراس والقواعد](/docs/tutorials/intermediate/guards) - S-expressions عملياً

---

## استكشاف الأخطاء

### "الأمر غير موجود"

تأكد من أن الملف التنفيذي في مسار PATH:

```bash
# تحقق من مكان تثبيت orb
which orb

# أضف إلى PATH إذا لزم الأمر (أضف إلى ~/.bashrc أو ~/.zshrc)
export PATH="$PATH:/path/to/orb"
```

### رفض الصلاحيات (Linux/macOS)

```bash
chmod +x /usr/local/bin/orb
```

---

*تحتاج مساعدة؟ انضم إلى [Discord](https://discord.gg/almadar) أو افتح [مشكلة](https://github.com/almadar-io/orb/issues).*
