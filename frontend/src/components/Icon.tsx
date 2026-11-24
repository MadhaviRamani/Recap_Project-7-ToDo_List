export type IconName = "edit" | "delete" | "save" | "cancel" | "drag";

type IconProps = {
  name: IconName;
};

// The path data of each icon (24×24 grid, drawn with strokes).
const paths: Record<IconName, string[]> = {
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"],
  delete: [
    "M3 6h18",
    "M8 6V4h8v2",
    "M19 6l-1 14H6L5 6",
    "M10 11v6",
    "M14 11v6",
  ],
  save: ["M20 6 9 17l-5-5"],
  cancel: ["M18 6 6 18", "M6 6l12 12"],
  // 6 dots, 2 columns of 3: a very short line with round ends is drawn as a dot.
  drag: [
    "M9 6h.01",
    "M9 12h.01",
    "M9 18h.01",
    "M15 6h.01",
    "M15 12h.01",
    "M15 18h.01",
  ],
};

// Decorative only: the button around it carries the accessible name.
export default function Icon({ name }: IconProps) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      // Thicker strokes for the dots, so they are big enough to see.
      strokeWidth={name === "drag" ? 3.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
