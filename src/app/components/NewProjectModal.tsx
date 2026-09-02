import { useState } from 'react';
import { Modal, TInput, TArea, BtnPrimary, BtnSecondary, FieldLabel } from './ui';
import { createProject } from '../utils';
import { useStore } from '../store';

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { addProject, projects } = useStore();
  const [name, setName]         = useState('');
  const [owner, setOwner]       = useState('');
  const [startDate, setStart]   = useState('');
  const [deadline, setDeadline] = useState('');
  const [desc, setDesc]         = useState('');
  const [error, setError]       = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Project name is required.'); return; }
    if (projects.length >= 20) { setError('Maximum 20 projects reached.'); return; }
    const project = createProject({ name: name.trim(), owner, startDate, deadline, description: desc });
    addProject(project);
    onClose();
  };

  return (
    <Modal title="New project" onClose={onClose}>
      <div className="p-6 space-y-4">
        <div>
          <FieldLabel label="Project name *" />
          <TInput value={name} onChange={setName} placeholder="e.g. Onboarding Redesign" />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
        <div>
          <FieldLabel label="Project owner" />
          <TInput value={owner} onChange={setOwner} placeholder="Your name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Start date" />
            <TInput value={startDate} onChange={setStart} type="date" />
          </div>
          <div>
            <FieldLabel label="Deadline" />
            <TInput value={deadline} onChange={setDeadline} type="date" />
          </div>
        </div>
        <div>
          <FieldLabel label="Brief description" />
          <TArea value={desc} onChange={setDesc} rows={3} placeholder="What is this project about?" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <BtnSecondary onClick={onClose}>Cancel</BtnSecondary>
          <BtnPrimary onClick={submit}>Create project</BtnPrimary>
        </div>
      </div>
    </Modal>
  );
}
