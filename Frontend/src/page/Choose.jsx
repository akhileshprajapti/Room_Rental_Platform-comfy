import React, { useState, useEffect, useCallback } from 'react';
import '../components/Css/Choose.css'; // Assuming you have a CSS file for styling

// Import your images
import verifiedListingsImage from '../assets/VerifiedListings.png';
import noBrokerageImage from '../assets/NoBrokerage.png';
import negotiationSystemImage from '../assets/NegotiationSystem.png';
import pgCaptionsImage from '../assets/PgCaption.png';
import easyBookingImage from '../assets/EasyBooking.png';
import rentalAgreementImage from '../assets/RentalSupport.png';

const WhyChooseUs = ({ cycleTime = 4000 }) => {
  // Define all the data for your list items outside the component body or use a useMemo hook
  // to prevent unnecessary re-creation on every render.
  const items = [
    {
      id: 'verifiedListings',
      text: 'Verified Listings',
      icon: '✅',
      image: verifiedListingsImage,
      description: {
        title: 'Verified Listings',
        points: [
          'High-quality, genuine properties',
          'Detailed checks for accuracy',
          'Peace of mind for renters',
        ],
      },
    },
    {
      id: 'noBrokerage',
      text: 'No Brokerage',
      icon: '🚫',
      image: noBrokerageImage,
      description: {
        title: 'No Brokerage Fees',
        points: [
          'Save money on agent commissions',
          'Direct dealing with owners',
          'Transparent pricing',
        ],
      },
    },
    {
      id: 'negotiationSystem',
      text: 'Negotiation System',
      icon: '🤝',
      image: negotiationSystemImage,
      description: {
        title: 'Negotiation System',
        points: [
          'Chat with owner',
          'Send price offers',
          'Instant reply & confirmation',
        ],
      },
    },
    {
      id: 'pgCaptions',
      text: 'Pg Captions',
      icon: '📝',
      image: pgCaptionsImage,
      description: {
        title: 'Detailed PG Captions',
        points: [
          'Comprehensive descriptions',
          'Highlighting key amenities',
          'Helping you make informed choices',
        ],
      },
    },
    {
      id: 'easyBooking',
      text: 'Easy Booking',
      icon: '📅',
      image: easyBookingImage,
      description: {
        title: 'Easy Booking Process',
        points: [
          'Simple and intuitive steps',
          'Secure payment options',
          'Confirm your rental quickly',
        ],
      },
    },
    {
      id: 'rentalAgreement',
      text: 'Rental Agreement Support',
      icon: '📄',
      image: rentalAgreementImage,
      description: {
        title: 'Rental Agreement Support',
        points: [
          'Assistance with legal documents',
          'Standardized agreements',
          'Ensuring fair terms for both parties',
        ],
      },
    },
  ];

  // 1. Change state management to track the index instead of the string ID.
  const [activeIndex, setActiveIndex] = useState(0); 

  // Use the index to find the current item
  const currentItem = items[activeIndex];

  // 2. Define the function that moves to the next item
  const goToNextItem = useCallback(() => {
    // Uses the modulo operator (%) to cycle back to 0 when it hits the end of the list
    setActiveIndex(prevIndex => (prevIndex + 1) % items.length);
  }, [items.length]);

  // 3. Use useEffect to set up the automatic interval
  useEffect(() => {
    // Set up the timer to call goToNextItem every 'cycleTime' milliseconds
    const intervalId = setInterval(goToNextItem, cycleTime);

    // Cleanup function: This stops the timer when the component unmounts or re-renders.
    return () => clearInterval(intervalId);
  }, [goToNextItem, cycleTime]);

  // 4. Handle manual clicks by updating the index directly
  const handleItemClick = (index) => {
    setActiveIndex(index);
    // The useEffect hook will reset the interval timer implicitly since the state changed.
  };

  return (
    <section className="why-choose-us-section">
      <h2>Why Choose Us?</h2>
      <div className="content-wrapper">
        <div className="list-container">
          {items.map((item, index) => (
            <div
              key={item.id}
              // Check activeIndex against the item's current index
              className={`list-item ${activeIndex === index ? 'active' : ''}`}
              // Update the state with the clicked item's index
              onClick={() => handleItemClick(index)}
            >
              <span className="icon">{item.icon}</span>
              <span className="text">{item.text}</span>
            </div>
          ))}
        </div>
        <div className="image-description-container">
          {currentItem && (
            <div className="image-card">
              {/* Adding 'key' here forces React to re-render the <img> tag, which helps if 
                  you add a CSS transition/animation (like fade-in) for the image change. */}
              <img 
                key={currentItem.id} 
                src={currentItem.image} 
                alt={currentItem.description.title} 
                className="display-image" 
              />
              <div className="description-overlay">
                <h3>{currentItem.description.title}</h3>
                <ul>
                  {currentItem.description.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;