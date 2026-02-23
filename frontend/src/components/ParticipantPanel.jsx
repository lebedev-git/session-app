import React, { useState } from 'react';
import TaskList from './TaskList.jsx';

const PARTICIPANT_TASKS = [
  { id: 'laptop', title: 'Ноутбук', icon: '💻' },
  { id: 'chrome', title: 'Google Chrome', icon: '🌐' },
  { id: 'services', title: 'Сервисы', icon: '🔗' }
];

export default function ParticipantPanel({ session, user, sessionId, onUpdate, onRefresh }) {
  const [selectedTask, setSelectedTask] = useState('laptop');
  const partData = session?.participants?.[user.id];
  const tasks = partData?.tasks || {};

  function renderTaskContent(taskId) {
    const task = tasks[taskId] || {};

    if (taskId === 'laptop') {
      return (
        <div className="task-content">
          <h3>Подготовка ноутбука</h3>
          <div className="instruction">
            <p>Какой ноутбук вы будете использовать?</p>
          </div>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${partData?.laptopType === 'personal' ? 'active' : ''}`}
              onClick={async () => {
                await fetch(`/api/session/${sessionId}/progress`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    role: 'participant', userId: user.id, userName: user.name,
                    laptopType: 'personal', taskId: 'laptop', taskData: { status: 'in_progress' }
                  })
                });
                onRefresh();
              }}
            >Свой личный</button>
            <button
              className={`toggle-btn ${partData?.laptopType === 'corporate' ? 'active' : ''}`}
              onClick={async () => {
                await fetch(`/api/session/${sessionId}/progress`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    role: 'participant', userId: user.id, userName: user.name,
                    laptopType: 'corporate', taskId: 'laptop', taskData: { status: 'done' }
                  })
                });
                onRefresh();
              }}
            >Корпоративный</button>
          </div>

          {partData?.laptopType === 'personal' && (
            <div className="info-box">
              <h4>Рекомендуемые характеристики:</h4>
              <ul>
                <li>Оперативная память: ≥ 8 GB</li>
                <li>Накопитель: SSD</li>
                <li>Размер экрана: ≥ 13"</li>
                <li>Актуальная версия ОС</li>
              </ul>
              <button className="btn btn-done" onClick={() => onUpdate('laptop', { status: 'done' })}>
                Мой ноутбук соответствует
              </button>
            </div>
          )}

          {task.status === 'done' && <div className="status-badge done">Выполнено ✅</div>}
        </div>
      );
    }

    if (taskId === 'chrome') {
      return (
        <div className="task-content">
          <h3>Google Chrome</h3>
          <div className="instruction">
            <p>Для работы с сервисами необходим браузер Google Chrome.</p>
            <p>Если он ещё не установлен, скачайте его:</p>
            <a
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener"
              className="btn btn-link"
            >
              Скачать Google Chrome
            </a>
          </div>
          {task.status !== 'done' ? (
            <button className="btn btn-done" onClick={() => onUpdate('chrome', { status: 'done' })}>
              Chrome установлен ✓
            </button>
          ) : (
            <div className="status-badge done">Выполнено ✅</div>
          )}
        </div>
      );
    }

    if (taskId === 'services') {
      const completed = task.completed || [];
      const allServices = ['suno', 'perplexity'];
      const allDone = allServices.every(s => completed.includes(s));

      function toggleService(service) {
        const newCompleted = completed.includes(service)
          ? completed.filter(s => s !== service)
          : [...completed, service];
        const newPending = allServices.filter(s => !newCompleted.includes(s));
        const status = newPending.length === 0 ? 'done' : 'in_progress';
        onUpdate('services', { status, completed: newCompleted, pending: newPending });
      }

      return (
        <div className="task-content">
          <h3>Проверка сервисов</h3>
          <div className="instruction">
            <p>Войдите в каждый сервис и подтвердите, что доступ работает:</p>
          </div>
          <div className="services-list">
            {allServices.map(service => (
              <label key={service} className="check-item service-item">
                <input
                  type="checkbox"
                  checked={completed.includes(service)}
                  onChange={() => toggleService(service)}
                />
                <span className="service-name">{service.charAt(0).toUpperCase() + service.slice(1)}</span>
              </label>
            ))}
          </div>
          {allDone && <div className="status-badge done">Все сервисы подтверждены ✅</div>}
        </div>
      );
    }

    return null;
  }

  const taskListItems = PARTICIPANT_TASKS.map(t => ({
    ...t,
    status: tasks[t.id]?.status || 'pending'
  }));

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Участник</h2>
        <span className="user-name">{user.name}</span>
      </div>
      <div className="panel-body">
        <TaskList
          tasks={taskListItems}
          selected={selectedTask}
          onSelect={setSelectedTask}
        />
        <div className="task-detail-area">
          {renderTaskContent(selectedTask)}
        </div>
      </div>
    </div>
  );
}
