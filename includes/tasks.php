<?php
require_once 'config/database.php';

class Task {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    // Crear nueva tarea
    public function create($user_id, $title, $description, $due_date, $priority) {
        // Validar entrada
        if (empty($title)) {
            return "El título es obligatorio.";
        }

        $stmt = $this->conn->prepare("INSERT INTO tasks (user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issss", $user_id, $title, $description, $due_date, $priority);

        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return "Error al crear la tarea: " . $this->conn->error;
        }
    }

    // Obtener todas las tareas del usuario
    public function getAll($user_id, $filters = []) {
        $query = "SELECT * FROM tasks WHERE user_id = ?";
        $types = "i";
        $params = [$user_id];
        
        // Aplicar filtros
        if (!empty($filters['status'])) {
            $query .= " AND status = ?";
            $types .= "s";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['priority'])) {
            $query .= " AND priority = ?";
            $types .= "s";
            $params[] = $filters['priority'];
        }
        
        if (!empty($filters['due_date'])) {
            $query .= " AND due_date = ?";
            $types .= "s";
            $params[] = $filters['due_date'];
        }
        
        // Ordenar por fecha de vencimiento
        $query .= " ORDER BY due_date ASC, created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Vincular parámetros dinámicamente
        if (count($params) > 1) {
            $stmt->bind_param($types, ...$params);
        } else {
            $stmt->bind_param($types, $user_id);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $tasks = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        return $tasks;
    }

    // Obtener una tarea específica
    public function getById($task_id, $user_id) {
        $stmt = $this->conn->prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $task_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $task = $result->fetch_assoc();
        $stmt->close();
        
        return $task;
    }

    // Actualizar una tarea
    public function update($task_id, $user_id, $title, $description, $due_date, $priority, $status) {
        if (empty($title)) {
            return "El título es obligatorio.";
        }

        $stmt = $this->conn->prepare("UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ? WHERE id = ? AND user_id = ?");
        $stmt->bind_param("sssssii", $title, $description, $due_date, $priority, $status, $task_id, $user_id);

        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return "Error al actualizar la tarea: " . $this->conn->error;
        }
    }

    // Eliminar una tarea
    public function delete($task_id, $user_id) {
        $stmt = $this->conn->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $task_id, $user_id);

        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return "Error al eliminar la tarea: " . $this->conn->error;
        }
    }

    // Obtener estadísticas del dashboard
    public function getDashboardStats($user_id) {
        $stats = [];
        
        // Total de tareas
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM tasks WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $stats['total'] = $result->fetch_assoc()['total'];
        $stmt->close();
        
        // Tareas completadas
        $stmt = $this->conn->prepare("SELECT COUNT(*) as completed FROM tasks WHERE user_id = ? AND status = 'completada'");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $stats['completed'] = $result->fetch_assoc()['completed'];
        $stmt->close();
        
        // Tareas pendientes
        $stats['pending'] = $stats['total'] - $stats['completed'];
        
        // Tareas por prioridad
        $stmt = $this->conn->prepare("SELECT priority, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY priority");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $priority_stats = [];
        while ($row = $result->fetch_assoc()) {
            $priority_stats[$row['priority']] = $row['count'];
        }
        $stmt->close();
        
        $stats['priority'] = $priority_stats;
        
        return $stats;
    }
}

$task = new Task();
?>