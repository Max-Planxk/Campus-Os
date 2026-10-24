import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Flame, GraduationCap, Zap, ShieldCheck } from 'lucide-react';

export function IntroAnimationPage({ onComplete }) {
  // Stages:
  // 1: "Want to be updated in your college first"
  // 2: "Introducing..."
  // 3: "BLAZING ANIMATION" (Fiery plasma shockwave, blazing embers, electric bursts)
  // 4: "CampusOS" grand reveal with glowing logo & enter button
  const [stage, setStage] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1 -> Stage 2 after 2.6s
    const t1 = setTimeout(() => {
      setStage(2);
    }, 2600);

    // Stage 2 -> Stage 3 (Blaze!) after 4.5s
    const t2 = setTimeout(() => {
      setStage(3);
    }, 4500);

    // Stage 3 -> Stage 4 (CampusOS reveal) after 6.6s
    const t3 = setTimeout(() => {
      setStage(4);
    }, 6600);

    // Auto-advance to login page after 10.5s
    const t4 = setTimeout(() => {
      handleEnter();
    }, 10800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className={`intro-wrapper ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Background Starry & Mesh Grid */}
      <div className="intro-stars" />
      <div className="intro-mesh-gradient" />

      {/* Top Bar with Skip */}
      <header className="intro-topbar">
        <div className="intro-badge">
          <Sparkles size={14} className="intro-badge-icon" />
          <span>Next-Gen University Platform</span>
        </div>
        <button
          type="button"
          className="intro-skip-btn"
          onClick={handleEnter}
          title="Skip straight to Login"
        >
          <span>Skip to Login</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* STAGE 1: "Want to be updated in your college first" */}
      {stage === 1 && (
        <div className="intro-stage stage-1-animate">
          <div className="stage-pill">
            <Zap size={16} />
            <span>Real-Time Academic Sync</span>
          </div>
          <h1 className="stage-1-title">
            Want to be updated in your college <span className="highlight-gradient">first?</span>
          </h1>
          <p className="stage-1-subtitle">
            Say goodbye to lost timetable changes, paper attendance, and fragmented messaging groups.
          </p>
          <div className="stage-pulse-ring" />
        </div>
      )}

      {/* STAGE 2: "Introducing..." */}
      {stage === 2 && (
        <div className="intro-stage stage-2-animate">
          <div className="stage-energy-gather">
            <div className="energy-core" />
            <div className="energy-ring ring-1" />
            <div className="energy-ring ring-2" />
          </div>
          <h2 className="stage-2-title">
            Introducing<span className="dot-pulse">...</span>
          </h2>
          <span className="stage-2-sub">The Unified Operating Standard</span>
        </div>
      )}

      {/* STAGE 3: THE BLAZING ANIMATION */}
      {stage === 3 && (
        <div className="intro-stage stage-3-blaze">
          <div className="blaze-canvas-container">
            {/* Blazing Shockwave Rings */}
            <div className="blaze-shockwave wave-1" />
            <div className="blaze-shockwave wave-2" />
            <div className="blaze-shockwave wave-3" />

            {/* Radiant Flame Rays */}
            <div className="flame-burst-core" />
            <div className="flame-ray ray-1" />
            <div className="flame-ray ray-2" />
            <div className="flame-ray ray-3" />
            <div className="flame-ray ray-4" />
            <div className="flame-ray ray-5" />
            <div className="flame-ray ray-6" />

            {/* Flying Ember Particles */}
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={`blaze-ember ember-${i % 8}`} />
            ))}
          </div>

          <div className="blaze-text-container">
            <div className="flame-icon-glow">
              <Flame size={48} className="flame-svg" />
            </div>
            <h2 className="blaze-ignite-title">IGNITING THE FUTURE</h2>
          </div>
        </div>
      )}

      {/* STAGE 4: GRAND REVEAL — "CampusOS" */}
      {stage === 4 && (
        <div className="intro-stage stage-4-reveal">
          <div className="reveal-ambient-glow" />

          <div className="reveal-logo-badge">
            <GraduationCap size={40} className="reveal-cap-icon" />
          </div>

          <h1 className="reveal-brand-title">
            Campus<span className="brand-accent">OS</span>
          </h1>

          <p className="reveal-tagline">
            The Unified University Operating System
          </p>

          <div className="reveal-features-pills">
            <div className="feature-pill">
              <span className="pill-dot" />
              <span>Real-Time Timetable</span>
            </div>
            <div className="feature-pill">
              <span className="pill-dot" />
              <span>Relational Database</span>
            </div>
            <div className="feature-pill">
              <span className="pill-dot" />
              <span>QR & Roll Attendance</span>
            </div>
            <div className="feature-pill">
              <span className="pill-dot" />
              <span>Clubs & Facility Bookings</span>
            </div>
          </div>

          <button
            type="button"
            id="btn-enter-campusos"
            className="enter-portal-btn primary-glow-enter"
            onClick={handleEnter}
          >
            <span>Enter CampusOS Portal</span>
            <ArrowRight size={18} />
          </button>

          <span className="auto-redirect-note">
            Proceeding to Portal automatically...
          </span>
        </div>
      )}

      {/* Progress Dots at bottom */}
      <div className="intro-progress-dots">
        <span className={`dot ${stage >= 1 ? 'active' : ''}`} />
        <span className={`dot ${stage >= 2 ? 'active' : ''}`} />
        <span className={`dot ${stage >= 3 ? 'active' : ''}`} />
        <span className={`dot ${stage >= 4 ? 'active' : ''}`} />
      </div>
    </div>
  );
}
