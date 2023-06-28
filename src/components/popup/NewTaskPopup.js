import './Popup.css'
import { useState } from 'react';

export default function Popup(props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();

        props.addTask(title, description);
        setTitle('');
        setDescription('');
        
        props.setTrigger(false);
    }

    return (props.trigger) ? (
        <div className='popup'>
            <div className='popup-inner'>
                <h2>New Task</h2>
                <button className='close-btn' onClick={() => props.setTrigger(false)}>Close</button>
                <form onSubmit={handleSubmit}>
                    <label>Task Title</label>
                    <input 
                        required 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <br></br>
                    <label>Task Description</label>
                    <textarea 
                        required 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button id='add-task-btn'>Add Task</button>
                </form>
            </div>
        </div>
    ) : "";
}