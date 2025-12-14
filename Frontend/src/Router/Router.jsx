import React from 'react'
import HeroSection from '../components/HeroSection/HeroSection'
import Footer from '../components/Footer/Footer'
import WhyChooseUs from '../page/Choose'
import AdminDashboard from '../page/Admin/AdminDashboard'

export default function Router() {
  return (
    <div>
      <HeroSection/>
      <WhyChooseUs/>
      <Footer/>
      
    </div>
  )
}
