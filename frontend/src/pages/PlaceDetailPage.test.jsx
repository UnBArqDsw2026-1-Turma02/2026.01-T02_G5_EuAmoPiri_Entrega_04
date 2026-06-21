import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useParams } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams:   vi.fn(() => ({ id: '1' })),
    useNavigate: vi.fn(() => vi.fn()),
  }
})
vi.mock('../infra/adaptor/placeAdaptor', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    fetchPlaceById: vi.fn(),
    deletePlace: vi.fn(),
  }
})
vi.mock('../infra/adaptor/experienceAdaptor')
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

import PlaceDetailPage from './PlaceDetailPage'
import * as placeAdaptor from '../infra/adaptor/placeAdaptor'
import * as expAdaptor   from '../infra/adaptor/experienceAdaptor'
import * as AuthContext  from '../context/AuthContext'

const MOCK_PLACE = {
  id: 1, name: 'Cachoeira da Rosário', category: 'cachoeira',
  description: 'Águas cristalinas em Pirenópolis.',
  address: 'Estrada da Rosário, km 3', rating: 4.8,
  reviewsCount: 50, mapsLink: null,
}

const MOCK_EXPERIENCES = [
  {
    id: 1, placeId: 1, userId: 99, userName: 'Maria Silva',
    text: 'Experiência maravilhosa! Vale muito a visita.',
    rating: 5, visitDate: '2026-05-08',
    commentsCount: 1,
    reactions: { heart: 3, like: 1 },
    createdAt: new Date('2026-06-09').toISOString(),
  },
]

const renderPage = () =>
  render(<MemoryRouter><PlaceDetailPage /></MemoryRouter>)

