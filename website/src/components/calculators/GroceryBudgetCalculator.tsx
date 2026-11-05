import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { formatUsd } from '../../lib/calculators/recipe-cost';
import {
  calculateGroceryBudget,
  MAX_MEMBERS,
  SEX_FROM_AGE,
  type GroceryResult,
  type MemberInput,
} from '../../lib/calculators/grocery-budget';
import { useLiveResult } from './use-live-result';

interface Props {
  /** Id of the static `role="status"` element (in ToolShell's result slot) that shows the estimate. */
  resultId: string;
}

interface Member extends MemberInput {
  key: number;
  age: string;
  sex: string;
}

const START_MEMBERS = 2;
const blankMember = (key: number): Member => ({ key, age: '', sex: '' });

/** True when the age is a whole number under 12, so sex plays no part. */
const sexNotNeeded = (age: string): boolean => /^\d+$/.test(age.trim()) && Number(age.trim()) < SEX_FROM_AGE;

function adjustment(factor: number): string {
  if (factor === 1) return 'No household-size adjustment (4 people).';
  const percent = Math.round(Math.abs(factor - 1) * 100);
  return `USDA household-size adjustment: ${factor > 1 ? 'add' : 'subtract'} ${percent} percent.`;
}

function ResultView({ result }: { result: GroceryResult }) {
  if (result.costs.length === 0) {
    return <p>{result.limitError ?? 'Enter an age for at least one person to see the estimate.'}</p>;
  }
  const people = result.validCount === 1 ? '1 person' : `${result.validCount} people`;
  return (
    <>
      <table class="rc-plans">
        <caption>
          Estimated food at home cost for {people}, USDA Food Plans, {result.asOfLabel}
        </caption>
        <thead>
          <tr>
            <th scope="col">Plan</th>
            <th scope="col">Per week</th>
            <th scope="col">Per month</th>
          </tr>
        </thead>
        <tbody>
          {result.costs.map((c) => (
            <tr key={c.plan}>
              <th scope="row">{c.name}</th>
              <td>
                <strong>{formatUsd(c.weekly)}</strong>
              </td>
              <td>
                <strong>{formatUsd(c.monthly)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p class="meta">{result.factor !== null && adjustment(result.factor)}</p>
      {result.excludedCount > 0 && (
        <p class="meta">
          {result.excludedCount === 1
            ? '1 person has a problem and is left out of these figures.'
            : `${result.excludedCount} people have problems and are left out of these figures.`}
        </p>
      )}
    </>
  );
}

export default function GroceryBudgetCalculator({ resultId }: Props) {
  const nextKey = useRef(START_MEMBERS);
  const pendingFocus = useRef<string | null>(null);
  const [members, setMembers] = useState<Member[]>(() => Array.from({ length: START_MEMBERS }, (_, i) => blankMember(i)));
  const [announcement, setAnnouncement] = useState('');

  const result = useMemo(() => calculateGroceryBudget(members), [members]);
  const untouched = result.members.every((m) => m.kind === 'empty');
  useLiveResult({
    resultId,
    tool: 'grocery-budget-calculator',
    result,
    view: untouched ? null : <ResultView result={result} />,
    hasFigure: result.costs.length > 0,
  });

  const setField = (key: number, field: 'age' | 'sex', value: string) =>
    setMembers((ms) => ms.map((m) => (m.key === key ? { ...m, [field]: value } : m)));
  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    // Move focus to the new person's age so keyboard users land in the new row, even when this
    // was the last one allowed and the Add button disables itself.
    const key = nextKey.current++;
    pendingFocus.current = `gb-${key}-age`;
    setMembers((ms) => [...ms, blankMember(key)]);
  };
  const removeMember = (key: number) => {
    const index = members.findIndex((m) => m.key === key);
    if (index === -1 || members.length === 1) return;
    // Keep keyboard users where they were: on the row that takes this one's place (or the one above).
    const neighbour = members[index + 1] ?? members[index - 1];
    pendingFocus.current = `gb-${neighbour.key}-age`;
    const left = members.length - 1;
    setAnnouncement(`Person ${index + 1} removed. ${left} ${left === 1 ? 'person' : 'people'} left.`);
    setMembers((ms) => ms.filter((m) => m.key !== key));
  };

  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    document.getElementById(id)?.focus();
  }, [members]);

  const atLimit = members.length >= MAX_MEMBERS;

  return (
    <div class="rc">
      <p class="rc-hint">Add everyone in the household who eats at home. Leave a row blank to ignore it.</p>
      {members.map((member, index) => {
        const n = index + 1;
        const id = `gb-${member.key}`;
        const outcome = result.members[index];
        const error = outcome?.kind === 'error' ? outcome.error : undefined;
        const errId = error ? `${id}-err` : undefined;
        const noSex = sexNotNeeded(member.age);
        const hintId = `${id}-sex-hint`;
        return (
          <fieldset class="rc-row" key={member.key}>
            <legend>Person {n}</legend>
            {error && (
              <p id={errId} class="rc-error">
                Problem in person {n}: {error}
              </p>
            )}
            <div class="rc-age-sex">
              <div class="rc-field">
                <label for={`${id}-age`}>
                  Age <span class="rc-n">person {n}</span>
                </label>
                <input
                  id={`${id}-age`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={member.age}
                  aria-describedby={errId}
                  onInput={(e) => setField(member.key, 'age', e.currentTarget.value)}
                />
              </div>
              <div class="rc-field">
                <label for={`${id}-sex`}>
                  Sex <span class="rc-n">person {n}</span>
                </label>
                <select
                  id={`${id}-sex`}
                  value={member.sex}
                  disabled={noSex}
                  required={!noSex && member.age.trim() !== ''}
                  aria-describedby={errId ? `${hintId} ${errId}` : hintId}
                  onChange={(e) => setField(member.key, 'sex', e.currentTarget.value)}
                >
                  <option value="">Choose</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>
            <p id={hintId} class="rc-hint">
              {noSex
                ? `Not needed under ${SEX_FROM_AGE}: USDA costs for children do not depend on sex.`
                : `Needed from age ${SEX_FROM_AGE}: USDA costs differ by sex from then on.`}
            </p>
            {members.length > 1 && (
              <div class="rc-row-foot">
                <button type="button" class="btn btn-secondary" aria-label={`Remove person ${n}`} onClick={() => removeMember(member.key)}>
                  Remove
                </button>
              </div>
            )}
          </fieldset>
        );
      })}

      <button type="button" class="btn btn-primary" disabled={atLimit} aria-describedby={atLimit ? 'gb-limit-hint' : undefined} onClick={addMember}>
        {atLimit ? 'Add person' : `Add person ${members.length + 1}`}
      </button>
      {atLimit && (
        <p id="gb-limit-hint" class="rc-hint">
          The calculator takes up to {MAX_MEMBERS} people.
        </p>
      )}
      <p class="visually-hidden" role="status">
        {announcement}
      </p>
    </div>
  );
}
