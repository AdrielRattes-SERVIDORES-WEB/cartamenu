import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link, useParams } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import CartIcon from './CartIcon';
import ProductSearchDialog from "./ProductSearchDialog";
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  restaurantName: string;
  showSearch?: boolean;
  rightContent?: React.ReactNode;
}

const Header = ({ restaurantName, showSearch = false, rightContent }: HeaderProps) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const { currentUser } = useUser();
  const { slug } = useParams<{ slug?: string }>();
  const homeLink = slug ? `/${slug}` : '/';
  // Novo estado para abrir o dialog de busca
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSearch = () => {
    setSearchOpen((open) => !open);
  };

  return (
    <header className="bg-[#FAF6F1]/95 backdrop-blur-md sticky top-0 z-50 border-b border-amber-100/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to={homeLink} className="font-display text-xl font-bold text-primary tracking-tight italic" style={{ fontVariationSettings: "'opsz' 24, 'SOFT' 40" }}>
            {restaurantName}
          </Link>

          <div className="flex items-center gap-1">
            {showSearch && (
              <button
                onClick={toggleSearch}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </button>
            )}

            {rightContent || (
              <div className="flex items-center gap-1">
                <LanguageSelector />
                <CartIcon />
                <Link
                  to={currentUser ? (currentUser.role === 'admin' ? '/admin' : '/customer') : '/login'}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Perfil"
                >
                  <User className="h-5 w-5 text-gray-600" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {showSearch && (
          <ProductSearchDialog open={searchOpen} setOpen={setSearchOpen} />
        )}
      </div>
    </header>
  );
};

export default Header;
