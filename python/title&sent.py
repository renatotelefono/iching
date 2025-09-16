import json
import re
import os

# Percorsi dei file
txt_file = r"C:\Users\HP\Desktop\iching-reader\python\I Ching 1-64.txt"
json_file = r"C:\Users\HP\Desktop\iching-reader\data\hexagrams.it.json"
output_file = os.path.join(os.path.dirname(json_file), "hexagrams_updated.json")

# 1. Estrazione titoli e "LA SENTENZA" dal file TXT
hex_texts = {}
with open(txt_file, "r", encoding="utf-8") as f:
    content = f.read()

# Ogni esagramma comincia con "n. ..."
blocks = re.split(r"\n(?=\d+\.\s)", content)

for block in blocks:
    lines = block.strip().splitlines()
    if not lines:
        continue

    # Titolo completo
    title_match = re.match(r"^(\d+)\.\s*(.+)$", lines[0])
    if not title_match:
        continue
    num = int(title_match.group(1))
    full_title = title_match.group(0).strip()

    # Estrazione "LA SENTENZA"
    sentenza_match = re.search(r"LA SENTENZA(.*?)L[’']IMMAGINE", block, re.S | re.I)
    if sentenza_match:
        judgment_text = sentenza_match.group(1).strip()
        # Normalizziamo spazi e andate a capo
        judgment_text = re.sub(r"\n{2,}", "\n\n", judgment_text)
    else:
        judgment_text = ""

    hex_texts[num] = {
        "title": full_title,
        "judgment": judgment_text
    }

# 2. Carica il JSON originale
with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# 3. Aggiorna i dati del JSON
for num_str, values in data.items():
    num = int(num_str)
    if num in hex_texts:
        data[num_str]["title"] = hex_texts[num]["title"]
        if hex_texts[num]["judgment"]:
            data[num_str]["judgment"] = hex_texts[num]["judgment"]

# 4. Salva il nuovo JSON aggiornato
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"File aggiornato salvato in: {output_file}")
