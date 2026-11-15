# Miejsce w Jaskini — plan wykonania

**Status: historyczna, zatrzymana próba v5. Nie wykonywać tego planu dalej.** Po odzyskaniu v6 i nowym podziale pracy Ownera budowę prowadzi Opus. [Aktualny wkład Astry do wspólnej recenzji](2026-10-18-studio-po-v6-do-recenzji.md) zastępuje poniższą rekomendację wykonawczą. Kod zachowano jako checkpoint do selektywnego wykorzystania; brak kwalifikacji całej integracji i UX.

Poniżej pierwotny zakres rozpoczęty na podstawie wcześniejszego mandatu z 18 października. Jest zapisem pochodzenia istniejącego kodu, nie aktualnym wyborem biblioteki materiałów, schematu ani hosta.

Cel: pusta pracownia miejsca w istniejącym oknie Jaskini. Własny samowystarczalny statyczny GLB lub bryła, egzemplarze, pozycja/obrót/skala, usuwanie, wariant, undo/redo treści, jawny eksport/import i lokalny zapis z widoczną porażką. Bez fizyki i katalogu nowych Okazów.

Nie budujemy powłoki. Lokalny build próbny pobiera przypięte pliki Jaskini v5 96c2a1c z istniejącej kopii badawczej, dodaje moduł nowego typu okna i generuje osobny wynik. Nie modyfikuje gałęzi Opusa ani jego źródeł. Osobny namespace danych próby chroni normalne zapisy Jaskini przed kolizją; nie jest izolacją bezpieczeństwa.

Dokument zawiera wersję formatu, ID, nazwę, zasoby GLB jako data URL, warianty z osobnymi listami egzemplarzy i aktywny wariant. Transformacje: position/rotation/scale po trzy skończone liczby; obrót w radianach. Cały GLB jest jednym zasobem, bez utożsamiania nazw węzłów z autorskimi obiektami. Każda komenda walidowana przed przyjęciem. Zmiana wariantu nie modyfikuje innego. Eksport samowystarczalny JSON jest formatem tej próby, nie formatem całego Feniksa.

## Moduły i kontrakt

- `src/document.mjs`: `createDocument()`, `validateDocument(value)` zwracające bezpieczną kopię lub throw, `createSession(document)` z `getSnapshot()`, `subscribe(fn)`, `execute(label, mutate)`, `undo()`, `redo()`, `replace(document)`, `canUndo`, `canRedo`. Snapshot niemutowalny dla odbiorcy; historia sesji oddzielona od shellu. `execute` mutuje kopię, waliduje, zwiększa rewizję sesji i publikuje dopiero na sukcesie. `getRevision()` do zapisu asynchronicznego. Dane: `{format:'feniks-place',version:1,id,name,assets:[],variants:[{id,name,objects:[]}],activeVariantId}`. Obiekt `{id,name,kind:'box'|'glb',assetId:null|string,position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],color:'#b49a74'}`. Zasób `{id,name,dataUrl}`. API `newId(prefix)`.
- `src/viewport.mjs`: `createViewport(container,{onSelect,onError})` -> `{update(document,selectedId),frame(),dispose()}`. Three.js, orbit, siatka, raycast, zaznaczenie; bez własnych paneli i bez zapisu. Generacje ładowania chronią przed późnym GLB po zmianie wariantu. GLB ma być lokalny, samowystarczalny, bez animacji/skór/rozszerzeń wymagających dekodera. Wszystkie importowane tekstury/zasoby zwalniać. Nie wykonywać kodu zasobów.
- `src/jaskinia-window.mjs`: rejestracja funkcją `registerStudio(TYPES, services)`; jeden model sesji poza oknami, `c.onDispose` zwalnia tylko widok. Używa klas i kontrolek Jaskini; nie wywołuje `c.commit` dla treści. Panel numeryczny transformacji, lista elementów, warianty, wczytaj GLB i projekt, pobierz projekt, jawny zapis lokalny. Bez obietnicy bezpiecznego jednoczesnego zapisu przez dwie karty: kontrola poprzedniej wersji zapisu i konflikt.
- `tools/build.mjs`: esbuild modułu oraz przypięta próbna Jaskinia; import w jednym IIFE umożliwia rejestrację typu przed startem. Żadnych edycji źródeł Opusa.
- `tests/*.test.mjs`, `tests/browser.mjs`: kontrakty danych i pełny przebieg Chromium.

## Wykonanie

1. Testy negatywne dokumentu, wariantów i odrzucenia błędnej komendy; implementacja modelu.
2. Widok 3D + statyczny GLB z ograniczeniami, selekcja i cleanup.
3. Rejestracja w Jaskini, zapis/odczyt i przenośny plik; kompozycja pustego miejsca.
4. Test w prawdziwej Jaskini: bryła → transformacja → kopia wariantu → zmiana B → powrót A → zamknięcie okna → ponowne otwarcie → eksport/import. Własny mały wygenerowany GLB jako fixture, nie zasób Ownera. Osobno błędny import i niedostępny zapis.
5. Niezależny przegląd, poprawki i podanie wyniku wraz z ograniczeniami. Nie publikować ani scalać automatycznie.

Pierwszy zakres desktop; brak kwalifikacji telefonu, wnętrz z wieloma poziomami, grupowania i fizyki. Nie udawać ukończenia pierwotnej pełnej sesji z 14 października. Wynik ma być używalnym początkiem kompozycji, nie samą biblioteką funkcji.
