import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeList.css';
import { FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState({
    id: null,
    full_name: '',
    email: '',
    password: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/employee/listEmployee')
      .then(response => {
        // On vérifie que la réponse est bien un tableau
        if (Array.isArray(response.data)) {
          const employees = response.data.map(employee => ({
            id: employee.id,
            full_name: employee.full_name,
            email: employee.email,
          }));
          setEmployees(employees);
          setFilteredEmployees(employees);
        } else {
          console.error('Unexpected data format:', response.data);
          setEmployees([]);
          setFilteredEmployees([]);
        }
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
        setEmployees([]);
        setFilteredEmployees([]);
      });
  }, []);
  

  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleEdit = (employee) => {
    setEditing(true);
    setCurrentEmployee(employee);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/employee/updateEmployee/${currentEmployee.id}`, currentEmployee);
      setEmployees(employees.map(employee => (employee.id === currentEmployee.id ? currentEmployee : employee)));
      setEditing(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteClick = (id) => {
    setShowConfirmModal(true);
    setEmployeeToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/employee/deleteEmployee/${employeeToDelete}`);
      setEmployees(employees.filter(employee => employee.id !== employeeToDelete));
      setFilteredEmployees(filteredEmployees.filter(employee => employee.id !== employeeToDelete));
      setShowConfirmModal(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmModal(false);
    setEmployeeToDelete(null);
  };

  const handleView = (employee) => {
    setViewing(true);
    setCurrentEmployee(employee);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee({ ...currentEmployee, [name]: value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/employee/register', currentEmployee);
      setEmployees([...employees, response.data]);
      setFilteredEmployees([...filteredEmployees, response.data]);
      setAdding(false);
      setCurrentEmployee({ id: null, full_name: '', email: '', password: '' });
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  return (
    <div className='tabEmp'>
      <h1 className='titleEmp1'>Employees</h1>
      
      <div className="searchContainerEmp">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchBarEmp"
        />
        <FaSearch className="searchIconEmp" />
      </div>


      {editing && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setEditing(false)}>&times;</span>
            <h2>Edit Employee</h2>
            <form onSubmit={handleUpdate}>
              <label>
                Full Name:
                <input type="text" name="full_name" value={currentEmployee.full_name} onChange={handleChange} />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={currentEmployee.email} onChange={handleChange} />
              </label>
              <button type="submit">Update</button>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setViewing(false)}>&times;</span>
            <h2>View Employee</h2>
            <p><strong>Full Name:</strong> {currentEmployee.full_name}</p>
            <p><strong>Email:</strong> {currentEmployee.email}</p>
          </div>
        </div>
      )}

      {adding && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setAdding(false)}>&times;</span>
            <h2>Add New Employee</h2>
            <form onSubmit={handleAdd}>
              <label>
                Full Name:
                <input type="text" name="full_name" value={currentEmployee.full_name} onChange={handleChange} />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={currentEmployee.email} onChange={handleChange} />
              </label>
              <label>
                Password:
                <input type="password" name="password" value={currentEmployee.password} onChange={handleChange} />
              </label>
              <button type="submit">Add Employee</button>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlaye">
          <div className="modal-containere">
            <h3>Are you sure you want to delete this employee?</h3>
            <div className="modal-buttonse">
              <button onClick={handleDeleteConfirm} className="confirm-buttone">Delete</button>
              <button onClick={handleDeleteCancel} className="cancel-buttone">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table className='tableEmp'>
        <thead>
          <tr>
            <th className='titleEmp2'>Id</th>
            <th className='titleEmp2'>Full Name</th>
            <th className='titleEmp2'>Email</th>
            <th className='titleEmp2'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.full_name}</td>
              <td>{employee.email}</td>
              <td>
                <FaEdit className='actionIcon actionEdit' onClick={() => handleEdit(employee)} />
                <FaTrash className='actionIcon actionDelete' onClick={() => handleDeleteClick(employee.id)} />
                <FaEye className='actionIcon actionView' onClick={() => handleView(employee)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
<br></br>
      <button className="add-employee-button" onClick={() => setAdding(true)}>Add New Employee</button>
    </div>
  );
};

export default EmployeeList;
