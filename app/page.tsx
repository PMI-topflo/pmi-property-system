'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Lang = 'en' | 'es' | 'pt' | 'fr' | 'he' | 'ru'
type Step = 'persona' | 'association'

const LANG_TABS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
  { code: 'he', label: 'HE' },
  { code: 'ru', label: 'RU' },
]

interface Persona {
  key: string
  icon: string
  title: string
  desc: string
}

interface Translations {
  tagline: string
  welcome: string
  subtitle: string
  chooseAssoc: string
  searchPlaceholder: string
  noResults: string
  back: string
  contact: string
  personas: Persona[]
}

const T: Record<Lang, Translations> = {
  en: {
    tagline: 'PMI Top Florida Properties',
    welcome: 'Welcome to MAIA',
    subtitle: 'How can we help you today?',
    chooseAssoc: 'Select Your Association',
    searchPlaceholder: 'Search associations…',
    noResults: 'No associations found',
    back: '← Back',
    contact: 'Questions?',
    personas: [
      { key: 'homeowner', icon: '🏠', title: 'Homeowner / Resident', desc: 'Access your association portal, documents & services' },
      { key: 'applicant', icon: '📋', title: 'Rental Applicant', desc: 'Apply to rent or purchase in one of our communities' },
      { key: 'agent',     icon: '🏢', title: 'Real Estate Agent',   desc: 'Tools for listings, buyers & estoppel — text us to begin' },
      { key: 'board',     icon: '👥', title: 'Board Member',         desc: 'Review invoices, approvals & association management' },
      { key: 'vendor',    icon: '🔧', title: 'Vendor / Contractor',  desc: 'Submit invoices, set up ACH & coordinate with our team' },
      { key: 'staff',     icon: '🔒', title: 'PMI Staff',            desc: 'Internal management dashboard' },
    ],
  },
  es: {
    tagline: 'PMI Top Florida Properties',
    welcome: 'Bienvenido a MAIA',
    subtitle: '¿Cómo podemos ayudarte hoy?',
    chooseAssoc: 'Selecciona Tu Asociación',
    searchPlaceholder: 'Buscar asociaciones…',
    noResults: 'No se encontraron asociaciones',
    back: '← Volver',
    contact: '¿Preguntas?',
    personas: [
      { key: 'homeowner', icon: '🏠', title: 'Propietario / Residente',  desc: 'Accede al portal de tu asociación, documentos y servicios' },
      { key: 'applicant', icon: '📋', title: 'Solicitante de Alquiler',   desc: 'Solicita alquilar o comprar en una de nuestras comunidades' },
      { key: 'agent',     icon: '🏢', title: 'Agente de Bienes Raíces',   desc: 'Herramientas para propiedades, compradores y estoppel — escríbenos' },
      { key: 'board',     icon: '👥', title: 'Miembro de la Junta',       desc: 'Revisa facturas, aprobaciones y gestión de la asociación' },
      { key: 'vendor',    icon: '🔧', title: 'Proveedor / Contratista',   desc: 'Envía facturas, configura ACH y coordina con nuestro equipo' },
      { key: 'staff',     icon: '🔒', title: 'Personal PMI',              desc: 'Panel de administración interno' },
    ],
  },
  pt: {
    tagline: 'PMI Top Florida Properties',
    welcome: 'Bem-vindo ao MAIA',
    subtitle: 'Como podemos ajudá-lo hoje?',
    chooseAssoc: 'Selecione Sua Associação',
    searchPlaceholder: 'Buscar associações…',
    noResults: 'Nenhuma associação encontrada',
    back: '← Voltar',
    contact: 'Dúvidas?',
    personas: [
      { key: 'homeowner', icon: '🏠', title: 'Proprietário / Residente',  desc: 'Acesse o portal da sua associação, documentos e serviços' },
      { key: 'applicant', icon: '📋', title: 'Candidato a Inquilino',     desc: 'Candidate-se para alugar ou comprar em nossas comunidades' },
      { key: 'agent',     icon: '🏢', title: 'Corretor de Imóveis',       desc: 'Ferramentas para imóveis, compradores e estoppel — envie mensagem' },
      { key: 'board',     icon: '👥', title: 'Membro da Diretoria',       desc: 'Revise faturas, aprovações e gestão da associação' },
      { key: 'vendor',    icon: '🔧', title: 'Fornecedor / Contratado',   desc: 'Envie faturas, configure ACH e coordene com nossa equipe' },
      { key: 'staff',     icon: '🔒', title: 'Equipe PMI',                desc: 'Painel de gerenciamento interno' },
    ],
  },
  fr: {
    tagline: 'PMI Top Florida Properties',
    welcome: 'Bienvenue sur MAIA',
    subtitle: "Comment pouvons-nous vous aider aujourd'hui ?",
    chooseAssoc: 'Sélectionnez Votre Association',
    searchPlaceholder: 'Rechercher des associations…',
    noResults: 'Aucune association trouvée',
    back: '← Retour',
    contact: 'Questions ?',
    personas: [
      { key: 'homeowner', icon: '🏠', title: 'Propriétaire / Résident',   desc: 'Accédez au portail de votre association, documents et services' },
      { key: 'applicant', icon: '📋', title: 'Candidat Locataire',        desc: 'Postulez pour louer ou acheter dans nos communautés' },
      { key: 'agent',     icon: '🏢', title: 'Agent Immobilier',          desc: 'Outils pour annonces, acheteurs et estoppel — écrivez-nous' },
      { key: 'board',     icon: '👥', title: 'Membre du Conseil',         desc: "Consultez les factures, approbations et gestion de l'association" },
      { key: 'vendor',    icon: '🔧', title: 'Fournisseur / Entrepreneur', desc: 'Soumettez des factures, configurez ACH et coordonnez avec nous' },
      { key: 'staff',     icon: '🔒', title: 'Personnel PMI',             desc: 'Tableau de bord de gestion interne' },
    ],
  },
  he: {
    tagline: 'PMI Top Florida Properties',
    welcome: 'ברוכים הבאים ל-MAIA',
    subtitle: 'כיצד נוכל לעזור לך היום?',
    chooseAssoc: 'בחר את העמותה שלך',
    searchPlaceholder: 'חפש עמותות…',
    noResults: 'לא נמצאו עמותות',
    back: 'חזרה →',
    contact: 'שאלות?',
    personas: [
      { key: 'homeowner', icon: '🏠', title: 'בעל דירה / תושב',   desc: 'גש לפורטל העמותה שלך, מסמכים ושירותים' },
      { key: 'applicant', icon: '📋', title: 'מועמד לשכירות',      desc: 'הגש מועמדות לשכירות או רכישה בקהילות שלנו' },
      { key: 'agent',     icon: '🏢', title: 'סוכן נדל"ן',         desc: 'כלים עבור רישומים, קונים ו-estoppel — שלח הודעה להתחלה' },
      { key: 'board',     icon: '👥', title: 'חבר ועד',            desc: 'סקור חשבוניות, אישורים וניהול העמותה' },
      { key: 'vendor',    icon: '🔧', title: 'ספק / קבלן',         desc: 'שלח חשבוניות, הגדר ACH ותאם עם הצוות שלנו' },
      { key: 'staff',     icon: '🔒', title: 'צוות PMI',           desc: 'לוח הניהול הפנימי' },
    ],
  },
  ru: {
    tagline: 'PMI Top Florida Properties',
    welcome: 'Добро пожаловать в MAIA',
    subtitle: 'Как мы можем вам помочь?',
    chooseAssoc: 'Выберите Ассоциацию',
    searchPlaceholder: 'Поиск ассоциаций…',
    noResults: 'Ассоциации не найдены',
    back: '← Назад',
    contact: 'Вопросы?',
    personas: [
      { key: 'homeowner', icon: '🏠', title: 'Домовладелец / Житель',     desc: 'Доступ к порталу ассоциации, документам и услугам' },
      { key: 'applicant', icon: '📋', title: 'Арендатор / Покупатель',    desc: 'Подайте заявку на аренду или покупку в наших комплексах' },
      { key: 'agent',     icon: '🏢', title: 'Агент по недвижимости',     desc: 'Инструменты для объявлений, покупателей и estoppel — напишите нам' },
      { key: 'board',     icon: '👥', title: 'Член правления',            desc: 'Просмотр счетов, одобрений и управления ассоциацией' },
      { key: 'vendor',    icon: '🔧', title: 'Поставщик / Подрядчик',    desc: 'Отправьте счета, настройте ACH и координируйте с нашей командой' },
      { key: 'staff',     icon: '🔒', title: 'Персонал PMI',              desc: 'Внутренняя панель управления' },
    ],
  },
}

