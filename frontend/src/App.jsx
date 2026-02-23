import React, { useState, useEffect } from 'react';
import RoleSelect from './components/RoleSelect.jsx';
import TechPanel from './components/TechPanel.jsx';
import ParticipantPanel from './components/ParticipantPanel.jsx';

const API_BASE = '';

function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('session');
}

function getTgUser() {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        return {
          id: String(user.id),
          name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
        };
      }
    }
  } catch (e) {}
  // Fallback for testing outside Telegram
  const fallbackId = 'test_' + Math.random().toString(36).slice(2, 8);
  return { id: fallbackId, name: 'Тестовый пользователь' };
}

export default function App() {
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useState(() => getTgUser());
  const sessionId = getSessionId();

  useEffect(() => {
    if (!sessionId) {
      setError('Не указан ID сессии. Откройте приложение через ссылку от бота.');
      setLoading(false);
      return;
    }
    fetchSession();
  }, [sessionId]);

  async function fetchSession() {
    try {
      const res = await fetch(`${API_BASE}/api/session/${sessionId}`);
      if (!res.ok) throw new Error('Сессия не найдена');
      const data = await res.json();
      setSession(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectRole(selectedRole) {
    try {
      const res = await fetch(`${API_BASE}/api/session/${sessionId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          userId: user.id,
          userName: user.name
        })
      });
      const data = await res.json();
      if (data.ok) {
        setSession(data.session);
        setRole(selectedRole);
      }
    } catch (e) {
      setError('Ошибка регистрации: ' + e.message);
    }
  }

  async function updateProgress(taskId, taskData) {
    try {
      const res = await fetch(`${API_BASE}/api/session/${sessionId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          userId: user.id,
          userName: user.name,
          taskId,
          taskData
        })
      });
      const data = await res.json();
      if (data.ok) {
        setSession(data.session);
      }
    } catch (e) {
      console.error('Progress update failed:', e);
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!role) {
    return (
      <RoleSelect
        sessionName={session?.name}
        onSelect={selectRole}
      />
    );
  }

  if (role === 'tech') {
    return (
      <TechPanel
        session={session}
        user={user}
        sessionId={sessionId}
        onUpdate={updateProgress}
        onRefresh={fetchSession}
      />
    );
  }

  return (
    <ParticipantPanel
      session={session}
      user={user}
      sessionId={sessionId}
      onUpdate={updateProgress}
      onRefresh={fetchSession}
    />
  );
}
