import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlinePermContactCalendar } from 'react-icons/md';
import { IoLogOutOutline } from 'react-icons/io5';
import { FaCommentDots, FaSearch, FaBell } from 'react-icons/fa';
import { AiOutlineSend } from 'react-icons/ai'; // Importez l'icône de la bibliothèque des icônes ant-design
import { FaTachometerAlt, FaFolderOpen, FaTasks, FaUsers } from 'react-icons/fa'; // Importer les icônes appropriées
import {FaUserCircle} from 'react-icons/fa'
import { MdHistory } from 'react-icons/md';
import { BsQuestionCircle } from 'react-icons/bs';
import logo1 from '../../LoginAssets/logo.png';
import './DashboardStagiaire.scss';
import WelcomeStagiaire from './WelcomeStagiaire';
import InternProfile from "./InternProfile";
import Team from './Team';
import ChatTeam from "./ChatTeam";
import TaskBoard from "./TaskBoard";
import Dashboard from "./Dashboard";
import Reporting from './Reporting'
import Project from './Project'
import Notification from "../DashboardAdmin/Notification";

const Sidebar = ({ setActiveView, setShowLogoutConfirmation }) => {
  const handleClick = (event, view) => {
    event.preventDefault();
    setActiveView(view);
  };

  const handleLogoutClick = (event) => {
    event.preventDefault();
    setShowLogoutConfirmation(true);
  };

  return (
    <div className='sideBar grid'>
      <div className='logoDiv flex'>
        <img src={logo1} alt="logo" />
        <h2 className="dashH2">Project-Together</h2>
      </div>

      <div className='menuDiv'>
      <h3 className='divTitle title'>Quick MENU</h3>
      <ul className='menuLists grid'>
        <li className='listItem'>
          <a href="#" className='menuLink flex' onClick={(e) => handleClick(e, 'Dashboard')}>
            <FaTachometerAlt className='icon icons' />
            <span className='smallText'>Dashboard</span>
          </a>
        </li>
        <li className='project'>
          <a href="#" className='menuLink flex' onClick={(e) => handleClick(e, 'Project')}>
            <FaFolderOpen className='icon icons' />
            <span className='smallText'>My Project</span>
          </a>
        </li>
        <li className='task'>
          <a href="#" className='menuLink flex' onClick={(e) => handleClick(e, 'Task')}>
            <FaTasks className='icon icons' />
            <span className='smallText'>Tasks</span>
          </a>
        </li>
        <li className='listItem'>
          <a href="#" className='menuLink flex' onClick={(e) => handleClick(e, 'Team')}>
            <FaUsers className='icon icons' />
            <span className='smallText'>Team</span>
          </a>
        </li>
      </ul>
    </div>
      <div className='settingsDiv'>
        <h3 className='divTitle titl'>Settings</h3>
        <ul className='menuLists grid'>
          <li className='listItem'>
            <a href="#" className='menuLink flex'onClick={(e) => handleClick(e, 'ChatTeam')}>
              <FaCommentDots className='icon icons'/>
              <span className='smallText'>Chat</span>
            </a>
          </li>
          <li className='listItem'>
   <a href="#" className='menuLink flex' onClick={(e) => handleClick(e, 'Reporting')}>
    <AiOutlineSend className='icon icons'/> {/* Nouvelle icône */}
    <span className='smallText'>Reporting</span>
  </a>
</li>

          <li className='listItem'>
            <a href="#" className='menuLink flex' onClick={(e) => handleClick(e, 'ProfileIntern')}>
              <MdOutlinePermContactCalendar className='icon icons'/>
              <span className='smallText'>Profile</span>
            </a>
          </li>
          <li className='listItem'>
            <a href="#" className='menuLink flex' onClick={handleLogoutClick}>
              <IoLogOutOutline className='icon icons'/>
              <span className='smallText'>Logout</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="sideBarCard">
        <BsQuestionCircle className='icon'/>
        <div className="cardContent">
          <div className="circle1"></div>
          <div className="circle1"></div>

          <h3>Help Center</h3>
          <p>Having trouble in ProjectTogether, please contact us for more questions.</p>
          <button className="btnhelp">Go to help center.</button>
        </div>
      </div>
    </div>
  );
}

