# Herbiers marins & aires protégées — Grèce

Site local (Flask + Leaflet) pour explorer les herbiers de posidonie (seagrass)
et les aires protégées autour des îles grecques, île par île.

## 1. Installation (dans VS Code)

Ouvre un terminal dans VS Code (`Terminal > New Terminal`) à la racine du projet :

```bash
python -m venv venv
source venv/bin/activate        # sous Windows : venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Lancer le site

```bash
python app.py
```

Puis ouvre **http://127.0.0.1:5000** dans ton navigateur.

Le site tourne actuellement avec des **données d'exemple** pour l'île de Fournoi
(générées par `generate_sample_data.py`), juste pour que tu puisses voir le
résultat tout de suite.

## 3. Remplacer par tes vraies données QGIS

Pour chaque île, il te faut un dossier `static/data/<nom_ile>/` contenant :

- `source_1.geojson`, `source_2.geojson`, ... : une couche par source de données seagrass
- `consensus.geojson` : ta couche finale fusionnée, avec un champ `nb_sources`
  (nombre entier) indiquant combien de sources sont d'accord sur chaque polygone
- (plus tard) `protected_areas.geojson` : les aires protégées

**Export depuis QGIS :**
1. Clic droit sur la couche → `Exporter` → `Enregistrer les entités sous...`
2. Format : `GeoJSON`
3. SCR (CRS) : choisir **EPSG:4326 - WGS 84** (important, sinon la carte web
   n'affichera rien au bon endroit — tes données sont actuellement en EPSG:2100)
4. Enregistrer sous le nom attendu (`source_1.geojson`, etc.)

Vérifie bien que ta couche `consensus.geojson` a un champ nommé exactement
`nb_sources` dans la table attributaire (renomme-le dans QGIS si besoin,
via la calculatrice de champs, avant l'export).

## 4. Ajouter une nouvelle île

1. Crée le dossier `static/data/<nom_ile>/` avec les mêmes fichiers que ci-dessus
2. (Optionnel) mets ton PDF QGIS dans `static/pdfs/<nom_ile>/`
3. Ajoute une entrée dans `static/data/islands.json` :

```json
{
  "id": "nom_ile",
  "name": "Nom affiché",
  "lat": 00.000,
  "lng": 00.000,
  "zoom": 12,
  "pdf": "/pdfs/nom_ile/nom_fichier.pdf",
  "layers": {
    "seagrass_sources": [
      { "id": "source_1", "label": "Source 1", "color": "#1b9e77" }
    ],
    "consensus": "consensus",
    "protected_areas": null
  }
}
```

Mets `"protected_areas": null` tant que tu n'as pas cette couche pour l'île
en question — le site l'indiquera proprement dans le panneau plutôt que de
planter.

## 5. Structure du projet

```
seagrass-greece/
├── app.py                     # serveur Flask (routes + API)
├── generate_sample_data.py    # génère les données d'exemple (à ignorer une fois tes vraies données en place)
├── requirements.txt
├── templates/
│   └── index.html
└── static/
    ├── css/style.css
    ├── js/map.js
    ├── data/
    │   ├── islands.json       # liste des îles + config des couches
    │   └── fournoi/
    │       ├── source_1.geojson ... source_5.geojson
    │       └── consensus.geojson
    └── pdfs/
        └── fournoi/
            └── (tes PDF QGIS)
```

## Ce qui fonctionne déjà
- Carte de la Grèce avec marqueurs cliquables par île
- Zoom automatique sur l'île sélectionnée
- Panneau latéral avec cases à cocher pour chaque source seagrass
- Couche de consensus avec un curseur "nombre de sources minimum en accord"
- Emplacement prêt pour les aires protégées (dès que tu as la couche)
- Lien vers le PDF QGIS de l'île

## Prochaines étapes possibles
- Ajouter la couche des aires protégées dès qu'elle est prête
- Ajouter d'autres îles (juste dupliquer le pattern Fournoi)
- Ajouter une légende visuelle sur la carte elle-même (pas seulement la sidebar)
- Héberger le site en ligne si besoin (Render, PythonAnywhere...)
