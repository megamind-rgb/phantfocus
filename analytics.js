// Visit counting for this website, with GoatCounter (https://www.goatcounter.com).
// This is the one place that names this site's counter: change COUNTER here.
// privacy.html says what is counted; keep the two in step.
//
// GoatCounter's script is this site's own copy, assets/count.js (README.md,
// "Visit counting"), so no other server is asked for it and what it sends changes
// only when the copy does. It is loaded only on the live site (https), and never when
// the browser sends Global Privacy Control or Do Not Track, or when someone chose
// "Don't count my visits" on privacy.html. It sets no cookies. This file stores
// nothing itself; the only thing ever saved is that choice (GoatCounter's own
// "skipgc" note in this browser), and only when someone clicks the switch.
(function () {
  'use strict';
  var COUNTER = 'https://phantfocus.goatcounter.com/count';
  // Next to this file: 404.html loads this file by its full address, from any folder.
  var here = document.currentScript && document.currentScript.src;
  var SCRIPT = here ? new URL('assets/count.js', here).href : 'assets/count.js';
  var OPT_OUT = 'skipgc';  // GoatCounter's own name for it: its script honours it too

  var signal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  var live = location.protocol === 'https:';

  // A browser that blocks site storage throws when a page reads it. GoatCounter's
  // script reads it unguarded, so it isn't loaded there (nothing is counted).
  function storageReadable() {
    try { window.localStorage.getItem(OPT_OUT); return true; } catch (error) { return false; }
  }
  function optedOut() {
    try { return window.localStorage.getItem(OPT_OUT) === 't'; } catch (error) { return false; }
  }
  function saveOptOut(on) {
    try {
      if (on) window.localStorage.setItem(OPT_OUT, 't');
      else window.localStorage.removeItem(OPT_OUT);
      return true;
    } catch (error) { return false; }
  }

  function load() {
    var script = document.createElement('script');
    script.async = true;
    script.src = SCRIPT;
    script.setAttribute('data-goatcounter', COUNTER);
    script.setAttribute('data-goatcounter-settings', '{"no_events":true}');
    // Blocked (for example by a content blocker): then nothing is counted, and that's fine.
    script.onerror = function () {};
    (document.head || document.documentElement).appendChild(script);
  }

  // A launch-list signup counts one "signup" event (never the address): signup.js
  // calls window.goatcounter.count itself, only when this script loaded the counter.

  if (live && !signal && storageReadable() && !optedOut()) load();

  // The "Don't count my visits" switch on privacy.html.
  function setUpSwitch() {
    var status = document.querySelector('[data-counting-status]');
    var button = document.querySelector('[data-counting-toggle]');
    if (!status || !button) return;
    function paint(note) {
      if (signal) {
        status.textContent = 'Your browser sends Global Privacy Control or Do Not Track, so this site doesn’t count your visits. There’s nothing to switch off.';
        button.hidden = true;
        return;
      }
      if (!storageReadable()) {
        status.textContent = 'This browser blocks site storage, so this site doesn’t count your visits. There’s nothing to switch off.';
        button.hidden = true;
        return;
      }
      var off = optedOut();
      status.textContent = (off ? 'Counting my visits in this browser: Off.' : 'Counting my visits in this browser: On.') +
        (live ? '' : ' (This copy of the site isn’t the live one, so it counts nothing anyway.)') + (note ? ' ' + note : '');
      button.textContent = off ? 'Count my visits again' : 'Don’t count my visits';
      button.hidden = false;
    }
    button.addEventListener('click', function () {
      var saved = saveOptOut(!optedOut());
      paint(saved ? '' : 'This browser won’t let the site remember your choice. Turn on Global Privacy Control, or block ' + COUNTER.split('/')[2] + ', instead.');
    });
    paint('');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setUpSwitch);
  else setUpSwitch();
})();
