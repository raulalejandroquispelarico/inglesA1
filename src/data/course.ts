/**
 * Datos del curso de Inglés A1 para hispanohablantes.
 * Basado en los PDFs pedagógicos del repositorio original.
 * Solo la Unidad 1 tiene contenido completo (modo testing); las demás
 * unidades están listadas pero marcadas como "próximamente".
 */

export type UnitStatus = "available" | "locked" | "coming-soon";

export interface CourseUnit {
  id: number;
  slug: string;
  title: string;
  titleEn: string;
  icon: string; // emoji simple para evitar dependencias
  duration: string;
  lessons: number;
  status: UnitStatus;
  summary: string;
}

export interface VocabItem {
  word: string;
  pronunciation: string; // transcripción fonética aproximada
  translation: string;
  category: string;
  emoji?: string;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  examples: { en: string; es: string }[];
  tip?: string;
}

export interface DialogueLine {
  speaker: "A" | "B" | "C" | "D";
  en: string;
  es: string;
}

export interface Dialogue {
  title: string;
  context: string;
  lines: DialogueLine[];
  /**
   * Mapeo de speaker a rol de voz (female1, female2, male1, male2).
   * Por defecto: A → female1, B → male1, C → female2, D → male2
   */
  speakerRoles?: Record<string, "female1" | "female2" | "male1" | "male2">;
}

export interface Exercise {
  id: string;
  type:
    | "match"
    | "multiple-choice"
    | "fill-blank"
    | "word-order"
    | "listening"
    | "writing";
  prompt: string;
  pairs?: { left: string; right: string }[];
  options?: string[];
  /** Respuesta correcta (string o array para múltiples válidas) */
  answer?: string | string[];
  /** Respuestas aceptables además de `answer` */
  acceptableAnswers?: string[];
  blanks?: {
    before: string;
    after: string;
    answer: string | string[];
    acceptableAnswers?: string[];
  }[];
  words?: string[];
  audioText?: string;
  question?: string;
  choices?: string[];
  model?: string;
  hint?: string;
}

export interface LessonContent {
  vocabulary: VocabItem[];
  grammar: GrammarRule[];
  dialogues: Dialogue[];
  exercises: Exercise[];
  evaluation: Exercise[];
}

export const COURSE_UNITS: CourseUnit[] = [
  {
    id: 1,
    slug: "hello-personal-introductions",
    title: "Hello — Personal Introductions",
    titleEn: "Saludos y presentaciones personales",
    icon: "👋",
    duration: "6 horas",
    lessons: 3,
    status: "available",
    summary:
      "Aprende a saludar, presentarte, deletrear tu nombre y usar los pronombres personales con el verbo 'to be'.",
  },
  {
    id: 2,
    slug: "my-family-and-friends",
    title: "My Family and Friends",
    titleEn: "Mi familia y amigos",
    icon: "👨‍👩‍👧‍👦",
    duration: "6 horas",
    lessons: 3,
    status: "available",
    summary: "Vocabulario de miembros de la familia, adjetivos descriptivos, posesivos y el verbo 'to have'.",
  },
  {
    id: 3,
    slug: "numbers-dates-and-time",
    title: "Numbers, Dates and Time",
    titleEn: "Números, fechas y hora",
    icon: "🔢",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Números ordinales, días de la semana, meses y cómo decir la hora.",
  },
  {
    id: 4,
    slug: "my-home-and-belongings",
    title: "My Home and Belongings",
    titleEn: "Mi casa y pertenencias",
    icon: "🏠",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Habitaciones de la casa, muebles y adjetivos posesivos.",
  },
  {
    id: 5,
    slug: "daily-routines",
    title: "Daily Routines",
    titleEn: "Rutinas diarias",
    icon: "⏰",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Verbos de acción, frecuencia y presente simple.",
  },
  {
    id: 6,
    slug: "food-and-drinks",
    title: "Food and Drinks",
    titleEn: "Comida y bebidas",
    icon: "🍽️",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Alimentos, bebidas, contables e incontables.",
  },
  {
    id: 7,
    slug: "shopping-and-prices",
    title: "Shopping and Prices",
    titleEn: "Compras y precios",
    icon: "🛒",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Vocabulario de tiendas, precios y conversaciones de compra.",
  },
  {
    id: 8,
    slug: "places-in-town",
    title: "Places in Town",
    titleEn: "Lugares de la ciudad",
    icon: "🏙️",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Edificios, direcciones y cómo pedir y dar indicaciones.",
  },
  {
    id: 9,
    slug: "hobbies-and-free-time",
    title: "Hobbies and Free Time",
    titleEn: "Pasatiempos y tiempo libre",
    icon: "🎮",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Actividades de tiempo libre y gustos personales.",
  },
  {
    id: 10,
    slug: "travel-and-transportation",
    title: "Travel and Transportation",
    titleEn: "Viajes y transporte",
    icon: "✈️",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Medios de transporte y vocabulario para viajar.",
  },
  {
    id: 11,
    slug: "weather-and-seasons",
    title: "Weather and Seasons",
    titleEn: "Clima y estaciones",
    icon: "🌦️",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Conversaciones sobre el clima y las estaciones del año.",
  },
  {
    id: 12,
    slug: "review-and-final-project",
    title: "Review and Final Project",
    titleEn: "Repaso y proyecto final",
    icon: "🎓",
    duration: "6 horas",
    lessons: 3,
    status: "coming-soon",
    summary: "Repaso integral y aplicación práctica de todo lo aprendido.",
  },
];

