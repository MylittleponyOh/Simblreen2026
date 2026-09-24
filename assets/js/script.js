document.addEventListener("DOMContentLoaded", function () {
  var countdownEl = document.getElementById("countdown");
  if (!countdownEl) return; // pas sur cette page, on ne fait rien

  var targetDate = new Date("2026-10-31T00:00:00+01:00").getTime();

  var daysEl = document.getElementById("cd-days");
  var hoursEl = document.getElementById("cd-hours");
  var minutesEl = document.getElementById("cd-minutes");
  var secondsEl = document.getElementById("cd-seconds");
  var noteEl = document.getElementById("closed-note");
  var ctaEl = document.getElementById("enter-btn");

  function pad(n) { return n < 10 ? "0" + n : n; }

  function tick() {
    var now = new Date().getTime();
    var distance = targetDate - now;

    if (distance <= 0) {
      clearInterval(interval);
      countdownEl.style.display = "none";
      if (noteEl) noteEl.style.display = "none";
      if (ctaEl) ctaEl.style.display = "inline-block";
      return;
    }

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  var interval = setInterval(tick, 1000);
});
