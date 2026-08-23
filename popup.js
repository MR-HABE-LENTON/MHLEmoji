document.addEventListener('DOMContentLoaded', () => {
  const styleSelect = document.getElementById('styleSelect');
  const sizeRange = document.getElementById('sizeRange');
  const sizeVal = document.getElementById('sizeVal');
  const resetSizeBtn = document.getElementById('resetSizeBtn');
  const themeSwitch = document.getElementById('themeSwitch');
  const saveBtn = document.getElementById('saveBtn');
  const swatches = document.querySelectorAll('.swatch');

  // تحميل الإعدادات المحفوظة
  chrome.storage.local.get(['emojiStyle', 'emojiSize', 'neonColor', 'themeMode'], (res) => {
    if (res.emojiStyle) styleSelect.value = res.emojiStyle;
    if (res.emojiSize) {
      sizeRange.value = res.emojiSize;
      sizeVal.textContent = `${res.emojiSize}%`;
    }
    if (res.neonColor) setNeonColor(res.neonColor);
    if (res.themeMode) {
      themeSwitch.checked = res.themeMode === 'dark';
      document.body.setAttribute('data-theme', res.themeMode);
    }
  });

  // تحديث نص الحجم المباشر
  sizeRange.addEventListener('input', (e) => {
    sizeVal.textContent = `${e.target.value}%`;
  });

  // زر الإرجاع للحجم الطبيعي (100%)
  resetSizeBtn.addEventListener('click', () => {
    sizeRange.value = 100;
    sizeVal.textContent = '100%';
  });

  // تغيير ألوان النيون
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      setNeonColor(btn.dataset.color);
    });
  });

  function setNeonColor(color) {
    document.documentElement.style.setProperty('--neon', color);
    document.documentElement.style.setProperty('--neon-glow', `${color}66`);
    swatches.forEach(b => b.classList.toggle('active', b.dataset.color === color));
  }

  // تبديل الثيم الداكن/الفاتح
  themeSwitch.addEventListener('change', (e) => {
    const mode = e.target.checked ? 'dark' : 'light';
    document.body.setAttribute('data-theme', mode);
  });

  // حفظ وإعادة تحميل صفحة إنستغرام النشطة تلقائياً
  saveBtn.addEventListener('click', () => {
    const activeSwatch = document.querySelector('.swatch.active');
    const settings = {
      emojiStyle: styleSelect.value,
      emojiSize: sizeRange.value,
      neonColor: activeSwatch ? activeSwatch.dataset.color : '#ff0055',
      themeMode: themeSwitch.checked ? 'dark' : 'light'
    };

    chrome.storage.local.set(settings, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('instagram.com')) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
      window.close();
    });
  });
});