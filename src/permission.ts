const status = document.getElementById("status")!;

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    stream.getTracks().forEach((track) => track.stop()); // we only needed the yes
    status.textContent =
      "all set! go back to haku and tap the mic. this tab will close.";
    setTimeout(() => window.close(), 2000);
  })
  .catch(() => {
    status.textContent =
      "the mic was blocked. click the mic icon in the address bar, choose Allow, then reload this tab.";
  });
