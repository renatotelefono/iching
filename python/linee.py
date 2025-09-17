import json
import re

# Percorsi file
txt_path = r"C:\Users\HP\Desktop\iching-reader\python\I Ching 1-64.txt"
json_path = r"C:\Users\HP\Desktop\iching-reader\data\hexagrams.it.json"
output_path = r"C:\Users\HP\Desktop\iching-reader\data\hexagrams_updated.it.json"

# --- PARTE 1: estrazione paragrafi per linea 6 ---
with open(txt_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

paragraphs_line6 = []
start_idx = None

for i, line in enumerate(lines):
    if "sopra significa" in line:
        start_idx = i + 1
        # cerca la prossima riga che inizia con "numero."
        for j in range(start_idx, len(lines)):
            if re.match(r"^\d+\.\s", lines[j].strip()):
                end_idx = j
                paragraph = "".join(lines[start_idx:end_idx]).strip()
                paragraphs_line6.append(paragraph)
                start_idx = None
                break

# se l'ultimo esagramma arriva fino alla fine del file
if start_idx is not None:
    paragraph = "".join(lines[start_idx:]).strip()
    paragraphs_line6.append(paragraph)

print(f"📖 Estratti {len(paragraphs_line6)} paragrafi per la linea 6.")

# --- PARTE 2: carica il JSON ---
with open(json_path, "r", encoding="utf-8") as f:
    hexagrams = json.load(f)

# --- PARTE 3: aggiorna il campo lines["6"] ---
if isinstance(hexagrams, dict):
    hex_keys = sorted(hexagrams.keys(), key=lambda x: int(x))

    if len(hex_keys) != len(paragraphs_line6):
        print("⚠️ ATTENZIONE: numero esagrammi e paragrafi non corrisponde!")
        print(f"Esagrammi JSON: {len(hex_keys)}, Estratti: {len(paragraphs_line6)}")

    for idx, key in enumerate(hex_keys):
        if idx < len(paragraphs_line6):
            hexagrams[key]["lines"]["6"] = paragraphs_line6[idx]
            print(f"🔄 Esagramma {key}: aggiornata la linea 6.")
else:
    print("⚠️ Struttura JSON inattesa (non è un dict con chiavi '1'..'64').")

# --- PARTE 4: salva nuovo file ---
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(hexagrams, f, ensure_ascii=False, indent=2)

print(f"\n✅ Aggiornamento completato. File creato: {output_path}")
