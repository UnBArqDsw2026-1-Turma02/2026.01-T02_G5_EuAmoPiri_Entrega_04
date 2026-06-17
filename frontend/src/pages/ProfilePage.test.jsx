/**
 * TESTES — ProfilePage  (RF03: Gestão de Perfil do Usuário)
 *
 * Cobre: modo leitura, formulário de edição, seção de senha,
 *        seções por role (morador / turista), botões de ação.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../presentation/atoms/StarRating', () => ({
  default: ({ value }) => <span data-testid="star-rating">{value} estrelas</span>,
}))

import ProfilePage from './ProfilePage'
import * as AuthContext from '../context/AuthContext'

/* ── fixtures ── */
const mockMorador = {
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

const mockTurista = {
  id: 2,
  name: 'Carlos Turista',
  email: 'carlos@piri.com',
  role: 'turista',
  profession: 'Fotógrafo',
  avatarUrl: null,
}

const renderPage = () =>
  render(<MemoryRouter><ProfilePage /></MemoryRouter>)

/* ── helpers para setar role ── */
function asMorador(extra = {}) {
  vi.mocked(AuthContext.useAuth).mockReturnValue({
    user: mockMorador,
    updateProfile: vi.fn().mockResolvedValue(mockMorador),
    isAuthenticated: true,
    isMorador: true,
    ...extra,
  })
}

function asTurista(extra = {}) {
  vi.mocked(AuthContext.useAuth).mockReturnValue({
    user: mockTurista,
    updateProfile: vi.fn().mockResolvedValue(mockTurista),
    isAuthenticated: true,
    isMorador: false,
    ...extra,
  })
}

/* ══════════════════════════════════════════════════════════════
   Modo leitura — dados básicos
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — modo leitura', () => {
  beforeEach(() => asMorador())

  it('exibe nome do usuário', () => {
    renderPage()
    expect(screen.getByText('Anna Brandão')).toBeInTheDocument()
  })

  it('exibe email do usuário', () => {
    renderPage()
    expect(screen.getByText('anna@piri.com')).toBeInTheDocument()
  })

  it('exibe profissão do usuário', () => {
    renderPage()
    expect(screen.getByText('Desenvolvedora')).toBeInTheDocument()
  })

  it('exibe badge com role do usuário', () => {
    renderPage()
    expect(screen.getByText('Morador')).toBeInTheDocument()
  })

  it('exibe aviso quando usuário não está logado', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      updateProfile: vi.fn(),
      isAuthenticated: false,
      isMorador: false,
    })
    renderPage()
    expect(screen.getByText(/precisa estar logado/i)).toBeInTheDocument()
  })
})

/* ══════════════════════════════════════════════════════════════
   Botões de ação — presença e roteamento por role
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — botões de ação', () => {
  it('exibe "Deletar Perfil", "Editar Perfil" e "Cadastrar Novo Local" para morador', () => {
    asMorador()
    renderPage()
    expect(screen.getByRole('button', { name: /deletar perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cadastrar novo local/i })).toBeInTheDocument()
  })

  it('exibe "Cadastrar Novo Relato" para turista (não "Cadastrar Novo Local")', () => {
    asTurista()
    renderPage()
    expect(screen.getByRole('link', { name: /cadastrar novo relato/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /cadastrar novo local/i })).not.toBeInTheDocument()
  })
})

/* ══════════════════════════════════════════════════════════════
   Formulário de edição de perfil
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — edição de perfil', () => {
  beforeEach(() => asMorador())

  it('abre formulário ao clicar em "Editar Perfil"', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/profissão/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/biografia/i)).toBeInTheDocument()
  })

  it('pré-preenche campos com dados atuais', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Anna Brandão')
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('anna@piri.com')
  })

  it('volta ao modo leitura ao cancelar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.getByRole('button', { name: /editar perfil/i })).toBeInTheDocument()
  })

  it('chama updateProfile ao submeter', async () => {
    const updateProfile = vi.fn().mockResolvedValue(mockMorador)
    asMorador({ updateProfile })
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /atualizar perfil/i }))
    await waitFor(() => expect(updateProfile).toHaveBeenCalled())
  })

  it('exibe mensagem de sucesso após salvar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /atualizar perfil/i }))
    await waitFor(() =>
      expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument()
    )
  })

  it('valida campo nome obrigatório', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.clear(screen.getByLabelText(/nome completo/i))
    await user.click(screen.getByRole('button', { name: /atualizar perfil/i }))
    await waitFor(() =>
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    )
  })
})

/* ══════════════════════════════════════════════════════════════
   Seção "Cadastrar Nova Senha" — só aparece no modo edição
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — seção de senha', () => {
  beforeEach(() => asMorador())

  it('NÃO exibe campos de senha em modo leitura', () => {
    renderPage()
    expect(screen.queryByLabelText(/senha atual/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /atualizar senha/i })).not.toBeInTheDocument()
  })

  it('exibe seção "CADASTRAR NOVA SENHA" ao entrar em edição', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.getByText(/cadastrar nova senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha atual/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar nova senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /atualizar senha/i })).toBeInTheDocument()
  })

  it('também exibe seção de senha para turista em modo edição', async () => {
    asTurista()
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    expect(screen.getByText(/cadastrar nova senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /atualizar senha/i })).toBeInTheDocument()
  })

  it('exibe erro quando campos de senha estão vazios', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /atualizar senha/i }))
    await waitFor(() =>
      expect(screen.getByText(/preencha todos os campos de senha/i)).toBeInTheDocument()
    )
  })

  it('exibe erro quando nova senha e confirmação não coincidem', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.type(screen.getByLabelText(/senha atual/i), 'senhaAtual1')
    await user.type(screen.getByLabelText('Nova senha'), 'novaSenha123')
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'diferente456')
    await user.click(screen.getByRole('button', { name: /atualizar senha/i }))
    await waitFor(() =>
      expect(screen.getByText(/nova senha e confirmação não coincidem/i)).toBeInTheDocument()
    )
  })

  it('exibe erro quando nova senha tem menos de 6 caracteres', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.type(screen.getByLabelText(/senha atual/i), 'senhaAtual1')
    await user.type(screen.getByLabelText('Nova senha'), '123')
    await user.type(screen.getByLabelText('Confirmar nova senha'), '123')
    await user.click(screen.getByRole('button', { name: /atualizar senha/i }))
    await waitFor(() =>
      expect(screen.getByText(/pelo menos 6 caracteres/i)).toBeInTheDocument()
    )
  })

  it('exibe sucesso ao atualizar senha com dados válidos', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.type(screen.getByLabelText(/senha atual/i), 'senhaAtual1')
    await user.type(screen.getByLabelText('Nova senha'), 'novaSenha123')
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'novaSenha123')
    await user.click(screen.getByRole('button', { name: /atualizar senha/i }))
    await waitFor(() =>
      expect(screen.getByText(/senha atualizada com sucesso/i)).toBeInTheDocument()
    )
  })
})

/* ══════════════════════════════════════════════════════════════
   Seção Morador — Últimos Relatos e Locais Cadastrados
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — seções do Morador', () => {
  beforeEach(() => asMorador())

  it('exibe título "ÚLTIMOS RELATOS"', () => {
    renderPage()
    expect(screen.getByText('ÚLTIMOS RELATOS')).toBeInTheDocument()
  })

  it('exibe relatos com local, autor e contagem de likes', () => {
    renderPage()
    expect(screen.getAllByText('Restaurante LovePiri').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Josefina Souza').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/👍/)[0]).toBeInTheDocument()
  })

  it('NÃO exibe botões de editar/excluir nos relatos recebidos', () => {
    renderPage()
    expect(screen.queryByRole('button', { name: /editar avaliação/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /excluir avaliação/i })).not.toBeInTheDocument()
  })

  it('exibe título "LOCAIS CADASTRADOS"', () => {
    renderPage()
    expect(screen.getByText('LOCAIS CADASTRADOS')).toBeInTheDocument()
  })

  it('exibe botões "Editar Local" e "Excluir Local" nos locais cadastrados', () => {
    renderPage()
    const editButtons = screen.getAllByRole('link', { name: /editar local/i })
    const deleteButtons = screen.getAllByRole('button', { name: /excluir local/i })
    expect(editButtons.length).toBeGreaterThan(0)
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('exibe nomes dos locais cadastrados', () => {
    renderPage()
    expect(screen.getByText('Botequim Mercatto Piri')).toBeInTheDocument()
    expect(screen.getByText('Cachoeira da Rosário')).toBeInTheDocument()
  })
})

/* ══════════════════════════════════════════════════════════════
   Seção Turista — Avaliações Cadastradas
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — seções do Turista', () => {
  beforeEach(() => asTurista())

  it('exibe título "AVALIAÇÕES CADASTRADAS"', () => {
    renderPage()
    expect(screen.getByText('AVALIAÇÕES CADASTRADAS')).toBeInTheDocument()
  })

  it('exibe avaliações com local e título', () => {
    renderPage()
    expect(screen.getByText('Vista incrível!')).toBeInTheDocument()
    expect(screen.getByText('Cachoeiras da região')).toBeInTheDocument()
  })

  it('exibe botões "Editar Avaliação" e "Excluir Avaliação" para turista', () => {
    renderPage()
    const editButtons = screen.getAllByRole('button', { name: /editar avaliação/i })
    const deleteButtons = screen.getAllByRole('button', { name: /excluir avaliação/i })
    expect(editButtons.length).toBeGreaterThan(0)
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('NÃO exibe seção "LOCAIS CADASTRADOS" para turista', () => {
    renderPage()
    expect(screen.queryByText('LOCAIS CADASTRADOS')).not.toBeInTheDocument()
  })
})
