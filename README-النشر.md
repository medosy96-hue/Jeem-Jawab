# 🚀 نشر «ج جواب» أونلاين: Vercel + Neon

بعد تنفيذ هذا الدليل تحصل على رابط دائم مثل:

`https://jeem-jawab.vercel.app`

ويمكن للمضيف واللاعبين فتحه من أجهزة وشبكات مختلفة، واستخدام QR أو رمز اللعبة.

---

## الخدمات المطلوبة

| الخدمة | الوظيفة | الرابط |
|---|---|---|
| GitHub | حفظ كود المشروع | https://github.com |
| Neon | قاعدة PostgreSQL أونلاين | https://neon.tech |
| Vercel | تشغيل موقع Next.js | https://vercel.com |

يمكن البدء بالخطط المجانية.

---

## 1. إنشاء قاعدة Neon

1. افتح https://neon.tech وسجّل الدخول.
2. اختر **New Project**.
3. اكتب اسماً مثل `jeem-jawab-db` واختر منطقة قريبة.
4. انسخ **Connection string** الكامل الذي يبدأ بـ:

```text
postgresql://...
```

يفضّل نسخ رابط **Pooled connection**، ويجب أن يحتوي عادة على `sslmode=require`.

لا ترسل هذا الرابط لأحد ولا ترفعه إلى GitHub.

---

## 2. تجهيز قاعدة Neon بالجداول والأسئلة

نزّل/صدّر ملفات المشروع إلى جهازك، وافتح Terminal داخل مجلد المشروع.

### تثبيت الحزم

```bash
npm install
```

### إنشاء ملف البيئة المحلي

انسخ `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

افتح `.env` واستبدل `DATABASE_URL` برابط Neon الحقيقي:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

### إنشاء الجداول

```bash
npx drizzle-kit push
```

### تعبئة بنك الأسئلة

```bash
npx tsx src/db/seed-run.ts
```

يجب أن تظهر رسالة تؤكد إضافة البنك. البنك الكامل يحتوي حالياً على **2054 سؤالاً فريداً**.

للتحقق:

```bash
npx tsx src/db/seed-run.ts
```

عند تشغيله مرة ثانية لن يكرر الأسئلة، بل سيخبرك أن البنك مكتمل.

---

## 3. رفع المشروع إلى GitHub

أنشئ مستودعاً جديداً في GitHub باسم `jeem-jawab`، ثم نفّذ داخل المشروع:

```bash
git init
git add .
git commit -m "نشر ج جواب"
git branch -M main
git remote add origin https://github.com/USERNAME/jeem-jawab.git
git push -u origin main
```

استبدل `USERNAME` باسم حسابك.

ملف `.env` مستثنى تلقائياً بواسطة `.gitignore` ولن يُرفع.

---

## 4. نشر المشروع على Vercel

1. افتح https://vercel.com وسجّل الدخول باستخدام GitHub.
2. اختر **Add New → Project**.
3. اختر مستودع `jeem-jawab`.
4. قبل الضغط على Deploy، افتح **Environment Variables**.
5. أضف:

| الاسم | القيمة |
|---|---|
| `DATABASE_URL` | رابط Neon الكامل |

6. اجعل المتغير متاحاً لـ Production وPreview وDevelopment.
7. اضغط **Deploy**.

بعد انتهاء النشر ستحصل على رابط مثل:

```text
https://jeem-jawab-abc.vercel.app
```

---

## 5. تثبيت رابط المشاركة وQR

بعد معرفة رابط Vercel:

1. افتح مشروعك في Vercel.
2. اذهب إلى **Settings → Environment Variables**.
3. أضف:

```text
PUBLIC_APP_URL=https://jeem-jawab-abc.vercel.app
```

4. من تبويب **Deployments** افتح آخر نشر واختر **Redeploy**.

بعدها رابط المشاركة وQR سيستخدمان رابط Vercel الحقيقي.

---

## 6. اختبار الأونلاين

1. افتح رابط Vercel على هاتف المضيف.
2. أنشئ لعبة أونلاين.
3. افتح الرابط على هاتف آخر باستخدام بيانات الهاتف أو شبكة مختلفة.
4. أدخل رمز اللعبة، أو استخدم رابط المشاركة/QR.
5. سجّل اسم اللاعب وابدأ الجولة.
6. تأكد من أن `/api/health` يعيد:

```json
{"ok":true}
```

مثال:

```text
https://رابطك.vercel.app/api/health
```

---

## كيف تعدّل الموقع بعد النشر؟

عدّل الملفات على جهازك ثم نفّذ:

```bash
git add .
git commit -m "وصف التعديل"
git push origin main
```

Vercel يكتشف التعديل ويعيد النشر تلقائياً.

### إذا عدّلت التصميم أو المنطق فقط

يكفي `git push`، ولا تحتاج لمس قاعدة البيانات.

### إذا عدّلت `src/db/schema.ts`

شغّل أولاً على جهازك مع رابط Neon الموجود في `.env`:

```bash
npx drizzle-kit push
```

ثم ارفع الكود إلى GitHub.

### إذا أضفت حزمة أسئلة جديدة داخل الكود

شغّل:

```bash
npx tsx src/db/seed-run.ts
```

السكربت يضيف الأسئلة الجديدة فقط ولا يكرر الموجود.

### إضافة سؤال بلا كود

افتح:

```text
https://رابطك.vercel.app/admin
```

وأضف السؤال من لوحة الإدارة. النظام يرفض السؤال المكرر تلقائياً.

> ملاحظة أمنية: لوحة `/admin` حالياً لا تحتوي تسجيل دخول. قبل نشر الرابط على نطاق واسع، يفضّل إضافة كلمة مرور للإدارة.

---

## إضافة نطاق خاص

من Vercel افتح:

**Settings → Domains**

ثم أضف نطاقاً مثل:

```text
jeemjawab.com
```

بعد ربطه، غيّر `PUBLIC_APP_URL` إلى النطاق الجديد وأعد النشر.

---

## ملاحظات تشغيلية

- الموقع يستخدم تحديثاً دورياً سريعاً لمزامنة اللعب بين الأجهزة، وهو مناسب للألعاب الصغيرة حتى 20 لاعباً.
- Vercel وNeon المجانيان مناسبان للتجربة والبداية، لكن الاستخدام الكبير قد يحتاج خطة مدفوعة.
- لا تضع `DATABASE_URL` داخل أي ملف يُرفع إلى GitHub.
- قاعدة Neon مستقلة عن نشر Vercel؛ إعادة نشر الموقع لا تحذف الأسئلة أو الألعاب.
