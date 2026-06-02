import type { Instrument, SynthType, VisualTemplate } from '../../types';

export function ParameterPanel({ instrument, onChange }: { instrument: Instrument; onChange: (instrument: Instrument) => void }) {
  return (
    <div className="control-grid">
      <label>
        Synth Type
        <select value={instrument.synth.type} onChange={(event) => onChange({ ...instrument, synth: { ...instrument.synth, type: event.target.value as SynthType } })}>
          {['fm', 'am', 'mono', 'pluck', 'metal'].map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}
        </select>
      </label>
      <label>
        Filter ({Math.round(instrument.filter.frequency)} Hz)
        <input type="range" min="80" max="12000" value={instrument.filter.frequency} onChange={(event) => onChange({ ...instrument, filter: { ...instrument.filter, frequency: Number(event.target.value) } })} />
      </label>
      <label>
        Attack ({instrument.synth.attack.toFixed(3)}s)
        <input type="range" min="0.001" max="3" step="0.001" value={instrument.synth.attack} onChange={(event) => onChange({ ...instrument, synth: { ...instrument.synth, attack: Number(event.target.value) } })} />
      </label>
      <label>
        Visual
        <select value={instrument.visual.template} onChange={(event) => onChange({ ...instrument, visual: { ...instrument.visual, template: event.target.value as VisualTemplate } })}>
          {['stringed', 'wind', 'percussion', 'crystalline', 'organic', 'spiral'].map((template) => <option key={template} value={template}>{template}</option>)}
        </select>
      </label>
    </div>
  );
}
