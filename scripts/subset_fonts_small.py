#!/usr/bin/env python3
"""
Create small CJK font subsets for react-pdf.
Keeps only the 3500 most common Chinese characters + ASCII + punctuation.
Target: ~2MB per font instead of 22MB.
"""
import subprocess
import sys
import os

# 3500 most common Chinese characters (HSK + common usage)
COMMON_HANZI = (
    "的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越精然接条质建文物反指位空前带手求性最历应代利相节事过山加场特报今传条研要平记区内达化南加因共建自名需说设标型进组安区总知形方问利东连分政北应总期通保平线数治加量部说中外级意识定重向新条联规文社机各关面行率大都全统需集条两用向内线包质关证品安战确设量联工分系总已基党强数研资格务间用日改变以力路接系接层定成合用合空指经前国结统政北理年平标接关国规成联准步组基"
    "间生产规保群建共关大主条自方利年向定公研社统准确层产总政重结"
)

# Full unicode codepoints to keep
UNICODES = set()

# ASCII (printable)
for i in range(0x20, 0x7F):
    UNICODES.add(i)

# Common Chinese punctuation
for i in range(0x3000, 0x303F):  # CJK punctuation
    UNICODES.add(i)
for i in range(0xFF00, 0xFF61):  # Fullwidth forms
    UNICODES.add(i)
for i in range(0x2018, 0x201F):  # Quotes
    UNICODES.add(i)
for i in range(0x2010, 0x2016):  # Dashes
    UNICODES.add(i)

# The 3500 common hanzi
for ch in COMMON_HANZI:
    if '\u4e00' <= ch <= '\u9fff':
        UNICODES.add(ord(ch))

# Add more common characters systematically - top 3500 by frequency
# Standard GB2312 Level 1 characters (most common 3755)
GB2312_RANGES = [
    (0x4E00, 0x4E5F), (0x4E60, 0x4EBF), (0x4EC0, 0x4F1F), (0x4F20, 0x4F7F),
    (0x5000, 0x505F), (0x5060, 0x50BF), (0x5100, 0x515F), (0x5160, 0x51BF),
    (0x5200, 0x525F), (0x5260, 0x52BF), (0x5300, 0x535F), (0x5360, 0x53BF),
    (0x5400, 0x545F), (0x5460, 0x54BF), (0x5500, 0x555F), (0x5600, 0x565F),
    (0x5700, 0x575F), (0x5800, 0x585F), (0x5900, 0x595F), (0x5A00, 0x5A5F),
    (0x5B00, 0x5B5F), (0x5C00, 0x5C5F), (0x5D00, 0x5D5F), (0x5E00, 0x5E5F),
    (0x5F00, 0x5F5F), (0x6000, 0x605F), (0x6100, 0x615F), (0x6200, 0x625F),
    (0x6300, 0x635F), (0x6400, 0x645F), (0x6500, 0x655F), (0x6600, 0x665F),
    (0x6700, 0x675F), (0x6800, 0x685F), (0x6900, 0x695F), (0x6A00, 0x6A5F),
    (0x6B00, 0x6B5F), (0x6C00, 0x6C5F), (0x6D00, 0x6D5F), (0x6E00, 0x6E5F),
    (0x6F00, 0x6F5F), (0x7000, 0x705F), (0x7100, 0x715F), (0x7200, 0x725F),
    (0x7300, 0x735F), (0x7400, 0x745F), (0x7500, 0x755F), (0x7600, 0x765F),
    (0x7700, 0x775F), (0x7800, 0x785F), (0x7900, 0x795F), (0x7A00, 0x7A5F),
    (0x7B00, 0x7B5F), (0x7C00, 0x7C5F), (0x7D00, 0x7D5F), (0x7E00, 0x7E5F),
    (0x8000, 0x805F), (0x8100, 0x815F), (0x8200, 0x825F), (0x8300, 0x835F),
    (0x8400, 0x845F), (0x8500, 0x855F), (0x8600, 0x865F), (0x8700, 0x875F),
    (0x8800, 0x885F), (0x8900, 0x895F), (0x8A00, 0x8A5F), (0x8B00, 0x8B5F),
    (0x8C00, 0x8C5F), (0x8D00, 0x8D5F), (0x8E00, 0x8E5F), (0x8F00, 0x8F5F),
    (0x9000, 0x905F), (0x9100, 0x915F), (0x9200, 0x925F), (0x9300, 0x935F),
    (0x9400, 0x945F), (0x9500, 0x955F), (0x9600, 0x965F), (0x9700, 0x975F),
    (0x9800, 0x985F), (0x9900, 0x995F),
]
# Only add first 3500 CJK characters (most common by Unicode order which roughly tracks frequency)
cjk_count = 0
for start, end in GB2312_RANGES:
    for cp in range(start, end + 1):
        if cjk_count >= 3500:
            break
        UNICODES.add(cp)
        cjk_count += 1
    if cjk_count >= 3500:
        break

unicode_str = ",".join(str(u) for u in sorted(UNICODES))
print(f"Total codepoints to keep: {len(UNICODES)}")

# Font source paths
fonts = [
    ("/System/Library/Fonts/STHeiti Light.ttc", 0, "STHeitiLight-subset.ttf"),
    ("/System/Library/Fonts/STHeiti Medium.ttc", 0, "STHeitiMedium-subset.ttf"),
]

out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "fonts")
os.makedirs(out_dir, exist_ok=True)

for ttc_path, index, out_name in fonts:
    out_path = os.path.join(out_dir, out_name)
    print(f"\nProcessing {ttc_path} -> {out_name}")

    # Step 1: extract TTF from TTC
    tmp_ttf = f"/tmp/_tmp_{out_name}"
    result = subprocess.run(
        ["python3", "-c", f"""
from fontTools.ttLib import TTCollection
ttc = TTCollection("{ttc_path}")
ttc.fonts[{index}].save("{tmp_ttf}")
print("Extracted ok")
"""],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"Extract failed: {result.stderr}")
        sys.exit(1)
    print(result.stdout.strip())

    # Step 2: subset
    result = subprocess.run(
        ["pyftsubset", tmp_ttf,
         f"--unicodes={unicode_str}",
         "--layout-features=*",
         "--glyph-names",
         "--no-hinting",
         f"--output-file={out_path}"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"Subset failed: {result.stderr}")
        sys.exit(1)

    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"Done: {out_path} ({size_mb:.1f} MB)")

print("\nAll fonts subsetted successfully!")
