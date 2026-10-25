export type LanguageCode = 'en' | 'hi' | 'bn' | 'es';

export interface Translations {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  home: string;
  trending: string;
  newGames: string;
  categories: string;
  multiplayer: string;
  favorites: string;
  history: string;
  kidsMode: string;
  playNow: string;
  playCount: string;
  rating: string;
  share: string;
  reportBroken: string;
  howToPlay: string;
  controls: string;
  developer: string;
  license: string;
  relatedGames: string;
  signIn: string;
  signUp: string;
  submitGame: string;
  dmca: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    appName: "Pixelverse",
    tagline: "Free Online Games — Instant Play, No Downloads",
    searchPlaceholder: "Search thousands of free games...",
    home: "Home",
    trending: "Trending",
    newGames: "New",
    categories: "Categories",
    multiplayer: "Multiplayer",
    favorites: "Favorites",
    history: "Recently Played",
    kidsMode: "Kids Mode",
    playNow: "Play Now",
    playCount: "plays",
    rating: "rating",
    share: "Share",
    reportBroken: "Report Broken",
    howToPlay: "How to Play",
    controls: "Controls",
    developer: "Developer",
    license: "License & Attribution",
    relatedGames: "You May Also Like",
    signIn: "Sign In",
    signUp: "Register",
    submitGame: "Submit Game",
    dmca: "DMCA"
  },
  hi: {
    appName: "प्लेवर्स",
    tagline: "मुफ्त ऑनलाइन गेम्स — तुरंत खेलें, बिना डाउनलोड के",
    searchPlaceholder: "हजारों मुफ्त गेम्स खोजें...",
    home: "होम",
    trending: "ट्रेंडिंग",
    newGames: "नए गेम्स",
    categories: "श्रेणियाँ",
    multiplayer: "मल्टीप्लेयर",
    favorites: "पसंदीदा",
    history: "हाल ही में खेले गए",
    kidsMode: "किड्स मोड",
    playNow: "अभी खेलें",
    playCount: "बार खेला गया",
    rating: "रेटिंग",
    share: "साझा करें",
    reportBroken: "खराबी की रिपोर्ट करें",
    howToPlay: "कैसे खेलें",
    controls: "नियंत्रण",
    developer: "डेवलपर",
    license: "लाइसेंस और श्रेय",
    relatedGames: "आपको यह भी पसंद आ सकता है",
    signIn: "लॉग इन करें",
    signUp: "साइन अप करें",
    submitGame: "गेम सबमिट करें",
    dmca: "डीएमसीए"
  },
  bn: {
    appName: "প্লেভার্স",
    tagline: "ফ্রি অনলাইন গেমস — তাত্ক্ষণিক খেলুন, ডাউনলোড ছাড়াই",
    searchPlaceholder: "হাজার হাজার ফ্রি গেম খুঁজুন...",
    home: "হোম",
    trending: "ট্রেন্ডিং",
    newGames: "নতুন গেম",
    categories: "বিভাগসমূহ",
    multiplayer: "মাল্টিপ্লেয়ার",
    favorites: "পছন্দের গেম",
    history: "সম্প্রতি খেলা হয়েছে",
    kidsMode: "কিডস মোড",
    playNow: "এখনই খেলুন",
    playCount: "বার খেলা হয়েছে",
    rating: "রেটিং",
    share: "শেয়ার করুন",
    reportBroken: "সমস্যা রিপোর্ট করুন",
    howToPlay: "কীভাবে খেলবেন",
    controls: "নিয়ন্ত্রণ",
    developer: "ডেভেলপার",
    license: "লাইসেন্স ও স্বীকৃতি",
    relatedGames: "আপনার আরও পছন্দ হতে পারে",
    signIn: "সাইন ইন",
    signUp: "রেজিস্টার",
    submitGame: "গেম জমা দিন",
    dmca: "ডিএমসিএ"
  },
  es: {
    appName: "Pixelverse",
    tagline: "Juegos Gratis en Línea — Juega al Instante Sin Descargas",
    searchPlaceholder: "Buscar miles de juegos gratis...",
    home: "Inicio",
    trending: "Tendencias",
    newGames: "Novedades",
    categories: "Categorías",
    multiplayer: "Multijugador",
    favorites: "Favoritos",
    history: "Recientes",
    kidsMode: "Modo Niños",
    playNow: "Jugar Ahora",
    playCount: "partidas",
    rating: "calificación",
    share: "Compartir",
    reportBroken: "Reportar Error",
    howToPlay: "Cómo Jugar",
    controls: "Controles",
    developer: "Desarrollador",
    license: "Licencia y Atribución",
    relatedGames: "También te podría gustar",
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    submitGame: "Enviar Juego",
    dmca: "DMCA"
  }
};
