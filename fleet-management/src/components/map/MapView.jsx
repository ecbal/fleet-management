import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./MapView.css";
import { useSelector } from "react-redux";

const FIELD_LABELS = {
  vehicleId: "Vehicle ID",
  activeCouple: "Active Couple",
  coupleInfo: "Couple Info",
  samId: "Sam ID",
  plate: "Plate",
  speed: "Speed",
  lastGpsTime: "Last GPS Time",
  location: "Location",
  odometer: "Odometer",
  event: "Event",
  status: "Status",
  utcTime: "UTC Time",
  contactStatus: "Contact Status",
  gpsStatus: "GPS Status",
};

const busFieldState = {
  vehicleId: false,
  plate: false,
  speed: false,
  status: false,
  event: false,
  lastGpsTime: false,
  utcTime: false,
  location: false,
  odometer: false,
  activeCouple: false,
  coupleInfo: false,
  samId: false,
  contactStatus: false,
  gpsStatus: false,
};

function createPopupHTML(data, busFieldState) {
  const order = [
    "vehicleId","plate","speed","status","event","lastGpsTime","utcTime",
    "location","odometer","activeCouple","coupleInfo","samId",
    "contactStatus","gpsStatus",
  ];

  const rows = order
    .filter((k) => busFieldState?.[k])
    .map((k) => {
      const label = FIELD_LABELS[k] || k;
      const val = data?.[k];
      const display =
        val === null || val === undefined || val === "" ? "null" : String(val);
      return `<div class="bus-pop-row">
        <span class="bus-pop-key">${label}</span>
        <span class="bus-pop-sep"> - </span>
        <span class="bus-pop-val">${display}</span>
      </div>`;
    })
    .join("");

  // ÖNEMLİ: Hiç satır yoksa boş string döndür (popup hiç açılmayacak)
  if (!rows) return "";

  return `<div class="bus-pop">${rows}</div>`;
}


