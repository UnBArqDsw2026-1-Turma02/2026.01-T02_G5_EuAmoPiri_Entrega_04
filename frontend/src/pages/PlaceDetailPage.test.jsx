/**
 * TESTES — PlaceDetailPage
 *   RF06: Detalhe de um local turístico
 *   RF13: Interações por emoji
 *   RF12: Comentários / relatos
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams:   vi.fn(() => ({ id: '1' })),
    useNavigate: vi.fn(() => vi.fn()),
  }
})
vi.mock('../infra/adaptor/placeAdaptor')
vi.mock('../infra/adaptor/experienceAdaptor')
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

import PlaceDetailPage from './PlaceDetailPage'
import * as placeAdaptor from '../infra/adaptor/placeAdaptor'
import * as expAdaptor   from '../infra/adaptor/experienceAdaptor'
import * as AuthContext  from '../context/AuthContext'

const MOCK_PLACE = {
  id: 1, name: 'Cachoeira da Rosário', category: 'natureza',
  description: 'Águas cristalinas em Pirenópolis.',
  address: 'Estrada da Rosário, km 3', rating: 4.8,
  reviewsCount: 50, price: '$', mapsLink: null,
}

const MOCK_EXPERIENCES = [
  {
    id: 1, placeId: 1, userName: 'Maria Silva',
    text: 'Experiência maravilhosa! Vale muito a visita.',
    rating: 5, visitDate: '2026-05-08',
    reactions: { heart: 3, like: 1 },
    createdAt: new Date('2026-06-09').toISOString(),
  },
]

const renderPage = () =>
  render(<MemoryRouter><PlaceDetailPage /></MemoryRouter>)

describe('PlaceDetailPage — RF06 detalhe / RF13 emojis / RF12 relatos', () => {
  beforeEach(() => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: false, isTurista: false, user: null,
    })
    vi.mocked(placeAdaptor.fetchPlaceById).mockResolvedValue(MOCK_PLACE)
    vi.mocked(expAdaptor.fetchExperiencesByPlace).mockResolvedValue(MOCK_EXPERIENCES)
    vi.mocked(expAdaptor.reactToExperience).mockResolvedValue({ success: true })
    vi.mocked(expAdaptor.createExperience).mockResolvedValue({
      id: 2, placeId: 1, userName: 'João',
      text: 'Novo relato adicionado ao local.',
      rating: 4, visitDate: '2026-06-14',
      reactions: { heart: 0, like: 0 },
      createdAt: new Date().toISOString(),
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

  it('exibe hint de login para usuários não autenticados', async () => {
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    // non-authenticated users see "Avaliar Local" link pointing to /login
    expect(screen.getAllByRole('link', { name: /avaliar local/i }).length).toBeGreaterThan(0)
  })

  it('exibe link "Avaliar" para turistas logados', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: true, user: { name: 'João' },
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    expect(screen.getAllByRole('link', { name: /avaliar/i }).length).toBeGreaterThan(0)
  })

  it('link de avaliar aponta para a página de novo relato', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: true, user: { name: 'João' },
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    const link = screen.getAllByRole('link', { name: /avaliar/i })[0]
    expect(link).toHaveAttribute('href', '/locais/1/relatos/novo')
  })

  it('não exibe link de avaliar para usuários não turistas autenticados', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      isAuthenticated: true, isTurista: false, user: { name: 'Morador' },
    })
    renderPage()
    await screen.findByText('Cachoeira da Rosário')
    // authenticated non-turistas see neither "Avaliar" nor "Avaliar Local"
    expect(
      screen.queryByRole('link', { name: /^avaliar$/i })
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
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    await user.click(screen.getByLabelText(/amei: 3/i))

    await waitFor(() =>
      expect(screen.getByLabelText(/amei: 4/i)).toBeInTheDocument()
    )
  })

  it('chama reactToExperience com o emoji correto (RF13)', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Maria Silva')

    await user.click(screen.getByLabelText(/amei: 3/i))

    await waitFor(() =>
      expect(expAdaptor.reactToExperience).toHaveBeenCalledWith('1', 1, 'heart')
    )
  })
})
