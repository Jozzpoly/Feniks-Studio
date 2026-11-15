# Świadectwo Feniks Studio — marzenie, doświadczenia, porządek

**Stan na 15 listopada 2026. Spisał Opus Code na gałęzi `feniks/wszystko-na-jednej`.**

To jest dokument wejściowy dla kogoś, kto nigdy nie widział Feniks Studio: agenta albo człowieka,
który dostał ten adres i ma zrozumieć, czym to miało być, co naprawdę spróbowano, gdzie co leży
i od czego by się zaczęło, **gdyby** kiedyś wracać.

**Nic tu nie jest wznowione, obiecane ani gotowe.** Repozytorium stoi, bo tak zdecydował właściciel.
Ten dokument niczego nie uruchamia i nie prosi o decyzję.

---

## Na skróty — cztery odpowiedzi w minutę

1. **Marzenie.** Właściciel ma sam tworzyć miejsca, rzeczy, mapy i ich wygląd, i sam je potem
   przebudowywać — bez proszenia agenta o każdą czynność. Studio miało być jego warsztatem,
   wyprzedzającym możliwości dzisiejszych labów. [Szerzej →](#1-marzenie)
2. **Doświadczenia.** Powstały dwie niezależne próby (październik 2026): **checkpoint rdzenia
   dokumentu** i **Tworzywo — rozbieranie i składanie modeli w oknie Jaskini**. Obie mają zielone
   testy modułów. **Żadna nigdy nie stała się czymś, czego właściciel mógłby użyć**, i on sam
   ocenił je negatywnie. [Szerzej →](#2-doświadczenia)
3. **Porządek.** 41 plików na tej gałęzi: 5 dokumentów intencji, 10 plików rdzenia, 25 plików
   eksperymentu, 1 plik tego świadectwa. **Żaden z nich nie jest fundamentem — fundamentu nikt nie
   zbudował.** [Szerzej →](#3-porządek)
4. **Gdyby wracać.** Zacząć od jednego sprawdzianu, który rozstrzyga o swobodzie autora, a nie od
   powłoki, planu ani formatu. [Szerzej →](#4-gdyby-wracać)

---

## 1. Marzenie

### 1.1. Jego własne słowa

To są jedyne cytaty, przy których wiem, że to **jego zdania**, a nie nasze streszczenie. Każdy ma
podane miejsce, w którym jest zapisany.

> **ok. 10 listopada 2026, wieczorem** (rozmowa z Opusem, tura 153; datę podaje raport odcinka
> tur 150–164 — sam zapis rozmowy nie ma godzin). Przytoczone w [AGENTS.md](AGENTS.md):
>
> *„Istotne nieodwracalne decyzje dotyczące mojego dorobku, prywatności, dostępu, pieniędzy
> i rzeczywistego przełączenia używanej Jaskini”* — to są rzeczy, które zostają przy nim.

> **13 listopada 2026.** Przytoczone w [README.md](README.md):
>
> *„Stoi bo czeka na poważną jaskinię. od początku z tego powodu. Feniks Studio będzie odblokowany
> jak będzie miał gdzie się rozwijać.”*
>
> O Tworzywie: *„daje mi antysprawczość i rani swoją niesprawnością.”*

> **14 listopada 2026, 23:46.** Przytoczone w [AGENTS.md](AGENTS.md) — zasada, na jakich warunkach
> agenci scalają sami:
>
> *„Agenci scalają swoje pr gdy CI jest zielone i druga linia sprawdziła je u źródła.
> Pr który który mówi, że sam jest dowodem albo decyzja o fundamencie, scalają tylko po mojej
> zgodzie, wystarczy tylko »tak«, albo inny synonim zgody lub potwierdzenia.”*
>
> Zaraz potem: *„Nie jestem pewny czy to wystarczy na dłużej ale jakby co to będziemy budować
> lepsze wersję w przyszłości.”*

> **15 listopada 2026**, zlecenie, z którego powstał ten dokument (zapisane z jego literówkami):
>
> *„Co gdybym z osobnym agentem jakoś to ogarnął i zmieścił na jedną gałąź?
> Tam nic dobrego nie ma jeśli chodzi o próby wykonania:p
> Najwaazmiwksze jest mazenie, doświadczenia I porządek aby to w przyszłości można było spróbować
> wykonać poprawnie i wedle moich ambicji.”*

**To ostatnie zdanie jest instrukcją dla tego dokumentu.** Liczy się marzenie, doświadczenie
i porządek. Kod jest materiałem na świadectwo, nie dorobkiem do ratowania.

### 1.2. Jak agenci zapisali to marzenie w październiku

Poniższe zdania pochodzą z dokumentów w tym repozytorium. **Napisała je agentka (Astra), nie
właściciel** — są jej odczytem jego potrzeb. Czytaj je jako intencję zapisaną przez agenta, nawet
tam, gdzie w plikach stoją w cudzysłowie.

**14 X 2026 — [projekt pierwszej sesji](docs/superpowers/specs/2026-10-14-pierwsza-sesja-studio-design.md)**
(status w pliku: *propozycja do oceny*):

- Właściciel chce sam tworzyć mapę, miejsca, rzeczy i ich wygląd oraz eksperymentować z tym, co się
  w świecie dzieje. Agenci mają dostarczać mechanizmy. **Ważnym wynikiem ich pracy jest to, że
  następną podobną czynność da się wykonać bez zlecania jej agentowi.**
- Grafika powstaje poza Studio. Tutaj ma być łatwo przynieść własne materiały, złożyć z nich
  autorskie miejsce i rozumieć skutki zmian.
- **Mapa i edytor mają wyprzedzać obecne laby.** Studio ma zachować sens, gdy MiniFeniks się
  zatrzyma, zmieni kierunek albo zostanie zastąpiony.
- Konkretna pierwsza sesja: *własne miejsce z wnętrzem, przejściem i różnicą wysokości* — złożyć je,
  przebudować, zachować wariant alternatywny, zamknąć program i wrócić następnego dnia do swojej
  pracy **razem z układem warsztatu**.
- Tam też jest **definicja porażki**, najcenniejsze zdanie całego zbioru:
  *kolejne rozmieszczenie wymaga programisty; własne zasoby pozostają ozdobą demonstracji; wariant
  ginie; warsztat wraca pusty; nowy lab wymusza zubożenie źródłowej mapy.* Liczba edytorów, testów
  ani stron dokumentacji tego nie znosi.

**15 X 2026 — [plan wykonania](docs/superpowers/plans/2026-10-15-pierwsza-sesja-studio.md)**
(status w pliku: *wstrzymany 16 X na bezpośrednią prośbę właściciela*): osobna aplikacja,
TypeScript/React/Three/Dockview, IndexedDB, ZIP, sześć zadań. **Nigdy nie wykonany.**

**16 X 2026 — [rozpoznanie wspólnego warsztatu](docs/research/2026-10-16-wspolny-warsztat.md)**:
Astra cofa własną rekomendację osobnej aplikacji i pisze, że najpierw trzeba wybrać **pierwszą
wymagającą zdolność autorską** i uczciwie porównać koszt jej dostarczenia, zanim wybierze się
miejsce, w którym Studio ma żyć. Pada tam zdanie, które dalej obowiązuje:
*przechowywanie poprawnego JSON nie kwalifikuje edytora.*

**18 X 2026 — [wkład Astry po v6](docs/superpowers/plans/2026-10-18-studio-po-v6-do-recenzji.md)**:
podział pracy — budowę prowadzi Opus, Astra dostarcza analizy i próby. Rekomendacja: własny dokument
Studia, **natywna powierzchnia w Jaskini**, jedna biblioteka materiałów. Ten sam dokument odrzuca
własny wcześniejszy schemat (GLB jako data URL, aktywny wariant w treści projektu, pełne snapshoty
z bajtami w historii) jako **nienadający się na kontrakt produktu**.

---

## 2. Doświadczenia

Spróbowano **dwóch rzeczy**, niezależnie od siebie, w ciągu jednego tygodnia października 2026.
Obie są na tej gałęzi. Obie mają zielone testy. Żadna nie dotarła do właściciela jako coś, czego
mógłby użyć.

### 2.1. Próba pierwsza: checkpoint rdzenia (PR #1, 18 X 2026)

Co to jest: `src/document.mjs` (atomowa sesja edycji — komenda albo przechodzi w całości, albo nie
zmienia nic; niemutowalne snapshoty; warianty; undo/redo), `src/viewport.mjs` (własny widok 3D na
Three.js), `src/jaskinia-window.mjs` + `tools/build.mjs` (szkic wpięcia w **Jaskinię v5**), testy,
`package.json`.

**Co z tego działa — sprawdzone dzisiaj, nie przepisane z opisu:**

| Co uruchomiłem 15 XI 2026 | Wynik |
| --- | --- |
| `node --test tests/document.test.mjs` | **19/19 PASS** |
| `node --test tests/glb.test.mjs` | **nie uruchamia się**: `Cannot find package 'three'` — potrzebny `npm install` |

**Czego nigdy nie osiągnięto, i to jest ważniejsze:**

- `npm run build` wymaga **lokalnej kopii badawczej starej Jaskini v5**, przypiętej do commita
  `96c2a1c`. Tej kopii nie ma w tym repozytorium i nikt jej tu nie dostarczy. Nie da się z tego
  zbudować niczego, co można obejrzeć.
- `npm run test:browser` wskazuje `tests/browser.mjs`. **Tego pliku nie ma** — w `tests/` są
  dokładnie dwa pliki. Polecenie było w `package.json`, zanim powstało to, co miało uruchamiać.
- Autorka sama opisała `src/jaskinia-window.mjs` i `tools/build.mjs` jako
  **„niezakwalifikowany szkic integracji ze starą Jaskinią v5, zachowany dla przeglądu”**, a cały
  schemat dokumentu wycofała trzy dni później we własnym planie po v6.
- Pełnej sesji UI **nigdy nie uruchomiono**. Opis PR #1 mówi to wprost: *„Testy modułów nie są
  potwierdzeniem działania Studio.”*

### 2.2. Próba druga: Tworzywo (PR #2, 19–21 X 2026)

Co to jest: natywne okno w **przypiętej Jaskini v6.3** (`dd47f325`), używające jej importera, sceny
i manipulatora. Zamysł: z gotowego modelu wyjąć balkon, zachować go jako **własną część**, wstawić
dwa egzemplarze i zmieniać je niezależnie. Plus osobna, mniejsza próba
[`probes/relations/`](experiments/material-as-construction/probes/relations/README.md) — czy
przygotowana relacja „klapa obraca się względem ramy” przeżyje skopiowanie i obrócenie konstrukcji.

**Co sprawdziłem dzisiaj:**

| Co uruchomiłem 15 XI 2026 | Wynik |
| --- | --- |
| `node --test experiments/material-as-construction/core.test.mjs` | **6/6 PASS** |
| `node --test …/probes/relations/carriage.test.mjs` | **9/9 PASS** |
| kontrole przeglądarkowe (20/20 i 6/6 z `verification.json`) | **nie odtwarzałem** — wymagają klonu cudzego repozytorium `Jozz-Cave-Workbench` przypiętego do `dd47f325`, Playwrighta i Chromium |

**Co zapisuje [`verification.json`](experiments/material-as-construction/verification.json)** — jedyny
pomiar z żywego okna, z 20 X 2026, Chromium 151:

- 20 kontroli, wszystkie PASS. Największy błąd współrzędnych przy trudnym przepięciu hierarchii:
  **2,66e-15** na 1062 współrzędnych. Przeniesienie pliku do czystego profilu odtworzyło
  **4914 współrzędnych bez różnicy**.
- Dwa błędy w konsoli są **celowymi odmowami** (osobliwa macierz, limit 100 zachowanych części) —
  nie są usterkami.
- Zakres, słowami samego pliku: *„Synthetic BB only… No Owner profile or production/full-suite
  qualification.”* **Żadnego modelu właściciela. Żadnej jego oceny.**
  Plik próby relacji dopisuje: *„desktop only; no Owner acceptance.”*

### 2.3. Cztery obrazy — jedyny wizualny zapis

To są jedyne cztery PNG-i w całym repozytorium. Opisuję, co na nich widać, i czego to dowodzi.
Nie dopowiadam za nie.

**1. [`01-source-models.png`](experiments/material-as-construction/01-source-models.png)** —
natywne okno Jaskini z drzewem części po lewej (Rama warsztatu, Balkon z podestem i balustradą,
Daszek), dwoma teksturowanymi modelami w scenie, manipulatorem na zaznaczeniu i figurką człowieka
dla skali; licznik na dole: **„39 elementów · 0 własnych części”**.
*Dowodzi:* import, drzewo części i manipulator działały w prawdziwym oknie — i że w tym momencie
autor nie miał jeszcze ani jednej własnej części.

**2. [`02-three-constructions.png`](experiments/material-as-construction/02-three-constructions.png)** —
to samo okno po złożeniu: w drzewie pojawił się **„Kram wędrowny”** z własnym balkonem, daszkiem
i szyldem, w panelu po prawej **„Twoje części: Kram wędrowny”** z przyciskami **Wstaw** i **Plik
części**, w scenie stoi nowa konstrukcja obok źródłowych modeli; licznik: **„69 elementów ·
1 własnych części”**.
*Dowodzi:* część wyjęta z cudzego modelu stała się nazwaną, zachowaną własną konstrukcją, którą
dało się wstawić do sceny — a model źródłowy pozostał nietknięty.

**3. [`03-restored-work.png`](experiments/material-as-construction/03-restored-work.png)** —
to samo okno po odtworzeniu pracy: drzewo pokazuje teraz **dwa** źródła (warsztat oraz „Mechaniczny
nosiciel” z tułowiem i sześcioma odłączanymi nogami), scena ma tę samą kompozycję, „Kram wędrowny”
dalej jest na liście własnych części, a przyciski Odłącz/Połącz/Zachowaj są wyszarzone, bo nic nie
jest zaznaczone; licznik nadal: **„69 elementów · 1 własnych części”**.
*Dowodzi:* praca razem z własną częścią wróciła z pliku w tym samym stanie liczbowym.

**4. [`relation-carriage.png`](experiments/material-as-construction/probes/relations/relation-carriage.png)** —
**inne, znacznie uboższe okno** (goła strona z listą „Kopia”, suwakiem 90°, przyciskami „Zmień oś
kopii” i „Sprawdź wyjęcie samej klapy”): trzy pomarańczowe klapy na szarych ramach, zielone
strzałki pokazujące oś względem ramy, trzecia para obrócona w scenie; na dole komunikat
*„Sama klapa nie zawiera ramy, względem której ją obracamy. Geometrię można wyjąć; zachowanie
relacji wymaga jawnej decyzji o jej drugim końcu.”*
*Dowodzi:* przygotowana relacja przeżyła skopiowanie i obrót egzemplarzy — i że wyjęcie samej klapy
tę relację traci. To jest **sprawdzian zachowania cudzej, już podjętej decyzji**, nie narzędzie,
którym autor mógłby taką relację sam zdefiniować.

### 2.4. Czego te próby nie osiągnęły — i co powiedział o nich właściciel

Właściciel 15 XI: *„Tam nic dobrego nie ma jeśli chodzi o próby wykonania”*.
**Mój pomiar mówi to samo i nie będę tego łagodził:**

- **Z tych 41 plików nie da się dziś uruchomić niczego, co właściciel mógłby zobaczyć.** Jedna
  ścieżka wymaga lokalnej kopii Jaskini v5, której nie ma; druga wymaga klonu cudzego repozytorium
  przypiętego do jednego commita sprzed miesiąca, plus Playwrighta i Chromium. Trzeciej nie ma.
- **Zielone testy mierzą moduły, nie warsztat.** 19 + 6 + 9 testów przechodzi — i nie wynika z nich
  nic o tym, czy autorowi wygodnie się pracuje. Obie próby mówią to o sobie same.
- **Właściciel nigdy tego nie używał.** W żadnym pliku nie ma jego oceny po realnym użyciu. Oba
  pliki weryfikacji jawnie to wykluczają ze swojego zakresu.
- Jego jedyna zapisana ocena produktu jest negatywna: o Tworzywie — *„daje mi antysprawczość
  i rani swoją niesprawnością”* (13 XI).
- Niezależne pressure-testy dopisane do PR #2 znalazły **realne granice**, nie drobiazgi: krótkie
  kliknięcie środkowym lub prawym przyciskiem myszy zmieniało zaznaczenie, choć gest miał służyć
  kamerze; **tożsamość części jest zapisana ścieżką w drzewie importera, więc samo przestawienie
  kolejności grup w Blockbenchu wskazuje 8/8 starych ścieżek na inną bryłę**; oś i pivot w Ruchu
  Jaskini v6.4 żyją w innym układzie odniesienia niż w próbie relacji, więc przepisanie ich wprost
  nie odtwarza tego samego ruchu.
- Najtwardsza obserwacja jest w komentarzu z 26 X: w **osobnym** warsztacie 2D właściciel
  rzeczywiście próbował połączyć dwie stykające się części i **nie dał rady** — z nagrania odczytano
  **20 odcinków komunikatu „Anulowano wskazywanie”**, skupionych wokół tworzenia zawiasu. To nie
  dotyczy kodu z tego repozytorium, ale dotyczy tego samego marzenia: moment, w którym autor chce
  coś sam zrobić, był najtrudniejszym momentem.

**Uwaga o autorstwie komentarzy w PR #1 i #2.** Wszystkie są opublikowane z konta właściciela
(`Jozzpoly`), ale ich treść pochodzi od agentów (GPT, Medium, Splot) i on je tylko przekazał.
**Nie są jego zdaniami i nie wolno ich tak czytać.**

---

## 3. Porządek

### 3.1. Gdzie co leży po scaleniu

Gałąź `feniks/wszystko-na-jednej` = `main` + `checkpoint/astra-v5-core-2026-10-18` (PR #1)
+ `experiment/tworzywo-construction` (PR #2). **41 plików.** Nic nie zostało usunięte ani nadpisane;
obie gałęzie źródłowe i oba PR-y zostają takie, jakie były.

| Co | Gdzie | Czym to jest |
| --- | --- | --- |
| Intencje i granice | `docs/` (5 plików), `README.md`, `AGENTS.md` | **Dawca do czytania.** Najwięcej wartości ma tu definicja porażki z 14 X i odrzucenie własnych rekomendacji z 16 i 18 X. |
| Rdzeń dokumentu | `src/document.mjs`, `tests/document.test.mjs` | **Dawca mechaniki**, nie schematu: atomowa komenda, niemutowalny snapshot, warianty, undo/redo. Działa dziś, 19/19. |
| Własny widok 3D | `src/viewport.mjs`, `tests/glb.test.mjs` | Drugi runtime Three obok Jaskini. **Dawca wzorców cyklu życia; nie rekomendacja integracji** — tak napisała autorka. |
| Wpięcie w Jaskinię v5 | `src/jaskinia-window.mjs`, `tools/build.mjs` | **Nie ma prawa być fundamentem.** Niezakwalifikowany szkic do hosta, którego tu nie ma i który sam został zastąpiony przez v6. |
| Tworzywo | `experiments/material-as-construction/` (25 plików) | **Próba obok, z dowodem.** Najbliżej rzeczywistej pracy autora. Nie jest edytorem, nie jest formatem, nie jest wdrożone. |
| Próba relacji | `…/probes/relations/` | Jeszcze węższa próba wewnątrz tamtej. Sprawdza **zachowanie** relacji, nie jej **tworzenie**. |
| Dowody | 4 PNG-i + 2 pliki `verification.json` | **Jedyny zapis tego, co naprawdę zobaczono.** Przenoszone bajt w bajt. |
| `main` | 6 plików | Dokumentacja. **Dalej zero aplikacji** i tak zostaje, dopóki właściciel nie powie inaczej. |

### 3.2. Co trzeba powiedzieć wprost

- **Fundamentu nie ma.** Nic na tej gałęzi nim nie jest, bo nikt go nie zbudował. Jeżeli kolejny
  dokument albo agent nazwie którykolwiek z tych plików fundamentem Studia — będzie to nieprawda.
- **Ta gałąź niczego nie zatwierdza.** Jest **świadectwem i jedyną kopią w jednym miejscu**, nie
  wnioskiem o scalenie do `main`. Scalenie do `main` jest decyzją o fundamencie i czeka na jego
  słowo — to jego własna zasada z 14 XI, zapisana w [AGENTS.md](AGENTS.md).
- **Gałęzi źródłowych nie kasujemy.** Dla tej pracy gałąź jest jedyną kopią.

---

## 4. Gdyby wracać

Bez planu prac i bez terminów. Repozytorium stoi z decyzji właściciela i to się tutaj nie zmienia.

### 4.1. Od czego zacząć

Od **jednego sprawdzianu, który rozstrzyga o swobodzie autora** — nie od powłoki, nie od formatu,
nie od planu na sześć zadań. Trzy kandydatury są już zapisane przez same próby, każda przez tego,
kto najlepiej znał jej granicę:

1. **Dwa wizualnie identyczne modele o innym podziale wewnętrznym, ta sama przebudowa, bez pisania
   kodu.** Zmierzyć, co autor musi rozpoznać i ile czynności wykonać.
   (z [README Tworzywa](experiments/material-as-construction/README.md))
2. **Autor sam wskazuje części, bazę i oś w nieprzygotowanym modelu**, poprawia decyzję, przenosi
   konstrukcję i wraca do niej.
   (z [README próby relacji](experiments/material-as-construction/probes/relations/README.md))
3. **Autor wskazuje dwie stykające się części, wybiera ich relację mechaniczną, przesuwa jej punkt
   i sprawdza wynik — bez wymyślania sztuczek kursorem.** To jedyny sprawdzian wyrosły
   z obserwowanej porażki właściciela, nie z projektu agenta. (z komentarza z 26 X w PR #2)

I przeczytać najpierw **definicję porażki z 14 X** (sekcja 7 projektu pierwszej sesji). Jest
krótsza niż wszystko inne i trafniejsza.

### 4.2. Czego nie powtarzać

- **Nie zaczynać od warsztatu, powłoki ani paneli.** To było napisane już 14 X i zostało złamane
  dwa razy.
- **Nie przejmować schematu dokumentu z checkpointu** (GLB jako data URL, aktywny wariant w treści
  projektu, pełne snapshoty z bajtami w historii). Odrzuciła go własna autorka trzy dni po
  napisaniu.
- **Nie budować drugiego runtime Three** obok tego, który ma host.
- **Nie przypinać jedynej drogi uruchomienia do jednego commita cudzego repozytorium.** Dziś to
  jedyny powód, dla którego Tworzywa nie da się po prostu obejrzeć.
- **Nie wiązać tożsamości autorskiej części ze ścieżką w drzewie importera.** Zmierzono: samo
  przestawienie kolejności grup przenosi 8/8 ścieżek na inną bryłę.
- **Nie uznawać zielonych testów modułów za dowód warsztatu.** Trzy różne dokumenty w tym repo
  mówią to o sobie same.
- **Nie pisać planu wykonania przed rozstrzygającą próbą.** Plan z 15 X ma 32 kB i nie został
  wykonany ani w jednym punkcie.
- **Nie wysyłać mu zleceń w czacie.** 15 XI powiedział, że rzeczy, o które go prosimy, przepadają
  w natłoku, bo jedynym sposobem odzyskania ich jest przewijanie ścian tekstu. Zlecenie ma mieć
  adres.

### 4.3. Czego musiałaby mieć Jaskinia, żeby to miało sens

Warunek postawił on sam: *„Feniks Studio będzie odblokowany jak będzie miał gdzie się rozwijać”*
(13 XI). Co to znaczy konkretnie — z pomiarów i granic zapisanych w tych plikach, nie z naszych
życzeń:

- **Trwały dokument autora, niezależny od życia okna i od globalnego wyboru projektu.** Zamknięcie
  panelu nie może dotykać treści; otwarcie drugiego okna nie może tworzyć osobnego świata.
- **Tożsamość części niezależna od zastanej hierarchii grafiki** — żeby przeorganizowanie modelu
  w Blockbenchu nie przestawiało autorskich decyzji na inne bryły.
- **Możliwość samodzielnego definiowania relacji**, nie tylko odtwarzania przygotowanych. Oś i baza
  muszą być tym, co **autor** wskazał, a nie tym, co odziedziczył po pliku.
- **Jedna biblioteka materiałów, która nie zależy od profilu przeglądarki ani od miejsca
  uruchomienia.** Zmierzono już, że osadzona strona potrafi dostać inny magazyn niż uruchomiona
  samodzielnie.
- **Powrót do pracy następnego dnia**: wariant, kamera, układ narzędzi i notatka — bez odtwarzania
  czegokolwiek z rozmowy z agentem.
- I rzecz spoza kodu: **decyzja, gdzie Studio ma rosnąć, należy do niego.** Dopóki jej nie ma,
  każda próba będzie kolejną gałęzią obok.

---

## Czego ten dokument nie mówi

- Nie mówi, że Studio jest gotowe, obiecane, wznowione ani że prace trwają.
- Nie przypisuje właścicielowi zdań agentów — także tych opublikowanych z jego konta w PR #1 i #2.
- Nie nazywa fundamentem niczego, czego nikt nie zbudował.
- Nie zleca mu niczego i nie prosi o decyzję.

## Jak to zmierzono

Wszystko poniżej wykonano 15 XI 2026 poleceniami, nie z pamięci.

```
git ls-tree -r --name-only origin/main                                  →  6 plików
git ls-tree -r --name-only origin/checkpoint/astra-v5-core-2026-10-18   → 16 plików
git ls-tree -r --name-only origin/experiment/tworzywo-construction      → 31 plików
git ls-tree -r --name-only feniks/wszystko-na-jednej                    → 41 plików
```

**41, nie 43.** Zlecenie zapowiadało 43 pliki — ten pomiar się nie potwierdza i nie dopasowuję go
do zapowiedzi. Suma rozłączna wygląda tak: 6 plików `main` + 10 plików, które checkpoint dodaje
ponad `main`, + 25 plików, które Tworzywo dodaje ponad `main`, = **41**. Zbiory checkpointu
i Tworzywa poza `main` nie mają ani jednego wspólnego pliku. Suma mnogościowa trzech gałęzi
policzona osobno daje dokładnie tyle samo — także dla stanu `main` sprzed dzisiejszych zmian
dokumentacji. Plik, który właśnie czytasz, jest czterdziesty drugi.

Scalenie: `experiment/tworzywo-construction` wchodzi bez konfliktu;
`checkpoint/astra-v5-core-2026-10-18` daje konflikt **wyłącznie w `README.md`**; `AGENTS.md`
i `.gitignore` scalają się same. Konflikt rozwiązano tak, żeby oba zdania zostały prawdą: komplet
leży na tej gałęzi **i** `main` nadal nie zawiera aplikacji.

Cztery PNG-i mają na tej gałęzi **te same identyfikatory obiektów Git** co na gałęzi źródłowej,
czyli są identyczne bajt w bajt:

```
9de9574…  239 880 B  01-source-models.png
28c8e86…  257 760 B  02-three-constructions.png
bcc7cfa…  248 350 B  03-restored-work.png
e8c1fd2…   66 587 B  probes/relations/relation-carriage.png
```

**Czego nie sprawdziłem:** nie uruchamiałem kontroli przeglądarkowych obu prób (wymagają klonu
`Jozz-Cave-Workbench` przypiętego do `dd47f325`, Playwrighta i Chromium), nie instalowałem
zależności, więc 9 testów GLB nie zostało wykonanych, i nie oglądałem prywatnego nagrania
właściciela z 26 X — opieram się na opisie w komentarzu do PR #2.
