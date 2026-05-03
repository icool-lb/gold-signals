# iCool Gold Signals

واجهة Next.js جاهزة للرفع على GitHub و Vercel. تعمل ببيانات مباشرة من Twelve Data للذهب XAU/USD، وتحسب إشارة سكالبينغ من EMA50 + كسر دعم/مقاومة آخر 24 شمعة على فريم 5 دقائق.

## التشغيل المحلي
```bash
npm install
cp .env.local.example .env.local
# ضع مفتاح Twelve Data داخل .env.local
npm run dev
```

## النشر على Vercel
1. ارفع المشروع إلى GitHub.
2. افتح Vercel > New Project > اختر المستودع.
3. في Environment Variables أضف:
   - `TWELVEDATA_API_KEY`
   - `XAU_SYMBOL` = `XAU/USD`
4. Deploy.

## ملاحظات مهمة
- التطبيق لا ينفذ صفقات تلقائيًا على MT5. يعطي إشارات مباشرة وتنبيهات.
- التنفيذ التلقائي يحتاج Expert Advisor على MT5 أو خادم وسيط آمن.
- استخدمه للتدريب والانضباط، ولا ترفع اللوت بدون اختبار.
