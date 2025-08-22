<?php
require_once '../includes/auth.php';
require_once '../includes/tasks.php';

// Redirigir si no está logueado
if (!$auth->isLoggedIn()) {
    header("Location: login.php");
    exit;
}

$user = $auth->getCurrentUser();
$user_id = $user['id'];

// Procesar filtros
$filters = [];
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_GET['status'])) {
        $filters['status'] = $_GET['status'];
    }
    if (!empty($_GET['priority'])) {
        $filters['priority'] = $_GET['priority'];
    }
    if (!empty($_GET['due_date'])) {
        $filters['due_date'] = $_GET['due_date'];
    }
}

// Obtener tareas
$tasks = $task->getAll($user_id, $filters);

// Procesar eliminación de tarea
if (isset($_GET['delete'])) {
    $task_id = $_GET['delete'];
    $result = $task->delete($task_id, $user_id);
    
    if ($result === true) {
        header("Location: tasks.php?success=delete");
        exit;
    } else {
        $error = $result;
    }
}

// Mensajes de éxito
$success = '';
if (isset($_GET['success'])) {
    switch ($_GET['success']) {
        case 'create':
            $success = 'Tarea creada correctamente.';
            break;
        case 'update':
            $success = 'Tarea actualizada correctamente.';
            break;
        case 'delete':
            $success = 'Tarea eliminada correctamente.';
            break;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Tareas - Gestor de Tareas</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <?php include '../includes/header.php'; ?>
    
    <div class="container">
        <div class="page-header">
            <h1>Mis Tareas</h1>
            <a href="add_task.php" class="btn btn-primary">Nueva Tarea</a>
        </div>
        
        <?php if (!empty($success)): ?>
            <div class="success-message"><?php echo $success; ?></div>
        <?php endif; ?>
        
        <?php if (!empty($error)): ?>
            <div class="error-message"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <!-- Filtros -->
        <div class="filters">
            <h2>Filtrar Tareas</h2>
            <form method="GET" action="">
                <div class="filter-group">
                    <label for="status">Estado:</label>
                    <select id="status" name="status">
                        <option value="">Todos</option>
                        <option value="pendiente" <?php echo isset($filters['status']) && $filters['status'] == 'pendiente' ? 'selected' : ''; ?>>Pendiente</option>
                        <option value="en progreso" <?php echo isset($filters['status']) && $filters['status'] == 'en progreso' ? 'selected' : ''; ?>>En Progreso</option>
                        <option value="completada" <?php echo isset($filters['status']) && $filters['status'] == 'completada' ? 'selected' : ''; ?>>Completada</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="priority">Prioridad:</label>
                    <select id="priority" name="priority">
                        <option value="">Todas</option>
                        <option value="alta" <?php echo isset($filters['priority']) && $filters['priority'] == 'alta' ? 'selected' : ''; ?>>Alta</option>
                        <option value="media" <?php echo isset($filters['priority']) && $filters['priority'] == 'media' ? 'selected' : ''; ?>>Media</option>
                        <option value="baja" <?php echo isset($filters['priority']) && $filters['priority'] == 'baja' ? 'selected' : ''; ?>>Baja</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label for="due_date">Fecha Límite:</label>
                    <input type="date" id="due_date" name="due_date" value="<?php echo isset($filters['due_date']) ? $filters['due_date'] : ''; ?>">
                </div>
                
                <button type="submit" class="btn">Filtrar</button>
                <a href="tasks.php" class="btn btn-secondary">Limpiar Filtros</a>
            </form>
        </div>
        
        <!-- Lista de tareas -->
        <div class="tasks-list">
            <?php if (count($tasks) > 0): ?>
                <?php foreach ($tasks as $t): ?>
                    <div class="task-item <?php echo $t['status']; ?>">
                        <div class="task-header">
                            <h3><?php echo htmlspecialchars($t['title']); ?></h3>
                            <span class="priority-badge <?php echo $t['priority']; ?>"><?php echo ucfirst($t['priority']); ?></span>
                        </div>
                        
                        <div class="task-details">
                            <p><?php echo nl2br(htmlspecialchars($t['description'])); ?></p>
                            
                            <div class="task-meta">
                                <span class="due-date">Vence: <?php echo $t['due_date'] ? date('d/m/Y', strtotime($t['due_date'])) : 'Sin fecha'; ?></span>
                                <span class="status">Estado: <?php echo ucfirst($t['status']); ?></span>
                            </div>
                        </div>
                        
                        <div class="task-actions">
                            <a href="edit_task.php?id=<?php echo $t['id']; ?>" class="btn btn-small">Editar</a>
                            <a href="tasks.php?delete=<?php echo $t['id']; ?>" class="btn btn-small btn-danger" onclick="return confirm('¿Estás seguro de que quieres eliminar esta tarea?')">Eliminar</a>
                            
                            <?php if ($t['status'] != 'completada'): ?>
                                <a href="update_status.php?id=<?php echo $t['id']; ?>&status=completada" class="btn btn-small btn-success">Completar</a>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="no-tasks">
                    <p>No hay tareas para mostrar. <a href="add_task.php">Crea tu primera tarea</a></p>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <?php include '../includes/footer.php'; ?>
    
    <script src="../js/script.js"></script>
</body>
</html>