import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    axios.get(`${API}/tasks`).then((res) => setTasks(res.data));
  }, []);

  const addTask = () => {
    if (description.trim() === '') return;
    axios.post(`${API}/tasks`, { description }).then((res) => {
      setTasks([...tasks, res.data]);
      setDescription('');
    });
  };

  const deleteTask = (id) => {
    axios.delete(`${API}/tasks/${id}`).then(() => {
      setTasks(tasks.filter((task) => task.id !== id));
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Trabalho APAW</h1>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Digite a tarefa"
        style={{ marginRight: '1rem', padding: '0.5rem' }}
      />
      <button onClick={addTask} style={{ padding: '0.5rem' }}>
        Adicionar
      </button>

      <table border="1" cellPadding="8" style={{ marginTop: '2rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id}>
              <td>{index + 1}</td>
              <td>{task.description}</td>
              <td>
                <button onClick={() => deleteTask(task.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
