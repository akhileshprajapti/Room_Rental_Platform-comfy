import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../components/Css/Choose.css";

gsap.registerPlugin(ScrollTrigger);

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  const items = [
    {
      title: "Sell Faster",
      desc: "Get your property sold quickly with our smart system.",
      content: "Our platform connects you with genuine users actively searching for PG accommodations, reducing waiting time and increasing visibility. With features like real-time inquiries, easy listing management, and secure booking options, you can close deals faster and manage everything seamlessly in one place."
    },
    {
      title: "No Hidden Fees",
      desc: "Transparent pricing with zero surprises.",
      content:"We provide a detailed breakdown of every fee upfront, so you can make informed decisions without confusion. There are no last-minute additions during the booking process, giving you complete peace of mind. Whether it’s listing your property or booking a PG, every transaction is straightforward and honest."
    },
    {
      title: "Direct Buyers",
      desc: "Connect directly with serious buyers.",
      content:"Connect directly with serious buyers without any middlemen or delays. Our platform ensures that your property reaches genuine users who are actively looking for PG accommodations.You can communicate instantly, discuss details, and finalize deals faster with direct interaction. This not only saves time but also builds trust between owners and tenants."
    },
    {
      title: "Full Support",
      desc: "We guide you through the entire process.",
      content:"We guide you through every step of the process, from listing your property to successfully closing the deal. Our platform is designed to make your experience smooth, simple, and hassle-free.Whether you need help creating your listing, managing inquiries, or understanding bookings, our support system is always ready to assist you."
    },
  ];

  useEffect(() => {
    const cards = cardsRef.current;

    // INITIAL STATE
    gsap.set(cards, {
      y: 700, // start from bottom
      rotation: () => gsap.utils.random(-4, 4), // random tilt
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=2500",
        scrub: 0.5,
        pin: true,
      },
    });

    cards.forEach((card, i) => {
      // CURRENT CARD COMES FROM BELOW
      tl.to(
        card,
        {
          y: i * 25, // small stack offset
          rotation: gsap.utils.random(-2, 2),
          duration: 1,
          ease: "power2.out",
        },
        i,
      );

      // ONLY MOVE THE IMMEDIATE PREVIOUS CARD
      if (i > 0) {
        tl.to(
          cards[i - 1],
          {
            y: (i - 1) * 25 - 40, // slight push up
            duration: 1,
            ease: "power2.out",
          },
          i,
        );
      }
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div className="" style={{padding: '16px', backgroundColor: '#071c0d',}}>
      <section className="pk-section" ref={sectionRef}>
        {/* LEFT TEXT */}
        <div className="pk-left">
          <h2>
            WHY TO <br /> CHOOSE <br/>
            <span style={{fontStyle: 'italic', fontWeight: '600'}}>OUR PLATFORM?</span>
          </h2>
          <p>
            A smarter, faster and more transparent way to manage your rentals. and keep things more sufficient for students than ever.
          </p>
        </div>

        {/* RIGHT STACK */}
        <div className="pk-right">
          {items.map((item, i) => (
            <div
              key={i}
              className="pk-card"
              ref={(el) => (cardsRef.current[i] = el)}
              style={{
                zIndex: i + 1,
              }}
            >
              <h2 className="content">{item.content}</h2>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
