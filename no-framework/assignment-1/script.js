const btn = document.getElementById("ctaBtn");
const msg = document.getElementById("message");

if (btn) {
  btn.addEventListener("click", () => {
    msg.textContent = "Button clicked! JavaScript is working ✅";
  });
}
