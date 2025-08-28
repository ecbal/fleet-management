import React, { useMemo, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faClockRotateLeft, faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faArrowsLeftRight } from "@fortawesome/free-solid-svg-icons";
import './VehiclesSidebar.css'
import {
  toggleVehicleId,
  setAllVehicleIds,
  clearAllVehicleIds
} from "../../../store/selectionSlice";
import { useSelector, useDispatch } from "react-redux";
import { useDebounce } from 'use-debounce';



// 1) Kolon başlık metinleri (ekranda görünecek isimler)
const COL_LABELS = {
  id: "ID",
  plate: "Plaka",
  edge_code: "Edge Kodu",
  line: "Hat",
  name: "Araç Adı",
  status: "Durum",
  trip_no: "Sefer No",
  company: "Firma",
  path_code: "Rota Kodu",
  driver_name: "Şoför",
  speed_kph: "Hız (km/s)",
  last_gps_time: "Son GPS Zamanı",
  lat: "Enlem",
  lon: "Boylam",
};

// 2) Kolon sırası (görünür olanlar bu sırada çizilir)
const COL_ORDER = [
  "id",
  "plate",
  "line",
  "name",
  "status",
  "trip_no",
  "company",
  "driver_name",
  "speed_kph",
  "last_gps_time",
  "lat",
  "lon",
];

const DEFAULT_COL_VIS = {
  id: true,
  plate: true,
  line: true,
  name: true,
  status: true,
  trip_no: true,
  company: true,
  driver_name: true,
  speed_kph: true,
  last_gps_time: true,
  lat: true,
  lon: true,
};

// 4) Basit biçimlendirme yardımcıları (opsiyonel)
const fmtSpeed = (v) => (typeof v === "number" ? v.toFixed(1) : v);
const fmtTime = (iso) => {
  // ISO geliyorsa sadece kısa tarih-saat gösterelim
  try {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString(); // TR yerel ayarına göre
  } catch {
    return iso;
  }
};

