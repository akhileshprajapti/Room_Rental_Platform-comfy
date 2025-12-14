import React from 'react'
// import room from '../../assets/room.jpg } 
import Navbar from '../Header/Navbar'
import './HeroSection.css'

export default function HeroSection() {
  return (
    <section className='heroSection'>
      <Navbar/>
      <div className="overlay">
        <div className="hero-content">
          <div className='hero-text'>
          <h1>Switch to Smart Renting with Comfy</h1>
          <p>Verified PGs & Flats | No Brokerage | Free Guided Visits</p>
          </div>

          <div className="search-box">
            <div className="input-box">
              <label htmlFor="">Location</label>
              <input className='box' type="text" name="" id="" placeholder='Search for city'/>
            </div>
            <div className="input-box">
              <label htmlFor="">Property Type</label>
              <select className='box' name="" id="">
                <option value="">Select Property Type</option>
                <option value="">PG</option>
                <option value="">Flat</option>
              </select>
            </div>
            <div className="input-box">
              <label htmlFor="">Gender</label>
              <select className='box' name="" id="">
                <option value="">Select Gender</option>
                <option value="">Male</option>
                <option value="">Female</option>
              </select>
            </div>
            <div className='btn-box'>
              <button className='btn'>Search</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
