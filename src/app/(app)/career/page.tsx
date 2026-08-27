import { getJobApplications, getCourses, getCertificates, getCareerContacts } from "@/lib/data/career";
import { PageHeader } from "@/components/page-header";
import { CareerTabs } from "./career-tabs";

function Stat({
  value,
  label,
  urgent = false,
  sub,
}: {
  value: number;
  label: string;
  /** Color the value itself when it represents something needing attention
   * right now, matching Today's "6 overdue" treatment for its stat row. */
  urgent?: boolean;
  /** A related secondary count, folded under the main one instead of
   * getting its own tile — keeps the row from exceeding four choices. */
  sub?: { value: number; label: string };
}) {
  return (
    <div>
      <div className={`font-[family-name:var(--font-display)] text-5xl font-black leading-none ${urgent && value > 0 ? "text-vermillion" : "text-ink"}`}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">{label}</div>
      {sub && sub.value > 0 && (
        <div className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
          {sub.value} {sub.label}
        </div>
      )}
    </div>
  );
}

export default async function CareerPage() {
  const [applications, courses, certificates, contacts] = await Promise.all([
    getJobApplications(),
    getCourses(),
    getCertificates(),
    getCareerContacts(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const applicationsActive = applications.filter((a) => a.status !== "rejected" && a.status !== "archived").length;
  const interviewsUpcoming = applications.filter((a) => a.status === "interviewing").length;
  const coursesInProgress = courses.filter((c) => c.status === "in_progress").length;
  const followUpsDue =
    applications.filter((a) => a.next_follow_up && a.next_follow_up <= today).length +
    contacts.filter((c) => c.next_follow_up && c.next_follow_up <= today).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Career" context={`${applicationsActive} active applications`} />

      <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
        <Stat
          value={applicationsActive}
          label="Applications active"
          sub={{ value: interviewsUpcoming, label: "interviewing" }}
        />
        <Stat value={coursesInProgress} label="Courses in progress" />
        <Stat value={certificates.length} label="Certificates saved" />
        <Stat value={followUpsDue} label="Follow-ups due" urgent />
      </div>

      <div className="mt-8">
        <CareerTabs applications={applications} courses={courses} certificates={certificates} contacts={contacts} />
      </div>
    </div>
  );
}
