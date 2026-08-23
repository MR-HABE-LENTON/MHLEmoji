const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'samsung-emojis');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const CONCURRENCY_LIMIT = 40; // تنزيل 40 صورة في نفس اللحظة

async function downloadSingleEmoji(emoji) {
  const codePoint = emoji.unified.toLowerCase();
  const fileName = `${codePoint}.png`;
  const destPath = path.join(outputDir, fileName);

  // إذا كانت الصورة نزلت مسبقاً يتجاوزها فوراً لربح الوقت
  if (fs.existsSync(destPath)) return true;

  const samsungUrl = `https://cdn.jsdelivr.net/gh/iamcal/emoji-data@v14.0.0/img-samsung-64/${fileName}`;
  const fallbackUrl = `https://cdn.jsdelivr.net/npm/emoji-datasource-google@15.0.1/img/google/64/${codePoint}.png`;

  try {
    let imgRes = await fetch(samsungUrl);
    if (!imgRes.ok) imgRes = await fetch(fallbackUrl);

    if (imgRes.ok) {
      const arrayBuffer = await imgRes.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
      return true;
    }
  } catch (err) {}
  return false;
}

async function downloadEmojis() {
  console.log('⚡ جاري تجهيز التنزيل السريع...');
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/emoji.json');
    if (!res.ok) throw new Error('فشل جلب القائمة');
    const emojis = await res.json();

    const total = emojis.length;
    let completed = 0;
    let success = 0;

    console.log(`🚀 بدء التنزيل المتوازي لـ ${total} إيموجي...`);

    // تقسيم العملية إلى مجموعات تنزل معاً بنفس الوقت
    for (let i = 0; i < emojis.length; i += CONCURRENCY_LIMIT) {
      const chunk = emojis.slice(i, i + CONCURRENCY_LIMIT);
      const results = await Promise.all(chunk.map(downloadSingleEmoji));
      
      completed += chunk.length;
      success += results.filter(Boolean).length;
      process.stdout.write(`\r⚡ التقدم: ${completed} / ${total} | المحفوظ: ${success}`);
    }

    console.log('\n✨ اكتمل التنزيل بنجاح وبسرعة قياسية!');
  } catch (err) {
    console.error('\n❌ حدث خطأ:', err.message);
  }
}

downloadEmojis();