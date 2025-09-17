import re

def estrai_significati(percorso_file, output_file):
    # Legge il file completo
    with open(percorso_file, "r", encoding="utf-8") as f:
        testo = f.read()

    # Regex:
    # - parte da "sopra significa"
    # - prende tutto fino all'inizio del prossimo esagramma (es. "2. Nome - ...")
    pattern = re.compile(r"(sopra significa.*?)(?=\n\d+\.\s)", re.DOTALL)

    estratti = pattern.findall(testo)

    # Salva tutto in un unico file
    with open(output_file, "w", encoding="utf-8") as out:
        for i, estratto in enumerate(estratti, 1):
            out.write(f"--- Estratto {i} ---\n")
            out.write(estratto.strip() + "\n\n")

if __name__ == "__main__":
    percorso_input = r"C:\Users\HP\Desktop\iching-reader\python\I Ching 1-64.txt"
    percorso_output = r"C:\Users\HP\Desktop\iching-reader\python\riga6.txt"
    estrai_significati(percorso_input, percorso_output)
    print(f"Risultato salvato in {percorso_output}")