const ASSOCIATIONS = [
  { name: 'Abbott Avenue',      slug: 'abbott' },
  { name: 'Brook',              slug: 'brook' },
  { name: 'Crystal Heights',    slug: 'crystalh' },
  { name: 'Del Vista',          slug: 'delvista' },
  { name: 'Essi',               slug: 'essi' },
  { name: 'Fifth',              slug: 'fifth' },
  { name: 'Galleria V',         slug: 'galleriav' },
  { name: 'Gold Key',           slug: 'goldkey' },
  { name: 'Island House',       slug: 'islandhouse' },
  { name: 'Kane',               slug: 'kane' },
  { name: 'Kim Garden',         slug: 'kimgarden' },
  { name: 'La Farms',           slug: 'lafarms' },
  { name: 'Lakeview',           slug: 'lakeview' },
  { name: 'Maco',               slug: 'maco' },
  { name: 'Manors XI',          slug: 'manorsxi' },
  { name: 'One Bay',            slug: 'onebay' },
  { name: 'Parcview',           slug: 'parcview' },
  { name: 'Serenity IV',        slug: 'serenityiv' },
  { name: 'Shoreland',          slug: 'shoreland' },
  { name: 'Venetian 1',         slug: 'venetian1' },
  { name: 'Venetian 2',         slug: 'venetian2' },
  { name: 'Venetian 5',         slug: 'venetian5' },
  { name: 'Venetian Recreation', slug: 'venetianrec' },
  { name: 'Wedgewood 57',       slug: 'wedgewood57' },
  { name: 'Wedgewood Ansin',    slug: 'wedgewoodansin' },
]

