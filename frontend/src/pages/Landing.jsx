import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const Landing = () => (
  <div className="min-h-screen flex flex-col bg-white">
    <Navbar />

    <main className="flex-1 flex items-center">
      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <div className="flex flex-col items-start text-left">
          {/* <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-ink-900 text-white text-sm font-semibold tracking-tight">
            L
          </span> */}

          <h1 className="mt-8 text-5xl sm:text-6xl font-semibold tracking-[-0.03em] text-ink-900 leading-[1.05]">
            Book library rooms!
            <br />
          </h1>

          <p className="mt-6 text-lg text-ink-600 max-w-xl leading-relaxed">
            Reserve reading halls, study rooms and conference spaces.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <Link to="/register" className="btn-primary">
              Get started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign in
            </Link>
          </div>

          <div className="mt-16 w-full max-w-md rounded-lg border border-ink-200 bg-ink-50/60 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-500 font-medium">
                Demo admin
              </p>
              <p className="mt-1 text-sm font-mono text-ink-800">
                admin@library.com
                <span className="text-ink-400"> · </span>
                admin123
              </p>
            </div>
            <Link
              to="/login"
              className="text-xs font-medium text-ink-900 hover:underline whitespace-nowrap"
            >
              Try it →
            </Link>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default Landing;