describe('PlaceDetailPage — RF06 detalhe / RF13 emojis / RF12 relatos', () => {
  beforeEach(() => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: false, isTurista: false, isMorador: false, user: null,
    })
    vi.mocked(placeAdaptor.fetchPlaceById).mockResolvedValue(MOCK_PLACE)
    vi.mocked(expAdaptor.fetchExperiencesByPlace).mockResolvedValue(MOCK_EXPERIENCES)
    vi.mocked(expAdaptor.reactToExperience).mockResolvedValue({ success: true })
    vi.mocked(expAdaptor.fetchCommentsByExperience).mockResolvedValue([
      {
        id: 10,
        userId: 88,
        userName: 'Pedro',
        text: 'Concordo totalmente!',
        createdAt: new Date('2026-06-10').toISOString(),
      },
    ])
    vi.mocked(expAdaptor.createComment).mockResolvedValue({
      id: 11,
      userId: 2,
      userName: 'João',
      text: 'Ótima dica, obrigado!',
      createdAt: new Date().toISOString(),
    })
    vi.mocked(expAdaptor.reportExperience).mockResolvedValue({
      message: 'Denúncia recebida! O relato foi sinalizado para revisão.',
    })
    vi.mocked(expAdaptor.reportComment).mockResolvedValue({
      message: 'Denúncia recebida! O comentário foi sinalizado para revisão.',
    })
  })

  /* ─── RF06: informações do local ─── */

  it('exibe spinner enquanto carrega o local', () => {
    vi.mocked(placeAdaptor.fetchPlaceById).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('exibe nome do local após carregamento', async () => {
    renderPage()
    expect(await screen.findByText('Cachoeira da Rosário')).toBeInTheDocument()
  })

  it('exibe descrição do local', async () => {
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    expect(screen.getByText(/águas cristalinas/i)).toBeInTheDocument()
  })

  it('exibe endereço do local', async () => {
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    expect(screen.getByText(/estrada da rosário/i)).toBeInTheDocument()
  })

  it('exibe foto do local usando a URL resolvida de photos', async () => {
    vi.mocked(placeAdaptor.fetchPlaceById).mockResolvedValue({
      ...MOCK_PLACE,
      photos: [{ id: 10, sortOrder: 0, url: '/api/places/1/photos/10' }],
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    const img = screen.getByRole('img', { name: /cachoeira da rosário — foto 1/i })
    expect(img).toHaveAttribute('src', '/api/places/1/photos/10')
  })

  it('exibe mensagem de erro se local não for encontrado', async () => {
    vi.mocked(placeAdaptor.fetchPlaceById).mockRejectedValue(new Error('Local não encontrado'))
    renderPage()
    await screen.findByText(/local não encontrado/i)
  })

  /* ─── RF12: relatos / comentários ─── */

  it('exibe relato de experiência com nome do autor', async () => {
    renderPage()
    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
  })

  it('exibe texto do relato', async () => {
    renderPage()
    await screen.findByText('Maria Silva')
    expect(screen.getByText(/experiência maravilhosa/i)).toBeInTheDocument()
  })

  it('trunca relato longo e exibe botão ler mais', async () => {
    const longText = 'a'.repeat(200)
    vi.mocked(expAdaptor.fetchExperiencesByPlace).mockResolvedValue([
      { ...MOCK_EXPERIENCES[0], text: longText },
    ])
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    expect(screen.queryByText(longText)).not.toBeInTheDocument()
    expect(screen.getByText(`${'a'.repeat(150)}…`, { exact: false })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ler mais/i }))
    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('exibe hint de login para usuários não autenticados', async () => {
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    // non-authenticated users see "Cadastrar relato" link
    expect(screen.getAllByRole('link', { name: /cadastrar relato/i }).length).toBeGreaterThan(0)
  })

  it('exibe link "+ Relato" para turistas logados', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: true, user: { name: 'João' },
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    expect(screen.getAllByRole('link', { name: /relato/i }).length).toBeGreaterThan(0)
  })

  it('link de cadastrar relato aponta para a página de novo relato', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: true, user: { name: 'João' },
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    const link = screen.getAllByRole('link', { name: /relato/i })[0]
    expect(link).toHaveAttribute('href', '/locais/1/relatos/novo')
  })

  it('exibe link Cadastrar relato para usuários não autenticados', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: false, isTurista: false, isMorador: false, user: null,
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    expect(screen.getAllByRole('link', { name: /cadastrar relato/i }).length).toBeGreaterThan(0)
  })

  it('não exibe link Cadastrar relato para morador autenticado', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: false, isMorador: true, user: { name: 'Morador' },
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    expect(screen.queryByRole('link', { name: /cadastrar relato/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^\+ relato$/i })).not.toBeInTheDocument()
  })

  it('não exibe link de cadastrar relato para usuários autenticados sem papel turista', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: false, isMorador: false, user: { name: 'Outro' },
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    expect(
      screen.queryByRole('link', { name: /^\+ relato$/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /cadastrar relato/i })
    ).not.toBeInTheDocument()
  })

  /* ─── RF13: reações por emoji ─── */

  it('exibe botão de reação ❤️ com contagem correta', async () => {
    renderPage()
    await screen.findByText('Maria Silva')
    expect(screen.getByLabelText(/amei: 3/i)).toBeInTheDocument()
  })

  it('exibe botão de reação 👍 com contagem correta', async () => {
    renderPage()
    await screen.findByText('Maria Silva')
    expect(screen.getByLabelText(/gostei: 1/i)).toBeInTheDocument()
  })

  it('incrementa contagem do ❤️ ao clicar (RF13)', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: true, user: { name: 'João' },
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    await user.click(screen.getByRole('button', { name: /amei: 3/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /amei: 4/i })).toBeInTheDocument()
    )
  })

  it('chama reactToExperience com o emoji correto (RF13)', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: true, user: { name: 'João' },
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    await user.click(screen.getByRole('button', { name: /amei: 3/i }))

    await waitFor(() =>
      expect(expAdaptor.reactToExperience).toHaveBeenCalledWith('1', 1, 'heart')
    )
  })

  it('exibe avaliações e comentários com contagens distintas na sidebar', async () => {
    vi.mocked(expAdaptor.fetchExperiencesByPlace).mockResolvedValue([
      {
        id: 1, placeId: 1, userName: 'Maria Silva',
        text: 'Relato da comunidade.',
        rating: 5, visitDate: '2026-05-08',
        commentsCount: 3,
        reactions: { heart: 1, like: 0 },
        createdAt: new Date('2026-06-09').toISOString(),
      },
      {
        id: 2, placeId: 1, userName: 'João Santos',
        text: 'Outro relato.',
        rating: 4, visitDate: '2026-05-10',
        commentsCount: 1,
        reactions: { heart: 0, like: 0 },
        createdAt: new Date('2026-06-08').toISOString(),
      },
    ])
    renderPage()
    await screen.findByText('Maria Silva')

    const statsCard = screen.getByText('ESTATÍSTICAS').closest('div')
    expect(statsCard).toHaveTextContent('Avaliações')
    expect(statsCard).toHaveTextContent('Comentários')
    expect(statsCard).toHaveTextContent('2')
    expect(statsCard).toHaveTextContent('4')
  })

  it('não exibe botão de reação dislike', async () => {
    renderPage()
    await screen.findByText('Maria Silva')
    expect(screen.queryByLabelText(/não gostei/i)).not.toBeInTheDocument()
  })

  it('exibe menu de denúncia para turista em relato de outro usuário', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isTurista: true,
      isMorador: false,
      canReport: true,
      user: { id: 2, name: 'João' },
    })
    renderPage()
    await screen.findByText('Maria Silva')
    expect(screen.getByRole('button', { name: /opções do relato/i })).toBeInTheDocument()
  })

  it('envia denúncia de relato ao confirmar no modal', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isTurista: true,
      isMorador: false,
      canReport: true,
      user: { id: 2, name: 'João' },
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    await user.click(screen.getByRole('button', { name: /opções do relato/i }))
    await user.click(screen.getByRole('menuitem', { name: /denunciar/i }))
    await user.click(screen.getByRole('button', { name: /enviar denúncia/i }))

    await waitFor(() => {
      expect(expAdaptor.reportExperience).toHaveBeenCalledWith('1', 1, {
        reason: 'FALSO',
        description: undefined,
      })
      expect(screen.getByRole('heading', { name: /denúncia recebida/i })).toBeInTheDocument()
    })
  })

  it('permite denunciar comentário de um relato', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isTurista: true,
      isMorador: false,
      canReport: true,
      user: { id: 2, name: 'João' },
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    await user.click(screen.getByRole('button', { name: /comentar, 1 comentário/i }))
    await waitFor(() => expect(screen.getByText('Pedro')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /opções do comentário/i }))
    await user.click(screen.getByRole('menuitem', { name: /denunciar/i }))
    await user.click(screen.getByRole('button', { name: /enviar denúncia/i }))

    await waitFor(() => {
      expect(expAdaptor.reportComment).toHaveBeenCalledWith('1', 1, 10, {
        reason: 'FALSO',
        description: undefined,
      })
    })
  })

  it('turista pode publicar comentário em relato de outro usuário', async () => {
    vi.mocked(expAdaptor.fetchExperiencesByPlace).mockResolvedValue([
      {
        id: 1, placeId: 1, userId: 99, userName: 'Maria Silva',
        text: 'Experiência maravilhosa! Vale muito a visita.',
        rating: 5, visitDate: '2026-05-08',
        commentsCount: 0,
        reactions: { heart: 3, like: 1 },
        createdAt: new Date('2026-06-09').toISOString(),
      },
    ])
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      isTurista: true,
      isMorador: false,
      canReport: true,
      user: { id: 2, name: 'João' },
    })
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    await user.click(screen.getByRole('button', { name: /comentar, 0 comentários/i }))
    await user.type(
      screen.getByPlaceholderText(/compartilhe sua opinião sobre este relato/i),
      'Ótima dica, obrigado!'
    )
    await user.click(screen.getByRole('button', { name: /publicar comentário/i }))

    await waitFor(() => {
      expect(expAdaptor.createComment).toHaveBeenCalledWith('1', 1, 'Ótima dica, obrigado!')
      expect(screen.getByText('Ótima dica, obrigado!')).toBeInTheDocument()
    })
  })
})
