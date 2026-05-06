import '../styles/MenuButton.css'

interface MenuButtonProps {
  label: string
  onClick: () => void
}

export default function MenuButton({ label, onClick }: MenuButtonProps) {
  return (
    <button className="menu-button" onClick={onClick}>
      {label}
    </button>
  )
}
