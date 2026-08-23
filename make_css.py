import os

repo_owner = "MR-HABE-LENTON"
repo_name = "MHLEmoji"
img_dir = "samsung-emojis"

css_rules = []
for file in os.listdir(img_dir):
    if file.endswith(".png"):
        code = file.replace(".png", "")
        url = f"https://cdn.jsdelivr.net/gh/{repo_owner}/{repo_name}@main/samsung-emojis/{file}"
        css_rules.append(f'img.emoji[src*="{code}"] {{ content: url("{url}") !important; }}')

with open("samsung.css", "w", encoding="utf-8") as f:
    f.write("\n".join(css_rules))

print("✨ تم إنشاء ملف samsung.css بنجاح!")
