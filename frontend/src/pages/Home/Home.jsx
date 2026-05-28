import React from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";

import { motion } from "framer-motion";
import {
  FaUserDoctor,
  FaTruckMedical,
  FaCapsules,
} from "react-icons/fa6";
import Footer from "../../components/Footer/Footer";

function Home() {

  return (
    <div className="home">

      {/* HERO SECTION */}
      <div id="Home">
        <section className="hero">
          <Navbar />

          {/* NAVBAR */}



          {/* HERO CONTENT */}
          <div className="hero-container">

            <div className="hero-content">

              <h1>
                Your Health,
                <br />
                Our Greatest Priority
              </h1>

              <p>
                A modern healthcare platform delivering trusted medical
                services, intelligent patient management, on-demand doctor consultations,
                and personalized healthcare experiences.
              </p>

               <a href="/login"><button className="hero-btn">
                Get Start →
              </button></a>

            </div>

          </div>

        </section>
      </div>



      <div id="About">
        <section className="about">
          <div className="about-wrapper">

            {/* LEFT ROUND ANIMATION */}
            <motion.div
              className="about-Round-container"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="about-Round"></div>
              <div className="about-Round"></div>
              <div className="about-Round"></div>
            </motion.div>

            {/* RIGHT SIDE */}
            <motion.div
              className="about-content"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <span className="about-tag">
                ABOUT OUR HOSPITAL
              </span>

              <h2>
                Providing World-Class Quality <span> Healthcare
                  Services </span> With Compassion, Trust, <span>
                  Advanced Medical Technology
                </span>
              </h2>

              <p>
                At Ucare Hospital, we are committed to delivering exceptional healthcare services with modern medical technology and highly experienced professionals. Our mission is to ensure every patient receives personalized care in a safe and comfortable environment. We believe in combining innovation with humanity by providing accurate diagnosis, effective treatments, and continuous medical support for patients of all ages.

                Our dedicated team of doctors, nurses, and healthcare specialists work together to provide compassionate and patient-centered care across multiple medical departments. From preventive healthcare and emergency services to advanced surgical procedures and rehabilitation support, Ucare Hospital focuses on improving the overall well-being of every patient while maintaining the highest standards of medical excellence and trust.
              </p>

              <motion.button
                className="about-btn"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>

            </motion.div>

          </div>
        </section>
      </div>


      <div className="arrow-container">
        <img
          src="./images/arrow.png"
          alt="Arrow"
          className="arrow"
        />
      </div>





      <div id="Services">
        <section className="services">

          {/* TITLE */}
          <motion.div
            className="services-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="about-Round-container">
              <div className="about-Round"></div>
              <div className="about-Round"></div>
              <div className="about-Round"></div>
            </div>

            <p className="services-subtitle">
              OUR SERVICES
            </p>

            <h2 className="services-title">
              PROVIDING ADVANCED <br />
              HEALTHCARE SOLUTIONS
            </h2>
          </motion.div>

          {/* 3 COLUMNS */}
          <div className="services-container">

            {/* CARD 1 */}
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <img
                src="./images/medical.jpg"
                alt="Medical Treatment"
                className="service-image"
              />

              <div className="service-content">
                <h3>Medical Treatment</h3>

                <p>
                  Expert healthcare services with modern
                  technology and compassionate care.
                </p>
              </div>
            </motion.div>

            {/* CARD 2 */}
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <img
                src="./images/emergency.jpg"
                alt="Emergency Care"
                className="service-image"
              />

              <div className="service-content">
                <h3>Emergency Care</h3>

                <p>
                  24/7 emergency support with doctors
                  and advanced equipment.
                </p>
              </div>
            </motion.div>

            {/* CARD 3 */}
            <motion.div
              className="service-card"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <img
                src="./images/pharmacy.jpg"
                alt="Pharmacy Service"
                className="service-image"
              />

              <div className="service-content">
                <h3>Pharmacy Service</h3>

                <p>
                  Fast and reliable pharmacy services with quality
                  medicines and support.
                </p>
              </div>
            </motion.div>

          </div>
        </section>
      </div>


     <Footer/>
    </div>
  );
}

export default Home;