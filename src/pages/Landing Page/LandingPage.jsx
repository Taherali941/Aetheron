import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Brain, LayoutDashboard, Network, ChevronRight } from "lucide-react";
import "./LandingPage.css";

/* ── Framer Motion variants ──────────────────────────────── */
const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.15,
      when: "beforeChildren",
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ── Animated particle / starfield canvas ────────────────── */
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    let width = window.innerWidth;
    let height = document.documentElement.scrollHeight;

    canvas.width = width;
    canvas.height = height;

    const PARTICLE_COUNT = 160;
    const CONNECTION_DISTANCE = 120;

    const colors = [
      "rgba(0,242,255,",
      "rgba(0,102,255,",
      "rgba(0,242,255,",
      "rgba(255,255,255,",
    ];

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.6 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    }));

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.pulse += p.pulseSpeed;
        const pulsedAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${pulsedAlpha})`;
        ctx.fill();

        if (p.radius > 1.0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${pulsedAlpha * 0.15})`;
          ctx.fill();
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < CONNECTION_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,242,255,${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = document.documentElement.scrollHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="lp-particle-canvas" />;
}

/* ── Journey card ────────────────────────────────────────── */
function JourneyCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.12 }}
      whileHover={{ scale: 1.02 }}
      className="lp-card"
      data-testid={`journey-card-${index}`}
    >
      <div className="lp-card-hover-bg" />
      <div className="lp-card-body">
        <div className="lp-card-icon-wrap">
          <Icon className="lp-card-icon" />
        </div>
        <h3 className="lp-card-title">{title}</h3>
        <p className="lp-card-desc">{description}</p>
      </div>
    </motion.div>
  );
}

/* ── Landing page ────────────────────────────────────────── */
export default function LandingPage() {
  // Swapped wouter useLocation for react-router-dom useNavigate
  const navigate = useNavigate();

  return (
    <div className="lp-root">

      {/* Animated particle / starfield background */}
      <ParticleBackground />

      {/* Dark blue radial corner gradients */}
      <div className="lp-grad-top-left" />
      <div className="lp-grad-bottom-right" />
      <div className="lp-grad-center" />

      {/* ── Hero ── */}
      <section className="lp-hero">
        <motion.div
          className="lp-hero-inner"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={childVariants} className="lp-hero-label-wrap">
            <span className="lp-hero-label">
              Unifying Fragmented Knowledge
            </span>
          </motion.div>

          <motion.h1 variants={childVariants} className="lp-hero-title">
            COGNITIVE SANCTUARY
          </motion.h1>

          <div className="lp-hero-bullets">
            <motion.div variants={childVariants} className="lp-bullet-row">
              <div className="lp-bullet-dot" />
              <p className="lp-bullet-text">
                Aetheron instantly synthesizes complex PDFs into clear, actionable knowledge.
              </p>
            </motion.div>
            <motion.div variants={childVariants} className="lp-bullet-row">
              <div className="lp-bullet-dot" />
              <p className="lp-bullet-text">
                Your data becomes a secure, private harbor for effortless deep understanding and innovation.
              </p>
            </motion.div>
          </div>

          <motion.div variants={childVariants}>
            <button
              className="lp-start-btn"
              onClick={() => navigate("/upload")}
              data-testid="button-start-now"
            >
              START NOW <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── User Journey ── */}
      <section className="lp-journey">
        <div className="lp-timeline-line">
          <div className="lp-timeline-pulse" />
        </div>

        <div className="lp-cards">
          <JourneyCard
            index={0}
            icon={Upload}
            title="USER JOURNEY 1: INGEST"
            description="Upload PDFs once. Aetheron's Gravity Well pulls fragments into a cohesive whole."
          />
          <JourneyCard
            index={1}
            icon={Brain}
            title="USER JOURNEY 2: ANALYZE & SYNTHESIZE"
            description="Our AI analyzes and synthesizes. The chaotic is structured."
          />
          <JourneyCard
            index={2}
            icon={LayoutDashboard}
            title="USER JOURNEY 3: THE UNIFIED INTERFACE"
            description="Exploration is central. Navigate four critical dimensions in one screen."
          />
          <JourneyCard
            index={3}
            icon={Network}
            title="USER JOURNEY 4: DISCOVER INSIGHTS"
            description="Chat, find Gaps, Generate Ideas, and summarize. Everything connected."
          />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <p className="lp-footer-text">
          © Aetheron Inc. 2024. All rights reserved. | Private Harbor for Your Intellectual Capital.
        </p>
      </footer>
    </div>
  );
}