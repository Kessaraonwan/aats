import React from 'react'

function Header(props) {
  return (
    <header className="premium-header px-4 py-3">
      <h1 className="text-xl font-bold text-white">{props.title}</h1>
    </header>
  )
}

export default Header