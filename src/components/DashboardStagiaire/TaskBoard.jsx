import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskBoard.scss';
import { FaPlus, FaTrashAlt, FaEdit } from 'react-icons/fa';

const TaskBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        status: 'TO_DO',
        assignedToId: null,
        teamId: null
    });
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        status: 'TO_DO',
        assignedToId: null,
        teamId: null
    });
    const [members, setMembers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [taskToEditId, setTaskToEditId] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        const teamIdFromSession = sessionStorage.getItem('teamId');
        if (teamIdFromSession) {
            setSelectedTeamId(teamIdFromSession);
        }
    }, []);

    useEffect(() => {
        if (selectedTeamId) {
            fetchMembers(selectedTeamId);
            setTaskForm(prevForm => ({ ...prevForm, teamId: selectedTeamId }));
            fetchTasksByTeam(selectedTeamId);
        }
    }, [selectedTeamId]);

    const fetchTasksByTeam = async (teamId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/api/tasks/team/${teamId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks by team:', error);
            setError('Failed to load tasks.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/team/list');
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchMembers = async (teamId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/api/team/${teamId}/members`);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
            setError('Failed to load members.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        try {
            const taskData = {
                title: taskForm.title,
                description: taskForm.description,
                status: taskForm.status,
                assignedTo: { id: taskForm.assignedToId },
                team: { id: taskForm.teamId }
            };

            const response = await axios.post('http://localhost:8080/api/tasks/create', taskData);
            const createdTask = response.data;

            // Assurez-vous que les informations de l'équipe et du membre sont correctes
            const assignedMember = members.find(member => member.id === createdTask.assignedTo?.id) || null;
            const taskTeam = teams.find(team => team.id === createdTask.team?.id) || null;

            const updatedTask = {
                ...createdTask,
                assignedTo: assignedMember,
                team: taskTeam
            };

            // Mettez à jour l'état des tâches avec la nouvelle tâche
            setTasks([...tasks, updatedTask]);

            // Réinitialisez le formulaire
            setTaskForm({ title: '', description: '', status: 'TO_DO', assignedToId: null, teamId: taskForm.teamId });
        } catch (error) {
            console.error('Error creating task:', error.response?.data || error.message);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:8080/api/tasks/delete/${taskId}`);
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = (taskId) => {
        const taskToEdit = tasks.find(task => task.id === taskId);
        if (taskToEdit) {
            setEditForm({
                title: taskToEdit.title,
                description: taskToEdit.description,
                status: taskToEdit.status,
                assignedToId: taskToEdit.assignedTo ? taskToEdit.assignedTo.id : null,
                teamId: taskToEdit.team ? taskToEdit.team.id : null,
            });
            setTaskToEditId(taskId);
            setIsEditModalOpen(true);  // Ouvrir la modale d'édition
        }
    };

    const handleUpdateTask = async () => {
        try {
            const taskData = {
                title: editForm.title,
                description: editForm.description,
                status: editForm.status,
                assignedTo: { id: editForm.assignedToId },
                team: { id: editForm.teamId }
            };
    
            const response = await axios.put(`http://localhost:8080/api/tasks/update/${taskToEditId}`, taskData);
            const updatedTask = response.data;
    
            // Assurez-vous que les informations de l'équipe et du membre sont correctes
            const assignedMember = members.find(member => member.id === updatedTask.assignedTo?.id) || null;
            const taskTeam = teams.find(team => team.id === updatedTask.team?.id) || null;
    
            const updatedTaskWithDetails = {
                ...updatedTask,
                assignedTo: assignedMember,
                team: taskTeam
            };
    
            // Mettez à jour l'état des tâches avec la tâche éditée
            setTasks(tasks.map(task => (task.id === taskToEditId ? updatedTaskWithDetails : task)));
            setIsEditModalOpen(false);  // Fermer la modale d'édition
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };
    

    const columns = ['TO_DO', 'IN_PROGRESS', 'DONE'];
    return (
        <div className="task-board">
            <h1>Task Board</h1>
            <div className="task-form">
                <h2>Create Task</h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
                <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                >
                    {columns.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                </select>
                <select
                    value={taskForm.assignedToId || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                >
                    <option value="">Assign to</option>
                    {members.map(member => (
                        <option key={member.id} value={member.id}>
                            {member.full_name || `Member ${member.id}`}
                        </option>
                    ))}
                </select>
                <button className='taskFormBtn' onClick={handleCreateTask}><FaPlus /> Create Task</button>
            </div>
            <div className="task-columns">
                {columns.map(status => (
                    <div key={status} className="task-column">
                        <h2>{status.replace('_', ' ')}</h2>
                        {tasks
                            .filter(task => task.status === status)
                            .map(task => (
                                <div key={task.id} className={`task-card ${status.toLowerCase()}`}>
                                    <h3>{task.title}</h3>
                                    <p>{task.description}</p>
                                    <p><b>Assigned To :</b> {task.assignedTo ? task.assignedTo.full_name : 'Unassigned'}</p>
                                    <p><b>Team : </b> {task.team ? task.team.name : 'No team'}</p>
                                    <div className="task-actions9">
                                        <button className='editTask9' onClick={() => handleEditTask(task.id)}><FaEdit /> Edit</button>
                                        <button className='deleteTask9' onClick={() => handleDeleteTask(task.id)}><FaTrashAlt /> Delete</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ))}
            </div>

            {/* Modale d'édition de tâche */}
            {isEditModalOpen && (
                <div className="modal-overlayTask"> {/* Overlay sombre */}
                    <div className="modalTask">
                        <div className="modal-contentTask">
                            <h2>Edit Task</h2>
                            <input
                                type="text"
                                placeholder="Title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                {columns.map(status => (
                                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                ))}
                            </select>
                            <select
                                value={editForm.assignedToId || ''}
                                onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })}
                            >
                                <option value="">Assign to</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.full_name || `Member ${member.id}`}
                                    </option>
                                ))}
                            </select>
                            <button className='updatetask9' onClick={handleUpdateTask}><FaEdit /> Update Task</button>
                            <button className='canceltask9'onClick={() => setIsEditModalOpen(false)}><FaTrashAlt /> Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoard;
