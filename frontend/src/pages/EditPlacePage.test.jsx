import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  }
})

vi.mock('../infra/adaptor/placeAdaptor', () => ({
  fetchPlaceById: vi.fn(),
  updatePlace: vi.fn(),
}))

import EditPlacePage from './EditPlacePage'
import * as placeAdaptor from '../infra/adaptor/placeAdaptor'

const mockPlace = {
  id: 1, name: 'Botequim Mercatto Piri', category: 'restaurante',
  description: 'Ótimo botequim no centro histórico.', address: 'R. Direita, 68',
  phone: '(62) 3331-1234', mapsLink: 'https://maps.google.com/test', openingDate: '2020-01-15',
  photos: [{ id: 1, url: 'http://example.com/photo.jpg' }],
}

const renderPage = () => render(<MemoryRouter><EditPlacePage /></MemoryRouter>)

describe('EditPlacePage', () => {
  beforeEach(() => {
    vi.mocked(placeAdaptor.fetchPlaceById).mockResolvedValue(mockPlace)
    vi.mocked(placeAdaptor.updatePlace).mockResolvedValue(mockPlace)
  })

  it('mostra Spinner enquanto carrega', () => {
    // fetchPlaceById nunca resolve durante este teste
    vi.mocked(placeAdaptor.fetchPlaceById).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument()
  })

  it('renderiza formulário pré-preenchido com os dados do local após carregamento', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByDisplayValue('Botequim Mercatto Piri')).toBeInTheDocument()
    )
  })

  it('exibe botão "← Voltar"', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /← Voltar/i })).toBeInTheDocument()
    )
  })

  it('após submeter com sucesso mostra overlay "Local atualizado com sucesso!" e "❤ EuAmoPiri"', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByDisplayValue('Botequim Mercatto Piri')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() => {
      expect(screen.getByText('Local atualizado com sucesso!')).toBeInTheDocument()
      expect(screen.getByText('❤ EuAmoPiri')).toBeInTheDocument()
    })
  })

  it('exibe overlay de erro quando updatePlace lança exceção', async () => {
    vi.mocked(placeAdaptor.updatePlace).mockRejectedValue(new Error('Erro de rede'))
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByDisplayValue('Botequim Mercatto Piri')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(screen.getByText('Falha ao salvar alterações')).toBeInTheDocument()
    )
  })

  it('"Voltar ao formulário" no overlay de erro reseta o overlay e mostra o formulário', async () => {
    vi.mocked(placeAdaptor.updatePlace).mockRejectedValue(new Error('Erro'))
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByDisplayValue('Botequim Mercatto Piri')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))
    await waitFor(() =>
      expect(screen.getByText('Falha ao salvar alterações')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /voltar ao formulário/i }))

    await waitFor(() => {
      expect(screen.queryByText('Falha ao salvar alterações')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
    })
  })

  it('valida que "Nome do local" é obrigatório ao submeter com nome vazio', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() =>
      expect(screen.getByDisplayValue('Botequim Mercatto Piri')).toBeInTheDocument()
    )

    await user.clear(screen.getByDisplayValue('Botequim Mercatto Piri'))
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() =>
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    )
  })
})
