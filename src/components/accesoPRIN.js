import React from "react";


export function AccessEntry({ onLogin, onRegister, onGuest }) {
  return (
    <div className="access-entry-container">
      <div className="access-card">
        <h1>Bienvenido</h1>
        <p>Accede con tu cuenta o únete a la plataforma</p>
        <div className="access-actions">
          <button className="btn-primary" onClick={onLogin}>
            Iniciar Sesión
          </button>
          <button className="btn-secondary" onClick={onRegister}>
            Registrarse
          </button>
          <button className="btn-ghost" onClick={onGuest}>
            Ingresar como Invitado
          </button>
        </div>
      </div>
      {/* Estilos de ejemplo, puedes usar tailwind o tus propias clases */}
      <style jsx>{`
        .access-entry-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f6f8f7;
        }
        .access-card {
          background: #fff;
          border-radius: 1.2rem;
          padding: 3rem 2rem 2.5rem 2rem;
          box-shadow: 0 3px 18px rgba(30, 50, 52, 0.10);
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 340px;
        }
        h1 {
          color: #1a693e;
          margin-bottom: 0.7rem;
          font-size: 2rem;
          font-weight: 800;
        }
        p {
          color: #375b49;
          margin-bottom: 2rem;
          font-size: 1rem;
        }
        .access-actions {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          width: 100%;
        }
        .btn-primary {
          background: #1a693e;
          color: #fff;
          font-weight: 700;
          border: none;
          padding: 0.85rem;
          border-radius: 0.8rem;
          cursor: pointer;
          font-size: 1.1rem;
        }
        .btn-secondary {
          background: #ffe6b0;
          color: #615329;
          font-weight: 600;
          border: none;
          padding: 0.85rem;
          border-radius: 0.8rem;
          cursor: pointer;
          font-size: 1.08rem;
        }
        .btn-ghost {
          background: none;
          color: #1a693e;
          border: 1.5px solid #b7dbc4;
          padding: 0.8rem;
          border-radius: 0.8rem;
          font-weight: 600;
          font-size: 1.05rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-ghost:hover {
          background: #e6f7ee;
        }
      `}</style>
    </div>
  );
}
