const Footer = () => (
  <footer className="border-t border-ink-200">
    <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-ink-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p>© {new Date().getFullYear()} Library Booking</p>
      <p className="text-ink-400">React · Node · PostgreSQL · Docker</p>
    </div>
  </footer>
);

export default Footer;
