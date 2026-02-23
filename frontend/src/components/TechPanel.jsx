import React, { useState } from 'react';
import TaskList from './TaskList.jsx';
import TaskDetail from './TaskDetail.jsx';
import PhotoUpload from './PhotoUpload.jsx';

const TECH_TASKS = [
  { id: 'internet', title: 'Интернет', icon: '🌐' },
  { id: 'workspace', title: 'Рабочее пространство', icon: '🏢' },
  { id: 'laptops', title: 'Ноутбуки', icon: '💻' }
];

export default function TechPanel({ session, user, sessionId, onUpdate, onRefresh }) {
  const [selectedTask, setSelectedTask] = useState('internet');
  const techData = session?.techSpecialists?.[user.id];
  const tasks = techData?.tasks || {};

  function renderTaskContent(taskId) {
    const task = tasks[taskId] || {};

    if (taskId === 'internet') {
      return (
        <div className="task-content">
          <h3>Проверка интернета</h3>
          <div className="instruction">
            <p>1. Перейдите на <a href="https://www.speedtest.net" target="_blank" rel="noopener">speedtest.net</a></p>
            <p>2. Нажмите «Go» и дождитесь результатов</p>
            <p>3. Сделайте скриншот результатов</p>
          </div>
          <div className="requirements">
            <h4>Рекомендуемые параметры:</h4>
            <ul>
              <li>Загрузка: ≥ 50 Мбит/с</li>
              <li>Отдача: ≥ 10 Мбит/с</li>
              <li>Пинг: ≤ 30 мс</li>
            </ul>
          </div>
          <PhotoUpload
            sessionId={sessionId}
            userId={user.id}
            taskId="internet"
            role="tech"
            currentPhoto={task.screenshot}
            onUploaded={onRefresh}
          />
          {task.status !== 'done' && !task.screenshot && (
            <button className="btn btn-done" onClick={() => onUpdate('internet', { status: 'done' })}>
              Отметить выполненным
            </button>
          )}
          {task.status === 'done' && <div className="status-badge done">Выполнено ✅</div>}
        </div>
      );
    }

    if (taskId === 'workspace') {
      return (
        <div className="task-content">
          <h3>Рабочее пространство</h3>
          <div className="instruction">
            <p>Подготовьте рабочее пространство для проведения сессии:</p>
            <ul>
              <li>Расставьте столы и стулья</li>
              <li>Подготовьте спикерское место</li>
              <li>Проверьте проектор / экран</li>
              <li>Проверьте звуковое оборудование</li>
            </ul>
            <p>Сделайте фото подготовленного пространства.</p>
          </div>
          <PhotoUpload
            sessionId={sessionId}
            userId={user.id}
            taskId="workspace"
            role="tech"
            currentPhoto={task.photo}
            onUploaded={onRefresh}
          />
          {task.status !== 'done' && !task.photo && (
            <button className="btn btn-done" onClick={() => onUpdate('workspace', { status: 'done' })}>
              Отметить выполненным
            </button>
          )}
          {task.status === 'done' && <div className="status-badge done">Выполнено ✅</div>}
        </div>
      );
    }

    if (taskId === 'laptops') {
      return (
        <div className="task-content">
          <h3>Подготовка ноутбуков</h3>
          <div className="instruction">
            <p>Ноутбуки корпоративные?</p>
          </div>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${task.corporate === true ? 'active' : ''}`}
              onClick={() => onUpdate('laptops', { corporate: true })}
            >Да, корпоративные</button>
            <button
              className={`toggle-btn ${task.corporate === false ? 'active' : ''}`}
              onClick={() => onUpdate('laptops', { corporate: false })}
            >Нет, личные</button>
          </div>

          {task.corporate === true && (
            <div className="checklist">
              <h4>Чеклист для корпоративных ноутбуков:</h4>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={task.checklist?.chrome || false}
                  onChange={(e) => onUpdate('laptops', {
                    checklist: { ...task.checklist, chrome: e.target.checked }
                  })}
                />
                Google Chrome установлен
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={task.checklist?.accounts || false}
                  onChange={(e) => onUpdate('laptops', {
                    checklist: { ...task.checklist, accounts: e.target.checked }
                  })}
                />
                Учётные записи настроены
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={task.checklist?.network || false}
                  onChange={(e) => onUpdate('laptops', {
                    checklist: { ...task.checklist, network: e.target.checked }
                  })}
                />
                Подключение к сети проверено
              </label>
            </div>
          )}

          {task.corporate === false && (
            <div className="info-box">
              <p>Участники будут использовать личные ноутбуки. Убедитесь, что Wi-Fi доступен для всех устройств.</p>
            </div>
          )}

          {task.status !== 'done' && (
            <button className="btn btn-done" onClick={() => onUpdate('laptops', { status: 'done' })}>
              Отметить выполненным
            </button>
          )}
          {task.status === 'done' && <div className="status-badge done">Выполнено ✅</div>}
        </div>
      );
    }

    return null;
  }

  const taskListItems = TECH_TASKS.map(t => ({
    ...t,
    status: tasks[t.id]?.status || 'pending'
  }));

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Тех. специалист</h2>
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
