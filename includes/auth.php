<?php
session_start();
require_once 'config/database.php';

class Auth {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    // Registrar nuevo usuario
    public function register($username, $email, $password) {
        // Validar entrada
        if (empty($username) || empty($email) || empty($password)) {
            return "Todos los campos son obligatorios.";
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return "El formato de email no es válido.";
        }

        if (strlen($password) < 6) {
            return "La contraseña debe tener al menos 6 caracteres.";
        }

        // Verificar si el usuario ya existe
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->close();
            return "El nombre de usuario o email ya existe.";
        }
        $stmt->close();

        // Hash de la contraseña
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insertar nuevo usuario
        $stmt = $this->conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $hashed_password);

        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return "Error al registrar el usuario: " . $this->conn->error;
        }
    }

    // Iniciar sesión
    public function login($username, $password) {
        if (empty($username) || empty($password)) {
            return "Todos los campos son obligatorios.";
        }

        $stmt = $this->conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows == 1) {
            $stmt->bind_result($id, $username, $hashed_password);
            $stmt->fetch();

            if (password_verify($password, $hashed_password)) {
                $_SESSION['user_id'] = $id;
                $_SESSION['username'] = $username;
                $_SESSION['logged_in'] = true;
                
                $stmt->close();
                return true;
            } else {
                $stmt->close();
                return "Contraseña incorrecta.";
            }
        } else {
            $stmt->close();
            return "No existe un usuario con ese nombre.";
        }
    }

    // Cerrar sesión
    public function logout() {
        session_destroy();
        header("Location: login.php");
        exit;
    }

    // Verificar si el usuario está logueado
    public function isLoggedIn() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }

    // Obtener información del usuario actual
    public function getCurrentUser() {
        if ($this->isLoggedIn()) {
            return [
                'id' => $_SESSION['user_id'],
                'username' => $_SESSION['username']
            ];
        }
        return null;
    }
}

$auth = new Auth();
?>