# Fahrradverleih

Implementierung des Fahrradverleihs mit dem Ionic Framework und Capacitor.

# Umgebungsvariablen

Parameter, welche von der Entwicklungsumgebung abhängig sind, werden in einer lokalen `.env`
Datei abgelegt.

Die Datei sollte nach dem Klonen überprüft werden. Einige Werte sind ggf. auskommentiert und
sollten in einer _zusätzlichen_, lokalen Datei `.env.local` entsprechend überschrieben werden.

# Android

Um die Ionic-Anwendung als native Android-App installieren und ausführen zu können, wird in
diesem Projekt [Capacitor](https://capacitorjs.com/) verwendet.

Der Pfad zum Android-SDK sollte vor der Verwendung in der Properties-Datei 
`/android/local.properties` als Key `sdk.dir` angepasst werden.

Die dazugehörigen Node-Scripts `cap-sync` und `cap-run-android` können verwendet werden, um
die _zuvor_ gebaute Ionic-Anwendung mit dem Android-Projekt (/android) zu synchronisieren
und anschließend auf einem verbundenen Android-Gerät oder -Emulator auszuführen.

# Weitere Hinweise

- Für Google Maps wird in diesem Projekt die JavaScript API eingebunden; auch, wenn die
  Anwendung mit Capacitor in einem nativen Container verpackt wird.
- Im Rahmen der Entwicklungsumgebung ist die Android-Anwendung aktuell so konfiguriert,
  dass sämtlicher unverschlüsselter Traffic toleriert wird. Dies erleichtert die Arbeit
  mit einer lokalen Instanz des Backends, wäre für den produktiven Einsatz aber
  natürlich ungeeignet.
  ([Android-Docs](https://developer.android.com/training/articles/security-config) hierzu)
