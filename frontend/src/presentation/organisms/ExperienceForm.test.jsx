import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ExperienceForm from './ExperienceForm'

const renderForm = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('ExperienceForm — RF05', () => {
  it('renderiza campos: avaliação, custo e comentário', () => {
    renderForm(<ExperienceForm onSubmit={vi.fn()} />)
    expect(screen.getByText(/qual sua avaliação/i)).toBeInTheDocument()
    expect(screen.getByText(/qual foi o custo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/seu comentário/i)).toBeInTheDocument()
  })

  it('renderiza opções de custo ($  a $$$$$)', () => {
    renderForm(<ExperienceForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: '$' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$$$$$' })).toBeInTheDocument()
  })

  it('renderiza 5 botões de estrela interativos', () => {
    renderForm(<ExperienceForm onSubmit={vi.fn()} />)
    const stars = screen.getAllByRole('button', { name: /estrela/i })
    expect(stars).toHaveLength(5)
  })

  it('exibe botão "Enviar Avaliação"', () => {
    renderForm(<ExperienceForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /enviar avaliação/i })).toBeInTheDocument()
  })

  it('exibe botão Cancelar quando onCancel é fornecido', () => {
    renderForm(<ExperienceForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('chama onCancel ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    const handleCancel = vi.fn()
    renderForm(<ExperienceForm onSubmit={vi.fn()} onCancel={handleCancel} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('exibe erro se comentário estiver vazio ao submeter', async () => {
    const user = userEvent.setup()
    renderForm(<ExperienceForm onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '5 estrelas' }))
    await user.click(screen.getByRole('button', { name: /enviar avaliação/i }))

    await waitFor(() =>
      expect(screen.getByText(/comentário não pode estar vazio/i)).toBeInTheDocument()
    )
  })

  it('exibe erro se comentário tiver menos de 20 caracteres', async () => {
    const user = userEvent.setup()
    renderForm(<ExperienceForm onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '3 estrelas' }))
    await user.type(screen.getByLabelText(/seu comentário/i), 'Curto demais')
    await user.click(screen.getByRole('button', { name: /enviar avaliação/i }))

    await waitFor(() =>
      expect(screen.getByText(/mínimo de 20 caracteres/i)).toBeInTheDocument()
    )
  })

  it('chama onSubmit com dados corretos quando formulário é válido', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(<ExperienceForm onSubmit={handleSubmit} />)

    await user.click(screen.getByRole('button', { name: '5 estrelas' }))
    await user.click(screen.getByRole('button', { name: '$$' }))
    await user.type(
      screen.getByLabelText(/seu comentário/i),
      'Lugar incrível, voltaria com certeza. Pirenópolis é maravilhosa!'
    )
    await user.click(screen.getByRole('button', { name: /enviar avaliação/i }))

    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 5, cost: '$$', text: expect.stringContaining('Lugar incrível') })
      )
    )
  })

  it('pré-preenche campos com defaultValues fornecidos', () => {
    renderForm(
      <ExperienceForm
        onSubmit={vi.fn()}
        defaultValues={{ text: 'Relato pré-existente de teste longo', rating: 3 }}
      />
    )
    expect(screen.getByLabelText(/seu comentário/i)).toHaveValue('Relato pré-existente de teste longo')
  })
})
