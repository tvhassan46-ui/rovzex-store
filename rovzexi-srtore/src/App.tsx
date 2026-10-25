import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check,
  Heart, Menu, MessageCircle, Plus, Search, ShieldCheck,
  SlidersHorizontal, Star, X,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { categories, initialProducts, type Product } from './data'

type OrderItem = { productId: string; quantity: number }
type Order = { id: string; date: string; customer: string; city: string; phone: string; items: OrderItem[]; total: number; status: string }
type Language = 'fr' | 'en' | 'ar'

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) as T : fallback
  } catch {
    return fallback
  }
}

const money = (n: number) => `${n.toLocaleString('fr-MA')} DH`
const imageFallback = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80'
const defaultProductGuidance = {
  highlights: ['Consultez les fonctions disponibles dans l’édition proposée.', 'Vérifiez les prérequis et la compatibilité de votre appareil.', 'Enregistrez votre travail puis exportez-le au format adapté.'],
  howToUse: ['Confirmez la version, les conditions de licence et la compatibilité avant l’achat.', 'Installez le logiciel depuis sa source officielle et suivez ses consignes.', 'Créez un nouveau projet et choisissez un modèle adapté à votre besoin.', 'Consultez l’aide officielle du fournisseur pour les fonctions avancées.'],
}
const loadProducts = (): Product[] => {
  const stored = readStore<Partial<Product>[]>('rovzexi-software-products', initialProducts)
  if (!Array.isArray(stored)) return initialProducts
  return stored.filter(saved => saved.id !== 'sw3').map((saved, index) => {
    const base = initialProducts.find(product => product.id === saved.id) ?? initialProducts[index] ?? {
      id: saved.id ?? `saved-${index}`,
      name: saved.name ?? 'Logiciel',
      category: saved.category ?? 'Logiciels',
      categoryKey: saved.categoryKey ?? 'electronics',
      price: saved.price ?? 0,
      rating: saved.rating ?? 0,
      reviews: saved.reviews ?? 0,
      stock: saved.stock ?? 0,
      image: saved.image ?? imageFallback,
      description: saved.description ?? '',
      brand: 'ROVZEXI',
      brandMark: 'R',
      accent: '#c8ff35',
      ...defaultProductGuidance,
    }
    return {
      id: saved.id ?? base.id,
      name: saved.name ?? base.name,
      category: saved.category ?? base.category,
      categoryKey: saved.categoryKey ?? base.categoryKey,
      price: saved.price ?? base.price,
      oldPrice: saved.oldPrice ?? base.oldPrice,
      rating: saved.rating ?? base.rating,
      reviews: saved.reviews ?? base.reviews,
      stock: saved.stock ?? base.stock,
      image: saved.image ?? base.image,
      tag: saved.tag ?? base.tag,
      description: saved.description ?? base.description,
      brand: saved.brand ?? base.brand,
      brandMark: saved.brandMark ?? base.brandMark,
      accent: saved.accent ?? base.accent,
      brandImage: saved.brandImage ?? base.brandImage,
      highlights: Array.isArray(saved.highlights) ? saved.highlights : base.highlights ?? defaultProductGuidance.highlights,
      howToUse: Array.isArray(saved.howToUse) ? saved.howToUse : base.howToUse ?? defaultProductGuidance.howToUse,
    }
  })
}
const dictionary = {
  fr: { home: 'Accueil', shop: 'Logiciels', electronics: 'Logiciels', moroccan: 'Création', about: 'À propos', contact: 'Contact', search: 'Rechercher un logiciel...', discover: 'Découvrir les logiciels', add: 'Commander sur WhatsApp', all: 'Voir tous les logiciels', new: 'LOGICIELS & LICENCES', wishlist: 'Favoris', admin: 'Admin démo' },
  en: { home: 'Home', shop: 'Software', electronics: 'Software', moroccan: 'Creative tools', about: 'About', contact: 'Contact', search: 'Search software...', discover: 'Discover software', add: 'Order on WhatsApp', all: 'Browse all software', new: 'SOFTWARE & LICENSES', wishlist: 'Wishlist', admin: 'Demo admin' },
  ar: { home: 'الرئيسية', shop: 'البرامج', electronics: 'البرامج', moroccan: 'التصميم والإبداع', about: 'من نحن', contact: 'اتصل بنا', search: 'ابحث عن برنامج...', discover: 'اكتشف البرامج', add: 'اطلب عبر واتساب', all: 'اكتشف جميع البرامج', new: 'برامج ورخص', wishlist: 'المفضلة', admin: 'إدارة تجريبية' },
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [language, setLanguage] = useState<Language>(() => readStore('rovzexi-language', 'fr'))
  const [products, setProducts] = useState<Product[]>(loadProducts)
  const [wishlist, setWishlist] = useState<string[]>(() => readStore('rovzexi-wishlist', []))
  const [orders, setOrders] = useState<Order[]>(() => readStore('rovzexi-software-orders', []))
  const [toast, setToast] = useState('')
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = dictionary[language]

  useEffect(() => { localStorage.setItem('rovzexi-software-products', JSON.stringify(products)) }, [products])
  useEffect(() => { localStorage.setItem('rovzexi-wishlist', JSON.stringify(wishlist)) }, [wishlist])
  useEffect(() => { localStorage.setItem('rovzexi-software-orders', JSON.stringify(orders)) }, [orders])
  useEffect(() => { localStorage.setItem('rovzexi-language', JSON.stringify(language)); document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'; document.documentElement.lang = language }, [language])
  useEffect(() => { if (toast) { const timer = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timer) } }, [toast])

  const whatsapp = ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '212637296182').replace(/\D/g, '').replace(/^0/, '212')
  const contactWhatsApp = (product?: Product, message?: string) => {
    const text = message ?? (product
      ? `Salam, bghit n3ref ktar 3la ${product.name} (${money(product.price)}). Wach momkin t2akdo lia no3 l-license, l-modda w compatibility?`
      : 'Salam ROVZEXI, 3ndi so2al 3la les logiciels et licences.')
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }
  const toggleWishlist = (id: string) => {
    const exists = wishlist.includes(id)
    setWishlist(rows => exists ? rows.filter(row => row !== id) : [...rows, id])
    setToast(exists ? 'Retiré de vos favoris' : 'Ajouté à vos favoris')
  }
  const route = location.pathname
  const productId = route.startsWith('/product/') ? route.split('/')[2] : ''
  const activeProduct = products.find(p => p.id === productId)
  const go = (to: string) => { navigate(to); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const navLinks = [
    [t.home, '/'], [t.shop, '/shop'], [t.electronics, '/electronics'], [t.moroccan, '/creative'],
  ]

  return <div className="min-h-screen bg-[#080909] text-[#f5f6f3]">
    <div className="flex h-[30px] items-center justify-center overflow-hidden bg-[#c8ff35] px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#10120c]">
      <span className="flex items-center gap-2"><MessageCircle size={13} /> Logiciels & licences · Prix en MAD · Commande directe sur WhatsApp</span>
    </div>
    <header className="sticky top-0 z-40 border-b border-white/[.07] bg-[#080909]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 md:px-10">
        <button className="group flex items-center gap-2.5 text-left" onClick={() => go('/')} aria-label="ROVZEXI home"><BrandLogo/><span className="hidden border-l border-white/15 pl-3 text-[8px] uppercase leading-[1.5] tracking-[.2em] text-[#8b8e87] sm:inline">Beyond<br/>ordinary</span></button>
        <nav className="hidden items-center gap-7 lg:flex">{navLinks.map(([label, path]) => <button key={path} onClick={() => go(path)} className={`text-[12px] transition hover:text-[#c8ff35] ${route === path ? 'text-[#c8ff35]' : 'text-[#b1b3ad]'}`}>{label}</button>)}</nav>
        <div className="hidden items-center gap-3 md:flex">
          <div className="group flex h-10 items-center rounded-full border border-white/10 px-3 transition focus-within:border-[#c8ff35]/50"><Search size={15} className="text-[#777a72]" /><input aria-label={t.search} value={query} onChange={e => { setQuery(e.target.value); if (e.target.value) navigate('/shop') }} placeholder={t.search} className="w-[150px] bg-transparent pl-2 text-[11px] outline-none placeholder:text-[#686a65]" /><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-[#70736c]">⌘ K</kbd></div>
          <select aria-label="Language" value={language} onChange={e => setLanguage(e.target.value as Language)} className="bg-transparent text-[11px] text-[#c5c7c1] outline-none"><option className="bg-[#111]" value="fr">FR</option><option className="bg-[#111]" value="en">EN</option><option className="bg-[#111]" value="ar">عربي</option></select>
          <button aria-label="Wishlist" onClick={() => go('/wishlist')} className="relative p-2 text-[#c4c6c0] hover:text-[#c8ff35]"><Heart size={18} />{wishlist.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#c8ff35] px-1 text-[9px] font-bold text-black">{wishlist.length}</span>}</button>
        </div>
        <div className="flex items-center gap-3 md:hidden"><button aria-label="Open menu" onClick={() => setMobileOpen(o => !o)}>{mobileOpen ? <X size={21}/> : <Menu size={21}/>}</button></div>
      </div>
      <AnimatePresence>{mobileOpen && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/10 bg-[#0b0c0b] px-6 lg:hidden"><div className="flex flex-col gap-4 py-5">{navLinks.map(([label, path]) => <button key={path} className="text-left text-sm" onClick={() => go(path)}>{label}</button>)}<div className="flex gap-3"><select aria-label="Language" value={language} onChange={e => setLanguage(e.target.value as Language)} className="bg-transparent text-sm"><option className="bg-[#111]" value="fr">FR</option><option className="bg-[#111]" value="en">EN</option><option className="bg-[#111]" value="ar">AR</option></select><button onClick={() => go('/wishlist')}>♡ Favoris</button></div></div></motion.nav>}</AnimatePresence>
    </header>

    <main>
      {route === '/' && <Home products={products} onNavigate={go} onOrder={contactWhatsApp} onQuick={setQuickView} onWish={toggleWishlist} wishlist={wishlist} t={t} />}
      {(route === '/shop' || route === '/electronics' || route === '/creative' || route === '/moroccan') && <ShopPage products={products} query={query} setQuery={setQuery} onOrder={contactWhatsApp} onQuick={setQuickView} onWish={toggleWishlist} wishlist={wishlist} initialCategory={route === '/creative' ? 'creative' : route === '/electronics' || route === '/moroccan' ? 'electronics' : 'all'} />}
      {['/cart', '/checkout', '/orders'].includes(route) && <Navigate to="/shop" replace />}
      {route === '/wishlist' && <WishlistPage products={products.filter(p => wishlist.includes(p.id))} onWish={toggleWishlist} onOrder={contactWhatsApp} onNavigate={go} />}
      {route.startsWith('/product/') && <ProductPage product={activeProduct} products={products} onOrder={contactWhatsApp} onWish={toggleWishlist} wishlist={wishlist} onNavigate={go} />}
      {route === '/about' && <AboutPage onNavigate={go} />}
      {route === '/contact' && <ContactPage setToast={setToast} contactWhatsApp={contactWhatsApp} />}
      {route === '/admin' && <AdminPage products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} setToast={setToast} />}
      {!['/', '/shop', '/electronics', '/creative', '/moroccan', '/cart', '/checkout', '/wishlist', '/about', '/contact', '/orders', '/admin'].includes(route) && !route.startsWith('/product/') && <NotFound onNavigate={go} />}
    </main>

    <Footer onNavigate={go} contactWhatsApp={contactWhatsApp} t={t} />
    <button onClick={() => contactWhatsApp()} className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full border border-[#c8ff35]/60 bg-[#c8ff35] text-[#10120c] shadow-[0_8px_34px_rgba(200,255,53,.25)] transition hover:scale-110" aria-label="Contactez-nous sur WhatsApp"><MessageCircle size={22}/></button>
    <AnimatePresence>{toast && <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#181a17] px-5 py-3 text-xs shadow-2xl"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#c8ff35] text-black"><Check size={13}/></span>{toast}</motion.div>}</AnimatePresence>
    <AnimatePresence>{quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} onOrder={product => { contactWhatsApp(product); setQuickView(null) }} onDetail={id => { setQuickView(null); go(`/product/${id}`) }} />}</AnimatePresence>
  </div>
}

type ProductActions = { onOrder: (product: Product) => void; onQuick: (product: Product) => void; onWish: (id: string) => void; wishlist: string[] }

function ProductCard({ product, onOrder, onQuick, onWish, wishlist }: { product: Product } & ProductActions) {
  return <motion.article layout className="product-card group relative overflow-hidden rounded-[17px] border border-white/[.08] bg-[#111312]">
    <button onClick={() => onQuick(product)} className="relative block aspect-[.91] w-full overflow-hidden bg-[#1a1c19] text-left" aria-label={`Aperçu rapide : ${product.name}`}>
      <img src={product.image} alt={`Illustration ${product.name}`} onError={e => { e.currentTarget.src = imageFallback }} className="product-image h-full w-full object-cover opacity-90" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-t from-black/50 via-transparent to-black/10">
        <SoftwareBrandBadge product={product}/>
      </div>
      {product.tag && <span className="absolute left-3 top-3 rounded-full bg-[#c8ff35] px-2.5 py-1 text-[8px] font-bold tracking-[.12em] text-[#10120c]">{product.tag}</span>}
      <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md" onClick={e => { e.stopPropagation(); onWish(product.id) }}><Heart size={15} className={wishlist.includes(product.id) ? 'fill-[#c8ff35] text-[#c8ff35]' : ''}/></span>
      <span className="absolute bottom-3 left-3 right-3 translate-y-2 rounded-lg bg-white px-3 py-2.5 text-center text-[11px] font-semibold text-black opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">{'Aperçu rapide  ↗'}</span>
    </button>
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[9px] uppercase tracking-[.17em] text-[#878b80]">{product.category}</span><span className="flex items-center gap-1 text-[10px] text-[#b9bbB4]"><Star size={11} className="fill-[#c8ff35] text-[#c8ff35]"/>{product.rating}</span></div>
      <button onClick={() => onQuick(product)} className="line-clamp-2 min-h-10 text-left font-display text-[14px] font-semibold leading-5 transition hover:text-[#c8ff35]">{product.name}</button>
      <div className="mt-3 flex items-center justify-between gap-2"><div><span className="font-display text-[15px] font-semibold">{money(product.price)}</span>{product.oldPrice && <span className="ml-2 text-[10px] text-[#72756d] line-through">{money(product.oldPrice)}</span>}</div><button aria-label={`Commander ${product.name} sur WhatsApp`} onClick={() => onOrder(product)} className="grid h-9 w-9 place-items-center rounded-full bg-[#c8ff35] text-[#10120c] transition hover:scale-105"><MessageCircle size={16}/></button></div>
    </div>
  </motion.article>
}

function SoftwareBrandBadge({ product, large = false }: { product: Product; large?: boolean }) {
  const [light, dark] = softwareMarkColors[product.id] ?? ['#baff45', '#24c5a8']
  const isCustomLogo = Boolean(product.brandImage)

  return <div className={`flex items-center ${large ? 'gap-4' : 'flex-col gap-2'}`}>
    <span style={{
      color: light,
      borderColor: `${light}88`,
      background: isCustomLogo ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(234,240,236,0.96) 50%, rgba(200,255,53,0.15))' : `linear-gradient(145deg, ${light}2e, #131715 60%, ${dark}55)`,
      boxShadow: isCustomLogo ? `0 16px 28px ${dark}40, inset 2px 2px 4px rgba(255,255,255,.9), inset -8px -8px 16px rgba(0,0,0,.18)` : `inset 2px 2px 5px #ffffff35, inset -4px -5px 8px #0000008c, 0 12px 32px ${dark}70`,
    }} className={`grid shrink-0 place-items-center overflow-hidden border backdrop-blur-xl ${large ? 'h-[84px] w-[92px] rounded-2xl p-1.5' : 'h-[68px] w-[72px] rounded-[18px] p-1'}`}>
      {isCustomLogo
        ? <img src={product.brandImage} alt={`Logo fourni pour ${product.name}`} className="max-h-full max-w-full object-contain p-1.5 drop-shadow-[0_8px_10px_rgba(12,16,12,0.16)]"/>
        : <SoftwareMark product={product} size={large ? 52 : 44}/>}
    </span>
    <span className={large ? 'text-left' : 'text-center'}>
      {large && <span className="mb-1 block text-[8px] uppercase tracking-[.2em] text-white/50">{product.brandImage ? 'Logo officiel' : 'Symbole original'}</span>}
      <span className={`block font-display font-semibold tracking-[.12em] text-white ${large ? 'text-[11px]' : 'text-[9px]'}`}>{product.brand}</span>
      {!large && <span className="mt-1 block text-[8px] text-white/55">{product.brandImage ? 'Logo additionnel' : 'Création ROVZEXI · non officiel'}</span>}
    </span>
  </div>
}

const softwareMarkColors: Record<string, [string, string]> = {
  sw1: ['#ff9a55', '#e33d36'], sw2: ['#74f0cf', '#3f72ed'],
  sw4: ['#ffcf6a', '#eb643e'],
  sw5: ['#ef92ff', '#8f4ee8'], sw6: ['#7be8b4', '#198b83'],
  sw7: ['#65c9ff', '#3657e8'], sw8: ['#ffc568', '#ef7136'],
  sw9: ['#c09aff', '#7048e8'], sw10: ['#ff83b6', '#c33e8a'],
  sw11: ['#73c6ff', '#3865d9'], sw12: ['#7de7ff', '#3289c8'],
  sw13: ['#b7f36c', '#3eaa75'], sw14: ['#e2ff79', '#26b8a3'],
  sw15: ['#ffad70', '#d94f3c'], sw16: ['#7cf0d4', '#5180ec'],
}

function SoftwareMark({ product, size }: { product: Product; size: number }) {
  const instanceId = useId().replace(/:/g, '')
  const marks: Record<string, ReactNode> = {
    sw1: <g><path d="M12 34V13h21M17 34h19M19 18v10m6-10v6m6-6v10" /><path d="m13 33 18-18 5 5-18 18h-5z" /><circle cx="33" cy="14" r="1.5" fill="currentColor" /></g>,
    sw2: <g><circle cx="24" cy="24" r="4" fill="currentColor" /><path d="M24 20c-3-4-2-12 2-12s5 8 1 12m1 2c5-1 12 3 10 7s-9 0-11-4m-1 3c1 5-3 12-7 10s0-9 4-11m-3-1c-5 1-12-3-10-7s9 0 11 4m2 4c4 3 5 11 1 12s-5-8-1-12" /></g>,
    sw4: <g><path d="m24 6 17 9v18l-17 9-17-9V15zM7 15l17 10 17-10M24 25v17" /><path d="m15 11 17 10v9" /></g>,
    sw5: <g><circle cx="24" cy="24" r="14" /><path d="M10 24c4-8 23-12 28-4M11 28c8 5 20 7 26 1M24 10c-6 7-8 18-2 28" /><circle cx="36" cy="14" r="2" fill="currentColor" /></g>,
    sw6: <g><path d="M11 16h14a7 7 0 0 1 0 14H13a6 6 0 0 0 0 12h21M30 12l6 4-6 4" /><circle cx="14" cy="23" r="3" /><circle cx="34" cy="36" r="3" /></g>,
    sw7: <g><rect x="8" y="9" width="32" height="30" rx="4" /><circle cx="30" cy="18" r="3" /><path d="m11 33 9-9 6 6 4-4 7 8" /><path d="M14 13h8" /></g>,
    sw8: <g><path d="M10 35c5-17 21-17 28-6M10 35c7 3 20 4 28-6" /><circle cx="10" cy="35" r="3" fill="currentColor" /><circle cx="38" cy="29" r="3" fill="currentColor" /><circle cx="24" cy="25" r="2" /><path d="M24 23v-8" /></g>,
    sw9: <g><path d="M9 13h19M9 21h25M9 29h17M9 37h20" /><path d="m31 24 11 7-11 7z" fill="currentColor" /><path d="M13 10v6m11 2v6m-8 2v6m17 2v6" /></g>,
    sw10: <g><path d="m24 9 12 7v14l-12 7-12-7V16zM12 16l12 7 12-7M24 23v14" /><circle cx="24" cy="7" r="2" fill="currentColor" /><circle cx="39" cy="15" r="2" fill="currentColor" /><circle cx="9" cy="15" r="2" fill="currentColor" /><path d="m24 9 15 6M24 9 9 15" /></g>,
    sw11: <g><path d="M13 7h16l8 8v24H13zM29 7v9h8M19 23h12m-12 6h12m-12 6h7" /><path d="m18 16 3 3 5-6" /></g>,
    sw12: <g><rect x="8" y="8" width="32" height="32" rx="3" /><path d="M24 8v32M8 24h32" /><path d="M13 13h6m-6 6h6m10 10h6m-6 6h6" /></g>,
    sw13: <g><path d="M24 7 38 13v10c0 9-5 14-14 18-9-4-14-9-14-18V13z" /><path d="m17 24 5 5 10-11" /><circle cx="34" cy="14" r="2" fill="currentColor" /></g>,
    sw14: <g><path d="M13 9h7v7h-7zM28 9h7v7h-7zM13 32h7v7h-7zM28 32h7v7h-7z" /><path d="m20 13 8 22M28 13l-8 22M8 24h8m16 0h8" /></g>,
    sw15: <g><rect x="11" y="11" width="26" height="26" rx="2" /><path d="M16 30V18h6v12m-6-6h6m4 6 5-12 5 12m-8-4h6" /><path d="M7 11v26m-2-26h4m-4 26h4M11 7h26m-26-2v4m26-4v4" /></g>,
    sw16: <g><circle cx="16" cy="18" r="5" /><circle cx="32" cy="18" r="5" /><circle cx="24" cy="32" r="5" /><path d="m20 20 2 8m6-8-2 8m-5-10h6" /><path d="m37 8 1.5 3.5L42 13l-3.5 1.5L37 18l-1.5-3.5L32 13l3.5-1.5z" fill="currentColor" /></g>,
  }
  const [light, dark] = softwareMarkColors[product.id] ?? ['#baff45', '#24c5a8']
  const mark = marks[product.id] ?? <g><path d="M10 24h28M24 10v28M15 15l18 18m0-18L15 33" /><circle cx="24" cy="24" r="15" /></g>
  const gradientId = `mark-${product.id}-${instanceId}`
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 2px 0 ${dark}) drop-shadow(0 5px 5px #000a)` }}>
    <defs><linearGradient id={gradientId} x1="8" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".95"/><stop offset=".22" stopColor={light}/><stop offset=".72" stopColor={dark}/><stop offset="1" stopColor={light}/></linearGradient></defs>
    <g transform="translate(0 1.6)" stroke="#050807" strokeWidth="4" opacity=".95">{mark}</g>
    <g stroke={`url(#${gradientId})`} strokeWidth="2.8">{mark}</g>
  </svg>
}

function ProductGrid({ products, ...actions }: { products: Product[] } & ProductActions) {
  if (!products.length) return <div className="col-span-full grid min-h-60 place-items-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-[#8b8e87]">Aucun produit trouvé. Essayez une autre recherche.</div>
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">{products.map(product => <ProductCard key={product.id} product={product} {...actions} />)}</div>
}

function Home({ products, onNavigate, onOrder, onQuick, onWish, wishlist, t }: { products: Product[]; onNavigate: (path: string) => void; onOrder: (p: Product) => void; onQuick: (p: Product) => void; onWish: (id: string) => void; wishlist: string[]; t: typeof dictionary.fr }) {
  const featured = products.slice(0, 4)
  return <>
    <section className="noise relative min-h-[600px] overflow-hidden border-b border-white/[.06] md:min-h-[680px]">
      <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=90" alt="" className="h-full w-full object-cover opacity-[.32]"/><div className="absolute inset-0 bg-gradient-to-r from-[#080909] via-[#080909]/85 to-transparent"/><div className="absolute inset-0 bg-gradient-to-t from-[#080909] via-transparent to-[#080909]/25"/></div>
      <div className="relative mx-auto flex min-h-[600px] max-w-[1440px] items-center px-6 py-16 md:min-h-[680px] md:px-14">
        <div className="max-w-[760px]">
          <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.25em] text-[#c8ff35]"><span className="relative h-2 w-2 rounded-full bg-[#c8ff35] pulse-ring"/>{t.new} <span className="text-white/40">—</span> Autodesk · Canva · Adobe</div>
          <h1 className="font-display text-[clamp(4rem,10vw,9rem)] font-semibold leading-[.82] tracking-[-.09em]">Beyond<br/><span className="text-[#c8ff35]">the ordinary.</span></h1>
          <p className="mt-8 max-w-[440px] text-[14px] leading-7 text-[#b1b3ad] md:text-[16px]">Vos logiciels préférés, au prix affiché en dirhams. Choisissez un programme et contactez-nous sur WhatsApp pour vérifier l’offre et sa compatibilité.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3"><button onClick={() => onNavigate('/shop')} className="lime-glow inline-flex items-center gap-3 rounded-full bg-[#c8ff35] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[.1em] text-[#0b0d08] transition hover:scale-[1.03]">{t.discover}<ArrowRight size={15}/></button><button onClick={() => onNavigate('/about')} className="rounded-full border border-white/20 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[.08em] transition hover:border-white/60">Notre univers <ArrowUpRight size={14} className="ml-1 inline"/></button></div>
          <div className="mt-14 flex gap-8 border-t border-white/15 pt-5"><div><div className="font-display text-2xl font-semibold">16<span className="text-[#c8ff35]">+</span></div><div className="mt-1 text-[9px] uppercase tracking-[.17em] text-[#92958d]">logiciels listés</div></div><div><div className="font-display text-2xl font-semibold">DH<span className="text-[#c8ff35]">.</span></div><div className="mt-1 text-[9px] uppercase tracking-[.17em] text-[#92958d]">prix affichés</div></div><div><div className="font-display text-2xl font-semibold">WA<span className="text-[#c8ff35]">↗</span></div><div className="mt-1 text-[9px] uppercase tracking-[.17em] text-[#92958d]">commande directe</div></div></div>
        </div>
        <div className="absolute bottom-12 right-10 hidden items-center gap-3 text-[9px] uppercase tracking-[.2em] text-white/45 lg:flex"><ArrowDown size={15}/> Scroll to explore</div>
      </div>
      <div className="absolute right-[7%] top-[18%] hidden h-64 w-64 rounded-full border border-[#c8ff35]/15 lg:block"><div className="absolute inset-7 rounded-full border border-white/[.08]"/><div className="absolute inset-[60px] rounded-full border border-[#c8ff35]/15"/><div className="absolute right-0 top-1/2 h-2 w-2 rounded-full bg-[#c8ff35] shadow-[0_0_20px_5px_rgba(200,255,53,.35)]"/></div>
    </section>
    <div className="overflow-hidden border-b border-white/[.07] py-4"><div className="marquee-track flex w-max gap-10 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[.22em] text-[#7d8078]">{Array.from({ length: 4 }, (_, i) => <span key={i} className="flex items-center gap-10">AUTODESK <span className="text-[#c8ff35]">✳</span> CANVA PRO <span className="text-[#c8ff35]">✳</span> ADOBE CREATIVE CLOUD <span className="text-[#c8ff35]">✳</span> COMMANDE WHATSAPP</span>)}</div></div>
    <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
      <div className="mb-8 flex items-end justify-between"><div><div className="mb-3 text-[9px] uppercase tracking-[.23em] text-[#c8ff35]">Sélection ROVZEXI · 01</div><h2 className="font-display text-3xl font-semibold tracking-[-.05em] md:text-5xl">Les plus demandés<span className="text-[#c8ff35]">.</span></h2></div><button onClick={() => onNavigate('/shop')} className="hidden items-center gap-2 text-[11px] text-[#bec0b9] transition hover:text-[#c8ff35] sm:flex">Voir les logiciels <ArrowUpRight size={15}/></button></div>
      <ProductGrid products={featured} onOrder={onOrder} onQuick={onQuick} onWish={onWish} wishlist={wishlist}/>
      <button onClick={() => onNavigate('/shop')} className="mt-6 w-full rounded-full border border-white/15 py-3 text-[11px] uppercase tracking-widest text-[#d4d5d1] transition hover:border-[#c8ff35] hover:text-[#c8ff35] sm:hidden">{t.all}</button>
    </section>
    <section className="mx-auto max-w-[1440px] px-5 pb-20 md:px-10 md:pb-28">
      <div className="mb-7 flex items-end justify-between"><div><div className="mb-3 text-[9px] uppercase tracking-[.23em] text-[#c8ff35]">Trouvez l’outil qu’il vous faut</div><h2 className="font-display text-3xl font-semibold tracking-[-.05em] md:text-5xl">Votre prochain logiciel<span className="text-[#c8ff35]">.</span></h2></div></div>
      <div className="grid gap-4 md:grid-cols-2">
        <button onClick={() => onNavigate('/electronics')} className="group relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 text-left"><img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1100&q=85" alt="Logiciels d’architecture" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"/><span className="absolute left-6 top-6 rounded-full border border-white/25 px-3 py-1 text-[9px] uppercase tracking-widest">01 / ARCHITECTURE</span><div className="absolute bottom-7 left-7"><h3 className="font-display text-4xl font-semibold tracking-[-.05em]">Design your<br/>next space<span className="text-[#c8ff35]">.</span></h3><span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#c8ff35]">Découvrir AutoCAD & Revit <ArrowRight size={14}/></span></div></button>
        <button onClick={() => onNavigate('/creative')} className="group relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 text-left"><img src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1100&q=85" alt="Logiciels de création graphique" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"/><span className="absolute left-6 top-6 rounded-full border border-white/25 px-3 py-1 text-[9px] uppercase tracking-widest">02 / CRÉATION</span><div className="absolute bottom-7 left-7"><h3 className="font-display text-4xl font-semibold tracking-[-.05em]">Make it<br/>stand out<span className="text-[#c8ff35]">.</span></h3><span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#c8ff35]">Explorer Canva & Adobe <ArrowRight size={14}/></span></div></button>
      </div>
    </section>
    <section className="border-y border-white/[.07] bg-[#0c0e0d]"><div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 sm:grid-cols-3 md:px-10">{[[MessageCircle,'Commande par WhatsApp','Pas de panier ni de paiement sur le site. Échangez directement avec nous.'],[ShieldCheck,'Détails confirmés avant achat','Vérifiez la durée, la compatibilité et le type de licence par message.'],[BadgeCheck,'Prix affichés en MAD','Le montant est indicatif. Confirmez le prix et les conditions avec le vendeur.']].map(([Icon,title,desc]) => { const I = Icon as typeof MessageCircle; return <div key={title as string} className="flex gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#c8ff35]/25 text-[#c8ff35]"><I size={18}/></div><div><div className="text-[13px] font-semibold">{title as string}</div><div className="mt-1 text-[11px] leading-5 text-[#858980]">{desc as string}</div></div></div> })}</div></section>
  </>
}

function ShopPage({ products, query, setQuery, onOrder, onQuick, onWish, wishlist, initialCategory }: { products: Product[]; query: string; setQuery: (q: string) => void; onOrder: (p: Product) => void; onQuick: (p: Product) => void; onWish: (id: string) => void; wishlist: string[]; initialCategory: string }) {
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('featured')
  useEffect(() => setCategory(initialCategory), [initialCategory])
  const filtered = useMemo(() => {
    const result = products.filter(p => (category === 'all' || (category === 'electronics' || category === 'moroccan' ? p.categoryKey === category : category === 'creative' ? ['Création & design', 'Vidéo & audio'].includes(p.category) : p.category === category)) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query.toLowerCase()))
    if (sort === 'price-asc') result.sort((a,b) => a.price - b.price)
    if (sort === 'price-desc') result.sort((a,b) => b.price - a.price)
    if (sort === 'rating') result.sort((a,b) => b.rating - a.rating)
    return result
  }, [products, category, query, sort])
  const categoryOptions: [string, string][] = initialCategory === 'electronics'
    ? [['Tout', 'electronics'], ...categories.slice(1).map((item): [string, string] => [item, item])]
    : initialCategory === 'creative'
      ? [['Tout', 'creative'], ...categories.slice(4, 6).map((item): [string, string] => [item, item])]
      : categories.map((item): [string, string] => [item, item === 'Tout' ? 'all' : item])
  const title = initialCategory === 'electronics' ? 'Logiciels professionnels.' : initialCategory === 'creative' ? 'Création & design.' : 'Trouvez votre logiciel.'
  return <section className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16">
    <div className="mb-10 border-b border-white/10 pb-8"><div className="mb-3 text-[9px] uppercase tracking-[.23em] text-[#c8ff35]">ROVZEXI / LOGICIELS</div><div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="font-display text-4xl font-semibold tracking-[-.06em] md:text-6xl">{title}</h1><p className="mt-3 text-sm text-[#8b8e87]">Prix affichés en MAD. Contactez-nous sur WhatsApp pour confirmer l’offre.</p></div><div className="text-[10px] uppercase tracking-widest text-[#868980]">{filtered.length} logiciels listés</div></div></div>
    <div className="mb-7 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="scrollbar-hide flex max-w-full gap-2 overflow-auto">{categoryOptions.map(([label, key]) => <button key={label} onClick={() => setCategory(key)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] transition ${category === key ? 'border-[#c8ff35] bg-[#c8ff35] text-black' : 'border-white/10 text-[#abaea7] hover:border-white/30'}`}>{label}</button>)}</div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"><SlidersHorizontal size={13} className="text-[#8b8e87]"/><select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent text-[10px] text-[#b8bab4] outline-none"><option className="bg-[#111]" value="featured">Sélection</option><option className="bg-[#111]" value="price-asc">Prix croissant</option><option className="bg-[#111]" value="price-desc">Prix décroissant</option><option className="bg-[#111]" value="rating">Mieux notés</option></select></div></div>
      </div>
      <div className="relative max-w-md md:hidden"><Search size={15} className="absolute left-3 top-3 text-[#858980]"/><input value={query} onChange={e => setQuery(e.target.value)} className="input-dark pl-9 text-xs" placeholder="Rechercher..." /></div>
    </div>
    <ProductGrid products={filtered} onOrder={onOrder} onQuick={onQuick} onWish={onWish} wishlist={wishlist}/>
  </section>
}

function Field({ label, name, required, placeholder, type = 'text' }: { label: string; name: string; required?: boolean; placeholder?: string; type?: string }) {
  return <label className="text-[10px] uppercase tracking-wider text-[#b8bab3]">{label}<input className="input-dark mt-2" name={name} type={type} required={required} placeholder={placeholder}/></label>
}

function WishlistPage({ products, onWish, onOrder, onNavigate }: { products: Product[]; onWish: (id: string) => void; onOrder: (p: Product) => void; onNavigate: (p: string) => void }) {
  return <section className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-12 md:px-10 md:py-16"><Heading eyebrow="VOS LOGICIELS PRÉFÉRÉS" title="La wishlist."/>{products.length ? <div className="mt-9"><ProductGrid products={products} onOrder={onOrder} onWish={onWish} wishlist={products.map(p=>p.id)} onQuick={p=>onNavigate(`/product/${p.id}`)}/></div> : <div className="mt-10 rounded-2xl border border-white/10 py-16 text-center"><Heart className="mx-auto mb-4 text-[#c8ff35]" size={25}/><p className="text-sm text-[#9da098]">Aucun favori pour le moment.</p><button onClick={() => onNavigate('/shop')} className="mt-5 text-xs text-[#c8ff35]">Découvrir les logiciels <ArrowRight size={13} className="ml-1 inline"/></button></div>}</section>
}

function ProductPage({ product, products, onOrder, onWish, wishlist, onNavigate }: { product?: Product; products: Product[]; onOrder: (p: Product) => void; onWish: (id: string) => void; wishlist: string[]; onNavigate: (p: string) => void }) {
  const [selected, setSelected] = useState(0)
  if (!product) return <NotFound onNavigate={onNavigate}/>
  const related = products.filter(p => p.categoryKey === product.categoryKey && p.id !== product.id).slice(0, 4)
  const gallery = [product.image, ...related.slice(0, 2).map(p => p.image)]
  return <>
    <section className="mx-auto max-w-[1280px] px-5 py-8 md:px-10 md:py-12">
      <button onClick={() => window.history.back()} className="mb-6 flex items-center gap-2 text-[10px] text-[#9b9e97] hover:text-[#c8ff35]"><ArrowLeft size={14}/> Retour aux logiciels</button>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="grid gap-3 sm:grid-cols-[74px_1fr]">
          <div className="order-2 flex gap-2 overflow-auto sm:order-1 sm:flex-col">{gallery.map((src, index) => <button key={src} onClick={() => setSelected(index)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${selected === index ? 'border-[#c8ff35]' : 'border-white/10'}`}><img src={src} alt="" className="h-full w-full object-cover"/></button>)}</div>
          <div className="relative order-1 aspect-square overflow-hidden rounded-2xl bg-[#121412] sm:order-2"><img src={gallery[selected] ?? product.image} alt={`Illustration ${product.name}`} onError={e => { e.currentTarget.src = imageFallback }} className="h-full w-full object-cover opacity-90"/><div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/45 via-transparent to-black/10"><SoftwareBrandBadge product={product} large/></div><div className="absolute bottom-4 right-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[8px] uppercase tracking-widest text-white/65">Visuel illustratif</div></div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[9px] uppercase tracking-[.22em] text-[#c8ff35]">{product.category} / LOGICIEL</div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-[-.06em] md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-xs"><span className="flex items-center gap-1 text-[#c8ff35]"><Star size={13} className="fill-current"/>{product.rating}</span><span className="text-[#858980]">· {product.reviews} avis</span></div>
          <div className="mt-6 flex items-center gap-3"><span className="font-display text-2xl font-semibold">{money(product.price)}</span>{product.oldPrice && <span className="text-sm text-[#777a72] line-through">{money(product.oldPrice)}</span>}</div>
          <p className="mt-6 max-w-lg text-sm leading-7 text-[#aeb0aa]">{product.description}</p>
          <section className="mt-6">
            <h2 className="font-display text-sm font-semibold">المميزات الرئيسية <span className="text-[#898c84]">/ Fonctionnalités</span></h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{product.highlights.map((highlight, index) => <div key={highlight} className="flex items-start gap-2.5 rounded-xl border border-white/[.08] bg-white/[.025] p-3 text-[11px] leading-5 text-[#c3c5bf]"><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#c8ff35]/10 text-[9px] font-bold text-[#c8ff35]">{String(index + 1).padStart(2, '0')}</span>{highlight}</div>)}</div>
          </section>
          <section className="mt-7">
            <h2 className="font-display text-sm font-semibold">كيفاش تبدا؟ <span className="text-[#898c84]">/ Guide de démarrage</span></h2>
            <ol className="mt-3 space-y-2">{product.howToUse.map((step, index) => <li key={step} className="flex gap-3 rounded-xl border border-white/[.08] bg-[#101211] p-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#c8ff35]/30 font-display text-[10px] font-semibold text-[#c8ff35]">{index + 1}</span><span className="pt-0.5 text-[11px] leading-5 text-[#aeb0aa]">{step}</span></li>)}</ol>
          </section>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => onOrder(product)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#c8ff35] px-6 py-3 text-xs font-bold uppercase tracking-wider text-black"><MessageCircle size={16}/> Commander sur WhatsApp</button>
            <button onClick={() => onWish(product.id)} aria-label="Ajouter aux favoris" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 hover:border-[#c8ff35]"><Heart size={17} className={wishlist.includes(product.id) ? 'fill-[#c8ff35] text-[#c8ff35]' : ''}/></button>
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4 text-[11px] leading-6 text-[#aeb0aa]">
            <div className="flex items-center gap-2 font-semibold text-white"><BadgeCheck size={15} className="text-[#c8ff35]"/> Confirmez avant achat</div>
            <p className="mt-1">Contactez-nous pour vérifier le type de licence, la durée, le prix final et la compatibilité de votre appareil. La commande et la remise du programme se font directement avec le vendeur sur WhatsApp.</p>
          </div>
        </div>
      </div>
    </section>
    {related.length > 0 && <section className="mx-auto max-w-[1440px] px-5 pb-16 md:px-10"><Heading eyebrow="VOUS AIMEREZ AUSSI" title="Autres logiciels."/><div className="mt-7"><ProductGrid products={related} onOrder={onOrder} onWish={onWish} wishlist={wishlist} onQuick={p => onNavigate(`/product/${p.id}`)}/></div></section>}
  </>
}

function QuickView({ product, onClose, onOrder, onDetail }: { product: Product; onClose: () => void; onOrder: (p: Product) => void; onDetail: (id: string) => void }) {
  return <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div initial={{ y: 18, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: .98 }} onClick={e=>e.stopPropagation()} className="relative grid max-h-[90vh] w-full max-w-[780px] overflow-y-auto rounded-2xl border border-white/10 bg-[#111312] sm:grid-cols-2"><button aria-label="Fermer" onClick={onClose} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50"><X size={17}/></button><div className="relative min-h-52 sm:min-h-[400px]"><img src={product.image} alt={`Illustration ${product.name}`} className="absolute inset-0 h-full w-full object-cover opacity-50"/><div className="absolute inset-0 grid place-items-center bg-black/25"><SoftwareBrandBadge product={product} large/></div></div><div className="flex flex-col justify-center p-6 sm:p-9"><div className="text-[9px] uppercase tracking-widest text-[#c8ff35]">{product.category}</div><h2 className="mt-3 font-display text-2xl font-semibold">{product.name}</h2><div className="mt-3 flex gap-1 text-[#c8ff35]"><Star size={13} className="fill-current"/><span className="text-xs">{product.rating} <span className="text-[#8b8e87]">({product.reviews} avis)</span></span></div><div className="mt-5 font-display text-xl font-semibold">{money(product.price)}</div><p className="mt-4 text-xs leading-6 text-[#a3a69f]">{product.description}</p><ul className="mt-3 space-y-2">{product.highlights.slice(0, 2).map(item => <li key={item} className="flex gap-2 text-[10px] leading-5 text-[#bdc0b8]"><Check size={13} className="mt-0.5 shrink-0 text-[#c8ff35]"/>{item}</li>)}</ul><button onClick={()=>onOrder(product)} className="mt-6 rounded-full bg-[#c8ff35] py-3 text-xs font-bold text-black">Commander sur WhatsApp <MessageCircle size={14} className="ml-1 inline"/></button><button onClick={()=>onDetail(product.id)} className="mt-3 text-[10px] uppercase tracking-widest text-[#aeb0aa] hover:text-[#c8ff35]">Voir le guide complet <ArrowRight size={13} className="ml-1 inline"/></button></div></motion.div></motion.div>
}

function AboutPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  return <section className="mx-auto max-w-[1250px] px-5 py-14 md:px-10 md:py-20">
    <div className="grid gap-10 md:grid-cols-[1fr_.8fr] md:items-center">
      <div>
        <div className="text-[9px] uppercase tracking-[.25em] text-[#c8ff35]">Notre approche / 001</div>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-[.94] tracking-[-.07em] md:text-7xl">Le bon outil.<br/>Le bon prix<span className="text-[#c8ff35]">.</span></h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-[#a6a89f]">ROVZEXI rassemble des logiciels de conception, de création et de productivité dans un catalogue clair, avec des prix affichés en dirhams.</p>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#a6a89f]">Chaque offre peut avoir des conditions, durées et compatibilités différentes. Nous confirmons ces détails avec vous directement sur WhatsApp avant toute commande.</p>
        <button onClick={() => onNavigate('/shop')} className="mt-8 rounded-full bg-[#c8ff35] px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-black">Explorer les logiciels <ArrowRight size={14} className="ml-2 inline"/></button>
      </div>
      <div className="relative aspect-[.9] overflow-hidden rounded-2xl"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=85" alt="Espace de travail numérique" className="h-full w-full object-cover"/><div className="absolute bottom-5 left-5 glass rounded-xl px-4 py-3"><div className="font-display text-2xl font-bold">MAD</div><div className="text-[9px] uppercase tracking-widest text-[#aeb0aa]">Prix affichés</div></div></div>
    </div>
    <div className="mt-16 grid gap-4 sm:grid-cols-3">{[['01','Vérifiez les détails','Confirmez la durée et le type de licence avant de commander.'],['02','Vérifiez la compatibilité','Partagez votre appareil et votre système avec notre équipe.'],['03','Contact direct','Votre demande part vers WhatsApp, vous choisissez de l’envoyer.']].map(([n, title, desc]) => <div key={n} className="rounded-2xl border border-white/10 bg-[#101211] p-5"><div className="font-display text-3xl text-[#c8ff35]">{n}</div><h2 className="mt-5 font-display text-lg font-semibold">{title}</h2><p className="mt-2 text-xs leading-6 text-[#90938b]">{desc}</p></div>)}</div>
  </section>
}

function ContactPage({ setToast, contactWhatsApp }: { setToast: (s:string)=>void; contactWhatsApp: (product?: Product, message?: string)=>void }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const message = `Salam ROVZEXI, ${form.get('name')} (${form.get('email')}) kaytsawl 3la: ${form.get('subject')}. ${form.get('message')}`
    contactWhatsApp(undefined, message)
    e.currentTarget.reset()
    setToast('Votre message WhatsApp est prêt à être envoyé.')
  }
  return <section className="mx-auto grid min-h-[68vh] max-w-[1150px] gap-10 px-5 py-14 md:grid-cols-[.8fr_1fr] md:px-10 md:py-20"><div><div className="text-[9px] uppercase tracking-[.25em] text-[#c8ff35]">Parlons logiciels</div><h1 className="mt-5 font-display text-5xl font-semibold tracking-[-.07em] md:text-7xl">On est<br/>tout ouïe<span className="text-[#c8ff35]">.</span></h1><p className="mt-5 max-w-sm text-sm leading-7 text-[#9b9e96]">Une question sur un logiciel, une licence ou la compatibilité ? Écrivez directement à notre équipe sur WhatsApp.</p><div className="mt-9 space-y-4 text-xs text-[#b6b8b2]"><div>✳ &nbsp; Support client sur WhatsApp</div><div>✳ &nbsp; 0637296182</div><div>✳ &nbsp; Réponse selon disponibilité</div></div></div><form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-[#101211] p-5 sm:p-7"><Field label="Votre nom" name="name" required placeholder="Comment vous appeler ?"/><Field label="Votre e-mail" name="email" type="email" required placeholder="vous@exemple.ma"/><label className="block text-[10px] uppercase tracking-wider text-[#b8bab3]">Sujet<select className="input-dark mt-2" name="subject"><option className="bg-[#111]">Une question logiciel / licence</option><option className="bg-[#111]">Compatibilité de mon appareil</option><option className="bg-[#111]">Autre demande</option></select></label><label className="block text-[10px] uppercase tracking-wider text-[#b8bab3]">Votre message<textarea name="message" rows={5} required className="input-dark mt-2" placeholder="Dites-nous tout..."/></label><button className="w-full rounded-full bg-[#c8ff35] py-3.5 text-xs font-bold uppercase tracking-wider text-black">Continuer sur WhatsApp <MessageCircle size={14} className="ml-2 inline"/></button><p className="text-center text-[9px] text-[#73766e]">WhatsApp s’ouvrira avec votre message prérempli ; vous choisirez de l’envoyer.</p></form></section>
}

function AdminPage({ products, setProducts, orders, setOrders, setToast }: { products: Product[]; setProducts: (p: Product[] | ((prev:Product[])=>Product[]))=>void; orders: Order[]; setOrders: (o: Order[] | ((prev:Order[])=>Order[]))=>void; setToast: (s:string)=>void }) {
  const [tab, setTab] = useState<'overview'|'products'|'orders'>('overview')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [orderFilter, setOrderFilter] = useState('Toutes')
  const monthly = [{ month:'Mai', sales:12000 },{ month:'Juin', sales:18300 },{ month:'Juil.', sales:15600 },{ month:'Août', sales:23900 },{ month:'Sept.', sales:21100 },{ month:'Oct.', sales:orders.reduce((n,o)=>n+o.total,0) }]
  const filteredProducts = products.filter(p=>`${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()))
  const filteredOrders = orders.filter(o=>(orderFilter==='Toutes'||o.status===orderFilter)&&`${o.id} ${o.customer} ${o.city}`.toLowerCase().includes(search.toLowerCase()))
  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const d = new FormData(event.currentTarget)
    const existing = editing
    const product: Product = {
      id: existing?.id ?? `p-${Date.now()}`, name: String(d.get('name')), category: String(d.get('category')),
      categoryKey: String(d.get('categoryKey')) as Product['categoryKey'], price: Number(d.get('price')),
      oldPrice: Number(d.get('oldPrice')) || undefined, rating: existing?.rating ?? 4.8, reviews: existing?.reviews ?? 0,
      stock: Number(d.get('stock')), image: String(d.get('image')) || imageFallback, description: String(d.get('description')),
      brand: existing?.brand ?? 'ROVZEXI', brandMark: existing?.brandMark ?? String(d.get('name')).trim().slice(0, 2).toUpperCase(),
      accent: existing?.accent ?? '#c8ff35', highlights: existing?.highlights ?? defaultProductGuidance.highlights,
      brandImage: existing?.brandImage,
      howToUse: existing?.howToUse ?? defaultProductGuidance.howToUse,
    }
    setProducts(rows=>existing?rows.map(p=>p.id===existing.id?product:p):[product,...rows])
    setEditing(null);setCreating(false);setToast(existing?'Produit modifié':'Produit créé')
  }
  const removeProduct = (p:Product) => { if(window.confirm(`Supprimer « ${p.name} » du catalogue de démonstration ?`)){setProducts(rows=>rows.filter(row=>row.id!==p.id));setToast('Produit supprimé')} }
  const updateStatus = (order:Order,status:string) => { setOrders(rows=>rows.map(o=>o.id===order.id?{...o,status}:o));setToast(`Commande ${order.id} · ${status}`) }
  const formProduct = editing ?? ({id:'',name:'',category:'Audio',categoryKey:'electronics',price:0,rating:4.8,reviews:0,stock:0,image:'',description:''} as Product)
  return <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-10 md:py-14"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-[9px] uppercase tracking-[.2em] text-[#c8ff35]"><span className="h-1.5 w-1.5 rounded-full bg-[#c8ff35]"/> Back office · démonstration</div><h1 className="mt-2 font-display text-4xl font-semibold tracking-[-.06em]">Command center<span className="text-[#c8ff35]">.</span></h1></div><div className="rounded-xl border border-amber-300/20 bg-amber-200/[.04] px-4 py-3 text-[10px] leading-5 text-amber-100/75"><strong className="text-amber-200">Mode démo.</strong> Sans authentification réelle.<br/>LocalStorage non sécurisé — impropre à la production.</div></div>
    <div className="mt-8 flex gap-2 border-b border-white/10">{(['overview','products','orders'] as const).map(key=><button key={key} onClick={()=>setTab(key)} className={`border-b-2 px-4 py-3 text-[10px] uppercase tracking-widest ${tab===key?'border-[#c8ff35] text-[#c8ff35]':'border-transparent text-[#8a8d85]'}`}>{key==='overview'?'Vue d’ensemble':key==='products'?'Produits':'Commandes'} {key==='orders'&&<span className="ml-1 text-[9px]">({orders.length})</span>}</button>)}</div>
    {tab==='overview'&&<><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Chiffre d’affaires démo',money(orders.reduce((n,o)=>n+o.total,0)),'↗ local'],['Commandes',String(orders.length),'enregistrées'],['Produits en catalogue',String(products.length),'pièces'],['Stock faible',String(products.filter(p=>p.stock<10).length),'moins de 10 unités']].map(([label,val,sub])=><div key={label} className="rounded-2xl border border-white/10 bg-[#101211] p-5"><div className="text-[10px] text-[#858980]">{label}</div><div className="mt-4 font-display text-2xl font-semibold">{val}</div><div className="mt-1 text-[9px] text-[#c8ff35]">{sub}</div></div>)}</div><div className="mt-5 rounded-2xl border border-white/10 bg-[#101211] p-5"><div className="mb-5 flex justify-between"><div><h2 className="font-display text-lg font-semibold">Activité commerciale</h2><p className="mt-1 text-[10px] text-[#7d8078]">Chiffres de démonstration · MAD</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-[9px] text-[#979a92]">6 derniers mois</span></div><div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#858980',fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#858980',fontSize:10}}/><Tooltip contentStyle={{background:'#171916',border:'1px solid #30332d',borderRadius:10,fontSize:11}} formatter={(value)=>[money(Number(value)),'Ventes démo']}/><Bar dataKey="sales" fill="#c8ff35" radius={[5,5,0,0]} maxBarSize={38}/></BarChart></ResponsiveContainer></div></div><div className="mt-5 rounded-2xl border border-white/10 bg-[#101211] p-5"><h2 className="font-display font-semibold">Stock à surveiller</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{products.filter(p=>p.stock<10).map(p=><div key={p.id} className="flex items-center justify-between rounded-lg bg-white/[.03] p-3"><span className="truncate text-xs">{p.name}</span><span className={`ml-3 text-xs ${p.stock<5?'text-red-300':'text-amber-200'}`}>{p.stock} restant{p.stock>1?'s':''}</span></div>)}</div></div></>}
    {tab==='products'&&<div className="mt-6"><div className="mb-4 flex flex-wrap gap-3"><div className="relative min-w-[210px] flex-1"><Search size={14} className="absolute left-3 top-3 text-[#858980]"/><input className="input-dark pl-9 text-xs" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chercher un produit..."/></div><button onClick={()=>{setEditing(null);setCreating(true)}} className="rounded-full bg-[#c8ff35] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-black"><Plus size={14} className="mr-1 inline"/> Nouveau produit</button></div><div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#101211]"><table className="w-full min-w-[690px] text-left"><thead className="border-b border-white/10 text-[9px] uppercase tracking-widest text-[#81847c]"><tr>{['Produit','Catégorie','Prix','Stock','Actions'].map(x=><th className="px-4 py-4 font-medium" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y divide-white/[.06]">{filteredProducts.map(p=><tr key={p.id} className="text-xs"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover"/><span>{p.name}</span></div></td><td className="px-4 py-3 text-[#a1a39c]">{p.category}</td><td className="px-4 py-3">{money(p.price)}</td><td className={`px-4 py-3 ${p.stock<5?'text-red-300':p.stock<10?'text-amber-200':'text-[#a4a69f]'}`}>{p.stock}</td><td className="px-4 py-3"><button onClick={()=>{setEditing(p);setCreating(true)}} className="mr-3 text-[#c8ff35]">Modifier</button><button onClick={()=>removeProduct(p)} className="text-red-300">Supprimer</button></td></tr>)}</tbody></table></div></div>}
    {tab==='orders'&&<div className="mt-6"><div className="mb-4 flex flex-wrap gap-3"><div className="relative min-w-[210px] flex-1"><Search size={14} className="absolute left-3 top-3 text-[#858980]"/><input className="input-dark pl-9 text-xs" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Référence, client, ville..."/></div><select value={orderFilter} onChange={e=>setOrderFilter(e.target.value)} className="input-dark w-auto text-xs">{['Toutes','À confirmer','Confirmée','Expédiée','Livrée','Annulée'].map(x=><option className="bg-[#111]" key={x}>{x}</option>)}</select></div><div className="space-y-3">{filteredOrders.length?filteredOrders.map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101211] p-4"><div><div className="font-display text-sm font-semibold">{o.id} <span className="ml-2 font-sans text-[10px] font-normal text-[#858980]">{o.date}</span></div><div className="mt-1 text-[10px] text-[#a2a49e]">{o.customer} · {o.city} · {o.phone}</div><div className="mt-2 text-[10px] text-[#8b8e87]">{o.items.map(i=>`${products.find(p=>p.id===i.productId)?.name??'Produit'} × ${i.quantity}`).join(' · ')}</div></div><div className="flex items-center gap-3"><b className="text-sm">{money(o.total)}</b><select aria-label={`Statut de ${o.id}`} value={o.status} onChange={e=>updateStatus(o,e.target.value)} className="rounded-lg border border-white/10 bg-[#171916] px-3 py-2 text-[10px]">{['À confirmer','Confirmée','Expédiée','Livrée','Annulée'].map(x=><option key={x}>{x}</option>)}</select></div></div>):<div className="rounded-2xl border border-white/10 py-16 text-center text-sm text-[#83867e]">Aucune commande trouvée.</div>}</div></div>}
    <AnimatePresence>{creating&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>{setCreating(false);setEditing(null)}} className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"><motion.form onSubmit={saveProduct} onClick={e=>e.stopPropagation()} initial={{y:18}} animate={{y:0}} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111312] p-6"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">{editing?'Modifier le produit':'Nouveau produit'}</h2><button type="button" onClick={()=>{setCreating(false);setEditing(null)}} aria-label="Fermer"><X size={18}/></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-[10px] text-[#aeb0aa] sm:col-span-2">Nom<input required name="name" defaultValue={formProduct.name} className="input-dark mt-1.5"/></label><label className="text-[10px] text-[#aeb0aa]">Catégorie<input required name="category" defaultValue={formProduct.category} className="input-dark mt-1.5"/></label><label className="text-[10px] text-[#aeb0aa]">Univers<select name="categoryKey" defaultValue={formProduct.categoryKey} className="input-dark mt-1.5"><option value="electronics">Électronique</option><option value="moroccan">Marocain</option></select></label><label className="text-[10px] text-[#aeb0aa]">Prix DH<input type="number" min="0" required name="price" defaultValue={formProduct.price} className="input-dark mt-1.5"/></label><label className="text-[10px] text-[#aeb0aa]">Ancien prix<input type="number" min="0" name="oldPrice" defaultValue={formProduct.oldPrice??''} className="input-dark mt-1.5"/></label><label className="text-[10px] text-[#aeb0aa]">Stock<input type="number" min="0" required name="stock" defaultValue={formProduct.stock} className="input-dark mt-1.5"/></label><label className="text-[10px] text-[#aeb0aa] sm:col-span-2">URL image<input type="url" name="image" defaultValue={formProduct.image} className="input-dark mt-1.5"/></label><label className="text-[10px] text-[#aeb0aa] sm:col-span-2">Description<textarea name="description" rows={3} required defaultValue={formProduct.description} className="input-dark mt-1.5"/></label></div><button className="mt-5 w-full rounded-full bg-[#c8ff35] py-3 text-xs font-bold text-black">Enregistrer le produit</button></motion.form></motion.div>}</AnimatePresence>
  </section>
}

function Heading({ eyebrow, title }: { eyebrow: string; title: string }) { return <div><div className="mb-3 text-[9px] uppercase tracking-[.23em] text-[#c8ff35]">{eyebrow}</div><h1 className="font-display text-4xl font-semibold tracking-[-.06em] md:text-5xl">{title}</h1></div> }
function NotFound({ onNavigate }: { onNavigate: (p:string)=>void }) { return <section className="grid min-h-[60vh] place-items-center px-5 text-center"><div><div className="font-display text-7xl font-bold text-[#c8ff35]">404</div><h1 className="mt-3 font-display text-2xl">Cette page n’existe pas.</h1><button onClick={()=>onNavigate('/')} className="mt-6 rounded-full bg-[#c8ff35] px-6 py-3 text-xs font-bold text-black">Retour à l’accueil</button></div></section> }

function BrandLogo() {
  return <span className="inline-flex items-center gap-2.5" style={{ transform: 'perspective(1000px) rotateX(10deg)', filter: 'drop-shadow(0 18px 18px rgba(0,0,0,.32))' }}>
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9 shrink-0 transition duration-300 group-hover:drop-shadow-[0_0_18px_rgba(200,255,53,.5)]">
      <defs>
        <linearGradient id="brand-logo-core" x1="12" x2="36" y1="8" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f9ffd9" />
          <stop offset="0.2" stopColor="#dfffa6" />
          <stop offset="0.5" stopColor="#c8ff35" />
          <stop offset="0.8" stopColor="#7adf5d" />
          <stop offset="1" stopColor="#2ec6a0" />
        </linearGradient>
        <linearGradient id="brand-logo-depth" x1="10" x2="32" y1="14" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#09110d" />
          <stop offset="1" stopColor="#1a241b" />
        </linearGradient>
      </defs>
      <path d="M17 3.75h14L44.25 17v14L31 44.25H17L3.75 31V17L17 3.75Z" fill="#c8ff35" fillOpacity=".08" stroke="#deff83" strokeOpacity=".75" strokeWidth="1.5"/>
      <path d="M17 3.75h14L44.25 17v14L31 44.25H17L3.75 31V17L17 3.75Z" fill="url(#brand-logo-depth)" opacity=".8" transform="translate(1.8 2.2)"/>
      <path d="M16 34V14h10.2c7.6 0 9 10.4 1.8 12.1L36 34M16 24h11" fill="none" stroke="url(#brand-logo-core)" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3.4"/>
      <path d="M16 34V14h10.2c7.6 0 9 10.4 1.8 12.1L36 34M16 24h11" fill="none" stroke="#f5f6f3" strokeOpacity=".24" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.1" transform="translate(1 1)"/>
      <path d="m32 14 4 4" fill="none" stroke="#f5f6f3" strokeLinecap="square" strokeWidth="1.6"/>
      <circle cx="4" cy="17" r="1.7" fill="#c8ff35" stroke="#fdfefc" strokeWidth=".7"/>
      <circle cx="4" cy="17" r="3.2" fill="none" stroke="#c8ff35" strokeOpacity=".35"/>
    </svg>
    <span className="font-display text-[22px] font-bold tracking-[-.085em]" style={{ color: '#f5f6f3', textShadow: '0 1px 0 rgba(255,255,255,.2), 0 9px 14px rgba(0,0,0,.42)' }}>
      ROVZ<span style={{ color: '#c8ff35', textShadow: '0 2px 0 rgba(100,160,0,.9), 0 12px 18px rgba(200,255,53,.25)' }}>E</span>XI<span className="ml-1 align-top text-[8px] font-medium tracking-[.08em] text-[#76796f]">®</span>
    </span>
  </span>
}

function Footer({ onNavigate, contactWhatsApp, t }: { onNavigate: (p:string)=>void; contactWhatsApp: (product?: Product, message?: string)=>void; t: typeof dictionary.fr }) {
  return <footer className="border-t border-white/[.08] bg-[#0b0c0b]"><div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-16"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]"><div><button onClick={()=>onNavigate('/')} aria-label="ROVZEXI home" className="group"><BrandLogo/></button><p className="mt-4 max-w-[250px] text-xs leading-6 text-[#898c84]">Logiciels utiles, prix affichés en MAD, commande directe avec notre équipe.</p><button onClick={()=>contactWhatsApp()} aria-label="WhatsApp ROVZEXI" className="mt-5 inline-grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#c8ff35] hover:border-[#c8ff35]"><MessageCircle size={15}/></button></div><div><div className="mb-4 text-[9px] font-semibold uppercase tracking-[.2em] text-[#c8ff35]">Découvrir</div>{[[t.shop,'/shop'],[t.electronics,'/electronics'],[t.moroccan,'/creative'],[t.about,'/about']].map(([label,path])=><button key={path} onClick={()=>onNavigate(path)} className="mb-3 block text-left text-xs text-[#a1a39c] transition hover:text-white">{label}</button>)}</div><div><div className="mb-4 text-[9px] font-semibold uppercase tracking-[.2em] text-[#c8ff35]">Contact</div>{[[t.wishlist,'/wishlist'],[t.contact,'/contact'],[t.admin,'/admin']].map(([label,path])=><button key={path} onClick={()=>onNavigate(path)} className="mb-3 block text-left text-xs text-[#a1a39c] transition hover:text-white">{label}</button>)}</div><div><div className="mb-4 text-[9px] font-semibold uppercase tracking-[.2em] text-[#c8ff35]">Besoin d’aide ?</div><p className="text-xs leading-5 text-[#898c84]">Confirmez la licence, sa durée et la compatibilité directement avec nous.</p><button onClick={()=>contactWhatsApp()} className="mt-4 flex items-center gap-2 rounded-full bg-[#c8ff35] px-4 py-2.5 text-[10px] font-bold text-black"><MessageCircle size={14}/> WhatsApp · 0637296182</button></div></div><div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/[.08] pt-5 text-[9px] text-[#686b64]"><span>© 2025 ROVZEXI — Logiciels & licences.</span><span>Prix et disponibilité à confirmer directement avec le vendeur.</span></div></div></footer>
}

export default App
