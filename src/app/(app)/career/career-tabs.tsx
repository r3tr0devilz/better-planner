"use client";

import { type KeyboardEvent, type ReactNode, useState } from "react";
import { ApplicationRow } from "@/components/application-row";
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

const ROW3_HEAD: Record<TabId, [string, string, string]> = {
  applications: ["Company / role", "Deadline", "Status"],
  courses: ["Course", "Platform", "Progress"],
  certificates: ["Certificate", "Issuer", "Earned"],
  contacts: ["Name", "Company", "Type"],
};

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
      className={active ? "relative" : "invisible absolute inset-0 pointer-events-none"}
    >
      {children}
    </div>
  );
}

function Row3Header({ tab }: { tab: TabId }) {
  const [a, b, c] = ROW3_HEAD[tab];
  return (
    <div className="row3 bg-ink/[0.04] font-mono text-[9px] uppercase tracking-wider text-ink-faint">
      <span>{a}</span>
      <span>{b}</span>
      <span>{c}</span>
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
  const [appsView, setAppsView] = useState<"board" | "table">("board");

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
      <div role="tablist" aria-label="Career sections" className="flex gap-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`career-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            aria-controls={`career-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            data-on={active === t.id}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            className="ctab"
          >
            {t.label}
          </button>
        ))}
      </div>

      <TabPanel id="career-panel-applications" labelledBy="career-tab-applications" active={active === "applications"}>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <CollapsibleForm action={createJobApplication} triggerLabel="New application" topMargin="">
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
          <div className="flex gap-1.5">
            <button type="button" data-on={appsView === "board"} onClick={() => setAppsView("board")} className="ctab">
              Board
            </button>
            <button type="button" data-on={appsView === "table"} onClick={() => setAppsView("table")} className="ctab">
              Table
            </button>
          </div>
        </div>

        {appsView === "board" ? (
          applications.filter((a) => a.status !== "archived").length > 0 || applications.length === 0 ? (
            <div className="mt-4">
              <KanbanBoard applications={applications} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-faint">Every application here is archived — switch to Table to see it.</p>
          )
        ) : (
          <div className="relative mt-4 border border-ink bg-panel/90">
            {applications.length > 0 && <Row3Header tab="applications" />}
            {applications.map((a) => (
              <ApplicationRow key={a.id} app={a} />
            ))}
            {applications.length === 0 && <p className="p-4 text-sm text-ink-faint">No applications yet — add one above.</p>}
          </div>
        )}
      </TabPanel>

      <div className="relative mt-3 border border-ink bg-panel/90">
        <TabPanel id="career-panel-courses" labelledBy="career-tab-courses" active={active === "courses"}>
          <div className="p-4">
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
          </div>
          {courses.length > 0 && <Row3Header tab="courses" />}
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
          {courses.length === 0 && <p className="p-4 pt-0 text-sm text-ink-faint">No courses yet — add one above.</p>}
        </TabPanel>

        <TabPanel id="career-panel-certificates" labelledBy="career-tab-certificates" active={active === "certificates"}>
          <div className="p-4">
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
          </div>
          {certificates.length > 0 && <Row3Header tab="certificates" />}
          {certificates.map((c) => (
            <CertificateCard key={c.id} certificate={c} />
          ))}
          {certificates.length === 0 && <p className="p-4 pt-0 text-sm text-ink-faint">No certificates yet — add one above.</p>}
        </TabPanel>

        <TabPanel id="career-panel-contacts" labelledBy="career-tab-contacts" active={active === "contacts"}>
          <div className="p-4">
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
          </div>
          {contacts.length > 0 && <Row3Header tab="contacts" />}
          {contacts.map((c) => (
            <CareerContactRow key={c.id} contact={c} />
          ))}
          {contacts.length === 0 && <p className="p-4 pt-0 text-sm text-ink-faint">No contacts yet — add one above.</p>}
        </TabPanel>
      </div>
    </div>
  );
}
