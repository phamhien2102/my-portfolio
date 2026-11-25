export const SITE = {
  name: "Raymond Pham",
  role: "Senior Mobile Developer · React Native & ReactJS",
  title: "Raymond Pham | Senior Mobile Developer",
  description:
    "Portfolio of Raymond Pham, a senior mobile developer building mobile and web products.",
  email: "phamhien2102@gmail.com",
  website: "https://hienpt.dev",
  /**
   * The address the site is actually served from. hienpt.dev redirects to it, so share previews must
   * use it: a link-preview crawler that is sent from the image address to a redirect often gives up.
   */
  origin: "https://www.hienpt.dev",
  availability: "Available for new projects",
  socials: [
    { label: "GitHub", href: "https://github.com/phamhien2102" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/hien-pham-a6787319a/" },
  ],
  nav: [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ],
  /** The full resume, opened in a new tab from the navigation. */
  resume: { label: "Resume", href: "/resume" },
} as const;
