import './App.css'
import React from 'react';
import DashboardAdmin from './components/DashboardAdmin/Dashboard'
import Login from './components/Login/Login'
import Accueil from './components/Home/Accueil/Accueil'
import DashboardStagiaire from './components/DashboardStagiaire/DashboardStagiaire'
import DashboardEmployee from './components/DashboardEmployee/DashboardEmployee'
import ResetPasswordPage from './components/Login/ResetPasswordPage'



//import React router dom
import{
  createBrowserRouter,
  RouterProvider
}from 'react-router-dom'

//lets create a router
const router = createBrowserRouter([

  {
    path: '/',
    element:<div><Accueil/></div>
  },
  {
    path: '/login',
    element:<div><Login/></div>
  },
  {
    path: '/dashboardAdmin',
    element:<div><DashboardAdmin/></div>
  },
  {
    path: '/dashboardStagiaire',
    element:<div><DashboardStagiaire/></div>
  },
  {
    path: '/dashboardEmployee',
    element:<div><DashboardEmployee/></div>
  },
  {
    path: '/reset-password',
    element:<div><ResetPasswordPage/></div>
  }
])
function App() {

  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  );
  
}

export default App