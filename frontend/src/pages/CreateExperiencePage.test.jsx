import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: vi.fn(() => ({ placeId: '1' })) };
});
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../infra/adaptor/placeAdaptor', () => ({ fetchPlaceById: vi.fn().mockResolvedValue({ id: 1, name: 'Local' }) }));
vi.mock('../infra/adaptor/experienceAdaptor', () => ({ createExperience: vi.fn() }));

import CreateExperiencePage from './CreateExperiencePage';
import * as AuthContext from '../context/AuthContext';

describe('CreateExperiencePage', () => {
  beforeEach(() => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { name: 'Ana', role: 'turista' },
      isMorador: false,
      isTurista: true,
    });
  });

  it('exibe formulário para turista', async () => {
    render(<MemoryRouter><CreateExperiencePage /></MemoryRouter>);
    expect(await screen.findByText(/cadastrar relato/i)).toBeInTheDocument();
    expect(screen.getByText(/qual a nota do seu relato/i)).toBeInTheDocument();
  });

  it('exibe RoleNotice para morador', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { name: 'José', role: 'morador' },
      isMorador: true,
      isTurista: false,
    });
    render(<MemoryRouter><CreateExperiencePage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /conta de turista necessária/i })).toBeInTheDocument();
  });
});
