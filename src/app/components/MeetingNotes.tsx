import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { PageHeader, Section, Field, TextInput, TextArea, EditableList, EditableTable } from "./shared";

type Meeting = {
  id: string;
  title: string;
  date: string;
  type: string;
  expanded: boolean;
};

const MEETING_TYPES = ["Design Review", "Stakeholder Sync", "Team Standup", "Research Readout", "Kickoff", "Retrospective", "Ad hoc", "Other"];

const defaultMeetings: Meeting[] = [
  { id: "1", title: "Project Kickoff", date: "06 Jan 2026", type: "Kickoff", expanded: true },
  { id: "2", title: "Design Review — Onboarding Wireframes", date: "14 Jan 2026", type: "Design Review", expanded: false },
];

function MeetingCard({ meeting, onRemove }: { meeting: Meeting; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(meeting.expanded);
  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(meeting.date);
  const [type, setType] = useState(meeting.type);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="px-5 py-3 bg-muted border-b border-border flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Calendar size={14} className="text-muted-foreground shrink-0" />
        <input
          value={title}
          onChange={(e) => { e.stopPropagation(); setTitle(e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-foreground"
        />
        <input
          value={date}
          onChange={(e) => { e.stopPropagation(); setDate(e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          placeholder="DD MMM YYYY"
          className="bg-transparent border-none outline-none text-xs text-muted-foreground w-28 text-right focus:bg-input-background focus:rounded focus:px-2 focus:py-0.5 focus:text-left"
        />
        <select
          value={type}
          onChange={(e) => { e.stopPropagation(); setType(e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          className="appearance-none bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded border-none focus:outline-none"
        >
          {MEETING_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 size={12} />
        </button>
        {expanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="p-5 bg-card space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Agenda */}
            <div>
              <Field label="Agenda">
                <EditableList
                  initialItems={["Project status update", "Review wireframes for Screens 1–3", "Align on next sprint scope"]}
                  placeholder="Add agenda item…"
                />
              </Field>
            </div>

            {/* Attendees */}
            <div>
              <Field label="Attendees">
                <EditableList
                  initialItems={["Designer Name (Facilitator)", "PM Name", "Stakeholder Name"]}
                  placeholder="Add attendee…"
                />
              </Field>
            </div>
          </div>

          {/* Discussion */}
          <Field label="Discussion Points">
            <TextArea
              rows={4}
              placeholder="Summarise the key topics discussed, questions raised, and context shared. This is a narrative section, not a transcript."
            />
          </Field>

          {/* Decisions */}
          <Field label="Decisions Made">
            <EditableList
              initialItems={[
                "Onboarding will be 3 steps, not 5",
                "Skip button will be visible on all steps",
                "Mobile design to follow after web is approved",
              ]}
              placeholder="Add decision…"
            />
          </Field>

          {/* Action items */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Action Items</p>
            <EditableTable
              columns={[
                { key: "action",  label: "Action",    width: "50%" },
                { key: "owner",   label: "Owner",     width: "20%" },
                { key: "due",     label: "Due Date",  width: "15%" },
                { key: "status",  label: "Status",    width: "15%", type: "select", options: ["To Do", "In Progress", "Done", "Blocked"] },
              ]}
              initialRows={[
                { action: "Share revised wireframes for review", owner: "Designer", due: "18 Jan 2026", status: "To Do" },
                { action: "Confirm mobile scope with engineering", owner: "PM", due: "20 Jan 2026", status: "To Do" },
                { action: "Schedule usability testing sessions", owner: "Designer", due: "22 Jan 2026", status: "In Progress" },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function MeetingNotes() {
  const [meetings, setMeetings] = useState(defaultMeetings);

  const addMeeting = () => {
    const today = new Date();
    const label = today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    setMeetings([{ id: String(Date.now()), title: "New Meeting", date: label, type: "Ad hoc", expanded: true }, ...meetings]);
  };

  const removeMeeting = (id: string) => setMeetings(meetings.filter((m) => m.id !== id));

  return (
    <div>
      <PageHeader
        number="12"
        title="Meeting Notes"
        description="A running log of all project meetings — agenda, decisions, and action items in one place."
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{meetings.length} meetings logged</p>
          <button
            onClick={addMeeting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> New Meeting
          </button>
        </div>

        {meetings.map((m) => (
          <MeetingCard key={m.id} meeting={m} onRemove={() => removeMeeting(m.id)} />
        ))}
      </div>
    </div>
  );
}
