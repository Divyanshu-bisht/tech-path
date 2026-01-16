import { useEffect, useState, useRef } from "react";
import "./App.css";
import Popup from "../components/Popup.jsx";
import "../components/bott/bot.css";
import BotCanvas from "../components/bott/BotCanvas.jsx";

function App() {
  /* -----------------------------
     NORMAL CONTENT POPUP STATE
     Used for "Learn more", "View more", footer links, etc.
  ------------------------------ */
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: "", content: "" });

  /* -----------------------------
     REVIEW SYSTEM STATE
     reviewMode   -> whether review flow is active
     reviewStep   -> which step of review user is on
     reviewTriggeredRef -> ensures review triggers only once
  ------------------------------ */
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);
  const reviewTriggeredRef = useRef(false);

  /* -----------------------------
     CHECKPOINT TRACKING
     Each flag turns true when user
     explicitly interacts with that section
  ------------------------------ */
  const [checkpoints, setCheckpoints] = useState({
    supportViewed: false,
    courseViewed: false,
    idealCandidateViewed: false,
    footerViewed: false,
  });

  /* -----------------------------
     REVIEW INTRO CONTENT
     First message shown by the bot
  ------------------------------ */
  const reviewIntro = {
    text: "Before you go, let’s quickly review what you might have missed.",
    button: "Start review",
  };

  /* -----------------------------
     REVIEW STEPS CONFIG
     Each step:
     - maps to a checkpoint key
     - scrolls to a section if missed
     - shows contextual guidance
  ------------------------------ */
  const reviewSteps = [
    {
      key: "supportViewed",
      selector: "#outcomes",
      text:
        "You may have missed the section explaining how career support works. This is where we show how learning here connects to real job opportunities, guidance, and placement help after the course.",
      button: "Next",
    },
    {
      key: "courseViewed",
      selector: "#curriculum",
      text:
        "You didn’t get a chance to explore the curriculum in detail. Taking a closer look helps you understand what skills you’ll build, how the learning is structured, and what to expect week by week.",
      button: "Next",
    },
    {
      key: "idealCandidateViewed",
      selector: "#ideal-candidate",
      text:
        "You might not have reviewed whether this program aligns with your background and current situation. This part helps you decide if the pace, commitment, and learning style are right for you.",
      button: "Next",
    },
    {
      key: "footerViewed",
      selector: "#footer",
      text:
        "You may have skipped the policies and contact information at the bottom. These sections explain important details like support channels, terms, and what you can expect from us going forward.",
      button: "Finish",
    },
  ];

  /* -----------------------------
     OPEN NORMAL POPUP
     Also marks checkpoint as viewed
     when popup is related to review logic
  ------------------------------ */
  const openPopup = (title, content, checkpointKey) => {
    if (checkpointKey) {
      setCheckpoints((prev) => ({
        ...prev,
        [checkpointKey]: true,
      }));
    }

    setPopupContent({ title, content });
    setIsPopupOpen(true);
  };

  /* -----------------------------
     FULL SCROLL DETECTION
     Triggers review mode when user
     reaches ~100% scroll for the first time
  ------------------------------ */
  useEffect(() => {
    const handleFullScroll = () => {
      if (reviewMode) return;
      if (reviewTriggeredRef.current) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      const scrolledPercent = (scrollTop + windowHeight) / docHeight;

      if (scrolledPercent >= 0.99) {
        reviewTriggeredRef.current = true;
        setReviewMode(true);
        setReviewStep(0);
      }
    };

    window.addEventListener("scroll", handleFullScroll);
    return () => window.removeEventListener("scroll", handleFullScroll);
  }, [reviewMode]);

  /* -----------------------------
     SMOOTH ANCHOR SCROLL
     + Navbar style change on scroll
     (left unchanged intentionally)
  ------------------------------ */
  useEffect(() => {
    const anchors = document.querySelectorAll('a[href^="#"]');

    const handleClick = (e) => {
      e.preventDefault();
      const target = document.querySelector(
        e.currentTarget.getAttribute("href")
      );
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    anchors.forEach((anchor) => anchor.addEventListener("click", handleClick));

    const handleScroll = () => {
      const navbar = document.getElementById("navbar");
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      anchors.forEach((anchor) =>
        anchor.removeEventListener("click", handleClick)
      );
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* -----------------------------
     SCROLL LOCK
     Prevents user from manually scrolling
     during review guidance
  ------------------------------ */
  useEffect(() => {
    document.body.style.overflow = reviewMode ? "hidden" : "auto";
  }, [reviewMode]);

  /* -----------------------------
     AUTO-SCROLL REVIEW LOGIC
     - Skips already viewed checkpoints
     - Scrolls to missed sections
  ------------------------------ */
  useEffect(() => {
    if (!reviewMode || reviewStep === 0) return;

    const step = reviewSteps[reviewStep - 1];
    if (!step) return;

    if (checkpoints[step.key]) {
      setReviewStep((s) => s + 1);
      return;
    }

    const el = document.querySelector(step.selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [reviewStep, reviewMode]);

  /* -----------------------------
     CURRENT STEP DERIVATION
  ------------------------------ */
  const currentStep = reviewSteps[reviewStep - 1];

  /* -----------------------------
     DID USER REVIEW ANYTHING?
     Used to decide final thank-you message
  ------------------------------ */
  const reviewedAnything =
    checkpoints.supportViewed &&
    checkpoints.courseViewed &&
    checkpoints.idealCandidateViewed &&
    checkpoints.footerViewed;

  return (
    <>
      <BotCanvas />

      {/* --------------------------------
         BOT REVIEW POPUP (NON-MODAL)
         Lives visually near the bot
      -------------------------------- */}
      {reviewMode && (
        <div className="bot-review-popup">
          {reviewStep === 0 ? (
            <>
              <p className="bot-review-text">{reviewIntro.text}</p>
              <button
                className="bot-review-button"
                onClick={() => setReviewStep(1)}
              >
                {reviewIntro.button}
              </button>
            </>
          ) : currentStep ? (
            <>
              <p className="bot-review-text">{currentStep.text}</p>
              <button
                className="bot-review-button"
                onClick={() => {
                  if (reviewStep >= reviewSteps.length) {
                    setReviewStep(reviewSteps.length + 1);
                  } else {
                    setReviewStep((s) => s + 1);
                  }
                }}
              >
                {currentStep.button}
              </button>
            </>
          ) : (
            <>
              <p className="bot-review-text">
                {reviewedAnything
                  ? "Thanks for taking the time to review the full experience — you didn’t miss anything, and we appreciate your thoughtful approach."
                  : "Thank you for spending time here. Sometimes important details slip by — reviewing gives you the chance to notice what supports better decisions."}
              </p>

              <button
                className="bot-review-button"
                onClick={() => {
                  setReviewMode(false);
                  setReviewStep(0);
                }}
              >
                Thank you
              </button>
            </>
          )}
        </div>
      )}

      {/* NORMAL POPUP (UNCHANGED) */}
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title={popupContent.title}
      >
        <p className="popup-text">{popupContent.content}</p>
        <button className="popup-button" onClick={() => setIsPopupOpen(false)}>
          Got it!
        </button>
      </Popup>

      {/* Navbar */}
      <nav className="navbar" id="navbar">
        <div className="navbar-content">
          <div className="logo">TechPath</div>
          <ul className="nav-links">
            <li>
              <a href="#outcomes">Outcomes</a>
            </li>
            <li>
              <a href="#curriculum">Curriculum</a>
            </li>
            <li>
              <a href="#testimonials">Reviews</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#pricing" className="nav-cta">
                Apply Now
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Launch Your Tech Career
            <br />
            in Just 16 Weeks
          </h1>
          <p className="hero-subtitle">
            Job-ready skills, dedicated career support, and outcomes you can
            trust
          </p>

          <div className="trust-badges">
            {[
              "Google",
              "Microsoft",
              "Amazon",
              "Meta",
              "Adobe",
              "Flipkart",
              "+",
            ].map((b) => (
              <div className="badge" key={b}>
                {b}
              </div>
            ))}
          </div>

          <a href="#pricing" className="cta-primary">
            Start Your Journey
          </a>
        </div>
      </section>

      {/* Outcomes */}
      <section className="outcomes" id="outcomes">
        <div className="container">
          <h2 className="section-title">Real Results, Real Careers</h2>

          <div className="stats-grid">
            <Stat number="94%" label="Job Placement Rate" />
            <Stat number="$87k" label="Average Starting Salary" />
            <Stat number="2,400+" label="Successful Graduates" />
          </div>

          <p className="support-description">
            Our dedicated career team provides one-on-one coaching, interview
            preparation, and direct introductions to hiring partners.
            <span
              className="read-more"
              onClick={() =>
                openPopup(
                  "Our Support",
                  "Our dedicated career support team works closely with you throughout the program and beyond.                        You’ll receive one-on-one career coaching tailored to your goals, including resume and portfolio reviews, LinkedIn optimization, and personalized job search strategies.          We provide structured interview preparation with mock technical and behavioral interviews, real-time feedback, and guidance on how to approach coding challenges and system design questions.                                         You’ll also gain access to our hiring partner network through direct introductions, referrals, and curated job opportunities—helping you transition confidently into your first tech role.",
                  "supportViewed"
                )
              }
            >
              {" "}
              Learn more about our support →
            </span>
          </p>
        </div>
      </section>

      {/* Curriculum */}
      <section className="curriculum" id="curriculum">
        <div className="container">
          <h2 className="section-title">Your Learning Journey</h2>

          <div className="curriculum-grid">
            <Module
              title="Weeks 1-4: Foundations"
              duration="4 weeks"
              description="Master the fundamentals of web development."
              tech={["HTML5", "CSS3", "JavaScript", "Git"]}
              more="View more"
              onMoreClick={() =>
                openPopup(
                  "Weeks 1–4: Foundations",
                  "You’ll learn HTML, CSS, JavaScript, Git, browser fundamentals, semantic markup, responsive layouts, and version control workflows.",
                  "courseViewed"
                )
              }
            />
            <Module
              title="Weeks 5-10: Advanced Development"
              duration="6 weeks"
              description="Build applications with React and Node.js."
              tech={["React", "Node.js", "PostgreSQL", "REST APIs"]}
              more="View more"
              onMoreClick={() =>
                openPopup(
                  "Weeks 5–10: Advanced Development",
                  "You’ll build dynamic frontends with React, manage state, work with APIs, develop backend services using Node.js, handle authentication, and design relational databases.",
                  "courseViewed"
                )
              }
            />
            <Module
              title="Weeks 11-14: Professional Projects"
              duration="4 weeks"
              description="Create portfolio-ready projects."
              tech={["AWS", "Docker", "CI/CD", "Testing"]}
              more="View more"
              onMoreClick={() =>
                openPopup(
                  "Weeks 11–14: Professional Projects",
                  "You’ll work on real-world projects, deploy applications to the cloud, use Docker for containerization, implement CI/CD pipelines, and follow industry best practices.",
                  "courseViewed"
                )
              }
            />
            <Module
              title="Weeks 15-16: Career Launch"
              duration="2 weeks"
              description="Interview prep and hiring connections."
              tech={["Algorithms", "System Design", "Mock Interviews"]}
              more="View more"
              onMoreClick={() =>
                openPopup(
                  "Weeks 15–16: Career Launch",
                  "You’ll prepare for technical and behavioral interviews, practice data structures and algorithms, learn system design fundamentals, build resumes, and get direct hiring support.",
                  "courseViewed"
                )
              }
            />
          </div>

          <div className="ideal-candidate" id="ideal-candidate">
            <h3>Who This Program Is For</h3>
            <ul>
              <li>Career changers</li>
              <li>Recent graduates</li>
              <li>Self-taught developers</li>
              <li>40–50 hours/week commitment</li>
              <li>Basic computer proficiency</li>
            </ul>
            <span
              className="ideal-more"
              onClick={() =>
                openPopup(
                  "Who This Program Is For",
                  "This program is ideal for motivated learners who want to build a career in tech.\n\nIt’s well-suited for career changers, recent graduates, and self-taught developers who are ready to commit consistent time and effort.\n\nBecause the program is intensive, participants should be able to dedicate 40–50 hours per week and have basic computer proficiency.",
                  "idealCandidateViewed"
                )
              }
            >
              Know more
            </span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-title">Success Stories</h2>

          <div className="testimonial-grid">
            <Testimonial
              initials="SK"
              name="Sarah Kim"
              role="Stripe"
              quote="The curriculum was structured, practical, and easy to follow. The career support helped me feel confident in interviews."
            />
            <Testimonial
              initials="MP"
              name="Marcus Peterson"
              role="Shopify"
              quote="I was self-taught but felt stuck. This program gave me clarity, real projects, and accountability."
            />
            <Testimonial
              initials="JR"
              name="Jessica Rodriguez"
              role="Meta"
              quote="The mentors and mock interviews made a huge difference. I felt job-ready by the end of the program."
            />
            <Testimonial
              initials="FH"
              name="Frederik Hansen"
              role="Amazon"
              quote="The 16-week structure kept me focused and consistent. It was intense, but absolutely worth it."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="container">
          <h2 className="section-title">Investment in Your Future</h2>

          <div className="pricing-card">
            <div className="price">$500</div>

            <p className="price-description">
              Complete program with job placement support
            </p>

            <ul className="features-list">
              <li>16-week intensive curriculum</li>
              <li>Dedicated career coach</li>
              <li>Portfolio projects</li>
              <li>Interview preparation</li>
              <li>Hiring partner introductions</li>
            </ul>

            <span
              className="cta-primary"
              onClick={() => {
                setReviewMode(true);
                setReviewStep(0);
              }}
            >
              Apply Now
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container" id="footer">
          <div className="footer-links">
            <span
              onClick={() =>
                openPopup(
                  "Privacy Policy",
                  "We respect your privacy and are committed to protecting your personal information.\n\nAny data you share with us—such as your name or email address—is used only to provide our services, communicate with you, and improve your experience.\n\nWe do not sell or share your personal information with third parties for marketing purposes.",
                  "footerViewed"
                )
              }
            >
              Privacy Policy
            </span>

            <span
              onClick={() =>
                openPopup(
                  "Terms of Service",
                  "By using our website and services, you agree to follow our program guidelines and policies.\n\nAll learning materials are provided for personal educational use only and may not be redistributed.\n\nWe reserve the right to update program details and policies when necessary.",
                  "footerViewed"
                )
              }
            >
              Terms of Service
            </span>

            <span
              onClick={() =>
                openPopup(
                  "Refund Policy",
                  "We offer a transparent and fair refund policy.\n\nIf you withdraw before the program begins, you may be eligible for a full or partial refund.\n\nOnce the program has started, refunds may be limited due to access to learning materials and mentorship.",
                  "footerViewed"
                )
              }
            >
              Refund Policy
            </span>

            <span
              onClick={() =>
                openPopup(
                  "Contact Us",
                  "Have questions or need support? We’re here to help.\n\nReach out to us for admissions, program details, or technical support.\n\nEmail us at support@techpath.com and our team will respond as soon as possible.",
                  "footerViewed"
                )
              }
            >
              Contact Us
            </span>
          </div>

          <div className="footer-bottom">
            © 2026 TechPath Bootcamp. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

function Stat({ number, label }) {
  return (
    <div className="stat-card">
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Module({ title, duration, description, tech, more, onMoreClick }) {
  return (
    <div className="module">
      <div className="module-header">
        <h3 className="module-title">{title}</h3>
        <span className="module-duration">{duration}</span>
      </div>

      <p className="module-description">{description}</p>

      <div className="tech-stack">
        {tech.map((t) => (
          <span key={t} className="tech-icon">
            {t}
          </span>
        ))}
      </div>

      <span className="module-more" onClick={onMoreClick}>
        {more}
      </span>
    </div>
  );
}

function Testimonial({ initials, name, role, quote }) {
  return (
    <div className="testimonial-card">
      <p className="quote">“{quote}”</p>
      <div className="testimonial-author">
        <div className="author-avatar">{initials}</div>
        <div className="author-info">
          <h4>{name}</h4>
          <p>{role}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
