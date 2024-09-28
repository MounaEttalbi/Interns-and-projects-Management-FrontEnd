import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    setIsSubmitting(true);
    setErrorMessage(''); // Reset error message

    emailjs.sendForm('service_3lqjd7g', 'template_oyklilf', e.target, 'WHQ2l4QjgiwMSG6YF')
      .then((result) => {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' }); // Clear form
      }, (error) => {
        console.error('EmailJS error:', error.text); // Log error for debugging
        setErrorMessage('An error occurred, please try again.'); // Display error message to user
      })
      .finally(() => {
        setIsSubmitting(false); // Reset submitting state
      });
  };

  return (
    <div className="contact">
      <h1>Contact Us</h1>
      <p>If you have any questions or need support, feel free to reach out to us!</p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="from_name" // Correspond to the variable in your EmailJS template
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="from_email" // Correspond to the variable in your EmailJS template
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message" // Correspond to the variable in your EmailJS template
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <br />
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Project-Together. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Contact;
