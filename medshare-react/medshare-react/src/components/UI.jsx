import React, { useEffect, useRef } from "react";
import {
  daysLeft,
  money,
  statusLabels,
  finalUnitPrice,
} from "../services/domain.js";
export function Icon({ name = "leaf", size = 20, ...props }) {
  const paths = {
    leaf: (
      <>
        <path d="M19 4c-9-2-15 2-14 8 1 6 10 7 13 1 2-3 1-7 1-9Z" />
        <path d="m5 19 9-10M9 13h5" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    bell: (
      <>
        <path d="M5 16h14l-2-3V9a5 5 0 0 0-10 0v4l-2 3ZM10 20h4" />
      </>
    ),
    arrow: (
      <>
        <path d="m9 5 7 7-7 7" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m7 12 3 3 7-8" />
      </>
    ),
    heart: (
      <path d="M20 5c-3-3-7 0-8 2-1-2-5-5-8-2-4 4 2 10 8 15 6-5 12-11 8-15Z" />
    ),
    building: (
      <>
        <path d="M5 21V4h14v17M3 21h18M9 8h1m4 0h1M9 12h1m4 0h1M10 21v-5h4v5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    logout: (
      <>
        <path d="M10 4H4v16h6M9 12h12m-4-4 4 4-4 4" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1 13H4L5 8ZM8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 10a8 8 0 1 0-2 8M20 4v6h-6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}
export function Brand({ light = false }) {
  return (
    <span className={`brand ${light ? "light" : ""}`}>
      <img
        className="brand-icon"
        src={`${import.meta.env?.BASE_URL || "/"}medshare-mark.svg`}
        alt=""
      />
      <span>
        Med<span className="brand-accent">Share</span>
      </span>
    </span>
  );
}
export function Status({ status }) {
  return (
    <span className={`badge status-${status}`}>
      {statusLabels[status] || status}
    </span>
  );
}
export function Metric({ label, value, note, color = "" }) {
  return (
    <article className={`metric ${color ? `metric-${color}` : ""}`}>
      <span>{label}</span>
      <strong className={color}>{value}</strong>
      {note && <small className={color}>{note}</small>}
    </article>
  );
}
export function Empty({ title = "Nenhum resultado encontrado", children }) {
  return (
    <div className="empty">
      <Icon name="bag" size={30} />
      <h3>{title}</h3>
      <p>
        {children || "Os itens aparecerão aqui quando estiverem disponíveis."}
      </p>
    </div>
  );
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Modal({
  title,
  subtitle,
  children,
  onClose,
  busy = false,
  icon = "check",
}) {
  const dialog = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  useEffect(() => {
    const el = dialog.current;
    el.showModal();
    const cancel = (e) => {
      e.preventDefault();
      if (!busyRef.current) closeRef.current();
    };
    el.addEventListener("cancel", cancel);
    return () => {
      el.removeEventListener("cancel", cancel);
      el.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === dialog.current && !busy) onClose();
      }}
    >
      <div className="modal-inner">
        <button
          className="icon-button modal-close"
          onClick={onClose}
          disabled={busy}
          aria-label="Fechar"
        >
          <Icon name="close" />
        </button>
        <span className="modal-symbol">
          <Icon name={icon} size={27} />
        </span>
        <h2 id="modal-title">{title}</h2>
        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        {children}
      </div>
    </dialog>
  );
}
// Ilustrações vetoriais locais: não dependem de URLs de imagens externas.
export function ProductArt({
  name = "",
  category = "",
  index = 0,
  large = false,
}) {
  const palettes = [
    ["#e2edfb", "#2159a7"],
    ["#edf2fb", "#16396e"],
    ["#fce7ec", "#b7243b"],
    ["#e8f0ff", "#315eaf"],
    ["#e5edf9", "#374f89"],
    ["#f6e8ed", "#a33350"],
  ];
  const [bg, accent] = palettes[Math.abs(Number(index) || 0) % palettes.length];
  const bottle = /gotas|soro|ml/i.test(name);
  return (
    <svg
      className={`product-art ${large ? "large" : ""}`}
      viewBox="0 0 400 230"
      role="img"
      aria-label={`Ilustração de ${name}`}
    >
      <defs>
        <linearGradient id={`bg-${index}-${large}`} x2="1" y2="1">
          <stop stopColor={bg} />
          <stop offset="1" stopColor="#f9f9f5" />
        </linearGradient>
      </defs>
      <rect width="400" height="230" fill={`url(#bg-${index}-${large})`} />
      <ellipse cx="205" cy="193" rx="110" ry="12" fill="#203a3920" />
      {bottle ? (
        <g>
          <rect
            x="166"
            y="85"
            width="74"
            height="106"
            rx="12"
            fill="#edebe4"
            stroke="#d3d1c9"
          />
          <path d="M185 85V51h35v34" fill="#fdfdfb" stroke="#ddd" />
          <rect x="180" y="70" width="45" height="16" rx="3" fill="#fff" />
          <rect x="168" y="110" width="70" height="58" fill="white" />
          <rect x="168" y="110" width="70" height="8" fill={accent} />
          <text x="203" y="135" textAnchor="middle" fontSize="8" fill="#263638">
            MEDSHARE
          </text>
          <text x="203" y="151" textAnchor="middle" fontSize="9" fill={accent}>
            SAÚDE +
          </text>
        </g>
      ) : (
        <g transform="translate(100 59) rotate(-5 100 65)">
          <path d="m0 14 20-14h182l-15 14" fill="#e5e4de" />
          <path d="m187 14 15-14v115l-15 14" fill="#d5d7d0" />
          <rect
            x="0"
            y="14"
            width="187"
            height="115"
            rx="2"
            fill="#fefdf8"
            stroke="#d6d8d2"
          />
          <rect y="23" width="187" height="9" fill={accent} />
          <text
            x="14"
            y="57"
            fontFamily="Arial"
            fontWeight="bold"
            fontSize="12"
            fill="#34423e"
          >
            {name.split(" ").slice(0, 2).join(" ").slice(0, 23)}
          </text>
          <text x="14" y="76" fontFamily="Arial" fontSize="10" fill="#586e69">
            {name.match(/[\d.,]+\s*(mg|ml|UI)/i)?.[0] || "CUIDADO COM VOCÊ"}
          </text>
          <path d="M14 89h90M14 96h65" stroke="#b4bdb7" strokeWidth="2" />
          <rect x="0" y="110" width="187" height="19" fill={accent} />
          <text x="12" y="123" fontFamily="Arial" fontSize="8" fill="white">
            {category || "MEDICAMENTO"}
          </text>
          <circle cx="162" cy="88" r="14" fill={accent} />
          <path d="M155 88h14m-7-7v14" stroke="white" strokeWidth="3" />
        </g>
      )}
      <g fill={accent}>
        <ellipse cx="294" cy="186" rx="9" ry="5" />
        <ellipse cx="316" cy="181" rx="9" ry="5" />
      </g>
    </svg>
  );
}
export function HeroArt() {
  return (
    <figure className="hero-art">
      <img
        src={`${import.meta.env?.BASE_URL || "/"}medshare-hero.webp`}
        alt="Mãos de farmacêutico preparando caixas de medicamentos para distribuição"
        width="1200"
        height="800"
        fetchPriority="high"
      />
    </figure>
  );
}
export function ProductCard({ lot, onClick, donation = false }) {
  const days = daysLeft(lot.dataValidade);
  return (
    <article className="product-card">
      <div className="product-image">
        <ProductArt
          name={lot.medicamento.nome}
          category={lot.medicamento.categoria}
          index={lot.idMedicamento}
        />
        <span className={`card-ribbon ${donation ? "donation" : ""}`}>
          {donation ? "Doação" : `-${lot.percentualDesconto}%`}
        </span>
        <span className="expiry">
          {days === null ? "Validade não informada" : `Vence em ${days} dias`}
        </span>
      </div>
      <div className="product-content">
        <h3 title={lot.medicamento.nome}>
          {lot.medicamento.nome || `Medicamento #${lot.idMedicamento}`}
        </h3>
        <p className="product-caption">
          {donation
            ? `Quantidade: ${lot.quantidade} un. • Lote ${lot.id}`
            : lot.medicamento.principioAtivo ||
              lot.medicamento.principio_ativo ||
              lot.medicamento.categoria}
        </p>
        {donation ? (
          <>
            <div className="pharmacy-box">
              <Icon name="building" size={16} />
              <div>
                <strong>
                  {lot.farmacia.nome ||
                    lot.farmacia.usuario?.nome ||
                    `Farmácia #${lot.idFarmacia}`}
                </strong>
                <small>
                  {lot.farmacia.endereco ||
                    "Combine a retirada com a farmácia."}
                </small>
              </div>
            </div>
            <button className="button full" onClick={onClick}>
              Reivindicar Lote
            </button>
          </>
        ) : (
          <div className="product-bottom">
            <div>
              <del>{money(lot.precoOriginal)}</del>
              <strong>{money(finalUnitPrice(lot))}</strong>
            </div>
            <button className="button" onClick={onClick}>
              Comprar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
