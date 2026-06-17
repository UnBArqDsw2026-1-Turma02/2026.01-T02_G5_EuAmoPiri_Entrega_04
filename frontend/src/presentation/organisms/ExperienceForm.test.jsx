import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ExperienceForm from './ExperienceForm';

describe('ExperienceForm', () => {
  it('limita contador a 2000 caracteres', () => {
    render(<ExperienceForm onSubmit={vi.fn()} />);
    expect(screen.getByText(/0\/2000/)).toBeInTheDocument();
  });

  it('RNF02: exibe modal de erro com blacklist no client', async () => {
    const user = userEvent.setup();
    render(<ExperienceForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '5 estrelas' }));
    await user.type(screen.getByLabelText(/data da visita/i), '2026-06-01');
    await user.type(screen.getByPlaceholderText(/compartilhe sua experiência/i), 'Lugar idiota');
    await user.click(screen.getByRole('button', { name: /enviar avaliação/i }));

    expect(await screen.findByText(/falha ao enviar avaliação/i)).toBeInTheDocument();
  });
});
