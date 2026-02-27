import Generales from './pages/generales';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { isTokenValid } from './hooks/tokenUtils';

const PrivateRoute = ({ children }) => {
  return children;
  const tokenValid = isTokenValid();
  if (!tokenValid) {
    sessionStorage.clear();
    return window.location.href = 'https://track.milac.com.mx/Warehouse/dashboardRequest50';
  }
  const isAuthenticated = sessionStorage.getItem('token');
  //return children;
  return isAuthenticated ? children : window.location.href = 'https://track.milac.com.mx/Warehouse/dashboardRequest50';
}

function App() {
  return (
    <div>
      <Router basename='/CentroCostos'>
        <Routes>
          <Route path='/' element={<PrivateRoute><Generales /></PrivateRoute>} />
          <Route path='/generales' element={<PrivateRoute><Generales /></PrivateRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
