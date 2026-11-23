import type { Filter } from "../api";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
];

type TodoFilterProps = {
  filter: Filter;
  onChange: (filter: Filter) => void;
};

export default function TodoFilter({ filter, onChange }: TodoFilterProps) {
  return (
    <div className="todo-filter" role="group" aria-label="Filter todos">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={value === filter ? "active" : undefined}
          aria-pressed={value === filter}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
