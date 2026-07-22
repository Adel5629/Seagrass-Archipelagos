"""
Site web - Cartographie interactive des herbiers de posidonie (seagrass)
et des aires protégées autour des îles grecques.

Lancer avec : python app.py
Puis ouvrir : http://127.0.0.1:5000
"""

from flask import Flask, jsonify, render_template, abort, send_from_directory
import json
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "static", "data")
PDF_DIR = os.path.join(BASE_DIR, "static", "pdfs")


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------------
# API : liste des îles disponibles (métadonnées : coordonnées, couches, etc.)
# ---------------------------------------------------------------------------

@app.route("/api/islands")
def get_islands():
    islands_path = os.path.join(DATA_DIR, "islands.json")
    with open(islands_path, encoding="utf-8") as f:
        islands = json.load(f)
    return jsonify(islands)


# ---------------------------------------------------------------------------
# API : renvoie une couche GeoJSON précise pour une île donnée
# Exemple : /api/layer/fourni/source_1
# ---------------------------------------------------------------------------

@app.route("/api/layer/<island>/<layer_name>")
def get_layer(island, layer_name):
    # sécurité simple : on empêche de sortir du dossier data
    safe_island = "".join(c for c in island if c.isalnum() or c in ("-", "_"))
    safe_layer = "".join(c for c in layer_name if c.isalnum() or c in ("-", "_"))

    file_path = os.path.join(DATA_DIR, safe_island, f"{safe_layer}.geojson")

    if not os.path.isfile(file_path):
        abort(404, description=f"Layer not found : {island}/{layer_name}")

    with open(file_path, encoding="utf-8") as f:
        geojson = json.load(f)
    return jsonify(geojson)


# ---------------------------------------------------------------------------
# Servir les PDF QGIS
# ---------------------------------------------------------------------------

@app.route("/pdfs/<island>/<filename>")
def get_pdf(island, filename):
    folder = os.path.join(PDF_DIR, island)
    return send_from_directory(folder, filename)


if __name__ == "__main__":
    app.run(debug=True)
