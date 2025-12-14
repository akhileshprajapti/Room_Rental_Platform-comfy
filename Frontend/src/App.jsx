
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import Navbar from './components/Header/Navbar'
import AllRouter from './Router/Router'
import Pg from './page/Pg'
import LogIn from './page/Register/Login.jsx'
import Register from './page/Register/Register.jsx'
import AdminDashboard from './page/Admin/AdminDashboard.jsx'
import AddYourProperty from './page/Addpg/AddYourProperty.jsx'
import ListingDetails from './page/SingleListing/DetailedListing.jsx'
import Contact from './page/Contact/Contact.jsx'


function App() {

  
  return (
    <>
     <Router>
      <Routes>
        
        <Route path='/' element={<AllRouter/>} />
        <Route path='/Pg'  element={<Pg />}/>
        <Route path='/LogIn' element={<LogIn/>}/>
        <Route path='/SignIn' element={<Register/>}/>
        <Route path='/AdminDashboard' element={<AdminDashboard/>}/>
        <Route path='/AddYourProperty' element={<AddYourProperty/>}/>
        <Route path='/pg/:id' element={<ListingDetails/>}/>
        <Route path='/contact' element={<Contact/>} />
      </Routes>
     </Router>
    </>
  )
}

export default App
