const EMOJI_REGEX = /(\p{Extended_Pictographic})/gu;
let currentStyle = 'samsung';
let currentSize = 120; // نسبة التكبير المباشرة %

function createWindowsEmojiDataUrl(emojiChar) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '52px "Segoe UI Emoji", "Segoe UI Symbol", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emojiChar, 32, 35);
  return canvas.toDataURL();
}

function getEmojiUrl(style, codePoint, actualEmoji) {
  switch (style) {
    case 'samsung':
      return chrome.runtime.getURL(`samsung-emojis/${codePoint}.png`);
    case 'google':
      return `https://cdn.jsdelivr.net/npm/emoji-datasource-google@15.0.1/img/google/64/${codePoint}.png`;
    case 'facebook':
      return `https://cdn.jsdelivr.net/npm/emoji-datasource-facebook@15.0.1/img/facebook/64/${codePoint}.png`;
    case 'twitter':
      return `https://cdn.jsdelivr.net/npm/emoji-datasource-twitter@15.0.1/img/twitter/64/${codePoint}.png`;
    case 'windows':
      return createWindowsEmojiDataUrl(actualEmoji);
    case 'apple':
    default:
      return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/64/${codePoint}.png`;
  }
}

function swapInstagramEmojiSources(rootNode = document) {
  const images = rootNode.querySelectorAll ? rootNode.querySelectorAll('img') : [];

  images.forEach(img => {
    const srcUrl = img.src || '';
    const altText = img.alt || '';

    if (srcUrl.includes('emoji.php') || EMOJI_REGEX.test(altText) || img.dataset.customEmoji) {
      let codePoint = '';
      let actualEmoji = '😀';

      if (altText && EMOJI_REGEX.test(altText)) {
        const match = altText.match(EMOJI_REGEX);
        if (match) actualEmoji = match[0];
        codePoint = [...actualEmoji]
          .map(c => c.codePointAt(0).toString(16))
          .filter(c => c !== 'fe0f')
          .join('-');
      } else {
        const match = srcUrl.match(/\/([0-9a-fA-F_]+)\.png/);
        if (match) {
          codePoint = match[1].toLowerCase().replace(/_/g, '-');
          try {
            actualEmoji = String.fromCodePoint(...codePoint.split('-').map(x => parseInt(x, 16)));
          } catch (e) {}
        }
      }

      if (codePoint) {
        const newSrc = getEmojiUrl(currentStyle, codePoint, actualEmoji);
        
        // تطبيق الحجم والتوضيح المباشر
        const scaleFactor = currentSize / 100;
        img.style.transform = `scale(${scaleFactor})`;
        img.style.transformOrigin = 'center center';
        img.style.verticalAlign = 'middle';

        if (img.src !== newSrc && img.dataset.appliedSrc !== newSrc) {
          img.dataset.appliedSrc = newSrc;
          img.src = newSrc;
          img.dataset.customEmoji = "true";

          img.onerror = function() {
            if (currentStyle !== 'apple') {
              const fallbackUrl = getEmojiUrl('apple', codePoint, actualEmoji);
              this.dataset.appliedSrc = fallbackUrl;
              this.src = fallbackUrl;
            }
          };
        }
      }
    }
  });
}

function loadSettingsAndApply() {
  chrome.storage.local.get(['emojiStyle', 'emojiSize'], (result) => {
    if (result.emojiStyle) currentStyle = result.emojiStyle;
    if (result.emojiSize) currentSize = parseInt(result.emojiSize);
    swapInstagramEmojiSources(document);
  });
}

loadSettingsAndApply();

// الاستماع للتعديلات المباشرة عند الضغط على حفظ
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === 'updateEmojis') {
    loadSettingsAndApply();
  }
});

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        swapInstagramEmojiSources(node.tagName === 'IMG' ? node.parentNode || document : node);
      }
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });