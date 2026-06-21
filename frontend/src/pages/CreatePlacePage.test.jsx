import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

/* ── Mocks de rota ── */
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  }
})

/* ── Mock do adaptor ── */
vi.mock('../infra/adaptor/placeAdaptor', () => ({
  createPlace: vi.fn(),
  apiErrorMessage: (_err, fallback) => fallback,
}))

/* ── Mock das Web APIs de blob (não disponíveis no jsdom) ── */
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:fake-url'),
})
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
})

import CreatePlacePage from './CreatePlacePage'
import * as placeAdaptor from '../infra/adaptor/placeAdaptor'

const mockPlace = {
  id: Date.now(),
  name: 'Novo Local Teste',
  category: 'CACHOEIRA',
  address: 'Rua Teste, 123',
  description: 'Descrição do local de teste.',
  photos: ['blob:fake-url'],
  coverImage: 'blob:fake-url',
}

const renderPage = () => render(<MemoryRouter><CreatePlacePage /></MemoryRouter>)

/* ── helper: cria um File de imagem fake ── */
function fakeImage(name = 'foto.jpg') {
  return new File(['imagem'], name, { type: 'image/jpeg' })
}

describe('CreatePlacePage', () => {
  beforeEach(() => {
    vi.mocked(placeAdaptor.createPlace).mockResolvedValue(mockPlace)
  })

  it('renderiza o título "Cadastrar novo local"', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /cadastrar novo local/i })).toBeInTheDocument()
  })

  it('exibe os labels dos campos obrigatórios', () => {
    renderPage()
    expect(screen.getByLabelText(/nome do local/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição do local/i)).toBeInTheDocument()
  })

  it('exibe o select de Categoria', () => {
    renderPage()
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
  })

  it('exibe a zona de upload com aria-label correto', () => {
    renderPage()
    expect(
      screen.getByRole('button', { name: /clique ou arraste para enviar fotos/i })
    ).toBeInTheDocument()
  })

  it('exibe os botões "Cancelar" e "Cadastrar Novo Local"', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cadastrar novo local/i })).toBeInTheDocument()
  })

  it('exibe erro de validação quando Nome é submetido vazio', async () => {
    const user = userEvent.setup()
    renderPage()

    // Faz upload de uma foto para não bloquear na validação de fotos
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput, fakeImage())

    // Submete sem preencher o nome
    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }))

    await waitFor(() =>
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    )
  })

  it('exibe erro de validação quando Endereço é submetido vazio', async () => {
    const user = userEvent.setup()
    renderPage()

    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput, fakeImage())

    await user.type(screen.getByLabelText(/nome do local/i), 'Local Teste')

    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }))

    await waitFor(() =>
      expect(screen.getByText(/endereço é obrigatório/i)).toBeInTheDocument()
    )
  })

  it('exibe erro inline de foto ao submeter sem nenhuma imagem', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/nome do local/i), 'Local Teste')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 1')
    await user.type(screen.getByLabelText(/descrição do local/i), 'Descrição de teste.')

    // Seleciona categoria válida
    const categorySelect = screen.getByLabelText(/categoria/i)
    await user.selectOptions(categorySelect, 'RESTAURANTE')

    // Submete sem foto
    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }))

    await waitFor(() =>
      expect(screen.getByText(/adicione pelo menos 1 foto/i)).toBeInTheDocument()
    )
  })

  it('exibe overlay de sucesso após submissão válida com foto', async () => {
    const user = userEvent.setup()
    renderPage()

    // Preenche campos obrigatórios
    await user.type(screen.getByLabelText(/nome do local/i), 'Local Teste')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/descrição do local/i), 'Descrição de teste.')

    const categorySelect = screen.getByLabelText(/categoria/i)
    await user.selectOptions(categorySelect, 'CACHOEIRA')

    // Upload de foto
    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput, fakeImage())

    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }))

    await waitFor(() => {
      expect(screen.getByText('Local cadastrado com sucesso!')).toBeInTheDocument()
      expect(screen.getByText('❤ EuAmoPiri')).toBeInTheDocument()
    })
  })

  it('overlay de sucesso exibe botões "Ver locais" e "Voltar ao meu perfil"', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/nome do local/i), 'Local Teste')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/descrição do local/i), 'Descrição de teste.')

    const categorySelect = screen.getByLabelText(/categoria/i)
    await user.selectOptions(categorySelect, 'CACHOEIRA')

    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput, fakeImage())

    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }))

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /ver locais/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /voltar ao meu perfil/i })).toBeInTheDocument()
    })
  })

  it('exibe overlay de erro quando createPlace lança exceção', async () => {
    vi.mocked(placeAdaptor.createPlace).mockRejectedValue(new Error('Erro de rede'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/nome do local/i), 'Local Teste')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/descrição do local/i), 'Descrição de teste.')

    const categorySelect = screen.getByLabelText(/categoria/i)
    await user.selectOptions(categorySelect, 'CACHOEIRA')

    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput, fakeImage())

    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }))

    await waitFor(() =>
      expect(screen.getByText('Falha ao cadastrar local')).toBeInTheDocument()
    )
  })

  it('"Voltar ao formulário" no overlay de erro reseta o overlay', async () => {
    vi.mocked(placeAdaptor.createPlace).mockRejectedValue(new Error('Erro'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/nome do local/i), 'Local Teste')
    await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123')
    await user.type(screen.getByLabelText(/descrição do local/i), 'Descrição de teste.')

    const categorySelect = screen.getByLabelText(/categoria/i)
    await user.selectOptions(categorySelect, 'CACHOEIRA')

    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput, fakeImage())

    await user.click(screen.getByRole('button', { name: /cadastrar novo local/i }))

    await waitFor(() =>
      expect(screen.getByText('Falha ao cadastrar local')).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /voltar ao formulário/i }))

    await waitFor(() => {
      expect(screen.queryByText('Falha ao cadastrar local')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cadastrar novo local/i })).toBeInTheDocument()
    })
  })

  it('preview de foto aparece após upload e botão de remover está presente', async () => {
    const user = userEvent.setup()
    renderPage()

    const fileInput = document.querySelector('input[type="file"]')
    await user.upload(fileInput, fakeImage('praia.jpg'))

    await waitFor(() =>
      expect(screen.getByAltText('Foto 1')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /remover foto 1/i })).toBeInTheDocument()
  })
})
