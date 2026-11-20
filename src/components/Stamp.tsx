import "./Stamp.css";

export default function Stamp({ site }: { site: string }) {
  return (
    <div className="stamp">
      <span className="stamp__small">FOUND ON</span>
      <span className="stamp__site">{site.toUpperCase()}</span>
    </div>
  );
}
