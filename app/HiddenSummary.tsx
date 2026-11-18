import { asset } from "./asset";
import { ABOUT, PROJECTS, RESUME } from "./terminal/content";

// The same content as the terminal, available in the page's HTML to screen readers
// and search engines without playing the zoom. Its links appear on keyboard focus.
export default function HiddenSummary() {
  return (
    <section className="summary" aria-label="Site summary">
      <h2 className="visually-hidden">About</h2>
      <p className="visually-hidden">
        {ABOUT.name}. {ABOUT.summary}
      </p>
      <h2 className="visually-hidden">Projects</h2>
      <ul>
        {PROJECTS.map((project) => (
          <li key={project.file}>
            <a className="summary-link" href={project.url}>
              {project.title}
            </a>
            <span className="visually-hidden"> {project.about}</span>
          </li>
        ))}
      </ul>
      <h2 className="visually-hidden">Resume</h2>
      <a className="summary-link" href={asset(RESUME.path)} download={RESUME.filename}>
        Download resume
      </a>
    </section>
  );
}
