"use client";

import { type KeyboardEvent, type ReactNode, useState } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { CourseCard } from "@/components/course-card";
import { CertificateCard } from "@/components/certificate-card";
import { CareerContactRow } from "@/components/career-contact-row";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { createJobApplication, createCourse, createCertificate, createCareerContact } from "./actions";
import type { JobApplication, Course, Certificate, CareerContact } from "@/lib/supabase/types";

const TABS = [
  { id: "applications", label: "Applications" },
  { id: "courses", label: "Courses" },
  { id: "certificates", label: "Certificates" },
  { id: "contacts", label: "Contacts" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Panels stay mounted the whole time (visibility, not display) so a
 * first-mount reveal never replays just from switching tabs back and forth.
 * `inert` on the hidden ones is load-bearing, not decoration: visibility
 * alone already keeps their controls out of the Tab order, but `inert` also
 * pulls them out of the accessibility tree so a screen reader's virtual
 * cursor can't land on a panel that isn't showing. */
function TabPanel({ id, labelledBy, active, children }: { id: string; labelledBy: string; active: boolean; children: ReactNode }) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      inert={!active}
      className={active ? "" : "invisible absolute inset-0 pointer-events-none"}
    >
      {children}
    </div>
  );
}

export function CareerTabs({
  applications,
  courses,
  certificates,
  contacts,
}: {
  applications: JobApplication[];
  courses: Course[];
  certificates: Certificate[];
  contacts: CareerContact[];
}) {
  const [active, setActive] = useState<TabId>("applications");
  const activeIndex = TABS.findIndex((t) => t.id === active);

  function onTabKeyDown(e: KeyboardEvent, index: number) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const nextIndex = (index + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    const next = TABS[nextIndex];
    setActive(next.id);
    document.getElementById(`career-tab-${next.id}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Career sections"
        className="relative flex max-w-md gap-1 rounded-lg border border-line bg-stone p-1"
      >
        <div
          className="absolute inset-y-1 rounded-md bg-panel transition-transform duration-[180ms]"
          style={{
            width: `calc((100% - 0.75rem) / 4)`,
            transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
            transitionTimingFunction: "var(--ease-out)",
          }}
        />
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`career-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            aria-controls={`career-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            className={`relative z-10 min-w-0 flex-1 rounded-md px-1.5 py-1.5 text-center text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              active === t.id ? "text-ink" : "text-ink-faint hover:text-ink"
            }`}
          >
            <span className="block truncate">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="relative mt-6">
        <TabPanel id="career-panel-applications" labelledBy="career-tab-applications" active={active === "applications"}>
          <CollapsibleForm action={createJobApplication} triggerLabel="New application">
            <label className="field-wide">
              Company
              <input name="company" required placeholder="Stripe" className="field" />
            </label>
            <label className="field-wide">
              Role
              <input name="role" required placeholder="Frontend Engineer" className="field" />
            </label>
            <label>
              Deadline
              <input type="date" name="deadline" className="field" />
            </label>
            <label className="field-wide">
              Job link
              <input type="url" name="job_link" placeholder="https://…" className="field" />
            </label>
            <SubmitButton>Add</SubmitButton>
          </CollapsibleForm>
          <div className="mt-6">
            <KanbanBoard applications={applications} />
          </div>
        </TabPanel>

        <TabPanel id="career-panel-courses" labelledBy="career-tab-courses" active={active === "courses"}>
          <CollapsibleForm action={createCourse} triggerLabel="New course">
            <label className="field-wide">
              Course name
              <input name="name" required placeholder="Full-Stack React, AWS Solutions Architect…" className="field" />
            </label>
            <label>
              Platform
              <input name="platform" placeholder="Coursera, Udemy…" className="field" />
            </label>
            <label>
              Deadline
              <input type="date" name="deadline" className="field" />
            </label>
            <label className="field-wide">
              Course link
              <input type="url" name="course_link" placeholder="https://…" className="field" />
            </label>
            <SubmitButton>Add</SubmitButton>
          </CollapsibleForm>
          <div className="stagger-in mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {courses.map((c, i) => (
              <div key={c.id} style={{ transitionDelay: `${Math.min(i, 5) * 40}ms` }}>
                <CourseCard course={c} />
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm text-ink-faint">No courses yet — add one above.</p>}
          </div>
        </TabPanel>

        <TabPanel id="career-panel-certificates" labelledBy="career-tab-certificates" active={active === "certificates"}>
          <CollapsibleForm action={createCertificate} triggerLabel="New certificate">
            <label className="field-wide">
              Title
              <input name="title" required placeholder="AWS Certified Developer" className="field" />
            </label>
            <label>
              Issuer
              <input name="issuer" placeholder="Amazon Web Services" className="field" />
            </label>
            <label>
              Earned
              <input type="date" name="earned_date" className="field" />
            </label>
            <label className="field-wide">
              Credential link
              <input type="url" name="credential_link" placeholder="https://…" className="field" />
            </label>
            <label className="field-wide">
              Related skills (comma-separated)
              <input name="related_skills" placeholder="AWS, cloud architecture…" className="field" />
            </label>
            <SubmitButton>Add</SubmitButton>
          </CollapsibleForm>
          <div className="stagger-in mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {certificates.map((c, i) => (
              <div key={c.id} style={{ transitionDelay: `${Math.min(i, 5) * 40}ms` }}>
                <CertificateCard certificate={c} />
              </div>
            ))}
            {certificates.length === 0 && <p className="text-sm text-ink-faint">No certificates yet — add one above.</p>}
          </div>
        </TabPanel>

        <TabPanel id="career-panel-contacts" labelledBy="career-tab-contacts" active={active === "contacts"}>
          <CollapsibleForm action={createCareerContact} triggerLabel="New contact">
            <label className="field-wide">
              Name
              <input name="name" required placeholder="Name" className="field" />
            </label>
            <label>
              Relationship
              <select name="relationship_type" defaultValue="contact" className="field">
                <option value="recruiter">Recruiter</option>
                <option value="mentor">Mentor</option>
                <option value="referral">Referral</option>
                <option value="company_contact">Company contact</option>
                <option value="contact">Contact</option>
              </select>
            </label>
            <label>
              Company
              <input name="company" className="field" />
            </label>
            <SubmitButton>Add</SubmitButton>
          </CollapsibleForm>
          <div className="ledger stagger-in mt-6">
            {contacts.map((c) => (
              <CareerContactRow key={c.id} contact={c} />
            ))}
            {contacts.length === 0 && <p className="py-3 text-sm text-ink-faint">No contacts yet — add one above.</p>}
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
