import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import LoginPage from './LoginPage';

describe('Componente LoginPage', () => {
  
  describe('Testando a página de Login', () => {
  it('deve exibir o título do sistema', () => {
    render(<LoginPage />);
    expect(screen.getByText(/EuAmoPiri/i)).toBeInTheDocument();
  });
});

  it('deve renderizar os elementos da tela de login corretamente', () => {
    render(<LoginPage />);

    expect(screen.getByText(/EuAmoPiri/i)).toBeInTheDocument();

    // Verifica se os campos de input e botões aparecem
    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SENHA/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar com o Google/i })).toBeInTheDocument();
  });

  it('deve permitir que o usuário digite no campo de email e senha', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/EMAIL/i);
    const senhaInput = screen.getByLabelText(/SENHA/i);

    await userEvent.type(emailInput, 'mariana@email.com');
    await userEvent.type(senhaInput, '12345678');

    // Verifica se o valor dentro do input mudou de verdade
    expect(emailInput.value).toBe('mariana@email.com');
    expect(senhaInput.value).toBe('12345678');
  });

});