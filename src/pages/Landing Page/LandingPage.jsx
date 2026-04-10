import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const NAV_LINKS = [
  { label: "Features",     id: "features"    },
  { label: "How it works", id: "how-it-works" },
  { label: "Pricing",      id: "pricing"      },
  { label: "Reviews",      id: "reviews"      },
];

const FEATURES = [
  {
    color: "rgba(129,140,248,.12)",
    iconColor: "#818cf8",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    title: "Instant ingestion",
    desc: "Drop PDFs, DOCXs, or TXTs. Alura parses and indexes every paper in under 10 seconds.",
  },
  {
    color: "rgba(16,185,129,.1)",
    iconColor: "#10b981",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    title: "Contradiction detection",
    desc: "Surfaces conflicting claims, methodology variances, and statistical oppositions automatically.",
  },
  {
    color: "rgba(245,158,11,.1)",
    iconColor: "#f59e0b",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "Idea generator",
    desc: "Transforms research clusters into actionable innovation concepts and startup hypotheses.",
  },
  {
    color: "rgba(239,68,68,.1)",
    iconColor: "#ef4444",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    title: "Knowledge graph",
    desc: "Interactive node explorer that maps relationships, themes, and citations across your corpus.",
  },
  {
    color: "rgba(129,140,248,.12)",
    iconColor: "#818cf8",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Contextual chat",
    desc: "Ask anything about your uploaded papers. Get cited, grounded answers — never hallucinations.",
  },
  {
    color: "rgba(16,185,129,.1)",
    iconColor: "#10b981",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Private & secure",
    desc: "Your data never trains our models. End-to-end encrypted, GDPR compliant, fully private.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Upload your research",
    desc: "Drag in any combination of PDFs, DOCXs, or plain text files. Alura's Gravity Well handles the rest — no formatting required.",
  },
  {
    num: "2",
    title: "AI analyzes and synthesizes",
    desc: "Our models extract key claims, identify themes, and map relationships across your entire corpus in seconds.",
  },
  {
    num: "3",
    title: "Explore the unified interface",
    desc: "Navigate your knowledge through four lenses: Summaries, Contradictions, Knowledge Graph, and Idea Generator — all in one screen.",
  },
  {
    num: "4",
    title: "Discover and act on insights",
    desc: "Export summaries, share idea clusters with your team, or continue exploring with our AI chat — grounded entirely in your papers.",
  },
];

const TESTIMONIALS = [
  {
    avatarBg: "rgba(129,140,248,.2)",
    avatarColor: "#a5b4fc",
    initials: "PR",
    name: "Priya Rajan",
    role: "PhD Candidate, MIT",
    text: "I uploaded 60 papers for my literature review and had a complete synthesis map in under 3 minutes. Alura found contradictions my advisor missed for two years.",
  },
  {
    avatarBg: "rgba(16,185,129,.15)",
    avatarColor: "#10b981",
    initials: "JS",
    name: "James Sato",
    role: "Director of R&D, BioVentures",
    text: "Our team went from spending two weeks on competitive analysis to two hours. The idea generator alone has paid for the subscription 10x over.",
  },
  {
    avatarBg: "rgba(245,158,11,.1)",
    avatarColor: "#f59e0b",
    initials: "AL",
    name: "Amara Lindqvist",
    role: "Senior Analyst, Oxford Policy Lab",
    text: "The knowledge graph is genuinely unlike anything I've seen. Seeing how my 80 papers connect visually changed the entire direction of my research.",
  },
];

const FOOTER_COLS = [
  {
    heading: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Security", "GDPR"],
  },
];

