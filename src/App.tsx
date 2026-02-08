import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import Catalog from '@/pages/Catalog';
import Piloting from '@/pages/Piloting';
import SeoAnalysis from '@/pages/SeoAnalysis';

function App() {
  return (
    <Router>
       <Layout>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/piloting" element={<Piloting />} />
            <Route path="/seo-analysis" element={<SeoAnalysis />} />
            <Route path="/seo-analysis/:id" element={<SeoAnalysis />} />
          </Routes>
       </Layout>
    </Router>
  );
}

export default App;