const MapView = forwardRef(({ stops = [], darkMode, isMapFull }, ref) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const vehicleMarkersRef = useRef(new Map()); // id -> Marker
  const popupsRef = useRef(new Map());         // id -> Popup
  const selectedStopMarkerRef = useRef(null);

  // animasyon state’leri
  const animRef = useRef(new Map());     // id -> { rafId, ... }
  const lastTsRef = useRef(new Map());   // id -> son paket ts
  const headingRef = useRef(new Map());  // id -> son heading

  const vehiclePositions = useSelector((s) => s.map.vehiclePositions);
  const selectedVehicleIds = useSelector((s) => s.map.selectedVehicleIds);
  const selectedStopIds = useSelector((s) => s.map.selectedStopIds);
  const selectedRouteDirections = useSelector((s) => s.map.selectedRouteDirections);

  const darkStyle = "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=1PuVnipPQf28E502d4NZ";
  const lightStyle = "https://api.maptiler.com/maps/streets-v2-light/style.json?key=1PuVnipPQf28E502d4NZ";

  // helpers
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpAngleDeg = (a, b, t) => {
    let delta = ((b - a + 540) % 360) - 180; // -180..180 en kısa yol
    return (a + delta * t + 360) % 360;
  };
  const haversineMeters = ([lon1, lat1], [lon2, lat2]) => {
    const R = 6371000;
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  function deriveVehicleInfo(id, p) {
    // Redux paketinden ek alanlar türet
    return {
      vehicleId: id,
      plate: p?.plate,
      speed: p?.speedKph != null ? `${Math.round(p.speedKph)} km/h` : undefined,
      status: p?.status,
      event: p?.event,
      lastGpsTime: p?.lastGpsTime,                 // varsa
      utcTime: p?.utcTime,                         // varsa
      location: p?.addr || (p?.lat && p?.lon ? `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}` : undefined),
      odometer: p?.odometer,
      activeCouple: p?.activeCouple,
      coupleInfo: p?.coupleInfo,
      samId: p?.samId,
      contactStatus: p?.contactStatus,
      gpsStatus: p?.gpsStatus,
    };
  }

  function attachOrUpdatePopup(id, p) {
    const map = mapRef.current;
    if (!map) return;
  
    const marker = vehicleMarkersRef.current.get(id);
    if (!marker) return;
  
    const info = deriveVehicleInfo(id, p);
    const html = createPopupHTML(info, busFieldState);
  
    let popup = popupsRef.current.get(id) || marker.getPopup();
  
    // Popup yoksa oluştur
    if (!popup) {
      popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,   // 🔒 hareketlerde kapanmasın
        offset: 18,
        anchor: "bottom",
      });
      marker.setPopup(popup);
      popupsRef.current.set(id, popup);
    }
  
    // Eğer gösterilecek alan yoksa popup’ı tamamen kaldır
    if (!html) {
      if (popup.isOpen()) popup.remove();
      // marker’dan popup referansı kalsın; tekrar alan açılınca kullanacağız
      return;
    }
  
    // İçeriği güncelle ve AÇIK tut
    popup.setHTML(html);
    if (!popup.isOpen()) popup.addTo(map);
  }
  

  function animateMarker(id, marker, fromLL, toLL, fromHead, toHead, durationMs = 800) {
    // varsa eski animasyonu iptal
    const prev = animRef.current.get(id);
    if (prev?.rafId) cancelAnimationFrame(prev.rafId);

    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const k = easeInOutCubic(t);

      const lon = lerp(fromLL[0], toLL[0], k);
      const lat = lerp(fromLL[1], toLL[1], k);
      // ... animasyon sırasında sadece konumu anim et
      marker.setLngLat([lon, lat]);
      // açı için:
      const head = lerpAngleDeg(fromHead ?? 0, toHead ?? 0, k);
      marker.setRotation(head);    // <-- el.style.transform YOK!

      const popup = popupsRef.current.get(id)||marker.getPopup();
      if (popup) popup.setLngLat([lon, lat]);

      if (t < 1) {
        const rafId = requestAnimationFrame(tick);
        animRef.current.set(id, { rafId });
      }
    };

    const rafId = requestAnimationFrame(tick);
    animRef.current.set(id, { rafId });
  }

  // WS’ten gelen ve redux’ta tutulan position’ları akıcı çiz
  useEffect(() => {
    if (!mapRef.current) return;

    const idsNow = new Set(Object.keys(vehiclePositions)); // sadece redux’taki (seçili) araçlar

    Object.entries(vehiclePositions).forEach(([id, p]) => {
      const toLL = [p.lon, p.lat];

      let marker = vehicleMarkersRef.current.get(id);
      if (!marker) {
        const el = document.createElement("img");
        el.src = "/assets/bus-icon.svg";
        el.alt = "bus";
        el.style.width = "28px";
        el.style.height = "28px";
        el.style.willChange = "transform";

        const marker = new maplibregl.Marker({
          element: el,
          anchor: "center",
          rotationAlignment: "map",   // haritaya göre dönsün
          pitchAlignment: "map",
        })
          .setLngLat(toLL)
          .setRotation(p.heading ?? 0) // <-- BAŞLANGIÇ DÖNÜŞÜ
          .addTo(mapRef.current);

        vehicleMarkersRef.current.set(id, marker);
        attachOrUpdatePopup(id, p);
        return; // ilk konumda animasyon yok
      }

      // anim’li güncelle
      const fromLL = [marker.getLngLat().lng, marker.getLngLat().lat];
      const fromHead = headingRef.current.get(id) ?? 0;
      const toHead = p.heading ?? fromHead;

      const dist = haversineMeters(fromLL, toLL); // metre
      const speedMps = (p.speedKph ?? 30) * (1000 / 3600);
      const estSec = speedMps > 0 ? dist / speedMps : 1;

      const tsPrev = lastTsRef.current.get(id);
      const tsDelta = tsPrev ? Math.max(0.2, Math.min(2.0, (p.ts - tsPrev) / 1000)) : 1;

      // süreyi mesafe + paket aralığına göre harmanla (ms), sonra clamp et
      let dur = 1000 * (0.5 * estSec + 0.5 * tsDelta);
      dur = Math.max(250, Math.min(1400, dur));

      animateMarker(id, marker, fromLL, toLL, fromHead, toHead, dur);


      headingRef.current.set(id, toHead);
      lastTsRef.current.set(id, p.ts ?? performance.now());

      attachOrUpdatePopup(id, p);
    });

    // artık gelmeyen id’leri kaldır + anim iptal
    for (const [id, marker] of vehicleMarkersRef.current.entries()) {
      if (!idsNow.has(id)) {
        const prev = animRef.current.get(id);
        if (prev?.rafId) cancelAnimationFrame(prev.rafId);
        animRef.current.delete(id);
        popupsRef.current.delete(id);
        marker.remove();
        vehicleMarkersRef.current.delete(id);
        headingRef.current.delete(id);
        lastTsRef.current.delete(id);
      }
    }
  }, [vehiclePositions]);

  useEffect(() => {
    for (const [id] of vehicleMarkersRef.current.entries()) {
      const p = vehiclePositions[id];
      attachOrUpdatePopup(id, p);
    }
  }, [busFieldState, vehiclePositions]);

  // harita init
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: darkMode ? darkStyle : lightStyle,
      center: [27.1428, 38.4237],
      zoom: 11,
    });

    mapRef.current = map;

    map.on("load", () => {
      updateVehicles();
      updateStops();
      drawRoutesFromRedux();
      attachOrUpdatePopup();
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // tema değişince stilleri resetle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(darkMode ? darkStyle : lightStyle);

    map.once("styledata", () => {
      updateVehicles();
      updateStops();
      drawRoutesFromRedux();
    });
  }, [darkMode]);

  useEffect(() => {
    updateVehicles();
    updateStops();
  }, [selectedVehicleIds, selectedStopIds, darkMode]);

  useEffect(() => {
    drawRoutesFromRedux();
  }, [selectedRouteDirections, darkMode]);

  const updateVehicles = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // seçili olmayan marker’ları kaldır (ek güvenlik)
    for (const [id, marker] of vehicleMarkersRef.current) {
      if (!selectedVehicleIds.includes(id)) {
        const prev = animRef.current.get(id);
        if (prev?.rafId) cancelAnimationFrame(prev.rafId);
        animRef.current.delete(id);
        marker.remove();
        vehicleMarkersRef.current.delete(id);
        headingRef.current.delete(id);
        lastTsRef.current.delete(id);
        const popup = popupsRef.current.get(id) || marker.getPopup();
        if (popup && popup.isOpen()) popup.remove();
        popupsRef.current.delete(id);
      }
    }

    // ilk defa seçili olup position’ı henüz gelmemiş araçlar için bir şey yapmıyoruz;
    // WS gelince yukarıdaki effect onları oluşturacak.
  };

  const updateStops = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const clusterFeatures = stops
      .filter((s) => selectedStopIds.includes(s.stop_id))
      .map((s) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(s.stop_lon), parseFloat(s.stop_lat)],
        },
        properties: {
          stop_id: s.stop_id,
          stop_name: s.stop_name,
        },
      }));

    const clusterSourceId = "stops-cluster-source";

    if (!map.getSource(clusterSourceId)) {
      map.addSource(clusterSourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: clusterFeatures },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: clusterSourceId,
        filter: ["has", "point_count"],
        paint: { "circle-color": "#85d6ff", "circle-radius": 18 },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: clusterSourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Arial Unicode MS Bold"],
          "text-size": 14,
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: clusterSourceId,
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-color": "#00aaff", "circle-radius": 6 },
      });

      map.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.stop_name;
        const stopId = e.features[0].properties.stop_id;
        new maplibregl.Popup().setLngLat(coordinates).setText(name + "  -  " + stopId || "Durak").addTo(map);
      });

      map.on("mouseenter", "unclustered-point", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "unclustered-point", () => (map.getCanvas().style.cursor = ""));
    } else {
      const source = map.getSource(clusterSourceId);
      source.setData({ type: "FeatureCollection", features: clusterFeatures });
    }
  };

  const draw = (points, id) => {
    const map = mapRef.current;
    if (!map || points.length < 2) return;

    map.addSource(id, {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: points } },
    });

    map.addLayer({
      id,
      type: "line",
      source: id,
      paint: { "line-color": "#0066ff", "line-width": 4 },
    });
  };

  const drawRoutesFromRedux = async () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const existingLayers = map.getStyle().layers?.map((l) => l.id) || [];
    existingLayers.forEach((id) => {
      if (id.startsWith("routeLine")) {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      }
    });

    const routeIds = Object.keys(selectedRouteDirections);
    for (const routeId of routeIds) {
      const directions = selectedRouteDirections[routeId];
      try {
        const res = await fetch(`http://localhost:8080/route-points/${routeId}`);
        const data = await res.json();

        if (directions.gidiş) {
          const gPoints = data
            .filter((p) => p.direction === 0)
            .flatMap((p) => p.points.map((pt) => [parseFloat(pt.longitude), parseFloat(pt.latitude)]));
          draw(gPoints, `routeLine_${routeId}_0`);
        }

        if (directions.dönüş) {
          const dPoints = data
            .filter((p) => p.direction === 1)
            .flatMap((p) => p.points.map((pt) => [parseFloat(pt.longitude), parseFloat(pt.latitude)]));
          draw(dPoints, `routeLine_${routeId}_1`);
        }
      } catch (err) {
        console.error(`Route ${routeId} çizilemedi:`, err);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    flyToVehicle(coords) {
      if (!mapRef.current || !coords || coords.length !== 2) return;

      mapRef.current.flyTo({ center: coords, zoom: 18, speed: 1.5 });

      if (selectedStopMarkerRef.current) selectedStopMarkerRef.current.remove();

      const marker = new maplibregl.Marker({ color: "red" }).setLngLat(coords).addTo(mapRef.current);
      selectedStopMarkerRef.current = marker;
    },
  }));

  return <div ref={mapContainer} className={`map-container ${isMapFull ? "full" : ""}`} />;
});

export default MapView;
