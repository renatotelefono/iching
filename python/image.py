import json
import re
import os

# Percorsi file
txt_file = r"C:\Users\HP\Desktop\iching-reader\python\I Ching 1-64.txt"
json_file = r"C:\Users\HP\Desktop\iching-reader\data\hexagrams.it.json"
output_file = os.path.join(os.path.dirname(json_file), "hexagrams_updated.json")

# 1. Leggi il contenuto del TXT
with open(txt_file, "r", encoding="utf-8") as f:
    content = f.read()

# Ogni esagramma inizia con "n. "
blocks = re.split(r"\n(?=\d+\.\s)", content)

hex_images = {}

for block in blocks:
    lines = block.strip().splitlines()
    if not lines:
        continue

    # Titolo con numero
    title_match = re.match(r"^(\d+)\.\s*(.+)$", lines[0])
    if not title_match:
        continue
    num = int(title_match.group(1))

    # Estrai "L'IMMAGINE" fino a "LE SINGOLE LINEE"
    image_match = re.search(r"L[’']IMMAGINE(.*?)(LE SINGOLE LINEE|$)", block, re.S | re.I)
    if image_match:
        image_text = image_match.group(1).strip()
        # Normalizza spaziature
        image_text = re.sub(r"\n{2,}", "\n\n", image_text)
    else:
        image_text = ""

    hex_images[num] = image_text

# 2. Carica il JSON originale
with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# 3. Aggiorna i campi "image"
for num_str, values in data.items():
    num = int(num_str)
    if num in hex_images and hex_images[num]:
        data[num_str]["image"] = hex_images[num]

# 4. Salva il nuovo JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"File aggiornato con le immagini salvato in: {output_file}")
