import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdOutlinePermContactCalendar,
  MdHistory,
} from "react-icons/md";
import {
  IoSpeedometerOutline,
  IoPeopleOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import {
  FaUsers,
  FaProjectDiagram,
  FaCommentDots,
  FaSearch,
  FaBell,
  FaPeopleCarry,
} from "react-icons/fa";
import { BsQuestionCircle } from "react-icons/bs";
import logo1 from "../../LoginAssets/logo.png";
import photo from "../../assets/mouna2.jpeg";
import "./Dashboard.scss";
import Listing from "./Listing";
import Interns from "../StagiaireList/StagiaireList";
import EmployeeList from "../EmployeeList/EmployeeList";
import Welcome from "./Welcome";
import AdminProfile from "../AdminProfile/AdminProfile";
import History from "./History";
import Notification from "./Notification";
import Projects from "./Projects";
import Team from "./Team";
import Chat from '../Chat/Chat'

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [admin, setAdmin] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // Ajout de l'état pour la recherche
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const userId = 52;

  // Fonction pour récupérer les notifications
  const fetchNotifications = () => {
    axios
      .get("http://localhost:8080/api/notifications/unread/52")
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
  
  // Fonction pour récupérer le profil de l'administrateur
  const fetchAdminProfile = () => {
    axios
      .get("http://localhost:8080/api/admin/profile")
      .then((response) => {
        setAdmin(response.data);
        const photoUrl = response.data.photoPath
          ? `http://localhost:8080/${response.data.photoPath}`
          : null;
        setPhotoUrl(photoUrl);
      })
      .catch((error) => {
        console.error("Error fetching admin:", error);
      });
  };

  // Fonction pour récupérer les utilisateurs
  const fetchUsers = () => {
    axios
      .get("http://localhost:8080/api/stagiaire/register")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the users!", error);
      });
  };


  // Fonction pour marquer les notifications comme lues
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

  // Utilisation de useEffect pour appeler les fonctions au chargement du composant
  useEffect(() => {
    fetchAdminProfile();
    fetchUsers();
    fetchNotifications();
    
  }, [activeView]); // Assurez-vous que `activeView` est nécessaire comme dépendance

  const handleLogoutClick = (event) => {
    event.preventDefault();
    setShowLogoutConfirmation(true);
  };

  const handleNotificationClick = () => {
    if (!showNotifications) {
      // Marquer les notifications comme lues lorsque les notifications sont affichées
      markNotificationsAsRead();
    }
    setShowNotifications(!showNotifications); // Bascule l'affichage des notifications
  };
  /* ********************************************** */
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
    const viewMap = {
      dashboard2: "Listing",
      Interns: "interns",
      EmployeeList: "EmployeeList",
      Team: "Team",
      AdminProfile: "profile",
      History: "History",
      Chat: "Chat",
      Projects: "Projects",
    };

    for (const [view, componentName] of Object.entries(viewMap)) {
      if (componentName.toLowerCase().includes(event.target.value.toLowerCase())) {
        setActiveView(view);
        break;
      }
    }
  };


  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard2":
        return <Listing />;
      case "Interns":
        return <Interns />;
      case "EmployeeList":
        return <EmployeeList />;
      case "Team":
        return <Team />;
      case "AdminProfile":
        return <AdminProfile setPhotoUrl={setPhotoUrl} />;
      case "History":
        return <History />;
        case "Chat":
        return <Chat />;
      case "Projects":
        return <Projects />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="dashboard">
      {showLogoutConfirmation && (
        <LogoutConfirmation
          setShowLogoutConfirmation={setShowLogoutConfirmation}
        />
      )}
      <div className="mainContent">
      <Top 
         notificationCount={notificationCount}
         photoUrl={photoUrl} 
         searchQuery={searchQuery}
         handleSearchChange={handleSearchChange}
         onNotificationClick={handleNotificationClick}
         showNotifications={showNotifications} // Pass the showNotifications state to Top
         notifications={notifications} // Pass notifications to Top
        />

        <div className="bottom flex">{renderActiveView()}</div>
      </div>
      <div className="dashboardContainer">
        <Sidebar
          setActiveView={setActiveView}
          handleLogoutClick={handleLogoutClick}
        />
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.name}</li>
          ))}
        </ul>
      </div>
      <div className="notificationContainer">
        {notifications.map((notif, index) => (
          <Notification key={index} message={notif.message} type={notif.type} />
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ setActiveView, handleLogoutClick }) => {
  const handleClick = (event, view) => {
    event.preventDefault();
    setActiveView(view);
  };

  return (
    <div className="sideBar grid">
      <div className="logoDiv flex">
        <img src={logo1} alt="logo" />
        <h2 className="dashH2">Project-Together</h2>
      </div>

      <div className="menuDiv">
        <h3 className="divTitle title">Quick MENU</h3>
        <ul className="menuLists grid">
          <li className="listItem">
            <a
              href="#"
              className="menuLink flex"
              onClick={(e) => handleClick(e, "dashboard2")}
            >
              <IoSpeedometerOutline className="icon icons" />
              <span className="smallText">Dashboard</span>
            </a>
          </li>
          <li className="listItem">
            <a
              href="#"
              className="menuLink flex"
              onClick={(e) => handleClick(e, "Interns")}
            >
              <IoPeopleOutline className="icon icons" />
              <span className="smallText">Interns</span>
            </a>
          </li>
          <li className="listItem">
            <a
              href="#"
              className="menuLink flex"
              onClick={(e) => handleClick(e, "EmployeeList")}
            >
              <IoPeopleOutline className="icon icons" />
              <span className="smallText">Employees</span>
            </a>
          </li>
          <li className="listItem">
            <a
              href="#"
              className="menuLink flex"
              onClick={(e) => handleClick(e, "Team")}
            >
              <FaUsers className="icon icons" />
              <span className="smallText">Teams</span>
            </a>
          </li>
          <li className="listItem">
            <a
              href="#"
              className="menuLink flex"
              onClick={(e) => handleClick(e, "Projects")}
            >
              <FaProjectDiagram className="icon icons" />
              <span className="smallText">Projects</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="settingsDiv">
        <h3 className="divTitle titl">Settings</h3>
        <ul className="menuLists grid">
          <li className="listItem">
            <a href="#" className="menuLink flex" onClick={(e) => handleClick(e, "Chat")}>
              <FaCommentDots className="icon icons" />
              <span className="smallText">Chat</span>
            </a>
          </li>
          <li className="listItem">
            <a
              href="#"
              className="menuLink flex"
              onClick={(e) => handleClick(e, "History")}
            >
              <MdHistory className="icon icons" />
              <span className="smallText">History</span>
            </a>
          </li>
          <li className="listItem">
            <a
              href="#"
              className="menuLink flex"
              onClick={(e) => handleClick(e, "AdminProfile")}
            >
              <MdOutlinePermContactCalendar className="icon icons" />
              <span className="smallText">Profile</span>
            </a>
          </li>
          <li className="listItem">
            <a href="#" className="menuLink flex" onClick={handleLogoutClick}>
              <IoLogOutOutline className="icon icons" />
              <span className="smallText">Logout</span>
            </a>
          </li>
        </ul>
      </div>

      <div id="parthelp" className="sideBarCard">
        <BsQuestionCircle className="icon" />
      <div className="cardContent">
          <div className="circle1"></div>
          <div className="circle1"></div>

          <h3>Help Center</h3>
          <p>
            Having trouble in ProjectTogether, please contact us for more
            questions.
          </p>
          <button className="bthelp">Go to help center.</button>
        </div> 
      </div>
    </div>
  );
};


const Top = ({ notificationCount, photoUrl,searchQuery, handleSearchChange,onNotificationClick,showNotifications, notifications  }) => {
  const defaultPhoto = photo;
  const uniqueKey = photoUrl ? `profile-img-${new Date().getTime()}` : 'default-img';


  return (
    <div className="top-Bar">
      <div className="searchContainer">
        <FaSearch className="searchIcon" />
        <input
             type="text"
             placeholder="Search..."
             className="searchInput"
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



      <div className="profilContainer profileIcon">
        <img key={uniqueKey} src={photoUrl || defaultPhoto} alt="profile" />
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

export default Dashboard;