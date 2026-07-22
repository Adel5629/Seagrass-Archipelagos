const map = L.map("map", { zoomControl: true }).setView([38.5, 24.0], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const activeLayers = {
  sources: {},
  consensus: null,
  protected: null,
};

let currentIsland = null;

fetch("/api/islands")
  .then((r) => r.json())
  .then((islands) => {
    islands.forEach((island) => {
      const marker = L.marker([island.lat, island.lng]).addTo(map);
      marker.bindTooltip(island.name, { permanent: false, direction: "top" });
      marker.on("click", () => selectIsland(island));
    });
  })
  .catch((err) => console.error("Erreur de chargement des îles :", err));

function selectIsland(island) {
  currentIsland = island;
  clearAllLayers();

  map.flyTo([island.lat, island.lng], island.zoom, { duration: 0.8 });

  document.getElementById("island-name").textContent = island.name;
  document.getElementById("sidebar").classList.remove("sidebar--collapsed");

  buildSourcesList(island);
  resetConsensusControls();
  buildProtectedAreasStatus(island);
  buildPdfLink(island);
}

function buildSourcesList(island) {
  const container = document.getElementById("sources-list");
  container.innerHTML = "";

  const sources = island.layers.seagrass_sources || [];
  sources.forEach((src) => {
    const row = document.createElement("label");
    row.className = "checkbox-row";
    row.innerHTML = `
      <input type="checkbox" data-source-id="${src.id}" />
      <span class="color-swatch" style="background:${src.color}"></span>
      <span>${src.label}</span>
    `;
    const checkbox = row.querySelector("input");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        loadSourceLayer(island, src);
      } else {
        removeSourceLayer(src.id);
      }
    });
    container.appendChild(row);
  });
}

function loadSourceLayer(island, src) {
  fetch(`/api/layer/${island.id}/${src.id}`)
    .then((r) => {
      if (!r.ok) throw new Error(`Couche ${src.id} introuvable`);
      return r.json();
    })
    .then((geojson) => {
      const layer = L.geoJSON(geojson, {
        style: {
          color: src.color,
          weight: 1.5,
          fillColor: src.color,
          fillOpacity: 0.35,
        },
      }).addTo(map);
      layer.bindPopup(`<strong>${src.label}</strong>`);
      activeLayers.sources[src.id] = layer;
    })
    .catch((err) => console.error(err));
}

function removeSourceLayer(sourceId) {
  const layer = activeLayers.sources[sourceId];
  if (layer) {
    map.removeLayer(layer);
    delete activeLayers.sources[sourceId];
  }
}

function resetConsensusControls() {
  const toggle = document.getElementById("toggle-consensus");
  const controls = document.getElementById("consensus-controls");
  const slider = document.getElementById("consensus-slider");
  const valueLabel = document.getElementById("consensus-value");

  toggle.checked = false;
  controls.classList.add("hidden");
  slider.value = 1;
  valueLabel.textContent = "1";

  toggle.onchange = () => {
    if (toggle.checked) {
      controls.classList.remove("hidden");
      loadConsensusLayer(currentIsland, parseInt(slider.value, 10));
    } else {
      controls.classList.add("hidden");
      removeConsensusLayer();
    }
  };

  slider.oninput = () => {
    valueLabel.textContent = slider.value;
    if (toggle.checked) {
      loadConsensusLayer(currentIsland, parseInt(slider.value, 10));
    }
  };
}

function loadConsensusLayer(island, minSources) {
  if (!island || !island.layers.consensus) return;

  const field = island.layers.consensus_field || "nb_sources";

  fetch(`/api/layer/${island.id}/${island.layers.consensus}`)
    .then((r) => {
      if (!r.ok) throw new Error("Couche de consensus introuvable");
      return r.json();
    })
    .then((geojson) => {
      removeConsensusLayer();

      const filtered = {
        type: "FeatureCollection",
        features: geojson.features.filter(
          (f) => Number(f.properties[field] || 0) >= minSources
        ),
      };

      if (filtered.features.length === 0) {
        console.warn(`Aucune entité avec le champ "${field}" >= ${minSources}`);
      }

      activeLayers.consensus = L.geoJSON(filtered, {
        style: (feature) => ({
          color: "#0b2d3c",
          weight: 1,
          fillColor: consensusColor(Number(feature.properties[field])),
          fillOpacity: 0.55,
        }),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`${feature.properties[field]} source(s) d'accord`);
        },
      }).addTo(map);
    })
    .catch((err) => console.error(err));
}

function removeConsensusLayer() {
  if (activeLayers.consensus) {
    map.removeLayer(activeLayers.consensus);
    activeLayers.consensus = null;
  }
}

function consensusColor(n) {
  const palette = {
    1: "#ffe08a",
    2: "#ffb04d",
    3: "#f77f3c",
    4: "#e0522f",
    5: "#b0242a",
  };
  return palette[n] || "#999999";
}

function buildProtectedAreasStatus(island) {
  const status = document.getElementById("protected-status");
  const label = island.layers.protected_areas_label || "Aires protégées";

  if (island.layers.protected_areas) {
    status.innerHTML = `
      <span class="checkbox-row">
        <span class="color-swatch" style="background:#3f7a5c"></span>
        <span>${label}</span>
      </span>
    `;
    loadProtectedAreas(island);
  } else {
    status.textContent = "Aucune donnée disponible pour cette île pour le moment.";
  }
}

function loadProtectedAreas(island) {
  fetch(`/api/layer/${island.id}/${island.layers.protected_areas}`)
    .then((r) => {
      if (!r.ok) throw new Error("Couche des aires protégées introuvable");
      return r.json();
    })
    .then((geojson) => {
      const label = island.layers.protected_areas_label || "Aire protégée";
      const layer = L.geoJSON(geojson, {
        style: { color: "#3f7a5c", weight: 2, fillOpacity: 0.15, dashArray: "4 3" },
      }).addTo(map);
      layer.bindPopup(label);
      activeLayers.protected = layer;
    })
    .catch((err) => console.error(err));
}

function buildPdfLink(island) {
  const container = document.getElementById("pdf-list");
  container.innerHTML = "";

  const pdfs = island.pdfs || [];
  if (pdfs.length === 0) {
    container.innerHTML = '<p class="muted">Aucun PDF disponible.</p>';
    return;
  }

  pdfs.forEach((pdf) => {
    const link = document.createElement("a");
    link.className = "pdf-link";
    link.href = `/pdfs/${island.id}/${pdf.file}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = pdf.label + " →";
    container.appendChild(link);
  });
}

function clearAllLayers() {
  Object.keys(activeLayers.sources).forEach(removeSourceLayer);
  removeConsensusLayer();
  if (activeLayers.protected) {
    map.removeLayer(activeLayers.protected);
    activeLayers.protected = null;
  }
}

document.getElementById("close-sidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.add("sidebar--collapsed");
});