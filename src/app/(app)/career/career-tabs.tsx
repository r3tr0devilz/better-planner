"use client";

import { type ReactNode, useState } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { CourseCard } from "@/components/course-card";
import { CertificateCard } from "@/components/certificate-card";
import { CareerContactRow } from "@/components/career-contact-row";
import { CollapsibleForm } from "@/components/collapsible-form";
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
 * first-mount reveal never replays just from switching tabs back and forth. */
function TabPanel({ active, children }: { active: boolean; children: ReactNode }) {
  return <div className={active ? "" : "invisible absolute inset-0 pointer-events-none"}>{children}</div>;
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

  return (
    <div>
      <div className="relative flex max-w-md gap-1 rounded-lg border border-line bg-stone p-1">
        <div
          className="absolute inset-y-1 rounded-md bg-panel transition-transform duration-[180ms]"
          style={{
            width: `calc((100% - 0.75rem) / 4)`,
            transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
            transitionTimingFunction: "var(--ease-out)",
          }}
        />
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`relative z-10 flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors ${
              active === t.id ? "text-ink" : "text-ink-faint hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mt-6">
        <TabPanel active={active === "applications"}>
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
            <button type="submit" className="btn">
              Add
            </button>
          </CollapsibleForm>
          <div className="mt-6">
            <KanbanBoard applications={applications} />
          </div>
        </TabPanel>

        <TabPanel active={active === "courses"}>
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
            <button type="submit" className="btn">
              Add
            </button>
          </CollapsibleForm>
          <div className="stagger-in mt-6 grid gap-3 sm:grid-cols-2">
            {courses.map((c, i) => (
              <div key={c.id} style={{ transitionDelay: `${Math.min(i, 5) * 40}ms` }}>
                <CourseCard course={c} />
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm text-ink-faint">No courses yet — add one above.</p>}
          </div>
        </TabPanel>

        <TabPanel active={active === "certificates"}>
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
            <button type="submit" className="btn">
              Add
            </button>
          </CollapsibleForm>
          <div className="stagger-in mt-6 grid gap-3 sm:grid-cols-2">
            {certificates.map((c, i) => (
              <div key={c.id} style={{ transitionDelay: `${Math.min(i, 5) * 40}ms` }}>
                <CertificateCard certificate={c} />
              </div>
            ))}
            {certificates.length === 0 && <p className="text-sm text-ink-faint">No certificates yet — add one above.</p>}
          </div>
        </TabPanel>

        <TabPanel active={active === "contacts"}>
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
            <button type="submit" className="btn">
              Add
            </button>
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
