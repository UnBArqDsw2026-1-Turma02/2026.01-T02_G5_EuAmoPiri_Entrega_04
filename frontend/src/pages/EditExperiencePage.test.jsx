import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: () => ({ placeId: '1', id: '2' }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Turista Teste' } }),
}))

vi.mock('../infra/adaptor/experienceAdaptor', () => ({
  fetchMyExperiences: vi.fn(),
  updateExperience: vi.fn(),
}))

vi.mock('../presentation/atoms/StarRating', () => ({
  default: ({ value, onChange, readonly }) =>
    readonly
      ? <span>{value} estrelas</span>
      : <button type="button" onClick={() => onChange?.(5)}>5 estrelas</button>,
}))

import EditExperiencePage from './EditExperiencePage'
import * as experienceAdaptor from '../infra/adaptor/experienceAdaptor'

const mockExperience = {
  id: 2, placeId: 1, userId: 1,
  placeName: 'Botequim Mercatto Piri',
  title: 'Melhor botequim de Pirenópolis',
  text: 'Recomendo demais! A qualidade da comida é impecável e os preços são justos. Ambiente acolhedor e atendimento excelente para toda a família.',
  rating: 5, visitDate: '2026-06-01',
}

const renderPage = () => render(<MemoryRouter><EditExperiencePage /></MemoryRouter>)

describe('EditExperiencePage', () => {
  beforeEach(() => {
    vi.mocked(experienceAdaptor.fetchMyExperiences).mockResolvedValue([mockExperience])
    vi.mocked(experienceAdaptor.updateExperience).mockResolvedValue(mockExperience)
  })

  it('mostra Spinner enquanto carrega', () => {
    vi.mocked(experienceAdaptor.fetchMyExperiences).mockReturnValue(new Promise(() => { }))
    renderPage()
    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument()
  })

  it('após carregamento: renderiza título "Editar relato"', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /editar relato/i })).toBeInTheDocument()
    )
  })

  it('após carregamento: ExperienceForm é renderizado com o texto da experiência pré-preenchido', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByDisplayValue(mockExperience.text)).toBeInTheDocument()
    )
  })

  it('handleSubmit chama updateExperience com placeId e id dos params', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByDisplayValue(mockExperience.text)).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: '5 estrelas' }))
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(experienceAdaptor.updateExperience).toHaveBeenCalledWith(
        '1',
        '2',
        expect.objectContaining({ text: mockExperience.text }),
        expect.any(Array)
      )
    )
  })

  it('após submit bem-sucedido: mostra overlay de sucesso com "Relato atualizado com sucesso!"', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByDisplayValue(mockExperience.text)).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: '5 estrelas' }))
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(screen.getByText('Relato atualizado com sucesso!')).toBeInTheDocument()
    )
  })

  it('exibe link "← Voltar ao perfil"', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /← Voltar ao perfil/i })).toBeInTheDocument()
    )
  })
})
