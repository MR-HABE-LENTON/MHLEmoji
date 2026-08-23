const fs = require('fs');
const path = require('path');
const https = require('https');

// رابط قبعة ويندوز الرسمية 🎩
const iconUrl = 'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter@15.0.1/img/twitter/64/1f3a9.png';
const destPath = path.join(__dirname, 'icon.png');

console.log('⏳ جاري جلب أيقونة قبعة ويندوز 🎩...');

https.get(iconUrl, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(destPath);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✨ تم حفظ الأيقونة بنجاح باسم icon.png');
    });
  } else {
    console.error('❌ فشل تنزيل الأيقونة');
  }
});