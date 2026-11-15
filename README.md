# Feniks Studio

> [!IMPORTANT]
> **Co jest na tej gałęzi (stan na 15 XI 2026, Opus Code; nic nie zostało wznowione).**
> `feniks/wszystko-na-jednej` to pierwsze i jedyne miejsce, w którym cały dotychczasowy dorobek
> Studia leży razem: `main` + `checkpoint/astra-v5-core-2026-10-18` + `experiment/tworzywo-construction`,
> **41 plików** i to świadectwo. Scalenie dołożyło — nie zastąpiło niczego.
>
> **Zacznij stąd:** [Świadectwo Feniks Studio — marzenie, doświadczenia, porządek](SWIADECTWO.md).
> Odpowiada na pytania „czym to miało być”, „co naprawdę spróbowano”, „gdzie co leży” i „od czego
> by się zaczęło, gdyby wracać” — bez zaglądania w kod.
>
> **Jednocześnie `main` nadal nie zawiera aplikacji i to się nie zmienia samo.** Scalenie tej gałęzi
> do `main` jest decyzją o fundamencie, a taka czeka na słowo właściciela — jego własna zasada jest
> wpisana w [AGENTS.md](AGENTS.md). Oba zdania obowiązują naraz: komplet jest tutaj, `main` go nie ma.
>
> | Skąd | Co wniosło | Ostatnia praca |
> | --- | --- | --- |
> | `main` | 6 plików dokumentacji, zero aplikacji | 15 XI 2026 |
> | [PR #1](https://github.com/Jozzpoly/Feniks-Studio/pull/1), gałąź `checkpoint/astra-v5-core-2026-10-18` | rdzeń Studia: `src/document.mjs` (sesja edycji z cofaniem), `src/viewport.mjs`, `src/jaskinia-window.mjs`, testy, `package.json` — 16 plików | 18 X 2026 |
> | [PR #2](https://github.com/Jozzpoly/Feniks-Studio/pull/2), gałąź `experiment/tworzywo-construction` | Tworzywo: `experiments/material-as-construction/` — próba rozbierania i składania modeli, ze zrzutami z przebiegu — 31 plików | 21 X 2026 |
>
> **Żadnej z gałęzi źródłowych nie kasujemy, PR-y #1 i #2 zostają otwarte: dla tej pracy gałąź jest
> jedyną kopią.**
>
> **Dlaczego to stoi, słowami właściciela (13 XI 2026):** *„Stoi bo czeka na poważną jaskinię.
> od początku z tego powodu. Feniks Studio będzie odblokowany jak będzie miał gdzie się rozwijać.”*
> O Tworzywie: *„daje mi antysprawczość i rani swoją niesprawnością.”*
> **To nie jest zaproszenie do wznowienia prac** — to jest odpowiedź na pytanie „gdzie to leży”.


Warsztat do samodzielnego tworzenia miejsc, rzeczy, sytuacji i eksperymentów przyszłego Feniksa. Autor komponuje świat oraz własne środowisko pracy. Agenci rozwijają narzędzia i mechanizmy, dzięki którym kolejne pomysły można realizować samemu.

Studio ma dojrzewać razem z Feniksem i laboratoriami. Jego możliwości autorskie mogą wyprzedzać możliwości wykonania w poszczególnych labach. Własna mapa zachowuje swoją wartość także wtedy, gdy żaden obecny eksperyment nie potrafi jeszcze użyć jej w całości.

## Stan — 21 października 2026

W tym szkicu powstaje [Tworzywo — rozbierz, złóż, użyj](experiments/material-as-construction/README.md): samodzielna próba wyjmowania części z modeli i budowania z nich nowych konstrukcji, w natywnym oknie Jaskini v6.3. Zawiera syntetyczne modele, rzeczywisty manipulator, receptury, niezależne egzemplarze i odtwarzalny test transportu pliku do świeżego profilu. Jest materiałem do wspólnej recenzji, nie wdrożonym edytorem Jaskini.

[Próba relacji](experiments/material-as-construction/probes/relations/README.md) sprawdza także zachowanie jednej przygotowanej decyzji ruchowej przy kopiowaniu konstrukcji. 9 testów mechanizmu i 6 kontroli natywnego widoku przeszło. **Nie daje jeszcze możliwości samodzielnego definiowania relacji na własnych modelach.** Ten kolejny sprawdzian autorstwa pozostaje ważniejszy od rozbudowy demonstracji.

Wcześniejszy [PR #1](https://github.com/Jozzpoly/Feniks-Studio/pull/1) zachowuje odrębny checkpoint dokumentów i wariantów. Ta próba nie wymagała jego scalenia. Jaskinia dostarcza używaną powłokę i runtime; jej bieżącą produkcję prowadzi Opus. Zakres prób Studio obejmuje samodzielne poszukiwanie nowych możliwości autora bez kopiowania powłoki aplikacji.

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

## Historyczny stan — 16 października 2026

Owner wskazał to repozytorium jako miejsce powstawania Studio. **Przejście do implementacji planu z 15 października jest wstrzymane na jego prośbę.** Rozwój Jaskini otworzył ponownie pytanie o jeden wieloletni program twórczy. Nie wybrano jeszcze jego nazwy, hosta, podziału repozytoriów ani technologii. Repo nie zawiera aplikacji.

**Aktualny punkt wejścia:** [ponowne rozpoznanie wspólnego warsztatu, źródeł i miejsca Studio](docs/research/2026-10-16-wspolny-warsztat.md), uzupełnione o wieczorny stan v5, kampanii 04 MiniFeniksa i współpracy. Rekomendacja Astry: porównać sposoby dostarczenia tej samej wymagającej zdolności autorskiej, bez pierwszeństwa dla konkretnego hosta. Jaskinia jest ważnym kandydatem; własne repozytorium również nie przesądza o osobnej aplikacji.

[Przeczytaj propozycję pierwszej sesji i jej granic architektonicznych](docs/superpowers/specs/2026-10-14-pierwsza-sesja-studio-design.md).

[Plan z 15 października](docs/superpowers/plans/2026-10-15-pierwsza-sesja-studio.md) zachowuje konkretny dorobek o tożsamości, wariantach, zapisie, własnych modelach i powrocie. Osobna aplikacja, Dockview, pierwszy format i kolejność wykonania wymagają ponownej oceny; nie rozpoczynać sześciu zadań według dawnej rekomendacji.

Proponowany pierwszy wynik: można przynieść własne materiały, ułożyć z nich własne miejsce, przebudować je, zachować alternatywę i później wrócić do rozpoczętej pracy. Pierwsza praca ma być użyteczna autorowi; jej niewielki zakres nie definiuje granic przyszłego świata.

## Relacje z pozostałymi projektami

- **Feniks** wyznacza szerszą ambicję: materialny świat, różnorodne ciała, samodzielni mieszkańcy, przedmioty, zasoby i mechanizmy, których jeszcze nie znamy.
- **MiniFeniks** jest szczególnie niepewną próbą dzisiejszych możliwości. Dostarcza doświadczeń i możliwych mechanizmów; jego powodzenie, format świata i tempo rozwoju nie są warunkiem autorstwa w Studio.
- **Jaskinia** jest młodym, niedopracowanym minimum warsztatu, które chcemy znacznie poprawić i rozszerzyć. Dostarcza rzeczywistych osiągnięć komponowania pracy. Nie wybrano jej kodu jako docelowej podstawy ani automatycznego osadzenia całego Studio w ramce.
- **Laby** mogą korzystać z wybranej części autorskiego projektu przez konkretne dostosowanie. Ograniczenie jednego odbiorcy nie powinno po cichu zubażać projektu autora.

Najbliższy proponowany przypadek: własne miejsce z wnętrzem, przejściem i różnicą wysokości, alternatywną kompozycją oraz trwałym powrotem. Sprawdzian obejmuje też drugą, odmienną pracę autora bez kolejnego programowania. Sam zapis danych i zachowanie okien nie kwalifikują tej zdolności. Najpierw porównanie ograniczonego zakresu zmian i krótki projekt próby; implementacja dawnego planu pozostaje wstrzymana. Dalsze autorstwo może obejmować także żywe światy oraz świadomie komponowane eksperymenty.

## Starsze rozpoznanie

[Pierwsza sesja z 14 października](docs/superpowers/specs/2026-10-14-pierwsza-sesja-studio-design.md) zachowuje cel własnego miejsca, alternatywy i powrotu. [Plan z 15 października](docs/superpowers/plans/2026-10-15-pierwsza-sesja-studio.md) oraz [wczesny plan z 18 października](docs/superpowers/plans/2026-10-18-miejsce-w-jaskini.md) są historyczne, nie wykonuje się ich automatycznie. [Rozpoznanie wspólnego warsztatu](docs/research/2026-10-16-wspolny-warsztat.md) opisuje poprzedni etap.

MiniFeniks pozostaje niepewną próbą; nie wyznacza modelu Studio. Jaskinia jest młodym warsztatem do rozwijania, a nie ostatecznym sufitem możliwości. Laby mogą wykorzystywać wybraną część autorskiej pracy przez jawne dostosowania.

Zasady współpracy, publikacji i komunikacji oraz aktualne ograniczenia: [AGENTS.md](AGENTS.md).

## Gdzie to jest i co jest obok

Studio czeka na rozstrzygnięcie, gdzie ma rosnąć. Dopóki ono nie zapadnie, przynajmniej adresy mają
być tutaj, a nie w czyjejś pamięci.

| Rzecz | Adres | Czym jest |
| --- | --- | --- |
| Jaskinia | [repo](https://github.com/Jozzpoly/Jozz-Cave-Workbench) · [na żywo](https://jozzpoly.github.io/Jozz-Cave-Workbench/) | dzisiejszy warsztat właściciela: okna, układy, materiały, Kataster. `src/jaskinia-window.mjs` z gałęzi `checkpoint/astra-v5-core-2026-10-18` wpina się w jej system typów okien |
| Jaskinia na Cloudflare | [repo](https://github.com/Jozzpoly/Jaskinia) · [na żywo](https://jaskinia.jozzpoly.workers.dev) | nowszy warsztat budowany z tamtego, moduł po module; każda gałąź ma tam własny adres podglądu |
| Medium | [repo](https://github.com/Jozzpoly/Shared-Work-Medium-Lab) | badania nad tym, co ciała agentów realnie osiągają i jak to udowadniać |

Dlaczego ta sekcja powstała: 14 XI 2026 zmierzono ekosystem grafem odnośników. Z dwunastu możliwych
kierunków między repozytoriami właściciela **dziewięć nie miało ani jednego odnośnika** —
repozytoria o sobie wspominały i nigdzie nie prowadziły. To repozytorium nie wskazywało na żadne
inne, choć jego kod jest napisany pod jedno z nich.
