import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../presentation/atoms/StarRating', () => ({
  default: ({ value }) => <span data-testid="star-rating">{value} estrelas</span>,
}))

vi.mock('../presentation/atoms/Spinner', () => ({
  default: () => <div data-testid="spinner">Carregando...</div>,
}))

vi.mock('../infra/adaptor/placeAdaptor', () => ({
  deletePlace: vi.fn(),
  fetchMyPlaces: vi.fn(),
}))
vi.mock('../infra/adaptor/experienceAdaptor', () => ({
  fetchMyExperiences: vi.fn(),
  fetchExperiencesByPlaces: vi.fn(),
  deleteExperience: vi.fn(),
}))

import ProfilePage from './ProfilePage'
import * as AuthContext from '../context/AuthContext'
import * as placeAdaptor from '../infra/adaptor/placeAdaptor'
import * as experienceAdaptor from '../infra/adaptor/experienceAdaptor'

/* ── setup global de mocks de adaptor ── */
beforeEach(() => {
  vi.mocked(experienceAdaptor.fetchMyExperiences).mockResolvedValue([])
  vi.mocked(experienceAdaptor.fetchExperiencesByPlaces).mockResolvedValue([])
  vi.mocked(placeAdaptor.fetchMyPlaces).mockResolvedValue([])
  vi.mocked(placeAdaptor.deletePlace).mockResolvedValue(undefined)
  vi.mocked(experienceAdaptor.deleteExperience).mockResolvedValue(undefined)
})

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
    expect(screen.getByText(/Desenvolvedora/)).toBeInTheDocument()
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

  it('chama updateProfile ao submeter com alteração', async () => {
    const updateProfile = vi.fn().mockResolvedValue(mockMorador)
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockMorador,
      updateProfile,
      isAuthenticated: true,
      isMorador: true,
    })
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.clear(screen.getByLabelText(/biografia/i))
    await user.type(screen.getByLabelText(/biografia/i), 'Nova bio')
    await user.click(screen.getByRole('button', { name: /atualizar perfil/i }))
    await waitFor(() => expect(updateProfile).toHaveBeenCalled())
  })

  it('exibe mensagem de sucesso após salvar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.clear(screen.getByLabelText(/biografia/i))
    await user.type(screen.getByLabelText(/biografia/i), 'Bio atualizada')
    await user.click(screen.getByRole('button', { name: /atualizar perfil/i }))
    await waitFor(() =>
      expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument()
    )
  })

  it('exibe aviso quando nenhuma alteração é detectada', async () => {
    const updateProfile = vi.fn()
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockMorador,
      updateProfile,
      isAuthenticated: true,
      isMorador: true,
    })
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))
    await user.click(screen.getByRole('button', { name: /atualizar perfil/i }))
    await waitFor(() =>
      expect(screen.getByText(/nenhuma alteração detectada/i)).toBeInTheDocument()
    )
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('rejeita arquivo com tipo inválido', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))

    const file = new File(['gif'], 'photo.gif', { type: 'image/gif' })
    const input = screen.getByLabelText(/alterar foto de perfil/i)
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText(/jpg ou png/i)).toBeInTheDocument()
  })

  it('rejeita arquivo maior que 5 MB', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))

    const bigContent = new Uint8Array(5 * 1024 * 1024 + 1)
    const file = new File([bigContent], 'big.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/alterar foto de perfil/i)
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText(/máximo 5 mb/i)).toBeInTheDocument()
  })

  it('envia nova foto ao atualizar perfil', async () => {
    const updateProfile = vi.fn().mockResolvedValue({
      ...mockMorador,
      profilePhotoUrl: 'profile_photo/1-new.jpg',
      avatarUrl: 'blob:mock',
    })
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockMorador,
      updateProfile,
      isAuthenticated: true,
      isMorador: true,
    })

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:preview'),
      revokeObjectURL: vi.fn(),
    })

    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /editar perfil/i }))

    const file = new File(['photo'], 'profile.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByLabelText(/alterar foto de perfil/i), { target: { files: [file] } })
    await user.click(screen.getByRole('button', { name: /atualizar perfil/i }))

    await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1))
    expect(updateProfile.mock.calls[0][1]).toBeInstanceOf(File)
  })
})

/* ══════════════════════════════════════════════════════════════
   Painel do morador (consolidado em /perfil)
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — painel do morador', () => {
  const MOCK_PLACES = [
    {
      id: 1,
      name: 'Botequim Mercatto Piri',
      category: 'restaurante',
      reviewsCount: 0,
      rating: null,
      moradorId: 1,
    },
  ]

  const MOCK_EXPERIENCES = [
    {
      id: 1,
      placeId: 1,
      userName: 'Maria Silva',
      title: 'Experiência incrível!',
      text: 'Adorei a comida caseira.',
      rating: 5,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      placeId: 1,
      userName: 'João',
      title: 'Bom lugar',
      text: 'Gostei.',
      rating: 3,
      createdAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    asMorador()
    vi.mocked(placeAdaptor.fetchMyPlaces).mockResolvedValue(MOCK_PLACES)
    vi.mocked(experienceAdaptor.fetchExperiencesByPlaces).mockResolvedValue(MOCK_EXPERIENCES)
  })

  it('exibe seções ÚLTIMOS RELATOS e MEUS LOCAIS', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('ÚLTIMOS RELATOS')).toBeInTheDocument()
      expect(screen.getByText('MEUS LOCAIS')).toBeInTheDocument()
    })
  })

  it('exibe relatos reais da API', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Experiência incrível!')).toBeInTheDocument()
      expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    })
  })

  it('exibe contagem de relatos no cabeçalho', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('calcula avaliações na sidebar quando a API não envia reviewsCount', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/2 Avaliações/)).toBeInTheDocument()
      expect(screen.getByText(/4\.0/)).toBeInTheDocument()
    })
  })

  it('chama fetchMyPlaces com o id do usuário logado', async () => {
    renderPage()
    await waitFor(() =>
      expect(placeAdaptor.fetchMyPlaces).toHaveBeenCalledWith(1),
    )
  })
})

/* ══════════════════════════════════════════════════════════════
   Exclusão de avaliação (turista)
   ══════════════════════════════════════════════════════════════ */
describe('ProfilePage — exclusão de avaliação', () => {
  it('exibe erro quando falha ao excluir avaliação', async () => {
    const mockAvaliacao = {
      id: 2,
      placeId: 1,
      placeName: 'Botequim Mercatto Piri',
      title: 'Melhor botequim',
      text: 'Recomendo demais!',
      rating: 5,
      dias: 5,
    }
    vi.mocked(experienceAdaptor.fetchMyExperiences).mockResolvedValue([mockAvaliacao])
    vi.mocked(experienceAdaptor.deleteExperience).mockRejectedValue(new Error('fail'))
    asTurista()
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /excluir avaliação/i }).length).toBeGreaterThan(0)
    )

    const deleteButtons = screen.getAllByRole('button', { name: /excluir avaliação/i })
    await user.click(deleteButtons[0])

    await waitFor(() =>
      expect(screen.getByText(/tem certeza que deseja excluir/i)).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /^excluir$/i }))

    await waitFor(() =>
      expect(screen.getByText('Erro ao excluir avaliação')).toBeInTheDocument()
    )
  })
})
