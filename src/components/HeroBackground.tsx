// Latar hero Amsterdam: asap gelap + sticker melayang. Murni CSS, tanpa library.
const stickers = [
  { l: 6, d: 0, t: 19, s: 46, c: '#E63946', r: '14px' },
  { l: 16, d: 5, t: 24, s: 34, c: '#2F5BEA', r: '50%' },
  { l: 28, d: 9, t: 21, s: 40, c: '#F5F0E8', r: '10px' },
  { l: 41, d: 2, t: 26, s: 30, c: '#C8832A', r: '50%' },
  { l: 55, d: 7, t: 18, s: 44, c: '#2F5BEA', r: '12px' },
  { l: 67, d: 3, t: 23, s: 36, c: '#E63946', r: '50%' },
  { l: 78, d: 11, t: 20, s: 42, c: '#F5F0E8', r: '14px' },
  { l: 90, d: 6, t: 25, s: 32, c: '#C8832A', r: '10px' },
];

export default function HeroBackground({ accent = '#C8832A' }: { accent?: string }) {
  return (
    <div aria-hidden className="ams-hero-bg" style={{ ['--hero-accent' as string]: accent }}>
      <div className="ams-shade" />
      <span className="ams-smoke ams-smoke-a" />
      <span className="ams-smoke ams-smoke-b" />
      <span className="ams-smoke ams-smoke-c" />
      <span className="ams-glow" />
      {stickers.map((s, i) => (
        <span
          key={i}
          className="ams-sticker"
          style={{
            left: `${s.l}%`,
            width: s.s,
            height: s.s,
            background: s.c,
            borderRadius: s.r,
            animationDuration: `${t(s.t)}s`,
            animationDelay: `-${s.d}s`,
          }}
        />
      ))}
    </div>
  );
}
const t = (n: number) => n;