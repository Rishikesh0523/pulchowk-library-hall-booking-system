import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white">
    <Navbar />
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </main>
    <Footer />
  </div>
);

export default Layout;