export default function Home() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('en')
  const [step, setStep] = useState<Step>('persona')
  const [search, setSearch] = useState('')

  const t = T[lang]
  const isRtl = lang === 'he'

  const filtered = useMemo(
    () => ASSOCIATIONS.filter(a => a.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  )

  function handlePersona(key: string) {
    if (key === 'homeowner') { setStep('association'); return }
    if (key === 'applicant') { router.push('/apply'); return }
    if (key === 'agent')     { window.open('https://wa.me/17866863223', '_blank'); return }
    if (key === 'board')     { window.open('https://pmitfp.cincwebaxis.com/', '_blank'); return }
    if (key === 'vendor')    { window.open('https://wa.me/17866863223', '_blank'); return }
    if (key === 'staff')     { router.push('/admin'); return }
  }

  function goBack() {
    setStep('persona')
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="bg-[#0a2342] text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg select-none">
              M
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-blue-300 uppercase leading-none mb-0.5">
                PMI Top Florida Properties
              </div>
              <div className="text-xl font-bold tracking-tight leading-none">MAIA</div>
            </div>
          </div>

          {/* Language tabs */}
          <div className="flex gap-0.5 bg-white/10 rounded-lg p-1">
            {LANG_TABS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  lang === l.code
                    ? 'bg-white text-[#0a2342] shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-10">

        {step === 'persona' && (
          <>
            {/* Hero */}
            <div className={`mb-10 ${isRtl ? 'text-right' : 'text-center'}`}>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0a2342] mb-2 tracking-tight">
                {t.welcome}
              </h1>
              <p className="text-gray-500 text-lg">{t.subtitle}</p>
            </div>

            {/* Persona grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.personas.map(p => (
                <button
                  key={p.key}
                  onClick={() => handlePersona(p.key)}
                  className={`group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  <div className="text-4xl mb-4 leading-none">{p.icon}</div>
                  <div className="font-semibold text-[#0a2342] text-base mb-1.5 group-hover:text-blue-700 transition-colors">
                    {p.title}
                  </div>
                  <div className="text-sm text-gray-400 leading-snug">{p.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'association' && (
          <>
            {/* Back */}
            <button
              onClick={goBack}
              className="text-blue-600 hover:text-blue-800 font-medium mb-7 inline-flex items-center gap-1.5 transition-colors"
            >
              {t.back}
            </button>

            {/* Title */}
            <h2 className={`text-2xl sm:text-3xl font-bold text-[#0a2342] mb-5 tracking-tight ${isRtl ? 'text-right' : ''}`}>
              {t.chooseAssoc}
            </h2>

            {/* Search */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">🔍</span>
              <input
                type="search"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                dir="ltr"
              />
            </div>

            {/* Association cards */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map(a => (
                  <button
                    key={a.slug}
                    onClick={() => router.push(`/${a.slug}`)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-5 text-center hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    <div className="text-sm font-semibold text-[#0a2342] leading-tight">{a.name}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-16 text-base">{t.noResults}</div>
            )}
          </>
        )}

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 px-4 py-6">
        <div className={`max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400 ${isRtl ? 'sm:flex-row-reverse text-right' : ''}`}>
          <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-start">
            <span>{t.contact}</span>
            <a
              href="mailto:PMI@topfloridaproperties.com"
              className="text-blue-600 hover:underline font-medium"
            >
              PMI@topfloridaproperties.com
            </a>
            <span className="text-gray-300">·</span>
            <a href="tel:+13059005077" className="text-blue-600 hover:underline font-medium">
              305.900.5077
            </a>
          </div>
          <div className="text-gray-300 text-xs">© 2026 PMI Top Florida Properties</div>
        </div>
      </footer>

    </div>
  )
}
