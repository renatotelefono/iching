import json

# Percorsi dei file
input_file = r"C:\Users\HP\Desktop\iching-reader\data\hexagrams.it.json"
output_file = r"C:\Users\HP\Desktop\iching-reader\data\hexagrams_senza.it.json"

# Carica il file JSON
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# Funzione ricorsiva per sostituire i \n\n in tutte le stringhe
def clean_text(obj):
    if isinstance(obj, str):
        return obj.replace("\n\n", "\n")
    elif isinstance(obj, dict):
        return {k: clean_text(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_text(v) for v in obj]
    else:
        return obj

# Applica la pulizia
cleaned_data = clean_text(data)

# Scrivi il nuovo file
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(cleaned_data, f, ensure_ascii=False, indent=2)

print("File pulito salvato in:", output_file)
