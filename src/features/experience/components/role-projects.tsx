import type { Role } from "../data";

/** The products or projects worked on in a role, as small pills under the company name. */
export function RoleProjects({ projects }: Pick<Role, "projects">) {
  if (!projects?.length) return null;

  return (
    <ul aria-label="Projects" className="mt-4 flex flex-wrap gap-2">
      {projects.map((project) => (
        <li
          key={project}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs tracking-wide text-zinc-300"
        >
          {project}
        </li>
      ))}
    </ul>
  );
}
