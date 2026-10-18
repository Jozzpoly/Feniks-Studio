# Studio po v6 — wkład Astry do wspólnej budowy

**Status: propozycja do recenzji, 18 października 2026.** Opus prowadzi budowę i integrację Jaskini/Studio. Astra dostarcza analizy, rozstrzygające próby, recenzję oraz uzgodnione fragmenty wykonawcze. Ten dokument porządkuje jej wkład; nie jest drugim kompasem produktu ani poleceniem wykonania starego planu. Nie zmienia bieżącej pracy Opusa nad fundamentem.

Wspólny kierunek: [Kompas Jaskini, issue #5](https://github.com/Jozzpoly/Jozz-Cave-Workbench/issues/5). Bieżące uzgodnienie techniczne: [Opus → Astra, PR #2](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/2#issuecomment-6251726713), [fundament v6, PR #4](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/4#issuecomment-6251726558). Kompas należy czytać na żywo; niniejszy zapis nie zastępuje jego późniejszych korekt.

## 1. Co próbujemy uzyskać

Owner ma coraz swobodniej tworzyć, uruchamiać, oglądać, przekształcać i odzyskiwać własną pracę. Jaskinia ma dawać odczucie jednego miejsca, również gdy Studio, laboratoria i przyszłe narzędzia mają osobne repozytoria i wykonanie. Dzisiejsze centrum eksperymentów jest ważną kompetencją, nie ostateczną definicją Jaskini.

Pierwszym proponowanym sprawdzianem autorstwa Studio pozostaje własne miejsce z własnych materiałów: ułożyć je bez pisania kodu, zmienić zamiar, zachować alternatywę, wrócić następnego dnia. Wnętrze, przejście i różnica wysokości są użyteczną próbą, a nie obowiązkową scenografią Ownera. Spacer 1:1 jest sposobem obejrzenia pracy; nie uznajemy go za dowód, że to właśnie on ma być centrum przyszłego produktu.

Nie potrzebujemy teraz pełnego modelu Feniksa, edytora wszystkich mechanizmów ani zgodności z każdym labem. Potrzebujemy takiej pierwszej zdolności, której rozszerzanie nie wymaga utraty wcześniejszej pracy. Wymaganie zachowania ważnego dorobku nie oznacza przechowywania każdego śmiecia na zawsze.

## 2. Co zmieniło v6 i gdzie my się spóźniliśmy

Jaskinia na `4c0c3fcd04b4b31d8fd138893752a6926465fbec` ma natywne Materiały, import `.bbmodel`, wspólne Three 0.180.0, scenę na okno, spacer i publiczne `window.Jaskinia`. Lokalny szkic Studio pozostał przy v5, osobnym Three 0.186.1 i własnym wejściu GLB. Kontynuowanie tego szkicu bez zmiany połączenia pogłębiłoby rozjazd.

Z lokalnej pracy warto przenieść mechanikę atomowych komend, niemutowalnych snapshotów, wariantów i undo/redo. **Nie przenosić bez oceny całego schematu.** Zawiera GLB jako data URL, aktywny wariant w treści projektu i pełne snapshoty z bajtami w historii. Singleton projektu, zapis całego JSON do localStorage i numeryczny panel transformacji nie stanowią docelowego Studio. Testy modułów nie kwalifikują produktu.

Istotne granice dawnego rdzenia: GLB do 16 MiB po dekodowaniu, JSON do 32 MiB, 64 zasoby i 64 warianty, 10 000 obiektów na wariant / 50 000 łącznie; historia bez limitu długości. `replace` czyści historię. To ograniczenia konkretnej próby, nie wymagania nowego produktu. Dawny adapter może błędnie potraktować pusty dokument po nieudanym odczycie jako zapisany; nie przejmować jego ścieżki odzyskania bez poprawy.

Opus już pracuje nad wieloma kartami, adresami, rewizjami ustawień materiału, ścieżkami plików towarzyszących i sprzątaniem nieudanych importów. Nie uruchamiać drugiego wykonawcy tych samych zmian. Do czasu nowego commitu są to zapowiedziane naprawy, nie zweryfikowany wynik.

## 3. Rekomendacja architektoniczna do wspólnej oceny

**Własny dokument i sesja Studio, natywna powierzchnia w Jaskini, jedna biblioteka materiałów.** Studio opisuje autorskie decyzje. Jaskinia daje warsztat, wspólne usługi i spójne wejście. Granica dokumentu ma być możliwa do zrozumienia i sprawdzenia bez renderera; nie przesądza o ostatecznym podziale repozytoriów.

| Droga | Co daje | Osąd na teraz |
|---|---|---|
| Natywny adapter przez `Jaskinia.ext.type`, wspólne Materiały i `swiat` | Korzysta z osiągniętego warsztatu i importu; zachowuje własną treść oraz historię Studio | Rekomendowana pierwsza integracja, zgodna z obecną pracą Opusa |
| Rozbudowa dawnego sklejanego v5 z własnym importerem/renderowaniem | Najkrótsza droga do uruchomienia historycznej próby | Zachować jako checkpoint/dawcę, nie rozwijać równolegle jako produkt |
| Osobna aplikacja osadzona w Jaskini | Może izolować narzędzia o innych wymaganiach i niezaufane eksperymenty | Nadal możliwa dla innych kompetencji; obecnie brak powodu, by dublować w niej warsztat Studio |

Publiczny adapter nie powinien zależeć od wnętrza `TYPES`, `store` ani `RT`. Samo istnienie globalnego API nie rozwiązuje ładowania rozszerzenia: wydanie powinno wskazywać zgodną wersję hosta/modułu i jawnie obsłużyć brak modułu. Wspólna wersja Three nie oznacza jednego renderera dla wszystkich okien.

Zaufany edytor i dowolny przyrząd z obcego eksperymentu mają inne uprawnienia. Nie trzeba dziś budować pełnej platformy izolacji, ale wspólny origin GitHub Pages nie jest granicą prywatności. Sposób udostępniania materiałów i notatek obcemu wykonaniu powinien być świadomy. Ta uwaga nie stanowi twierdzenia o wykrytym wycieku.

## 4. Najważniejszy wkład Astry: ciągłość autorskiego miejsca

To jeden spójny problem na styku materiałów, dokumentu, historii i powrotu do pracy. Opus może rozwijać interakcję i warsztat, a Astra sprawdzać, czy znaczenie autorskiej pracy przetrwa zmianę biblioteki, wariantu i środowiska. Podział wynika z obecnej użyteczności; nie zamyka kompetencji żadnego uczestnika.

### 4.1. Trzy różne rzeczy, których nie wolno skleić

1. **Źródło materiału:** konkretne bajty modelu i zależności wraz z ich ścieżkami. Ta sama nazwa nie oznacza tej samej rzeczy ani ciągłości autorstwa.
2. **Interpretacja:** wersja ustawień jednostek, skali i orientacji, z którymi model wchodzi do projektu. Docelowo także wersja importera może mieć znaczenie dla odtworzenia; samo ID pliku nie obiecuje identycznego wyniku każdego przyszłego importera.
3. **Egzemplarz w miejscu:** własne ID, położenie, obrót, skala i inne decyzje autora. Transformacja egzemplarza nie jest ustawieniem biblioteki.

Opus wprowadza rewizje ustawień. Projekt powinien wskazywać konkretny materiał i konkretną interpretację, a resolver rzeczywiście ich używać. Nie wolno zapisać numeru rewizji, a potem wyświetlać bieżących defaults. Nie należy również naprawiać tego przez manipulację niepublicznymi dziećmi wrappera.

Przyjęcie nowej interpretacji tworzy odrębną referencję; stara pozostaje rozwiązywalna. Undo zmienia referencję w miejscu, nie przepisuje wspólnej biblioteki innym projektom. Wzmianka o wersji importera sygnalizuje przyszły problem odtwarzania, nie obowiązek pakowania historycznych silników przed pierwszą kompozycją.

Nowe ustawienie w bibliotece może być pożądane. W istniejącym miejscu jego przyjęcie powinno mieć znany zakres, podgląd skutku i drogę powrotu. Pierwsza wersja może aktualizować świadomie wybrane egzemplarze. Przyszłe świadome śledzenie nowych wersji pozostaje możliwe; „zamrożenie” nie jest zakazem wygodnych aktualizacji.

### 4.2. Dokument, widok i zapis

- Dokument posiada tożsamość i rewizję. Historia treści nie jest historią układu okien. Zamknięcie widoku zwalnia jego zasoby, a nie projekt.
- Dwa widoki mogą oglądać ten sam projekt, różne kamery i warianty A/B. Wybranie wariantu do oglądania jest stanem widoku; utworzenie lub przebudowa wariantu zmienia treść. Jeśli produkt potrzebuje „domyślnego wariantu projektu”, nazwać to osobno.
- Dwa różne projekty mogą istnieć bez podmieniania jednego globalnego dokumentu. Wybór repo w Jaskini nie podmienia otwartego miejsca.
- Potwierdzenie zapisu oznacza zakończoną operację trwałego zapisu. Osobny odczyt i zapis localStorage nie jest atomową kontrolą konfliktu.
- Pierwsze rozwiązanie równoczesnej edycji może odmawiać zapisu starej rewizji i proponować kopię. Nie wymaga inteligentnego scalania map. Wybór magazynu pozostaje u implementatora, lecz reguła rewizji musi być egzekwowana transakcyjnie.
- Wadliwy odczyt nie może po cichu zamienić cennej pracy w pusty „już zapisany” projekt. Zachować oryginalne dane do odzyskania i jasno pokazać porażkę.

Nie należy mechanicznie przenosić polityki scalania preferencji hosta na treść mapy. Dwa równoczesne przesunięcia jednego obiektu są konfliktem autorskim nawet wtedy, gdy oba JSON-y dają się technicznie połączyć.

Proponowana pierwsza reguła dla historii: świadome przyjęcie cudzej rewizji rozpoczyna nową historię lokalną; przed zastąpieniem własne niezapisane zmiany można zachować jako kopię. Stare undo nie może po odświeżeniu udawać zwykłego cofnięcia i zatwierdzać nadpisania cudzej pracy. To propozycja do konkretnej implementacji sesji, nie wymóg wspólnej historii kolaboracyjnej.

### 4.3. Jedna biblioteka nie oznacza zależności od jednego profilu przeglądarki

Dokument może przechowywać referencje zamiast base64. **Przenośny pakiet projektu musi jednak zawierać potrzebne bajty, interpretacje i zależności wszystkich zachowanych wariantów.** To transport istniejących materiałów, nie drugi importer ani konkurencyjny katalog.

Pakiet nie powinien przypadkiem zabierać całej prywatnej biblioteki. Import ma najpierw zweryfikować manifest, ścieżki, zależności i integralność; brak materiału musi być widoczny. Historia operacji nie powinna wielokrotnie kopiować całych plików. Usunięcie rekordu z widocznej biblioteki nie może od razu usunąć bajtów nadal potrzebnych zapisanym miejscom albo undo; polityka retencji wymaga uwzględnienia tych referencji.

Propozycja pierwszego eksportu: zachowuje wszystkie bieżące warianty, bez historii undo sesji; import zaczyna nową historię. Lokalna retencja dla undo jest szersza niż zawartość takiego pakietu. Jeżeli później eksport przenosi historię, musi także przenosić jej referencje. Partia importowanych materiałów może jawnie odnieść częściowy sukces; przyjęcie samego dokumentu miejsca powinno być atomowe. Sprzątanie po błędzie nie może usuwać bajtów współdzielonych lub właśnie użytych przez inną kartę.

Eksport układu warsztatu i eksport pracy twórczej są różnymi zobowiązaniami. `materialy.pack/unpack` było zapowiedzią, nie obecnym API na analizowanym SHA. Opus wybiera konkretną implementację; próba w czystym profilu rozstrzyga, czy przenośność istnieje.

## 5. Próby rozstrzygające, zamiast ogólnego „sprawdź fundament”

| Próba | Działanie | Obserwowalny wynik |
|---|---|---|
| P1: historyczna interpretacja | Wstawić model przy skali materiału 1 i orientacji 0; zapisać A. Zmienić defaults na 1/16 i obrót 90°. Otworzyć A ponownie | A ma ten sam rozmiar, orientację i położenie. Nowe wstawienie może świadomie korzystać z nowych ustawień |
| P2: aktualizacja z powrotem | Skopiować A do B; w B przyjąć nową interpretację wybranych egzemplarzy; cofnąć | A pozostaje bez zmian. Undo w B odtwarza poprzednie referencje i geometrię, nie jedynie numer etykiety |
| P3: pakiet całego projektu | Wariant A i B używają różnych materiałów. Wyeksportować, otworzyć w czystym profilu bez dotychczasowej bazy | Oba warianty wracają z teksturami i wymiarami; nie pobierają ukrytych zależności ze starego profilu |
| P4: ścieżki i nieudany import | Dwa modele mają `dom/texture.png` i `wieza/texture.png`; zepsuć jeden zależny plik | Dobre importy zachowują właściwe tekstury. Odrzucony import nie usuwa istniejących współdzielonych bajtów ani nie zostawia zaakceptowanej połowy projektu |
| P5: dwie karty tego samego miejsca | Obie odczytują rewizję N; A zapisuje zmianę, B zapisuje swoją | Obie prace są odzyskiwalne; konflikt nie jest przedstawiony jako pomyślny zapis obu wersji. Undo ma jawny zakres po zmianie z innej karty |
| P6: dwie prace i dwa widoki | Otworzyć projekt X/A i X/B, potem odrębny Y; zamknąć/odtworzyć okna | Widoki zachowują własne ustawienia. X i Y nie zastępują sobie treści ani historii |
| P7: uszkodzenie i spóźniona operacja | Odrzucony zapis; uszkodzony odczyt; import kończy się po zmianie projektu albo zamknięciu widoku | Błąd jest widoczny; stara praca pozostaje odzyskiwalna; wynik nie trafia do innego miejsca |

To zestaw kontrprzykładów do doboru przy konkretnym patchu, nie obowiązek zatrzymania całej budowy do zaliczenia siedmiu kampanii. P1–P2 sprawdzają rewizje materiału, P3–P4 transport, P5–P7 trwałość i sesje. Techniczne PASS nie zastępuje oceny odczucia pracy.

## 6. Pierwsza użyteczna kompozycja i późniejszy spacer

Interakcję projektuje Opus, korzystając z Jaskini i informacji zwrotnej Ownera. Proponowane minimum oceny: przewidywalne wstawienie, wybieranie, bezpośredni ruch/obrót/skala, duplikacja, usunięcie, precyzja numeryczna i sensowne przyciąganie. Jeden gest powinien mieć podgląd, anulowanie i jeden krok undo. Nie zapisywać setek pełnych dokumentów podczas przeciągania.

Potrzeba pracy we wnętrzu może ujawnić konieczność ukrycia/przywrócenia elementu lub prostego grupowania. Nie przenosimy z góry całej listy funkcji Blendera. Zwarty, spokojny interfejs desktopowy ma zostawiać miejsce treści; mobilka wymaga własnej oceny obsługi, a nie tylko większego skalowania wszystkiego.

Przy użyciu `swiat.stage` należy aktualizować stabilne obiekty i przerysować widok. Obecne `stage.set()` usuwa i zwalnia cały korzeń oraz kadruje ponownie; nie nadaje się jako wywołanie dla każdej klatki gestu. Trzeba uzgodnić własność współdzielonych geometrii/tekstur, aby zamknięcie jednego widoku nie psuło drugiego.

Pierwszy spacer może oglądać konkretną gotową rewizję miejsca. Po zmianie geometrii w drugim widoku należy ją świadomie zamrozić albo zakończyć/przebudować spacer. Obecny statyczny collider nie aktualizuje się sam. Pomocnicza podłoga przy minimalnym Y sceny nie staje się automatycznie gruntem świata: most i piwnica są prostą kontrpróbą. Nie narzucamy dzisiaj trwałego podziału edycja/play ani ciała przyszłego Feniksa na podstawie dzisiejszej kapsuły spaceru.

## 7. Kolejność dalszej pracy

| Etap | Wynik i odpowiedzialność | Kiedy wystarczy |
|---|---|---|
| A. Przekazanie obecnego dorobku | Astra publikuje czytelnie oznaczony checkpoint starej próby i ten plan. Opus wybiera z niego przydatny rdzeń; nie musi przejmować całego schematu ani builda | Kod i ograniczenia są dostępne z jednego odnośnika, bez przenoszenia treści przez Ownera |
| B. Fundament prowadzony przez Opusa | Opus rozwija swój zakres. Astra ocenia konkretny gotowy patch/API, koncentrując się na różnicy wobec usterek, nie powtarza całego audytu | Znika reprodukcja nadpisania starszą kartą; wybrane próby materiałów odpowiadają rzeczywistemu nowemu API |
| C. Jedna zdolność autorska | Opus łączy natywny edytor z materiałami, dokumentem i historią. Astra dostarcza uzgodniony test lub mały patch dotyczący ciągłości; bez równoległej powłoki | Owner może zmienić układ własnych modeli, cofnąć i zrobić odmienny wariant; wynik ma zwyczajne wejście z Jaskini |
| D. Wiarygodny powrót | Spiąć zapis, ponowne otwarcie, konflikty i przeniesienie potrzebnych materiałów. Robić równolegle z C tam, gdzie interfejs jest ustalony | Próba czystego profilu i drugiego odmiennego miejsca nie wymaga programisty ani ukrytej starej bazy |
| E. Rozwijanie po użyciu | Usprawnienia wynikające z pracy Ownera; osobno doświadczenie przestrzeni, dostęp do eksperymentów oraz nowe zdolności konstrukcyjne | Wybieramy następne ograniczenie z rzeczywistej pracy, nie dlatego, że pozostało miejsce na roadmapie |

Można wcześnie pokazać C jako próbę bez ukończonego D, jeżeli jasno opisuje to UI i nie przedstawiamy takiej próby jako bezpiecznego magazynu ważnej pracy. Nie czekamy na Ownera po każdym sprawdzalnym szczególe. Nie ma dat ani obietnicy „cały fundament w jedną sesję”: wielkość pakietu pracy zależy od rzeczywistej zmiany i kosztu jej odwrócenia.

Etapy nie są szeregiem obowiązkowych odbiorów Astry: B nie blokuje niezależnej pracy nad C, a checkpoint A nie staje się osobnym produktem do utrzymywania. Blokuje tylko konkretna niespełniona zależność albo ryzyko szkody w danym przebiegu.

Dostęp do eksperymentów, porównania i notatki agentów pozostają obecnym torem Jaskini. Nie mogą zostać odłożone tylko dlatego, że pierwszy edytor świata potrzebuje uwagi. Jednocześnie nie są warunkiem budowy uniwersalnej platformy agentów przed pierwszą kompozycją. Czytelny adres, wersja, stan operacji i błąd mają wartość od początku; założenie repo czy zlecanie agentowi pracy to osobna zdolność z własnymi uprawnieniami.

## 8. Recenzja i komunikacja

Opus nie ma zatwierdzać całej analizy przed własną pracą. Do wspólnego rozstrzygnięcia przy integracji są trzy rzeczy:

1. Jak jego nowe API wskazuje i odtwarza konkretną interpretację materiału, także po eksporcie/importowaniu?
2. Gdzie mieszka trwały projekt i kto rozstrzyga konflikt jego rewizji, niezależnie od scalania stanu hosta?
3. Jaki najmniejszy zakres przekazuje Astrze do wykonania/sprawdzenia, żeby oszczędzić mu pracy i nie wejść w jego aktywne pliki?

Po otrzymaniu odpowiedzi lub konkretnego patcha Astra aktualizuje wyłącznie odpowiednią część planu. Odmienny pomysł Opusa powinien być oceniony według tego, co zachowuje i umożliwia; nie według zgodności z nazwami modułów z tej notatki. Nierozstrzygnięte pytania o przebudowę wnętrza modeli i ciągłą edycję podczas chodzenia pozostają kierunkami doświadczeń, nie zobowiązaniami z góry.

Rutynowy obieg wyników jest asynchroniczny: lokalny plik wyników dla Sola, odnośnik do patcha/testu i komentarz w odpowiednim PR dla współpracy z Opusem. Nie wstrzykiwać raportów PASS, pytań o następny przydział ani potwierdzeń jako nowych promptów do rozmowy Ownera. Wyjątki: pilne zagrożenie danych lub rzeczywisty konflikt równoległych zapisów. Nie uruchamiać Claude w jego rozmowie z Ownerem.

Owner nie jest wyłącznie recenzentem gotowych funkcji. Jego odkrycia, nauka, zmiany zdania i eksperymenty współtworzą produkt. Agenci mają przejmować rutynową koordynację; nie ograniczać jego swobody pod pretekstem porządkowania procesu. Szczegóły pozostają dostępne, a zwykły raport ma być krótki i prowadzić do konkretnej pracy.

## 9. Granica dowodu i źródła techniczne

- Analizowany v6: [58-api.js](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/4c0c3fcd04b4b31d8fd138893752a6926465fbec/src/jaskinia/58-api.js), [57-materialy.js](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/4c0c3fcd04b4b31d8fd138893752a6926465fbec/src/jaskinia/57-materialy.js), [56-swiat.js](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/4c0c3fcd04b4b31d8fd138893752a6926465fbec/src/jaskinia/56-swiat.js), [15-store.js](https://github.com/Jozzpoly/Jozz-Cave-Workbench/blob/4c0c3fcd04b4b31d8fd138893752a6926465fbec/src/jaskinia/15-store.js).
- Materiały/reimport: [publiczna kontrpróba defaults](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/4#issuecomment-6250332013), [odpowiedź Opusa o zależnościach, rejestracji i przenoszeniu](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/2#issuecomment-6245602728).
- Własna izolowana próba pełnego HTML v6 potwierdziła: B zapisuje wybór `Mini_Feniks`, zamknięcie starszej A przywraca `Combat-Lab`. Użyto świeżego Chromium i debugowego `__JASK`; nie sesji Ownera. Potwierdzono nadpisanie wyboru, nie utratę jego notatek. HTML SHA-256: `6ba45995cf687a95751a0cb938f3d05dd6681bf03cf73b836921960059252f65`.
- Odczytane `#repo~Combat-Lab` pozostawało w URL przy innym zaznaczonym projekcie. Nie twierdzimy, że to regresja wobec wcześniejszych nieodtworzonych wydań.
- Historyczny kod lokalny pozostaje niezakwalifikowaną integracją. Testy dokumentu i walidacji GLB nie dowodzą działania jego UI, spaceru ani dobrego doświadczenia Ownera. Ten plan nie ogłasza gotowości Studio.
- Własne ponowne uruchomienie `npm test` 18 października: 28 PASS, 0 FAIL (19 dokument, 9 GLB), exit 0. Nie wykonywano starego builda ani E2E. Niezależny przegląd planu doprecyzował równoległość B/C, trwałość rewizji interpretacji, granicę undo po cudzej rewizji i rozdział eksportu wariantów od retencji historii.
