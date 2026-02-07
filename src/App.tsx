import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import Catalog from '@/pages/Catalog';
import Piloting from '@/pages/Piloting';

function App() {
  return (
    <Router>
       <Layout>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/piloting" element={<Piloting />} />
          </Routes>
       </Layout>
    </Router>
  );
}

export default App;
