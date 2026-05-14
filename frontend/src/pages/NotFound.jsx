import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

const NotFound = () => (
  <Layout>
    <div className="text-center py-24">
      <p className="text-sm font-medium text-ink-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Page not found</h1>
      <p className="mt-2 text-ink-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-8 inline-flex">Go home</Link>
    </div>
  </Layout>
);

export default NotFound;
