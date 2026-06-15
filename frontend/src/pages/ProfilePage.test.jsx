/**
 * TESTES — ProfilePage  (RF03: Gestão de Perfil do Usuário)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import ProfilePage from './ProfilePage'
import * as AuthContext from '../context/AuthContext'

const mockUser = {
  id: 1,
  name: 'Anna Brandão',
  email: 'anna@piri.com',
  role: 'morador',
  profession: 'Desenvolvedora',
  contact: '(62) 99999-0000',
  birthDate: '1995-06-14',
  bio: 'Amo Pirenópolis!',
  avatarUrl: null,
}

describe('ProfilePage — RF03', () => {
  beforeEach(() => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      updateProfile: vi.fn().mockResolvedValue(mockUser),
      isAuthenticated: true,
    })
  })

  it('exibe nome do usuário em modo leitura', () => {
    render(<ProfilePage />)
    expect(screen.getByText('Anna Brandão')).toBeInTheDocument()
  })

  it('exibe email do usuário em modo leitura', () => {
    render(<ProfilePage />)
    expect(screen.getByText('anna@piri.com')).toBeInTheDocument()
  })

  it('exibe profissão do usuário', () => {
    render(<ProfilePage />)
    expect(screen.getByText('Desenvolvedora')).toBeInTheDocument()
  })

  it('exibe badge com role do usuário', () => {
    render(<ProfilePage />)
    expect(screen.getByText('Morador')).toBeInTheDocument()
  })

  it('exibe botão "Editar perfil"', () => {
    render(<ProfilePage />)
    expect(
      screen.getByRole('button', { name: /editar perfil/i })
    ).toBeInTheDocument()
  })

  it('exibe formulário de edição ao clicar em "Editar perfil"', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/profissão/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/biografia/i)).toBeInTheDocument()
  })

  it('pré-preenche campos com dados atuais ao entrar em edição', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Anna Brandão')
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('anna@piri.com')
  })

  it('volta ao modo leitura ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument()
  })

  it('chama updateProfile ao submeter o formulário', async () => {
    const updateProfile = vi.fn().mockResolvedValue(mockUser)
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      updateProfile,
      isAuthenticated: true,
    })
    const user = userEvent.setup()
    render(<ProfilePage />)
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() => expect(updateProfile).toHaveBeenCalled())
  })

  it('exibe mensagem de sucesso após salvar', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() =>
      expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument()
    )
  })

  it('exibe validação quando nome é removido', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.clear(screen.getByLabelText(/nome completo/i))
    await user.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() =>
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    )
  })

  it('exibe aviso quando usuário não está logado', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      updateProfile: vi.fn(),
      isAuthenticated: false,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/precisa estar logado/i)).toBeInTheDocument()
  })
})
