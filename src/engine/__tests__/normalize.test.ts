import { describe, it, expect } from "vitest";
import { normalize, matchesAny, findMatch, similarity } from "../normalize";

describe("normalize()", () => {
  describe("casos básicos", () => {
    it("no modifica un texto ya normalizado", () => {
      expect(normalize("i go home")).toBe("i go home");
    });

    it("hace lowercase", () => {
      expect(normalize("Hello")).toBe("hello");
      expect(normalize("HELLO")).toBe("hello");
      expect(normalize("HeLLo")).toBe("hello");
    });

    it("hace trim de espacios externos", () => {
      expect(normalize("  hello  ")).toBe("hello");
    });

    it("colapsa espacios múltiples internos", () => {
      expect(normalize("I   go    home")).toBe("i go home");
    });

    it("colapsa tabs y saltos de línea", () => {
      expect(normalize("I\tgo\nhome")).toBe("i go home");
      expect(normalize("I\t\tgo\r\nhome")).toBe("i go home");
    });

    it("colapsa NBSP (non-breaking space)", () => {
      expect(normalize("I\u00A0go\u00A0home")).toBe("i go home");
    });

    it("es idempotente", () => {
      const inputs = ["Hello", "  I  go  ", "I'm fine.", "She's happy!"];
      for (const input of inputs) {
        const once = normalize(input);
        const twice = normalize(once);
        expect(twice).toBe(once);
      }
    });
  });

  describe("puntuación final", () => {
    it("elimina punto final", () => {
      expect(normalize("I go home.")).toBe("i go home");
    });

    it("elimina coma final", () => {
      expect(normalize("Hello,")).toBe("hello");
    });

    it("elimina exclamación final", () => {
      expect(normalize("Hello!")).toBe("hello");
    });

    it("elimina interrogación final", () => {
      expect(normalize("How are you?")).toBe("how are you");
    });

    it("elimina punto y coma y dos puntos finales", () => {
      expect(normalize("Hello;")).toBe("hello");
      expect(normalize("Hello:")).toBe("hello");
    });

    it("elimina puntos suspensivos finales", () => {
      expect(normalize("Hello…")).toBe("hello");
      expect(normalize("Hello...")).toBe("hello");
    });

    it("elimina combinaciones de puntuación final", () => {
      expect(normalize("Really?!")).toBe("really");
      expect(normalize("Wait...!")).toBe("wait");
    });

    it("NO elimina puntuación en medio de la frase", () => {
      expect(normalize("Hello, my friend")).toBe("hello, my friend");
      expect(normalize("Wait: I need to go")).toBe("wait: i need to go");
    });
  });

  describe("apóstrofes Unicode", () => {
    it("unifica apóstrofe recto ASCII", () => {
      expect(normalize("I'm")).toBe("i'm");
    });

    it("unifica apóstrofe tipográfico izquierdo U+2018", () => {
      expect(normalize("I\u2018m")).toBe("i'm");
    });

    it("unifica apóstrofe tipográfico derecho U+2019", () => {
      expect(normalize("I\u2019m")).toBe("i'm");
    });

    it("unifica acento grave (backtick)", () => {
      expect(normalize("I`m")).toBe("i'm");
    });

    it("unifica acento agudo", () => {
      expect(normalize("I\u00B4m")).toBe("i'm");
    });

    it("unifica modificador letra prima U+02B9", () => {
      expect(normalize("I\u02B9m")).toBe("i'm");
    });

    it("unifica letra modificadora apóstrofe U+02BC", () => {
      expect(normalize("I\u02BCm")).toBe("i'm");
    });

    it("unifica modificador letra doble prima U+02BD", () => {
      expect(normalize("I\u02BDm")).toBe("i'm");
    });

    it("unifica prima U+2032", () => {
      expect(normalize("I\u2032m")).toBe("i'm");
    });

    it("todos los apóstrofes producen el mismo resultado", () => {
      const variants = [
        "I'm",
        "I\u2018m",
        "I\u2019m",
        "I`m",
        "I\u00B4m",
        "I\u02B9m",
        "I\u02BCm",
        "I\u02BDm",
        "I\u2032m",
        "I\u2035m",
      ];
      for (const n of variants.map(normalize)) {
        expect(n).toBe("i'm");
      }
    });
  });

  describe("comillas dobles Unicode", () => {
    it("unifica comillas curvas a ASCII", () => {
      expect(normalize('He said "hello"')).toBe('he said "hello"');
      expect(normalize("He said \u201Chello\u201D")).toBe('he said "hello"');
    });
  });

  describe("guiones", () => {
    it("unifica guion largo a simple", () => {
      expect(normalize("well-known")).toBe("well-known");
      expect(normalize("well\u2013known")).toBe("well-known");
      expect(normalize("well\u2014known")).toBe("well-known");
    });
  });

  describe("acentos", () => {
    it("NO elimina acentos (son errores reales en inglés)", () => {
      expect(normalize("está")).toBe("está");
      expect(normalize("está")).not.toBe(normalize("esta"));
    });

    it("NO modifica la ñ", () => {
      expect(normalize("año")).toBe("año");
      expect(normalize("ano")).not.toBe(normalize("año"));
    });
  });

  describe("casos reales del HTML TO", () => {
    it("I go to work by bus = I go to work by bus.", () => {
      expect(normalize("I go to work by bus.")).toBe(
        normalize("I go to work by bus")
      );
    });

    it("i go to work by bus = I go to work by bus", () => {
      expect(normalize("i go to work by bus")).toBe(
        normalize("I go to work by bus")
      );
    });

    it("I'm fine = I'm fine. = I`m fine", () => {
      const expected = normalize("I'm fine");
      expect(normalize("I'm fine.")).toBe(expected);
      expect(normalize("I'm fine")).toBe(expected);
      expect(normalize("I`m fine")).toBe(expected);
      expect(normalize("I\u2019m fine")).toBe(expected);
    });

    it("She's happy! = She's happy", () => {
      expect(normalize("She's happy!")).toBe(normalize("She's happy"));
    });

    it("want to learn ≠ want learn", () => {
      expect(normalize("I want to learn")).not.toBe(normalize("I want learn"));
    });
  });

  describe("errores de tipo", () => {
    it("lanza TypeError si no es string", () => {
      expect(() => normalize(null as unknown as string)).toThrow(TypeError);
      expect(() => normalize(undefined as unknown as string)).toThrow(TypeError);
      expect(() => normalize(123 as unknown as string)).toThrow(TypeError);
    });
  });
});

