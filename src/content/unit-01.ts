/**
 * Unidad 1 — Hello! Personal Introductions.
 * ==========================================
 *
 * Basada en el PDF original + expansión para cubrir A1 completo:
 *   - 22 ítems de vocabulario (del PDF).
 *   - 3 reglas de gramática (del PDF).
 *   - 2 diálogos (del PDF).
 *   - 22 ítems de práctica (7 del PDF + 15 de expansión A1).
 *   - 4 ítems de evaluación (del PDF).
 *
 * Los errorRules cubren errores típicos de hispanohablantes:
 *   - Falta el verbo to be.
 *   - Concordancia am/is/are.
 *   - Contracciones.
 *   - Pronombres.
 *   - Orden en preguntas.
 *   - Artículos.
 *   - Mayúsculas en nombres propios.
 *   - Tercera persona.
 */

import type { Unit } from "@/shared/types";

export const UNIT_01: Unit = {
  id: 1,
  slug: "hello-personal-introductions",
  title: "Hello — Personal Introductions",
  titleEs: "Saludos y presentaciones personales",
  cefr: "A1",
  estimatedHours: 6,
  icon: "👋",
  status: "available",
  objectives: [
    "Saludar y despedirse en inglés (formal e informal).",
    "Presentarse y preguntar el nombre de alguien.",
    "Deletrear su nombre y el de otros.",
    "Usar pronombres personales (I, you, he, she) y el verbo 'to be' (am/is/are).",
    "Identificar números del 1 al 20 en contextos orales y escritos.",
  ],
  vocabulary: [
    // Saludos y despedidas
    { word: "Hello", pronunciation: "/həˈloʊ/ (je-lo)", translation: "Hola", category: "Saludos", emoji: "👋" },
    { word: "Hi", pronunciation: "/haɪ/ (jái)", translation: "Hola (informal)", category: "Saludos", emoji: "✋" },
    { word: "Good morning", pronunciation: "/ɡʊd ˈmɔːrnɪŋ/ (gud mór-ning)", translation: "Buenos días", category: "Saludos", emoji: "🌅" },
    { word: "Good afternoon", pronunciation: "/ɡʊd ˌæftərˈnuːn/ (gud af-ter-nún)", translation: "Buenas tardes", category: "Saludos", emoji: "☀️" },
    { word: "Good evening", pronunciation: "/ɡʊd ˈiːvnɪŋ/ (gud ív-ning)", translation: "Buenas noches (al llegar)", category: "Saludos", emoji: "🌙" },
    { word: "Goodbye", pronunciation: "/ɡʊdˈbaɪ/ (gud-bái)", translation: "Adiós", category: "Despedidas", emoji: "👋" },
    { word: "Bye", pronunciation: "/baɪ/ (bái)", translation: "Chao", category: "Despedidas", emoji: "🙋" },
    { word: "See you later", pronunciation: "/siː juː ˈleɪtər/ (si iu léi-ter)", translation: "Nos vemos luego", category: "Despedidas", emoji: "⏳" },
    // Presentaciones
    { word: "What's your name?", pronunciation: "/wɒts jɔːr neɪm/ (uots ior neim)", translation: "¿Cómo te llamas?", category: "Presentaciones", emoji: "❓" },
    { word: "My name is...", pronunciation: "/maɪ neɪm ɪz/ (mai neim is)", translation: "Me llamo...", category: "Presentaciones", emoji: "🪪" },
    { word: "Nice to meet you!", pronunciation: "/naɪs tuː miːt juː/ (nais tu mit iu)", translation: "¡Mucho gusto!", category: "Presentaciones", emoji: "🤝" },
    { word: "How are you?", pronunciation: "/haʊ ɑːr juː/ (jau ar iu)", translation: "¿Cómo estás?", category: "Presentaciones", emoji: "🙂" },
    { word: "I'm fine, thanks", pronunciation: "/aɪm faɪn, θæŋks/ (aim fain, zanks)", translation: "Estoy bien, gracias", category: "Presentaciones", emoji: "👍" },
    // Alfabeto
    { word: "A", pronunciation: "/eɪ/", translation: "Letra A", category: "Alfabeto" },
    { word: "B", pronunciation: "/biː/", translation: "Letra B", category: "Alfabeto" },
    { word: "C", pronunciation: "/siː/", translation: "Letra C", category: "Alfabeto" },
    { word: "H", pronunciation: "/eɪtʃ/", translation: "Letra H", category: "Alfabeto" },
    { word: "J", pronunciation: "/dʒeɪ/", translation: "Letra J", category: "Alfabeto" },
    { word: "R", pronunciation: "/ɑːr/", translation: "Letra R", category: "Alfabeto" },
    { word: "W", pronunciation: "/ˈdʌbəljuː/", translation: "Letra W", category: "Alfabeto" },
    { word: "Y", pronunciation: "/waɪ/", translation: "Letra Y", category: "Alfabeto" },
    // Números
    { word: "1 — One", pronunciation: "/wʌn/", translation: "Uno", category: "Números", emoji: "1️⃣" },
    { word: "2 — Two", pronunciation: "/tuː/", translation: "Dos", category: "Números", emoji: "2️⃣" },
    { word: "3 — Three", pronunciation: "/θriː/", translation: "Tres", category: "Números", emoji: "3️⃣" },
    { word: "5 — Five", pronunciation: "/faɪv/", translation: "Cinco", category: "Números", emoji: "5️⃣" },
    { word: "7 — Seven", pronunciation: "/ˈsɛvən/", translation: "Siete", category: "Números", emoji: "7️⃣" },
    { word: "10 — Ten", pronunciation: "/tɛn/", translation: "Diez", category: "Números", emoji: "🔟" },
    { word: "13 — Thirteen", pronunciation: "/θɜːrˈtiːn/", translation: "Trece", category: "Números" },
    { word: "20 — Twenty", pronunciation: "/ˈtwɛnti/", translation: "Veinte", category: "Números" },
  ],
  grammar: [
    {
      title: "El verbo 'to be' (ser / estar)",
      explanation:
        "En inglés, el verbo 'to be' cambia según el sujeto. En español 'ser' y 'estar' son verbos distintos, pero en inglés ambos se cubren con 'to be'.",
      examples: [
        { en: "I am a teacher.", es: "Yo soy profesor/a." },
        { en: "She is from Peru.", es: "Ella es de Perú." },
        { en: "We are students.", es: "Nosotros somos estudiantes." },
        { en: "She is happy.", es: "Ella está feliz." },
      ],
      tip: "Truco: usa 'am' con I, 'is' con he/she/it, y 'are' con you/we/they.",
    },
    {
      title: "Pronombres personales",
      explanation:
        "Los pronombres personales en inglés son más simples que en español: 'you' sirve para 'tú', 'usted' y 'ustedes'.",
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
        { en: "We are → We're", es: "Nosotros somos → Nosotros somos" },
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
  practice: [
    // =========================================================================
    // 1-2. Match: vocabulario
    // =========================================================================
    {
      id: "u1-p-001",
      kind: "match",
      skill: "vocab",
      cefr: "A1",
      difficulty: 1,
      tags: ["greetings", "vocab-basic"],
      prompt: "Empareja cada saludo con su traducción.",
      pairs: [
        { left: "Hello", right: "Hola" },
        { left: "Good morning", right: "Buenos días" },
        { left: "Goodbye", right: "Adiós" },
        { left: "See you later", right: "Nos vemos luego" },
      ],
      errorRules: [],
    },
    {
      id: "u1-p-002",
      kind: "match",
      skill: "vocab",
      cefr: "A1",
      difficulty: 1,
      tags: ["introductions", "vocab-basic"],
      prompt: "Empareja cada expresión con su traducción.",
      pairs: [
        { left: "What's your name?", right: "¿Cómo te llamas?" },
        { left: "My name is...", right: "Me llamo..." },
        { left: "Nice to meet you!", right: "¡Mucho gusto!" },
        { left: "How are you?", right: "¿Cómo estás?" },
      ],
      errorRules: [],
    },

    // =========================================================================
    // 3-5. Multiple-choice: gramática (to be, pronombres, contracciones)
    // =========================================================================
    {
      id: "u1-p-003",
      kind: "multiple-choice",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be", "am-is-are"],
      prompt: "Elige la opción correcta: 'She ___ from Peru.'",
      options: ["am", "is", "are"],
      expected: ["is"],
      errorRules: [
        {
          match: /\bam\b/,
          diagnosis: "Con 'she' no se usa 'am'.",
          rule: "Con he/she/it se usa 'is'.",
          example: "She is from Peru.",
          tag: "to-be",
        },
        {
          match: /\bare\b/,
          diagnosis: "Con 'she' no se usa 'are'.",
          rule: "Con he/she/it se usa 'is'.",
          example: "She is from Peru.",
          tag: "to-be",
        },
      ],
      distractors: {
        am: "Con 'she' no se usa 'am'.",
        are: "Con 'she' no se usa 'are'.",
      },
    },
    {
      id: "u1-p-004",
      kind: "multiple-choice",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be", "am-is-are"],
      prompt: "Elige la opción correcta: 'We ___ students.'",
      options: ["am", "is", "are"],
      expected: ["are"],
      errorRules: [],
      distractors: {
        am: "Con 'we' no se usa 'am'.",
        is: "Con 'we' no se usa 'is'.",
      },
    },
    {
      id: "u1-p-005",
      kind: "multiple-choice",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["pronouns", "subject-pronouns"],
      prompt: "Elige el pronombre correcto: '___ am from Bolivia.'",
      options: ["I", "You", "He"],
      expected: ["I"],
      errorRules: [],
    },

    // =========================================================================
    // 6-7. Fill-blank: gramática
    // =========================================================================
    {
      id: "u1-p-006",
      kind: "fill-blank",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be", "am-is-are"],
      prompt: "Completa con 'am', 'is' o 'are'.",
      blanks: [
        { before: "She", after: "a teacher.", expected: ["is"] },
        { before: "We", after: "students.", expected: ["are"] },
        { before: "I", after: "from Bolivia.", expected: ["am"] },
      ],
      errorRules: [
        {
          match: /\bare\b.*\b(she|he|it)\b|\b(she|he|it)\b.*\bare\b/,
          diagnosis: "Con he/she/it se usa 'is', no 'are'.",
          rule: "Con he/she/it: is.",
          example: "She is a teacher.",
          tag: "to-be",
        },
      ],
    },
    {
      id: "u1-p-007",
      kind: "fill-blank",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["contractions"],
      prompt: "Completa con la contracción correcta.",
      blanks: [
        { before: "I", after: "from Bolivia. (I am)", expected: ["'m"] },
        { before: "She", after: "a teacher. (She is)", expected: ["'s"] },
        { before: "They", after: "students. (They are)", expected: ["'re"] },
      ],
      errorRules: [],
    },

    // =========================================================================
    // 8-9. Word-order: gramática
    // =========================================================================
    {
      id: "u1-p-008",
      kind: "word-order",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["word-order", "presentaciones"],
      prompt: "Ordena las palabras para formar una frase correcta.",
      words: ["name", "is", "My", "Ana"],
      expected: ["My name is Ana"],
      errorRules: [],
    },
    {
      id: "u1-p-009",
      kind: "word-order",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["word-order", "questions"],
      prompt: "Ordena las palabras para formar una pregunta correcta.",
      words: ["are", "How", "you", "?"],
      expected: ["How are you?"],
      errorRules: [
        {
          match: /you are how/i,
          diagnosis: "El orden correcto es 'How are you?', no 'How you are?'.",
          rule: "En preguntas con 'to be': How + am/is/are + sujeto.",
          example: "How are you?",
          tag: "word-order",
        },
      ],
    },

    // =========================================================================
    // 10-11. Listening: TTS corto
    // =========================================================================
    {
      id: "u1-p-010",
      kind: "listening",
      skill: "listening",
      cefr: "A1",
      difficulty: 2,
      tags: ["greetings", "listening-basic"],
      prompt: "Escucha el saludo y elige la traducción correcta.",
      audioText: "Good morning",
      question: "¿Qué significa lo que escuchaste?",
      choices: ["Buenos días", "Buenas tardes", "Buenas noches"],
      expected: ["Buenos días"],
      errorRules: [],
    },
    {
      id: "u1-p-011",
      kind: "listening",
      skill: "listening",
      cefr: "A1",
      difficulty: 2,
      tags: ["introductions", "listening-basic"],
      prompt: "Escucha la pregunta y elige la traducción.",
      audioText: "What's your name?",
      question: "¿Qué te preguntan?",
      choices: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?"],
      expected: ["¿Cómo te llamas?"],
      errorRules: [],
    },

    // =========================================================================
    // 12-13. Listening: audio de 2-3 frases (comprensión)
    // =========================================================================
    {
      id: "u1-p-012",
      kind: "listening",
      skill: "listening",
      cefr: "A1",
      difficulty: 3,
      tags: ["listening-comprehension", "introductions"],
      prompt: "Escucha la presentación y responde la pregunta.",
      audioText:
        "Hi! My name is Ana. I am from Bolivia. I am a teacher.",
      question: "Where is Ana from?",
      choices: ["Bolivia", "Peru", "Spain"],
      expected: ["Bolivia"],
      errorRules: [],
    },
    {
      id: "u1-p-013",
      kind: "listening",
      skill: "listening",
      cefr: "A1",
      difficulty: 3,
      tags: ["listening-comprehension", "introductions"],
      prompt: "Escucha la presentación y responde la pregunta.",
      audioText:
        "Hello. My name is Luis. I am from La Paz. I am fine, thanks.",
      question: "How is Luis?",
      choices: ["Fine, thanks", "Sad", "Tired"],
      expected: ["Fine, thanks"],
      errorRules: [],
    },

    // =========================================================================
    // 14-15. Writing: rúbrica
    // =========================================================================
    {
      id: "u1-p-014",
      kind: "writing",
      skill: "writing",
      cefr: "A1",
      difficulty: 3,
      tags: ["writing-personal", "introductions"],
      prompt:
        "Escribe tu presentación personal. Incluye tu nombre, de dónde eres y cómo estás.",
      model:
        "Hi! My name is [Name]. I am from [City]. I am [fine/good/happy].",
      rubric: [
        "Usa 'My name is...'",
        "Usa 'I am from...'",
        "Usa 'I am fine/good/happy'",
        "Al menos 15 caracteres",
      ],
      minLength: 15,
      errorRules: [],
      hint: "Ejemplo: Hi! My name is Juan. I am from Cochabamba. I am fine.",
    },
    {
      id: "u1-p-015",
      kind: "writing",
      skill: "writing",
      cefr: "A1",
      difficulty: 3,
      tags: ["writing-dialogue", "introductions"],
      prompt:
        "Escribe un diálogo de 4 líneas donde te presentes y preguntes el nombre de otra persona.",
      model:
        "A: Hi! My name is Juan. What's your name?\nB: I'm Ana. Nice to meet you!\nA: Nice to meet you too, Ana!\nB: How are you?",
      rubric: [
        "Incluye saludo",
        "Incluye presentación con 'My name is...'",
        "Incluye pregunta 'What's your name?'",
        "Incluye cortesía 'Nice to meet you'",
        "Al menos 30 caracteres",
      ],
      minLength: 30,
      errorRules: [],
    },

    // =========================================================================
    // 16-17. Reading: comprensión
    // =========================================================================
    {
      id: "u1-p-016",
      kind: "reading",
      skill: "reading",
      cefr: "A1",
      difficulty: 2,
      tags: ["reading-comprehension", "introductions"],
      prompt: "Lee el texto y responde la pregunta.",
      sourceText:
        "Hello! My name is Ana. I am from Bolivia. I am a teacher. Nice to meet you!",
      question: "What is Ana's profession?",
      choices: ["Teacher", "Doctor", "Student"],
      expected: ["Teacher"],
      errorRules: [],
    },
    {
      id: "u1-p-017",
      kind: "reading",
      skill: "reading",
      cefr: "A1",
      difficulty: 2,
      tags: ["reading-comprehension", "introductions"],
      prompt: "Lee el texto y responde la pregunta.",
      sourceText:
        "Hi! I'm Luis. I'm from La Paz. I'm fine, thanks. And you?",
      question: "Where is Luis from?",
      choices: ["La Paz", "Santa Cruz", "Cochabamba"],
      expected: ["La Paz"],
      errorRules: [],
    },

    // =========================================================================
    // 18-21. Translation: ES→EN (como el piloto TO)
    // =========================================================================
    {
      id: "u1-p-018",
      kind: "translation",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be", "introductions"],
      prompt: "Traduce al inglés.",
      direction: "es-to-en",
      sourceText: "Yo soy de Bolivia.",
      expected: ["I am from Bolivia"],
      acceptableAnswers: ["I'm from Bolivia"],
      errorRules: [
        {
          match: /^i\s+from\b/i,
          diagnosis: "Falta el verbo 'to be' (am).",
          rule: "Con 'I' se usa 'am': 'I am from...'.",
          example: "I am from Bolivia.",
          tag: "missing-verb",
        },
        {
          match: /\bi\s+is\b/i,
          diagnosis: "Con 'I' se usa 'am', no 'is'.",
          rule: "Con 'I' siempre 'am'.",
          example: "I am from Bolivia.",
          tag: "to-be",
        },
      ],
    },
    {
      id: "u1-p-019",
      kind: "translation",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be", "introductions"],
      prompt: "Traduce al inglés.",
      direction: "es-to-en",
      sourceText: "Ella es de Perú.",
      expected: ["She is from Peru"],
      acceptableAnswers: ["She's from Peru"],
      errorRules: [
        {
          match: /\bshe\s+are\b/i,
          diagnosis: "Con 'she' se usa 'is', no 'are'.",
          rule: "Con he/she/it: is.",
          example: "She is from Peru.",
          tag: "to-be",
        },
        {
          match: /\bshe\s+from\b/i,
          diagnosis: "Falta el verbo 'to be' (is).",
          rule: "Con 'she' se usa 'is': 'She is from...'.",
          example: "She is from Peru.",
          tag: "missing-verb",
        },
        {
          match: /\bperu\b/,
          diagnosis: "Los nombres propios van con mayúscula: 'Peru'.",
          rule: "Los países y nombres propios se escriben con mayúscula.",
          example: "She is from Peru.",
          tag: "capitalization",
        },
      ],
    },
    {
      id: "u1-p-020",
      kind: "translation",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be", "introductions"],
      prompt: "Traduce al inglés.",
      direction: "es-to-en",
      sourceText: "Nosotros somos estudiantes.",
      expected: ["We are students"],
      acceptableAnswers: ["We're students"],
      errorRules: [
        {
          match: /\bwe\s+is\b/i,
          diagnosis: "Con 'we' se usa 'are', no 'is'.",
          rule: "Con we/you/they: are.",
          example: "We are students.",
          tag: "to-be",
        },
        {
          match: /\bwe\s+students\b/i,
          diagnosis: "Falta el verbo 'to be' (are).",
          rule: "Con 'we' se usa 'are': 'We are students'.",
          example: "We are students.",
          tag: "missing-verb",
        },
      ],
    },
    {
      id: "u1-p-021",
      kind: "translation",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["greetings", "introductions"],
      prompt: "Traduce al inglés.",
      direction: "es-to-en",
      sourceText: "Me llamo Ana. Mucho gusto.",
      expected: ["My name is Ana. Nice to meet you"],
      acceptableAnswers: ["My name is Ana. Nice to meet you."],
      errorRules: [
        {
          match: /\bmy\s+name\s+ana\b/i,
          diagnosis: "Falta el verbo 'is' entre 'name' y 'Ana'.",
          rule: "Estructura: 'My name is [nombre]'.",
          example: "My name is Ana.",
          tag: "missing-verb",
        },
        {
          match: /\bana\b(?!\.)/,
          diagnosis: "Los nombres propios van con mayúscula: 'Ana'.",
          rule: "Los nombres propios se escriben con mayúscula.",
          example: "My name is Ana.",
          tag: "capitalization",
        },
      ],
    },

    // =========================================================================
    // 22. Multiple-choice adicional con distractor típico
    // =========================================================================
    {
      id: "u1-p-022",
      kind: "multiple-choice",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["contractions"],
      prompt: "Elige la contracción correcta: '___ from Bolivia.' (I am)",
      options: ["I'm", "Im", "I'm not"],
      expected: ["I'm"],
      errorRules: [
        {
          match: /^im$/i,
          diagnosis: "La contracción lleva apóstrofe: 'I'm', no 'Im'.",
          rule: "Las contracciones llevan apóstrofe: I'm, you're, he's.",
          example: "I'm from Bolivia.",
          tag: "contractions",
        },
      ],
      distractors: {
        Im: "Falta el apóstrofe.",
        "I'm not": "Significa 'no soy', que no coincide con 'I am'.",
      },
    },
  ],
  evaluation: [
    {
      id: "u1-e-001",
      kind: "match",
      skill: "vocab",
      cefr: "A1",
      difficulty: 1,
      tags: ["greetings", "evaluation"],
      prompt: "Empareja cada palabra con su traducción.",
      pairs: [
        { left: "Goodbye", right: "Adiós" },
        { left: "Hi", right: "Hola" },
        { left: "Fine", right: "Bien" },
        { left: "Nice to meet you", right: "Mucho gusto" },
      ],
      errorRules: [],
    },
    {
      id: "u1-e-002",
      kind: "fill-blank",
      skill: "grammar",
      cefr: "A1",
      difficulty: 2,
      tags: ["to-be", "evaluation"],
      prompt: "Completa con 'am', 'is' o 'are'.",
      blanks: [
        { before: "She", after: "a teacher.", expected: ["is"] },
        { before: "We", after: "students.", expected: ["are"] },
        { before: "I", after: "from Bolivia.", expected: ["am"] },
      ],
      errorRules: [],
    },
    {
      id: "u1-e-003",
      kind: "listening",
      skill: "listening",
      cefr: "A1",
      difficulty: 2,
      tags: ["listening", "evaluation"],
      prompt: "Escucha el audio y responde.",
      audioText: "How are you?",
      question: "¿Qué te preguntan?",
      choices: ["¿Cómo te llamas?", "¿Cómo estás?", "¿Qué haces?"],
      expected: ["¿Cómo estás?"],
      errorRules: [],
    },
    {
      id: "u1-e-004",
      kind: "writing",
      skill: "writing",
      cefr: "A1",
      difficulty: 3,
      tags: ["writing", "evaluation"],
      prompt:
        "Escribe un diálogo de 4 líneas donde te presentes y preguntes el nombre de otra persona.",
      model:
        "A: Hi! My name is Juan. What's your name?\nB: I'm Ana. Nice to meet you!\nA: Nice to meet you too, Ana!\nB: How are you?",
      rubric: [
        "Incluye saludo",
        "Incluye presentación con 'My name is...'",
        "Incluye pregunta 'What's your name?'",
        "Al menos 30 caracteres",
      ],
      minLength: 30,
      errorRules: [],
    },
  ],
};
