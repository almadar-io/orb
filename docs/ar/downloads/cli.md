# تحميل أداة المدار

أداة المدار (`almadar`) هي أداة سطر الأوامر للتحقق من صحة مخططات المدار وتصريفها والعمل معها.

## التثبيت السريع

### npm (موصى به)

```bash
npm install -g @almadar/cli
```

### Homebrew (macOS/Linux)

```bash
brew install almadar/tap/almadar
```

### Cargo (لمطوري Rust)

```bash
cargo install almadar-cli
```

## التحميل حسب المنصة

### Linux

| المعمارية | الصيغة | التحميل |
|----------|--------|---------|
| x86_64 | tar.gz | [almadar-linux-x86_64.tar.gz](#) |
| x86_64 | deb | [almadar_x86_64.deb](#) |
| x86_64 | rpm | [almadar-x86_64.rpm](#) |
| ARM64 | tar.gz | [almadar-linux-aarch64.tar.gz](#) |

**التثبيت (tar.gz):**

```bash
tar -xzf almadar-linux-x86_64.tar.gz
sudo mv almadar /usr/local/bin/
```

### macOS

| المعمارية | الصيغة | التحميل |
|----------|--------|---------|
| Intel (x86_64) | tar.gz | [almadar-macos-x86_64.tar.gz](#) |
| Apple Silicon (ARM64) | tar.gz | [almadar-macos-aarch64.tar.gz](#) |
| Universal | pkg | [almadar-macos.pkg](#) |

### Windows

| المعمارية | الصيغة | التحميل |
|----------|--------|---------|
| x86_64 | zip | [almadar-windows-x86_64.zip](#) |
| x86_64 | msi | [almadar-windows-x86_64.msi](#) |

**التثبيت (winget):**

```powershell
winget install Almadar.CLI
```

## التحقق من التثبيت

```bash
almadar --version
# Almadar CLI v1.0.0

almadar --help
# المدار - فيزياء البرمجيات
# 
# الاستخدام:
#     almadar <أمر>
# 
# الأوامر:
#     validate   التحقق من صحة مخطط المدار
#     compile    تصريف المخطط إلى الهدف
#     format     تنسيق مخطط المدار
#     dev        تشغيل خادم التطوير
#     test       تشغيل اختبارات آلة الحالة
#     new        إنشاء مشروع جديد
#     help       طباعة هذه الرسالة
```

## الاستخدام الأساسي

### التحقق من المخطط

```bash
almadar validate my-app.orb
# ✓ المخطط صالح
# ✓ ٣ مدارات، ٥ سمات، ٨ كيانات
```

### التصريف إلى TypeScript

```bash
almadar compile my-app.orb --shell typescript --output ./generated
# ✓ تم توليد ٢٤ ملف
# ✓ المخرجات: ./generated
```

### تشغيل خادم التطوير

```bash
almadar dev my-app.orb
# جاري تشغيل خادم تطوير المدار...
# ✓ تم تحميل المخطط: my-app.orb
# ✓ الخادم: http://localhost:3000
# ✓ العميل: http://localhost:5173
# 
# جاري مراقبة التغييرات...
```

### تشغيل الاختبارات

```bash
almadar test my-app.orb
# جاري تشغيل اختبارات آلة الحالة...
# ✓ TaskLifecycle: ١٢ انتقال تم اختباره
# ✓ UserAuth: ٨ انتقالات تم اختبارها
# ✓ تم تقييم جميع الحراس
# 
# الاختبارات: ٢٠ نجحت، ٠ فشلت
```

### إنشاء مشروع جديد

```bash
almadar new my-app
# ✓ تم إنشاء my-app/
# ✓ تم إنشاء my-app/schema.orb
# ✓ تم إنشاء my-app/almadar.config.json
# 
# ابدأ الآن:
#   cd my-app
#   almadar dev
```

## الإعدادات

أنشئ ملف `almadar.config.json` في جذر مشروعك:

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
almadar compile
# يستخدم الإعدادات من almadar.config.json
```

## دعم اللغة العربية

المدار يدعم اللغة العربية بشكل كامل لرسائل الخطأ والمخرجات:

```bash
almadar validate schema.orb --locale ar
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
# تحقق من مكان تثبيت almadar
which almadar

# أضف إلى PATH إذا لزم الأمر (أضف إلى ~/.bashrc أو ~/.zshrc)
export PATH="$PATH:/path/to/almadar"
```

### رفض الصلاحيات (Linux/macOS)

```bash
chmod +x /usr/local/bin/almadar
```

---

*تحتاج مساعدة؟ انضم إلى [Discord](https://discord.gg/almadar) أو افتح [مشكلة](https://github.com/almadar-io/almadar/issues).*
