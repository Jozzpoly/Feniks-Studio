# Praca nad Feniks Studio

## Punkt wejścia

Czytaj `README.md`, [wspólny Kompas Jaskini](https://github.com/Jozzpoly/Jozz-Cave-Workbench/issues/5) i wskazany tam aktualny zakres. Nie twórz konkurencyjnego kompasu. Rozróżniaj bezpośrednią decyzję Ownera, propozycję agenta, obserwację produktu i analizę źródeł. Dokument oznaczony jako propozycja nie stanowi zatwierdzonego zlecenia implementacji.

## Sens produktu

- Owner sam komponuje miejsca, mapy, rzeczy i ich wygląd. Grafika powstaje głównie w zewnętrznych narzędziach. Rozwijaj zdolności, z których będzie mógł potem korzystać sam.
- Studio ma własny kierunek. Nie przyjmuj modelu świata MiniFeniksa ani innego labu jako obowiązkowego modelu Studio.
- Zachowuj konkretne osiągnięcia i wiedzę. Żaden kod, format ani fundament nie otrzymuje immunitetu ze względu na wcześniejszy koszt.
- Wąski pierwszy zakres ma umożliwić rzeczywistą pracę. Nie zamieniaj go w uniwersalny schemat całego przyszłego Feniksa ani w trwały zakaz bardziej ambitnych funkcji.

## Koordynacja i zakres

**Najnowszy podział Ownera, 18 października 2026:** Opus prowadzi budowę i integrację Jaskini/Studio. Astra pomaga analizą, próbami, recenzją i uzgodnionymi fragmentami wykonawczymi. Wcześniejsze upoważnienie do implementacji nie oznacza prowadzenia konkurencyjnej budowy. Obecny wkład Astry: odzyskanie v6, checkpoint dotychczasowego kodu i plan do wspólnej oceny. Dalsza implementacja starej próby jest zatrzymana. Opus pracuje nad fundamentem; nie dublować jego aktywnego zakresu.

Wykorzystuj UI/UX Jaskini tam, gdzie to wartościowe. Nie odtwarzaj osobnej powłoki. Jedno doświadczenie pracy nie wymaga jednego repozytorium ani monolitu. Nie wracaj automatycznie do planu z 15 października ani sklejanego v5 z wczesnego planu 18 października.

**Komunikacja bez przerywania Ownerowi:** rutynowe wyniki, PASS, pytania o przydział i potwierdzenia zapisuj w uzgodnionym artefakcie/PR, nie wysyłaj jako nowych promptów do rozmowy Ownera z Astrą. Lokalny peer Sol używa `../docs/research/2026-10-18-reassessment/SOL_OUTBOX.md`; Astra odczytuje go przy odbiorze pracy, bez aktywnego pollingu. Wyjątek: konkretne pilne ryzyko utraty danych, nieodwracalnego błędnego zapisu albo konflikt równoległych zmian. Wtedy oznacz wiadomość jako agentską i podaj dowód oraz najmniejszą potrzebną reakcję.

**Nie ingeruj w pracę Claude w jego rozmowie z Ownerem bez wyraźnej prośby Ownera.** Nie uruchamiaj ani nie wznawiaj go tam, również przyciskami ponowienia odpowiedzi. Aktualizacja Ownera z 16 października dopuszcza współpracę innymi torami z Opusem oraz samodzielny kontakt z agentami browserowymi. Nie nakazuje takiego kontaktu ani nie zatwierdza implementacji. Odczytuj najnowszą instrukcję; nie przejmuj bieżącego zadania drugiego agenta.

Korzystaj z istniejącej wiedzy i upoważnionej współpracy, ale nie przejmuj kampanii MiniFeniksa, Jaskini ani labów. Przy delegacji podawaj rozłączny zakres, źródła, oczekiwany wynik i sposób jego sprawdzenia. Nie mnoż opinii bez decyzji, którą mogą zmienić. Nie wymagaj odbioru Ownera po każdej rutynowej czynności; sprawdzaj samodzielnie w przyjętym zakresie. Jego rola obejmuje również odkrywanie, współtworzenie i naukę, a nie tylko akceptację gotowych funkcji.

## Dowody i publikacja

To publiczne repozytorium. Publikuj tutaj projekt i kod Studio. Surowe prywatne rozmowy, eksporty innych aplikacji, dane robocze Ownera i jego zasoby nie trafiają tu automatycznie.

Odróżniaj sprawdzenie struktury danych, działanie w UI i ocenę Ownera po rzeczywistym używaniu. Po zmianie sprawdzaj właściwą ścieżkę użytkową. Sam test zapisu nie potwierdza dobrej pracy z edytorem.

Przed rozpoczęciem kolejnej fazy odczytaj bieżący stan repo i najnowszą bezpośrednią instrukcję. Aktualizuj istniejący punkt wejścia zamiast tworzyć konkurencyjne rejestry bieżącego stanu.
