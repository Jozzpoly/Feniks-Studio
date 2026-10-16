# Feniks Studio po zmianie otoczenia — 16 października 2026

**Status: niezależna analiza Astry, po wieczornym odzyskaniu źródeł i konfrontacji.** Owner zatrzymał przejście do implementacji planu z 15 października. Nie wybrał nazwy nadrzędnego programu, hosta, repozytoriów ani technologii. Ten dokument jest rekomendacją do dalszej pracy, nie zatwierdzonym planem implementacji. Bieżącym punktem wejścia pozostaje [README](../../README.md).

## Wniosek i zmiana własnego osądu

Studio powinno zwiększać bezpośrednie możliwości autora: tworzenia miejsc i rzeczy, zmieniania działających światów, komponowania eksperymentów oraz wynajdywania nowych sposobów pracy. Autor ma móc samodzielnie wykonać także drugą, odmienną pracę, której agent nie przygotował w demonstracji. Ta zdolność może powstawać w Jaskini, osobnym narzędziu albo przez przebudowę istniejącego programu.

Rekomenduję **pierwszą wymagającą zdolność autorską i uczciwe porównanie kosztu jej udostępnienia**, zanim wybierzemy stałe miejsce jej życia. Jaskinia jest bardzo ważnym kandydatem oraz źródłem rzeczywistego doświadczenia warsztatu. Nie ma jednak automatycznego pierwszeństwa. Wcześniejsza, popołudniowa wersja tej analizy przyznawała jej zbyt duży kredyt: dopuszczała przebudowę kilku granic Jaskini, podczas gdy od osobnego narzędzia wymagała wykazania poważnej blokady integracji. Po niezależnej krytyce odrzucam tę asymetrię.

Nie wracamy automatycznie do osobnej aplikacji z planu 15 października. Nie rozpoczynamy też projektu uniwersalnego hosta. Najbliższy wynik powinien rozstrzygać rzeczywistą trudność autora. Utrzymanie danych po zamknięciu okna jest konieczną gwarancją, lecz samo nie stanowi jeszcze wartościowego edytora.

Jaskinia jest młodym, niedopracowanym minimum, które chcemy znacznie poprawić. MiniFeniks pozostaje niepewną próbą dzisiejszych możliwości. Studio musi zachować sens, gdy Mini zatrzyma się, zmieni kierunek albo zostanie zastąpiony. Obecny kod każdego z tych projektów można przebudować. Ochrony wymagają przede wszystkim dorobek autora, osiągnięte możliwości działania i sprawdzona wiedza.

## Co zmienia szerszy intent

Odzyskany feedback Ownera dotyczy kilku różnych możliwości, które łatwo niesłusznie zlać w jedną:

| Potrzeba | Konsekwencja dla naszej pracy |
|---|---|
| Samodzielnie układać miejsca, rzeczy i własne materiały | Narzędzie dostarcza gesty i operacje dostępne autorowi bez kolejnego zlecenia programistycznego. |
| Urządzać własny warsztat i grać w jego oknach | Komponowanie otoczenia już daje wartość; trzeba dalej poprawiać wygodę i niezawodność. |
| Oglądać jedną grę z różnych kamer, perspektyw i przez inne narzędzia | Potrzebna jest rozpoznawalna wspólna sesja. Każde nowe okno nie może przypadkiem tworzyć osobnego świata. |
| Zmieniać, diagnozować lub sterować przez inne okna | Odbiór liczb nie jest jeszcze możliwością celowej interwencji. Obserwacja i działanie mają własne cele i skutki. |
| Świadomie łączyć sterowanie kilku prób | To inna relacja niż wspólna sesja. Dwie różne gry mogą otrzymać podobne wejście i nadal pozostać niezależne. |
| Swobodnie eksperymentować i czasem zaczynać od nowa | Nie każda próba potrzebuje wieloletniej trwałości. Wymagania zapisu wynikają z wartości danej pracy. |
| Rozwijać środowisko przez lata, także przebudowując stare projekty | Koszt adaptacji jest dopuszczalną inwestycją. Nie zakładamy ani darmowej kompatybilności, ani nietykalności obecnego kodu. |

