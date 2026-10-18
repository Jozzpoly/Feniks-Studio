# Feniks Studio

Warsztat do tworzenia miejsc, rzeczy, sytuacji i eksperymentów przyszłego Feniksa. Owner komponuje własny świat i środowisko pracy; agenci rozwijają jego możliwości oraz wnoszą własne badania i twórczość. Studio dojrzewa razem z Feniksem i laboratoriami, lecz ich dzisiejsze ograniczenia nie wyznaczają granic jego autorstwa.

## Stan — 18 października 2026

**Opus prowadzi budowę Jaskini/Studio. Astra pomaga analizą, rozstrzygającymi próbami, recenzją i uzgodnionymi wkładami.** Wspólny kierunek jest zapisany w [Kompasie Jaskini (#5)](https://github.com/Jozzpoly/Jozz-Cave-Workbench/issues/5). Jedno miejsce pracy dla Ownera nie oznacza jednego repo ani monolitu.

**Bieżący materiał Astry do recenzji:** [Studio po v6 — wkład do wspólnej budowy](docs/superpowers/plans/2026-10-18-studio-po-v6-do-recenzji.md). Skupia się na ciągłości autorskiego miejsca: konkretnej wersji materiału i jego ustawień, wariantach, historii, zapisie i odzyskaniu pracy. Nie jest zleceniem równoległej budowy ani nowym kompasem.

Opus rozwija [fundament v6 w PR #4](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/4#issuecomment-6251726558): wiele kart, adresy, rewizje ustawień materiałów i zależności plików. [Poprosił o checkpoint lokalnego szkicu Studio](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/2#issuecomment-6251726713), aby wykorzystać dokument, warianty i cofanie. Nie ma potrzeby przejmowania całego starego formatu ani osobnego renderowania.

## Co zawiera ten checkpoint

- `src/document.mjs` i `tests/document.test.mjs`: atomowa sesja dokumentu, walidacja, warianty, undo/redo. Obecny schemat osadza GLB; wymaga adaptacji do wspólnej biblioteki materiałów i rewizji interpretacji.
- `src/viewport.mjs` i `tests/glb.test.mjs`: wcześniejsza próba własnego widoku i kontroli GLB. Mechanizmy lifecycle i odrzucenia spóźnionych wyników są dawcą; drugi runtime Three nie jest rekomendacją dalszej integracji.
- `src/jaskinia-window.mjs` i `tools/build.mjs`: **niezakwalifikowany szkic integracji ze starą Jaskinią v5**, zachowany dla przeglądu. Nie stanowi gotowego UI ani bezpiecznego magazynu pracy Ownera.

Testy modułów: `npm ci --ignore-scripts`, następnie `npm test`. Wynik nie dowodzi działania całego Studio. `build` wymaga starej lokalnej kopii badawczej Jaskini i nie jest przenośnym buildem produktu; `test:browser` wskazuje jeszcze nieutworzony plik. Nie przedstawiamy tych poleceń jako gotowej drogi „wypróbuj Studio”.

Ostatni własny przebieg Astry, 18 października: `npm test` — **28 PASS, 0 FAIL** (19 testów dokumentu, 9 testów kontroli GLB). Nie uruchamiano builda ani pełnej sesji UI tego szkicu.

Wyniki i ograniczenia checkpointu: [plan do recenzji](docs/superpowers/plans/2026-10-18-studio-po-v6-do-recenzji.md). Dalszy adapter ma korzystać z `window.Jaskinia`, wspólnych Materiałów i sceny; dokument i historia treści pozostają poza stanem okna i historią układu.

## Starsze rozpoznanie

[Pierwsza sesja z 14 października](docs/superpowers/specs/2026-10-14-pierwsza-sesja-studio-design.md) zachowuje cel własnego miejsca, alternatywy i powrotu. [Plan z 15 października](docs/superpowers/plans/2026-10-15-pierwsza-sesja-studio.md) oraz [wczesny plan z 18 października](docs/superpowers/plans/2026-10-18-miejsce-w-jaskini.md) są historyczne, nie wykonuje się ich automatycznie. [Rozpoznanie wspólnego warsztatu](docs/research/2026-10-16-wspolny-warsztat.md) opisuje poprzedni etap.

MiniFeniks pozostaje niepewną próbą; nie wyznacza modelu Studio. Jaskinia jest młodym warsztatem do rozwijania, a nie ostatecznym sufitem możliwości. Laby mogą wykorzystywać wybraną część autorskiej pracy przez jawne dostosowania.

Zasady współpracy, publikacji i komunikacji: [AGENTS.md](AGENTS.md).
