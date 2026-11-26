import { OFFICIAL_TESTS, type SkillId } from "./official";

/** A list of real, official tests for the current skill (or all of them). */
export function OfficialTests({
  skill,
  title = "Real IELTS tests",
}: {
  skill?: SkillId;
  title?: string;
}) {
  const list = OFFICIAL_TESTS.filter((t) => !skill || t.skills.includes(skill));
  return (
    <section className="mx-card mx-official">
      <h2>{title}</h2>
      <p className="mx-note">
        These are the published tests from the people who write IELTS. They are not copied here, so
        you open them on their own pages.
      </p>
      <ul className="mx-official-list">
        {list.map((t) => (
          <li key={t.url}>
            <a href={t.url} target="_blank" rel="noopener noreferrer">
              {t.name}
            </a>
            <span className={`mx-cost ${t.cost === "Free" ? "free" : "paid"}`}>{t.cost}</span>
            <span className="mx-official-note">{t.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
