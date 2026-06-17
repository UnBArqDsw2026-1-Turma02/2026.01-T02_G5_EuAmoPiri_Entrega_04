/**
 * TESTES — PlacesPage  (RF06: Consulta de Locais)
 *
 * Mocks necessários:
 *   - react-leaflet  → stubs leves (jsdom não tem canvas/WebGL)
 *     IMPORTANTE: Marker e Popup NÃO renderizam filhos para evitar
 *     texto duplicado no DOM (o nome do local aparece no Popup E na sidebar)
 *   - leaflet        → evita erro no delete L.Icon.Default.prototype._getIconUrl
 *   - leaflet CSS    → ignorado no ambiente de teste
 *   - placeAdaptor   → dados controlados
 *   - AuthContext    → papel do usuário controlado
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

/* ── Mocks de infra ── */
vi.mock('leaflet/dist/leaflet.css', () => ({}))

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: { _getIconUrl: vi.fn() },
        mergeOptions: vi.fn(),
      },
    },
  },
}))

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer:    () => null,
  // Marker não renderiza filhos: evita texto duplicado (Popup tem o nome do local)
  Marker:       () => <div data-testid="map-marker" />,
  Popup:        () => null,
}))

vi.mock('../infra/adaptor/placeAdaptor')
vi.mock('../infra/adaptor/experienceAdaptor', () => ({
  fetchExperiencesByPlaces: vi.fn(),
}))
vi.mock('../context/AuthContext')
vi.mock('../presentation/atoms/StarRating', () => ({
  default: ({ value }) => <span aria-label={`${value} estrelas`}>{value}★</span>,
}))
vi.mock('../presentation/atoms/Spinner', () => ({
  default: () => <div data-testid="spinner" />,
}))

import { fetchPlaces } from '../infra/adaptor/placeAdaptor'
import { fetchExperiencesByPlaces } from '../infra/adaptor/experienceAdaptor'
import { useAuth } from '../context/AuthContext'
import PlacesPage from './PlacesPage'

const MOCK_PLACES = [
  {
    id: 1,
    name: 'Botequim Mercatto Piri',
    category: 'restaurante',
    description: 'Bar regional.',
    address: 'Rua do Rosário, 15',
    rating: 4.9,
    reviewsCount: 100,
    lat: -15.849,
    lng: -48.9568,
  },
  {
    id: 2,
    name: 'Cachoeira da Rosário',
    category: 'cachoeira',
    description: 'Cachoeira cristalina.',
    address: 'Estrada da Rosário, km 3',
    rating: 4.8,
    reviewsCount: 50,
    lat: -15.8312,
    lng: -48.9423,
  },
]

const renderPage = () =>
  render(<MemoryRouter><PlacesPage /></MemoryRouter>)

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ isMorador: false, isAuthenticated: false })
  vi.mocked(fetchPlaces).mockResolvedValue(MOCK_PLACES)
  vi.mocked(fetchExperiencesByPlaces).mockResolvedValue([])
})

describe('PlacesPage — RF06', () => {

  it('exibe spinner enquanto carrega', () => {
    vi.mocked(fetchPlaces).mockReturnValue(new Promise(() => {})) // nunca resolve
    renderPage()
    expect(screen.getAllByTestId('spinner').length).toBeGreaterThan(0)
  })

  it('renderiza o título LOCAIS PRÓXIMOS na sidebar', async () => {
    renderPage()
    expect(await screen.findByText(/locais próximos/i)).toBeInTheDocument()
  })

  it('renderiza o mapa após carregar', async () => {
    renderPage()
    await screen.findByText('Botequim Mercatto Piri')
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('lista os locais na sidebar', async () => {
    renderPage()
    expect(await screen.findByText('Botequim Mercatto Piri')).toBeInTheDocument()
    expect(screen.getByText('Cachoeira da Rosário')).toBeInTheDocument()
  })

  it('exibe avaliação e quantidade de reviews na sidebar', async () => {
    renderPage()
    expect(await screen.findByText('Botequim Mercatto Piri')).toBeInTheDocument()
    expect(screen.getByText('4.9')).toBeInTheDocument()
    expect(screen.getByText('(100 avaliações)')).toBeInTheDocument()
  })

  it('calcula avaliações a partir dos relatos quando a API não envia stats', async () => {
    vi.mocked(fetchPlaces).mockResolvedValue([
      { id: 3, name: 'Pousada Piri', category: 'pousada', address: 'Rua A', lat: -15.85, lng: -48.95 },
    ])
    vi.mocked(fetchExperiencesByPlaces).mockResolvedValue([
      { id: 1, placeId: 3, rating: 5 },
      { id: 2, placeId: 3, rating: 3 },
    ])
    renderPage()
    expect(await screen.findByText('Pousada Piri')).toBeInTheDocument()
    expect(screen.getByText('4.0')).toBeInTheDocument()
    expect(screen.getByText('(2 avaliações)')).toBeInTheDocument()
  })

  it('exibe "Sem avaliações" para locais sem relatos', async () => {
    vi.mocked(fetchPlaces).mockResolvedValue([
      { id: 4, name: 'Local Novo', category: 'restaurante', address: 'Rua B', lat: -15.85, lng: -48.95 },
    ])
    vi.mocked(fetchExperiencesByPlaces).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('Local Novo')).toBeInTheDocument()
    expect(screen.getByText('(Sem avaliações)')).toBeInTheDocument()
  })

  it('renderiza pins no mapa para cada local', async () => {
    renderPage()
    await screen.findByText('Botequim Mercatto Piri')
    const markers = screen.getAllByTestId('map-marker')
    expect(markers.length).toBe(MOCK_PLACES.length)
  })

  it('filtra locais pelo campo de busca', async () => {
    renderPage()
    await screen.findByText('Botequim Mercatto Piri')

    const input = screen.getByPlaceholderText(/buscar local/i)
    await userEvent.type(input, 'cachoeira')

    expect(screen.queryByText('Botequim Mercatto Piri')).not.toBeInTheDocument()
    expect(screen.getByText('Cachoeira da Rosário')).toBeInTheDocument()
  })

  it('filtra locais por categoria', async () => {
    renderPage()
    await screen.findByText('Botequim Mercatto Piri')

    // Usa getByRole com name para distinguir CATEGORIA dos outros selects
    const select = screen.getByRole('combobox', { name: /categoria/i })
    await userEvent.selectOptions(select, 'cachoeira')

    expect(screen.queryByText('Botequim Mercatto Piri')).not.toBeInTheDocument()
    expect(screen.getByText('Cachoeira da Rosário')).toBeInTheDocument()
  })

  it('exibe mensagem quando nenhum local é encontrado', async () => {
    renderPage()
    await screen.findByText('Botequim Mercatto Piri')

    const input = screen.getByPlaceholderText(/buscar local/i)
    await userEvent.type(input, 'xyzabc123')

    expect(screen.getByText(/nenhum local encontrado/i)).toBeInTheDocument()
  })

  it('não exibe botão Cadastrar para turista/visitante', async () => {
    renderPage()
    await screen.findByText(/locais próximos/i)
    expect(screen.queryByText(/\+ cadastrar/i)).not.toBeInTheDocument()
  })

  it('exibe botão Cadastrar para morador', async () => {
    vi.mocked(useAuth).mockReturnValue({ isMorador: true, isAuthenticated: true })
    renderPage()
    await screen.findByText(/locais próximos/i)
    expect(screen.getByText(/\+ cadastrar/i)).toBeInTheDocument()
  })

})
