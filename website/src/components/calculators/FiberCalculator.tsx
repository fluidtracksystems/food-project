import { useMemo, useState } from 'preact/hooks';
import {
  calculateFiber,
  FIBER_CALORIE_MAX,
  FIBER_CALORIE_MIN,
  FIBER_G_PER_1000_KCAL,
  FIBER_MIN_AGE,
  type FiberResult,
} from '../../lib/calculators/fiber';
import { useLiveResult } from './use-live-result';

interface Props {
  /** Id of the static `role="status"` element (in ToolShell's result slot) that shows the guideline. */
  resultId: string;
}

function ResultView({ result }: { result: FiberResult }) {
  if (!result.ok) return <p>Enter an age and choose a sex to see the general guideline.</p>;
  return (
    <>
      <p class="meta">General guideline for healthy people. {result.bandLabel}.</p>
      <p class="rc-fiber-figure">
        <span>Adequate Intake by age and sex (US Institute of Medicine)</span>
        <strong>{result.aiGrams} g a day</strong>
      </p>
      {result.calorieGrams !== undefined && (
        <>
          <p class="rc-fiber-figure">
            <span>Based on the calories you entered ({FIBER_G_PER_1000_KCAL} g per 1,000 kcal)</span>
            <strong>{result.calorieGrams} g a day</strong>
          </p>
          <p class="meta">
            This second figure scales with your calories. The two figures can differ because they assume different
            calorie levels.
          </p>
        </>
      )}
      {result.calorieNote && <p class="meta">No calorie-based figure: {result.calorieNote}</p>}
    </>
  );
}

export default function FiberCalculator({ resultId }: Props) {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [calories, setCalories] = useState('');

  const result = useMemo(() => calculateFiber({ age, sex, calories }), [age, sex, calories]);
  const untouched = age.trim() === '' && sex === '' && calories.trim() === '';
  useLiveResult({
    resultId,
    tool: 'fiber-calculator',
    result,
    view: untouched ? null : <ResultView result={result} />,
    hasFigure: result.ok,
  });

  // Show a field's problem once the person has started: the sex prompt waits until the age is usable.
  const errors = result.ok ? {} : result.errors;
  const ageError = age.trim() !== '' ? errors.age : undefined;
  const sexError = age.trim() !== '' && !errors.age ? errors.sex : undefined;
  const calorieNote = result.ok && calories.trim() !== '' ? result.calorieNote : undefined;

  return (
    <div class="rc">
      <div class="rc-field rc-narrow">
        <label for="fc-age">Age</label>
        <input
          id="fc-age"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={age}
          aria-describedby={ageError ? 'fc-age-err fc-age-hint' : 'fc-age-hint'}
          onInput={(e) => setAge(e.currentTarget.value)}
        />
        <p id="fc-age-hint" class="rc-hint">
          Whole years, {FIBER_MIN_AGE} and over.
        </p>
        {ageError && (
          <p id="fc-age-err" class="rc-error">
            Problem: {ageError}
          </p>
        )}
      </div>

      <div class="rc-field rc-narrow">
        <label for="fc-sex">Sex</label>
        <select id="fc-sex" value={sex} aria-describedby={sexError ? 'fc-sex-err' : undefined} onChange={(e) => setSex(e.currentTarget.value)}>
          <option value="">Choose</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        {sexError && (
          <p id="fc-sex-err" class="rc-error">
            Problem: {sexError}
          </p>
        )}
      </div>

      <div class="rc-field rc-narrow">
        <label for="fc-cal">Calories a day (optional)</label>
        <input
          id="fc-cal"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={calories}
          aria-describedby={calorieNote ? 'fc-cal-err fc-cal-hint' : 'fc-cal-hint'}
          onInput={(e) => setCalories(e.currentTarget.value)}
        />
        <p id="fc-cal-hint" class="rc-hint">
          Adults 19 and over only, {FIBER_CALORIE_MIN.toLocaleString('en-US')} to {FIBER_CALORIE_MAX.toLocaleString('en-US')} kcal. Adds a second figure.
        </p>
        {calorieNote && (
          <p id="fc-cal-err" class="rc-hint">
            Note: {calorieNote}
          </p>
        )}
      </div>
    </div>
  );
}
