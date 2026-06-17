import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../infra/adaptor/placeAdaptor', () => ({ createPlace: vi.fn() }));

import CreatePlacePage from './CreatePlacePage';
import * as AuthContext from '../context/AuthContext';
import { createPlace } from '../infra/adaptor/placeAdaptor';

describe('CreatePlacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { name: 'José', email: 'jose@test.com', role: 'morador' },
      isMorador: true,
      isTurista: false,
    });
  });

  it('exibe formulário para morador', () => {
    render(<MemoryRouter><CreatePlacePage /></MemoryRouter>);
    expect(screen.getByText('CADASTRAR NOVO LOCAL')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome do local/i)).toBeInTheDocument();
  });

  it('exibe RoleNotice para turista', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { name: 'Ana', role: 'turista' },
      isMorador: false,
      isTurista: true,
    });
    render(<MemoryRouter><CreatePlacePage /></MemoryRouter>);
    expect(screen.getByText(/conta de morador/i)).toBeInTheDocument();
  });

  it('valida categoria no frontend sem abrir modal de erro', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><CreatePlacePage /></MemoryRouter>);

    await user.type(screen.getByLabelText(/nome do local/i), 'Restaurante Teste');
    await user.type(screen.getByLabelText(/endereço do local/i), 'Rua A, 1');
    await user.type(screen.getByLabelText(/descrição do local/i), 'Descrição válida do local');
    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }));

    expect(await screen.findByText(/selecione o tipo de local/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(createPlace).not.toHaveBeenCalled();
  });

  it('envia cadastro quando todos os campos obrigatórios estão preenchidos', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    });
    vi.mocked(createPlace).mockResolvedValue({ id: 1, name: 'Restaurante Teste' });

    render(<MemoryRouter><CreatePlacePage /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /^cachoeira$/i }));
    await user.type(screen.getByLabelText(/nome do local/i), 'Restaurante Teste');
    await user.type(screen.getByLabelText(/endereço do local/i), 'Rua A, 1');
    await user.type(screen.getByLabelText(/descrição do local/i), 'Descrição válida do local');

    const file = new File(['photo'], 'local.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }));

    expect(createPlace).toHaveBeenCalledTimes(1);
    const formData = vi.mocked(createPlace).mock.calls[0][0];
    expect(formData.get('name')).toBe('Restaurante Teste');
    expect(formData.get('category')).toBe('CACHOEIRA');
    expect(formData.get('description')).toBe('Descrição válida do local');
  });
});
