// Page lifecycle supplements Unity focus events, especially during mobile app switches
// and back/forward-cache restores. Returning does not resume gameplay automatically.
(() => {
  let receiver = '', last = null, pageHidden = false, blurred = !document.hasFocus();
  const publish = () => {
    if (!receiver || !window.echoUnity) return;
    const suspended = pageHidden || document.hidden || blurred;
    if (last === suspended) return;
    window.echoUnity.SendMessage(receiver, 'BrowserSuspension', suspended ? 1 : 0);
    last = suspended;
  };
  window.addEventListener('blur', () => { blurred = true; publish(); });
  window.addEventListener('focus', () => { blurred = false; publish(); });
  document.addEventListener('visibilitychange', () => { blurred = !document.hasFocus(); publish(); });
  window.addEventListener('pagehide', () => { pageHidden = true; publish(); });
  window.addEventListener('pageshow', () => { pageHidden = false; blurred = !document.hasFocus(); publish(); });
  window.echoLifecycle = {
    install(target) { receiver = target; last = null; publish(); },
    ready: publish
  };
})();
