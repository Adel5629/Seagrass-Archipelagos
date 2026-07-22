"""
Génère des GeoJSON d'EXEMPLE pour l'île de Fourni (5 sources + consensus).

Ce script sert uniquement à avoir un site qui tourne tout de suite.
Une fois que tu as exporté tes vrais fichiers depuis QGIS en EPSG:4326,
remplace simplement les fichiers dans static/data/fourni/ par les tiens
(même nom de fichier : source_1.geojson ... source_5.geojson, consensus.geojson)
"""

import json
import os
from shapely.geometry import box, mapping
from shapely.ops import unary_union

OUT_DIR = os.path.join(os.path.dirname(__file__), "static", "data", "fourni")
os.makedirs(OUT_DIR, exist_ok=True)

# Centre approximatif de Fourni
CENTER_LAT, CENTER_LNG = 37.573, 26.504

# 5 rectangles se chevauchant partiellement (simulent 5 sources de données)
sources = {
    "source_1": box(CENTER_LNG - 0.05, CENTER_LAT - 0.03, CENTER_LNG + 0.02, CENTER_LAT + 0.02),
    "source_2": box(CENTER_LNG - 0.03, CENTER_LAT - 0.02, CENTER_LNG + 0.04, CENTER_LAT + 0.03),
    "source_3": box(CENTER_LNG - 0.02, CENTER_LAT - 0.04, CENTER_LNG + 0.03, CENTER_LAT + 0.01),
    "source_4": box(CENTER_LNG - 0.04, CENTER_LAT - 0.01, CENTER_LNG + 0.01, CENTER_LAT + 0.04),
    "source_5": box(CENTER_LNG - 0.01, CENTER_LAT - 0.03, CENTER_LNG + 0.05, CENTER_LAT + 0.02),
}


def save_geojson(geom, properties, path):
    feature = {
        "type": "Feature",
        "properties": properties,
        "geometry": mapping(geom),
    }
    fc = {"type": "FeatureCollection", "features": [feature]}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(fc, f, ensure_ascii=False)


# Écrit chaque source individuellement
for name, geom in sources.items():
    save_geojson(geom, {"source": name}, os.path.join(OUT_DIR, f"{name}.geojson"))

# --- Construit une couche "consensus" façon QGIS union successive ---
# On découpe l'espace en zones et on compte combien de sources couvrent chaque zone.
from shapely.geometry import shape
from itertools import combinations

geoms = list(sources.values())
all_pieces = []

# Union de toutes les géométries, puis on subdivise par overlay pour compter le recouvrement
base = unary_union(geoms)

# Approche simple : pour chaque combinaison de sources, on calcule l'intersection
# et on soustrait ce qui est déjà compté à un niveau supérieur (approximation suffisante pour demo)
features = []
for n in range(len(geoms), 0, -1):
    for combo in combinations(range(len(geoms)), n):
        inter = geoms[combo[0]]
        for idx in combo[1:]:
            inter = inter.intersection(geoms[idx])
        if inter.is_empty:
            continue
        # retire les zones déjà attribuées à un recouvrement plus élevé
        for f in features:
            inter = inter.difference(shape(f["geometry"]))
        if not inter.is_empty and inter.area > 0:
            features.append({
                "type": "Feature",
                "properties": {"Nb_Src": n},
                "geometry": mapping(inter),
            })

consensus_fc = {"type": "FeatureCollection", "features": features}
with open(os.path.join(OUT_DIR, "seagrass_fourni_compare_sources.geojson"), "w", encoding="utf-8") as f:
    json.dump(consensus_fc, f, ensure_ascii=False)

print(f"Données d'exemple générées dans : {OUT_DIR}")
