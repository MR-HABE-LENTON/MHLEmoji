import os
from fontTools.ttLib import TTFont

ttf_path = "SamsungColorEmoji.ttf"
output_dir = "samsung-emojis"

os.makedirs(output_dir, exist_ok=True)

print("⏳ جاري تفكيك واستخراج الصور بناءً على الهيكلية المكتشفة...")

try:
    font = TTFont(ttf_path)
    
    # بناء خريطة الترميز من الجداول المكتشفة
    glyph_to_code = {}
    if 'cmap' in font:
        for table in font['cmap'].tables:
            if table.cmap:
                for code_point, glyph_name in table.cmap.items():
                    glyph_to_code[glyph_name] = code_point

    count = 0
    cbdt = font['CBDT']

    for strike in cbdt.strikeData:
        for glyph_name, image_obj in strike.items():
            if hasattr(image_obj, 'data'):
                data = image_obj.data
                
                # البحث عن البداية الفعالية لترويسة PNG داخل بيانات أندرويد
                png_start = data.find(b'\x89PNG')
                if png_start != -1:
                    png_data = data[png_start:]
                    code_hex = None
                    
                    # 1. المطابقة عبر جدول cmap
                    if glyph_name in glyph_to_code:
                        code_hex = f"{glyph_to_code[glyph_name]:x}"
                    # 2. المطابقة عبر اسم الرمز
                    elif glyph_name.startswith(('u', 'uni')):
                        clean = glyph_name.replace('uni', '').replace('u', '').lower()
                        parts = clean.split('_')
                        if all(all(c in '0123456789abcdef' for c in p) for p in parts):
                            code_hex = '-'.join(parts)

                    if code_hex:
                        file_path = os.path.join(output_dir, f"{code_hex}.png")
                        with open(file_path, "wb") as f:
                            f.write(png_data)
                        count += 1

    print(f"✨ اكتمل الاستخراج بنجاح! تم حفظ {count} صورة إيموجي أصلية داخل مجلد samsung-emojis.")

except Exception as e:
    print(f"❌ حدث خطأ أثناء الاستخراج: {e}")
