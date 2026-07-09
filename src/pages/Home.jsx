import { useEffect } from "react";
import "../styles/site.css";
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import Services from "../components/Services.jsx";
import Doctors from "../components/Doctors.jsx";
import { Process, Numbers, Why } from "../components/Highlights.jsx";
import { Testimonials, Partners, News } from "../components/Social.jsx";
import Gallery from "../components/Gallery.jsx";
import Faq from "../components/Faq.jsx";
import Contact from "../components/Contact.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <Services />
      <Doctors />
      <Process />
      <Numbers />
      <Why />
      <Testimonials />
      <Partners />
      <News />
      <Gallery />
      <Faq />
      <Contact />
      <Footer />
    </>
  );
}
