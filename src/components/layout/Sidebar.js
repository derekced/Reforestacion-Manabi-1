export function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <a href="/inicio">Inicio</a>
        <a href="/proyectos">Proyectos</a>
        <a href="/usuarios">Usuarios</a>
        {/* ...más secciones según tu app */}
      </nav>
      <div className="sidebar-footer">
        <button onClick={toggleTheme}>Modo oscuro</button>
        {/* Perfil/correo visible */}
      </div>
    </aside>
  );
}

