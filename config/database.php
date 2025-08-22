<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'todo_app');
define('DB_USER', 'root');
define('DB_PASS', '');

// Conexión a la base de datos usando MySQLi
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
            
            if ($this->conn->connect_error) {
                throw new Exception("Error de conexión: " . $this->conn->connect_error);
            }
            
            $this->conn->set_charset("utf8");
        } catch(Exception $e) {
            echo "Error: " . $e->getMessage();
        }
        return $this->conn;
    }
}
?>