const VehiclesSidebar = ({ onCloseBtn, historyBarOpen, setHistoryBarOpen }) => {
  const [vehiclesMinimized, setVehiclesMinimized] = useState(false);
  const [vehiclesExpanded, setVehiclesExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlight = useRef({ abort: () => { } });
  const [hasMore, setHasMore] = useState(false);
  const selectedVehicleIds = useSelector(state => state.selection.selectedVehicleIds || []);
  const dispatch = useDispatch();
  const [openSettings, setOpenSettings] = useState(false);


  // localStorage’dan yükle, yoksa default
  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const raw = localStorage.getItem("veh_col_vis");
      return raw ? JSON.parse(raw) : DEFAULT_COL_VIS;
    } catch {
      return DEFAULT_COL_VIS;
    }
  });


  const totalPages = useMemo(() => {
    if (Number.isFinite(total) && total > 0) {
      return Math.max(1, Math.ceil(total / pageSize));
    }
    return hasMore ? page + 1 : page;
  }, [total, pageSize, hasMore, page]);


  const [filters, setFilters] = useState(() => {
    const init = {};
    COL_ORDER.forEach((k) => {
      if (columnVisibility[k]) {
        init[k] = "";
      }
    });
    return init;
  });

  const [debouncedFilters] = useDebounce(filters, 300);

  useEffect(() => {
    const qs = buildQueryString(debouncedFilters, page, pageSize);
    fetchVehicles(qs);
  }, [debouncedFilters, page, pageSize]);

  const buildQueryString = (filters, page = 1, pageSize = 30) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    Object.entries(filters).forEach(([k, v]) => {
      const val = (v ?? "").toString().trim().toLowerCase();
      if (val !== "") params.set(k, val);
    });
    return params.toString();
  };

  const onFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    console.log(filters);
  };
  const visibleKeys = useMemo(
    () => COL_ORDER.filter((k) => columnVisibility[k]),
    [columnVisibility]
  );

  useEffect(() => {
    try {
      localStorage.setItem("veh_col_vis", JSON.stringify(columnVisibility));
    } catch { }
  }, [columnVisibility]);

  const fetchVehicles = async (qs) => {
    try { inFlight.current.abort?.(); } catch { }
    const controller = new AbortController();
    inFlight.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/vehicles?${qs}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const list = Array.isArray(json.vehicles) ? json.vehicles : [];
      setRows(list);
      console.log(rows);
      setTotal(Number(json.total ?? list.length));
      setPage(Number(json.page ?? 1));
      setPageSize(Number(json.pageSize ?? 30));
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError(err?.message || "Veri alınamadı");
        setRows([]);
        setTotal(0);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };


  const renderCell = (v, key) => {
    const val = v?.[key];

    if (key === "speed_kph") return fmtSpeed(val);
    if (key === "last_gps_time") return fmtTime(val);
    if (key === "lat" || key === "lon") {
      return typeof val === "number" ? val.toFixed(6) : val;
    }
    return val ?? "";
  };


  const handleSelectAllVehicles = async (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const res = await fetch("http://localhost:8080/vehicles/ids");
      const data = await res.json();
      dispatch(setAllVehicleIds(data.vehicleIds));
    } else {
      dispatch(clearAllVehicleIds());
    }
  };

  const handleVehicleCheckbox = (id) => {
    dispatch(toggleVehicleId(id));
  };


  return (
    <div className={`vehicles-sidebar-container ${vehiclesMinimized ? "minimized" : ""} ${vehiclesExpanded ? "expanded" : ""}`}>
      <div className="vehicles-header">
        <h2>Vehicles</h2>
        <div className="top-buttons">
          <FontAwesomeIcon
            icon={faGear}
            size='lg'
            className='vehicle-settings-btn'
            onClick={() => setOpenSettings((s)=>!s)}
          />
          
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            size='lg'
            className='history-btn'
            onClick={() => setHistoryBarOpen(!historyBarOpen)}
          />
          {vehiclesMinimized ? (
            <FontAwesomeIcon
              icon={faUpRightAndDownLeftFromCenter}
              size="lg"
              className="minimize-btn"
              onClick={() => setVehiclesMinimized(false)}
            />
          ) : (
            <FontAwesomeIcon
              icon={faDownLeftAndUpRightToCenter}
              size="lg"
              className="minimize-btn"
              onClick={() => setVehiclesMinimized(true)}
            />
          )}
          <FontAwesomeIcon
            icon={faArrowsLeftRight}
            size="lg"
            className="expand-btn"
            onClick={() => setVehiclesExpanded(!vehiclesExpanded)}
          />
          <FontAwesomeIcon
            icon={faXmark}
            size="lg"
            className="close-btn"
            onClick={() => onCloseBtn("home")}
          />
        </div>
      </div>

      <div className="vehicles-table-div">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAllVehicles}
                  checked={rows.length > 0 && selectedVehicleIds.length === rows.length}
                />
              </th>
              {visibleKeys.map((key) => (
                <th key={key}>{COL_LABELS[key] ?? key}</th>
              ))}
            </tr>
            <tr className="filter-row">
              <th></th>
              {visibleKeys.map((col) => (
                <th key={`filter-${col}`}>
                  <input
                    key={`input-${col}`}
                    type="text"
                    value={filters[col] ?? ""}
                    onChange={(e) => onFilterChange(col, e.target.value)}
                    className="col-filter"
                    placeholder=" "
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={visibleKeys.length + 1}>Yükleniyor…</td>
              </tr>
            )}

            {!!error && !loading && (
              <tr>
                <td colSpan={visibleKeys.length + 1} className="error">
                  Hata: {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={visibleKeys.length + 1}>Kayıt bulunamadı.</td>
              </tr>
            )}

            {!loading && !error && rows.map((v) => {
              const isChecked = selectedVehicleIds.includes(v.id);

              return (
                <tr key={v.id ?? `${v.plate}-${v.trip_no}-${v.edge_code}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleVehicleCheckbox(v.id)}
                    />
                  </td>
                  {visibleKeys.map((key) => (
                    <td key={key}>{renderCell(v, key)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default VehiclesSidebar;
