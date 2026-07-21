const canvas = document.getElementById("noise-canvas");
const ctx = canvas.getContext("2d");

let width, height, animationFrame;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function generateNoise() {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

function animateNoise() {
  generateNoise();
  animationFrame = requestAnimationFrame(animateNoise);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
animateNoise();

const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const form = document.getElementById("auth-form");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnLoader = submitBtn.querySelector(".btn-loader");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  btnText.style.opacity = "0";
  btnLoader.style.opacity = "1";
  btnLoader.style.animation = "pulse 1s infinite";

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/v1/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Authentication failed");

    const data = await response.json();
    window.location.href = data.redirectUri;
  } catch (error) {
    submitBtn.disabled = false;
    btnText.style.opacity = "1";
    btnLoader.style.opacity = "0";
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 500);
  }
});