describe("matchesAny()", () => {
  it("acepta una sola respuesta esperada", () => {
    expect(matchesAny("I go home.", "I go home")).toBe(true);
  });

  it("acepta array de respuestas esperadas", () => {
    expect(matchesAny("I go home", ["I go home", "I go to home"])).toBe(true);
  });

  it("acepta variantes adicionales con acceptable", () => {
    expect(
      matchesAny(
        "I take the bus to work",
        "I go to work by bus",
        ["I take the bus to work"],
      ),
    ).toBe(true);
  });

  it("rechaza respuestas que no coinciden", () => {
    expect(matchesAny("I go home", "I go to work")).toBe(false);
  });

  it("rechaza si hay diferencia de palabras", () => {
    expect(matchesAny("I want learn", "I want to learn")).toBe(false);
  });

  it("acepta con apóstrofes mezclados", () => {
    expect(matchesAny("I`m fine", "I'm fine")).toBe(true);
    expect(matchesAny("I'm fine", "I\u2019m fine")).toBe(true);
  });

  it("acepta con mayúscula inicial distinta", () => {
    expect(matchesAny("hello", "Hello")).toBe(true);
  });
});

describe("findMatch()", () => {
  it("devuelve la respuesta canónica si coincide", () => {
    expect(findMatch("I go home.", "I go home")).toBe("I go home");
  });

  it("devuelve la variante aceptada si coincide con ella", () => {
    expect(
      findMatch("I take the bus", "I go by bus", ["I take the bus"]),
    ).toBe("I take the bus");
  });

  it("devuelve null si no coincide con ninguna", () => {
    expect(findMatch("I go home", "I go to work")).toBeNull();
  });

  it("respeta el orden: primera coincidencia gana", () => {
    expect(findMatch("hello", ["hello", "hi"])).toBe("hello");
    expect(findMatch("hi", ["hello", "hi"])).toBe("hi");
  });
});

describe("similarity()", () => {
  it("devuelve 1 para textos idénticos", () => {
    expect(similarity("hello", "hello")).toBe(1);
    expect(similarity("Hello.", "hello")).toBe(1);
  });

  it("devuelve 0 para textos totalmente distintos", () => {
    expect(similarity("abc", "xyz")).toBe(0);
  });

  it("devuelve valores intermedios para textos parecidos", () => {
    const sim = similarity("I want learn", "I want to learn");
    expect(sim).toBeGreaterThanOrEqual(0.8);
    expect(sim).toBeLessThan(1);
  });

  it("escasez de match en respuesta casi correcta", () => {
    const sim = similarity("I go to work", "I go to walk");
    expect(sim).toBeGreaterThan(0.8);
  });

  it("devuelve 0 si alguno es vacío", () => {
    expect(similarity("", "hello")).toBe(0);
    expect(similarity("hello", "")).toBe(0);
    expect(similarity("", "")).toBe(0);
  });
});

