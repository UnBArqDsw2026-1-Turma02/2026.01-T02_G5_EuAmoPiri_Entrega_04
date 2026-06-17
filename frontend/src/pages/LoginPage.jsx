import React from 'react';
import './LoginPage.css';

import logoGoogle from '../assets/Google__G__logo.svg.png'; 

export default function LoginPage() {
  return (
    <div className="login-container">
      
      <div className="login-card">
        
        {/* Logo e Boas-vindas */}
        <div className="login-header">
          <h1 className="login-logo">❤ EuAmoPiri</h1>
          <p className="login-subtitle">Bem-vindo de volta!</p>
        </div>

        {/* Formulário de Login */}
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          
          <div className="input-group">
            <label htmlFor="email">EMAIL</label>
            <input 
              type="email" 
              id="email" 
              placeholder="seu@email.com" 
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">SENHA</label>
            <input 
              type="password" 
              id="senha" 
              placeholder="********" 
              required 
            />
          </div>

          {/* Botão Principal Verde */}
          <button type="submit" className="btn-entrar">
            Entrar
          </button>

          {/* Botão do Google */}
          <button type="button" className="btn-google">
            <img 
              src={logoGoogle} 
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