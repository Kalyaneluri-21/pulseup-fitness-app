import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import Header from "../components/Header";

// Local assets
import fitnessHero from "../assets/fitnesshero.jpg";
import yogaMaintain from "../assets/yogamaintain.jpg";
import dietPlan from "../assets/dietplan.jpg";
import trackProgress from "../assets/track progress.jpg";
import workoutPlan from "../assets/workoutplan.jpg";
import chatSystem from "../assets/chat system.jpg";
import lastPic from "../assets/lastpic.jpg"; // ✅ added this

const CARD_W = 320; // px width of each feature card
const GAP = 24; // px gap between cards
const SLIDE_MS = 700; // transition duration

const Home = () => {
  const theme = useSelector((state) => state.theme.theme);
  const isDark = theme === "dark";

  // Theme colors
  const bgPrimary = isDark ? "bg-[#0b132b]" : "bg-[#caf0f8]";
  const bgSecondary = isDark ? "bg-[#1c2541]" : "bg-[#ade8f4]";
  const textPrimary = isDark ? "text-white" : "text-black";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-700";
  const accentText = isDark ? "text-[#3a506b]" : "text-[#00b4d8]";

  // Features data
  const features = [
    { img: dietPlan, caption: "Personalized Diet Plans" },
    { img: trackProgress, caption: "Track Your Progress" },
    { img: workoutPlan, caption: "Custom Workout Plans" },
    { img: chatSystem, caption: "Real-time Chat with Buddies" },
  ];

  // Loop features for infinite scroll
  const loop = [...features, ...features];

  const [index, setIndex] = useState(0);
  const [instant, setInstant] = useState(false);

  // Auto advance
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Reset for seamless loop
  useEffect(() => {
    if (index >= features.length) {
      const t = setTimeout(() => {
        setInstant(true);
        setIndex(0);
        requestAnimationFrame(() => setInstant(false));
      }, SLIDE_MS + 10);
      return () => clearTimeout(t);
    }
  }, [index, features.length]);

  const trackStyle = {
    gap: `${GAP}px`,
    width: `${loop.length * (CARD_W + GAP) - GAP}px`,
    transform: `translateX(-${index * (CARD_W + GAP)}px)`,
    transition: instant ? "none" : `transform ${SLIDE_MS}ms ease-in-out`,
  };

  return (
    <div className={`${bgPrimary} min-h-screen`}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className={`text-5xl font-bold leading-tight ${textPrimary}`}>
            Fitness & <br />
            <span className={accentText}>Health Training</span>
          </h1>
          <p className={`mt-4 ${textSecondary}`}>
            Smarter training, data-driven fitness for everyone. Reach your goals
            with personalized programs designed just for you.
          </p>
          <p
            className={`mt-6 font-semibold underline cursor-pointer ${textPrimary}`}
          >
            Get Started →
          </p>
          <p
            className={`mt-2 font-semibold underline cursor-pointer ${textPrimary}`}
          >
            Learn More →
          </p>
        </div>
        <div>
          <img
            src={fitnessHero}
            alt="fitness-hero"
            className="rounded-2xl shadow-lg w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${bgSecondary} py-12`}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className={`text-3xl font-bold ${textPrimary}`}>120K+</h3>
            <p className={textSecondary}>Active Users</p>
          </div>
          <div>
            <h3 className={`text-3xl font-bold ${textPrimary}`}>4.8 ★</h3>
            <p className={textSecondary}>App Rating</p>
          </div>
          <div>
            <h3 className={`text-3xl font-bold ${textPrimary}`}>10K+</h3>
            <p className={textSecondary}>Workouts Completed</p>
          </div>
          <div>
            <h3 className={`text-3xl font-bold ${textPrimary}`}>100%</h3>
            <p className={textSecondary}>Client Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <h2 className={`text-3xl font-bold text-center mb-10 ${textPrimary}`}>
          PulseUp's Features
        </h2>

        <div
          className="mx-auto overflow-hidden"
          style={{ width: `${CARD_W * 3 + GAP * 2}px` }}
        >
          <div className="flex items-stretch" style={trackStyle}>
            {loop.map((item, i) => (
              <div
                key={`${item.caption}-${i}`}
                className="relative rounded-2xl shadow-xl overflow-hidden"
                style={{ width: `${CARD_W}px`, height: "240px" }}
              >
                <img
                  src={item.img}
                  alt={item.caption}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                  <p className="text-white text-lg md:text-xl font-bold drop-shadow">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className={`text-center mt-6 ${textSecondary}`}>
          • Diet planning • Progress tracking • Workouts • Real-time chat • and
          many more.
        </p>
      </section>

      {/* Move to Maintain Health */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <img
            src={yogaMaintain}
            alt="maintain-health"
            className="rounded-2xl shadow-lg w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className={`text-4xl font-bold ${textPrimary}`}>
            Move to Maintain your <br />
            <span className={accentText}>Health</span>
          </h2>
          <p className={`mt-4 ${textSecondary}`}>
            Build strength, improve flexibility, and maintain your overall
            health with structured training programs designed for every level.
          </p>
          <p
            className={`mt-6 font-semibold underline cursor-pointer ${textPrimary}`}
          >
            Start Training ASAP
          </p>
        </div>
      </section>

      {/* App Section */}
      <section className={`${isDark ? "bg-[#1c2541]" : "bg-white"} py-20`}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className={`text-4xl font-bold ${textPrimary}`}>
              Getting Started is <br /> Simple & Easy!
            </h2>
            <ul className={`mt-6 space-y-4 ${textSecondary}`}>
              <li>✅ Download the App</li>
              <li>✅ Create & Personalize</li>
              <li>✅ Track Your Progress</li>
            </ul>
            <p
              className={`mt-6 font-semibold underline cursor-pointer ${textPrimary}`}
            >
              Download App →
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={lastPic}
              alt="PulseUp Lifestyle"
              className="rounded-2xl shadow-2xl w-[90%] md:w-[70%] object-contain"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={`${bgSecondary} py-20`}>
        <div className="max-w-6xl mx-auto px-6 text-center mb-40" id="about">
          <h2 className={`text-4xl font-bold mb-6 ${textPrimary}`}>
            Why <span className={accentText}>PulseUp</span>?
          </h2>
          <p
            className={`max-w-3xl mx-auto text-lg leading-relaxed ${textSecondary}`}
          >
            PulseUp is more than just a fitness app – it’s your{" "}
            <span className={accentText}>
              all-in-one health & lifestyle companion
            </span>
            . Train smart, plan meals, follow the best diet, track every rep and
            step, chat in real time with buddies, exercise by your interests,
            and even shop the purest protein and our own{" "}
            <span className="font-semibold">PulseUp brand T-shirts</span>.
          </p>
          <p className={`mt-6 text-xl font-semibold ${textPrimary}`}>
            💪 Eat Clean. Train Smart. Connect Better. Live PulseUp.
          </p>
        </div>
      </section>

      {/* FOOTER Section */}
      <footer
        className={`py-10 px-8 md:px-20 text-center ${
          theme === "light"
            ? "bg-[#1c2541] text-white"
            : "bg-[#caf0f8] text-black"
        }`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-3">Contact Us</h3>
            <p>
              Email:{" "}
              <a
                href="mailto:elurikalyan21@gmail.com"
                className="hover:underline"
              >
                elurikalyan21@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a href="tel:6303476546" className="hover:underline">
                +91 6303476546
              </a>
            </p>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-xl font-bold mb-3">Our Address</h3>
            <p>House no-214</p>
            <p>Lakshmipuram, Guntur</p>
            <p>Guntur District, Andhra Pradesh, India</p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold mb-3">Connect With Us</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Kalyaneluri-21/pulseup-fitness-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/kalyana-chakravarthi-eluri/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-500 pt-4 text-sm">
          <p>
            © {new Date().getFullYear()} PulseUp Fitness Buddy. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
