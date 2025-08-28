// TaskFlow Demo - Funcionalidad completa con LocalStorage
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilters = {
            status: ['pending', 'in-progress', 'completed'],
            priority: ['high', 'medium', 'low'],
            date: 'all',
            search: ''
        };
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDashboard();
        this.renderTasks();
        this.setupNavigation();
    }

    // Cargar tareas desde localStorage
    loadTasks() {
        const tasksJSON = localStorage.getItem('taskflow_tasks');
        if (tasksJSON) {
            return JSON.parse(tasksJSON);
        }
        
        // Datos de ejemplo si no hay tareas
        return [
            {
                id: 1,
                title: "Reunión con equipo de desarrollo",
                description: "Revisar avances del proyecto TaskFlow",
                dueDate: new Date().toISOString().split('T')[0],
                priority: "high",
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Preparar documentación técnica",
                description: "Completar README.md con instrucciones de instalación",
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                priority: "medium",
                status: "completed",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    // Guardar tareas en localStorage
    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
    }

    // Configurar event listeners
    setupEventListeners() {
        // Formulario de tarea
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Botón cancelar formulario
        document.getElementById('cancel-form').addEventListener('click', () => {
            this.showView('tasks');
        });

        // Botón nueva tarea
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.resetForm();
            this.showView('add');
        });

        // Búsqueda de tareas
        document.getElementById('task-search').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.renderTasks();
        });

        // Aplicar filtros
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });

        // Limpiar filtros
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Toggle de tema
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Modal de confirmación
        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.hideModal();
        });
    }

    // Navegación entre vistas
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.showView(view);
            });
        });
    }

    // Mostrar vista específica
    showView(viewName) {
        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
        
        // Actualizar título
        const viewTitle = document.getElementById('view-title');
        const viewText = document.querySelector(`[data-view="${viewName}"] .nav-text`).textContent;
        viewTitle.textContent = viewText;
        
        // Mostrar vista
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`view-${viewName}`).classList.add('active');
        
        // Actualizar contenido si es necesario
        if (viewName === 'dashboard') {
            this.renderDashboard();
        } else if (viewName === 'tasks') {
            this.renderTasks();
        }
    }

    // Guardar tarea (crear o editar)
    saveTask() {
        const taskId = document.getElementById('task-id').value;
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-due-date').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value,
            updatedAt: new Date().toISOString()
        };

        if (!taskData.title.trim()) {
            this.showToast('El título de la tarea es obligatorio', 'error');
            return;
        }

        if (taskId) {
            // Editar tarea existente
            const index = this.tasks.findIndex(task => task.id === parseInt(taskId));
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...taskData };
                this.showToast('Tarea actualizada correctamente', 'success');
            }
        } else {
            // Crear nueva tarea
            const newTask = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                ...taskData
            };
            this.tasks.unshift(newTask);
            this.showToast('Tarea creada correctamente', 'success');
        }

        this.saveTasks();
        this.renderDashboard();
        this.renderTasks();
        this.showView('tasks');
    }

    // Editar tarea
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('form-title').textContent = 'Editar tarea';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;

        this.showView('add');
    }

    // Solicitar eliminación de tarea
    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.showModal(
            'Eliminar tarea',
            `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
            () => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
                this.renderDashboard();
                this.renderTasks();
                this.showToast('Tarea eliminada correctamente', 'success');
            }
        );
    }

    // Cambiar estado de tarea
    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.status = task.status === 'completed' ? 'pending' : 'completed';
        task.updatedAt = new Date().toISOString();
        
        this.saveTasks();
        this.renderDashboard();
        this.renderTasks();
        
        const statusText = task.status === 'completed' ? 'completada' : 'pendiente';
        this.showToast(`Tarea marcada como ${statusText}`, 'success');
    }

    // Aplicar filtros
    applyFilters() {
        const statusFilters = [];
        document.querySelectorAll('input[name="status"]:checked').forEach(checkbox => {
            statusFilters.push(checkbox.value);
        });

        const priorityFilters = [];
        document.querySelectorAll('input[name="priority"]:checked').forEach(checkbox => {
            priorityFilters.push(checkbox.value);
        });

        const dateFilter = document.querySelector('input[name="date-filter"]:checked').value;

        this.currentFilters.status = statusFilters;
        this.currentFilters.priority = priorityFilters;
        this.currentFilters.date = dateFilter;

        this.renderTasks();
        this.showView('tasks');
    }

    // Limpiar filtros
    clearFilters() {
        document.querySelectorAll('input[name="status"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        document.querySelectorAll('input[name="priority"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        document.querySelector('input[name="date-filter"][value="all"]').checked = true;
        
        this.currentFilters = {
            status: ['pending', 'in-progress', 'completed'],
            priority: ['high', 'medium', 'low'],
            date: 'all',
            search: ''
        };
        
        document.getElementById('task-search').value = '';
        this.renderTasks();
    }

    // Resetear formulario
    resetForm() {
        document.getElementById('form-title').textContent = 'Crear nueva tarea';
        document.getElementById('task-id').value = '';
        document.getElementById('task-form').reset();
    }

    // Filtrar tareas según los criterios actuales
    getFilteredTasks() {
        return this.tasks.filter(task => {
            // Filtrar por estado
            if (!this.currentFilters.status.includes(task.status)) {
                return false;
            }
            
            // Filtrar por prioridad
            if (!this.currentFilters.priority.includes(task.priority)) {
                return false;
            }
            
            // Filtrar por búsqueda
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                if (!task.title.toLowerCase().includes(searchTerm) && 
                    !(task.description && task.description.toLowerCase().includes(searchTerm))) {
                    return false;
                }
            }
            
            // Filtrar por fecha
            if (this.currentFilters.date !== 'all' && task.dueDate) {
                const today = new Date();
                const taskDate = new Date(task.dueDate);
                
                switch (this.currentFilters.date) {
                    case 'today':
                        if (taskDate.toDateString() !== today.toDateString()) return false;
                        break;
                    case 'week':
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        startOfWeek.setHours(0, 0, 0, 0);
                        
                        const endOfWeek = new Date(today);
                        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
                        endOfWeek.setHours(23, 59, 59, 999);
                        
                        if (taskDate < startOfWeek || taskDate > endOfWeek) return false;
                        break;
                    case 'month':
                        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
                        
                        if (taskDate < startOfMonth || taskDate > endOfMonth) return false;
                        break;
                }
            }
            
            return true;
        });
    }

    // Renderizar dashboard
    renderDashboard() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = this.tasks.filter(task => task.status === 'pending').length;
        const inProgressTasks = this.tasks.filter(task => task.status === 'in-progress').length;
        
        // Actualizar estadísticas
        document.getElementById('stats-container').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalTasks}</div>
                <div class="stat-label">Tareas totales</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${completedTasks}</div>
                <div class="stat-label">Completadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${pendingTasks}</div>
                <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${inProgressTasks}</div>
                <div class="stat-label">En progreso</div>
            </div>
        `;
        
        // Mostrar tareas recientes (últimas 5)
        const recentTasks = this.tasks
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);
        
        let recentTasksHTML = '';
        if (recentTasks.length > 0) {
            recentTasks.forEach(task => {
                recentTasksHTML += this.renderTaskItem(task);
            });
        } else {
            recentTasksHTML = '<p class="empty-state">No hay tareas recientes</p>';
        }
        
        document.getElementById('recent-tasks-container').innerHTML = recentTasksHTML;
        
        // Añadir event listeners a las tareas recientes
        this.attachTaskEventListeners();
    }

    // Renderizar todas las tareas
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        let tasksHTML = '';
        
        if (filteredTasks.length > 0) {
            filteredTasks.forEach(task => {
                tasksHTML += this.renderTaskItem(task);
            });
        } else {
            tasksHTML = `
                <div class="empty-state">
                    <p>No hay tareas que coincidan con los filtros aplicados.</p>
                    <button class="btn btn-primary" onclick="taskManager.showView('add')">
                        Crear nueva tarea
                    </button>
                </div>
            `;
        }
        
        document.getElementById('all-tasks-container').innerHTML = tasksHTML;
        
        // Actualizar filtros activos
        this.renderActiveFilters();
        
        // Añadir event listeners a las tareas
        this.attachTaskEventListeners();
    }

    // Renderizar elemento de tarea
    renderTaskItem(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha';
        const priorityLabels = {
            'high': 'Alta',
            'medium': 'Media',
            'low': 'Baja'
        };
        const statusLabels = {
            'pending': 'Pendiente',
            'in-progress': 'En progreso',
            'completed': 'Completada'
        };
        
        return `
            <div class="task-item priority-${task.priority} status-${task.status}" data-id="${task.id}">
                <div class="task-check">
                    <input type="checkbox" id="task-${task.id}" ${task.status === 'completed' ? 'checked' : ''}>
                    <label for="task-${task.id}"></label>
                </div>
                <div class="task-content">
                    <h3>${this.escapeHTML(task.title)}</h3>
                    ${task.description ? `<p>${this.escapeHTML(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-date">${dueDate}</span>
                        <span class="task-priority">${priorityLabels[task.priority]}</span>
                        <span class="task-status">${statusLabels[task.status]}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-edit" title="Editar tarea">✏️</button>
                    <button class="btn-icon btn-delete" title="Eliminar tarea">🗑️</button>
                </div>
            </div>
        `;
    }

    // Renderizar filtros activos
    renderActiveFilters() {
        const activeFilters = document.getElementById('active-filters');
        let filtersHTML = '';
        
        if (this.currentFilters.status.length < 3) {
            filtersHTML += `<span class="filter-tag">Estados: ${this.currentFilters.status.map(s => {
                const statusLabels = { 'pending': 'Pendiente', 'in-progress': 'En progreso', 'completed': 'Completada' };
                return statusLabels[s];
            }).join(', ')}</span>`;
        }
        
        if (this.currentFilters.priority.length < 3) {
            filtersHTML += `<span class="filter-tag">Prioridades: ${this.currentFilters.priority.map(p => {
                const priorityLabels = { 'high': 'Alta', 'medium': 'Media', 'low': 'Baja' };
                return priorityLabels[p];
            }).join(', ')}</span>`;
        }
        
        if (this.currentFilters.date !== 'all') {
            const dateLabels = { 'today': 'Hoy', 'week': 'Esta semana', 'month': 'Este mes' };
            filtersHTML += `<span class="filter-tag">Fecha: ${dateLabels[this.currentFilters.date]}</span>`;
        }
        
        if (this.currentFilters.search) {
            filtersHTML += `<span class="filter-tag">Búsqueda: "${this.currentFilters.search}"</span>`;
        }
        
        if (filtersHTML) {
            filtersHTML = `<span class="filter-tag">Filtros activos:</span>${filtersHTML}<button id="clear-all-filters" class="btn-text">Limpiar todos</button>`;
        }
        
        activeFilters.innerHTML = filtersHTML;
        
        // Añadir event listener al botón de limpiar filtros
        const clearAllBtn = document.getElementById('clear-all-filters');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    // Añadir event listeners a las tareas
    attachTaskEventListeners() {
        // Checkboxes para cambiar estado
        document.querySelectorAll('.task-check input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').getAttribute('data-id'));
                this.toggleTaskStatus(taskId);
            });
        });
        
        // Botones editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').getAttribute('data-id'));
                this.editTask(taskId);
            });
        });
        
        // Botones eliminar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').getAttribute('data-id'));
                this.deleteTask(taskId);
            });
        });
    }

    // Mostrar modal de confirmación
    showModal(title, message, confirmCallback) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal-confirm').onclick = () => {
            confirmCallback();
            this.hideModal();
        };
        document.getElementById('confirm-modal').style.display = 'flex';
    }

    // Ocultar modal
    hideModal() {
        document.getElementById('confirm-modal').style.display = 'none';
    }

    // Mostrar notificación toast
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.className = `toast toast-${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(100px)';
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // Cambiar tema claro/oscuro
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const icon = document.querySelector('#theme-toggle .icon');
        icon.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        
        // Guardar preferencia
        localStorage.setItem('taskflow_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    }

    // Utilidad para escapar HTML
    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m]));
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('taskflow_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelector('#theme-toggle .icon').textContent = '☀️';
    }
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('confirm-modal').addEventListener('click', (e) => {
        if (e.target.id === 'confirm-modal') {
            taskManager.hideModal();
        }
    });
});