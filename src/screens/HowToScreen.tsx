import MenuButton from '../components/MenuButton'
import '../styles/HowToScreen.css'

interface HowToScreenProps {
  onBack: () => void
}

export default function HowToScreen({ onBack }: HowToScreenProps) {
  return (
    <div className="howto-screen fade-in">
      <h2 className="howto-title">게임 방법</h2>
      <table className="controls-table">
        <tbody>
          <tr>
            <td>←</td>
            <td>왼쪽 이동</td>
          </tr>
          <tr>
            <td>→</td>
            <td>오른쪽 이동</td>
          </tr>
          <tr>
            <td>Space</td>
            <td>작살 발사</td>
          </tr>
        </tbody>
      </table>
      <MenuButton label="돌아가기" onClick={onBack} />
    </div>
  )
}
