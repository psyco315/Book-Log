import React from 'react'
import { motion } from 'motion/react'
import instagram from '../../assets/instagram.png'
import gmail from '../../assets/gmail.png'
import github from '../../assets/github.png'

import './about.css'

const About = () => {
  return (
    <div className="infoMain">
      <div>
        <motion.div
          className="infoBox"
        >
          {/* Left Side - About */}
          <motion.div
            className="aboutBox"
          >
            <div>
              <h2>
                About
              </h2>
              <div></div>
            </div>

            <div className="text-white">
              <p>
                Konichiwa mina san, I'm Parth (not japanese). I'm a student and I code for fun (and for corporate enslavement).
              </p>

              <p>
                BookStop was made lowkey to be shown on my resume but I realised that it can actually be deployed as an actual product and here we are.
              </p>

              <p>
                Whether you're looking to organize your reading list, discover your
                next great read, or simply keep track of the books you've enjoyed,
                BookStop is here to make your reading experience better (AI wrote this and I'm NOT sorry). 
              </p>
            </div>
          </motion.div>

          {/* Right Side - Contact Info */}
          <motion.div
            className="contactBox bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 relative overflow-hidden"
            // initial={{ opacity: 0, x: 50 }}
            // animate={{ opacity: 1, x: 0 }}
            // transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2>
              Get In Touch
            </h2>

            <div className="relative z-10">
              <motion.a
                href="mailto:parth2004batman@gmail.com"
                className="contactBtn flex items-center rounded-xl bg-gradient-to-r from-white/15 via-white/10 to-white/5 hover:from-white/25 hover:via-white/20 hover:to-white/10 transition-all duration-300 group backdrop-blur-lg border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className=" rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center relative z-10 border border-white/20">
                  <img src={gmail} alt="Gmail" className="filter drop-shadow-sm" />
                </div>
                <div className="relative z-10">
                  <p1 className="font-semibold text-white drop-shadow-sm">Gmail</p1>
                  <p2 className="text-white/80">parth2004batman@gmail.com</p2>
                </div>
              </motion.a>

              {/* GitHub */}
              <motion.a
                href="https://github.com/psyco315"
                target="_blank"
                rel="noopener noreferrer"
                className="contactBtn flex items-center rounded-xl bg-gradient-to-r from-white/15 via-white/10 to-white/5 hover:from-white/25 hover:via-white/20 hover:to-white/10 transition-all duration-300 group backdrop-blur-lg border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-slate-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className=" rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center relative z-10 border border-white/20">
                  <img src={github} alt="GitHub" className="filter drop-shadow-sm" />
                </div>
                <div className="relative z-10">
                  <p1 className="font-semibold text-white drop-shadow-sm">GitHub</p1>
                  <p2 className="text-white/80">@psyco315</p2>
                </div>
              </motion.a>

              {/* Instagram */}
              <motion.a
                href="https://instagram.com/psy.co_"
                target="_blank"
                rel="noopener noreferrer"
                className="contactBtn flex items-center rounded-xl bg-gradient-to-r from-white/15 via-white/10 to-white/5 hover:from-white/25 hover:via-white/20 hover:to-white/10 transition-all duration-300 group backdrop-blur-lg border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className=" rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center relative z-10 border border-white/20">
                  <img src={instagram} alt="Instagram" className="filter drop-shadow-sm" />
                </div>
                <div className="relative z-10">
                  <p1 className="font-semibold text-white drop-shadow-sm">Instagram</p1>
                  <p2 className="text-white/80">@psy.co_</p2>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default About