Wspólne doświadczenie pracy nie rozstrzyga liczby procesów, repozytoriów czy reprezentacji świata. Natywne 2D, przestrzeń 3D i nowe dziedziny mogą potrzebować odmiennych modeli. Rozwijanie wspólnych zdolności powinno wynikać z konkretnych użyć. Konwersja pomiędzy takimi modelami może być osobną dużą kampanią; nie jest domyślnym obowiązkiem pierwszej wersji.

## Odczytane źródła i granice dowodu

Rewizje są przypięte; nazwa gałęzi i adres wdrożenia mogą później wskazywać inny stan.

| Źródło | Stan badania | Co rzeczywiście sprawdzono |
|---|---|---|
| Feniks Studio | [`7c8666e`](https://github.com/Jozzpoly/Feniks-Studio/tree/7c8666ebf88a19c0b4b06c1c9dc9955b9e7c34ba) przed tą zmianą dokumentacji | Projekt sesji, plan, zasady. Aplikacja jeszcze nie istnieje. |
| Jaskinia main | [`4567a0e`](https://github.com/Jozzpoly/Jozz-Cave-Workbench/tree/4567a0ea09afd11213d979daf54a393ba9017be0) | Publiczne źródła v3; dawna informacja o pustym repo jest nieaktualna. |
| Jaskinia v4 | [`26bebee`](https://github.com/Jozzpoly/Jozz-Cave-Workbench/tree/26bebee610076dd9cc3dc5f947206071ae921ff2), popołudniowy punkt badania | Kod okien, magazynu, historii, notatek i klawiatury; mała próba funkcji w Node VM. Gałąź później doszła do `efbc980`. |
| Jaskinia v5, PR #2 | [`8d7b114`](https://github.com/Jozzpoly/Jozz-Cave-Workbench/tree/8d7b1141105d1442eb7690bb345193a386485954) | Wieczorny odczyt modułu przyrządów, cyklu okien, ustawień, typów i kontraktu. PR był otwarty; widoczna strona Jaskini przedstawiała v5. |
| D13, połączone instrumenty | [`4b51025`](https://github.com/Jozzpoly/Jozz-Cave-Workbench/tree/4b510258c6ed0d1af17a9d4fe54ff968efd76d38); sprawdzona delta do [`cc7399b`](https://github.com/Jozzpoly/Jozz-Cave-Workbench/commit/cc7399b4eb1b32144674822d9de930ae7ae6728d) | Kod eksperymentu na v3 i raport wykonawcy. Późniejsza delta dotyczyła pochodzenia pracy w README, nie implementacji. |
| MiniFeniks | [`09f0abf`](https://github.com/Jozzpoly/Mini_Feniks/tree/09f0abfdc3230afa8a97271ba581abbc6ed5e082), następnie [`cdc8acc`](https://github.com/Jozzpoly/Mini_Feniks/tree/cdc8acc104faff428751d413bc3d2136dde8c879) | Autorstwo, region, sesja, checkpoint i UI oraz delta opublikowanej kampanii 04. Jej nowe mechaniki nie są już tylko zapowiedzią agenta. |

Odczytano aktualne rozmowy przez Operę i narzędzia natywne, w tym pierwotne wypowiedzi Ownera. Oddzielono je od interpretacji innych agentów. Browser Feniksa odpowiedział na pytanie Astry; Sol 6.1 niezależnie skrytykował popołudniowy draft. Surowe rozmowy i dokładny prywatny indeks odczytów pozostają poza tym repozytorium.

Dwie delegacje Luny zakończyły się limitem przed dostarczeniem wyników; prowadząca wykonała odczyty. Nie stanowią one niezależnego potwierdzenia. Nie powtórzono całych zestawów testów Jaskini, D13 ani MiniFeniksa. Nie oglądano ponownie nagrań Ownera. Obserwacja widocznego UI nie kwalifikuje całej ścieżki użycia. Nie uruchamiano ani nie wznawiano Claude w jego rozmowie z Ownerem.

## Jaskinia już zmieniła punkt wyjścia

Jaskinia ma dzielone i pływające okna, układy, odzyskiwanie, notatki poza historią układu oraz ustawienia widoku. Notatki pokazują w kodzie, że kilka okien może wskazywać treść istniejącą poza oknem. Nie dowodzi to jeszcze niezależności dokumentu od samego hosta: magazyn, eksport i interpretacja notatek nadal należą do Jaskini. [Magazyn](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/8d7b1141105d1442eb7690bb345193a386485954/src/jaskinia/15-store.js), [typy okien](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/8d7b1141105d1442eb7690bb345193a386485954/src/jaskinia/40-types.js).

**v5 wnosi rzeczywiste instrumenty.** `Przyrząd` uruchamia wybrany adres niezależnie od globalnego wyboru repo; `Gra` podąża za wybranym lub przypiętym projektem. Wprowadzono odrębny klucz dla typów `live`, sygnały, zdarzenia i uwagi przypięte do przyrządu oraz chwili. Zmiany rozmiaru czy wyglądu nie muszą już odbudowywać działającej strony. Nie można przenosić wprost krytyki cyklu v4 na v5. [Kod przyrządów](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/8d7b1141105d1442eb7690bb345193a386485954/src/jaskinia/52-przyrzady.js), [cykl okien](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/8d7b1141105d1442eb7690bb345193a386485954/src/jaskinia/50-shell.js).

Pozostają konkretne granice, ważne dla następnych możliwości:

- `LIVE` mapuje okno na osadzoną stronę. `attachLive()` wiąże jej życie z zawartością okna. Jest to model przyrządu w oknie, nie dowód odrębnej sesji mającej kilka niezależnych widoków.
- Zmiana języka nadal uruchamia `relaunch()` i usuwa okna przed odbudową. Specjalny klucz `live` sam tego nie zapobiega. Raport v5 i kontrakt przyznają ten wyjątek; szeroki komentarz na początku modułu jest mniej precyzyjny. [Ustawienia](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/8d7b1141105d1442eb7690bb345193a386485954/src/jaskinia/45-settings.js).
- Kontrakt przyjmuje nazwę, stan, liczby i zdarzenia; odsyła m.in. uwagi i widoczność. Każdy lab zachowuje własne dane i runtime. Nie jest to jeszcze umowa wspólnego edytowanego dokumentu ani operacji na konkretnym obiekcie świata. Dokumentacja deklaruje, że poza demonstracją żaden rzeczywisty lab jeszcze go nie przyjął. [Kontrakt v1](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/8d7b1141105d1442eb7690bb345193a386485954/docs/przyrzad/KONTRAKT.md).
- Ukrycie widoku, zwolnienie renderera i zakończenie sesji wymagają różnych znaczeń. `visible:false` daje labowi informację; przykład z pauzą nie wystarczy dla świata obserwowanego jednocześnie przez kilka narzędzi.
- Wspólny host wymaga również świadomej granicy zaufania. Obecny kontrakt jawnie nie jest izolacją dla nieufnych stron. Różne ścieżki pod tą samą domeną nie są różnymi originami. Wątek ten jest już badany w linii Jaskinia/Medium; nie uruchomiono tu równoległej kampanii naprawczej.

Raport wykonawcy opisuje testy v5 i starszych zestawów. To osobny rodzaj dowodu niż feedback Ownera o rzeczywistym uruchomieniu gry i problemach z wieloma grami oraz sterowaniem. Sukces testów mechanicznych nie unieważnia takiego feedbacku. [Raport v5](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/8d7b1141105d1442eb7690bb345193a386485954/docs/2026-10-16-v5-przyrzady.md).

**Wieczorna korekta Opusa, odczytana u źródła.** W [komentarzu z 20:05 UTC](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/2#issuecomment-6223709331) Opus wycofał dwa własne szerokie twierdzenia v5 i opisał pomiary w headless Chromium. W jego próbach `display:none` zatrzymywało rAF ramki cross-origin, choć nie niszczyło instancji. Przy włączonym partycjonowaniu storage osadzona strona mogła otrzymać inny magazyn niż uruchomiona samodzielnie. Wskazał również flagę domyślnego uruchomienia Playwrighta wpływającą na wcześniejsze wyniki. To raport wykonanych przez niego prób, nie nasza rekwalifikacja Opery ani uniwersalna gwarancja zachowania przeglądarek.

Wniosek dla Studio: **brak restartu nie dowodzi ciągłości życia, a niezmienione pliki nie dowodzą dostępu do tej samej zapisanej pracy po zmianie miejsca uruchomienia**. Hosting, trwałość i zegar świata mają wspólny skutek użytkowy. Rozdzielenie domen może być potrzebne, ale jego wdrożenie wymaga również sprawdzenia powrotu do pracy. Nie kopiujemy wcześniejszego PASS bez warunków jego pomiaru. Opus proponuje najpierw poprawić te granice przed próbą autorstwa wewnątrz Jaskini. To sensowna kolejność dla kwalifikacji tej drogi; niezależne rozpoznanie samych gestów autorskich może rozwijać się równolegle.

### Co pozostaje z popołudniowych prób v4

W Node VM wykonano niezmienione funkcje ze wskazanej rewizji na syntetycznych zależnościach. Nieznany typ okna został zastąpiony `wybor`, a jego `st` zachowano — nie stracono automatycznie całego układu. Handler klawiatury wykonał zapis/cofnięcie układu mimo `defaultPrevented=true`. Sprawdzono też wpływ języka na klucz renderowania v4. To nie są testy propagacji DOM, iframe ani v5. Zachowujemy wyniki z ich zakresem zamiast podnosić je do aktualnej oceny całego produktu.

## D13 i MiniFeniks dają doświadczenia o różnych granicach

D13 potrafi osadzić odbiorców, przekazać wybór publicznego projektu, rozróżnić wysłanie od ACK, odrzucić stare ACK i posprzątać po zamknięciu. Raport opisuje 20/20 prób Chromium. `project` oznacza tam repozytorium. Potwierdzenie odebrania jego nazwy nie potwierdza przyjęcia zmiany świata, kroku symulacji ani trwałego zapisu. To wartościowy eksperyment połączenia, odrębny od v5. [Moduł](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/4b510258c6ed0d1af17a9d4fe54ff968efd76d38/src/jaskinia/42-gpt-temporary-instrument.js), [raport](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/cc7399b4eb1b32144674822d9de930ae7ae6728d/experiments/gpt-temporary-connected-instruments-2026-10-16/README.md).

MiniFeniks rozdziela formy źródłowe od projekcji i historię zmian autorskich od historii życia. Cofnięcie formy nie cofa czasu mieszkańców. Operacja pracuje na kopii, przechodzi walidację i uzgodnienie fizyki. Kampania 04 poszerza materialne działania i stan zapisu. Jednak `Session` nadal obejmuje zarówno życie, jak i przyjmowanie zmian autorskich. Zajętość przestrzeni może odrzucić zmianę; checkpoint łączy źródło z żywym stanem i sprawdza geografię. To sensowne dla tej sesji, lecz nie powinno definiować granic projektowania przyszłych miejsc. [Autorstwo](https://github.com/Jozzpoly/Mini_Feniks/blob/cdc8acc104faff428751d413bc3d2136dde8c879/src/world/authoring.ts), [sesja](https://github.com/Jozzpoly/Mini_Feniks/blob/cdc8acc104faff428751d413bc3d2136dde8c879/src/session.ts), [checkpoint](https://github.com/Jozzpoly/Mini_Feniks/blob/cdc8acc104faff428751d413bc3d2136dde8c879/src/world/checkpoint.ts).

Rozdzielenie symulacji i widoku oraz niezależność autorstwa to dwa osobne osiągnięcia. Jedno nie wynika automatycznie z drugiego.

## Trwałość musi wspierać różne sposoby tworzenia

Wcześniejsze zabezpieczenie przed cichym nadpisaniem projektu pozostaje ważne. Nie wolno zamienić go w zasadę, że symulacja nigdy nie tworzy trwałego dorobku.

| Sposób pracy | Oczekiwany sens zmian |
|---|---|
| Próba zaprojektowanego poziomu | Zniszczenie mostu przez grę może być tymczasowe; autor wraca do zachowanego projektu. |
| Trwały sandbox | Most zbudowany podczas życia świata może być właśnie dorobkiem, który ma przetrwać. |
| Tworzenie w działającym świecie | Autor może zatrzymać czas, przebudować miejsce i kontynuować tę samą sesję według jawnych reguł. |
| Jednorazowy eksperyment | Użytkownik może świadomie odrzucić stan i zacząć od nowa; czasem wartościowy jest tylko wynik próby lub wiedza. |
| Porównanie wersji i metod | Dobór wersji, warunków, kamer, połączeń sterowania i obserwacji może stanowić własną pracę autorską. |

To różne znaczenia trwałości, nie obowiązek pięciu trybów w pierwszym UI. Jasne zachowanie sposobu pracy może zastąpić serię pytań o zgodę. Sam zapis prostokątów okien nie odtwarza eksperymentu, jeżeli nie wiadomo już, jakie wersje i warunki porównywał. Z drugiej strony zwykły układ okien nie musi automatycznie stawać się ciężkim, wersjonowanym dokumentem badawczym.

## Co zachować, co otworzyć ponownie

| Dorobek z 14–15 października | Aktualny osąd |
|---|---|
| Własne materiały, kompozycja, wariant, dostęp do wnętrza i powrót | Zachować jako konkretną propozycję pierwszej zdolności. Sprawdzić też drugą, inną pracę Ownera. |
| Tożsamość źródła, rewizji i umieszczenia; przypięte warianty | Zachować znaczenie; nie przesądzać już wszystkich struktur składowania. |
| Rozdzielenie projektu, warsztatu, widoku i próby | Rozpoznawać odpowiedzialność i skutki. Nie wymuszać fizycznie osobnych bytów dla każdej możliwej dziedziny. |
| Osobna aplikacja, React/Three/Dockview, GLB i ZIP `.feniks` | Możliwe rozwiązania określonego zakresu. Nie są zatwierdzonym fundamentem całego przyszłego środowiska. |
| Wspólny zapis projektu i układu | Uczciwość zapisu, kompletność i wykrywanie konfliktów pozostają ważne; dokładny zakres transakcji trzeba dopasować do rzeczywistej pracy. |
| Kolejność sześciu zadań | Wstrzymana. Nie wykonywać starego planu pod nową nazwą. |

## Jak porównać drogi bez wybierania zwycięzcy z góry

Porównujemy **tę samą czynność i te same gwarancje**, wraz z kosztem codziennej obsługi, powrotu oraz późniejszej wymiany. Przebudowa może być rozsądniejsza niż ostrożny adapter; procent zachowanego kodu nie jest kryterium sukcesu.

| Droga | Potencjalna przewaga | Pytanie rozstrzygające |
|---|---|---|
| Instrument w Jaskini | Gotowe komponowanie otoczenia, sąsiedztwo innych narzędzi | Ile zmian wymaga rzeczywiste autorstwo i czy nadal można używać dorobku poza jej globalnym stanem? |
| Wąskie niezależne narzędzie | Szybciej sprawdza bezpośredni kontakt autora z pracą | Czy przewaga pozostaje po doliczeniu powrotu, integracji i obsługi kilku prac? Nie zakładamy nowej kompletnej powłoki. |
| Rozwinięcie istniejącego labu | Od razu sprawdza tworzenie przez działanie | Czy ograniczenia labu nie odbierają czynności potrzebnych autorowi? |
| Przebudowa wspólnego hosta | Może usunąć sprzężenia przeszkadzające w kilku dziedzinach | Czy znamy już konkretne koszty i potrzeby uzasadniające tę inwestycję? Nie wymaga dowodu, że obecny kod jest niemożliwy do naprawy. |

Najpierw potrzebna jest krótka analiza zmian dla tego samego przypadku. Jeżeli kod nie rozstrzyga istotnej wątpliwości, wykonujemy małą próbę tej granicy. Nie budujemy dwóch pełnych produktów, żeby urządzić konkurs.

## Proponowany konkretny przypadek

**Własne miejsce z wnętrzem, przejściem i różnicą wysokości, które autor przebudowuje i zachowuje jako alternatywę.** To rozwinięcie wcześniejszej propozycji, nie nowa deklaracja, że całość Studio ma być edytorem przestrzeni 3D. Wybór materiału i gestów nadal wymaga krótkiego projektu przed implementacją.

1. Autor wnosi własny materiał, układa miejsce, pracuje także we wnętrzu i pod dachem, wybiera oraz grupuje elementy i zmienia przejście lub poziom. Nie musi wyjaśniać każdej czynności agentowi.
2. Zachowuje alternatywną kompozycję bez utraty pierwszej. Widok, struktura i właściwości dotyczą rozpoznawalnej tej samej pracy. Jeśli podmienia materiał, skutek dla wariantów jest świadomy i przewidywalny.
3. Przechodzi do innej pracy, zamyka lub zamienia widok, przebudowuje układ i wraca. Zapis oraz cofanie mają zrozumiały cel; spóźniony import nie trafia do przypadkowo aktywnego dokumentu.
4. Tworzy **drugą, odmienną kompozycję** bez dopisywania przez agenta mechaniki specjalnie dla scenariusza. Ten krok odróżnia zdolność od scenografii demonstracyjnej.
5. Osobny mały sprawdzian techniczny otwiera, rozpoznaje i zmienia zapis pracy bez globali Jaskini i bez jej okien. Nie wymaga drugiego pełnego interfejsu. Sprawdza, czy deklarowana wymienność hosta ma choć minimalny dowód.

Techniczne testy bronią konkretnego zapisu, adresowania czy cofnięcia. O wartości gestów i swobodzie pracy decyduje rzeczywiste użycie. Przechowywanie poprawnego JSON nie kwalifikuje edytora.

**Kontrprzykład podany przez Browsera Feniksa:** autor chce przestawić podest, na którym stoi NPC, zachować wariant i sprawdzić skutek. Jeżeli nowy instrument dziedziczy zakaz edycji wynikający tylko z zajętości w MiniFeniksie, nie daje oczekiwanej swobody. Ten przykład nie dowodzi przewagi konkretnego hosta: to ograniczenie modelu autorstwa, które można popełnić w każdym z nich. Najpierw trzeba określić znaczenie zmiany — projektu, żywego świata czy obu — a dopiero potem wybrać mechanizm.

Warunek zmiany kierunku: autorstwo wymaga stałego podtrzymywania wszystkich okien, zapis oznacza jedynie układ, cele operacji mylą się albo koszt integracji wypiera samą użyteczną zdolność. Wtedy poprawiamy granicę lub wybieramy inne miejsce wykonania. Nie trzeba czekać na katastrofę całej architektury.

### Trzy różne sposoby przebudowania tego samego miejsca

W porównaniu trzeba sprawdzić także sam sposób tworzenia, nie tylko otoczenie programu. „Przebuduj przejście” może ukrywać trzy różne zdolności:

| Sposób | Co autor faktycznie robi | Co może ujawnić porażkę |
|---|---|---|
| Komponowanie własnych gotowych części | Rozstawia, obraca i grupuje modele; zmienia odstęp między ścianami lub ułożenie podestów. | Jeśli całe wnętrze jest jednym modelem, przesunięcie lub skalowanie całości nie poszerzy dowolnie jednych drzwi. Przekrój widoku odsłoni wnętrze, ale nie przebuduje jego geometrii. |
| Budowanie z edytowalnych konstrukcji | Zmienia szerokość przejścia, obrys podłogi lub wysokość podestu przez operacje rozumiejące te elementy. | Otrzymuje większą swobodę w tej dziedzinie, ale potrzebuje określonego języka konstrukcji. Nie wolno ogłaszać go uniwersalnym opisem wszystkich przyszłych budowli i ciał. |
| Przebudowa przez działanie w żywym świecie | Przenosi, buduje lub niszczy w istniejącej sesji i decyduje, jak praca trwa dalej. | Sam wygląd zmiany nie rozstrzyga konsekwencji dla NPC, trzymanych rzeczy i historii. Ograniczenia obecnego labu mogą zablokować potrzebną czynność. |

Pierwsza droga najlepiej wykorzystuje wcześniejszy dorobek o własnych zasobach i kompozycji. Jest obecnie moim kandydatem na pierwszy zakres, **o ile wybrany materiał pozwala wykonać rzeczywistą przebudowę**, a nie tylko przesunąć gotowy budynek. Jeżeli do pożądanej czynności potrzebna jest druga droga, sprawdzamy mały język konstrukcji, zamiast dodawać kolejne panele do niewystarczającego narzędzia. Trzecia droga pozostaje ważnym sposobem tworzenia, lecz nie jest zależnością wejściową kompozytora.

Tę różnicę można najpierw skonfrontować na konkretnej pracy i materiale, bez produkcji trzech prototypów. To bliższe rozstrzygnięcie niż wybór frameworka: ustala, jakie działania ma umożliwić narzędzie. Wcześniejszy preflight zasobu lub poprawny import nie odpowiadają na to pytanie.

## Współpraca i moja odpowiedzialność

Mój najwartościowszy wkład widzę teraz w przekształcaniu szerokich ambicji w **bezpośrednie możliwości autora**, porównywaniu sposobów ich dostarczenia i pilnowaniu ciągłości jego pracy przy wymianie technologii. To obejmuje też narzędzia do eksperymentów i działania w żywym świecie, a nie tylko kompozycję modeli.

Medium wnosi własne rozpoznanie relacji, wspólnej rzeczywistości i współdziałania. Browser Feniksa podważa zakres autorstwa i przyszłe ograniczenia. Opus rozwija doświadczenie Jaskini. Laby odkrywają różne modele i mechaniki. To zaobserwowane kierunki pracy niezależnych uczestników, nie przydział ich do stałych ról ani obowiązek uzgodnienia jednej narracji. Nie potrzebujemy kolejnej magistrali lub powłoki tworzonej tutaj tylko dlatego, że istnieje inne repozytorium.

Sensowny późniejszy wspólny sprawdzian bierze **konkretną pracę autora** i uruchamia ją w jednym zdolnym ją przyjąć odbiorcy: dwie perspektywy dotyczą tej samej sesji, oddzielne narzędzie zmienia wskazany warunek, autor rozumie skutek oraz potrafi wrócić lub zachować wynik. Niezależne próby ze wspólnym sterowaniem pozostają innym przypadkiem. Mini jest możliwym odbiorcą, nie obowiązkową zależnością. Ten sprawdzian ma połączyć rzeczywiste osiągnięcia obu linii, a nie stać się wymogiem przed pierwszą użyteczną kompozycją.

Przy współpracy przekazujemy konkretny stan, jego źródło, otwartą wątpliwość i wynik. Wysłanie wiadomości bez odczytu odpowiedzi nie oznacza wspólnego uzgodnienia. Dopuszczamy odmienne osądy i własne tempo. Owner nie powinien być ręcznym przekaźnikiem między agentami, ale autonomia nie uprawnia nas do przejmowania ich kampanii.

## Architektoniczne zobowiązania proporcjonalne do dowodów

- **Rozpoznawalna praca i konkretny cel zmiany.** Repozytorium, dokument, wariant, sesja, uczestnik i widok nie są zamiennymi nazwami globalnego wyboru. Dokładniejszy adres wprowadzamy tam, gdzie operacja go potrzebuje.
- **Dane nie znikają przypadkiem razem z oknem.** Utrzymywanie sesji, zwalnianie renderera i trwałość dorobku wynikają ze sposobu pracy, nie z przypadkowej funkcji `dispose()`.
- **Ta sama rzecz może mieć kilka użytecznych narzędzi.** Wspólny identyfikator nie rozstrzyga znaczenia wszystkich zmian. Skalowanie, kopiowanie i materialna interwencja należą do dziedzin, które potrafią je zinterpretować.
- **Wymiana narzędzia pozostawia możliwość dalszej pracy.** Zachowanie nieznanych bajtów jest pomocne, lecz nie wystarcza do obietnicy pełnej kompatybilności. Potrzebujemy konkretnego dowodu odczytu i kontynuacji.
- **Człowiek i agent korzystają ze wspólnych możliwości przez odpowiednie interfejsy.** Autor potrzebuje bezpośrednich gestów, agent może używać operacji semantycznych. Nie muszą mieć identycznych uprawnień. Dobry instrument pozostaje użyteczny bez ciągłej obecności swojego twórcy.

Istniejące precedensy pomagają nazwać granice, ale nie wybierają za nas platformy. VS Code rozdziela dokument i jego widoki oraz zaleca zapis niezależny od widocznej webview. JupyterLab rozdziela model, kontekst zapisu i widoki; dwa modele tego samego pliku nie zaczynają przez to automatycznie współpracować. Wspólna powierzchnia lub ścieżka pliku nie zapewnia wspólnego znaczenia operacji. [VS Code Custom Editors](https://code.visualstudio.com/api/extension-guides/custom-editors), [JupyterLab Documents](https://jupyterlab.readthedocs.io/en/stable/extension/documents.html).

Następna praca ma doprowadzić do krótkiego porównania sposobów wykonania konkretnego przypadku autorskiego, a następnie do jego projektu i próby. Szeroki research wraca wtedy, gdy pojawi się pytanie zdolne zmienić ten wybór. Dzisiejszy dokument zabezpiecza zmianę kierunku; nie udaje już powstałego Studio.