/* ── Alura Logo ── */
const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="url(#alura-grad)"/>
    <path d="M16 9.5l-5.5 11.5H13l1.2-2.5h3.6L19 21h2.5L16 9.5z" fill="white"/>
    <circle cx="16" cy="13" r="1.5" fill="white" opacity="0.6"/>
    <defs>
      <linearGradient id="alura-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818cf8"/>
        <stop offset="1" stopColor="#4f46e5"/>
      </linearGradient>
    </defs>
  </svg>
);

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lp">

      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo" onClick={() => scrollTo("hero")} style={{ cursor: "pointer" }}>
          <div className="lp-nav-logo-icon"><LogoIcon /></div>
          <span className="lp-nav-logo-text">Alura</span>
        </div>
        <ul className="lp-nav-links">
          {NAV_LINKS.map(({ label, id }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(id); }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button className="lp-nav-cta" onClick={() => navigate("/upload")}>
          Get Started Free
        </button>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="lp-hero">
        <div className="lp-hero-badge">
          <div className="lp-hero-badge-dot" />
          AI-Powered Research Intelligence
        </div>
        <h1 className="lp-hero-h1">
          Your research,<br /><span>finally unified</span>
        </h1>
        <p className="lp-hero-sub">
          Alura turns fragmented PDFs and papers into a living knowledge graph — synthesizing insights, surfacing contradictions, and generating ideas in seconds.
        </p>
        <div className="lp-hero-actions">
          <button className="lp-btn-primary" onClick={() => navigate("/upload")}>
            Start for free →
          </button>
          <button className="lp-btn-secondary" onClick={() => scrollTo("how-it-works")}>
            See how it works
          </button>
        </div>

        {/* Mock UI preview */}
        <div className="lp-hero-preview">
          <div className="lp-preview-topbar">
            <div className="lp-preview-dot" style={{ background: "#ff5f57" }} />
            <div className="lp-preview-dot" style={{ background: "#febc2e" }} />
            <div className="lp-preview-dot" style={{ background: "#28c840" }} />
            <span className="lp-preview-url">app.alura.io</span>
          </div>
          <div className="lp-preview-inner">
            <div className="lp-preview-sidebar">
              {["Dashboard", "Upload", "Knowledge Graph", "Contradictions", "Idea Generator", "Settings"].map((item, i) => (
                <div key={item} className={`lp-p-nav-item${i === 0 ? " active" : ""}`}>
                  <div className="lp-p-nav-dot" />
                  {item}
                </div>
              ))}
            </div>
            <div className="lp-preview-main">
              {[
                { label: "Papers ingested", val: "47",  sub: "↑ 8 this week",  fill: "#818cf8", w: "72%" },
                { label: "Insights found",  val: "312", sub: "↑ 24 today",     fill: "#10b981", w: "58%" },
                { label: "Ideas generated", val: "19",  sub: "3 high-impact",  fill: "#f59e0b", w: "40%" },
              ].map((c) => (
                <div className="lp-p-card" key={c.label}>
                  <div className="lp-p-card-label">{c.label}</div>
                  <div className="lp-p-card-val">{c.val}</div>
                  <div className="lp-p-card-sub">{c.sub}</div>
                  <div className="lp-p-bar">
                    <div className="lp-p-bar-fill" style={{ width: c.w, background: c.fill }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics ── */}
      <div className="lp-metrics">
        <div className="lp-metrics-inner">
          {[
            { val: "14,000+", label: "Researchers onboarded" },
            { val: "2.4M",    label: "Papers processed" },
            { val: "98%",     label: "Accuracy on synthesis tasks" },
          ].map((m) => (
            <div key={m.label}>
              <div className="lp-metric-val"><span>{m.val}</span></div>
              <div className="lp-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div id="features" className="lp-section">
        <div className="lp-section-label">Features</div>
        <h2 className="lp-section-title">Everything you need to<br />dominate your domain</h2>
        <p className="lp-section-sub">Six core capabilities built for researchers, analysts, and teams who take knowledge seriously.</p>
        <div className="lp-feat-grid">
          {FEATURES.map((f) => (
            <div className="lp-feat-card" key={f.title}>
              <div className="lp-feat-icon" style={{ background: f.color, color: f.iconColor }}>
                {f.icon}
              </div>
              <div className="lp-feat-title">{f.title}</div>
              <div className="lp-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div id="how-it-works" className="lp-steps-section">
        <div className="lp-section-label">How it works</div>
        <h2 className="lp-section-title">From chaos to clarity<br />in four steps</h2>
        <div className="lp-step-list">
          <div className="lp-step-line" />
          {STEPS.map((s, i) => (
            <div className="lp-step-item" key={s.num} style={{ paddingBottom: i === STEPS.length - 1 ? 0 : undefined }}>
              <div className="lp-step-num">{s.num}</div>
              <div className="lp-step-content">
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing ── */}
      <div id="pricing" className="lp-section" style={{ textAlign: "center" }}>
        <div className="lp-section-label">Pricing</div>
        <h2 className="lp-section-title">Simple, transparent pricing</h2>
        <p className="lp-section-sub" style={{ margin: "0 auto" }}>
          Free forever for individuals. Teams and enterprise plans coming soon.
        </p>
      </div>

      {/* ── Testimonials / Reviews ── */}
      <div id="reviews" className="lp-testi-section">
        <div className="lp-section-label">Social proof</div>
        <h2 className="lp-section-title">Loved by researchers<br />worldwide</h2>
        <div className="lp-testi-grid">
          {TESTIMONIALS.map((t) => (
            <div className="lp-testi-card" key={t.name}>
              <div className="lp-testi-stars">★★★★★</div>
              <p className="lp-testi-text">"{t.text}"</p>
              <div className="lp-testi-author">
                <div className="lp-testi-avatar" style={{ background: t.avatarBg, color: t.avatarColor }}>
                  {t.initials}
                </div>
                <div>
                  <div className="lp-testi-name">{t.name}</div>
                  <div className="lp-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="lp-cta-section">
        <div className="lp-cta-inner">
          <div className="lp-hero-badge" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
            <div className="lp-hero-badge-dot" />
            Start in under 60 seconds
          </div>
          <h2 className="lp-cta-title">Ready to unlock your research?</h2>
          <p className="lp-cta-sub">
            Join 14,000+ researchers who have already transformed how they understand knowledge with Alura. Free forever for individuals.
          </p>
          <button className="lp-btn-primary lp-btn-large" onClick={() => navigate("/upload")}>
            Get started free →
          </button>
          <p className="lp-cta-note">No credit card required. Cancel anytime.</p>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <div className="lp-nav-logo">
              <div className="lp-nav-logo-icon"><LogoIcon /></div>
              <span className="lp-nav-logo-text">Alura</span>
            </div>
            <p>A private harbor for your intellectual capital. AI-powered research synthesis for the modern knowledge worker.</p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div className="lp-footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <span className="lp-footer-copy">© 2024 Alura Inc. All rights reserved.</span>
          <div className="lp-footer-legal">
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
