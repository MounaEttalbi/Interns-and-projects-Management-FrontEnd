import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FaUser, FaEnvelope, FaLock, FaCalendarAlt, FaSchool } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
const MySwal = withReactContent(Swal);

const Login = () => {
  const [full_name, setFull_name] = useState('');
  const [start_date, setStart_date] = useState('');
  const [end_date, setEnd_date] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [stage_type, setStage_type] = useState('');
  const [speciality, setSpeciality] = useState('GI'); // Default specialty is GI
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [message, setMessage] = useState('');


  
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:8080/api/reset-password', { email: resetEmail });
        setMessage('If this email is registered, a reset link will be sent.');
    } catch (error) {
        setMessage('Error occurred. Please try again later.');
    }
};

  const handleSignIn = async () => {
    try {
        if (email === 'admin@gmail.com' && password === 'admin') {
            sessionStorage.setItem('role', 'admin');
            sessionStorage.setItem('userId', '1'); // ID de l'administrateur
            console.log('Admin signed in. Redirecting...');
            navigate('/dashboardAdmin');
            return;
        }

        const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
        const { id, email: userEmail, role, token, teamId } = response.data;

        console.log('Response data:', response.data);

        sessionStorage.setItem('userId', id);
        sessionStorage.setItem('email', userEmail);
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('teamId', teamId || '');  // Store teamId if available

        console.log('Stored in sessionStorage:', {
            userId: id,
            email: userEmail,
            authToken: token,
            teamId: teamId
        });

        if (role === 'stagiaire') {
            navigate('/dashboardStagiaire');
        } else if (role === 'employee') {
            navigate('/dashboardEmployee');
        } else {
            throw new Error('Invalid role');
        }
    } catch (error) {
        console.error('Invalid login', error);
        MySwal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid email or password',
            showConfirmButton: false,
            timer: 2000,
        });
    }
};



  const handleSignUp = () => {
    const user = { full_name, start_date, end_date, email, school, speciality, stage_type, password };

    fetch('http://localhost:8080/api/stagiaire/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('User registered:', data);
        MySwal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your account has been created successfully.',
          showConfirmButton: false,
          timer: 2000,
          background: '#ffffff',
          customClass: {
            popup: 'animated tada',
          },
        });
        setTimeout(() => {
          setIsActive(false);
        }, 2000);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="center-container">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">
        <div className="form-container sign-up">
          <form>
            <h1>Create Account</h1>
            <div className="input-div">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={full_name}
                onChange={(e) => setFull_name(e.target.value)}
              />
            </div>
            <div className="input-div">
              <FaCalendarAlt className="input-icon" />
              <input
                type="date"
                placeholder="Start Date"
                value={start_date}
                onChange={(e) => setStart_date(e.target.value)}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => (e.target.type = start_date ? 'date' : 'text')}
              />
            </div>
            <div className="input-div">
              <FaCalendarAlt className="input-icon" />
              <input
                type="date"
                placeholder="End Date"
                value={end_date}
                onChange={(e) => setEnd_date(e.target.value)}
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => (e.target.type = end_date ? 'date' : 'text')}
              />
            </div>
            <div className="input-div">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-div">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-div">
              <FaSchool className="input-icon" />
              <input
                type="text"
                placeholder="School"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
            <div className="input-div">
              <label></label>
              <select value={speciality} onChange={(e) => setSpeciality(e.target.value)}>
                <option value="GI">GI</option>
                <option value="GP">GP</option>
                <option value="Reseau">Reseau</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="input-div">
              <label></label>
              <select value={stage_type} onChange={(e) => setStage_type(e.target.value)}>
                <option value="PFA">PFA</option>
                <option value="PFE">PFE</option>
                <option value="Observation internship">Observation internship</option>
              </select>
            </div>
            <button type="button" onClick={handleSignUp}>Sign Up</button>
          </form>
        </div>
        <div className="form-container sign-in">
          <form>
            <h1>Sign In</h1>
            
            
            <br />
            <div className="input-div">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-div">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

        <div className="forgot-password-container">

            <a onClick={() => setShowResetPassword(true)} className="forgot-password-link">
                Forgot Your Password ?
            </a>
            
            {showResetPassword && (
           <div className="reset-password-form">
             <div className="cancel-icon" onClick={() => setShowResetPassword(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
             <h3>Reset Password</h3>
             <label htmlFor="resetEmail">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
               />
            <button onClick={handleResetPassword}>Send Reset Link</button>
            <p>{message}</p>
             </div>
          )}
       </div>


            <button type="button" onClick={handleSignIn}>Sign In</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of the site's features</p>
              <button className="hidden" onClick={() => setIsActive(false)} id="login">Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of the site's features</p>
              <button className="hidden" onClick={() => setIsActive(true)} id="register">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
