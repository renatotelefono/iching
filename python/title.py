import json
import re
import os

# Percorsi dei file
txt_file = r"C:\Users\HP\Desktop\iching-reader\python\I Ching 1-64.txt"
json_file = r"C:\Users\HP\Desktop\iching-reader\data\hexagrams.it.json"
output_file = os.path.join(os.path.dirname(json_file), "hexagrams_updated.json")

# 1. Leggi i titoli completi dal file .txt
titles = {}
pattern = re.compile(r"^(\d+)\.\s*(.+)$")  # es. "1. Ch’ien - Il Creativo"

with open(txt_file, "r", encoding="utf-8") as f:
    for line in f:
        match = pattern.match(line.strip())
        if match:
            num = int(match.group(1))
            full_title = match.group(0).strip()
            titles[num] = full_title

# 2. Carica il JSON
with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# 3. Aggiorna i titoli
for num, hex_data in data.items():
    num_int = int(num)
    if num_int in titles:
        data[num]["title"] = titles[num_int]

# 4. Salva il nuovo JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Titoli aggiornati! File salvato come: {output_file}")
