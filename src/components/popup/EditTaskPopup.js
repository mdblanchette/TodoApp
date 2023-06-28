import { useState, useEffect } from 'react';

export default function EditTaskPopup(props) {
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description);

  let initTitle = props.title;
  let initDescription = props.description;

  useEffect(() => {
    setTitle(props.title);
    setDescription(props.description);
    console.log(props.tasks);
  }, [props.tasks, props.title, props.description]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedTasks = props.tasks.map((item) => {
      if (item.id === props.id) {
        return { ...item, title, description };
      } else {
        return item;
      }
    });
    props.setTasks(updatedTasks);
    props.setTrigger(false);
  };

  const handleClose = () => {
    setTitle(initTitle);
    setDescription(initDescription);
    props.setTrigger(false);
  }

  return props.trigger ? (
    <div className="popup">
      <div className="popup-inner">
        <h2>Edit Task</h2>
        <button className="close-btn" onClick={() => handleClose()}>
          Close
        </button>
        <form onSubmit={handleSubmit}>
          <label>Task Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
          <br></br>
          <label>Task Description</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} />
          <button id="add-task-btn">Submit Changes</button>
        </form>
      </div>
    </div>
  ) : '';
}