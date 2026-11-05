import { render } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { calculateRecipeCost, formatUsd, type RecipeCostResult, type RowInput } from '../../lib/calculators/recipe-cost';
import { UNITS, type Unit } from '../../lib/units';

interface Props {
  /** Id of the static `role="status"` element (in ToolShell's result slot) that shows the totals. */
  resultId: string;
}

interface Row extends RowInput {
  key: number;
  quantity: string;
  packPrice: string;
  packSize: string;
}

const START_ROWS = 3;
// Wait for a pause in typing before the polite live region is updated.
const RESULT_DELAY_MS = 600;
const UNIT_LABELS: Record<Unit, string> = {
  g: 'g',
  kg: 'kg',
  oz: 'oz',
  lb: 'lb',
  ml: 'ml',
  l: 'l',
  tsp: 'tsp',
  tbsp: 'tbsp',
  cup: 'cup',
  floz: 'fl oz',
  each: 'each',
};

const blankRow = (key: number): Row => ({ key, name: '', quantity: '', unit: 'g', packPrice: '', packSize: '', packUnit: 'g' });

type TextField = 'name' | 'quantity' | 'packPrice' | 'packSize';
type UnitField = 'unit' | 'packUnit';

function UnitSelect(props: { id: string; label: string; n: number; value: string; describedBy?: string; onChange: (v: string) => void }) {
  return (
    <div class="rc-field">
      <label for={props.id}>
        {props.label} <span class="rc-n">row {props.n}</span>
      </label>
      <select id={props.id} value={props.value} aria-describedby={props.describedBy} onChange={(e) => props.onChange(e.currentTarget.value)}>
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {UNIT_LABELS[u]}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextInput(props: {
  id: string;
  label: string;
  n: number;
  value: string;
  describedBy?: string;
  decimal?: boolean;
  placeholder?: string;
  onInput: (v: string) => void;
}) {
  return (
    <div class="rc-field">
      <label for={props.id}>
        {props.label} <span class="rc-n">row {props.n}</span>
      </label>
      <input
        id={props.id}
        type="text"
        inputMode={props.decimal ? 'decimal' : 'text'}
        autoComplete="off"
        value={props.value}
        placeholder={props.placeholder}
        aria-describedby={props.describedBy}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
    </div>
  );
}

function ResultView({ result }: { result: RecipeCostResult }) {
  const bad = result.errors.length;
  return (
    <>
      <p class="rc-result-line">
        <span>Total cost</span> <strong>{formatUsd(result.total)}</strong>
      </p>
      <p class="rc-result-line">
        <span>Cost per serving</span>{' '}
        <strong>{result.perServing === null ? 'Enter servings' : formatUsd(result.perServing)}</strong>
      </p>
      {bad > 0 && (
        <p class="meta">
          {bad === 1 ? '1 row has a problem and is left out of the total.' : `${bad} rows have problems and are left out of the total.`}
        </p>
      )}
    </>
  );
}

export default function RecipeCostCalculator({ resultId }: Props) {
  const nextKey = useRef(START_ROWS);
  const addButton = useRef<HTMLButtonElement>(null);
  const placeholder = useRef<string | null>(null);
  const showingPlaceholder = useRef(true);
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: START_ROWS }, (_, i) => blankRow(i)));
  const [servings, setServings] = useState('4');

  const result = useMemo(() => calculateRecipeCost(rows, servings), [rows, servings]);

  // The totals live in ToolShell's polite live region (role="status" is atomic, so the whole region
  // is read out on every change), which is outside this island. To keep a screen reader quiet the
  // update is debounced until typing pauses, and the untouched start state keeps the static
  // placeholder, so nothing is announced on load.
  useEffect(() => {
    const target = document.getElementById(resultId);
    if (!target) return;
    placeholder.current ??= target.innerHTML;
    const untouched = result.rows.every((r) => r.kind === 'empty');
    const timer = setTimeout(() => {
      if (untouched) {
        restorePlaceholder(target);
        return;
      }
      if (showingPlaceholder.current) {
        target.textContent = '';
        showingPlaceholder.current = false;
      }
      render(<ResultView result={result} />, target);
    }, RESULT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [result, resultId]);
  useEffect(() => {
    return () => {
      const target = document.getElementById(resultId);
      if (target) restorePlaceholder(target);
    };
  }, [resultId]);

  function restorePlaceholder(target: HTMLElement) {
    if (showingPlaceholder.current) return;
    render(null, target);
    target.innerHTML = placeholder.current ?? '';
    showingPlaceholder.current = true;
  }

  const setText = (key: number, field: TextField, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const setUnit = (key: number, field: UnitField, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((rs) => [...rs, blankRow(nextKey.current++)]);
  const removeRow = (key: number) => {
    setRows((rs) => rs.filter((r) => r.key !== key));
    addButton.current?.focus();
  };

  return (
    <div class="rc">
      <div class="rc-field rc-servings">
        <label for="rc-servings">Servings</label>
        <input
          id="rc-servings"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={servings}
          aria-describedby={result.servingsError ? 'rc-servings-err' : undefined}
          onInput={(e) => setServings(e.currentTarget.value)}
        />
        {result.servingsError && (
          <p id="rc-servings-err" class="rc-error">
            Problem: {result.servingsError}
          </p>
        )}
      </div>

      {rows.map((row, index) => {
        const n = index + 1;
        const id = `rc-${row.key}`;
        const outcome = result.rows[index];
        const error = outcome?.kind === 'error' ? outcome.error : undefined;
        const errId = error ? `${id}-err` : undefined;
        return (
          <fieldset class="rc-row" key={row.key}>
            <legend>Ingredient {n}</legend>
            <TextInput id={`${id}-name`} label="Name" n={n} value={row.name} placeholder="optional" onInput={(v) => setText(row.key, 'name', v)} />
            <div class="rc-pair">
              <TextInput id={`${id}-qty`} label="Amount used" n={n} value={row.quantity} decimal describedBy={errId} onInput={(v) => setText(row.key, 'quantity', v)} />
              <UnitSelect id={`${id}-unit`} label="Unit used" n={n} value={row.unit} describedBy={errId} onChange={(v) => setUnit(row.key, 'unit', v)} />
            </div>
            <div class="rc-pair">
              <TextInput id={`${id}-size`} label="Pack size" n={n} value={row.packSize} decimal describedBy={errId} onInput={(v) => setText(row.key, 'packSize', v)} />
              <UnitSelect id={`${id}-pack-unit`} label="Pack unit" n={n} value={row.packUnit} describedBy={errId} onChange={(v) => setUnit(row.key, 'packUnit', v)} />
            </div>
            <TextInput id={`${id}-price`} label="Pack price (USD)" n={n} value={row.packPrice} decimal describedBy={errId} onInput={(v) => setText(row.key, 'packPrice', v)} />
            {error && (
              <p id={errId} class="rc-error">
                Problem in row {n}: {error}
              </p>
            )}
            <div class="rc-row-foot">
              <p class="rc-cost">
                Cost of row {n}: <strong>{outcome?.kind === 'ok' ? formatUsd(outcome.cost) : 'not calculated'}</strong>
              </p>
              <button
                type="button"
                class="btn btn-secondary"
                disabled={rows.length === 1}
                aria-label={`Remove ingredient ${n}${row.name.trim() ? `, ${row.name.trim()}` : ''}`}
                onClick={() => removeRow(row.key)}
              >
                Remove
              </button>
            </div>
          </fieldset>
        );
      })}

      <button type="button" class="btn btn-primary" ref={addButton} onClick={addRow}>
        Add ingredient {rows.length + 1}
      </button>
    </div>
  );
}
