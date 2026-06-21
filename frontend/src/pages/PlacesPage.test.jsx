import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

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
  TileLayer: () => null,
  Marker: () => <div data-testid="map-marker" />,
  Popup: () => null,
  useMap: () => ({ flyTo: vi.fn() }),
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
    source: 'google',
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
    source: 'google',
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
    vi.mocked(fetchPlaces).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getAllByTestId('spinner').length).toBeGreaterThan(0)
  })

  it('lista locais do banco (Google + comunidade)', async () => {
    renderPage()
    expect(await screen.findByText('Botequim Mercatto Piri')).toBeInTheDocument()
    expect(screen.getByText('Cachoeira da Rosário')).toBeInTheDocument()
  })

  it('filtra locais por categoria via chips (BDD 2)', async () => {
    renderPage()
    await screen.findByText('Botequim Mercatto Piri')
    await userEvent.click(screen.getByRole('button', { name: 'Cachoeiras' }))
    expect(screen.queryByText('Botequim Mercatto Piri')).not.toBeInTheDocument()
    expect(screen.getByText('Cachoeira da Rosário')).toBeInTheDocument()
  })

  it('links apontam para página de detalhe numérica', async () => {
    renderPage()
    await screen.findByText('Botequim Mercatto Piri')
    expect(screen.getByRole('link', { name: /botequim mercatto piri/i }))
      .toHaveAttribute('href', '/locais/1')
  })
})
