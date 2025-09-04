import React from 'react'
import { motion } from 'motion/react'
import './getStarted.css'

// You'll need to add these icons to your assets folder
import searchIcon from '../../assets/search.png'
import bookIcon from '../../assets/list.png'
import trackIcon from '../../assets/status.webp'
import discoverIcon from '../../assets/discover.webp'
import profileIcon from '../../assets/profile.png'


const GetStarted = () => {
    const steps = [
        {
            id: 1,
            title: "Make an Account",
            description: "Pretty self explanatory?",
            icon: profileIcon,
            color: "from-orange-500/20 to-red-500/20"
        },
        {
            id: 2,
            title: "Search for Books",
            description: "To search for a book, either enter it's name or author's name. You can select whether to use it as book's name or author's name",
            icon: searchIcon,
            color: "from-blue-500/20 to-cyan-500/20"
        },
        {
            id: 3,
            title: "Track Your Progress",
            description: "Mark books as read, currently reading, put on hold, or want to read. Keep track of your reading journey and see your progress over time.",
            icon: trackIcon,
            color: "from-green-500/20 to-emerald-500/20"
        },
        {
            id: 4,
            title: "Add to Your List",
            description: "Found something interesting? Add it to your personal reading list with just one click. Keep track of books you want to read.",
            icon: bookIcon,
            color: "from-purple-500/20 to-pink-500/20"
        }
    ]

    return (
        <div className="getStartedMain">
            <div>
                <motion.div
                    className="getStartedContainer"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Header Section */}
                    <motion.div
                        className="getStartedHeader"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2>Get Started with BookStop</h2>
                        <div className="headerUnderline"></div>
                        <p>
                            Follow these simple steps to begin your reading journey with BookStop.
                            Organize your books, track your progress, and discover new favorites.
                        </p>
                    </motion.div>

                    {/* Steps Grid */}
                    <motion.div
                        className="stepsGrid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                className="stepCard"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                // whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`stepOverlay bg-gradient-to-br ${step.color}`}></div>

                                <div className="stepNumber">
                                    <span>{step.id}</span>
                                </div>

                                <div className="stepIcon">
                                    <img src={step.icon} alt={step.title} />
                                </div>

                                <div className="stepContent">
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Call to Action */}
                    {/* <motion.div
                        className="ctaSection"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <motion.button
                            className="ctaButton"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="ctaButtonOverlay"></div>
                            <span>Start Your Reading Journey</span>
                        </motion.button>

                        <p className="ctaSubtext">
                            Join thousands of readers who are already using BookStop to enhance their reading experience.
                        </p>
                    </motion.div> */}
                </motion.div>
            </div>
        </div>
    )
}

export default GetStarted