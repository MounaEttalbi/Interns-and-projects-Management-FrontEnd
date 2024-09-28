import React from 'react';
import { motion } from 'framer-motion';
import { FaProjectDiagram, FaUserCheck, FaComments, FaFileAlt, FaBell } from 'react-icons/fa'; // Importer des icônes
import './Features.css';

const Features = () => {
    const featureVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div id="features-section" className="features-container">
            <motion.h6
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                Features of the Platform
            </motion.h6>
            <motion.ul
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.3 }}
            >
                <motion.li variants={featureVariants}>
                    <FaProjectDiagram className="feature-icon1" />
                    <strong>Project Management:</strong> Track and manage collaborative projects with ease.
                </motion.li>
                <motion.li variants={featureVariants}>
                    <FaUserCheck className="feature-icon2" />
                    <strong>Intern Tracking:</strong> Monitor the progress of interns in real-time.
                </motion.li>
                <motion.li variants={featureVariants}>
                    <FaComments className="feature-icon3" />
                    <strong>Communication:</strong> Chat and messaging features for smooth communication.
                </motion.li>
                <motion.li variants={featureVariants}>
                    <FaFileAlt className="feature-icon4" />
                    <strong>File Sharing:</strong> Share documents and files securely.
                </motion.li>
                <motion.li variants={featureVariants}>
                    <FaBell className="feature-icon5" />
                    <strong>Notifications:</strong> Stay updated with reminders and notifications.
                </motion.li>
            </motion.ul>
        </div>
    );
}

export default Features;
