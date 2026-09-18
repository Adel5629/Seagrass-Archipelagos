# Seagrass & Protected Areas — Greece

Local website developed with Flask + Leaflet to explore Posidonia seagrass and protected areas around Greek islands, island by island.

The website allows several seagrass data sources to be displayed, as well as a consensus layer showing the number of sources that agree on the presence of seagrass in a given area.

## 1. Installation (in VS Code)

Open a terminal in VS Code (Terminal > New Terminal) at the root of the project:

```bash
python -m venv venv

source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

## 2. Run the website

```bash
python3 app.py
```

Then open http://127.0.0.1:5000 in your browser.

## 3. Islands currently available

Two islands are currently integrated into the website:

- Fourni
- Samos

For each island, the website contains:

- several seagrass data sources;
- a consensus layer combining the different sources;
- a protected areas layer;
- a configuration allowing the map to automatically center on the selected island.

### PDF documents

A PDF presenting the data and/or the work carried out in QGIS can also be associated with each island.

- Fourni: a PDF is currently available.
- Samos: no PDF is currently associated, but one can be added later.

The PDF is optional: its absence does not prevent the map data from being displayed.

## 4. Data organization

For each island, the data are stored in a dedicated folder:

static/data/<island_name>/

The general structure is:

static/data/<island_name>/

├── source_1.geojson
├── source_2.geojson
├── ...
├── consensus.geojson
└── protected_areas.geojson

### Seagrass sources

Each source_X.geojson file corresponds to an independent seagrass data source.

The number of sources can vary from one island to another.

### Consensus layer

The file: consensus.geojson

corresponds to the final layer obtained by combining the different seagrass sources.

This layer must contain a field named exactly: Nb_Src

This field indicates the number of sources that agree on the presence of seagrass in each polygon.

For example, if five sources are used:

Nb_Src = 1  →  1 source agrees
Nb_Src = 2  →  2 sources agree
Nb_Src = 3  →  3 sources agree
Nb_Src = 4  →  4 sources agree
Nb_Src = 5  →  5 sources agree

For Samos, where three sources are currently used, the values can range from 1 to 3.

### Protected areas

The file:

protected_areas.geojson

corresponds to the protected areas located around the island.

This layer is currently available for:

- Fourni
- Samos

## 5. Exporting data from QGIS

The data used by the website must be exported from QGIS in GeoJSON format.

To export a layer:

1. Right-click the layer in QGIS.
2. Select Export > Save Features As...
3. Format: GeoJSON
4. CRS: EPSG:4326 - WGS 84
5. Save the file in the folder corresponding to the island.


## 6. Adding a new island

The website is designed to allow additional islands to be integrated later.

### Step 1 — Create the data folder

Create:

static/data/<island_name>/

and place the island's GeoJSON files inside it.

For example:

static/data/new_island/

├── source_1.geojson
├── source_2.geojson
├── source_3.geojson
├── consensus.geojson
└── protected_areas.geojson

The number of sources can vary depending on the island.

### Step 2 — Optionally add a PDF

If a QGIS document or report should be available on the website, create:

static/pdfs/<island_name>/

and place the PDF inside it.

The PDF is optional.

### Step 3 — Add the island to islands.json

Add a new entry to:

static/data/islands.json

For example:

{
  "id": "island_name",
  "name": "Displayed Name",
  "lat": 00.000,
  "lng": 00.000,
  "zoom": 12,
  "pdf": "/pdfs/island_name/file_name.pdf",
  "layers": {
    "seagrass_sources": [
      {
        "id": "source_1",
        "label": "Source 1",
        "color": "#1b9e77"
      }
    ],
    "consensus": "consensus",
    "protected_areas": "protected_areas"
  }
}

If no PDF is available, the "pdf" field can be set to null.

If a protected areas layer is not yet available for a new island, use:

"protected_areas": null

The website can then handle the absence of this layer without preventing the other data from being displayed.

## 7. Project structure

The current project is organized as follows:

seagrass-greece/

├── app.py
├── generate_sample_data.py
├── requirements.txt
│
├── templates/
│   └── index.html
│
└── static/
    │
    ├── css/
    │   └── style.css
    │
    ├── js/
    │   └── map.js
    │
    ├── data/
    │   ├── islands.json
    │   │
    │   ├── fourni/
    │   │   ├── source_1.geojson
    │   │   ├── source_2.geojson
    │   │   ├── ...
    │   │   ├── consensus.geojson
    │   │   └── protected_areas.geojson
    │   │
    │   └── samos/
    │       ├── source_1.geojson
    │       ├── source_2.geojson
    │       ├── ...
    │       ├── consensus.geojson
    │       └── protected_areas.geojson
    │
    └── pdfs/
        │
        ├── fourni/
        │   └── (QGIS PDF)
        │
        └── samos/
            └── (PDF to be added later if needed)

## 8. Currently available features

The website currently allows users to:

- display a map of Greece;
- select the available islands;
- automatically zoom to the selected island;
- display several seagrass data sources;
- enable or disable individual sources;
- display a consensus layer;
- use a slider to select the minimum number of agreeing sources;
- display protected areas;
- access the QGIS PDF when available;
- manage different data configurations depending on the island.

The islands currently available are:

- Fourni
- Samos

## 9. Possible future developments

The website can be further developed as new data become available.

### Add more islands

New islands can be integrated using the same structure:

static/data/<island_name>/

with their own seagrass sources, consensus layer and protected areas.

### Add coral reefs

Another possible development would be to integrate data concerning coral reefs.

This could potentially be added for Fourni, if the data are available and if this layer is eventually included in the project.

It could then be extended to other islands.

### Other possible improvements

Other features could also be added later, for example:

- add a legend directly to the map;
- improve the presentation of the different layers;
- add other types of habitats or marine data;
- improve the information displayed when clicking on an area;
- add more islands and data sources;
- optimize the GeoJSON files to improve website performance with a large amount of data.

## 10. General project principle

The objective of the project is to progressively build an interactive cartographic database of marine habitats around Greek islands by combining different sources of geographic data.

The structure is intentionally organized island by island, allowing new study areas and new types of data to be progressively added without changing the overall structure of the project.
