import Link from "next/link"

const Header = () => {
  return (
    <header className="bg-gray-100 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          My App
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-blue-500">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-500">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/doctor/dashboard" className="hover:text-blue-500">
                Espace Médecin
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-blue-500">
                Espace Patient
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
