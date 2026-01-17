import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', {
      name: /welcome to next\.js/i,
    })

    expect(heading).toBeInTheDocument()
  })

  it('renders the code snippet', () => {
    render(<Home />)

    const code = screen.getByText(/app\/page\.tsx/i)

    expect(code).toBeInTheDocument()
  })
})

