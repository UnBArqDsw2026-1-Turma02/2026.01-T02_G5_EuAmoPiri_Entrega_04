/**
 * ORGANISMO — Header
 *
 * Barra de navegação principal do app.
 * Responsivo: menu hambúrguer no mobile, links inline no desktop.
 *
 * Comportamento por estado de autenticação:
 *   - Não logado:    logo + links públicos + botões Entrar / Cadastrar
 *   - Morador:       logo + links públicos + link "Meu Painel" + avatar + logout
 *   - Turista:       logo + links públicos + link "Meu Painel" + avatar + logout
 */
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdMenu, MdClose, MdPerson } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../atoms/Avatar';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import styles from './Header.module.css';

export default function Header() {
  const { user, isAuthenticated, isMorador, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
    setMenuOpen(false);
  }

  const navLinkClass = ({ isActive }) =>
    [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ').trim();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="Eu Amo Piri — página inicial">
          <span className={styles.logoHeart}>❤︎</span>
          <span className={styles.logoText}>Eu Amo Piri</span>
        </Link>

        {/* Navegação desktop */}
        <nav className={styles.nav} aria-label="Navegação principal">
          <NavLink to="/" className={navLinkClass} end>Sobre Piri</NavLink>
          <NavLink to="/locais" className={navLinkClass}>Locais</NavLink>
          {isAuthenticated && (
            <NavLink
              to={isMorador ? '/morador/painel' : '/turista/painel'}
              className={navLinkClass}
            >
              Meu Painel
            </NavLink>
          )}
        </nav>

        {/* Ações desktop */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to="/perfil" className={styles.avatarLink} aria-label="Ver perfil">
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" as={Link} to="/cadastro">
                Cadastre-se
              </Button>
              <Button variant="primary" size="sm" as={Link} to="/login">
                Entrar
              </Button>
            </>
          )}
        </div>

        {/* Botão hambúrguer (mobile) */}
        <button
          className={styles.menuBtn}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon as={menuOpen ? MdClose : MdMenu} size="lg" decorative />
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className={styles.mobileMenu}
          aria-label="Menu mobile"
        >
          <NavLink to="/" className={navLinkClass} end onClick={() => setMenuOpen(false)}>
            Sobre Piri
          </NavLink>
          <NavLink to="/locais" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            Locais
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to={isMorador ? '/morador/painel' : '/turista/painel'}
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Meu Painel
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              <NavLink to="/perfil" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                <Icon as={MdPerson} size="sm" decorative /> Meu Perfil
              </NavLink>
              <button className={styles.mobileLogout} onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Button variant="outline" fullWidth as={Link} to="/cadastro" onClick={() => setMenuOpen(false)}>
                Cadastre-se
              </Button>
              <Button variant="primary" fullWidth as={Link} to="/login" onClick={() => setMenuOpen(false)}>
                Entrar
              </Button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
