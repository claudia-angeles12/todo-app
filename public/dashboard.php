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

// Obtener estadísticas
$stats = $task->getDashboardStats($user_id);

// Obtener tareas próximas (próximos 7 días)
$upcoming_tasks = $task->getAll($user_id, [
    'status' => 'pendiente',
    'due_date' => date('Y-m-d', strtotime('+7 days'))
]);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Gestor de Tareas</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <?php include '../includes/header.php'; ?>
    
    <div class="container">
        <h1>Dashboard</h1>
        
        <!-- Estadísticas -->
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3><?php echo $stats['total']; ?></h3>
                <p>Total de Tareas</p>
            </div>
            
            <div class="stat-card">
                <h3><?php echo $stats['completed']; ?></h3>
                <p>Tareas Completadas</p>
            </div>
            
            <div class="stat-card">
                <h3><?php echo $stats['pending']; ?></h3>
                <p>Tareas Pendientes</p>
            </div>
            
            <div class="stat-card">
                <h3><?php echo isset($stats['priority']['alta']) ? $stats['priority']['alta'] : 0; ?></h3>
                <p>Tareas de Prioridad Alta</p>
            </div>
        </div>
        
        <!-- Tareas próximas -->
        <div class="page-header">
            <h2>Tareas Próximas (7 días)</h2>
        </div>
        
        <div class="tasks-list">
            <?php if (count($upcoming_tasks) > 0): ?>
                <?php foreach ($upcoming_tasks as $t): ?>
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
                    <p>No hay tareas próximas en los próximos 7 días.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <?php include '../includes/footer.php'; ?>
    
    <script src="../js/script.js"></script>
</body>
</html>