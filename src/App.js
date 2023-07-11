import './App.css';
import NewTaskPopup from './components/popup/NewTaskPopup';
import EditTaskPopup from './components/popup/EditTaskPopup';
import { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

function App() {
  // Initialize UseStates
  const [NTbuttonPopup, NTsetButtonPopup] = useState(false);
  const [ETbuttonPopup, ETsetButtonPopup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Search bar input handling
  function handleSearchQueryChange(e) {
    // Update search query
    setSearchQuery(e.target.value);
  }


// Filter tasks based on search query and list
const filteredTasks = tasks.filter(
  (task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
);

// Function to add a new task
function addTask(title, description) {
  const task = { id: crypto.randomUUID(), title: title, description: description, list: 'todo' };
  const newTasks = tasks.filter((task) => task !== task.id); // Remove task with current ID (if any)
  newTasks.splice(0, 0, task); // Add new task to the top of the tasks array
  setTasks(newTasks); // Update tasks state
  localStorage.setItem('tasks', JSON.stringify(newTasks)); // Update local storage with new tasks
}

// Function to delete a task
const deleteTask = (id) => {
  const updatedTasks = tasks.filter((task) => task.id !== id); // Filter out task with matching ID
  setTasks(updatedTasks); // Update tasks state
  if (id === selectedTaskId) {
    setSelectedTaskId(null); // Clear selected task ID state if it matches the deleted task ID
    ETsetButtonPopup(false); // Close edit task popup if it was open for the deleted task
  }
  localStorage.setItem('tasks', JSON.stringify(updatedTasks)); // Update local storage with updated tasks
};

// Load stored tasks on component mount
useEffect(() => {
  const storedTasks = JSON.parse(localStorage.getItem('tasks')) || []; // Get stored tasks from local storage or an empty array if none exist
  setTasks(storedTasks); // Update tasks state with stored tasks
}, []);

// Function to handle drag over list
function handleDragOverList(e, listName) {
  e.preventDefault();
  const draggedTask = tasks.find((task) => task.id === draggedTaskId); // Get the task being dragged
  if (draggedTask.list !== listName) {
    // Dragging to a different list
    const newTasks = tasks.filter((task) => task.id !== draggedTaskId); // Filter out the dragged task from the current list
    newTasks.splice(0, 0, tasks.find((task) => task.id === draggedTaskId)); // Add the dragged task to the top of the new list
    tasks.find((task) => task.id === draggedTaskId).list = listName; // Update the list property of the dragged task
    setTasks(newTasks); // Update tasks state

    // Update LocalStorage
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  }
}

// Function to handle drag over a task
function handleDragOverTask(e, taskId) {
  e.preventDefault();
  const dropTargetList = e.currentTarget.dataset.list; // Get the list name of the drop target
  const draggedTask = tasks.find((task) => task.id === draggedTaskId); // Get the task being dragged
  if (draggedTask.list === dropTargetList) {
    // Dragging within the same list
    const draggedTaskIndex = tasks.findIndex((task) => task.id === draggedTaskId); // Get the index of the dragged task
    const dropTargetTaskIndex = tasks.findIndex((task) => task.id === taskId); // Get the index of the drop target task

    // Calculate the position of the dragged task relative to the drop target task
    const dropTargetRect = e.target.closest('.task').getBoundingClientRect();
    const dropTargetCenterY = dropTargetRect.y + (dropTargetRect.height / 2);
    const draggedTaskOffset = e.clientY - dropTargetCenterY;
    const draggedTaskIndexOffset = draggedTaskOffset > 0 ? 1 : 0;

    // Create a new array of tasks by filtering out the dragged task, inserting it at the appropriate index, and updating the tasks state
    const newTasks = tasks.filter((task) => task.id !== draggedTaskId);
    newTasks.splice(dropTargetTaskIndex + draggedTaskIndexOffset, 0, tasks[draggedTaskIndex]);
    setTasks(newTasks);
    // Update LocalStorage
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  } else {
    // Dragging to a different list
    const draggedTaskIndex = tasks.findIndex((task) => task.id === draggedTaskId);
    const dropTargetTaskIndex = tasks.findIndex((task) => task.id === taskId);

    // Calculate the position of the dragged task relative to the drop target task
    const dropTargetRect = e.target.closest('.task').getBoundingClientRect();
    const dropTargetCenterY = dropTargetRect.y + (dropTargetRect.height / 2);
    const draggedTaskOffset = e.clientY - dropTargetCenterY;
    const draggedTaskIndexOffset = draggedTaskOffset > 0 ? 1 : 0;

    // Create a new array of tasks by filtering out the dragged task, inserting it at the appropriate index, updating its list property, and updating the tasks state
    const newTasks = tasks.filter((task) => task.id !== draggedTaskId);
    newTasks.splice(dropTargetTaskIndex + draggedTaskIndexOffset, 0, tasks[draggedTaskIndex]);
    tasks[draggedTaskIndex].list = dropTargetList;
    setTasks(newTasks);     
    // Update LocalStorage
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  }
}

// React component that renders a task management application
return (
  <div className="app-container">
    {/* Header section */}
    <header>
      {/* Button to create new task */}
      <button className="new-task-btn" onClick={() => NTsetButtonPopup(true)}>New Task</button>
      {/* Popup to create a new task */}
      <NewTaskPopup trigger={NTbuttonPopup} setTrigger={NTsetButtonPopup} tasks={tasks} addTask={addTask} />  
      {/* Search bar to filter tasks */}
      <input type="text" className='search-bar' placeholder="Search tasks" value={searchQuery} onChange={handleSearchQueryChange} />
    </header>
    {/* Main section */}
    <main>
      {/* Container for the three lists of tasks */}
      <div className='list-container'>
        {/* List of tasks in "To Do" category */}
        <div className='list'>
          <div id="todo-title">
            <h2 className="title">To Do</h2>
          </div>
          {/* Draggable list of tasks */}
          <div className='todo-list' onDragOver={(e) => handleDragOverList(e, 'todo')}>
            {/* Filter tasks based on the "To Do" category */}
            {filteredTasks.filter((task) => task.list === 'todo').map((task) => {
              if (task.id) {
                return (
                  // Draggable task component
                  <div 
                    draggable='true' 
                    className={`task ${isDragging && task.id === draggedTaskId ? 'dragging' : ''}`} 
                    key={task.id} 
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                    handleDragOverTask(e, task.id);}}
                    onDragEnd={() => setDraggedTaskId(null)}
                    data-list='todo'
                  >
                    {/* Task details */}
                    <div className='task-details'>
                      <h3 className="task-title">{task.title}</h3>
                      <p className="task-description">{task.description}</p>
                    </div>
                    {/* Task icons */}
                    <div className='task-icons'>
                      {/* Icon to edit the task */}
                      <FaPencilAlt onClick={() => {
                        setSelectedTaskId(task.id);
                        ETsetButtonPopup(true);
                      }} className='icon-pencil-todo'/>
                      {/* Icon to delete the task */}
                      <FaTrash onClick={() => deleteTask(task.id)} className='icon-trash-todo'/>
                    </div>
                  </div>
                );
              } 
              // If the task doesn't have an ID, return null
              else return null;
            })}
          </div>
        </div>
        {/* List of tasks in "In Progress" category */}
        <div className='list'>
          <div id="inprogress-title">
            <h2 className="title">In progress</h2>
          </div>
          {/* Draggable list of tasks */}
          <div className='inprogress-list' onDragOver={(e) => handleDragOverList(e, 'inprogress')}>
            {/* Filter tasks based on the "In Progress" category */}
            {filteredTasks.filter((task) => task.list === 'inprogress').map((task) => {
              if (task.id) {
                return (
                  // Draggable task component
                  <div 
                    draggable='true' 
                    className={`task ${isDragging && task.id === draggedTaskId ? 'dragging' : ''}`} 
                    key={task.id} 
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                    handleDragOverTask(e, task.id);}}
                    onDragEnd={() => setDraggedTaskId(null)}
                    data-list='inprogress'
                  >
                    {/* Task details */}
                    <div className='task-details'>
                      <h3 className="task-title">{task.title}</h3>
                      <p className="task-description">{task.description}</p>
                    </div>
                    {/* Task icons */}
                    <div className='task-icons'>
                      {/* Icon to edit the task */}
                      <FaPencilAlt onClick={() => {
                        setSelectedTaskId(task.id);
                        ETsetButtonPopup(true);
                      }} className='icon-pencil-todo'/>
                      {/* Icon to delete the task */}
                      <FaTrash onClick={() => deleteTask(task.id)} className='icon-trash-todo'/>
                    </div>
                  </div>
                );
              } 
              // If the task doesn't have an ID, return null
              else return null;
            })}                  
          </div>
        </div>
        {/* List of tasks in "Archived" category */}
        <div className='list'>
          <div id="archived-title">
            <h2 className="title">Archived</h2>
          </div>
          {/* Draggable list of tasks */}
          <div className='archived-list' onDragOver={(e) => handleDragOverList(e, 'archived')}>
            {/* Filter tasks based on the "Archived" category */}
            {filteredTasks.filter((task) => task.list === 'archived').map((task) => {
              if (task.id) {
                return (
                  // Draggable task component
                  <div 
                    draggable='true' 
                    className={`task ${isDragging && task.id === draggedTaskId ? 'dragging' : ''}`} 
                    key={task.id} 
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                    handleDragOverTask(e, task.id);}}
                    onDragEnd={() => setDraggedTaskId(null)}
                    data-list='archived'
                  >
                    {/* Task details */}
                    <div className='task-details'>
                      <h3 className="task-title">{task.title}</h3>
                      <p className="task-description">{task.description}</p>
                    </div>
                    {/* Task icons */}
                    <div className='task-icons'>
                      {/* Icon to edit the task */}
                      <FaPencilAlt onClick={() => {
                        setSelectedTaskId(task.id);
                        ETsetButtonPopup(true);
                      }} className='icon-pencil-todo'/>
                      {/* Icon to delete the task */}
                      <FaTrash onClick={() => deleteTask(task.id)} className='icon-trash-todo'/>
                    </div>
                  </div>
                );
              }
              // If the task doesn't have an ID, return null
              else {
                return null;
              }
            })}
          </div>
        </div>
      </div>
    </main>

    {/* Popup to edit a task */}
    {selectedTaskId && (
      <EditTaskPopup
        trigger={ETbuttonPopup}
        setTrigger={ETsetButtonPopup}
        tasks={tasks}
        id={selectedTaskId}
        title={tasks.find((t) => t.id === selectedTaskId).title}
        description={tasks.find((t) => t.id === selectedTaskId).description}
        setTasks={setTasks}
      />
    )}
  </div>
);
}

export default App;