const Top = ({ notificationCount ,searchQuery, handleSearchChange,onNotificationClick,showNotifications, notifications }) => {
  return (
    <div className='topBar'>
      <div className='searchContainer'>
        <FaSearch className='searchIcon' />
        <input type='text' placeholder='Search...' className='searchInput' 
        value={searchQuery}
        onChange={handleSearchChange} // Gestion de l'événement de changement
        />
      </div>
      <div className="notificationAdminContainer" onClick={onNotificationClick}>
  <FaBell className="bellIconAdmin" />
  {notificationCount > 0 && (
    <div className="notificationCountAdmin">
      {notificationCount}
    </div>
  )}
  <div className={`notificationsListAdmin ${showNotifications ? 'show' : ''}`}>
    {notifications.length === 0 ? (
      <div className="noNotificationsMessage">
        No new notifications
      </div>
    ) : (
      notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.isRead ? 'read' : 'unread'}`}>
          <div className="notificationMessage">
            {notification.message}
          </div>
          <div className="notificationTime">
            {new Date(notification.timestamp).toLocaleString()} {/* Affichage du temps */}
          </div>
        </div>
      ))
    )}
  </div>
</div>
      
      <div className='profileContainer profileIcon'>
      <FaUserCircle className='userIcon' size={49} color="white" />
      </div>
    </div>
  );
};

const LogoutConfirmation = ({ setShowLogoutConfirmation }) => {
  const handleConfirm = () => {
    // Perform logout operation here
    window.location.href = "/";
  };

  const handleCancel = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <div className='logoutConfirmation'>
      <div className='confirmationBox'>
        <p>Are you sure you want to logout?</p>
        <button onClick={handleConfirm}>Yes</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

const DashboardStagiaire = () => {
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState('WelcomeIntern');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Ajout de l'état pour la recherche
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const userId=sessionStorage.getItem("userId");


   // Fonction pour récupérer les notifications
   const fetchNotifications = () => {
    axios
      .get(`http://localhost:8080/api/notifications/unread/${userId}`)
      .then((response) => {
        console.log("Notifications fetched:", response.data); // Vérifiez la réponse ici
        const notifications = response.data;
        setNotifications(notifications);
        setNotificationCount(notifications.length); // Mettez à jour le compteur
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des notifications:", error);
      });
  };
  const markNotificationsAsRead = () => {
    axios
      .post(`http://localhost:8080/api/notifications/markAsRead`, null, { params: { userId } })
      .then(() => {
        // Après avoir marqué les notifications comme lues, nous devons mettre à jour l'état local
        setNotificationCount(0);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour des notifications:", error);
      });
  };

  
  const handleNewUserRegistration = (user) => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { message: `${user.name} has been registered!`, type: 'success' }
    ]);
    setNotificationCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/stagiaire/register")
      .then((response) => {
        setUsers(response.data);
        response.data.forEach(user => handleNewUserRegistration(user));
      })
      .catch((error) => {
        console.error("There was an error fetching the users!", error);
      });
      fetchNotifications(); 
     }, []);

      const handleNotificationClick = () => {
        if (!showNotifications) {
          // Marquer les notifications comme lues lorsque les notifications sont affichées
          markNotificationsAsRead();
        }
        setShowNotifications(!showNotifications); // Bascule l'affichage des notifications
      };

  const handleSearchChange = (event) => {
    const value = event.target.value || ""; // Assurez-vous que value n'est jamais undefined
    setSearchQuery(value.toLowerCase());

    const viewMap = {
      Dashboard: 'Dashboard',
      Task: 'Task',
      Team: 'Team',
      Project: 'Project',
      Reporting: 'Reporting',
      ChatTeam: 'ChatTeam',
      ProfileIntern: 'Profile',
    };

    const matchedView = Object.keys(viewMap).find(view => view.toLowerCase().includes(value.toLowerCase()));
    if (matchedView) {
      setActiveView(matchedView);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'Team':
        return <Team/>
      case 'ProfileIntern':
        return <InternProfile />;
      case 'ChatTeam':
        return<ChatTeam/>
      case 'Task':
        return <TaskBoard/>
      case 'Dashboard':
        return <Dashboard/>
      case 'Reporting':
        return <Reporting/>
      case 'Project':
        return <Project/>
      default:
        return <WelcomeStagiaire />;
    }
  };

  return (
    <div className='dashboard'>
      {showLogoutConfirmation && (
        <LogoutConfirmation setShowLogoutConfirmation={setShowLogoutConfirmation} />
      )}
      <div className='mainContent'>
        <Top
         searchQuery={searchQuery}
         handleSearchChange={handleSearchChange}  
         onNotificationClick={handleNotificationClick}
         showNotifications={showNotifications} // Pass the showNotifications state to Top
         notifications={notifications} // Pass notifications to Top 
         notificationCount={notificationCount}
        />
        <div className='bottom flex'>
          {renderActiveView()}
        </div>
      </div>
      <div className='dashboardContainer'>
        <Sidebar setActiveView={setActiveView} setShowLogoutConfirmation={setShowLogoutConfirmation} />
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
      </div>
      <div className='notificationContainer'>
        {notifications.map((notif, index) => (
          <Notification key={index} message={notif.message} type={notif.type} />
        ))}
      </div>
    </div>
  );
};

export default DashboardStagiaire;
