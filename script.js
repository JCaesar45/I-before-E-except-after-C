(function () {
  "use strict";

  const canvas = document.getElementById("noise-canvas");
  const ctx = canvas.getContext("2d");
  let noiseFrame = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function renderNoise() {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const buf = imageData.data;
    const len = buf.length;

    for (let i = 0; i < len; i += 4) {
      const v = (Math.random() * 255) | 0;
      buf[i] = v;
      buf[i + 1] = v;
      buf[i + 2] = v;
      buf[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    noiseFrame = requestAnimationFrame(renderNoise);
  }

  resizeCanvas();
  renderNoise();

  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  const header = document.querySelector(".main-header");
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    function () {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 80) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      lastScroll = currentScroll;
    },
    { passive: true }
  );

  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px"
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  const form = document.getElementById("auth-form");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoader = submitBtn.querySelector(".btn-loader");
  const formMessage = document.getElementById("form-message");
  const clientIdInput = document.getElementById("client-id");
  const accessKeyInput = document.getElementById("access-key");

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = "form-message visible " + type;
  }

  function hideMessage() {
    formMessage.className = "form-message";
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.style.opacity = "0";
      btnLoader.classList.add("active");
    } else {
      submitBtn.disabled = false;
      btnText.style.opacity = "1";
      btnLoader.classList.remove("active");
    }
  }

  function triggerShake() {
    form.classList.add("shake");
    form.addEventListener("animationend", function handler() {
      form.classList.remove("shake");
      form.removeEventListener("animationend", handler);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideMessage();

    const clientId = clientIdInput.value.trim();
    const accessKey = accessKeyInput.value.trim();

    if (!clientId || clientId.length < 6) {
      showMessage("Client identifier must be at least 6 characters.", "error");
      triggerShake();
      return;
    }

    if (!accessKey || accessKey.length < 8) {
      showMessage("Cryptographic key must be at least 8 characters.", "error");
      triggerShake();
      return;
    }

    setLoading(true);

    setTimeout(function () {
      setLoading(false);

      const isValid = clientId.length >= 10 && accessKey.length >= 16;

      if (isValid) {
        showMessage("Session initialized. Redirecting to vault...", "success");
        submitBtn.style.borderColor = "#4ade80";
        submitBtn.style.color = "#4ade80";

        setTimeout(function () {
          submitBtn.style.borderColor = "";
          submitBtn.style.color = "";
        }, 3000);
      } else {
        showMessage("Authentication failed. Verify credentials.", "error");
        triggerShake();
      }
    }, 1800);
  });

  document.querySelectorAll(".input-field").forEach(function (input) {
    input.addEventListener("focus", function () {
      this.parentElement.querySelector(".input-label").style.color =
        "var(--accent-gold)";
    });

    input.addEventListener("blur", function () {
      this.parentElement.querySelector(".input-label").style.color = "";
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
