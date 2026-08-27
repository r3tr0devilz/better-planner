import { getJobApplications, getCourses, getCertificates, getCareerContacts } from "@/lib/data/career";
import { PageHeader } from "@/components/page-header";
import { CareerTabs } from "./career-tabs";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-[family-name:var(--font-display)] text-5xl font-black leading-none text-ink">{value}</div>
      <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">{label}</div>
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
        <Stat value={applicationsActive} label="Applications active" />
        <Stat value={interviewsUpcoming} label="Interviews upcoming" />
        <Stat value={coursesInProgress} label="Courses in progress" />
        <Stat value={certificates.length} label="Certificates saved" />
        <Stat value={followUpsDue} label="Follow-ups due" />
      </div>

      <div className="mt-8">
        <CareerTabs applications={applications} courses={courses} certificates={certificates} contacts={contacts} />
      </div>
    </div>
  );
}