/**
 * Contenido completo de la Lección 1 (Unidad 1: Hello / Personal Introductions).
 * Las 5 secciones siguen el formato del índice del curso:
 * Vocabulario · Gramática · Diálogos · Ejercicios · Evaluación.
 */
export const UNIT_1_CONTENT: LessonContent = {
  vocabulary: [
    {
      word: "Hello",
      pronunciation: "/həˈloʊ/ (je-lo)",
      translation: "Hola",
      category: "Saludos",
      emoji: "👋",
    },
    {
      word: "Hi",
      pronunciation: "/haɪ/ (jái)",
      translation: "Hola (informal)",
      category: "Saludos",
      emoji: "✋",
    },
    {
      word: "Good morning",
      pronunciation: "/ɡʊd ˈmɔːrnɪŋ/ (gud mór-ning)",
      translation: "Buenos días",
      category: "Saludos",
      emoji: "🌅",
    },
    {
      word: "Good afternoon",
      pronunciation: "/ɡʊd ˌæftərˈnuːn/ (gud af-ter-nún)",
      translation: "Buenas tardes",
      category: "Saludos",
      emoji: "☀️",
    },
    {
      word: "Good evening",
      pronunciation: "/ɡʊd ˈiːvnɪŋ/ (gud ív-ning)",
      translation: "Buenas noches (al llegar)",
      category: "Saludos",
      emoji: "🌙",
    },
    {
      word: "Goodbye",
      pronunciation: "/ɡʊdˈbaɪ/ (gud-bái)",
      translation: "Adiós",
      category: "Despedidas",
      emoji: "👋",
    },
    {
      word: "Bye",
      pronunciation: "/baɪ/ (bái)",
      translation: "Chao",
      category: "Despedidas",
      emoji: "🙋",
    },
    {
      word: "See you later",
      pronunciation: "/siː juː ˈleɪtər/ (si iu léi-ter)",
      translation: "Nos vemos luego",
      category: "Despedidas",
      emoji: "⏳",
    },
    {
      word: "What's your name?",
      pronunciation: "/wɒts jɔːr neɪm/ (uots ior neim)",
      translation: "¿Cómo te llamas?",
      category: "Presentaciones",
      emoji: "❓",
    },
    {
      word: "My name is...",
      pronunciation: "/maɪ neɪm ɪz/ (mai neim is)",
      translation: "Me llamo...",
      category: "Presentaciones",
      emoji: "🪪",
    },
    {
      word: "Nice to meet you!",
      pronunciation: "/naɪs tuː miːt juː/ (nais tu mit iu)",
      translation: "¡Mucho gusto!",
      category: "Presentaciones",
      emoji: "🤝",
    },
    {
      word: "How are you?",
      pronunciation: "/haʊ ɑːr juː/ (jau ar iu)",
      translation: "¿Cómo estás?",
      category: "Presentaciones",
      emoji: "🙂",
    },
    {
      word: "I'm fine, thanks",
      pronunciation: "/aɪm faɪn, θæŋks/ (aim fain, zanks)",
      translation: "Estoy bien, gracias",
      category: "Presentaciones",
      emoji: "👍",
    },
    {
      word: "A",
      pronunciation: "/eɪ/",
      translation: "Letra A",
      category: "Alfabeto",
    },
    {
      word: "B",
      pronunciation: "/biː/",
      translation: "Letra B",
      category: "Alfabeto",
    },
    {
      word: "C",
      pronunciation: "/siː/",
      translation: "Letra C",
      category: "Alfabeto",
    },
    {
      word: "H",
      pronunciation: "/eɪtʃ/",
      translation: "Letra H",
      category: "Alfabeto",
    },
    {
      word: "J",
      pronunciation: "/dʒeɪ/",
      translation: "Letra J",
      category: "Alfabeto",
    },
    {
      word: "R",
      pronunciation: "/ɑːr/",
      translation: "Letra R",
      category: "Alfabeto",
    },
    {
      word: "W",
      pronunciation: "/ˈdʌbəljuː/",
      translation: "Letra W",
      category: "Alfabeto",
    },
    {
      word: "Y",
      pronunciation: "/waɪ/",
      translation: "Letra Y",
      category: "Alfabeto",
    },
    {
      word: "1 — One",
      pronunciation: "/wʌn/",
      translation: "Uno",
      category: "Números",
    },
    {
      word: "2 — Two",
      pronunciation: "/tuː/",
      translation: "Dos",
      category: "Números",
    },
    {
      word: "3 — Three",
      pronunciation: "/θriː/",
      translation: "Tres",
      category: "Números",
    },
    {
      word: "5 — Five",
      pronunciation: "/faɪv/",
      translation: "Cinco",
      category: "Números",
    },
    {
      word: "7 — Seven",
      pronunciation: "/ˈsɛvən/",
      translation: "Siete",
      category: "Números",
    },
    {
      word: "10 — Ten",
      pronunciation: "/tɛn/",
      translation: "Diez",
      category: "Números",
    },
    {
      word: "13 — Thirteen",
      pronunciation: "/θɜːrˈtiːn/",
      translation: "Trece",
      category: "Números",
    },
    {
      word: "20 — Twenty",
      pronunciation: "/ˈtwɛnti/",
      translation: "Veinte",
      category: "Números",
    },
  ],
  grammar: [
    {
      title: "El verbo 'to be' (ser / estar)",
      explanation:
        "En inglés, el verbo 'to be' cambia según el sujeto, a diferencia del español donde 'ser' y 'estar' son verbos distintos. En inglés ambos significados se cubren con un solo verbo que se conjuga como am / is / are.",
      examples: [
        { en: "I am a teacher.", es: "Yo soy profesor/a." },
        { en: "She is from Peru.", es: "Ella es de Perú." },
        { en: "We are students.", es: "Nosotros somos estudiantes." },
        { en: "She is happy.", es: "Ella está feliz." },
        { en: "She is a doctor.", es: "Ella es doctora." },
      ],
      tip: "Truco: usa 'am' con I, 'is' con he/she/it, y 'are' con you/we/they.",
    },
    {
      title: "Pronombres personales",
      explanation:
        "Los pronombres personales en inglés son más simples que en español: 'you' sirve para 'tú', 'usted' y 'ustedes', sin distinción de formalidad ni número (singular/plural se distingue por contexto).",
      examples: [
        { en: "I", es: "Yo" },
        { en: "You", es: "Tú / Usted / Ustedes" },
        { en: "He", es: "Él" },
        { en: "She", es: "Ella" },
        { en: "It", es: "Ello (cosas, animales)" },
        { en: "We", es: "Nosotros" },
        { en: "They", es: "Ellos / Ellas" },
      ],
      tip: "En inglés no existe el 'tuteo vs. usted'; siempre se usa 'you'.",
    },
    {
      title: "Contracciones comunes",
      explanation:
        "En inglés hablado y escrito informal se usan mucho las contracciones del verbo 'to be'. Son obligatorias en conversación natural.",
      examples: [
        { en: "I am → I'm", es: "Yo soy → Yo soy" },
        { en: "You are → You're", es: "Tú eres → Tú eres" },
        { en: "He is → He's", es: "Él es → Él es" },
        { en: "She is → She's", es: "Ella es → Ella es" },
        { en: "It is → It's", es: "Es → Es" },
        { en: "We are → We're", es: "Somos → Somos" },
        { en: "They are → They're", es: "Ellos son → Ellos son" },
      ],
      tip: "What's = What is. Es la contracción que usarás en 'What's your name?'.",
    },
  ],
  dialogues: [
    {
      title: "Conversación informal en un café",
      context: "Dos personas se conocen en un café.",
      lines: [
        { speaker: "A", en: "Hi! I'm Ana. What's your name?", es: "¡Hola! Soy Ana. ¿Cómo te llamas?" },
        { speaker: "B", en: "My name is Luis. Nice to meet you, Ana!", es: "Me llamo Luis. ¡Mucho gusto, Ana!" },
        { speaker: "A", en: "Nice to meet you too, Luis. How are you?", es: "Igualmente, Luis. ¿Cómo estás?" },
        { speaker: "B", en: "I'm fine, thanks. And you?", es: "Estoy bien, gracias. ¿Y tú?" },
        { speaker: "A", en: "I'm good, thank you. Are you from La Paz?", es: "Estoy bien, gracias. ¿Eres de La Paz?" },
        { speaker: "B", en: "Yes, I am. And you?", es: "Sí, lo soy. ¿Y tú?" },
        { speaker: "A", en: "I'm from Santa Cruz.", es: "Soy de Santa Cruz." },
      ],
    },
    {
      title: "Conversación formal en recepción de hotel",
      context: "Una recepcionista atiende a una huésped.",
      lines: [
        { speaker: "A", en: "Good afternoon! What's your name, please?", es: "¡Buenas tardes! ¿Cómo se llama, por favor?" },
        { speaker: "B", en: "My name is Maria Lopez.", es: "Me llamo Maria Lopez." },
        { speaker: "A", en: "Can you spell that, please?", es: "¿Puede deletrearlo, por favor?" },
        { speaker: "B", en: "Yes. M-A-R-I-A, L-O-P-E-Z.", es: "Sí. M-A-R-I-A, L-O-P-E-Z." },
        { speaker: "A", en: "Thank you, Ms. Lopez.", es: "Gracias, Sra. Lopez." },
      ],
    },
  ],
  exercises: [
    {
      id: "ex1",
      type: "match",
      prompt: "Relaciona cada saludo con su traducción correcta.",
      pairs: [
        { left: "Hello", right: "Hola" },
        { left: "Goodbye", right: "Adiós" },
        { left: "Good morning", right: "Buenos días" },
        { left: "See you later", right: "Nos vemos luego" },
      ],
    },
    {
      id: "ex2",
      type: "multiple-choice",
      prompt: "Elige la opción correcta para completar la frase: 'She ___ from Peru.'",
      options: ["am", "is", "are"],
      answer: "is",
      hint: "Recuerda: con 'she' se usa 'is'.",
    },
    {
      id: "ex3",
      type: "multiple-choice",
      prompt: "Elige la opción correcta para completar la frase: 'We ___ students.'",
      options: ["am", "is", "are"],
      answer: "are",
      hint: "Con 'we' siempre se usa 'are'.",
    },
    {
      id: "ex4",
      type: "fill-blank",
      prompt: "Completa el diálogo con las palabras correctas.",
      blanks: [
        { before: "A: Hi!", after: "name is Maria.", answer: "My" },
        { before: "B: Nice to meet you, Maria. I", after: "Pedro.", answer: "'m" },
      ],
      hint: "Una es pronombre posesivo, la otra es contracción de 'am'.",
    },
    {
      id: "ex5",
      type: "word-order",
      prompt: "Ordena las palabras para formar una frase correcta.",
      words: ["name", "is", "My", "Ana"],
      answer: "My name is Ana",
      hint: "Empieza por el pronombre posesivo.",
    },
    {
      id: "ex6",
      type: "listening",
      prompt: "Escucha la pregunta y elige la respuesta correcta.",
      audioText: "What's your name?",
      question: "¿Qué te preguntan?",
      choices: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?"],
      answer: "¿Cómo te llamas?",
      hint: "Puedes hacer clic en 'Escuchar' las veces que necesites.",
    },
    {
      id: "ex7",
      type: "writing",
      prompt:
        "Escribe tu presentación personal usando el modelo. Incluye tu nombre, de dónde eres, y cómo estás.",
      model: "Hi! My name is [Name]. I am from [City]. I am [fine/good/happy].",
      hint: "Ejemplo: Hi! My name is Juan. I am from Cochabamba. I am fine.",
    },
  ],
  evaluation: [
    {
      id: "ev1",
      type: "match",
      prompt: "Empareja cada palabra con su traducción.",
      pairs: [
        { left: "Goodbye", right: "Adiós" },
        { left: "Hi", right: "Hola" },
        { left: "Fine", right: "Bien" },
        { left: "Nice to meet you", right: "Mucho gusto" },
      ],
    },
    {
      id: "ev2",
      type: "fill-blank",
      prompt: "Completa con 'am', 'is', o 'are'.",
      blanks: [
        { before: "She", after: "a teacher.", answer: "is" },
        { before: "We", after: "students.", answer: "are" },
        { before: "I", after: "from Bolivia.", answer: "am" },
      ],
    },
    {
      id: "ev3",
      type: "listening",
      prompt: "Escucha el audio y responde.",
      audioText: "How are you?",
      question: "¿Qué te preguntan?",
      choices: ["¿Cómo te llamas?", "¿Cómo estás?", "¿Qué haces?"],
      answer: "¿Cómo estás?",
    },
    {
      id: "ev4",
      type: "writing",
      prompt:
        "Escribe un diálogo de 4 líneas donde te presentes y preguntes el nombre de otra persona.",
      model:
        "A: Hi! My name is Juan. What's your name?\nB: I'm Ana. Nice to meet you!\nA: Nice to meet you too, Ana!\nB: How are you?",
      hint: "Sigue el modelo: saludo → presentación → respuesta → cortesía.",
    },
  ],
};

