<?php
require_once '../includes/auth.php';

// Redirigir si ya está logueado
if ($auth->isLoggedIn()) {
    header("Location: dashboard.php");
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    $result = $auth->login($username, $password);
    
    if ($result === true) {
        header("Location: dashboard.php");
        exit;
    } else {
        $error = $result;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Gestor de Tareas</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="container">
        <div class="login-form">
            <h1>Iniciar Sesión</h1>
            
            <?php if (!empty($error)): ?>
                <div class="error-message"><?php echo $error; ?></div>
            <?php endif; ?>
            
            <form method="POST" action="">
                <div class="form-group">
                    <label for="username">Usuario:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit" class="btn">Iniciar Sesión</button>
            </form>
            
            <p>¿No tienes una cuenta? <a href="register.php">Regístrate aquí</a></p>
        </div>
    </div>
    
    <script src="../js/script.js"></script>
</body>
</html>