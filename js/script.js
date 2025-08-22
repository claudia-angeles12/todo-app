// Validación de formularios
document.addEventListener('DOMContentLoaded', function() {
    // Validación de formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirm_password');
            
            if (password.value !== confirmPassword.value) {
                e.preventDefault();
                alert('Las contraseñas no coinciden.');
                confirmPassword.focus();
            }
            
            if (password.value.length < 6) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 6 caracteres.');
                password.focus();
            }
        });
    }
    
    // Validación de formulario de tareas
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            const title = document.getElementById('title');
            
            if (title.value.trim() === '') {
                e.preventDefault();
                alert('El título de la tarea es obligatorio.');
                title.focus();
            }
        });
    }
    
    // Mostrar/ocultar filtros
    const toggleFiltersBtn = document.getElementById('toggleFilters');
    const filtersSection = document.getElementById('filtersSection');
    
    if (toggleFiltersBtn && filtersSection) {
        toggleFiltersBtn.addEventListener('click', function() {
            filtersSection.classList.toggle('hidden');
        });
    }
    
    // Confirmación para eliminación
    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                e.preventDefault();
            }
        });
    });
});

// Funciones para mostrar mensajes temporales
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    document.body.prepend(messageDiv);
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}