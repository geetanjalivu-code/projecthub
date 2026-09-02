import { useState } from 'react';
import { Modal, BtnPrimary, BtnSecondary, TArea, TInput, FieldLabel } from './ui';
import { useStore } from '../store';
import { versionStr, bumpVersion } from '../utils';

type ChangeType = 'MAJOR' | 'MINOR' | 'PATCH';

const PATCH_OPTIONS = [
  'Spacing or layout adjustment', 'Color or style tweak', 'Typography update',
  'Icon change or update', 'Copy edit or text correction', 'Minor UI polish', 'CSS or annotation update',
];
const MINOR_OPTIONS = [
  'New screen added', 'New user flow added', 'New prototype added',
  'UI enhancement to existing screen', 'New component or pattern introduced',
  'New interaction or animation defined', 'Updated existing flow or screen significantly',
];
const MAJOR_OPTIONS = [
  'Full redesign of a section or feature', 'New design system applied',
  'Breaking change requiring dev rework', 'Major UX strategy shift',
  'Phase completion (e.g. Wireframing done, starting UI Design)',
];

export function LogChangeModal({ onClose }: { onClose: () => void }) {
  const { currentProject, bumpProjectVersion } = useStore();
  const [selected, setSelected]  = useState('');
  const [description, setDesc]   = useState('');
  const [screens, setScreens]    = useState('');
  const [step, setStep]          = useState<1 | 2>(1);
  const [error, setError]        = useState('');

  if (!currentProject) return null;

  const getType = (): ChangeType | null => {
    if (PATCH_OPTIONS.includes(selected)) return 'PATCH';
    if (MINOR_OPTIONS.includes(selected)) return 'MINOR';
    if (MAJOR_OPTIONS.includes(selected)) return 'MAJOR';
    return null;
  };

  const type = getType();
  const nextVersion = type ? versionStr(bumpVersion(currentProject.version, type)) : '—';

  const confirm = () => {
    if (!selected) { setError('Please select a change type.'); return; }
    if (!description.trim()) { setError('Please describe the change.'); return; }
    if (!type) return;
    bumpProjectVersion(type, selected, description, screens);
    onClose();
  };

  return (
    <Modal title="Log design change" onClose={onClose} width="max-w-2xl">
      <div className="p-6">
        {step === 1 && (
          <div className="space-y-5">
            {error && <p className="text-xs text-destructive">{error}</p>}
            {[
              { label: 'PATCH — minor visual or copy changes', items: PATCH_OPTIONS, badge: 'bg-muted text-muted-foreground' },
              { label: 'MINOR — new screens, flows, or enhancements', items: MINOR_OPTIONS, badge: 'bg-secondary text-secondary-foreground' },
              { label: 'MAJOR — redesigns, design system changes, phase completion', items: MAJOR_OPTIONS, badge: 'bg-destructive/10 text-destructive' },
            ].map(({ label, items, badge }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {items.map(item => (
                    <button key={item} onClick={() => { setSelected(item); setError(''); }}
                      className={`text-left px-3 py-2.5 rounded border text-sm transition-all ${selected === item ? 'border-primary bg-ifx-ocean-100 text-primary' : 'border-border bg-card text-foreground hover:border-primary'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <BtnPrimary onClick={() => { if (!selected) { setError('Select a type first.'); return; } setStep(2); }}>
                Next
              </BtnPrimary>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded border border-border">
              <span className="text-sm text-muted-foreground">Selected:</span>
              <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{selected}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {type} bump → <span className="text-primary" style={{ fontWeight: 600 }}>{nextVersion}</span>
              </span>
            </div>
            <div>
              <FieldLabel label="Describe what changed *" />
              <TArea value={description} onChange={setDesc} rows={4}
                placeholder="e.g. Updated the onboarding flow — moved email verification to step 2 and removed step 4" />
            </div>
            <div>
              <FieldLabel label="Screens affected" />
              <TInput value={screens} onChange={setScreens}
                placeholder="e.g. Onboarding Step 1, Sign-up form, Dashboard" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-between pt-2">
              <BtnSecondary onClick={() => setStep(1)}>Back</BtnSecondary>
              <div className="flex gap-3">
                <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
                <BtnPrimary onClick={confirm}>Confirm & log version</BtnPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
