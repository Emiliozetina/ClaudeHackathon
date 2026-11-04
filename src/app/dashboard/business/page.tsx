import Link from "next/link";
import { AppHeader, Avatar, Button, Chip, Icon, StatCard } from "@/components/ui";
import type { AvatarTone, ChipType } from "@/components/ui";

// Figma: Screens → "06 · Business dashboard" (9:271).
// Demo content mirrors the Figma screen until the dashboard API exists.

const stats = [
  { label: "Open tasks", value: "2", delta: "1 closing this week" },
  { label: "New applicants", value: "12", delta: "+5 since yesterday" },
  { label: "In progress", value: "1", delta: "Due Friday 14 Nov" },
  { label: "Spent this month", value: "£486", delta: "Across 2 completed tasks" },
];

type Row = {
  title: string;
  meta: string;
  status: { label: string; type: ChipType };
  applicants?: { label: string; highlight?: boolean };
  pay: string;
};

const tasks: Row[] = [
  {
    title: "Social media assistant",
    meta: "Posted 2 days ago · 2 weeks",
    status: { label: "Open", type: "success" },
    applicants: { label: "8 new", highlight: true },
    pay: "£13.50/hr",
  },
  {
    title: "Christmas menu photography",
    meta: "Posted 5 days ago · 3 days",
    status: { label: "Open", type: "success" },
    applicants: { label: "4" },
    pay: "£180 fixed",
  },
  {
    title: "Stock-take & inventory sheet",
    meta: "With Daniel R. · due 14 Nov",
    status: { label: "In progress", type: "teal" },
    pay: "£14.00/hr",
  },
  {
    title: "Window display design",
    meta: "Not published",
    status: { label: "Draft", type: "neutral" },
    pay: "£150 fixed",
  },
  {
    title: "Website copy refresh",
    meta: "Completed 28 Oct · ★ 5.0",
    status: { label: "Completed", type: "neutral" },
    pay: "£220 fixed",
  },
];

const applicants: { name: string; initials: string; tone: AvatarTone; task: string; match: string; type: ChipType }[] = [
  { name: "Amara Okafor", initials: "AO", tone: "teal", task: "Social media assistant", match: "2/2 required", type: "teal" },
  { name: "Kai Liu", initials: "KL", tone: "amber", task: "Christmas menu photography", match: "3/3 required", type: "teal" },
  { name: "Sophie Bell", initials: "SB", tone: "navy", task: "Social media assistant", match: "1/2 required", type: "warning" },
];

const thisWeek = [
  { date: "Fri 14", text: "Stock-take due · Daniel R." },
  { date: "Sat 21", text: "Applications close · Social media" },
];

const card = "rounded-lg border border-border-subtle bg-surface-card";

export default function BusinessDashboardPage() {
  return (
    <>
      <AppHeader
        role="business"
        account={{ name: "Tyne Brew Café", subtitle: "Business account", initials: "TB" }}
      />
      <main className="flex w-full flex-col gap-[32px] px-6 pb-[80px] pt-[40px] lg:px-[120px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-[6px]">
            <h1 className="type-h2 text-text-primary">Good morning, Jess</h1>
            <p className="type-body text-text-secondary">
              Wednesday 4 November · Here’s what’s happening with your tasks.
            </p>
          </div>
          <Button href="/tasks/new" size="lg" showArrow>
            Post a new task
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} />
          ))}
        </div>

        <div className="flex flex-col items-start gap-[24px] lg:flex-row">
          {/* Your tasks */}
          <section className={`${card} w-full min-w-0 flex-1 overflow-hidden`}>
            <div className="flex items-center justify-between px-[24px] py-[20px]">
              <h2 className="type-h4 text-text-primary">Your tasks</h2>
              <Button href="/dashboard/business/tasks" variant="ghost" showArrow>
                View all
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-navy-50">
                  <tr className="type-overline text-text-secondary">
                    <th className="px-[24px] py-[10px] font-semibold">TASK</th>
                    <th className="w-[136px] py-[10px] font-semibold">STATUS</th>
                    <th className="w-[126px] py-[10px] font-semibold">APPLICANTS</th>
                    <th className="w-[116px] py-[10px] font-semibold">PAY</th>
                    <th className="w-[48px] py-[10px]">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.title} className="h-[72px] border-t border-border-subtle">
                      <td className="px-[24px]">
                        <Link href="/dashboard/business/tasks" className="flex flex-col gap-[2px]">
                          <span className="type-label text-text-primary">{t.title}</span>
                          <span className="type-caption text-text-secondary">{t.meta}</span>
                        </Link>
                      </td>
                      <td>
                        <Chip type={t.status.type}>{t.status.label}</Chip>
                      </td>
                      <td>
                        {t.applicants ? (
                          <span className="flex items-center gap-[6px]">
                            <Icon name="users-5b6472-16" />
                            <span
                              className={`type-body-sm ${t.applicants.highlight ? "text-teal-700" : "text-text-secondary"}`}
                            >
                              {t.applicants.label}
                            </span>
                          </span>
                        ) : (
                          <span className="type-body-sm text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="type-body-sm text-text-primary">{t.pay}</td>
                      <td>
                        <Link href="/dashboard/business/tasks" aria-label={`Open ${t.title}`}>
                          <Icon name="chev-6b7280-20" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Side column */}
          <aside className="flex w-full shrink-0 flex-col gap-[24px] lg:w-[400px]">
            <section className={`${card} flex flex-col gap-[16px] p-[24px]`}>
              <div className="flex items-center justify-between">
                <h2 className="type-h4 text-text-primary">Recent applicants</h2>
                <Button href="/dashboard/business/applications" variant="ghost">
                  See all
                </Button>
              </div>
              <ul className="flex flex-col gap-[16px]">
                {applicants.map((a) => (
                  <li key={a.name} className="flex items-center gap-[12px]">
                    <Avatar initials={a.initials} tone={a.tone} size={40} />
                    <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                      <span className="type-label text-text-primary">{a.name}</span>
                      <span className="type-caption truncate text-text-secondary">{a.task}</span>
                    </div>
                    <Chip type={a.type}>{a.match}</Chip>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex gap-[14px] rounded-lg bg-amber-100 p-[20px]">
              <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-amber-500">
                <Icon name="bulb-633806-18" />
              </span>
              <div className="flex flex-col gap-[4px]">
                <h2 className="type-label text-amber-900">Tip for better matches</h2>
                <p className="type-body-sm text-amber-900">
                  Keep required skills to the essentials. Students without preferred skills can still
                  apply — and often bring something new.
                </p>
              </div>
            </section>

            <section className={`${card} flex flex-col gap-[12px] p-[24px]`}>
              <h2 className="type-h4 text-text-primary">This week</h2>
              <ul className="flex flex-col gap-[12px]">
                {thisWeek.map((w) => (
                  <li key={w.date} className="flex items-center gap-[12px]">
                    <span className="type-label-sm rounded-sm bg-navy-50 px-[10px] py-[6px] text-text-primary">
                      {w.date}
                    </span>
                    <span className="type-body-sm text-text-primary">{w.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
