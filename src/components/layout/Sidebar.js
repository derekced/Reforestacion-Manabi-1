export function Sidebar() {
  return (
    <aside className="sidebar">
      <nav>
        <a href="/inicio">Inicio</a>
        <a href="/proyectos">Proyectos</a>
        <a href="/usuarios">Usuarios</a>
        {/* ...más secciones si lo llegaramos a necesitar */}
      </nav>
      <div className="sidebar-footer">
        <button onClick={toggleTheme}>Modo oscuro</button>
        {/* Perfil/correo */}
      </div>
    </aside>
  );
}

