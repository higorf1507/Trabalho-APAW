import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [tarefaFixa, setTarefaFixa] = useState(null);

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      const res = await axios.get(`${API}/tasks`);
      setTasks(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar tarefas. Verifique a conexão com o servidor.');
    }
  };

  const adicionarTarefa = async () => {
    if (!description.trim()) return;

    setCarregando(true);
    try {
      const res = await axios.post(`${API}/tasks`, { description });
      setTasks(prev => [...prev, res.data]);
      setDescription('');
      mostrarMensagem('Tarefa adicionada com sucesso!');
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar tarefa.');
    } finally {
      setCarregando(false);
    }
  };

  const salvarEdicao = async () => {
    if (!description.trim() || editandoId === null) return;

    try {
      const res = await axios.put(`${API}/tasks/${editandoId}`, { description });
      setTasks(prev =>
        prev.map(t => (t.id === editandoId ? { ...t, description: res.data.description } : t))
      );
      setEditandoId(null);
      setDescription('');
      mostrarMensagem('Tarefa atualizada!');
    } catch (err) {
      console.error(err);
      setError('Erro ao editar tarefa.');
    }
  };

  const excluirTarefa = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`);
      setTasks(prev => prev.filter(task => task.id !== id));
      mostrarMensagem('Tarefa excluída!');
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir tarefa.');
    }
  };

  const iniciarEdicao = (id, desc) => {
    setEditandoId(id);
    setDescription(desc);
  };

  const fixarTarefa = async (id) => {
  try {
    await axios.patch(`${API}/tasks/${id}/fix`);
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, fixed: true } : t))
    );
    setTarefaFixa(id);
    mostrarMensagem('Tarefa fixada no topo!');
  } catch (err) {
    console.error(err);
    setError('Erro ao fixar tarefa.');
  }
};


  const mostrarMensagem = (msg) => {
    setMensagem(msg);
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div style={styles.container}>
      <img
        src="/ufms-logo.png"
        alt="Logo UFMS"
        style={{ width: '200px', display: 'block', margin: '0 auto 1rem' }}
      />
      <h1 style={styles.titulo}>Trabalho APAW</h1>

      <div style={styles.inputContainer}>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Digite a tarefa"
          style={styles.input}
        />
        <button
          onClick={editandoId ? salvarEdicao : adicionarTarefa}
          disabled={carregando}
          style={{
            ...styles.botaoAdicionar,
            cursor: carregando ? 'not-allowed' : 'pointer',
            opacity: carregando ? 0.7 : 1,
            backgroundColor: editandoId ? '#ffc107' : '#28a745',
          }}
        >
          {carregando ? 'Salvando...' : editandoId ? 'Salvar' : 'Adicionar'}
        </button>
      </div>

      {mensagem && <p style={styles.mensagemSucesso}>{mensagem}</p>}
      {error && <p style={styles.mensagemErro}>{error}</p>}

      <table style={styles.tabela}>
        <thead>
          <tr style={styles.cabecalho}>
            <th style={styles.celula}>#</th>
            <th style={styles.celula}>Descrição</th>
            <th style={styles.celula}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {[...(tarefaFixa ? tasks.filter(t => t.id === tarefaFixa) : []),
            ...tasks.filter(t => t.id !== tarefaFixa)].map((task, index) => (
            <tr key={task.id} style={tarefaFixa === task.id ? { backgroundColor: '#d0eaff' } : {}}>
              <td style={styles.celula}>{index + 1}</td>
              <td style={styles.celula}>{task.description}</td>
              <td style={styles.celula}>
                <button
                  onClick={() => iniciarEdicao(task.id, task.description)}
                  style={{ ...styles.botaoEditar, marginRight: 5 }}
                >
                  Editar
                </button>
                <button
                  onClick={() => excluirTarefa(task.id)}
                  style={{ ...styles.botaoExcluir, marginRight: 5 }}
                >
                  Excluir
                </button>
                <button
                  onClick={() => fixarTarefa(task.id)}
                  style={styles.botaoFixar}
                >
                  Fixar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Segoe UI, sans-serif',
    maxWidth: 700,
    margin: '0 auto',
    backgroundColor: '#e0f0ff',
    minHeight: '100vh',
    borderRadius: '8px',
  },
  titulo: {
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: '1rem',
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    padding: '0.5rem',
    flex: 1,
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  botaoAdicionar: {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  mensagemSucesso: {
    color: 'green',
    marginBottom: '1rem',
  },
  mensagemErro: {
    color: 'red',
    marginBottom: '1rem',
  },
  tabela: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  cabecalho: {
    backgroundColor: '#f0f0f0',
  },
  celula: {
    padding: '8px',
    border: '1px solid #ccc',
  },
  botaoExcluir: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  botaoEditar: {
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  botaoFixar: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default App;