/**
 * Contenido completo de la Lección 2 (Unidad 2: My Family and Friends).
 * Vocabulario de familia + adjetivos + posesivos + verbo to have.
 */
export const UNIT_2_CONTENT: LessonContent = {
  vocabulary: [
    // Familia
    {
      word: "Father",
      pronunciation: "/ˈfɑːðər/ (fá-zer)",
      translation: "Padre",
      category: "Familia",
      emoji: "👨",
    },
    {
      word: "Mother",
      pronunciation: "/ˈmʌðər/ (má-zer)",
      translation: "Madre",
      category: "Familia",
      emoji: "👩",
    },
    {
      word: "Son",
      pronunciation: "/sʌn/ (san)",
      translation: "Hijo",
      category: "Familia",
      emoji: "👦",
    },
    {
      word: "Daughter",
      pronunciation: "/ˈdɔːtər/ (dó-ter)",
      translation: "Hija",
      category: "Familia",
      emoji: "👧",
    },
    {
      word: "Brother",
      pronunciation: "/ˈbrʌðər/ (brá-zer)",
      translation: "Hermano",
      category: "Familia",
      emoji: "👦",
    },
    {
      word: "Sister",
      pronunciation: "/ˈsɪstər/ (sís-ter)",
      translation: "Hermana",
      category: "Familia",
      emoji: "👧",
    },
    {
      word: "Grandfather",
      pronunciation: "/ˈɡrænˌfɑːðər/ (gran-fá-zer)",
      translation: "Abuelo",
      category: "Familia",
      emoji: "👴",
    },
    {
      word: "Grandmother",
      pronunciation: "/ˈɡrænˌmʌðər/ (gran-má-zer)",
      translation: "Abuela",
      category: "Familia",
      emoji: "👵",
    },
    {
      word: "Uncle",
      pronunciation: "/ˈʌŋkəl/ (án-kel)",
      translation: "Tío",
      category: "Familia",
      emoji: "🧔",
    },
    {
      word: "Aunt",
      pronunciation: "/ænt/ (ant)",
      translation: "Tía",
      category: "Familia",
      emoji: "👩",
    },
    {
      word: "Cousin",
      pronunciation: "/ˈkʌzən/ (ká-zen)",
      translation: "Primo / Prima",
      category: "Familia",
      emoji: "🧒",
    },
    {
      word: "Husband",
      pronunciation: "/ˈhʌzbənd/ (jás-bend)",
      translation: "Esposo",
      category: "Familia",
      emoji: "👨",
    },
    {
      word: "Wife",
      pronunciation: "/waɪf/ (uáif)",
      translation: "Esposa",
      category: "Familia",
      emoji: "👩",
    },
    {
      word: "Baby",
      pronunciation: "/ˈbeɪbi/ (béi-bi)",
      translation: "Bebé",
      category: "Familia",
      emoji: "👶",
    },
    // Adjetivos descriptivos
    {
      word: "Tall",
      pronunciation: "/tɔːl/ (tol)",
      translation: "Alto",
      category: "Adjetivos",
      emoji: "📏",
    },
    {
      word: "Short",
      pronunciation: "/ʃɔːrt/ (short)",
      translation: "Bajo",
      category: "Adjetivos",
      emoji: "📐",
    },
    {
      word: "Young",
      pronunciation: "/jʌŋ/ (iong)",
      translation: "Joven",
      category: "Adjetivos",
      emoji: "🧑",
    },
    {
      word: "Old",
      pronunciation: "/oʊld/ (old)",
      translation: "Viejo",
      category: "Adjetivos",
      emoji: "👴",
    },
    {
      word: "Happy",
      pronunciation: "/ˈhæpi/ (já-pi)",
      translation: "Feliz",
      category: "Adjetivos",
      emoji: "😊",
    },
    {
      word: "Sad",
      pronunciation: "/sæd/ (sed)",
      translation: "Triste",
      category: "Adjetivos",
      emoji: "😢",
    },
    {
      word: "Kind",
      pronunciation: "/kaɪnd/ (kaind)",
      translation: "Amable",
      category: "Adjetivos",
      emoji: "🤗",
    },
    {
      word: "Funny",
      pronunciation: "/ˈfʌni/ (fá-ni)",
      translation: "Divertido",
      category: "Adjetivos",
      emoji: "😂",
    },
    // Amigos y relaciones
    {
      word: "Friend",
      pronunciation: "/frɛnd/ (frend)",
      translation: "Amigo / Amiga",
      category: "Amigos",
      emoji: "🙂",
    },
    {
      word: "Best friend",
      pronunciation: "/bɛst frɛnd/ (best frend)",
      translation: "Mejor amigo/a",
      category: "Amigos",
      emoji: "🤝",
    },
    {
      word: "Boyfriend",
      pronunciation: "/ˈbɔɪfrɛnd/ (bói-frend)",
      translation: "Novio",
      category: "Amigos",
      emoji: "💑",
    },
    {
      word: "Girlfriend",
      pronunciation: "/ˈɡɜːrlfrɛnd/ (gerl-frend)",
      translation: "Novia",
      category: "Amigos",
      emoji: "💑",
    },
    {
      word: "Neighbor",
      pronunciation: "/ˈneɪbər/ (néi-ber)",
      translation: "Vecino / Vecina",
      category: "Amigos",
      emoji: "🏠",
    },
  ],
  grammar: [
    {
      title: "Adjetivos posesivos (my, your, his, her, our, their)",
      explanation:
        "Los posesivos indican a quién pertenece algo. En inglés, no tienen género (excepto 'his' y 'her'), pero sí número. Se colocan siempre ANTES del sustantivo: 'my book', 'her car', 'our house'.",
      examples: [
        { en: "This is my book.", es: "Este es mi libro." },
        { en: "Is this your pen?", es: "¿Es este tu bolígrafo?" },
        { en: "That is his car.", es: "Ese es su auto (de él)." },
        { en: "This is her bag.", es: "Esta es su bolsa (de ella)." },
        { en: "This is our house.", es: "Esta es nuestra casa." },
        { en: "That is their dog.", es: "Ese es su perro (de ellos)." },
      ],
      tip: "En español 'su' puede referirse a 'él', 'ella', 'usted' o 'ellos'. En inglés es más preciso: his (de él), her (de ella), their (de ellos).",
    },
    {
      title: "El verbo 'to have' (tener)",
      explanation:
        "El verbo 'to have' se usa para expresar posesión, relaciones familiares o características. La única forma irregular es 'has' para he/she/it; el resto usan 'have'. En negativo se usa el auxiliar 'don't/doesn't' + have.",
      examples: [
        { en: "I have two brothers.", es: "Yo tengo dos hermanos." },
        { en: "She has a daughter.", es: "Ella tiene una hija." },
        { en: "Do you have a pet?", es: "¿Tienes una mascota?" },
        { en: "He has a car.", es: "Él tiene un auto." },
        { en: "I don't have a brother.", es: "Yo no tengo un hermano." },
        { en: "She doesn't have a cat.", es: "Ella no tiene un gato." },
      ],
      tip: "Truco: usa 'has' SOLO con he/she/it. Con I, you, we, they siempre se usa 'have'.",
    },
    {
      title: "Presentaciones y descripciones",
      explanation:
        "Para presentar a alguien se usa 'This is my [familiar]'. Para describir a alguien se usa 'He/She is [adjetivo]'. Para preguntar por la familia se usa 'Do you have...?'",
      examples: [
        { en: "This is my father.", es: "Este es mi padre." },
        { en: "He is tall and kind.", es: "Él es alto y amable." },
        { en: "Do you have brothers?", es: "¿Tienes hermanos?" },
        { en: "This is her book.", es: "Este es su libro (de ella)." },
        { en: "She is my best friend.", es: "Ella es mi mejor amiga." },
      ],
      tip: "Cuando describas a alguien, usa 2 o 3 adjetivos unidos por 'and': 'He is tall, kind, and funny'.",
    },
  ],
  dialogues: [
    {
      title: "Presentando a la familia en el parque",
      context: "Dos amigos hablan sobre sus familias en un parque.",
      lines: [
        { speaker: "A", en: "Hi, Luis! This is my sister, Clara.", es: "¡Hola, Luis! Esta es mi hermana, Clara." },
        { speaker: "B", en: "Nice to meet you, Clara. I'm Luis.", es: "Mucho gusto, Clara. Soy Luis." },
        { speaker: "A", en: "Nice to meet you too, Luis.", es: "Mucho gusto, Luis." },
        { speaker: "B", en: "Luis, do you have brothers or sisters?", es: "Luis, ¿tienes hermanos o hermanas?" },
        { speaker: "A", en: "Yes, I have one brother and two sisters. And you?", es: "Sí, tengo un hermano y dos hermanas. ¿Y tú?" },
        { speaker: "B", en: "I have two brothers. My family is big!", es: "Tengo dos hermanos. ¡Mi familia es grande!" },
      ],
    },
    {
      title: "Describiendo a los padres",
      context: "Dos personas hablan sobre sus padres mirando una foto.",
      lines: [
        { speaker: "A", en: "Who is that man in the photo?", es: "¿Quién es ese hombre en la foto?" },
        { speaker: "B", en: "That's my father. His name is Carlos.", es: "Ese es mi padre. Su nombre es Carlos." },
        { speaker: "A", en: "What is he like?", es: "¿Cómo es él?" },
        { speaker: "B", en: "He is tall, kind, and very funny. He has a big smile.", es: "Es alto, amable y muy divertido. Tiene una gran sonrisa." },
        { speaker: "A", en: "That's nice! My father is short but very strong.", es: "¡Qué bonito! Mi padre es bajo pero muy fuerte." },
      ],
    },
  ],
  exercises: [
    {
      id: "u2-ex1",
      type: "match",
      prompt: "Relaciona cada miembro de la familia con su traducción.",
      pairs: [
        { left: "Father", right: "Padre" },
        { left: "Sister", right: "Hermana" },
        { left: "Grandmother", right: "Abuela" },
        { left: "Cousin", right: "Primo" },
      ],
    },
    {
      id: "u2-ex2",
      type: "multiple-choice",
      prompt: "Elige la opción correcta: 'This is ___ book.'",
      options: ["my", "me", "I"],
      answer: "my",
      hint: "El posesivo va antes del sustantivo.",
    },
    {
      id: "u2-ex3",
      type: "multiple-choice",
      prompt: "Elige la opción correcta: 'That is ___ car.'",
      options: ["her", "she", "hers"],
      answer: "her",
      hint: "Para 'ella' el posesivo es 'her'.",
    },
    {
      id: "u2-ex4",
      type: "fill-blank",
      prompt: "Completa con la forma correcta de 'to have' (has / have).",
      blanks: [
        { before: "She", after: "a cat.", answer: "has" },
        { before: "We", after: "two dogs.", answer: "have" },
        { before: "", after: "you have a brother?", answer: "Do" },
      ],
      hint: "Recuerda: con he/she/it se usa 'has'. En preguntas se usa 'Do you have...?'",
    },
    {
      id: "u2-ex5",
      type: "word-order",
      prompt: "Ordena las palabras para formar una frase correcta.",
      words: ["my", "This", "is", "father"],
      answer: "This is my father",
      hint: "Empieza con 'This is...'",
    },
    {
      id: "u2-ex6",
      type: "listening",
      prompt: "Escucha la pregunta y elige la respuesta correcta.",
      audioText: "Do you have brothers or sisters?",
      question: "¿Qué te preguntan?",
      choices: [
        "¿Tienes hermanos o hermanas?",
        "¿Cómo se llama tu hermano?",
        "¿Dónde está tu familia?",
      ],
      answer: "¿Tienes hermanos o hermanas?",
      hint: "Puedes escuchar el audio las veces que necesites.",
    },
    {
      id: "u2-ex7",
      type: "writing",
      prompt:
        "Escribe una descripción de tu familia usando el modelo. Incluye número de hermanos y cómo son tus padres.",
      model:
        "I have [number] brothers/sisters. My father is [adjective] and [adjective]. My mother is [adjective].",
      hint: "Ejemplo: I have one brother. My father is tall and kind. My mother is happy and young.",
    },
  ],
  evaluation: [
    {
      id: "u2-ev1",
      type: "match",
      prompt: "Empareja cada palabra con su traducción.",
      pairs: [
        { left: "Sister", right: "Hermana" },
        { left: "Father", right: "Padre" },
        { left: "Happy", right: "Feliz" },
        { left: "Friend", right: "Amigo" },
      ],
    },
    {
      id: "u2-ev2",
      type: "fill-blank",
      prompt: "Completa con el posesivo correcto (my / her) y la forma de 'to have' (has / don't).",
      blanks: [
        { before: "This is", after: "book. (my / me)", answer: "my" },
        { before: "That is", after: "bag. (her / she)", answer: "her" },
        { before: "She", after: "a dog. (has / have)", answer: "has" },
        { before: "They", after: "have a cat. (don't / doesn't)", answer: "don't" },
      ],
    },
    {
      id: "u2-ev3",
      type: "listening",
      prompt: "Escucha el audio y responde.",
      audioText: "What is your father like?",
      question: "¿Qué te preguntan?",
      choices: [
        "¿Cómo es tu padre?",
        "¿Cuántos años tiene tu padre?",
        "¿Dónde trabaja tu padre?",
      ],
      answer: "¿Cómo es tu padre?",
    },
    {
      id: "u2-ev4",
      type: "writing",
      prompt:
        "Escribe un párrafo de 4-5 líneas describiendo a tu familia (nombres, edades, características).",
      model:
        "I have a big family. My father is tall and strong. My mother is kind and happy. I have one brother and one sister. We are all very close.",
      hint: "Sigue el modelo: tamaño de familia → descripción del padre → descripción de la madre → hermanos → cierre.",
    },
  ],
};

export function getUnitContent(unitId: number): LessonContent | null {
  if (unitId === 1) return UNIT_1_CONTENT;
  if (unitId === 2) return UNIT_2_CONTENT;
  return null;
}
