import './App.css';
import NewTaskPopup from './components/popup/NewTaskPopup';
import EditTaskPopup from './components/popup/EditTaskPopup';
import { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

function App() {
  const [NTbuttonPopup, NTsetButtonPopup] = useState(false);
  const [ETbuttonPopup, ETsetButtonPopup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearchQueryChange(e) {
    setSearchQuery(e.target.value);
  }

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function addTask(title, description) {
    const task = { id: crypto.randomUUID(), title: title, description: description, list: 'todo' }
    const newTasks = tasks.filter((task) => task !== task.id);
    newTasks.splice(0, 0, task);
    setTasks(newTasks);
    localStorage.setItem('tasks', JSON.stringify(newTasks));
  }

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    if (id === selectedTaskId) {
      setSelectedTaskId(null);
      ETsetButtonPopup(false);
    }
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);

  }, []);

  function handleDragOverList(e, listName) {
    e.preventDefault();
    const draggedTask = tasks.find((task) => task.id === draggedTaskId);
    if (draggedTask.list !== listName) {
      // Dragging to a different list
      const newTasks = tasks.filter((task) => task.id !== draggedTaskId);
      newTasks.splice(0, 0, tasks.find((task) => task.id === draggedTaskId));
      tasks.find((task) => task.id === draggedTaskId).list = listName;
      setTasks(newTasks);
    }
  }

  function handleDragOverTask(e, taskId) {
    e.preventDefault();
    const dropTargetList = e.currentTarget.dataset.list;
    const draggedTask = tasks.find((task) => task.id === draggedTaskId);
    if (draggedTask.list === dropTargetList) {
      // Dragging within the same list
      const draggedTaskIndex = tasks.findIndex((task) => task.id === draggedTaskId);
      const dropTargetTaskIndex = tasks.findIndex((task) => task.id === taskId);
  
      const dropTargetRect = e.target.closest('.task').getBoundingClientRect();
      const dropTargetCenterY = dropTargetRect.y + (dropTargetRect.height / 2);
      const draggedTaskOffset = e.clientY - dropTargetCenterY;
      const draggedTaskIndexOffset = draggedTaskOffset > 0 ? 1 : 0;
  
      const newTasks = tasks.filter((task) => task.id !== draggedTaskId);
      newTasks.splice(dropTargetTaskIndex + draggedTaskIndexOffset, 0, tasks[draggedTaskIndex]);
  
      setTasks(newTasks);
    } else {
      const draggedTaskIndex = tasks.findIndex((task) => task.id === draggedTaskId);
      const dropTargetTaskIndex = tasks.findIndex((task) => task.id === taskId);
      
      const dropTargetRect = e.target.closest('.task').getBoundingClientRect();
      const dropTargetCenterY = dropTargetRect.y + (dropTargetRect.height / 2);
      const draggedTaskOffset = e.clientY - dropTargetCenterY;
      const draggedTaskIndexOffset = draggedTaskOffset > 0 ? 1 : 0;

      const newTasks = tasks.filter((task) => task.id !== draggedTaskId);
      newTasks.splice(dropTargetTaskIndex + draggedTaskIndexOffset, 0, tasks[draggedTaskIndex]);
      tasks[draggedTaskIndex].list = dropTargetList;

      setTasks(newTasks);     
    }
  }

  return (
    <div className="app-container">
      <header>
        <button className="new-task-btn" onClick={() => NTsetButtonPopup(true)}>New Task</button>
        <NewTaskPopup trigger={NTbuttonPopup} setTrigger={NTsetButtonPopup} tasks={tasks} addTask={addTask} />  
        <input type="text" className='search-bar' placeholder="Search tasks" value={searchQuery} onChange={handleSearchQueryChange} />
      </header>
      <main>
        <div className='list-container'>
          <div className='list'>
            <div id="todo-title">
              <h2 className="title">To Do</h2>
            </div>
            <div className='todo-list' onDragOver={(e) => handleDragOverList(e, 'todo')}>
            {filteredTasks.filter((task) => task.list === 'todo').map((task) => {
                if (task.id) {
                  return (
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
                      <div className='task-details'>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-description">{task.description}</p>
                      </div>
                      <div className='task-icons'>
                        <FaPencilAlt onClick={() => {
                          setSelectedTaskId(task.id);
                          ETsetButtonPopup(true);
                        }} className='icon-pencil-todo'/>
                        <FaTrash onClick={() => deleteTask(task.id)} className='icon-trash-todo'/>
                      </div>
                    </div>
                  );
                } 
                else return null;
              })}
            </div>
          </div>
          <div className='list'>
            <div id="inprogress-title">
              <h2 className="title">In progress</h2>
            </div>
            <div className='inprogress-list' onDragOver={(e) => handleDragOverList(e, 'inprogress')}>
              {filteredTasks.filter((task) => task.list === 'inprogress').map((task) => {
                if (task.id) {
                  return (
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
                      <div className='task-details'>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-description">{task.description}</p>
                      </div>
                      <div className='task-icons'>
                        <FaPencilAlt onClick={() => {
                          setSelectedTaskId(task.id);
                          ETsetButtonPopup(true);
                        }} className='icon-pencil-todo'/>
                        <FaTrash onClick={() => deleteTask(task.id)} className='icon-trash-todo'/>
                      </div>
                    </div>
                  );
                } else return null;
              })}                  
            </div>
          </div>
          <div className='list'>
            <div id="archived-title">
              <h2 className="title">Archived</h2>
            </div>
            <div className='archived-list' onDragOver={(e) => handleDragOverList(e, 'archived')}>
              {filteredTasks.filter((task) => task.list === 'archived').map((task) => {
                if (task.id) {
                  return (
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
                      <div className='task-details'>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-description">{task.description}</p>
                      </div>
                      <div className='task-icons'>
                        <FaPencilAlt onClick={() => {
                          setSelectedTaskId(task.id);
                          ETsetButtonPopup(true);
                        }} className='icon-pencil-todo'/>
                        <FaTrash onClick={() => deleteTask(task.id)} className='icon-trash-todo'/>
                      </div>
                    </div>
                  );
                }
                else {
                  return null;
                }
              })}
            </div>
          </div>
        </div>
      </main>

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