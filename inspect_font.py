from fontTools.ttLib import TTFont

font = TTFont("SamsungColorEmoji.ttf")

print("=== 1. عينة من جدول الترميز cmap ===")
for i, table in enumerate(font['cmap'].tables):
    print(f"جدول {i} (منصة: {table.platformID}, ترميز: {table.platEncID}): عدد العناصر = {len(table.cmap)}")
    sample = list(table.cmap.items())[:3]
    print(f"   عينة (كود اليونيكود : اسم الرمز): {sample}")

print("\n=== 2. عينة من جدول الصور CBDT ===")
cbdt = font['CBDT']
print(f"عدد أحجام الصور المتاحة: {len(cbdt.strikeData)}")
for idx, strike in enumerate(cbdt.strikeData):
    glyph_names = list(strike.keys())
    print(f"الحجم {idx}: عدد الصور = {len(glyph_names)} | أول 5 أسماء رموز: {glyph_names[:5]}")
    first_glyph = glyph_names[0]
    img_obj = strike[first_glyph]
    if hasattr(img_obj, 'data'):
        print(f"   بداية بيانات أول صورة: {img_obj.data[:10]}")
