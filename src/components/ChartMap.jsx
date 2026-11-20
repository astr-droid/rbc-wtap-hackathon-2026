// The one map. Every zoom level renders this with different regions, routes and pins.

const WIDTH = 760;
const HEIGHT = 400;

const CONTOURS = [
  'M-20 83C70 13 145 121 246 77S415 7 514 65 670 97 795 27',
  'M-15 105C82 37 146 145 252 99S418 32 516 87 682 122 793 52',
  'M-20 300C80 238 139 345 253 300S424 228 521 283 674 317 796 249',
  'M-12 326C83 265 146 372 260 325S428 256 529 309 684 343 794 277',
  'M81 -12C145 68 75 132 140 189S215 280 148 412',
  'M610 -12C543 63 642 128 576 189S510 286 580 412',
];

const fmt = (n) => n.toFixed(1);

// A soft, irregular blob so regions look hand-drawn rather than geometric.
function blobPath({ x, y, rx, ry }, seed) {
  const n = 9;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const wobble = 1 + 0.1 * Math.sin(seed * 3.1 + i * 2.3);
    return [x + Math.cos(a) * rx * wobble, y + Math.sin(a) * ry * wobble];
  });
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return `${d}Z`;
}

function starPath(x, y, r) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.45;
    return `${fmt(x + Math.cos(a) * radius)} ${fmt(y + Math.sin(a) * radius)}`;
  });
  return `M${points.join('L')}Z`;
}

function Pin({ pin }) {
  const { x, y, label, sublabel, tone = 'mint', size = 'md', icon, onClick, ariaLabel, labelPosition = 'below' } = pin;
  const r = size === 'lg' ? 6 : size === 'sm' ? 3.5 : 5;
  const labelY = labelPosition === 'above' ? y - 30 : y + 24;
  const interactive = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        'aria-label': ariaLabel ?? label,
        onClick,
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        },
      }
    : {};
  return (
    <g className={`map-pin tone-${tone}${onClick ? ' interactive' : ''}`} {...interactive}>
      <circle className="pin-ring" cx={x} cy={y} r={r + 8} />
      {icon === 'star' ? <path className="pin-star" d={starPath(x, y, 7)} /> : <circle className="pin-dot" cx={x} cy={y} r={r} />}
      {label && <text className="map-label-bright" x={x} y={labelY} textAnchor="middle">{label}</text>}
      {sublabel && <text className="map-small" x={x} y={labelY + 13} textAnchor="middle">{sublabel}</text>}
    </g>
  );
}

export default function ChartMap({ title, description, regions = [], routes = [], pins = [], links = [], glow = {} }) {
  return (
    <svg className="map-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="group" aria-label={title} preserveAspectRatio="xMidYMid meet">
      <title>{title}</title>
      {description && <desc>{description}</desc>}

      {CONTOURS.map((d) => <path key={d} className="contour" d={d} />)}

      {regions.map((region, i) => {
        const level = glow[region.id] ?? 0;
        return (
          <g key={region.id} className={`map-region-group${level ? ' glowing' : ''}`}>
            <path
              className="map-region"
              d={blobPath(region, i + 1)}
              style={level ? { fill: `rgba(240, 199, 126, ${0.06 + 0.2 * level})`, stroke: `rgba(240, 199, 126, ${0.35 + 0.4 * level})` } : undefined}
            />
            <text className="map-label" x={region.x} y={region.y + region.ry + 18} textAnchor="middle">{region.name.toUpperCase()}</text>
            {region.caption && <text className="map-small" x={region.x} y={region.y + region.ry + 30} textAnchor="middle">{region.caption}</text>}
          </g>
        );
      })}

      {links.map((link) => (
        <line key={link.id} className="map-link" x1={link.from.x} y1={link.from.y} x2={link.to.x} y2={link.to.y} />
      ))}

      {routes.map((route) => (
        <g key={route.id}>
          <path className="route-halo" d={route.d} />
          <path className={`route-line${route.stalled ? ' stalled' : ''}${route.muted ? ' muted' : ''}`} d={route.d} />
        </g>
      ))}

      {pins.map((pin) => <Pin key={pin.id} pin={pin} />)}

      <g className="compass-rose" aria-hidden="true">
        <path d="M35 378v-16m-4 6 4-6 4 6" />
        <text className="map-small" x="31" y="392">N</text>
      </g>
    </svg>
  );
}
