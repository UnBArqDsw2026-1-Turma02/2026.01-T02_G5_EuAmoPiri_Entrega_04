/**
 * Testes — MoradorDashboard (RF10)
 *
 * Cobre: carregamento, exibição de locais, relatos, filtros, ordenação e estado vazio.
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MoradorDashboard from './MoradorDashboard';

/* ── Mocks ── */

vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer:    () => null,
  Marker:       ({ children }) => <div>{children}</div>,
  Popup:        ({ children }) => <div>{children}</div>,
}));
vi.mock('leaflet', () => ({
  default: { Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } } },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Anna Brandão', role: 'morador' } }),
}));

vi.mock('../infra/adaptor/placeAdaptor', () => ({
  fetchMyPlaces: vi.fn(),
}));

vi.mock('../infra/adaptor/experienceAdaptor', () => ({
  fetchExperiencesByPlaces: vi.fn(),
}));

vi.mock('../presentation/atoms/StarRating', () => ({
  default: ({ value }) => <span data-testid="star-rating">{value} estrelas</span>,
}));

vi.mock('../presentation/atoms/Spinner', () => ({
  default: () => <div data-testid="spinner">Carregando...</div>,
}));

import { fetchMyPlaces } from '../infra/adaptor/placeAdaptor';
import { fetchExperiencesByPlaces } from '../infra/adaptor/experienceAdaptor';

const MOCK_PLACES = [
  {
    id: 1, name: 'Botequim Mercatto Piri', category: 'gastronomia',
    price: '$$', rating: 4.9, reviewsCount: 128,
    lat: -15.849, lng: -48.957, moradorId: 1,
  },
  {
    id: 6, name: 'Restaurante LovePiri', category: 'gastronomia',
    price: '$$$', rating: 3.8, reviewsCount: 45,
    lat: -15.847, lng: -48.954, moradorId: 1,
  },
];

const MOCK_EXPERIENCES = [
  {
    id: 1, placeId: 1,
    userName: 'Maria Silva', title: 'Experiência incrível!',
    text: 'Adorei a comida caseira.',
    rating: 5, cost: '$$', reactions: { heart: 5, like: 1 },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 8, placeId: 1,
    userName: 'Antônio Francisco', title: 'Nem bom, nem ruim!',
    text: 'A qualidade das bebidas deixou a desejar.',
    rating: 3, cost: '$$', reactions: { heart: 0, like: 23 },
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 9, placeId: 6,
    userName: 'Josefina Souza', title: 'Já tive experiências melhores',
    text: 'A comida veio fria!',
    rating: 1, cost: '$$$', reactions: { heart: 0, like: 5 },
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <MoradorDashboard />
    </MemoryRouter>,
  );

describe('MoradorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMyPlaces.mockResolvedValue(MOCK_PLACES);
    fetchExperiencesByPlaces.mockResolvedValue(MOCK_EXPERIENCES);
  });

  it('exibe spinner enquanto carrega', () => {
    fetchMyPlaces.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('exibe título "LOCAIS CADASTRADOS"', async () => {
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText('LOCAIS CADASTRADOS')).toBeInTheDocument(),
    );
  });

  it('exibe título "RELATOS SOBRE LOCAIS CADASTRADOS"', async () => {
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText('RELATOS SOBRE LOCAIS CADASTRADOS')).toBeInTheDocument(),
    );
  });

  it('lista os locais cadastrados do morador', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getAllByText('Botequim Mercatto Piri').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Restaurante LovePiri').length).toBeGreaterThan(0);
    });
  });

  it('exibe o mapa', async () => {
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByTestId('map')).toBeInTheDocument(),
    );
  });

  it('exibe relatos de todos os locais', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Experiência incrível!')).toBeInTheDocument();
      expect(screen.getByText('Nem bom, nem ruim!')).toBeInTheDocument();
      expect(screen.getByText('Já tive experiências melhores')).toBeInTheDocument();
    });
  });

  it('exibe autor e data dos relatos', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('Antônio Francisco')).toBeInTheDocument();
    });
  });

  it('exibe botões de ordenação', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mais recentes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /maior avaliação/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /menor avaliação/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mais reagidos/i })).toBeInTheDocument();
    });
  });

  it('ordena por maior avaliação ao clicar no botão', async () => {
    renderDashboard();
    await waitFor(() =>
      screen.getByRole('button', { name: /maior avaliação/i }),
    );

    fireEvent.click(screen.getByRole('button', { name: /maior avaliação/i }));

    await waitFor(() => {
      const titles = screen.getAllByText(/Experiência incrível!|Nem bom, nem ruim!|Já tive experiências melhores/);
      // "Experiência incrível!" (5 stars) deve aparecer antes de "Já tive..." (1 star)
      expect(titles[0].textContent).toBe('Experiência incrível!');
    });
  });

  it('filtra relatos por avaliação', async () => {
    renderDashboard();
    await waitFor(() => screen.getByLabelText('Filtrar por avaliação'));

    fireEvent.change(screen.getByLabelText('Filtrar por avaliação'), {
      target: { value: '5' },
    });

    await waitFor(() => {
      expect(screen.getByText('Experiência incrível!')).toBeInTheDocument();
      expect(screen.queryByText('Nem bom, nem ruim!')).not.toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando não há locais', async () => {
    fetchMyPlaces.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText(/ainda não tem locais cadastrados/i)).toBeInTheDocument(),
    );
  });

  it('exibe mensagem de erro em caso de falha', async () => {
    fetchMyPlaces.mockRejectedValue(new Error('fail'));
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByText(/erro ao carregar dados do painel/i)).toBeInTheDocument(),
    );
  });

  it('chama fetchMyPlaces com o id do usuário logado', async () => {
    renderDashboard();
    await waitFor(() =>
      expect(fetchMyPlaces).toHaveBeenCalledWith(1),
    );
  });

  it('chama fetchExperiencesByPlaces com os ids dos locais', async () => {
    renderDashboard();
    await waitFor(() =>
      expect(fetchExperiencesByPlaces).toHaveBeenCalledWith([1, 6]),
    );
  });
});
