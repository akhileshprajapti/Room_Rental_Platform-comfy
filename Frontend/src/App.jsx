
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Header/Navbar'
import AllRouter from './Router/Router'
import Pg from './page/Pg'
import LogIn from './page/Register/Login.jsx'
import Register from './page/Register/Register.jsx'
import AdminDashboard from './page/Admin/AdminDashboard.jsx'
import AddYourProperty from './page/Addpg/AddYourProperty.jsx'
import ListingDetails from './page/SingleListing/DetailedListing.jsx'
import Contact from './page/Contact/Contact.jsx'
import ForgotPassword from './page/ForgetPassword/ForgetPassword.jsx'
import ResetPassword from './page/ForgetPassword/ResetPassword.jsx'
import BookingPages from "./page/Booking/BookingPage.jsx"
import PaymentSuccess from './page/paymentSuccess/payment.jsx'
import Account from './page/Account/Account.jsx'


function App() {

  
  return (
    <>
     <Router>
      <Navbar/>
      <Routes>
        
        <Route path='/' element={<AllRouter/>} />
        <Route path='/Pg'  element={<Pg />}/>
        <Route path='/LogIn' element={<LogIn/>}/>
        <Route path='/SignIn' element={<Register/>}/>
        <Route path='/AdminDashboard' element={<AdminDashboard/>}/>
        <Route path='/AddYourProperty' element={<AddYourProperty/>}/>
        <Route path='/pg/:id' element={<ListingDetails/>}/>
        <Route path='/contact' element={<Contact/>} />
        <Route path='/forgetPassword' element={<ForgotPassword/>} />
        <Route path='/resetPassword' element= {<ResetPassword/>}/>
        <Route path='/bookinPage' element={<BookingPages/>}/>
        <Route path='/payment-success' element={<PaymentSuccess/>}/>
        <Route path='/Account' element={<Account/>}/>
      </Routes>
     </Router>
    </>
  )
}

export default App
