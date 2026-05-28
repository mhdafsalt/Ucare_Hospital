import React, { useState } from "react";
import "./Navbar.css";

function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (

    <header className="uc-navbar">

      <div className="uc-navbar-container">

        {/* LOGO */}

        <div className="uc-logo">

          <div className="uc-logo-image">
            <img src="./images/logo.png" alt="Ucare Logo" />
          </div>

        </div>

        {/* HAMBURGER */}

        <div
          className={`uc-hamburger ${menuOpen ? "uc-active-menu" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >

          <span></span>
          <span></span>
          <span></span>

        </div>

        {/* MENU */}

        <div className={`uc-menu-wrapper ${menuOpen ? "uc-show-menu" : ""}`}>

          <nav className="uc-nav-links">

            <a href="#Home">Home</a>

            <a href="#About">About</a>

            <a href="#Services">Services</a>

            <a href="#footer">Contact</a>

          </nav>

          <a href="/login">

            <button className="uc-start-btn">
              Get Start
            </button>

          </a>

        </div>

      </div>

    </header>

  );
}

export default Navbar;



// import React, { useState, useEffect } from "react";
// import "./Navbar.css";

// function Navbar() {

//   const [menuOpen, setMenuOpen] = useState(false);

//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const [userRole, setUserRole] = useState("");

//   /* =========================
//      CHECK LOGIN
//   ========================= */

//   useEffect(() => {

//     const checkLogin = () => {

//       const token = localStorage.getItem("token");
//       const role = localStorage.getItem("userRole");

//       if (token) {
//         setIsLoggedIn(true);
//         setUserRole(role);
//       } else {
//         setIsLoggedIn(false);
//         setUserRole("");
//       }

//     };

//     checkLogin();

//     // AUTO UPDATE WHEN STORAGE CHANGES
//     window.addEventListener("storage", checkLogin);

//     return () => {
//       window.removeEventListener("storage", checkLogin);
//     };

//   }, []);

//   /* =========================
//      DASHBOARD ROUTE
//   ========================= */

//   const getDashboardRoute = () => {

//     if (userRole === "admin") {
//       return "/admin/dashboard";
//     }

//     if (userRole === "receptionist") {
//       return "/receptionist/add-patient";
//     }

//     if (userRole === "doctor") {
//       return "/doctor/dashboard";
//     }

//     if (userRole === "support") {
//       return "/support";
//     }

//     return "/login";
//   };

//   return (

//     <header className="navbar">

//       <div className="navbar-container">

//         {/* LOGO */}
//         <div className="logo">

//           <div className="logo-boxx">

//             <img
//               src="./images/logo.png"
//               alt="Ucare Logo"
//               className="logo-image"
//             />

//           </div>

//         </div>

//         {/* HAMBURGER */}
//         <div
//           className={`hamburger ${menuOpen ? "active" : ""}`}
//           onClick={() => setMenuOpen(!menuOpen)}
//         >

//           <span></span>
//           <span></span>
//           <span></span>

//         </div>

//         {/* MENU */}
//         <div className={`menu ${menuOpen ? "show-menu" : ""}`}>

//           <nav className="nav-links">

//             <a href="#Home">Home</a>

//             <a href="#About">About</a>

//             <a href="#Services">Services</a>

//             <a href="#footer">Contact</a>

//           </nav>

//           {/* BUTTON */}

//           <a href={getDashboardRoute()}>

//             <button className="appointment-btn">

//               {isLoggedIn ? "Start Work" : "Get Start"}

//             </button>

//           </a>

//         </div>

//       </div>

//     </header>

//   );
// }

// export default Navbar;