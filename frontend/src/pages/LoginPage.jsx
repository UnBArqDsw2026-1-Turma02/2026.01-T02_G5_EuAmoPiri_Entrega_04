import React from 'react';
import './LoginPage.css';

export default function LoginPage() {
  return (
    <div className="login-container">
    
      <div className="login-card">
        
        <div className="login-header">
          <h1 className="login-logo">❤ EuAmoPiri</h1>
          <p className="login-subtitle"></p>
        </div>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          
          <button type="submit" className="btn-entrar">
            Entrar
          </button>

          <button type="button" className="btn-google">
            <img 
              src=""
              alt="Google" 
              className="google-icon"
            />
            Continuar com o Google
          </button>

        </form>

        <div className="login-footer">
          <a href="#esqueci" className="link-footer">Esqueci a senha</a>
          <a href="#criar" className="link-footer">Criar conta</a>
        </div>

      </div>

    </div>
  );
}