import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mocks de imagens (assets retornam string em testes)
vi.mock('../assets/piriimagem1.png', () => ({ default: 'piriimagem1.png' }))
vi.mock('../assets/piriimagem2.png', () => ({ default: 'piriimagem2.png' }))
vi.mock('../assets/piriimagem3.png', () => ({ default: 'piriimagem3.png' }))
vi.mock('../assets/piriimagem4.png', () => ({ default: 'piriimagem4.png' }))
vi.mock('../assets/piriimagem5.png', () => ({ default: 'piriimagem5.png' }))
vi.mock('../assets/piriimagem6.png', () => ({ default: 'piriimagem6.png' }))

import SobrePiriPage from './SobrePiriPage'

const renderPage = () =>
  render(<MemoryRouter><SobrePiriPage /></MemoryRouter>)

describe('SobrePiriPage — RF14', () => {
  it('renderiza o título da seção Origem', () => {
    renderPage()
    expect(
      screen.getByText(/origem da cidade de pirenópolis/i)
    ).toBeInTheDocument()
  })

  it('renderiza a seção História com aria-labelledby', () => {
    renderPage()
    expect(screen.getByRole('region', { name: /história/i })).toBeInTheDocument()
  })

  it('renderiza a seção Atualidade com aria-labelledby', () => {
    renderPage()
    expect(screen.getByRole('region', { name: /atualidade/i })).toBeInTheDocument()
  })

  it('todas as imagens têm atributo alt não vazio', () => {
    renderPage()
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(4)
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt')
      expect(img.getAttribute('alt')).not.toBe('')
    })
  })

  it('conteúdo menciona o ano de fundação 1727', () => {
    renderPage()
    expect(screen.getByText(/1727/)).toBeInTheDocument()
  })

  it('conteúdo menciona o nome Pirenópolis', () => {
    renderPage()
    const matches = screen.getAllByText(/pirenópolis/i)
    expect(matches.length).toBeGreaterThan(0)
  })
})
